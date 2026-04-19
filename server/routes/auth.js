const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');

const buildAuthUser = async (user, fallbackName) => {
  let name = fallbackName || null;

  if (user.role === 'customer') {
    const customer = await Customer.findOne({ user_id: user._id }).select('name');
    name = customer?.name || name;
  }

  return {
    id: user._id,
    email: user.email,
    role: user.role,
    stall_id: user.stall_id || null,
    name
  };
};

// Register (customer only from public form)
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Registration attempt:', req.body.email);
    const { name, email, phone, password } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ Email already exists:', email);
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Hash password
    const hash = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await User.create({
      email,
      password: hash,
      role: 'customer'
    });
    
    console.log('✅ User created:', user._id);
    
    // Create customer profile
    await Customer.create({
      user_id: user._id,
      name,
      phone: phone || ''
    });
    
    console.log('✅ Customer profile created');
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ Registration successful for:', email);
    const authUser = await buildAuthUser(user, name);
    res.json({ token, role: user.role, user: authUser });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Login (all roles)
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body.email);
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('✅ User found:', user._id, 'Role:', user.role);
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Password mismatch for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('✅ Password verified');
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role, stall_id: user.stall_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ Login successful for:', email);
    const authUser = await buildAuthUser(user);
    res.json({
      token,
      role: user.role,
      stall_id: user.stall_id,
      user: authUser
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
