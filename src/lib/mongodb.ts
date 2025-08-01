import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.mongodb_uri;

if (!uri || !(uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'))) {
    throw new Error('Invalid/Missing environment variable: "mongodb_uri". Please add your MongoDB connection string to the .env file. It should start with "mongodb://" or "mongodb+srv://".');
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
