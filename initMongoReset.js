import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri);

async function resetDB() {
  try {
    await client.connect();
    const db = client.db('pos_db_mongo'); // نام دیتابیس MongoDB
    await db.dropDatabase();
    console.log('🗑️ دیتابیس قبلی پاک شد ✅');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetDB();
