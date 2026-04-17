import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jwt-simple';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'otms_super_secret_key';

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // Find user
    const user = await User.findOne({ username, role });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials or role mismatch' });
    }

    // Check pass
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Sign Token
    const payload = { id: user._id, role: user.role };
    const token = jwt.encode(payload, JWT_SECRET);

    res.json({ token, user: { id: user._id, username: user.username, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware for auth extraction (could be separate file)
export const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    
    try {
        const decoded = jwt.decode(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ message: 'Token is not valid' });
    }
};

// Get current user context
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin Route: Get all users
router.get('/users', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Access denied' });
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin Route: Create User
router.post('/create', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Access denied' });

        const { username, password, role, name } = req.body;
        
        let existing = await User.findOne({ username });
        if(existing) return res.status(400).json({ message: 'Username already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            password: hashedPassword,
            role: role || 'User',
            name
        });

        const savedUser = await newUser.save();
        res.status(201).json({ id: savedUser._id, username: savedUser.username, role: savedUser.role, name: savedUser.name });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update own display name
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ message: 'Name cannot be empty' });

        const updated = await User.findByIdAndUpdate(
            req.user.id,
            { name: name.trim() },
            { new: true }
        ).select('-password');

        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Change own password
router.put('/password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both fields are required' });
        if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });

        const user = await User.findById(req.user.id);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
