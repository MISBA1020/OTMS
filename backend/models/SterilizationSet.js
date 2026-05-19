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
        enum: ['Steam / Autoclave', 'ETO', 'Plasma', 'Chemical'],
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
        enum: ['Dirty', 'Cleaning', 'Packed', 'Sterilizing', 'Sterile', 'Stored', 'Issued', 'Returned', 'Expired', 'Failed', 'Completed'],
        default: 'Dirty',
    },
    notes: { type: String, default: '' },
    issuedToOT: { type: mongoose.Schema.Types.ObjectId, ref: 'OperationTheatre' },
    
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

// Auto-generate unique setId before save
sterilizationSetSchema.pre('save', async function () {
    if (!this.setId) {
        const zoneNum = this.zone.replace('Zone ', '');
        const prefix = `Z${zoneNum}-`;

        // Find the highest existing setId for this zone (works after deletions/restarts)
        const latest = await mongoose.model('SterilizationSet')
            .findOne({ setId: { $regex: `^${prefix}` } })
            .sort({ setId: -1 })
            .select('setId')
            .lean();

        let nextSeq = 1;
        if (latest?.setId) {
            const lastNum = parseInt(latest.setId.replace(prefix, ''), 10);
            if (!isNaN(lastNum)) nextSeq = lastNum + 1;
        }

        this.setId = `${prefix}${String(nextSeq).padStart(4, '0')}`;
    }
});

export default mongoose.model('SterilizationSet', sterilizationSetSchema);
