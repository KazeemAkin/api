import dbo from "./dBConnection";
import crypto from "crypto";
import { has } from "lodash";
import { validate } from "uuid";
import { DynamicObjectType } from "../api-liberaries/types/global.data";
import {
  empty,
  isObject,
  isString,
  isUndefined,
} from "../api-liberaries/utilities/utils";
import { Db, Document, Filter, OptionalId } from "mongodb";

class BaseModel {
  private collection_name: string = "";
  private default_database: string | undefined = process.env.DB_NAME;
  private is_db_connection_established: boolean = false;

  /**
   * handler for db
   */
  db: string = "";
  db_name: string | undefined = "";
  _dbObject: Db | null = null;
  
  constructor(collection_name: string, dbParam: string | null = null) {
    let db = dbParam;
    (async () => {
      try {
        if (db === null && !isUndefined(this.default_database) && this.default_database) {
          db = this.default_database;
        }
        await this.connect(collection_name, db);
        return this;
      } catch (e) {
        console.error(e);
      }
      return this;
    })();
    return this;
  }

  async connect(initialize: string, dbParam: string | null = null) {
    let db = dbParam;
    if (empty(db) && !isUndefined(this.default_database)) {
      db = this.default_database as string;
    }
    if (empty(db)) {
      db = this.default_database as string;
    }

    if (isString(db)) {
      this.db_name = db;
    }
    if (isString(initialize)) {
      this.collection_name = initialize;
    }
    const dbConnected = await dbo.connect(db as string);
    if (dbConnected) {
      this.is_db_connection_established = true;
      this._db = dbConnected;
      return true;
    }
    throw new Error('Unable to establish db connection');
  }

  set _db(idb: Db) {
    if (idb) {
      this._dbObject = idb;
    }
  }

  get _db() {
    return this._dbObject as Db;
  }

  static getConnectedDBName() {
    const connected_db_name = dbo.getConnectedDBName();
    const last_connected_db = !empty(connected_db_name)
      ? connected_db_name
      : null;
    return last_connected_db;
  }

