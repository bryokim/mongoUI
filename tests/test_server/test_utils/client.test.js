import {
  afterEach,
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { config } from "dotenv";
import { MongoClient } from "mongodb";

import clientInstance from "~/server/utils/client";
import { parseUri } from "~/server/utils/parse";

config();

describe("client", () => {
  const connectionOptions = {
    name: "__test__",
    uri: process.env.TEST_URI,
    user: process.env.TEST_USER,
  };

  describe("expect properties to be undefined if client is undefined", () => {
    it("client values are undefined at initialization", () => {
      expect(clientInstance.client).to.be.undefined;
      expect(clientInstance.uri).to.be.undefined;
      expect(clientInstance.name).to.be.undefined;
      expect(clientInstance.user).to.be.undefined;
    });
  });

  describe("setClient", () => {
    afterEach(async () => {
      await clientInstance.clearCurrentClient();
      vi.restoreAllMocks();
    });

    it("using valid connection options creates a mongodb connection and sets properties", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).to.be.instanceOf(MongoClient);
      expect(clientInstance.name).to.equal(connectionOptions.name);
      expect(clientInstance.uri).to.equal(connectionOptions.uri);
      expect(clientInstance.user).to.equal(
        parseUri(connectionOptions.uri).user
      );
      expect(clientInstance.emptyDatabases).toEqual([]);
    });

    it("connection options missing uri throws error", async () => {
      expect(
        async () => await clientInstance.setClient({ name: "__invalid_test__" })
      ).rejects.toThrowError("Must provide uri");
      expect(clientInstance.client).to.be.undefined;
      expect(clientInstance.name).to.be.undefined;
      expect(clientInstance.uri).to.be.undefined;
      expect(clientInstance.user).to.be.undefined;
      expect(clientInstance.emptyDatabases).to.be.undefined;
    });

    it("connection options missing name throws error", async () => {
      expect(
        async () =>
          await clientInstance.setClient({ uri: process.env.TEST_URI })
      ).rejects.toThrowError("Must provide name");
      expect(clientInstance.client).to.be.undefined;
      expect(clientInstance.name).to.be.undefined;
      expect(clientInstance.uri).to.be.undefined;
      expect(clientInstance.user).to.be.undefined;
      expect(clientInstance.emptyDatabases).to.be.undefined;
    });

    it("calling setClient more than once doesn't create a new client", async () => {
      const spy = vi.spyOn(console, "log").mockImplementation(() => {});

      await clientInstance.setClient(connectionOptions);
      await clientInstance.setClient(connectionOptions);

      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith("Client already assigned");
    });

    it("using invalid uri throws an error", async () => {
      const spy = vi.spyOn(clientInstance, "closeClient");

      expect(
        async () =>
          await clientInstance.setClient({
            name: "__test__",
            uri: "invalid_uri",
          })
      ).rejects.toThrowError();

      expect(spy).toHaveBeenCalledOnce();
    });
  });

  describe("closeClient", () => {
    afterEach(async () => {
      await clientInstance.clearCurrentClient();
      vi.restoreAllMocks();
    });

    it("closing a defined client", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).to.be.instanceOf(MongoClient);

      const spy = vi.spyOn(clientInstance.client, "close");
      await clientInstance.closeClient();

      expect(spy).toHaveBeenCalledOnce();
    });

    it("undefined client raises no error", async () => {
      expect(clientInstance.client).to.be.undefined;

      await clientInstance.closeClient();
    });
  });

  describe("clearCurrentClient", async () => {
    afterEach(async () => {
      await clientInstance.clearCurrentClient();
      vi.restoreAllMocks();
    });

    it("clearing a defined client closes client and unsets all properties.", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).to.be.instanceOf(MongoClient);

      const spy = vi.spyOn(clientInstance, "closeClient");

      await clientInstance.clearCurrentClient();
      expect(spy).toHaveBeenCalledOnce();

      expect(clientInstance.client).to.be.undefined;
      expect(clientInstance.name).to.be.undefined;
      expect(clientInstance.uri).to.be.undefined;
      expect(clientInstance.user).to.be.undefined;
      expect(clientInstance.emptyDatabases).to.be.undefined;
    });

    it("clearing an undefined client raises no errors", async () => {
      expect(clientInstance.client).to.be.undefined;

      const spy = vi.spyOn(clientInstance, "closeClient");

      await clientInstance.clearCurrentClient();
      expect(spy).toHaveBeenCalledOnce();

      expect(clientInstance.client).to.be.undefined;
      expect(clientInstance.name).to.be.undefined;
      expect(clientInstance.uri).to.be.undefined;
      expect(clientInstance.user).to.be.undefined;
      expect(clientInstance.emptyDatabases).to.be.undefined;
    });
  });

  describe("databases", () => {
    afterEach(async () => {
      await clientInstance.clearCurrentClient();
      vi.restoreAllMocks();
    });

    it("undefined client returns empty array", async () => {
      expect(clientInstance.client).to.be.undefined;

      const databases = await clientInstance.databases();
      expect(databases).toEqual([]);
    });

    it("defined client returns found databases", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).to.be.instanceOf(MongoClient);

      const spy = vi
        .spyOn(clientInstance.client, "db")
        .mockImplementation(() => ({
          admin() {
            return {
              listDatabases() {
                return { databases: [{ name: "db_1" }, { name: "db_2" }] };
              },
            };
          },
        }));

      const databases = await clientInstance.databases();

      expect(databases).toEqual(["db_1", "db_2"]);
      expect(spy).toHaveBeenCalledOnce();
    });
  });

  describe("collections", () => {
    const mockDatabases = [
      { name: "db_1", collections: [{ name: "col_1" }, { name: "col_2" }] },
      { name: "db_2", collections: [{ name: "col_3" }, { name: "col_4" }] },
    ];

    beforeEach(async () => {
      await clientInstance.setClient(connectionOptions);
      vi.spyOn(clientInstance.client, "db").mockImplementation((database) => ({
        listCollections() {
          return {
            toArray() {
              return mockDatabases.some((db) => db.name === database)
                ? mockDatabases.filter((db) => db.name === database)[0]
                    .collections
                : [];
            },
          };
        },
      }));
    });

    afterEach(async () => {
      await clientInstance.clearCurrentClient();
      vi.restoreAllMocks();
    });

    it("undefined client, valid database returns empty array", async () => {
      await clientInstance.clearCurrentClient();
      expect(clientInstance.client).to.be.undefined;

      const collections = await clientInstance.collections(
        mockDatabases[0].name
      );

      expect(collections).toEqual([]);
    });

    it("defined client, valid database return collections in database", async () => {
      expect(clientInstance.client).to.be.instanceOf(MongoClient);

      const collections = await clientInstance.collections(
        mockDatabases[0].name
      );

      expect(collections).toEqual(
        mockDatabases[0].collections.map((col) => col.name)
      );
    });

    it("defined client, invalid database returns empty array", async () => {
      expect(clientInstance.client).to.be.instanceOf(MongoClient);

      const collections = await clientInstance.collections(
        "__invalid_database__"
      );

      expect(collections).toEqual([]);
    });

    it("database not a string throws an error", async () => {
      expect(
        async () => await clientInstance.collections()
      ).rejects.toThrowError("database must be a string");

      expect(
        async () => await clientInstance.collections(["database"])
      ).rejects.toThrowError("database must be a string");

      expect(
        async () => await clientInstance.collections(123)
      ).rejects.toThrowError("database must be a string");
    });
  });

  describe("userRoles", () => {
    let mockClient;

    afterEach(async () => {
      await clientInstance.clearCurrentClient();
    });

    afterAll(async () => {
      if (mockClient) await mockClient.close();
    });

    it("undefined client returns empty array", async () => {
      expect(clientInstance.client).to.be.undefined;

      const roles = await clientInstance.userRoles();

      expect(roles).toEqual([]);
    });

    it("defined client returns array of roles user has in different databases", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).to.be.instanceOf(MongoClient);

      const expectedRoles = [];

      try {
        mockClient = new MongoClient(connectionOptions.uri);

        await mockClient.connect();

        expectedRoles.push(
          ...(
            await mockClient
              .db()
              .admin()
              .command({
                usersInfo: { user: connectionOptions.user, db: "admin" },
              })
          ).users[0].roles
        );
      } catch (error) {
        console.error(`error: ${error.message}`);
      }

      const roles = await clientInstance.userRoles();

      expect(roles).toEqual(expectedRoles);
    });
  });

  describe("getUserRolesInDb", () => {
    const mockRoles = [
      {
        db: "db_1",
        role: "admin",
      },
      {
        db: "db_2",
        role: "read",
      },
      {
        db: "db_2",
        role: "write",
      },
      {
        db: "db_2",
        role: "userAdmin",
      },
    ];

    it("filters roles effectively", () => {
      const database = "db_1";

      const db_1Roles = clientInstance.getUserRolesInDb(database, mockRoles);

      expect(db_1Roles).toEqual(
        mockRoles
          .filter((role) => role.db === database)
          .map((role) => role.role)
      );
    });

    it("roles missing db or role property returns empty array", () => {
      expect(
        clientInstance.getUserRolesInDb("db", [{ name: "role", role: "admin" }])
      ).toEqual([]);
    });

    it("roles as an array of strings or numbers returns empty array", () => {
      expect(clientInstance.getUserRolesInDb("db", ["admin", "read"])).toEqual(
        []
      );
      expect(clientInstance.getUserRolesInDb("db", [1, 2, 4])).toEqual([]);
    });

    it("if database is not a string throws an error", () => {
      expect(() =>
        clientInstance.getUserRolesInDb(["db"], [1, 2, 4])
      ).toThrowError("database must be a string");
    });

    it("if roles is not an array throws an error", () => {
      expect(() => clientInstance.getUserRolesInDb("db", 1)).toThrowError(
        "roles must be an array"
      );
    });
  });

  describe("dbsInfo", () => {
    beforeEach(async () => {
      vi.spyOn(clientInstance, "databases").mockReturnValue(["db_1", "db_2"]);
      vi.spyOn(clientInstance, "collections").mockReturnValue([
        "col_1",
        "col_2",
      ]);
      vi.spyOn(clientInstance, "userRoles").mockReturnValue([
        {
          db: "db_1",
          role: "admin",
        },
        {
          db: "db_2",
          role: "read",
        },
        {
          db: "db_2",
          role: "write",
        },
        {
          db: "local", // Should not be in dbsInfo return value.
          role: "admin",
        },
        {
          db: "config", // Should not be in dbsInfo return value
          role: "admin",
        },
      ]);
    });

    afterEach(async () => {
      await clientInstance.clearCurrentClient();
    });

    afterAll(() => {
      vi.restoreAllMocks();
    });

    it("undefined client returns empty array for both empty and nonEmpty dbs", async () => {
      expect(clientInstance.client).to.be.undefined;

      const dbInfo = await clientInstance.dbsInfo();

      expect(dbInfo.empty).toBeUndefined;
      expect(dbInfo.nonEmpty).toEqual([]);
    });

    it("defined client returns empty array for empty and populates nonEmpty from dbs in mongodb", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).toBeInstanceOf(MongoClient);

      const dbInfo = await clientInstance.dbsInfo();

      expect(dbInfo.empty).toEqual([]);
      expect(dbInfo.nonEmpty).toEqual([
        { name: "db_1", collections: ["col_1", "col_2"], roles: ["admin"] },
        {
          name: "db_2",
          collections: ["col_1", "col_2"],
          roles: ["read", "write"],
        },
      ]);
    });

    it("defined client but no databases found returns empty arrays for empty and nonEmpty", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).toBeInstanceOf(MongoClient);

      vi.spyOn(clientInstance, "databases").mockReset();
      vi.spyOn(clientInstance, "databases").mockReturnValue([]);

      const dbInfo = await clientInstance.dbsInfo();

      expect(dbInfo.nonEmpty).toEqual([]);
      expect(dbInfo.empty).toEqual([]);
    });
  });

  describe("addDatabase", () => {
    const mockDatabase = {
      name: "__test_database__",
      collections: ["__test_collection__"],
    };

    afterEach(async () => {
      await clientInstance.clearCurrentClient();
    });

    it("does not add database if client is undefined", () => {
      expect(clientInstance.client).toBeUndefined();
      expect(clientInstance.emptyDatabases).toBeUndefined();

      clientInstance.addDatabase(
        mockDatabase.name,
        mockDatabase.collections[0]
      );

      expect(clientInstance.emptyDatabases).toBeUndefined();
    });

    it("adds new database if client is defined", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).toBeInstanceOf(MongoClient);
      expect(clientInstance.emptyDatabases).toEqual([]);

      clientInstance.addDatabase(
        mockDatabase.name,
        mockDatabase.collections[0]
      );

      expect(clientInstance.emptyDatabases).toEqual([mockDatabase]);
    });

    it("does not add an already existing database", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).toBeInstanceOf(MongoClient);
      expect(clientInstance.emptyDatabases).toEqual([]);

      // Adding database with same name twice.
      clientInstance.addDatabase(
        mockDatabase.name,
        mockDatabase.collections[0]
      );

      clientInstance.addDatabase(
        mockDatabase.name,
        mockDatabase.collections[0]
      );

      expect(clientInstance.emptyDatabases).toEqual([mockDatabase]);
    });

    it("throws error if arguments are not strings", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).toBeInstanceOf(MongoClient);

      expect(() => clientInstance.addDatabase()).toThrowError(
        "database must be a string"
      );
      expect(() => clientInstance.addDatabase(["one"])).toThrowError(
        "database must be a string"
      );

      expect(() => clientInstance.addDatabase("database_name")).toThrowError(
        "collection must be a string"
      );

      expect(() =>
        clientInstance.addDatabase("database_name", ["collection"])
      ).toThrowError("collection must be a string");
    });
  });

  describe("dropDatabase", () => {
    const mockDatabase = {
      name: "__test_database__",
      collections: ["__test_collection__"],
    };

    afterEach(async () => {
      await clientInstance.clearCurrentClient();
      vi.resetAllMocks();
    });

    it("returns true if client is undefined", async () => {
      expect(clientInstance.client).toBeUndefined;

      const dropped = await clientInstance.dropDatabase("database");

      expect(dropped).toBeTruthy;
    });

    it("dropping an empty database removes it from the emptyDatabases", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).toBeInstanceOf(MongoClient);

      clientInstance.addDatabase(
        mockDatabase.name,
        mockDatabase.collections[0]
      );
      expect(clientInstance.emptyDatabases).toEqual([mockDatabase]);

      const dropped = await clientInstance.dropDatabase(mockDatabase.name);
      expect(dropped).toBeTruthy;

      // Empty database removed.
      expect(clientInstance.emptyDatabases).toEqual([]);
    });

    it("dropping a non-empty database removes it from mongodb", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).toBeInstanceOf(MongoClient);

      const spy = vi
        .spyOn(clientInstance.client, "db")
        .mockImplementation(() => ({
          dropDatabase() {
            return;
          },
        }));

      const dropped = await clientInstance.dropDatabase(mockDatabase.name);
      expect(dropped).toBeTruthy;

      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith(mockDatabase.name);
    });

    it("database is not a string or missing throws an error", async () => {
      expect(
        async () => await clientInstance.dropDatabase()
      ).rejects.toThrowError("database must be a string");

      expect(
        async () => await clientInstance.dropDatabase(2)
      ).rejects.toThrowError("database must be a string");

      expect(
        async () => await clientInstance.dropDatabase([2])
      ).rejects.toThrowError("database must be a string");
    });

    it("returns true if database does not exist", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).toBeInstanceOf(MongoClient);

      const dropped = await clientInstance.dropDatabase(
        "__database_not_found__"
      );
      expect(dropped).toBeTruthy;
    });
  });

  describe("createCollection", () => {
    const mockDatabase = {
      name: "__test_database__",
      collections: ["__test_collection__"],
    };

    afterEach(async () => {
      await clientInstance.clearCurrentClient();
      vi.restoreAllMocks();
    });

    it("returns true if client is undefined", async () => {
      expect(clientInstance.client).toBeUndefined;

      const created = await clientInstance.createCollection(
        mockDatabase.name,
        mockDatabase.collections[0]
      );

      expect(created).toBeTruthy;
    });

    it("creating new collection in an empty database", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).toBeInstanceOf(MongoClient);

      // Add empty database
      clientInstance.addDatabase(
        mockDatabase.name,
        mockDatabase.collections[0]
      );
      expect(clientInstance.emptyDatabases).toEqual([mockDatabase]);

      // Create new collection
      const created = clientInstance.createCollection(
        mockDatabase.name,
        "__new_collection__"
      );
      expect(created).toBeTruthy;
      expect(clientInstance.emptyDatabases).toEqual([
        {
          name: mockDatabase.name,
          collections: [...mockDatabase.collections, "__new_collection__"],
        },
      ]);
    });

    it("creating new collection in a non-empty database", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).toBeInstanceOf(MongoClient);

      const spy = vi
        .spyOn(clientInstance.client, "db")
        .mockImplementation((database) => ({
          createCollection(collection) {},
        }));

      const created = await clientInstance.createCollection(
        mockDatabase.name,
        mockDatabase.collections[0]
      );

      expect(created).toBeTruthy;
      expect(spy).toHaveBeenCalledWith(mockDatabase.name);
    });

    it("database not a string or not provided throws an error", () => {
      expect(
        async () => await clientInstance.createCollection()
      ).rejects.toThrowError("database must be a string");

      expect(
        async () => await clientInstance.createCollection(1)
      ).rejects.toThrowError("database must be a string");

      expect(
        async () => await clientInstance.createCollection([1])
      ).rejects.toThrowError("database must be a string");
    });

    it("collection not a string or not provided throws an error", () => {
      expect(
        async () => await clientInstance.createCollection(mockDatabase.name)
      ).rejects.toThrowError("collection must be a string");

      expect(
        async () => await clientInstance.createCollection(mockDatabase.name, 1)
      ).rejects.toThrowError("collection must be a string");

      expect(
        async () =>
          await clientInstance.createCollection(mockDatabase.name, [1])
      ).rejects.toThrowError("collection must be a string");
    });
  });

  describe("findDocuments", () => {
    const mockDatabase = {
      name: "__test_database__",
      collections: ["__test_collection__"],
    };

    afterEach(async () => {
      await clientInstance.clearCurrentClient();
      vi.restoreAllMocks();
    });

    it("returns empty array if client is undefined", async () => {
      expect(clientInstance.client).toBeUndefined;

      const documents = await clientInstance.findDocuments(
        mockDatabase.name,
        mockDatabase.collections[0],
        {}
      );

      expect(documents).toEqual([]);
    });

    it("returns documents in given database and collection if client is defined", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).toBeInstanceOf(MongoClient);

      const spy = vi
        .spyOn(clientInstance.client, "db")
        .mockImplementation(() => ({
          collection(col) {
            return {
              find(filter) {
                return {
                  toArray() {
                    return [col, filter];
                  },
                };
              },
            };
          },
        }));

      const documents = await clientInstance.findDocuments(
        mockDatabase.name,
        mockDatabase.collections[0],
        {}
      );
      expect(documents).toEqual([mockDatabase.collections[0], {}]);
      expect(spy).toHaveBeenCalledWith(mockDatabase.name);
    });

    it("database not a string or not provided throws an error", () => {
      expect(
        async () => await clientInstance.findDocuments()
      ).rejects.toThrowError("database must be a string");

      expect(
        async () => await clientInstance.findDocuments(1)
      ).rejects.toThrowError("database must be a string");

      expect(
        async () => await clientInstance.findDocuments([1])
      ).rejects.toThrowError("database must be a string");
    });

    it("collection not a string or not provided throws an error", () => {
      expect(
        async () => await clientInstance.findDocuments(mockDatabase.name)
      ).rejects.toThrowError("collection must be a string");

      expect(
        async () => await clientInstance.findDocuments(mockDatabase.name, 1)
      ).rejects.toThrowError("collection must be a string");

      expect(
        async () => await clientInstance.findDocuments(mockDatabase.name, [1])
      ).rejects.toThrowError("collection must be a string");
    });
  });

  describe("insertDocument", () => {
    const mockDatabase = {
      name: "__test_database__",
      collections: ["__test_collection__"],
    };

    const mockDocument = {
      name: "__test_doc__",
      age: "__major__",
    };

    afterEach(async () => {
      await clientInstance.clearCurrentClient();
      vi.restoreAllMocks();
    });

    it("undefined client", () => {
      expect(clientInstance.client).toBeUndefined;

      const result = clientInstance.insertDocument(
        mockDatabase.name,
        mockDatabase.collections[0],
        mockDocument
      );

      expect(result).toBeUndefined;
    });

    it("inserting one document", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).toBeInstanceOf(MongoClient);

      const spy = vi
        .spyOn(clientInstance.client, "db")
        .mockImplementation(() => ({
          collection(col) {
            return {
              insertOne(document) {
                return {
                  col,
                  document,
                };
              },
            };
          },
        }));

      const result = await clientInstance.insertDocument(
        mockDatabase.name,
        mockDatabase.collections[0],
        mockDocument
      );

      expect(result).toEqual({
        col: mockDatabase.collections[0],
        document: mockDocument,
      });
      expect(spy).toHaveBeenCalledWith(mockDatabase.name);
    });

    it("inserting many documents", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).toBeInstanceOf(MongoClient);

      const spy = vi
        .spyOn(clientInstance.client, "db")
        .mockImplementation(() => ({
          collection(col) {
            return {
              insertMany(documents) {
                return {
                  col,
                  documents,
                };
              },
            };
          },
        }));

      const result = await clientInstance.insertDocument(
        mockDatabase.name,
        mockDatabase.collections[0],
        [mockDocument, mockDocument]
      );

      expect(result).toEqual({
        col: mockDatabase.collections[0],
        documents: [mockDocument, mockDocument],
      });
      expect(spy).toHaveBeenCalledWith(mockDatabase.name);
    });

    it("empty database is removed from emptyDatabases when document is inserted", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).toBeInstanceOf(MongoClient);

      const spy = vi
        .spyOn(clientInstance.client, "db")
        .mockImplementation(() => ({
          collection(col) {
            return {
              insertOne(document) {
                return {
                  col,
                  document,
                };
              },
            };
          },
        }));

      // Add empty database.
      clientInstance.addDatabase(
        mockDatabase.name,
        mockDatabase.collections[0]
      );
      expect(clientInstance.emptyDatabases).toEqual([mockDatabase]);

      // Insert into empty database.
      const result = await clientInstance.insertDocument(
        mockDatabase.name,
        mockDatabase.collections[0],
        mockDocument
      );

      expect(result).toEqual({
        col: mockDatabase.collections[0],
        document: mockDocument,
      });
      expect(spy).toHaveBeenCalledOnce();
      // Database removed from emptyDatabases.
      expect(clientInstance.emptyDatabases).toEqual([]);
    });

    it("database is not a string or not provided throws an error", () => {
      expect(async () => clientInstance.insertDocument()).rejects.toThrowError(
        "database must be a string"
      );

      expect(async () => clientInstance.insertDocument(1)).rejects.toThrowError(
        "database must be a string"
      );

      expect(async () =>
        clientInstance.insertDocument([1])
      ).rejects.toThrowError("database must be a string");
    });

    it("collection is not a string or not provided throws an error", () => {
      expect(async () =>
        clientInstance.insertDocument(mockDatabase.name)
      ).rejects.toThrowError("collection must be a string");

      expect(async () =>
        clientInstance.insertDocument(mockDatabase.name, 1)
      ).rejects.toThrowError("collection must be a string");

      expect(async () =>
        clientInstance.insertDocument(mockDatabase.name, [1])
      ).rejects.toThrowError("collection must be a string");
    });
  });

  describe("updateDocument", () => {
    const mockDatabase = {
      name: "__test_database__",
      collections: ["__test_collection__"],
    };

    const mockUpdate = {
      $set: { name: "__test_doc__", age: "__major__" },
    };

    const mockOptions = {
      upsert: true,
    };

    afterEach(async () => {
      await clientInstance.clearCurrentClient();
      vi.restoreAllMocks();
    });

    it("returns undefined if client is undefined", async () => {
      expect(clientInstance.client).toBeUndefined;

      const result = await clientInstance.updateDocument(
        mockDatabase.name,
        mockDatabase.collections[0],
        {},
        mockUpdate
      );

      expect(result).toBeUndefined;
    });

    it("update one document", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).toBeInstanceOf(MongoClient);

      const spy = vi
        .spyOn(clientInstance.client, "db")
        .mockImplementation(() => ({
          collection(col) {
            return {
              updateOne(filter, update, options) {
                return {
                  col,
                  filter,
                  update,
                  options,
                };
              },
            };
          },
        }));

      const result = await clientInstance.updateDocument(
        mockDatabase.name,
        mockDatabase.collections[0],
        {},
        mockUpdate,
        mockOptions
      );
      expect(result).toEqual({
        col: mockDatabase.collections[0],
        filter: {},
        update: mockUpdate,
        options: mockOptions,
      });
      expect(spy).toHaveBeenCalledWith(mockDatabase.name);
    });

    it("update many documents", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).toBeInstanceOf(MongoClient);

      const spy = vi
        .spyOn(clientInstance.client, "db")
        .mockImplementation(() => ({
          collection(col) {
            return {
              updateMany(filter, update, options) {
                return {
                  col,
                  filter,
                  update,
                  options,
                };
              },
            };
          },
        }));

      const result = await clientInstance.updateDocument(
        mockDatabase.name,
        mockDatabase.collections[0],
        {},
        mockUpdate,
        mockOptions,
        true
      );
      expect(result).toEqual({
        col: mockDatabase.collections[0],
        filter: {},
        update: mockUpdate,
        options: mockOptions,
      });
      expect(spy).toHaveBeenCalledWith(mockDatabase.name);
    });

    it("database not a string or not provided throws an error", () => {
      expect(
        async () => await clientInstance.updateDocument()
      ).rejects.toThrowError("database must be a string");

      expect(
        async () => await clientInstance.updateDocument(1)
      ).rejects.toThrowError("database must be a string");

      expect(
        async () => await clientInstance.updateDocument([1])
      ).rejects.toThrowError("database must be a string");
    });

    it("collection not a string or not provided throws an error", () => {
      expect(
        async () => await clientInstance.updateDocument(mockDatabase.name)
      ).rejects.toThrowError("collection must be a string");

      expect(
        async () => await clientInstance.updateDocument(mockDatabase.name, 1)
      ).rejects.toThrowError("collection must be a string");

      expect(
        async () => await clientInstance.updateDocument(mockDatabase.name, [1])
      ).rejects.toThrowError("collection must be a string");
    });

    it("filter not a valid Javascript object", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).toBeInstanceOf(MongoClient);

      vi.spyOn(console, "log").mockImplementation(() => {});
      expect(
        clientInstance.updateDocument(
          mockDatabase.name,
          mockDatabase.collections[0],
          ["invalid_filter"]
        )
      ).rejects.toThrowError();

      expect(
        clientInstance.updateDocument(
          mockDatabase.name,
          mockDatabase.collections[0],
          "invalid_filter"
        )
      ).rejects.toThrowError();

      expect(
        clientInstance.updateDocument(
          mockDatabase.name,
          mockDatabase.collections[0],
          1
        )
      ).rejects.toThrowError();
    });

    it("update not a valid object throws an error", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).toBeInstanceOf(MongoClient);

      vi.spyOn(console, "log").mockImplementation(() => {});

      expect(
        clientInstance.updateDocument(
          mockDatabase.name,
          mockDatabase.collections[0],
          {},
          [1]
        )
      ).rejects.toThrowError();

      expect(
        clientInstance.updateDocument(
          mockDatabase.name,
          mockDatabase.collections[0],
          {},
          1
        )
      ).rejects.toThrowError();

      expect(
        clientInstance.updateDocument(
          mockDatabase.name,
          mockDatabase.collections[0],
          {},
          {}
        )
      ).rejects.toThrowError();
    });
  });

  describe("deleteDocument", () => {
    const mockDatabase = {
      name: "__test_database__",
      collections: ["__test_collection__"],
    };

    const mockFilter = {
      name: "__to_be_deleted__",
    };

    afterEach(async () => {
      await clientInstance.clearCurrentClient();
      vi.restoreAllMocks();
    });

    it("returns undefined if client is undefined", async () => {
      expect(clientInstance.client).toBeUndefined;

      const result = await clientInstance.deleteDocument(
        mockDatabase.name,
        mockDatabase.collections[0],
        mockFilter
      );

      expect(result).toBeUndefined;
    });

    it("deleting a single document", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).toBeInstanceOf(MongoClient);

      const spy = vi
        .spyOn(clientInstance.client, "db")
        .mockImplementation(() => ({
          collection(col) {
            return {
              deleteOne(filter, options) {
                return {
                  col,
                  filter,
                  options,
                };
              },
            };
          },
        }));

      const result = await clientInstance.deleteDocument(
        mockDatabase.name,
        mockDatabase.collections[0],
        mockFilter
      );

      expect(result).toEqual({
        col: mockDatabase.collections[0],
        filter: mockFilter,
        options: {},
      });
      expect(spy).toHaveBeenCalledWith(mockDatabase.name);
    });

    it("deleting multiple documents", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).toBeInstanceOf(MongoClient);

      const spy = vi
        .spyOn(clientInstance.client, "db")
        .mockImplementation(() => ({
          collection(col) {
            return {
              deleteMany(filter, options) {
                return {
                  col,
                  filter,
                  options,
                };
              },
            };
          },
        }));

      const result = await clientInstance.deleteDocument(
        mockDatabase.name,
        mockDatabase.collections[0],
        mockFilter,
        {},
        true
      );

      expect(result).toEqual({
        col: mockDatabase.collections[0],
        filter: mockFilter,
        options: {},
      });
      expect(spy).toHaveBeenCalledWith(mockDatabase.name);
    });

    it("database not a string or not provided throws an error", () => {
      expect(
        async () => await clientInstance.deleteDocument()
      ).rejects.toThrowError("database must be a string");

      expect(
        async () => await clientInstance.deleteDocument(1)
      ).rejects.toThrowError("database must be a string");

      expect(
        async () => await clientInstance.deleteDocument([1])
      ).rejects.toThrowError("database must be a string");
    });

    it("collection not a string or not provided throws an error", () => {
      expect(
        async () => await clientInstance.deleteDocument(mockDatabase.name)
      ).rejects.toThrowError("collection must be a string");

      expect(
        async () => await clientInstance.deleteDocument(mockDatabase.name, 1)
      ).rejects.toThrowError("collection must be a string");

      expect(
        async () => await clientInstance.deleteDocument(mockDatabase.name, [1])
      ).rejects.toThrowError("collection must be a string");
    });

    it("filter not a valid Javascript object", async () => {
      await clientInstance.setClient(connectionOptions);
      expect(clientInstance.client).toBeInstanceOf(MongoClient);

      vi.spyOn(console, "log").mockImplementation(() => {});
      expect(
        clientInstance.deleteDocument(
          mockDatabase.name,
          mockDatabase.collections[0],
          ["invalid_filter"]
        )
      ).rejects.toThrowError();

      expect(
        clientInstance.deleteDocument(
          mockDatabase.name,
          mockDatabase.collections[0],
          "invalid_filter"
        )
      ).rejects.toThrowError();

      expect(
        clientInstance.deleteDocument(
          mockDatabase.name,
          mockDatabase.collections[0],
          1
        )
      ).rejects.toThrowError();
    });
  });
});
