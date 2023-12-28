import { MongoClient } from "mongodb";
import { parseUri } from "./parse";
import { AllDatabaseInfo, DatabaseInfo } from "~/composables/useDbsInfo";

interface connectionOptions {
  uri: string;
  name: string;
}

interface Role {
  role: string;
  db: string;
}

let instance: Client | null = null;

/**
 * Handles the mongodb connection.
 */
class Client {
  /**
   * @property mongodb connection uri.
   */
  #uri?: string;

  /**
   * @property unique name given to the connection.
   */
  #name?: string;

  /**
   * @property authenticated user.
   */
  #user?: string;

  /**
   * @property instance of MongoClient created using given uri.
   */
  #client?: MongoClient;

  /**
   * @property new databases that are empty and are yet to be created
   * in the mongodb.
   */
  #emptyDatabases?: DatabaseInfo[];

  /**
   * Creates a new Client instance.
   *
   * A new instance is created if there is no existing instance.
   *
   * @class
   *
   * @throws When there's an existing Client instance.
   */
  constructor() {
    if (instance) {
      throw new Error("Client already instantiated.");
    }
    instance = this;
  }

  /**
   * @property Retrieve the `#client` property.
   */
  get client() {
    return this.#client;
  }

  /**
   * @property Retrieve the `#uri` property.
   */
  get uri() {
    return this.#uri;
  }

  /**
   * @property Retrieve the `#user` property.
   */
  get user() {
    return this.#user;
  }

  /**
   * @property Retrieve the `#name` property.
   */
  get name() {
    return this.#name;
  }

  /**
   * @property Retrieve the `#emptyDatabases` property.
   */
  get emptyDatabases() {
    return this.#emptyDatabases;
  }

  /**
   * Validates if arguments are of the correct type.
   *
   * @param obj Object of the arguments to validate.
   *
   * @throws If arguments are not of the expected type.
   */
  validateArgs(obj: { [propName: string]: any }) {
    const keys = Object.keys(obj);

    if (keys.includes("database") && typeof obj.database !== "string")
      throw Error("database must be a string");

    if (keys.includes("collection") && typeof obj.collection !== "string")
      throw Error("collection must be a string");

    if (keys.includes("roles") && !Array.isArray(obj.roles))
      throw Error("roles must be an array");

    if (keys.includes("page"))
      try {
        parseInt(obj.page);
      } catch (error) {
        throw Error("page must be a number");
      }
  }

  /**
   * Creates a MongoClient instance with the user connection options.
   *
   * @async
   *
   * @param {connectionOptions} options connection options as provided by the user.
   *
   * @throws When the connection options provided are invalid.
   */
  async setClient(options: connectionOptions) {
    if (!options.uri) {
      throw new Error("Must provide uri");
    }
    if (!options.name) {
      throw new Error("Must provide name");
    }

    if (!this.#client) {
      try {
        this.#client = new MongoClient(options.uri, {
          connectTimeoutMS: 5000,
          serverSelectionTimeoutMS: 5000,
        });

        await this.#client?.connect();
      } catch (error: any) {
        await this.closeClient();
        this.#client = undefined;
        throw new Error(error.message);
      }

