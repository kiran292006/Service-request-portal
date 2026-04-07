const mongoose = require('mongoose');
const Request = require('./models/Request');
const User = require('./models/User');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const techPerformance = await Request.aggregate([
            { $match: { status: { $in: ['Resolved', 'Closed'] } } },
            {
                $group: {
                    _id: '$assignedTo',
                    count: { $sum: 1 },
                    avgResolutionTime: { $avg: '$resolutionTime' },
                    avgRating: { $avg: '$rating' }
                }
            }
        ]);

        const populated = await User.populate(techPerformance, { path: '_id', select: 'name email points specialties' });
        
        fs.writeFileSync('d:/SRP-Project/server/agg_output.json', JSON.stringify(populated, null, 2));
        console.log('Done');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
