import mongoose from 'mongoose';

const surgerySchema = new mongoose.Schema({
    patientName: { type: String, required: true },
    surgeonName: { type: String, required: true },
    operationTheatreId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OperationTheatre',
        required: true,
    },
    surgeryType: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
        type: String,
        enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Scheduled',
    },
}, { timestamps: true });

export default mongoose.model('Surgery', surgerySchema);
