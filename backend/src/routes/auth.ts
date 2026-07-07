import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/auth.js';
import { Admin } from '../models/Admin.js';
import { jsonDb } from '../utils/jsonDb.js';

const router = Router();

// Helper to find admin
const findAdmin = async (username: string) => {
  if (global.dbFallback) {
    return jsonDb.findOne('admins', a => a.username === username);
  } else {
    return await Admin.findOne({ username });
  }
};

// Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const admin = await findAdmin(username);
    if (!admin) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET || 'super_secret_romantic_key_change_me_in_production',
      { expiresIn: '30d' }
    );

    return res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

// Check auth status
router.get('/me', protect, async (req: any, res) => {
  return res.json({ admin: req.user });
});

// Change Password
router.post('/change-password', protect, async (req: any, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new passwords are required' });
  }

  try {
    let admin: any;
    if (global.dbFallback) {
      admin = jsonDb.findOne('admins', a => a._id === req.user.id);
    } else {
      admin = await Admin.findById(req.user.id);
    }

    if (!admin) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (global.dbFallback) {
      jsonDb.updateOne('admins', a => a._id === req.user.id, { password: hashedPassword });
    } else {
      admin.password = hashedPassword;
      await admin.save();
    }

    return res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
