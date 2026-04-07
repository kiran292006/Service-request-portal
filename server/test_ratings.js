const mongoose = require('mongoose');
const Request = require('./models/Request');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const techPerformance = await Request.aggregate([
            { $match: { status: { $in: ['Resolved', 'Closed'] } } },
            {
                $group: {
                    _id: '$assignedTo',
                    count: { $sum: 1 },
                    avgResolutionTime: { $avg: '$resolutionTime' },
                    avgRating: { $avg: '$rating' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        console.log('Tech Performance Raw:', JSON.stringify(techPerformance, null, 2));

        const populatedTechs = await User.populate(techPerformance, { path: '_id', select: 'name email points specialties' });
        console.log('Populated Tech Performance:', JSON.stringify(populatedTechs, null, 2));

        const allResolved = await Request.find({ status: { $in: ['Resolved', 'Closed'] } }).select('ticketNumber status rating assignedTo').lean();
        console.log('All Resolved/Closed Tickets:', JSON.stringify(allResolved, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

test();
