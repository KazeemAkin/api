import { MongoClient, Db, ObjectId } from "mongodb";

export interface Database {
  id: typeof ObjectId;
  db: () => Db | null | undefined;
  client: () => MongoClient | null;
  connect: (
    dbName: string | undefined,
    pool_size?: number
  ) => Promise<Db | null>;
  close: () => Promise<void> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isObjectId: (value: any) => boolean;
  getConnectedDBName: () => string | undefined | null;
  useDB: (dbName: string | undefined) => void;
}
