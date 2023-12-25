import clientInstance from "~/server/utils/client";
import { type client } from "~/composables/useClientInfo";

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    name: string;
    uri: string;
  }>(event);

  try {
    await clientInstance.setClient({
      uri: body.uri,
      name: body.name,
    });
  } catch (error: any) {
    throw createError({ statusCode: 400, message: error.message });
  }

  const client = clientInstance.client;

  if (client) {
    const roles = (
      await client
        .db()
        .admin()
        .command({ usersInfo: { user: clientInstance.user, db: "admin" } })
    ).users[0].roles;

    const dbs = await client.db().admin().listDatabases();

    const clientInfo = {
      uri: clientInstance.uri,
      name: clientInstance.name,
      userInfo: { user: clientInstance.user, roles },
      databases: dbs.databases.map((db) => db.name),
    } as client;

    clientInfo.name &&
      (await useStorage("db").setItem(clientInfo.name, clientInfo));

    return clientInfo;
  }

  throw createError({ statusCode: 500, message: "Server error" });
});
