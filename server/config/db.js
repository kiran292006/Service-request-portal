const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Create default admin if not exists
        const User = require('../models/User');
        const adminExists = await User.findOne({ role: 'admin' });

        if (!adminExists) {
            await User.create({
                name: 'System Administrator',
                email: 'admin@srp.com',
                password: 'Admin@123',
                role: 'admin'
            });
            console.log('✅ Default Admin Created: admin@srp.com / Admin@123');
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
