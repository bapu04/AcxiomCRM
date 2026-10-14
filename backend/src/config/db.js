import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/acxiomcrm';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`[AcxiomCRM] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[AcxiomCRM] Primary MongoDB connection failed (${error.message}).`);
    console.info(`[AcxiomCRM] Attempting fallback to in-memory MongoDB for local zero-config run...`);
    
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[AcxiomCRM] Connected to In-Memory MongoDB: ${memUri}`);
      return conn;
    } catch (memError) {
      console.error(`[AcxiomCRM] Fatal: Could not connect to MongoDB or In-Memory MongoDB.`);
      console.error(`Please ensure MongoDB is running or specify a valid MONGODB_URI in backend/.env`);
      process.exit(1);
    }
  }
};
