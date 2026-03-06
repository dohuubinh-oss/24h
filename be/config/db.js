import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI is not defined in .env file');
    process.exit(1);
  }

  console.log('Attempting to connect to MongoDB...');

  try {
    await mongoose.connect(process.env.MONGO_URI);
    // No need to log success here, the 'connected' event below will handle it.

  } catch (error) {
    // This initial catch will handle errors during the very first connection attempt
    console.error('Initial MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const db = mongoose.connection;

// --- Mongoose Event Listeners for detailed logging ---

// When successfully connected
db.on('connected', () => {
  console.log(`✅ MongoDB Connected: ${db.host}`);
});

// If the connection throws an error after the initial connection was established
db.on('error', (err) => {
  console.error(`❌ MongoDB connection error after initial connect: ${err.message}`);
});

// When the connection is disconnected
db.on('disconnected', () => {
  console.log('MongoDB Disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', async () => {
  await db.close();
  console.log('MongoDB connection disconnected through app termination');
  process.exit(0);
});

export default connectDB;
