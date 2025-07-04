import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load the appropriate .env file
dotenv.config({
   path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
});

const URI =
   process.env.NODE_ENV === 'production'
      ? process.env.DATABASE_URL
      : process.env.DB_URI;

if (!URI) {
   throw new Error(
      'MongoDB connection URI is not defined in environment variables'
   );
}

// This will be passed to Graceful Shutdown
let reconnectTries = 0;
const reconnectMaxTries = 10;

const connectDB = async (): Promise<void> => {
   if (mongoose.connection.readyState === 1) {
      console.log('Already connected to MongoDB');
      return;
   }

   try {
      await mongoose.connect(URI);
      console.log('MongoDB connected successfully!');
   } catch (err) {
      console.error('MongoDB initial connection error:', err);
      process.exit(1);
   }
};

const handleDisconnection = async (): Promise<void> => {
   if (reconnectTries < reconnectMaxTries) {
      const delay = Math.pow(2, reconnectTries) * 1000;

      setTimeout(async () => {
         try {
            console.log(`Reconnection attempt #${reconnectTries + 1}`);
            await mongoose.connect(URI, { maxPoolSize: 10 });
            console.log('MongoDB reconnected!');
            reconnectTries = 0;
         } catch (err) {
            reconnectTries++;
            console.error(`Reconnect attempt ${reconnectTries} failed:`, err);
            handleDisconnection();
         }
      }, delay);
   } else {
      console.error('Max reconnection attempts reached. Exiting process.');
      process.exit(1);
   }
};

const closeDB = async (): Promise<void> => {
   try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
   } catch (err) {
      console.error('Error closing MongoDB connection', err);
      process.exit(1);
   }
};

const gracefulShutdown = async (
   signal: NodeJS.Signals,
   server?: import('http').Server
): Promise<void> => {
   console.log(`${signal} received. Shutting down gracefully...`);
   try {
      if (server) {
         await new Promise<void>((resolve, reject) => {
            server.close(err => (err ? reject(err) : resolve()));
         });
         console.log('Server closed');
      }
      await closeDB();
      process.exit(0);
   } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
   }
};

// Bind DB events
const db = mongoose.connection;

db.on('connecting', () => console.log('Attempting MongoDB connection...'));
db.on('error', err => console.error('MongoDB connection error:', err));
db.on('connected', () => console.log('Connected to MongoDB!'));
db.on('disconnected', handleDisconnection);
db.on('reconnected', () => console.log('MongoDB reconnected!'));
db.once('open', () => console.log('MongoDB connection open!'));
db.on('close', () => console.log('MongoDB connection closed manually.'));

export { connectDB, gracefulShutdown, closeDB, db };
