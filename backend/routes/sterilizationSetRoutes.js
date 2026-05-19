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
        const newSet = new SterilizationSet(req.body);
        const saved = await newSet.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update set
router.put('/:id', async (req, res) => {
    try {
        const updated = await SterilizationSet.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).json({ message: 'Set not found' });
        res.json(updated);
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
