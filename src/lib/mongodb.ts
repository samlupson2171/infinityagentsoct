import mongoose from 'mongoose';
import { StartupValidator } from './startup-validator';

// Validate environment on module load (skip during build)
// Skip validation during build process
const validationResult = process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI 
  ? { isValid: false, errors: [], warnings: [] }
  : (typeof window === 'undefined' && process.env.NODE_ENV === 'production') 
    ? { isValid: true, errors: [], warnings: [] } // Skip during build
    : StartupValidator.validateEnvironmentGraceful();

// Check if database feature is available
if (!StartupValidator.isFeatureAvailable('database')) {
  console.error('❌ Database configuration is invalid. Please check your environment variables.');
  console.error('Run "node check-env.js" for detailed configuration help.');
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  const help = StartupValidator.getConfigurationHelp();
  console.error('Database configuration error:');
  help.forEach(line => console.error(line));
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached: MongooseCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Use basic connection options to avoid SSL issues
    const opts: mongoose.ConnectOptions = {
      // Basic connection settings
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log('MongoDB connected successfully');
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error('MongoDB connection error:', error);
    throw new Error(
      `Failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed due to app termination');
  process.exit(0);
});

export default connectDB;
export { connectDB };

// Alias for consistency with existing code
export const connectToDatabase = connectDB;
