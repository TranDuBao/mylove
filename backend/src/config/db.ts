import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

declare global {
  var dbFallback: boolean;
}

export const connectDB = async (): Promise<boolean> => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.warn('\n======================================================');
    console.warn('⚠️  MONGODB_URI is not defined in environment variables.');
    console.warn('⚠️  Falling back to local JSON-based file database (local_db.json).');
    console.warn('======================================================\n');
    global.dbFallback = true;
    return false;
  }

  try {
    // Set connection timeout to 3 seconds for quick fallback
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('✅ Connected to MongoDB successfully.');
    global.dbFallback = false;
    return true;
  } catch (error: any) {
    console.error('\n======================================================');
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('⚠️  Falling back to local JSON-based file database (local_db.json).');
    console.error('======================================================\n');
    global.dbFallback = true;
    return false;
  }
};
