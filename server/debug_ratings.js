const mongoose = require('mongoose');
const Request = require('./models/Request');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if there are ANY rated tickets
        const ratedTickets = await Request.find({ rating: { $ne: null } })
            .select('ticketNumber status rating assignedTo')
            .populate('assignedTo', 'name')
            .lean();
        
        console.log('Rated Tickets:', JSON.stringify(ratedTickets, null, 2));

        const aggregation = await Request.aggregate([
            { $match: { status: { $in: ['Resolved', 'Closed'] }, assignedTo: { $ne: null } } },
            {
                $group: {
                    _id: '$assignedTo',
                    count: { $sum: 1 },
                    avgRating: { $avg: '$rating' }
                }
            }
        ]);
        console.log('Aggregation Result:', JSON.stringify(aggregation, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

test();
