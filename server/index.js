import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import multer from 'multer';

// Environment setup
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Express App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
   // cb(null, 'server/uploads/');
   cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// MongoDB Connection
await mongoose.connect('mongodb+srv://8581priyanshu:Priyanshu%4012@cluster0.xy5w8.mongodb.net/flatfinder');


// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  userType: { type: String, enum: ['student', 'broker', 'admin'], required: true },
  university: { type: String },
  companyName: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// OTP Schema for mobile verification
const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const OTP = mongoose.model('OTP', otpSchema);

// Property Schema
const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  price: { type: Number, required: true },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  area: { type: Number, required: true },
  propertyType: { type: String, default: 'apartment' },
  furnishing: { type: String, default: 'semi-furnished' },
  amenities: [String],
  nearbyUniversities: [String],
  images: [String],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 },
  inquiries: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Property = mongoose.model('Property', propertySchema);

// Enhanced Contact Schema with full conversation support
const contactSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  broker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  message: { type: String, required: true },
  studentPhone: { type: String, required: true },
  brokerPhone: { type: String, required: true },
  status: { type: String, enum: ['pending', 'responded', 'closed'], default: 'pending' },
  
  // Broker reply fields
  brokerReply: { type: String },
  repliedAt: { type: Date },
  
  // Student reply fields
  studentReply: { type: String },
  studentRepliedAt: { type: Date },
  
  // Full conversation thread
  conversation: [{
    sender: { type: String, enum: ['student', 'broker'], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  
  createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// Rating Schema
const ratingSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, maxlength: 500, default: '' },
  categories: {
    location: { type: Number, min: 0, max: 5, default: 0 },
    cleanliness: { type: Number, min: 0, max: 5, default: 0 },
    amenities: { type: Number, min: 0, max: 5, default: 0 },
    valueForMoney: { type: Number, min: 0, max: 5, default: 0 },
    landlordResponse: { type: Number, min: 0, max: 5, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

// Ensure one rating per student per property
ratingSchema.index({ property: 1, student: 1 }, { unique: true });

const Rating = mongoose.model('Rating', ratingSchema);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to verify admin access
const requireAdmin = (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Routes

// OTP Routes
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit phone number' });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTP for this phone
    await OTP.deleteMany({ phone: cleanPhone });

    // Save new OTP
    const otpDoc = new OTP({
      phone: cleanPhone,
      otp,
      expiresAt
    });
    await otpDoc.save();

    // In production, you would send SMS here
    // For demo purposes, we'll log it to console
    console.log(`OTP for ${cleanPhone}: ${otp}`);

    res.json({ 
      message: 'OTP sent successfully',
      // In production, don't send OTP in response
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    
    // Find OTP record
    const otpDoc = await OTP.findOne({ 
      phone: cleanPhone,
      verified: false
    });

    if (!otpDoc) {
      return res.status(400).json({ message: 'OTP not found or already verified' });
    }

    // Check if OTP expired
    if (new Date() > otpDoc.expiresAt) {
      await OTP.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Check attempts
    if (otpDoc.attempts >= 3) {
      await OTP.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    // Verify OTP
    if (otpDoc.otp !== otp) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({ 
        message: `Invalid OTP. ${3 - otpDoc.attempts} attempts remaining.` 
      });
    }

    // Mark as verified
    otpDoc.verified = true;
    await otpDoc.save();

    res.json({ message: 'Phone number verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, userType, university, companyName, phoneVerified } = req.body;

    // Check if phone is verified
    if (!phoneVerified) {
      return res.status(400).json({ message: 'Please verify your phone number first' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    
    // Verify that OTP was completed for this phone
    const verifiedOTP = await OTP.findOne({ 
      phone: cleanPhone,
      verified: true
    });

    if (!verifiedOTP) {
      return res.status(400).json({ message: 'Phone number not verified' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      userType,
      university: userType === 'student' ? university : undefined,
      companyName: userType === 'broker' ? companyName : undefined
    });

    await user.save();

    // Clean up verified OTP
    await OTP.deleteMany({ phone: cleanPhone });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        university: user.university,
        companyName: user.companyName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account has been deactivated' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        university: user.university,
        companyName: user.companyName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Property Routes
app.get('/api/properties', async (req, res) => {
  try {
    const properties = await Property.find({ isActive: true }).populate('owner', 'name email phone').sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/properties/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email phone');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Increment views
    property.views += 1;
    await property.save();

    res.json(property);
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/properties', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    if (req.user.userType !== 'broker') {
      return res.status(403).json({ message: 'Only brokers can add properties' });
    }

    console.log('Request body:', req.body);
    console.log('Files:', req.files);

    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const property = new Property({
      title: req.body.title,
      description: req.body.description,
      address: req.body.address,
      price: parseInt(req.body.price),
      bedrooms: parseInt(req.body.bedrooms),
      bathrooms: parseInt(req.body.bathrooms),
      area: parseInt(req.body.area),
      propertyType: req.body.propertyType,
      furnishing: req.body.furnishing,
      amenities: req.body.amenities ? JSON.parse(req.body.amenities) : [],
      nearbyUniversities: req.body.nearbyUniversities ? JSON.parse(req.body.nearbyUniversities) : [],
      images,
      owner: req.user.userId
    });

    await property.save();
    await property.populate('owner', 'name email phone');

    console.log('Property created:', property);
    res.status(201).json(property);
  } catch (error) {
    console.error('Add property error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.put('/api/properties/:id', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user.userId && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'You can only edit your own properties' });
    }

    console.log('Update request body:', req.body);
    console.log('Update files:', req.files);

    // Handle existing images
    let existingImages = [];
    if (req.body.existingImages) {
      try {
        existingImages = JSON.parse(req.body.existingImages);
      } catch (e) {
        console.error('Error parsing existing images:', e);
        existingImages = [];
      }
    }

    // Handle new images
    const newImages = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    // Combine existing and new images
    const allImages = [...existingImages, ...newImages];

    // Update property
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        address: req.body.address,
        price: parseInt(req.body.price),
        bedrooms: parseInt(req.body.bedrooms),
        bathrooms: parseInt(req.body.bathrooms),
        area: parseInt(req.body.area),
        propertyType: req.body.propertyType,
        furnishing: req.body.furnishing,
        amenities: req.body.amenities ? JSON.parse(req.body.amenities) : [],
        nearbyUniversities: req.body.nearbyUniversities ? JSON.parse(req.body.nearbyUniversities) : [],
        images: allImages
      },
      { new: true }
    ).populate('owner', 'name email phone');

    console.log('Property updated:', updatedProperty);
    res.json(updatedProperty);
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.get('/api/properties/broker/my-properties', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'broker') {
      return res.status(403).json({ message: 'Only brokers can access this endpoint' });
    }

    const properties = await Property.find({ owner: req.user.userId }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    console.error('Get broker properties error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/properties/:id', authenticateToken, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user.userId && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own properties' });
    }

    // Delete associated image files
    if (property.images && property.images.length > 0) {
      property.images.forEach(imagePath => {
        const fullPath = path.join(__dirname, imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    // Delete associated ratings
    await Rating.deleteMany({ property: req.params.id });
    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Rating Routes

// Add or update rating
app.post('/api/ratings', authenticateToken, async (req, res) => {
  try {
    console.log('Rating request received:', {
      userId: req.user.userId,
      userType: req.user.userType,
      body: req.body
    });

    if (req.user.userType !== 'student') {
      return res.status(403).json({ message: 'Only students can rate properties' });
    }

    const { propertyId, rating, review, categories } = req.body;

    console.log('Extracted data:', { propertyId, rating, review, categories });
    if (!propertyId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Valid property ID and rating (1-5) are required' });
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    console.log('Property found:', property.title);
    // Check if student has already rated this property
    const existingRating = await Rating.findOne({
      property: propertyId,
      student: req.user.userId
    });

    console.log('Existing rating:', existingRating ? 'Found' : 'Not found');
    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.review = review || '';
      existingRating.categories = categories || {};
      await existingRating.save();
      
      await existingRating.populate('student', 'name');
      console.log('Rating updated successfully');
      res.json({ message: 'Rating updated successfully', rating: existingRating });
    } else {
      // Create new rating
      const newRating = new Rating({
        property: propertyId,
        student: req.user.userId,
        rating,
        review: review || '',
        categories: categories || {}
      });

      await newRating.save();
      await newRating.populate('student', 'name');
      console.log('New rating created successfully');
      res.status(201).json({ message: 'Rating added successfully', rating: newRating });
    }
  } catch (error) {
    console.error('Add rating error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get ratings for a property
app.get('/api/ratings/property/:propertyId', async (req, res) => {
  try {
    const ratings = await Rating.find({ property: req.params.propertyId })
      .populate('student', 'name')
      .sort({ createdAt: -1 });

    // Calculate average ratings
    const totalRatings = ratings.length;
    if (totalRatings === 0) {
      return res.json({
        ratings: [],
        averageRating: 0,
        totalRatings: 0,
        categoryAverages: {}
      });
    }

    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;
    
    // Calculate category averages
    const categoryAverages = {
      location: 0,
      cleanliness: 0,
      amenities: 0,
      valueForMoney: 0,
      landlordResponse: 0
    };

    const categoryCounts = { ...categoryAverages };

    ratings.forEach(rating => {
      if (rating.categories) {
        Object.keys(categoryAverages).forEach(category => {
          if (rating.categories[category]) {
            categoryAverages[category] += rating.categories[category];
            categoryCounts[category]++;
          }
        });
      }
    });

    // Calculate final averages
    Object.keys(categoryAverages).forEach(category => {
      if (categoryCounts[category] > 0) {
        categoryAverages[category] = categoryAverages[category] / categoryCounts[category];
      }
    });

    res.json({
      ratings,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
      categoryAverages
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get student's rating for a property
app.get('/api/ratings/property/:propertyId/student', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'student') {
      return res.status(403).json({ message: 'Only students can access this endpoint' });
    }

    const rating = await Rating.findOne({
      property: req.params.propertyId,
      student: req.user.userId
    });

    res.json({ rating });
  } catch (error) {
    console.error('Get student rating error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete rating
app.delete('/api/ratings/:ratingId', authenticateToken, async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.ratingId);
    
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    if (rating.student.toString() !== req.user.userId && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own ratings' });
    }

    await Rating.findByIdAndDelete(req.params.ratingId);
    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Contact Routes - FIXED AND ENHANCED

// Create initial contact (student to broker)
app.post('/api/contacts', authenticateToken, async (req, res) => {
  try {
    const { brokerId, propertyId, message } = req.body;

    if (req.user.userType !== 'student') {
      return res.status(403).json({ message: 'Only students can send contact requests' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const student = await User.findById(req.user.userId);
    const broker = await User.findById(brokerId);
    const property = await Property.findById(propertyId);

    if (!student || !broker || !property) {
      return res.status(404).json({ message: 'Invalid request data' });
    }

    const contact = new Contact({
      student: req.user.userId,
      broker: brokerId,
      property: propertyId,
      message: message.trim(),
      studentPhone: student.phone,
      brokerPhone: broker.phone,
      conversation: [{
        sender: 'student',
        message: message.trim(),
        timestamp: new Date()
      }]
    });

    await contact.save();

    // Increment inquiries count
    property.inquiries += 1;
    await property.save();

    console.log('Contact created:', contact);
    res.status(201).json({ message: 'Contact request sent successfully', contactId: contact._id });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get student contacts (messages from students)
app.get('/api/contacts/student', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'student') {
      return res.status(403).json({ message: 'Only students can access this endpoint' });
    }

    console.log('Fetching contacts for student:', req.user.userId);

    const contacts = await Contact.find({ student: req.user.userId })
      .populate('broker', 'name email phone')
      .populate('property', 'title _id')
      .sort({ createdAt: -1 });

    console.log('Found contacts:', contacts.length);
    res.json(contacts);
  } catch (error) {
    console.error('Get student contacts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get broker contacts (messages to brokers)
app.get('/api/contacts/broker', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'broker') {
      return res.status(403).json({ message: 'Only brokers can access this endpoint' });
    }

    console.log('Fetching contacts for broker:', req.user.userId);

    const contacts = await Contact.find({ broker: req.user.userId })
      .populate('student', 'name email phone')
      .populate('property', 'title _id')
      .sort({ createdAt: -1 });

    console.log('Found broker contacts:', contacts.length);
    res.json(contacts);
  } catch (error) {
    console.error('Get broker contacts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Broker reply to student
app.post('/api/contacts/:id/reply', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    const contactId = req.params.id;

    if (req.user.userType !== 'broker') {
      return res.status(403).json({ message: 'Only brokers can reply to contacts' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    if (contact.broker.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only reply to your own contacts' });
    }

    // Add broker reply
    contact.brokerReply = message.trim();
    contact.repliedAt = new Date();
    contact.status = 'responded';
    
    // Add to conversation
    contact.conversation.push({
      sender: 'broker',
      message: message.trim(),
      timestamp: new Date()
    });

    await contact.save();

    console.log('Broker reply added to contact:', contactId);
    res.json({ 
      message: 'Reply sent successfully',
      contact: {
        _id: contact._id,
        brokerReply: contact.brokerReply,
        repliedAt: contact.repliedAt,
        status: contact.status,
        conversation: contact.conversation
      }
    });
  } catch (error) {
    console.error('Broker reply error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Student reply to broker - FIXED
app.post('/api/contacts/:id/student-reply', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    const contactId = req.params.id;

    console.log('Student reply request:', { contactId, message, userId: req.user.userId });

    if (req.user.userType !== 'student') {
      return res.status(403).json({ message: 'Only students can send student replies' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    if (contact.student.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only reply to your own contacts' });
    }

    // Add student reply
    contact.studentReply = message.trim();
    contact.studentRepliedAt = new Date();
    
    // Add to conversation
    contact.conversation.push({
      sender: 'student',
      message: message.trim(),
      timestamp: new Date()
    });

    await contact.save();

    console.log('Student reply added to contact:', contactId);
    res.json({ 
      message: 'Reply sent successfully',
      contact: {
        _id: contact._id,
        studentReply: contact.studentReply,
        studentRepliedAt: contact.studentRepliedAt,
        conversation: contact.conversation
      }
    });
  } catch (error) {
    console.error('Student reply error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin Routes
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ userType: 'student' });
    const totalBrokers = await User.countDocuments({ userType: 'broker' });
    const totalProperties = await Property.countDocuments();
    const activeProperties = await Property.countDocuments({ isActive: true });
    const totalContacts = await Contact.countDocuments();

    res.json({
      totalUsers,
      totalStudents,
      totalBrokers,
      totalProperties,
      activeProperties,
      totalContacts
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/admin/users/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    console.error('Toggle user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/admin/properties', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const properties = await Property.find().populate('owner', 'name email').sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    console.error('Get admin properties error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/admin/properties/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.isActive = !property.isActive;
    await property.save();

    res.json({ message: `Property ${property.isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    console.error('Toggle property error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 5010;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});