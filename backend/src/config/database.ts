import mongoose from 'mongoose';

export let isMongoConnected = false;

export async function connectDatabase(): Promise<boolean> {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rumorradar';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000
    });
    isMongoConnected = true;
    console.log(`[Database] Successfully connected to MongoDB at ${mongoUri}`);
    return true;
  } catch (error) {
    isMongoConnected = false;
    console.warn(`[Database] MongoDB not reachable at ${mongoUri}. Operating in seamless persistent file-storage fallback mode (.data/store.json). All features and endpoints remain fully operational!`);
    return false;
  }
}
