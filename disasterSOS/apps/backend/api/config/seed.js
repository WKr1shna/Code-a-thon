const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('./env');
const User = require('../models/User.model');

const seedUsers = [
  {
    name: 'System Admin',
    email: 'admin@disastersos.com',
    phone: '+1111111111',
    password: 'password123',
    role: 'admin',
    district: 'Chennai'
  },
  {
    name: 'NDRF Commander',
    email: 'ndrf@disastersos.com',
    phone: '+2222222222',
    password: 'password123',
    role: 'ndrf',
    district: 'Chennai'
  },
  {
    name: 'NGO Coordinator',
    email: 'ngo@disastersos.com',
    phone: '+3333333333',
    password: 'password123',
    role: 'ngo',
    district: 'Chennai'
  },
  {
    name: 'Citizen Responder',
    email: 'citizen@disastersos.com',
    phone: '+4444444444',
    password: 'password123',
    role: 'citizen',
    district: 'Chennai'
  }
];

const seed = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to MongoDB for database seeding...');

    // Clear old seeded users to prevent duplicates
    const emails = seedUsers.map(u => u.email);
    await User.deleteMany({ email: { $in: emails } });
    console.log('Cleared existing mock database accounts.');

    const salt = await bcrypt.genSalt(10);

    for (const u of seedUsers) {
      const passwordHash = await bcrypt.hash(u.password, salt);
      const user = new User({
        name: u.name,
        email: u.email,
        phone: u.phone,
        passwordHash,
        role: u.role,
        district: u.district
      });
      await user.save();
      console.log(`[SEED] Created user: ${u.name} (Role: ${u.role})`);
    }

    console.log('Database seeding successfully finished.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding database failed:', err.message);
    process.exit(1);
  }
};

seed();
