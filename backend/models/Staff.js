import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
    role: { type: String, required: true, unique: true }, // e.g. 'surgeonName', 'anesthesiologist'
    members: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Staff', staffSchema);
