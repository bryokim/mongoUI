import { AssignedRolesOnDbs } from "~/composables/useRolesInfo";
import clientInstance from "./client";

export type parsedUri = {
  scheme?: string;
  user?: string;
  password?: string;
  host?: string;
  port?: number;
  params?: { key: string; value: string }[];
  error?: string;
};

/**
 * Parses a mongodb connection uri into different parts.
 *
 * @param {string} uri mongodb connection uri.
 *
 * @returns {parsedUri} Object containing different parts of the uri or an error if uri is invalid.
 */

export const parseUri = (uri: string): parsedUri => {
  const re = /^(.+):\/\/(.+):(.+)@([^:?/]+)(:\d+)?([/?]+)?(.*)$/;

  const output = re.exec(uri);

  if (output) {
    return {
      scheme: output[1],
      user: output[2],
      password: output[3],
      host: output[4],
      port: parseInt(output[5]?.slice(1)),
      params: output[7]
        ?.split("&")
        .map((param) => {
          const [key, value] = param.split("=", 2);
          return { key, value };
        })
        .filter((param) => param.key),
    };
  } else {
    return {
      error: "Invalid uri format",
    };
  }
};

interface Role {
  role: string;
  db: string;
}

/**
 * Adds databases to their allowed actions.
 * 
 * @param parsedRoles parsedRoles object.
 * @param databases databases that are being added.
 * @param dropDatabases whether the dropDatabases action is to be added.
 */
function addDatabase(
  parsedRoles: AssignedRolesOnDbs,
  databases: string[],
  dropDatabases: boolean = false
) {
  if (dropDatabases)
    parsedRoles.dropDatabases?.push(
      ...databases.filter((db) => !parsedRoles.dropDatabases?.includes(db))
    );

  parsedRoles.collections?.push(
    ...databases.filter((db) => !parsedRoles.collections?.includes(db))
  );
  parsedRoles.readDocument?.push(
    ...databases.filter((db) => !parsedRoles.readDocument?.includes(db))
  );
  parsedRoles.writeDocument?.push(
    ...databases.filter((db) => !parsedRoles.writeDocument?.includes(db))
  );
}

/**
 * Parses the user roles to determine which actions the user can perform.
 *
 * @param roles list of roles.
 * @returns parsed roles.
 */
export const parseRoles = async (roles: Role[]) => {
  const parsedRoles: AssignedRolesOnDbs = {
    superuser: false,
    dropDatabases: [],
    collections: [],
    readDocument: [],
    writeDocument: [],
  };

  const databases = (await clientInstance.databases()).filter(
    (db) => db !== "local" && db !== "config"
  );

  for (const role of roles) {
    switch (role.role) {
      case "root":
        parsedRoles.superuser = true;
        break;
      case "atlasAdmin":
        parsedRoles.superuser = true;
        break;
      case "dbOwner":
        if (role.db === "admin") {
          parsedRoles.superuser = true;
          break;
        }
        addDatabase(parsedRoles, [role.db], true);
        break;
      case "dbAdmin":
        addDatabase(parsedRoles, [role.db], true);
        break;
      case "dbAdminAnyDatabase":
        parsedRoles.createDatabase = true;
        addDatabase(parsedRoles, databases, true);
        break;
      case "read":
        if (!parsedRoles.readDocument?.includes(role.db))
          parsedRoles.readDocument?.push(role.db);
        break;
      case "readAnyDatabase":
        parsedRoles.readDocument?.push(
          ...databases.filter((db) => !parsedRoles.readDocument?.includes(db))
        );
        break;
      case "readWrite":
        addDatabase(parsedRoles, [role.db]);
        break;
      case "readWriteAnyDatabase":
        parsedRoles.createDatabase = true;
        addDatabase(parsedRoles, databases);
        break;
    }
    if (parsedRoles.superuser) break;
  }

  return parsedRoles;
};
