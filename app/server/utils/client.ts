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
  _uri?: string;

  /**
   * @property unique name given to the connection.
   */
  _name?: string;

  /**
   * @property authenticated user.
   */
  _user?: string;

  /**
   * @property instance of MongoClient created using given uri.
   */
  _client?: MongoClient;

  /**
   * @property new databases that are empty and are yet to be created
   * in the mongodb.
   */
  emptyDatabases?: DatabaseInfo[];

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
   * @property Retrieve the _client property.
   */
  get client() {
    return this._client;
  }

  /**
   * @property Retrieve the _uri property.
   */
  get uri() {
    return this._uri;
  }

  /**
   * @property Retrieve the _user property.
   */
  get user() {
    return this._user;
  }

  /**
   * @property Retrieve the _name property.
   */
  get name() {
    return this._name;
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

    if (!this._client) {
      try {
        this._client = new MongoClient(options.uri, {
          connectTimeoutMS: 5000,
          serverSelectionTimeoutMS: 5000,
        });

        await this._client?.connect();
      } catch (error: any) {
        await this.closeClient();
        this._client = undefined;
        throw new Error(error.message);
      }

      this._name = options.name;
      this._uri = options.uri;
      this._user = parseUri(options.uri).user;
      this.emptyDatabases = [];
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
    if (this._client) {
      await this._client.close();
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

    this._client = undefined;
    this._uri = undefined;
    this._name = undefined;
    this._user = undefined;
    this.emptyDatabases = undefined;
  }

  /**
   * Gets all databases on the client that the user has access to.
   *
   * @async
   *
   * @returns list of all databases.
   */
  async databases() {
    if (this._client) {
      return (await this._client?.db().admin().listDatabases())?.databases.map(
        (db) => db.name
      );
    }
    return [];
  }

  /**
   * Gets the roles that a user has in a certain database.
   *
   * @see Role
   * @async
   *
   * @param database name of the database.
   *
   * @returns list of roles that the user has.
   */
  async userRoles(database: string) {
    if (this._client) {
      const roles: Role[] = (
        await this._client
          .db()
          .admin()
          .command({ usersInfo: { user: this._user, db: "admin" } })
      ).users[0].roles;

      return roles
        .filter((role) => role.db === database)
        .map((role) => role.role);
    }

    return [];
  }

  /**
   * Gets database in the client and the collections found in the
   * databases. The user's roles in every database are also retrieved.
   *
   * @see DatabaseInfo
   *
   * @returns A list of objects of type `DatabaseInfo`.
   */
  async dbsInfo() {
    const databases = await this.databases();

    const dbsAndCols: AllDatabaseInfo = { nonEmpty: [], empty: [] };

    if (databases && this._client) {
      for (let database of databases) {
        const collectionObjects = await this._client
          .db(database)
          .listCollections()
          .toArray();

        const collections = collectionObjects.map((col) => col.name);

        const roles = await this.userRoles(database);

        dbsAndCols.nonEmpty?.push({
          name: database,
          collections,
          roles,
        });
      }
    }

    dbsAndCols.empty = this.emptyDatabases;

    return dbsAndCols;
  }

  /**
   * Adds a new database to the emptyDatabases array.
   * 
   * The database is not created on the mongodb until the first
   * document is added.
   * 
   * @param database name of the new database.
   * @param collection name of new collection.
   */
  addDatabase(database: string, collection: string) {
    if (!this.emptyDatabases?.some((db) => db.name === database)) {
      this.emptyDatabases?.push({ name: database, collections: [collection] });
    }
  }
}

let clientInstance = new Client();

export default clientInstance;
