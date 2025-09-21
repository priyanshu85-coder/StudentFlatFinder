import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
await mongoose.connect('mongodb+srv://8581priyanshu:Priyanshu%4012@cluster0.xy5w8.mongodb.net/flatfinder');


// User Schema (same as in server/index.js)
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

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ userType: 'admin' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      console.log('📧 Email:', existingAdmin.email);
      console.log('🔑 Password: admin123 (if you used the default)');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const admin = new User({
      name: 'System Administrator',
      email: 'admin@flatfinder.com',
      password: hashedPassword,
      phone: '+91 9999999999',
      userType: 'admin',
      isActive: true
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@flatfinder.com');
    console.log('🔑 Password: admin123');
    console.log('🚀 You can now login and access /admin-dashboard');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();