import {
  MongoClient, Db, ObjectId, MongoClientOptions,
} from 'mongodb';

// ============================================================================
// CONNECTION STATE (THREAD-SAFE VIA NODE.JS EVENT LOOP)
// ============================================================================

let db: Db | null = null;
let client: MongoClient | null = null;
let connectedDBName: string | null = null;

interface Database {
  id: typeof ObjectId;
  db: () => Db | null;
  client: () => MongoClient | null;
  connect: (dbName: string | null, pool_size?: number) => Promise<Db | null>;
  isObjectId: (value: unknown) => boolean;
  useDB: (dbName: string) => Db | null;
  getConnectedDBName: () => string | null;
}

const getDatabase = (dbName: string): Db | null => {
  if (!client) {
    console.error("Failed to initialize db");
    return null;
  }

  try {
    const dbInstance = client.db(dbName);
    return dbInstance;
  } catch (e) {
    console.error(e);
    return null;
  }
};

/**
 * Connect to MongoDB database
 * Establishes connection pool and selects database
 *
 * @param dbName Database name to connect to (null to connect without selecting DB)
 * @param pool_size Connection pool size (default: 10, max: 100)
 * @returns Promise<Db | null>
 */
const connect = async (
  dbName: string | null = null,
  pool_size: number = 0,
): Promise<Db | null> => {

  try {
    // Validate and resolve pool size from multiple sources
    let validPoolSize = pool_size;

    // If pool_size not provided, check env var
    if (!pool_size || pool_size === 0) {
      if (process.env.DB_POOL_SIZE) {
        const envPoolSize = Number(process.env.DB_POOL_SIZE);
        if (!Number.isNaN(envPoolSize) && envPoolSize > 5 && envPoolSize <= 100) {
          validPoolSize = envPoolSize;
        }
      } else {
        validPoolSize = 100;
      }
    }

    // Ensure within valid range (6-100)
    validPoolSize = Math.min(Math.max(validPoolSize, 6), 100);

    if (!client) {
      const connectionString = process.env.DB_URL;

      if (!connectionString) {
        throw new Error('❌ CRITICAL: DB_URL environment variable is not set! Please configure DB_URL before starting the application.');
      }

      const options: MongoClientOptions = {
        maxPoolSize: validPoolSize,
        minPoolSize: 5,
        maxIdleTimeMS: 120000,
        serverSelectionTimeoutMS: 24000,
        socketTimeoutMS: 45000,
      };

      client = new MongoClient(connectionString, options);

      await client.connect();
      console.info(
        `✅ MongoDB connected successfully with pool size: ${validPoolSize}`,
      );
    }

    if (dbName) {
      db = getDatabase(dbName);
    }

    return db;
  } catch (e) {
    console.error(e);
    return null;
  }
};

/**
 * Get current database instance
 * @returns Db or null
 */
const getDb = (): Db | null => db || null;

/**
 * Get MongoDB client instance
 * @returns MongoClient or null
 */
const client_instance = (): MongoClient | null => client;

/**
 * Check if value is valid MongoDB ObjectId
 * @param value Value to check
 * @returns boolean
 */
const isObjectId = (value: unknown): boolean => value instanceof ObjectId;

/**
 * Get currently connected database name
 * @returns string or null
 */
const getConnectedDBName = (): string | null => connectedDBName;

/**
 * Use database
 * @param dbName Database name to switch to
 * @returns Db instance or null
 */
const useDB = (dbName: string): Db | null => {
  try {
    // Check connection status
    if (!client) {
      console.error('Connection failed.');
      return null;
    }

    // Reuse existing connection if the same DB name
    if (db && connectedDBName === dbName) {
      // console.log(`[${requestId}] Reusing existing connection to database: ${dbName}`);
      return db;
    }

    // Switch to a new database
    if (db && connectedDBName !== dbName) {
      // console.log(`[${requestId}] Switching DB from ${connectedDBName} to ${dbName}`);
    }

    db = getDatabase(dbName);
    if (db) {
      connectedDBName = dbName;
      // console.log(`[${requestId}] ✅ Success: using ${dbName} database`);
      return db;
    }

    return null;
  } catch (e) {
    console.error('Db error', e)
    return null;
  }
};

// ============================================================================
// Database Interface - 100% Backward compatible with old code
// ============================================================================

/**
 * Database object - Main default export
 */
const database: Database = {
  id: ObjectId,
  db: getDb,
  client: client_instance,
  connect,
  isObjectId,
  getConnectedDBName,
  useDB
};

export default database;
