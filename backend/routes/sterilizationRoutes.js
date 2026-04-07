import express from 'express';
import SterilizationLog from '../models/SterilizationLog.js';
import OperationTheatre from '../models/OperationTheatre.js';

const router = express.Router();

// Get logs
router.get('/', async (req, res) => {
    try {
        const filter = req.query.operationTheatreId ? { operationTheatreId: req.query.operationTheatreId } : {};
        const logs = await SterilizationLog.find(filter).populate('operationTheatreId');
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start sterilization
router.post('/start', async (req, res) => {
    try {
        const { operationTheatreId, technicianName, notes } = req.body;

        const ot = await OperationTheatre.findById(operationTheatreId);
        if (!ot) return res.status(404).json({ message: 'OT not found' });

        if (ot.status === 'In Use') {
            return res.status(400).json({ message: 'Cannot sterilize an OT that is currently in use.' });
        }

        const log = new SterilizationLog({
            operationTheatreId,
            technicianName,
            notes,
            startTime: new Date(),
            status: 'In Progress'
        });

        const savedLog = await log.save();

        // Update OT status
        await OperationTheatre.findByIdAndUpdate(operationTheatreId, { status: 'Sterilizing' });

        res.status(201).json(savedLog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Complete sterilization
router.post('/:logId/complete', async (req, res) => {
    try {
        const log = await SterilizationLog.findById(req.params.logId);
        if (!log) return res.status(404).json({ message: 'Log not found' });

        log.status = 'Completed';
        log.endTime = new Date();
        await log.save();

        await OperationTheatre.findByIdAndUpdate(log.operationTheatreId, {
            status: 'Available',
            lastMaintained: log.endTime
        });

        res.json(log);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
