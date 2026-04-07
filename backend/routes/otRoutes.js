import express from 'express';
import OperationTheatre from '../models/OperationTheatre.js';

const router = express.Router();

// Get all OTs
router.get('/', async (req, res) => {
    try {
        const ots = await OperationTheatre.find();
        res.json(ots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update OT Status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const ot = await OperationTheatre.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(ot);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Create new OT
router.post('/', async (req, res) => {
    try {
        const newOT = new OperationTheatre(req.body);
        const savedOT = await newOT.save();
        res.status(201).json(savedOT);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
