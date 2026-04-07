import mongoose from 'mongoose';

const surgerySchema = new mongoose.Schema({
    // Patient Metrics
    uhid: { type: String, required: true },
    aadharNo: { type: String },
    ipNumber: { type: String },
    patientName: { type: String, required: true },
    age: { type: Number, required: true },
    sex: { type: String, enum: ['M', 'F', 'Other'], required: true },
    
    // Ward & Clinical Context
    ward: {
        type: String, 
        enum: ['FSW', 'MSW', 'ENT', 'FOW', 'MOW', 'OBS', 'Gyn', 'F-ophthal', 'M-ophthal', 'Psychiatric Female Ward'],
        required: true
    },
    diagnosis: { type: String, required: true },
    surgery: { type: String, required: true }, // Name/Description of surgery
    surgeryCategory: { type: String, enum: ['Major', 'Minor'], required: true },
    priority: { type: String, enum: ['Planned', 'Unplanned', 'Emergency'], required: true },
    
    // Operational Location
    operationTheatreId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OperationTheatre',
        required: true,
    },
    
    // Staff Assignments
    surgeonName: { type: String, required: true },
    anesthesiologist: { type: String, required: true },
    anaesthesiaType: { 
        type: String, 
        enum: ['GA', 'LA', 'MAC', 'EA', 'RA', 'NB', 'TIVA', 'Sedation', 'TA', 'FB'], 
        required: true 
    },
    scrubNurse: { type: String, required: true },
    otTechnician: { type: String, required: true },

    // Chronology
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
        type: String,
        enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Scheduled',
    },
}, { timestamps: true });

export default mongoose.model('Surgery', surgerySchema);
