import { client } from "~/composables/useClientInfo";
import clientInstance from "~/server/utils/client";

export default defineEventHandler(async (event) => {
  const { name } = getQuery<{ name: string }>(event);

  const clientInfo = (await useStorage("db").getItem(name)) as client;

  const client = clientInstance.client;

  const dbsAndCols = [];

  if (client) {
    for (let database of clientInfo.databases) {
      const collectionObjects = await client
        ?.db(database)
        .listCollections()
        .toArray();

      const collections = collectionObjects.map((col) => col.name);

      dbsAndCols.push({
        database,
        collections,
      });
    }
  }

  return dbsAndCols;
});
