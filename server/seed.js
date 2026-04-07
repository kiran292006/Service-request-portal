const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Request = require('./models/Request');
const Category = require('./models/Category');

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // 1. Create Categorized Technicians
        const techs = [
            { name: 'Hardware Expert', email: 'hw_tech@srp.com', specialties: ['Hardware', 'Infrastructure'] },
            { name: 'Software Expert', email: 'sw_tech@srp.com', specialties: ['Software', 'Technical'] },
            { name: 'Network Expert', email: 'net_tech@srp.com', specialties: ['Network', 'Infrastructure'] },
            { name: 'Billing Expert', email: 'billing_tech@srp.com', specialties: ['Billing', 'Account'] }
        ];

        for (const t of techs) {
            const exists = await User.findOne({ email: t.email });
            if (!exists) {
                await User.create({
                    ...t,
                    password: 'password123',
                    role: 'technician'
                });
                console.log(`Created: ${t.email}`);
            } else {
                // Update specialties if they exist
                exists.specialties = t.specialties;
                await exists.save();
                console.log(`Updated: ${t.email}`);
            }
        }

        // 2. Create Default Categories
        const defaultCategories = [
            { name: 'Hardware', description: 'Issues related to physical devices and infrastructure.' },
            { name: 'Software', description: 'Issues related to software applications and tools.' },
            { name: 'Network', description: 'Issues related to internet, VPN, and connectivity.' },
            { name: 'Billing', description: 'Issues related to accounts, billing, and invoices.' }
        ];

        for (const cat of defaultCategories) {
            const exists = await Category.findOne({ name: cat.name });
            if (!exists) {
                await Category.create(cat);
                console.log(`Created Category: ${cat.name}`);
            }
        }

        // 3. Clear Duplicate Indexes & Sync
        console.log('Syncing Request model indexes...');
        await Request.syncIndexes();
        console.log('Indexes synced.');

        console.log('Seed completed successfully.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
