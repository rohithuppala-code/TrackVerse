import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  const maxRetries = 5;
  const retryDelayMs = 3000;
  let lastError;

  // Configure mongoose settings for better connection stability
  mongoose.set('strictQuery', false);

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        retryWrites: true,
        retryReads: true,
        heartbeatFrequencyMS: 10000
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      console.log(`📊 Database: ${conn.connection.name}`);
      
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
      });

      return conn;
    } catch (error) {
      lastError = error;

      console.error(`❌ MongoDB connection attempt ${attempt}/${maxRetries} failed`);
      console.error('MongoDB error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        cause: error.cause?.message || null
      });

      if (attempt < maxRetries) {
        console.log(`🔄 Retrying MongoDB connection in ${retryDelayMs / 1000} seconds...`);
        await wait(retryDelayMs);
      }
    }
  }

  console.error('❌ Failed to connect to MongoDB after all retries');
  throw lastError;
};

export default connectDB;
