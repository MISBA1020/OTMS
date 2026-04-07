import mongoose from 'mongoose';
import dotenv from 'dotenv';
import OperationTheatre from './models/OperationTheatre.js';

dotenv.config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/otms');
        console.log('MongoDB connected for seeding');

        // Clear existing
        await OperationTheatre.deleteMany({});
        console.log('Cleared existing OTs');

        // Create 11 OTs
        const ots = [];
        for (let i = 1; i <= 11; i++) {
            ots.push({
                name: `Operation Theatre ${i}`,
                status: 'Available',
                equipmentList: ['Anesthesia Machine', 'Surgical Lights', 'Operating Table', 'Defibrillator'],
            });
        }

        await OperationTheatre.insertMany(ots);
        console.log('Successfully seeded 11 Operation Theatres');

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedDB();
