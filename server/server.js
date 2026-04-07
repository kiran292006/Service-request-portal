const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const connectDB = require('./config/db');
const auth = require('./routes/authRoutes');
const request = require('./routes/requestRoutes');
const admin = require('./routes/adminRoutes');
const comment = require('./routes/commentRoutes');
const category = require('./routes/categoryRoutes');
const manager = require('./routes/managerRoutes');
const notification = require('./routes/notificationRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const path = require('path');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Attach io to req
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Set static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic route
app.get('/', (req, res) => {
    res.send('SRP API is running...');
});

// Mount routers
app.use('/api/auth', auth);
app.use('/api/requests', request);
app.use('/api/admin', admin);
app.use('/api/comments', comment);
app.use('/api/categories', category);
app.use('/api/manager', manager);
app.use('/api/notifications', notification);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const Request = require('./models/Request');
const Notification = require('./models/Notification');
const User = require('./models/User');
const TicketActivity = require('./models/TicketActivity');

// SLA Monitoring Worker (Check every 5 minutes)
const startSLAWorker = (io) => {
    setInterval(async () => {
        try {
            const now = new Date();
            const warningWindow = new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1 hour warning

            // Find tickets approaching SLA or breached
            const tickets = await Request.find({
                status: { $nin: ['Resolved', 'Closed', 'Rejected'] },
                slaDeadline: { $lt: warningWindow },
                slaNotified: { $ne: true } // Avoid spamming
            }).populate('assignedTo');

            for (const ticket of tickets) {
                const isPassed = ticket.slaDeadline < now;
                const message = isPassed
                    ? `CRITICAL: Ticket ${ticket.ticketNumber} has breached SLA!`
                    : `WARNING: Ticket ${ticket.ticketNumber} approaching SLA deadline (1 hour remains).`;

                // Notify Assigned Technician
                if (ticket.assignedTo) {
                    const techNotif = await Notification.create({
                        recipientId: ticket.assignedTo._id,
                        message,
                        requestId: ticket._id,
                        type: 'sla_warning'
                    });
                    io.to(ticket.assignedTo._id.toString()).emit('notification', techNotif);
                }

                // Notify Managers
                const managers = await User.find({ role: 'manager' });
                for (const mgr of managers) {
                    const mgrNotif = await Notification.create({
                        recipientId: mgr._id,
                        message,
                        requestId: ticket._id,
                        type: 'sla_warning'
                    });
                    io.to(mgr._id.toString()).emit('notification', mgrNotif);
                }

                // Deduct points if breached and not already penalized
                if (isPassed && ticket.assignedTo && !ticket.isBreached) {
                    const tech = await User.findById(ticket.assignedTo._id);
                    if (tech) {
                        tech.points = (tech.points || 0) - 10;
                        await tech.save();
                        
                        ticket.isBreached = true;

                        // Log activity
                        await TicketActivity.create({
                            requestId: ticket._id,
                            action: 'SLA Breached',
                            performedBy: 'system',
                            details: `SLA breached – 10 points deducted from ${tech.name}`
                        });
                    }
                }

                // Mark as notified so we don't repeat
                ticket.slaNotified = true;
                await ticket.save();
            }
        } catch (err) {
            console.error('SLA Worker Error:', err);
        }
    }, 5 * 60 * 1000); // Every 5 minutes
};

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

startSLAWorker(io);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