  checkAndSwitchDB() {
    try {
      const connected_db = BaseModel.getConnectedDBName();
      if (this.db_name && connected_db && this.db_name !== connected_db) {
        this._db = dbo.useDB(this.db_name) as Db;
      }
      if (!this._db) {
        this._db = dbo.db() as Db;
      }
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Return a row from the collection based on the uuid/Id supplied
   * @param {*} res
   * @param {*} id
   */
  async getRowByField(
    operation: DynamicObjectType = {},
    projection: DynamicObjectType = {}
  ) {
    try {
      if (!this._db) {
        this.checkAndSwitchDB();
      }

      const result = await this._db
        ?.collection(this.collection_name)
        ?.findOne(operation, projection);

      if (!result) {
        return {};
      }

      return result;
    } catch (error) {
      console.log(error);
      return {};
    }
  }

  /**
   * get distinct record
   * @param {*} value
   * @returns
   */
  async getDistinctRecord(value: string) {
    try {
      if (!this._db) {
        this.checkAndSwitchDB();
      }

      const result = await this._db
        ?.collection(this.collection_name)
        .distinct(value);

      if (!result) {
        return false;
      }

      return result;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async aggregateFind(operation: Document[]) {
    try {
      if (!this._db) {
        this.checkAndSwitchDB();
      }

      const result = await this._db
        ?.collection(this.collection_name)
        .aggregate(operation);

      if (!result) {
        return [];
      }

      return result.toArray();
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  /**
   * Get one single record
   * @param {*} operation
   * @returns
   */
  async getAllRows(
    operation: DynamicObjectType = {},
    sort: DynamicObjectType  = {},
    limit: number | string = 0,
    skip: number = 0,
    projection: DynamicObjectType = {}
  ) {
    try {
      if (!this._db) {
        this.checkAndSwitchDB();
      }

      // Check if a custom limit is provided and is a positive integer
      const limitValue: number = parseInt(String(limit), 10) || 10000;
      const result = await this._db
        .collection(this.collection_name)
        .find(operation)
        .project(projection)
        .skip(skip)
        .sort(sort)
        .limit(limitValue);
      if (!result) {
        return [];
      }

      return result.toArray();
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  /**
   *
   * @param {*} operation
   * @returns
   */
  async getCount(operation: DynamicObjectType = {}) {
    try {
      if (!this._db) {
        this.checkAndSwitchDB();
      }

      const result = await this._db
        ?.collection(this.collection_name)
        .countDocuments(operation);
      if (!result) {
        return false;
      }

      return result;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * Add one single record
   * @param {*} data
   * @returns
   */
  async addOne(data: DynamicObjectType) {
    try {
      if (!this._db) {
        this.checkAndSwitchDB();
      }

      //generate unique Id
      data._id = crypto.randomUUID();
      if (!validate(data._id)) {
        return false;
      }
      data.dateCreated = new Date();
      const result = await this._db
        ?.collection(this.collection_name)
        .insertOne(data);
      if (!result) {
        return false;
      }

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * insert many
   * @param {*} documents
   * @returns
   */
  async addMany(documents: readonly OptionalId<Document>[]) {
    try {
      if (!this._db) {
        this.checkAndSwitchDB();
      }

      const result = await this._db
        ?.collection(this.collection_name)
        .insertMany(documents);
      if (!result) {
        return false;
      }

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  /**
   * update many
   * @param {*} filter
   * @param {*} data
   * @returns
   */
  async updateMany(filter: DynamicObjectType, data: Document) {
    try {
      if (!this._db) {
        this.checkAndSwitchDB();
      }

      const updateData: DynamicObjectType = { $set: data };

      const result = await this._db
        ?.collection(this.collection_name)
        .updateMany(filter, updateData);
      if (!result) {
        return false;
      }

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * update one single record
   * @param {*} id
   * @param {*} data
   * @returns
   */
  async updateOneRecord(
    conditions: DynamicObjectType,
    payload: DynamicObjectType,
    changeSet = false
  ) {
    try {
      if (!this._db) {
        this.checkAndSwitchDB();
      }

      // prepare update
      payload.lastUpdated = new Date();
      let update = {};
      if (changeSet) {
        update = payload;
      } else {
        update = { $set: payload };
      }
      // update payload
      const result = await this._db
        ?.collection(this.collection_name)
        .updateOne(conditions, update);

      if (result?.modifiedCount === 0) {
        return false;
      }

      return true;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Update records
   * @param update_obj
   * @param where
   * @returns
   */
  async updateRecords(update_obj: DynamicObjectType, where: Filter<Document>) {
    try {
      if (!this._db) {
        this.checkAndSwitchDB();
      }

      // prepare update
      update_obj.lastUpdated = new Date();
      const update = {
        $set: update_obj,
      };
      // update data
      const result = await this._db
        ?.collection(this.collection_name)
        .updateMany(where, update);

      if (result?.modifiedCount === 0) {
        return false;
      }

      return true;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * delete one single data
   * @param {*} conditions
   * @returns
   */
  async deleteOne(conditions: DynamicObjectType = {}) {
    try {
      if (!this._db) {
        this.checkAndSwitchDB();
      }

      const result = await this._db
        ?.collection(this.collection_name)
        .deleteOne(conditions);
      if (!result) {
        return false;
      }

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * delete multiple data
   * @param {*} conditions
   * @returns
   */
  async deleteMany(conditions: DynamicObjectType = {}) {
    try {
      if (!this._db) {
        this.checkAndSwitchDB();
      }
      
      if (!isObject(conditions)) {
        return false;
      }
      const result = await this._db
        ?.collection(this.collection_name)
        .deleteMany(conditions);
      if (!result) {
        return false;
      }

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * check if object is a db object
   * @param {*} obj
   * @returns
   */
  async isDbObject(obj: DynamicObjectType = {}) {
    try {
      if (!empty(obj) && !isUndefined(obj) && has(obj, "_id")) {
        return true;
      }

      return false;
    } catch (error) {
      console.log(error);
    }
  }
}

export default BaseModel;
