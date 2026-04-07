require('dotenv').config();
const mongoose = require('mongoose');
const Request = require('./models/Request');

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    const req = await Request.find().sort({ createdAt: -1 }).limit(3);
    for (let r of req) {
        console.log(`Ticket: ${r.ticketNumber}, Image Field: ${r.image}`);
    }
    process.exit(0);
}
test();
