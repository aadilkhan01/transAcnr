import { MongoClient, MongoClientOptions } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}
const uri: string = process.env.MONGODB_URI;
// Force IPv4: Vercel's serverless network egress can fail TLS negotiation
// against Atlas shard endpoints over IPv6, surfacing as a generic
// MongoServerSelectionError / "tlsv1 alert internal error".
const options: MongoClientOptions = { family: 4 };

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function connect(): Promise<MongoClient> {
  const client = new MongoClient(uri, options);
  return client.connect().catch((err) => {
    // Don't let a failed connection attempt get stuck cached in a warm
    // serverless container — clear it so the next call retries fresh.
    global._mongoClientPromise = undefined;
    throw err;
  });
}

if (!global._mongoClientPromise) {
  global._mongoClientPromise = connect();
}

const clientPromise = global._mongoClientPromise;

export default clientPromise;
