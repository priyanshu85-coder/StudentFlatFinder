// Admin-only routes for creating additional admin users
import express from 'express';
import bcrypt from 'bcryptjs';


const router = express.Router();

// Middleware to verify admin access
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Create new admin user (admin-only endpoint)
router.post('/create-admin', requireAdmin, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate input
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      userType: 'admin',
      isActive: true
    });

    await admin.save();

    console.log(`New admin created by ${req.user.email}:`, { email, name });

    res.status(201).json({
      message: 'Admin user created successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        userType: admin.userType
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all admin users (admin-only)
router.get('/admins', requireAdmin, async (req, res) => {
  try {
    const admins = await User.find({ userType: 'admin' }).select('-password');
    res.json(admins);
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;