      this.#name = options.name;
      this.#uri = options.uri;
      this.#user = parseUri(options.uri).user;
      this.#emptyDatabases = [];
    } else {
      console.log("Client already assigned");
    }
  }

  /**
   * Closes the mongodb connection.
   *
   * @async
   */
  async closeClient() {
    if (this.#client) {
      await this.#client.close();
    }
  }

  /**
   * Clears all information about current client and closes the mongodb
   * connection.
   *
   * @async
   */
  async clearCurrentClient() {
    await this.closeClient();

    this.#client = undefined;
    this.#uri = undefined;
    this.#name = undefined;
    this.#user = undefined;
    this.#emptyDatabases = undefined;
  }

  /**
   * Gets all databases on the client that the user has access to.
   *
   * @async
   *
   * @returns list of all databases.
   */
  async databases() {
    if (this.#client) {
      return (await this.#client?.db().admin().listDatabases())?.databases.map(
        (db) => db.name
      );
    }
    return [];
  }

  /**
   * Gets all collections in a database.
   *
   * @async
   *
   * @param database name of the database.
   *
   * @returns list of all collections in the database.
   *
   * @throws If arguments are not of the expected type.
   */
  async collections(database: string) {
    try {
      this.validateArgs({ database });
    } catch (error: any) {
      throw Error(error.message);
    }

    if (this.#client) {
      const collectionObjects = await this.#client
        .db(database)
        .listCollections()
        .toArray();

      return collectionObjects.map((col) => col.name);
    }
    return [];
  }

  /**
   * Gets the roles that the user has.
   *
   * @see Role
   * @async
   *
   * @returns list of roles that the user has.
   */
  async userRoles() {
    if (this.#client) {
      const roles: Role[] = (
        await this.#client
          .db()
          .admin()
          .command({ usersInfo: { user: this.#user, db: "admin" } })
      ).users[0].roles;

      return roles;
    }

    return [];
  }

  /**
   * Gets the roles the user has in a certain database.
   *
   * @param database name of the database.
   * @param roles array of all the roles the user has.
   *
   * @returns roles the user has in database given.
   *
   * @throws If arguments are not of the expected type.
   */
  getUserRolesInDb(database: string, roles: Role[]) {
    try {
      this.validateArgs({ database, roles });
    } catch (error: any) {
      throw Error(error.message);
    }

    return roles
      .filter((role) => role.db === database)
      .map((role) => role.role);
  }

  /**
   * Gets database in the client and the collections found in the
   * databases. The user's roles in every database are also retrieved.
   *
   * `local` and `config` databases are left out.
   *
   * @see DatabaseInfo
   *
   * @returns A list of objects of type `DatabaseInfo`.
   */
  async dbsInfo() {
    const databases = await this.databases();

    const dbsAndCols: AllDatabaseInfo = { nonEmpty: [], empty: [] };

    if (databases && this.#client) {
      const allRoles = await this.userRoles();

      for (let database of databases) {
        if (database !== "local" && database !== "config") {
          const collections = await this.collections(database);

          const roles = this.getUserRolesInDb(database, allRoles);

          dbsAndCols.nonEmpty?.push({
            name: database,
            collections,
            roles,
          });
        }
      }
    }

    dbsAndCols.empty = this.#emptyDatabases;

    return dbsAndCols;
  }

  /**
   * Adds a new database to the #emptyDatabases array.
   *
   * The database is not created on the mongodb until the first
   * document is added.
   *
   * @param database name of the new database.
   * @param collection name of new collection.
   *
   * @throws If arguments are not of the expected type.
   */
  addDatabase(database: string, collection: string) {
    try {
      this.validateArgs({ database, collection });
    } catch (error: any) {
      throw Error(error.message);
    }

    if (!this.#emptyDatabases?.some((db) => db.name === database)) {
      this.#emptyDatabases?.push({ name: database, collections: [collection] });
    }
  }

  /**
   * Drops a database.
   *
   * @async
   *
   * @param database name of the database to drop.
   *
   * @returns `true` if the database is dropped successfully else `false`.
   *
   * @throws If arguments are not of the expected type.
   */
  async dropDatabase(database: string) {
    try {
      this.validateArgs({ database });
    } catch (error: any) {
      throw Error(error.message);
    }

    if (this.#emptyDatabases?.some((db) => db.name === database)) {
      this.#emptyDatabases = this.#emptyDatabases?.filter(
        (db) => db.name !== database
      );
    } else {
      try {
        await this.#client?.db(database).dropDatabase();
      } catch (error) {
        return false;
      }
    }
    return true;
  }

  /**
   * Creates a collection in the given database.
   *
   * @description
   * If the database is a new one and is empty, the collection creation
   * is implied. It is not written directly to the database but is
   * added to the list of collections of the empty database in the
   * `#emptyDatabases` array. The collection is only created if a document is
   * added into it.
   *
   * @see #emptyDatabases
   *
   * @param database name of the database where to add collection.
   * @param collection name of the new collection to be added.
   * @returns `true` if collection was added successfully, else `false`.
   *
   * @throws If arguments are not of the expected type.
   */
  async createCollection(database: string, collection: string) {
    try {
      this.validateArgs({ database, collection });
    } catch (error: any) {
      throw Error(error.message);
    }

    if (this.#emptyDatabases?.some((db) => db.name === database)) {
      this.#emptyDatabases = this.#emptyDatabases?.map((db) => {
        if (db.name === database) {
          db.collections.push(collection);
        }
        return db;
      });
    } else {
      try {
        await this.#client?.db(database).createCollection(collection);
      } catch (error) {
        return false;
      }
    }
    return true;
  }

  /**
   * Finds documents in the given page.
   *
   * @param database name of the database.
   * @param collection name of the collection.
   * @param page page to load.
   * @returns array of documents in the given page.
   *
   * @throws If arguments are not of the expected type.
   */
  async findDocumentsInPage(
    database: string,
    collection: string,
    page: number
  ) {
    try {
      this.validateArgs({ database, collection, page });
    } catch (error: any) {
      throw Error(error.message);
    }

    const pageSize = 10;
    if (this.#client) {
      const documents = await this.#client
        .db(database)
        .collection(collection)
        .find({})
        .skip(page * pageSize)
        .limit(pageSize)
        .toArray();

      return documents;
    }
    return [];
  }

  /**
   * Finds documents that match the filter in the given collection.
   *
   * @async
   *
   * @param database name of the database.
   * @param collection name of the collection.
   * @param filter search criteria.
   * @param options optional settings passed to the command.
   * @returns documents that match the filter.
   *
   * @throws If arguments are not of the expected type.
   */
  async findDocuments(
    database: string,
    collection: string,
    filter: { [propName: string]: any },
    options = {}
  ) {
    try {
      this.validateArgs({ database, collection });
    } catch (error: any) {
      throw Error(error.message);
    }

    if (this.#client) {
      return await this.#client
        .db(database)
        .collection(collection)
        .find(filter, options)
        .toArray();
    }
    return [];
  }

  /**
   * Inserts a single or multiple documents.
   * If database was empty, it is created on mongodb and documents added.
   * The empty database is also removed from the `#emptyDatabases`.
   *
   * @async
   *
   * @param database name of the database.
   * @param collection name of the collection.
   * @param document a single document or array of documents to insert.
   * @returns insertion result.
   *
   * @throws If arguments are not of the expected type.
   */
  async insertDocument(
    database: string,
    collection: string,
    document: {} | {}[]
  ) {
    try {
      this.validateArgs({ database, collection });
    } catch (error: any) {
      throw Error(error.message);
    }

    if (this.#client) {
      let result;
      const col = this.#client.db(database).collection(collection);

      if (Array.isArray(document)) {
        result = await col.insertMany(document);
      } else {
        result = await col.insertOne(document);
      }

      // Remove database from empty databases after inserting document.
      if (this.#emptyDatabases?.some((db) => db.name === database)) {
        this.#emptyDatabases = this.#emptyDatabases?.filter(
          (db) => db.name !== database
        );
      }

      return result;
    }
  }

  /**
   * Finds one document from a collection.
   * @async
   * @param database name of the database.
   * @param collection name of the collection.
   * @param filter query to find operation.
   * @param options optional settings for the command.
   * @returns a document.
   *
   * @throws If arguments are not of the expected type.
   */
  async findOne(
    database: string,
    collection: string,
    filter = {},
    options = {}
  ) {
    try {
      this.validateArgs({ database, collection });
    } catch (error: any) {
      throw Error(error.message);
    }

    if (this.#client) {
      const document = await this.#client
        .db(database)
        .collection(collection)
        .findOne(filter, options);

      return document;
    }
    return {};
  }

  /**
   * Updates documents.
   *
   * @async
   * @param database name of the database.
   * @param collection name of the collection.
   * @param filter query to filter values to be updated.
   * @param update changes to be applied to the documents.
   * @param options options passed to the update action.
   * @param many whether to update many documents.
   * @returns result of the update.
   *
   * @throws If arguments are not of the expected type.
   * @throws If the update operation is not successful.
   */
  async updateDocument(
    database: string,
    collection: string,
    filter: {},
    update: {},
    options: {} = {},
    many: boolean = false
  ) {
    try {
      this.validateArgs({ database, collection });
    } catch (error: any) {
      throw Error(error.message);
    }

    if (this.#client) {
      try {
        const col = this.#client.db(database).collection(collection);

        return many
          ? await col.updateMany(filter, update, options)
          : await col.updateOne(filter, update, options);
      } catch (error: any) {
        console.log(error);
        throw new Error(error.message);
      }
    }
  }

  /**
   * Deletes documents.
   *
   * @async
   * @param database name of the database.
   * @param collection name of the collection.
   * @param filter query to filter values to be deleted.
   * @param options options passed to the delete action.
   * @param many whether to delete many documents.
   * @returns result of the delete operation.
   *
   * @throws If arguments are not of the expected type.
   * @throws If the delete operation is not successful.
   */
  async deleteDocument(
    database: string,
    collection: string,
    filter: {},
    options = {},
    many: boolean = false
  ) {
    try {
      this.validateArgs({ database, collection });
    } catch (error: any) {
      throw Error(error.message);
    }

    if (this.#client) {
      try {
        const col = this.#client.db(database).collection(collection);

        return many
          ? await col.deleteMany(filter, options)
          : await col.deleteOne(filter, options);
      } catch (error: any) {
        console.log(error);
        throw new Error(error.message);
      }
    }
  }

  /**
   * Finds the number of documents in a collection.
   *
   * @param database name of the database.
   * @param collection name of the collection.
   * @param filter filter for the count.
   * @param options optional settings for the count command.
   * @returns number of documents in the collection.
   *
   * @throws If arguments are not of the expected type.
   */
  async countDocuments(
    database: string,
    collection: string,
    filter = {},
    options = {}
  ) {
    try {
      this.validateArgs({ database, collection });
    } catch (error: any) {
      throw Error(error.message);
    }

    if (this.#client) {
      return await this.#client
        .db(database)
        .collection(collection)
        .countDocuments(filter, options);
    }
    return 0;
  }
}

let clientInstance = new Client();

export default clientInstance;
