import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import OperationTheatre from './models/OperationTheatre.js';
import User from './models/User.js';

dotenv.config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/otms');
        console.log('MongoDB connected for seeding');

        // Create Admin User
        await User.deleteMany({});
        console.log('Cleared existing Users');

        const salt = await bcrypt.genSalt(10);
        const hashedPasswordAdmin = await bcrypt.hash('admin123', salt);
        const hashedPasswordUser = await bcrypt.hash('user123', salt);

        await User.insertMany([
            { username: 'admin', password: hashedPasswordAdmin, role: 'Admin', name: 'System Admin' },
            { username: 'user', password: hashedPasswordUser, role: 'User', name: 'Dr. Sarah Jenkins' }
        ]);
        console.log('Successfully seeded Default Admin and User accounts');

        // Clear existing
        await OperationTheatre.deleteMany({});
        console.log('Cleared existing OTs');

        // Create 11 OTs
        const otNames = [
            "Operation Theatre 1 - ENT",
            "Operation Theatre 2 - OBG",
            "Operation Theatre 3 - Ortho",
            "Operation Theatre 4 - Surgery",
            "Operation Theatre 5 - Surgery",
            "Operation Theatre 6 - Ortho",
            "Operation Theatre 7 - Ophthal",
            "Operation Theatre 8 - Ophthal",
            "Operation Theatre 9 - Labour",
            "Operation Theatre 10 - Emergency",
            "Operation Theatre 11 - Septic"
        ];

        const ots = otNames.map(name => ({
            name: name,
            status: 'Available',
            equipmentList: ['Anesthesia Machine', 'Surgical Lights', 'Operating Table', 'Defibrillator'],
        }));

        await OperationTheatre.insertMany(ots);
        console.log('Successfully seeded 11 Operation Theatres');

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedDB();
