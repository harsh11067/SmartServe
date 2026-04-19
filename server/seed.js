const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Customer = require('./models/Customer');
const FoodStall = require('./models/FoodStall');
const MenuItem = require('./models/MenuItem');
const SeatingTable = require('./models/SeatingTable');
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Customer.deleteMany({});
    await FoodStall.deleteMany({});
    await MenuItem.deleteMany({});
    await SeatingTable.deleteMany({});
    await Order.deleteMany({});
    await OrderItem.deleteMany({});

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const adminUser = await User.create({
      email: 'admin@ss.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin'
    });

    const grillStall = await FoodStall.create({
      stall_name: 'Grill Station',
      cuisine_type: 'American',
      is_active: true
    });

    const kitchenUser1 = await User.create({
      email: 'grill@ss.com',
      password: await bcrypt.hash('kitchen123', 10),
      role: 'kitchen',
      stall_id: grillStall._id
    });

    grillStall.managed_by = kitchenUser1._id;
    await grillStall.save();

    const wokStall = await FoodStall.create({
      stall_name: 'Wok Republic',
      cuisine_type: 'Asian',
      is_active: true
    });

    const kitchenUser2 = await User.create({
      email: 'wok@ss.com',
      password: await bcrypt.hash('kitchen123', 10),
      role: 'kitchen',
      stall_id: wokStall._id
    });

    wokStall.managed_by = kitchenUser2._id;
    await wokStall.save();

    const brewStall = await FoodStall.create({
      stall_name: 'Brew Lab',
      cuisine_type: 'Beverages',
      is_active: true
    });

    // Create customer users
    const customerUser1 = await User.create({
      email: 'ravi@ss.com',
      password: await bcrypt.hash('customer123', 10),
      role: 'customer'
    });

    const customer1 = await Customer.create({
      user_id: customerUser1._id,
      name: 'Aarav',
      phone: '9876543210',
      loyalty_points: 160
    });

    const customerUser2 = await User.create({
      email: 'priya@ss.com',
      password: await bcrypt.hash('customer123', 10),
      role: 'customer'
    });

    await Customer.create({
      user_id: customerUser2._id,
      name: 'Mira',
      phone: '9876543211',
      loyalty_points: 80
    });

    // Create menu items
    const menuItems = await MenuItem.insertMany([
      {
        stall_id: grillStall._id,
        item_name: 'Smoked Paneer Burger',
        category: 'Burgers',
        price: 189,
        prep_time: 12,
        is_available: true
      },
      {
        stall_id: grillStall._id,
        item_name: 'Peri Peri Fries',
        category: 'Sides',
        price: 109,
        prep_time: 8,
        is_available: true
      },
      {
        stall_id: wokStall._id,
        item_name: 'Chilli Garlic Noodles',
        category: 'Asian',
        price: 169,
        prep_time: 10,
        is_available: true
      },
      {
        stall_id: wokStall._id,
        item_name: 'Kung Pao Bowl',
        category: 'Asian',
        price: 199,
        prep_time: 14,
        is_available: false
      },
      {
        stall_id: brewStall._id,
        item_name: 'Cold Coffee Float',
        category: 'Drinks',
        price: 129,
        prep_time: 6,
        is_available: true
      },
      {
        stall_id: brewStall._id,
        item_name: 'Hazelnut Shake',
        category: 'Drinks',
        price: 149,
        prep_time: 7,
        is_available: true
      }
    ]);

    // Create tables
    const tables = await SeatingTable.insertMany([
      { table_number: 'T1', capacity: 2, status: 'free' },
      { table_number: 'T2', capacity: 4, status: 'occupied' },
      { table_number: 'T3', capacity: 4, status: 'free' },
      { table_number: 'T4', capacity: 6, status: 'occupied' },
      { table_number: 'T5', capacity: 2, status: 'free' },
      { table_number: 'T6', capacity: 8, status: 'maintenance' },
      { table_number: 'T7', capacity: 4, status: 'free' },
      { table_number: 'T8', capacity: 6, status: 'occupied' }
    ]);

    const demoOrderItems = [
      { item: menuItems[0], quantity: 1 },
      { item: menuItems[1], quantity: 1 },
      { item: menuItems[4], quantity: 1 }
    ];
    const subtotalAmount = demoOrderItems.reduce(
      (sum, entry) => sum + entry.item.price * entry.quantity,
      0
    );
    const demoOrder = await Order.create({
      customer_id: customer1._id,
      table_id: tables[0]._id,
      status: 'pending',
      total_amount: Number((subtotalAmount * 1.05).toFixed(2))
    });

    await OrderItem.insertMany(
      demoOrderItems.map((entry) => ({
        order_id: demoOrder._id,
        menu_item_id: entry.item._id,
        stall_id: entry.item.stall_id,
        quantity: entry.quantity,
        unit_price: entry.item.price,
        subtotal: entry.item.price * entry.quantity
      }))
    );

    console.log('Database seeded successfully!');
    console.log('\nDemo Accounts:');
    console.log('Admin: admin@ss.com / admin123');
    console.log('Kitchen (Grill): grill@ss.com / kitchen123');
    console.log('Kitchen (Wok): wok@ss.com / kitchen123');
    console.log('Customer 1: ravi@ss.com / customer123');
    console.log('Customer 2: priya@ss.com / customer123');
    console.log(`Demo Order: ${demoOrder._id} (status: pending)`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
