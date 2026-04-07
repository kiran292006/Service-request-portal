require('dotenv').config();
const mongoose = require('mongoose');
const Request = require('./models/Request');

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    const req = await Request.find({ image: { $exists: true, $nin: [null, ""] } }).sort({ createdAt: -1 }).limit(1);
    console.log(req.length > 0 ? req[0] : 'No tickets with images found in DB!');
    process.exit(0);
}
test();
