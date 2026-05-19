import mongoose from 'mongoose';

const sterilizationSetSchema = new mongoose.Schema({
    setId: {
        type: String,
        unique: true,
    },
    zone: {
        type: String,
        enum: ['Zone 1', 'Zone 2', 'Zone 3'],
        required: true,
    },
    instrumentName: { type: String, required: true },
    instrumentCount: { type: Number, required: true },
    batchNumber: { type: String, required: true },

    // Process details
    sterilizationMethod: {
        type: String,
        enum: ['Steam / Autoclave', 'ETO', 'Plasma'],
        required: true,
    },
    temperature: { type: String },
    pressure: { type: String },
    duration: { type: Number }, // minutes
    aerationTime: { type: Number }, // for ETO
    cycleNumber: { type: String },
    loadNumber: { type: String },
    programNumber: { type: String },

    // Machine Details
    machineName: { type: String },
    machineId: { type: String },
    sterilizerBrand: { type: String },
    machineSerialNumber: { type: String },

    // Indicators
    biologicalIndicator: { type: String, enum: ['Passed', 'Failed', 'Pending', 'N/A'], default: 'N/A' },
    chemicalIndicator: { type: String, enum: ['Passed', 'Failed', 'Pending', 'N/A'], default: 'N/A' },
    bowieDickTest: { type: String, enum: ['Passed', 'Failed', 'Pending', 'N/A'], default: 'N/A' },
    indicatorResult: { type: String, enum: ['Passed', 'Failed', 'Pending', 'N/A'], default: 'N/A' },

    // Dates
    sterilizedDate: { type: Date },
    expiryDate: { type: Date },

    // Staff
    sterilizedBy: { type: String }, // Made optional until sterilization is actually done
    checkedBy: { type: String },

    // Outcome
    status: {
        type: String,
        enum: ['Dirty', 'Cleaning', 'Packed', 'Sterilizing', 'Sterile', 'Stored', 'Issued', 'Returned', 'Expired', 'Failed'],
        default: 'Dirty',
    },
    notes: { type: String, default: '' },
    
    // History & Attachments
    history: [{
        status: String,
        action: String,
        user: String,
        timestamp: { type: Date, default: Date.now }
    }],
    attachments: [{
        type: { type: String }, // e.g. 'machine_report', 'indicator'
        url: String,
        filename: String
    }]
}, { timestamps: true });

// Auto-generate setId before save
sterilizationSetSchema.pre('save', async function () {
    if (!this.setId) {
        const zoneNum = this.zone.replace('Zone ', '');
        const count = await mongoose.model('SterilizationSet').countDocuments({ zone: this.zone });
        const seq = String(count + 1).padStart(4, '0');
        this.setId = `Z${zoneNum}-${seq}`;
    }
});

export default mongoose.model('SterilizationSet', sterilizationSetSchema);
