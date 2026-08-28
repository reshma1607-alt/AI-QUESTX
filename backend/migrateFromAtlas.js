require("dotenv").config();
const mongoose = require("mongoose");

const ATLAS_URI = "mongodb://vu241fa04170_db_user:AIQUESTX123@ac-crson2y-shard-00-00.sjypahm.mongodb.net:27017,ac-crson2y-shard-00-01.sjypahm.mongodb.net:27017,ac-crson2y-shard-00-02.sjypahm.mongodb.net:27017/aiquestx?ssl=true&replicaSet=atlas-p2sgyg-shard-0&authSource=admin&appName=AIQUESTX";
const LOCAL_URI = process.env.LOCAL_MONGO_URI || "mongodb://127.0.0.1:27017/aiquestx";

async function migrateData() {
    let atlasConn = null;
    let localConn = null;

    try {
        console.log("Connecting to MongoDB Atlas...");
        atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
        console.log("✅ Connected to Atlas");

        console.log("Connecting to Local MongoDB...");
        localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
        console.log("✅ Connected to Local MongoDB");

        const collections = ["teams", "images", "attempts"];

        for (const colName of collections) {
            console.log(`\n--- Migrating collection: ${colName} ---`);
            const atlasCollection = atlasConn.collection(colName);
            const localCollection = localConn.collection(colName);

            const docs = await atlasCollection.find({}).toArray();
            console.log(`Found ${docs.length} documents in Atlas [${colName}]`);

            if (docs.length > 0) {
                // Upsert documents into local database
                for (const doc of docs) {
                    await localCollection.replaceOne(
                        { _id: doc._id },
                        doc,
                        { upsert: true }
                    );
                }
                console.log(`✅ Synced ${docs.length} documents into Local [${colName}]`);
            } else {
                console.log(`ℹ️ No documents to migrate for [${colName}]`);
            }
        }

        console.log("\n🎉 Migration completed successfully!");

    } catch (error) {
        console.error("❌ Migration error:", error);
    } finally {
        if (atlasConn) await atlasConn.close();
        if (localConn) await localConn.close();
        process.exit(0);
    }
}

migrateData();
