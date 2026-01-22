import { MongoClient } from 'mongodb';

const uri: string = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error("MONGO_URI is missing from environment variables");
}
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  console.warn('MONGODB_URI not set, using local MongoDB');
}

if (process.env.NODE_ENV === 'development') {
  // In development, use global variable to preserve connection across hot reloads
  if (!(global as any)._mongoClientPromise) {
    
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // In production, create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
