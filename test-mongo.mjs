import { MongoClient } from "mongodb";

const uri = "mongodb://deveshpurohit275:nWZoPfvWe7G8oCfp@ac-ingfjhg-shard-00-00.c12tzch.mongodb.net:27017,ac-ingfjhg-shard-00-01.c12tzch.mongodb.net:27017,ac-ingfjhg-shard-00-02.c12tzch.mongodb.net:27017/cookaro?ssl=true&replicaSet=atlas-gbbhrm-shard-0&authSource=admin&retryWrites=true&w=majority&appName=recipe";

async function run() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("Connected successfully to MongoDB Atlas!");
    const db = client.db("cookaro");
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    await client.close();
  } catch (err) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }
}

run();
