import clientInstance from "~/server/utils/client";

export default defineEventHandler(async (event) => {
  const { database, collection } = await readBody<{
    database: string;
    collection: string;
  }>(event);

  clientInstance.addDatabase(database, collection);

  return clientInstance.emptyDatabases;
});
