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
    console.log('🔐 Creating Admin User...');
    
    // Admin credentials - CHANGE THESE IN PRODUCTION!
    const adminData = {
      name: 'System Administrator',
      email: '8581priyanshu@gmail.com',
      password: 'Admin123', // Strong password
      phone: '+91 8581902083',
      userType: 'admin'
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('🔑 Use existing password or reset if needed');
      
      // Update password if needed
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('🔄 Password updated successfully!');
      
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Create admin user
    const admin = new User({
      ...adminData,
      password: hashedPassword
    });

    await admin.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('🚀 You can now login at /login');
    console.log('🛡️  Admin Dashboard: /admin-dashboard');
    
  } catch (error) {
    if (error.code === 11000) {
      console.log('⚠️  Admin user already exists with this email');
    } else {
      console.error('❌ Error creating admin user:', error.message);
    }
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
createAdmin();