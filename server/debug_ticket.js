require('dotenv').config();
const mongoose = require('mongoose');
const Request = require('./models/Request');

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    const req = await Request.findOne({ ticketNumber: 'SRP-2026-0009' });
    console.log('Ticket SRP-2026-0009:');
    console.log('assignedTo:', req.assignedTo);
    console.log('assignedBy:', req.assignedBy);
    console.log('status:', req.status);
    process.exit(0);
}
test();
