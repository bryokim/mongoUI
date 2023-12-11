import clientInstance from "~/server/utils/client";
import { client } from "~/composables/useClient";

export default defineEventHandler(async (event) => {
  const client = clientInstance.client;

  if (client) {
    const roles = (
      await client
        .db()
        .admin()
        .command({ usersInfo: { user: clientInstance.user, db: "admin" } })
    ).users[0].roles;

    const dbs = await client.db().admin().listDatabases();
  
    return {
      uri: clientInstance.uri,
      name: clientInstance.name,
      userInfo: { user: clientInstance.user, roles },
      databases: dbs.databases.map((db) => db.name),
    } as client;
  }
});
