require('dotenv').config();
const { MongoClient } = require('mongodb');

const localUri = 'mongodb://localhost:27017/srp_db';
const remoteUri = process.env.MONGO_URI;

async function migrate() {
    const localClient = new MongoClient(localUri);
    const remoteClient = new MongoClient(remoteUri);

    try {
        await localClient.connect();
        await remoteClient.connect();
        console.log('Connected to Local and Remote MongoDB...');

        const localDb = localClient.db('srp_db');
        const remoteDb = remoteClient.db();

        const collections = await localDb.listCollections().toArray();
        console.log(`Found ${collections.length} collections locally.`);

        for (const collInfo of collections) {
            const collName = collInfo.name;
            if (collName === 'system.profile') continue;
            
            console.log(`Migrating collection: ${collName}...`);
            const docs = await localDb.collection(collName).find({}).toArray();
            
            if (docs.length > 0) {
                try {
                    await remoteDb.collection(collName).drop();
                } catch (e) {
                    // Ignore if remote collection doesn't exist
                }
                await remoteDb.collection(collName).insertMany(docs);
                console.log(`  -> Inserted ${docs.length} documents into ${collName}.`);
            } else {
                console.log(`  -> Collection ${collName} is empty.`);
            }
        }
        console.log('Migration complete!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await localClient.close();
        await remoteClient.close();
        process.exit();
    }
}

migrate();
