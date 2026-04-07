import mongoose from 'mongoose';

const sterilizationLogSchema = new mongoose.Schema({
    operationTheatreId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OperationTheatre',
        required: true,
    },
    startTime: { type: Date, default: null },
    endTime: { type: Date, default: null },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Failed'],
        default: 'Pending',
    },
    technicianName: { type: String, required: true },
    notes: { type: String },
}, { timestamps: true });

export default mongoose.model('SterilizationLog', sterilizationLogSchema);
