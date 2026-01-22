import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';
const uri: string = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error("MONGO_URI is missing from environment variables");
}const client = new MongoClient(uri);

async function seed() {
  try {
    await client.connect();
    const db = client.db('amanaDB');

    const dataFolder = path.join(__dirname, '..', 'data');
    const files = fs.readdirSync(dataFolder).filter(f => f.endsWith('.ts'));

    for (const file of files) {
      const filePath = path.join(dataFolder, file);

      // Import the module dynamically
      const module = await import(filePath);

      // Get the first exported property (assumes each file exports one variable)
      const exportedKeys = Object.keys(module);
      if (exportedKeys.length === 0) {
        console.log(`No exports found in ${file}`);
        continue;
      }

      const data = module[exportedKeys[0]];

      // Ensure data is an array
      const dataArray = Array.isArray(data) ? data : [data];

      // Use file name (without extension) as collection name
      const collectionName = path.basename(file, '.ts');

      // Clear collection first (optional)
      await db.collection(collectionName).deleteMany({});

      if (dataArray.length === 0) {
        // Create empty collection if data is empty
        const existingCollections = await db.listCollections({ name: collectionName }).toArray();
        if (existingCollections.length === 0) {
          await db.createCollection(collectionName);
          console.log(`Created empty collection '${collectionName}'`);
        } else {
          console.log(`Collection '${collectionName}' already exists but is empty`);
        }
      } else {
        // Insert data
        await db.collection(collectionName).insertMany(dataArray);
        console.log(`Inserted ${dataArray.length} documents into '${collectionName}'`);
      }
    }

    console.log('Database seeding complete!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await client.close();
  }
}

seed();
