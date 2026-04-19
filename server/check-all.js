const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Customer = require('./models/Customer');
const FoodStall = require('./models/FoodStall');
const MenuItem = require('./models/MenuItem');
const SeatingTable = require('./models/SeatingTable');

const checkAll = async () => {
  try {
    console.log('🔍 SmartServe System Check\n');
    console.log('=' .repeat(50));
    
    // 1. Check environment variables
    console.log('\n📋 Environment Variables:');
    console.log('  MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ Missing');
    console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
    console.log('  PORT:', process.env.PORT || '5000');
    
    // 2. Check MongoDB connection
    console.log('\n🔌 MongoDB Connection:');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('  ✅ Connected to:', process.env.MONGO_URI);
    console.log('  Database:', mongoose.connection.name);
    
    // 3. Check collections
    console.log('\n📦 Collections:');
    const userCount = await User.countDocuments();
    const customerCount = await Customer.countDocuments();
    const stallCount = await FoodStall.countDocuments();
    const menuCount = await MenuItem.countDocuments();
    const tableCount = await SeatingTable.countDocuments();
    
    console.log(`  Users: ${userCount} ${userCount > 0 ? '✅' : '❌ Empty!'}`);
    console.log(`  Customers: ${customerCount} ${customerCount > 0 ? '✅' : '❌ Empty!'}`);
    console.log(`  Food Stalls: ${stallCount} ${stallCount > 0 ? '✅' : '❌ Empty!'}`);
    console.log(`  Menu Items: ${menuCount} ${menuCount > 0 ? '✅' : '❌ Empty!'}`);
    console.log(`  Tables: ${tableCount} ${tableCount > 0 ? '✅' : '❌ Empty!'}`);
    
    // 4. Check test user
    console.log('\n👤 Test User Check:');
    const testUser = await User.findOne({ email: 'ravi@ss.com' });
    if (testUser) {
      console.log('  ✅ Test user exists (ravi@ss.com)');
      console.log('  Role:', testUser.role);
      console.log('  User ID:', testUser._id);
      
      // Verify password
      const passwordMatch = await bcrypt.compare('customer123', testUser.password);
      console.log('  Password:', passwordMatch ? '✅ Correct' : '❌ Wrong!');
      
      // Check customer profile
      const customer = await Customer.findOne({ user_id: testUser._id });
      if (customer) {
        console.log('  ✅ Customer profile exists');
        console.log('  Name:', customer.name);
        console.log('  Loyalty Points:', customer.loyalty_points);
      } else {
        console.log('  ❌ Customer profile missing!');
      }
    } else {
      console.log('  ❌ Test user not found!');
      console.log('  Run: node quick-seed.js');
    }
    
    // 5. Summary
    console.log('\n' + '='.repeat(50));
    if (userCount === 0) {
      console.log('\n⚠️  DATABASE IS EMPTY!');
      console.log('Run: node seed.js');
    } else if (!testUser) {
      console.log('\n⚠️  TEST USER MISSING!');
      console.log('Run: node quick-seed.js');
    } else {
      console.log('\n✅ All checks passed!');
      console.log('\nYou can now:');
      console.log('1. Start server: node index.js');
      console.log('2. Login with: ravi@ss.com / customer123');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Is MongoDB running? sudo systemctl status mongod');
    console.error('2. Check .env file exists and has correct values');
    console.error('3. Run: node seed.js');
    process.exit(1);
  }
};

checkAll();
