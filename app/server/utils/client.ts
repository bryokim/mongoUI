import { MongoClient } from "mongodb";
import { parseUri } from "./parse";

interface connectionOptions {
  uri: string;
  name: string;
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
        this._client = new MongoClient(options.uri);
        this._client && (await this._client.connect());
      } catch (error: any) {
        throw new Error(error.message);
      }

      this._name = options.name;
      this._uri = options.uri;
      this._user = parseUri(options.uri).user;
    } else {
      console.log("Client already assigned");
    }
  }

  /**
   * Closes the mongodb connection and set the class properties to undefined.
   *
   * @async
   */
  async closeClient() {
    if (this._client) {
      await this._client.close();

      this._client = undefined;
      this._uri = undefined;
      this._name = undefined;
      this._user = undefined;
    }
  }
}

let clientInstance = new Client();

export default clientInstance;
