import express from 'express';
import Staff from '../models/Staff.js';

const router = express.Router();

// Get all staff, grouped by role
router.get('/', async (req, res) => {
    try {
        const staffDocs = await Staff.find();
        
        // Define default lists layout mirroring the original frontend state
        let out = {
            surgeonName: ['Dr. Sarah Jenkins', 'Dr. John Doe', 'Dr. Alan Grant', 'Dr. Ian Malcolm'],
            anesthesiologist: ['Dr. Ellie Sattler', 'Dr. Henry Wu', 'Dr. John Hammond'],
            scrubNurse: ['Sulochana - Chief Nurse', 'Kavya - Assistant Nurse', 'Nayana - Admin'],
            otTechnician: ['Mike - Lead Tech', 'Steve - Tech', 'Robert - Tech']
        };

        // If the DB contains overrides or additions, merge them in.
        staffDocs.forEach(doc => {
            if (out[doc.role] !== undefined) {
                // To avoid duplicate defaults if we seed them, just use a Set
                out[doc.role] = [...new Set([...out[doc.role], ...doc.members])];
            } else {
                out[doc.role] = doc.members;
            }
        });

        res.json(out);
    } catch (err) {
        res.status(500).json({ message: 'Server Error fetching staff', error: err.message });
    }
});

// Add a new staff member to a specified role
router.post('/add', async (req, res) => {
    const { role, name } = req.body;
    if (!role || !name) {
        return res.status(400).json({ message: 'Role and name are required' });
    }

    try {
        let staffDoc = await Staff.findOne({ role });
        
        if (!staffDoc) {
            // Document doesn't exist for this role yet, create it.
            staffDoc = new Staff({ role, members: [name] });
        } else {
            // Document exists, check for duplicates
            if (staffDoc.members.includes(name)) {
                return res.status(400).json({ message: 'Staff member already exists in this role' });
            }
            staffDoc.members.push(name);
        }

        await staffDoc.save();
        res.status(201).json({ message: 'Staff added successfully', staffDoc });
    } catch (err) {
        res.status(500).json({ message: 'Server Error adding staff', error: err.message });
    }
});

export default router;
