const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Customer = require('./models/Customer');

const quickSeed = async () => {
  try {
    console.log('Connecting to:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existing = await User.findOne({ email: 'ravi@ss.com' });
    if (existing) {
      console.log('✅ User ravi@ss.com already exists');
      console.log('User ID:', existing._id);
      console.log('Role:', existing.role);
      
      // Check customer profile
      const customer = await Customer.findOne({ user_id: existing._id });
      if (customer) {
        console.log('✅ Customer profile exists');
        console.log('Name:', customer.name);
      } else {
        console.log('⚠️  Customer profile missing, creating...');
        await Customer.create({
          user_id: existing._id,
          name: 'Aarav',
          phone: '9876543210',
          loyalty_points: 160
        });
        console.log('✅ Customer profile created');
      }
      
      process.exit(0);
    }

    // Create test user
    console.log('Creating test user...');
    const hashedPassword = await bcrypt.hash('customer123', 10);
    
    const user = await User.create({
      email: 'ravi@ss.com',
      password: hashedPassword,
      role: 'customer'
    });

    console.log('✅ User created:', user._id);

    // Create customer profile
    await Customer.create({
      user_id: user._id,
      name: 'Aarav',
      phone: '9876543210',
      loyalty_points: 160
    });

    console.log('✅ Customer profile created');
    console.log('\n🎉 Test account ready!');
    console.log('Email: ravi@ss.com');
    console.log('Password: customer123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

quickSeed();
