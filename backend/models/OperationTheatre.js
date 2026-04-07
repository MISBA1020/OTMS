import mongoose from 'mongoose';

const otSchema = new mongoose.Schema({
    name: { type: String, required: true },
    status: {
        type: String,
        enum: ['Available', 'In Use', 'Sterilizing', 'Maintenance'],
        default: 'Available',
    },
    equipmentList: [{ type: String }],
    lastMaintained: { type: Date },
}, { timestamps: true });

export default mongoose.model('OperationTheatre', otSchema);
