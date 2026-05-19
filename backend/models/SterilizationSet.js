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
        enum: ['Autoclave', 'ETO', 'Dry Heat', 'Chemical'],
        required: true,
    },
    temperature: { type: String },
    pressure: { type: String },
    duration: { type: Number }, // minutes
    cycleNumber: { type: String },

    // Dates
    sterilizedDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },

    // Staff
    sterilizedBy: { type: String, required: true },
    checkedBy: { type: String, required: true },

    // Outcome
    status: {
        type: String,
        enum: ['Pending', 'Sterilized', 'Expired', 'In Use'],
        default: 'Pending',
    },
    notes: { type: String, default: '' },
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
