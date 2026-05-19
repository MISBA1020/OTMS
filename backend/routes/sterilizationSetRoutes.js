import express from 'express';
import SterilizationSet from '../models/SterilizationSet.js';

const router = express.Router();

// GET all sets (optional zone filter)
router.get('/', async (req, res) => {
    try {
        const filter = req.query.zone ? { zone: req.query.zone } : {};
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
        const setBody = { ...req.body };
        // Initial history log
        setBody.history = [{
            status: setBody.status || 'Dirty',
            action: 'Set Registered',
            user: setBody.sterilizedBy || 'System',
            timestamp: new Date()
        }];
        const newSet = new SterilizationSet(setBody);
        const saved = await newSet.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
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
        const { action, status, zone, user, notes } = req.body;
        const set = await SterilizationSet.findById(req.params.id);
        if (!set) return res.status(404).json({ message: 'Set not found' });

        if (status) set.status = status;
        if (zone) set.zone = zone;
        if (notes) set.notes = notes;

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
