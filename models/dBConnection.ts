import { MongoClient, Db, ObjectId } from "mongodb";
import { Database } from "./../api-liberaries/interface/Database";

const connectionString = process.env.DB_URL;

let db: Db | null | undefined;
let client: MongoClient | null;

const database: Database = {
  id: ObjectId,
  db: () => db,
  client: () => client,
  connect: async (dbName: string | undefined = ""): Promise<Db | null> => {
    if (!connectionString) {
      return null;
    }
    client = new MongoClient(connectionString, {
      maxIdleTimeMS: 270000,
      maxPoolSize: 100,
    });

    try {
      await client.connect();
      db = client.db(dbName);
      console.log(`Success: Connected to ${dbName} database`);
      return db;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  close: () => {
    if (client) return client.close();
    return null;
  },
  isObjectId: (value) => value instanceof ObjectId,
  useDB: (dbName: string | undefined) => {
    db = client?.db(dbName);
    console.log(`Success:: using ${dbName} database`);
  },
  getConnectedDBName: () => {
    let connected_database_name: string | undefined = "";
    try {
      connected_database_name = db?.databaseName;
    } catch (error) {
      console.log(error);
      return null;
    }
    return connected_database_name;
  },
};

export default database;
