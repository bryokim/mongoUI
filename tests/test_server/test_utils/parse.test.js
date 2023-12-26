import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { parseUri, parseRoles } from "~/server/utils/parse";
import clientInstance from "~/server/utils/client";

describe("parseUri", () => {
  const validUri = "mongodb://user:pass@localhost:27017";
  const validUri2 = "mongodb+srv://user:pass@localhost:27017";
  const validUriWithParams =
    "mongodb://user:pass@localhost:27017?key1=value1&key2=value2";

  it("valid uri format returns an object of parsed properties", () => {
    const parsedUri = parseUri(validUri);

    expect(parsedUri).toEqual({
      scheme: "mongodb",
      user: "user",
      password: "pass",
      host: "localhost",
      port: 27017,
      params: {},
    });

    const parsedUri2 = parseUri(validUri2);

    expect(parsedUri2).toEqual({
      scheme: "mongodb+srv",
      user: "user",
      password: "pass",
      host: "localhost",
      port: 27017,
      params: {},
    });
  });

  it("if uri contains parameters they are also parsed", () => {
    const parsedUri = parseUri(validUriWithParams);

    expect(parsedUri).toEqual({
      scheme: "mongodb",
      user: "user",
      password: "pass",
      host: "localhost",
      port: 27017,
      params: { key1: "value1", key2: "value2" },
    });
  });

  it("uri missing scheme returns error", () => {
    const parsedUri = parseUri("user:pass@localhost:27017");

    expect(parsedUri).toEqual({
      error: "Invalid uri format",
    });
  });

  it("uri missing user returns error", () => {
    const parsedUri = parseUri("mongodb://:pass@localhost:27017");

    expect(parsedUri).toEqual({
      error: "Invalid uri format",
    });
  });

  it("uri missing pass returns error", () => {
    const parsedUri = parseUri("mongodb://user:@localhost:27017");

    expect(parsedUri).toEqual({
      error: "Invalid uri format",
    });
  });

  it("uri missing host returns error", () => {
    const parsedUri = parseUri("mongodb://user:pass@:27017");

    expect(parsedUri).toEqual({
      error: "Invalid uri format",
    });
  });

  it("uri missing port does not return error", () => {
    const parsedUri = parseUri("mongodb://user:pass@localhost");

    expect(parsedUri).toEqual({
      scheme: "mongodb",
      user: "user",
      password: "pass",
      host: "localhost",
      port: NaN,
      params: {},
    });
  });

  it("uri is not a string", () => {
    const parsedUri = parseUri(["uri"]);

    expect(parsedUri).toEqual({ error: "Invalid uri format" });
  });
});

describe("parseRoles", () => {
  const superUser = {
    superuser: true,
    dropDatabases: [],
    collections: [],
    readDocument: [],
    writeDocument: [],
  };

  beforeEach(() => {
    vi.spyOn(clientInstance, "databases").mockReturnValue([
      "db_1",
      "db_2",
      "admin",
      "local",
      "config",
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("root role is superuser", async () => {
    const mockRoles = [
      {
        role: "root",
        db: "db_1",
      },
    ];

    const parsedRoles = await parseRoles(mockRoles);

    expect(parsedRoles).toEqual(superUser);
  });

  it("atlasAdmin role is superuser", async () => {
    const mockRoles = [
      {
        role: "atlasAdmin",
        db: "db_1",
      },
    ];

    const parsedRoles = await parseRoles(mockRoles);

    expect(parsedRoles).toEqual(superUser);
  });

  it("dbOwner role on admin database is superuser", async () => {
    const mockRoles = [
      {
        role: "dbOwner",
        db: "admin",
      },
    ];

    const parsedRoles = await parseRoles(mockRoles);

    expect(parsedRoles).toEqual(superUser);
  });

  it("dbOwner role not on admin database is not superuser", async () => {
    const mockRoles = [
      {
        role: "dbOwner",
        db: "db_1",
      },
    ];

    const parsedRoles = await parseRoles(mockRoles);

    expect(parsedRoles).toEqual({
      superuser: false,
      dropDatabases: ["db_1"],
      collections: ["db_1"],
      readDocument: ["db_1"],
      writeDocument: ["db_1"],
    });
  });

  it("dbAdmin role on a db has readWrite & dropDatabase permissions on that db", async () => {
    const mockRoles = [
      {
        role: "dbAdmin",
        db: "db_1",
      },
    ];

    const parsedRoles = await parseRoles(mockRoles);

    expect(parsedRoles).toEqual({
      superuser: false,
      dropDatabases: ["db_1"],
      collections: ["db_1"],
      readDocument: ["db_1"],
      writeDocument: ["db_1"],
    });
  });

  it("dbAdminAnyDatabase role has readWrite & dropDatabase on all dbs except local and config and can create new db", async () => {
    const mockRoles = [
      {
        role: "dbAdminAnyDatabase",
        db: "db_1",
      },
    ];

    const parsedRoles = await parseRoles(mockRoles);

    expect(parsedRoles).toEqual({
      superuser: false,
      createDatabase: true,
      dropDatabases: ["db_1", "db_2", "admin"],
      collections: ["db_1", "db_2", "admin"],
      readDocument: ["db_1", "db_2", "admin"],
      writeDocument: ["db_1", "db_2", "admin"],
    });
  });

  it("read role on a db has read permission on that db", async () => {
    const mockRoles = [
      {
        role: "read",
        db: "db_2",
      },
    ];

    const parsedRoles = await parseRoles(mockRoles);

    expect(parsedRoles).toEqual({
      superuser: false,
      dropDatabases: [],
      collections: [],
      readDocument: ["db_2"],
      writeDocument: [],
    });
  });

  it("readAnyDatabase has read permission on all dbs except local and config", async () => {
    const mockRoles = [
      {
        role: "readAnyDatabase",
        db: "db_2",
      },
    ];

    const parsedRoles = await parseRoles(mockRoles);

    expect(parsedRoles).toEqual({
      superuser: false,
      dropDatabases: [],
      collections: [],
      readDocument: ["db_1", "db_2", "admin"],
      writeDocument: [],
    });
  });

  it("readWrite on a db has readWrite permissions on that db", async () => {
    const mockRoles = [
      {
        role: "readWrite",
        db: "db_2",
      },
    ];

    const parsedRoles = await parseRoles(mockRoles);

    expect(parsedRoles).toEqual({
      superuser: false,
      dropDatabases: [],
      collections: ["db_2"],
      readDocument: ["db_2"],
      writeDocument: ["db_2"],
    });
  });

  it("readWriteAnyDatabase has readWrite on all dbs except local and config and can create new db", async () => {
    const mockRoles = [
      {
        role: "readWriteAnyDatabase",
        db: "db_2",
      },
    ];

    const parsedRoles = await parseRoles(mockRoles);

    expect(parsedRoles).toEqual({
      superuser: false,
      createDatabase: true,
      dropDatabases: [],
      collections: ["db_1", "db_2", "admin"],
      readDocument: ["db_1", "db_2", "admin"],
      writeDocument: ["db_1", "db_2", "admin"],
    });
  });
});
