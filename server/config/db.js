const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-scheduler';
    
    console.log('Connecting to MongoDB...');
    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
      return mongoose;
    }).catch(err => {
        console.error('MongoDB Connection Error:', err.message);
        throw err;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.log('Continuing without database connection (Fallback Mode)...');
    // We don't throw here to allow the app to start in fallback mode
  }
  
  return cached.conn;
};

module.exports = connectDB;
