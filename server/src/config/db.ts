import mongoose from 'mongoose';
import { env } from './env';

export async function connectDatabase(uri: string = env.MONGODB_URI): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 8000
  });
  if (!env.isTest) {
    console.log(`[HotelPro DB] Connected to MongoDB (${mongoose.connection.name})`);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.connection.close();
}
