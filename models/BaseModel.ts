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
import { Document, Filter, OptionalId } from "mongodb";

class BaseModel {
  private is_db_established: boolean = false;
  private last_connected_db: string | null = "";
  private collection_name: string = "";
  private default_database: string | null | undefined = process.env.DB_NAME;

  /**
   * handler for db
   */
  db: string | undefined = "";
  db_name: string | undefined = "";
  constructor(collection_name: string = "", db = process.env.DB_NAME) {
    if (this.is_db_established === true) {
      if (!empty(db)) {
        this.db_name = db;
      } else if (db === null) {
        db = process.env.DB_NAME;
      }

      if (!empty(collection_name) && isString(collection_name)) {
        this.collection_name = collection_name;
      }

      const connected_db = dbo.getConnectedDBName();
      const last_connected_db = !empty(connected_db)
        ? connected_db
        : this.last_connected_db;
      if (!empty(this.db_name) && this.db_name !== last_connected_db) {
        this.DBConnection();
      }

      return this;
    }
    (async () => {
      try {
        if (db === null && !isUndefined(process.env.DB_NAME)) {
          db = process.env.DB_NAME;
        }
        await this._connect(collection_name, db);
        return this;
      } catch (error) {
        console.log(error);
      }
    })();
    return this;
  }

  DBConnection() {
    if (!empty(process.env.DB_NAME)) {
      dbo.useDB(process.env.DB_NAME);
    }
    const db = dbo.db();
    return db;
  }

  async _connect(collection_name: string, db: string | undefined) {
    if (empty(db) && !isUndefined(process.env.DB_NAME)) {
      db = process.env.DB_NAME;
    }
    if (empty(db)) {
      db = String(this.default_database);
    }

    if (isString(db)) {
      this.db_name = this.last_connected_db = db;
    }
    if (isString(collection_name)) {
      this.collection_name = collection_name;
    }
    const dBConnected = await dbo.connect(db);
    if (dBConnected) {
      this.is_db_established = true;
      console.log("DB connection established");
      return true;
    } else {
      throw new Error("Unable to establish db connection");
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
      const result = await this.DBConnection()
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
      const result = await this.DBConnection()
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
      const result = await this.DBConnection()
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
    sort: DynamicObjectType = {},
    limit: number | string = 0,
    skip: number = 0,
    projection: DynamicObjectType = {}
  ) {
    try {
      // Check if a custom limit is provided and is a positive integer
      const limitValue: number = parseInt(String(limit), 10) || 10000;
      const result = await this.DBConnection()
        ?.collection(this.collection_name)
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
      const result = await this.DBConnection()
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
      //generate unique Id
      data._id = crypto.randomUUID();
      if (!validate(data._id)) {
        return false;
      }
      data.dateCreated = new Date();
      const result = await this.DBConnection()
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
      const result = await this.DBConnection()
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
      const updateData: DynamicObjectType = { $set: data };

      const result = await this.DBConnection()
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
      // prepare update
      payload.lastUpdated = new Date();
      let update = {};
      if (changeSet) {
        update = payload;
      } else {
        update = { $set: payload };
      }
      // update payload
      const result = await this.DBConnection()
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
      // prepare update
      update_obj.lastUpdated = new Date();
      const update = {
        $set: update_obj,
      };
      // update data
      const result = await this.DBConnection()
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
      const result = await this.DBConnection()
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
      if (!isObject(conditions)) {
        return false;
      }
      const result = await this.DBConnection()
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
