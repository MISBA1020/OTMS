import express from 'express';
import OperationTheatre from '../models/OperationTheatre.js';
import Surgery from '../models/Surgery.js';

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

// Get available OTs for a time slot
router.get('/available', async (req, res) => {
    try {
        const { startTime, endTime } = req.query;
        if (!startTime || !endTime) {
            const ots = await OperationTheatre.find();
            return res.json(ots);
        }

        const overlappingSurgeries = await Surgery.find({
            $or: [
                { startTime: { $lt: endTime, $gte: startTime } },
                { endTime: { $gt: startTime, $lte: endTime } },
                { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
            ],
            status: { $in: ['Scheduled', 'In Progress'] }
        });

        const busyOTIds = overlappingSurgeries.map(s => s.operationTheatreId);

        const availableOTs = await OperationTheatre.find({
            _id: { $nin: busyOTIds }
        });

        res.json(availableOTs);
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
