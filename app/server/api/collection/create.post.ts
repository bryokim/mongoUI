import clientInstance from "~/server/utils/client";

export default defineEventHandler(async (event) => {
  const { database, collection } = await readBody<{
    database: string;
    collection: string;
  }>(event);

  const created = await clientInstance.createCollection(database, collection);

  if (created) {
    return { detail: "ok" };
  } else {
    return { detail: "error" };
  }
});
