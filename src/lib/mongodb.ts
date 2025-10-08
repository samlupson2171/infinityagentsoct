import mongoose from 'mongoose';
import { StartupValidator } from './startup-validator';

// Skip validation during Vercel builds or CI
const isVercelBuild = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;
const isCIBuild = process.env.CI === '1' || process.env.CI === 'true';
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

// Only validate in development or runtime (not during builds)
const validationResult = (isVercelBuild || isCIBuild || isBuildPhase)
  ? { isValid: true, errors: [], warnings: [] }
  : StartupValidator.validateEnvironmentGraceful();

// Check if database feature is available (skip during builds)
if (!isVercelBuild && !isCIBuild && !isBuildPhase && !StartupValidator.isFeatureAvailable('database')) {
  console.error('❌ Database configuration is invalid. Please check your environment variables.');
  console.error('Run "node check-env.js" for detailed configuration help.');
}

const MONGODB_URI = process.env.MONGODB_URI!;

// Only throw error if not in build phase
if (!MONGODB_URI && !isVercelBuild && !isCIBuild && !isBuildPhase) {
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
