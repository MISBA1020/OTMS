import express from 'express';
import multer from 'multer';
import SterilizationSet from '../models/SterilizationSet.js';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// GET all sets (optional zone filter; excludes Completed by default)
router.get('/', async (req, res) => {
    try {
        let filter = {};
        if (req.query.zone) filter.zone = req.query.zone;
        if (req.query.completedOnly === 'true') {
            filter.status = 'Completed';
        } else if (req.query.includeCompleted !== 'true') {
            filter.status = { $ne: 'Completed' };
        }
        const sets = await SterilizationSet.find(filter).sort({ createdAt: -1 });
        res.json(sets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single set by id
router.get('/:id', async (req, res) => {
    try {
        const set = await SterilizationSet.findById(req.params.id);
        if (!set) return res.status(404).json({ message: 'Set not found' });
        res.json(set);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create new set
router.post('/', async (req, res) => {
    try {
        console.log('\n--- NEW SET POST ---');
        console.log('req.body:', JSON.stringify(req.body, null, 2));

        const setBody = { ...req.body };

        // Strip empty strings so optional fields don't fail required validation
        Object.keys(setBody).forEach(k => {
            if (setBody[k] === '') delete setBody[k];
        });

        // Initial history log
        setBody.history = [{
            status: setBody.status || 'Dirty',
            action: 'Set Registered',
            user: setBody.sterilizedBy || 'System',
            timestamp: new Date()
        }];

        const newSet = new SterilizationSet(setBody);

        // Run validation manually first so we get clear errors
        const validationError = newSet.validateSync();
        if (validationError) {
            console.error('Validation error:', validationError.message);
            return res.status(400).json({
                message: 'Validation failed',
                errors: Object.fromEntries(
                    Object.entries(validationError.errors).map(([k, v]) => [k, v.message])
                )
            });
        }

        const saved = await newSet.save();
        console.log('Saved successfully:', saved._id, saved.setId);
        res.status(201).json(saved);
    } catch (err) {
        console.error('POST /sterilization-sets error:', err.message);
        res.status(400).json({ message: err.message, detail: err.errors });
    }
});


// PUT update set
router.put('/:id', async (req, res) => {
    try {
        const existingSet = await SterilizationSet.findById(req.params.id);
        if (!existingSet) return res.status(404).json({ message: 'Set not found' });

        const updates = req.body;
        
        // Check if status changed to log it
        if (updates.status && updates.status !== existingSet.status) {
            updates.$push = {
                history: {
                    status: updates.status,
                    action: `Status updated to ${updates.status}`,
                    user: updates.updatedBy || 'System',
                    timestamp: new Date()
                }
            };
        }

        const updated = await SterilizationSet.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// POST move set through workflow
router.post('/:id/move', async (req, res) => {
    try {
        const { action, status, zone, user, notes, issuedToOT } = req.body;
        const set = await SterilizationSet.findById(req.params.id);
        if (!set) return res.status(404).json({ message: 'Set not found' });

        if (status) set.status = status;
        if (zone) set.zone = zone;
        if (notes) set.notes = notes;
        if (issuedToOT) set.issuedToOT = issuedToOT;

        set.history.push({
            status: set.status,
            action: action || `Moved to ${zone || set.zone}`,
            user: user || 'System',
            timestamp: new Date()
        });

        await set.save();
        res.json(set);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// POST upload attachment
router.post('/:id/attachments', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const set = await SterilizationSet.findById(req.params.id);
        if (!set) return res.status(404).json({ message: 'Set not found' });

        const newAttachment = {
            type: req.body.type || 'Attachment',
            url: `/uploads/${req.file.filename}`,
            filename: req.file.originalname
        };

        set.attachments.push(newAttachment);
        
        set.history.push({
            status: set.status,
            action: `Uploaded attachment: ${req.file.originalname}`,
            user: req.body.user || 'System',
            timestamp: new Date()
        });

        await set.save();
        res.status(201).json(newAttachment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE set
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await SterilizationSet.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Set not found' });
        res.json({ message: 'Set deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
