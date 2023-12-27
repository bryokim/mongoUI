import clientInstance from "~/server/utils/client";

export default defineEventHandler(async (event) => {
  const { database, collection, filter, options } = await readBody<{
    database: string;
    collection: string;
    filter: {};
    options: {};
  }>(event);

  return await clientInstance.countDocuments(
    database,
    collection,
    filter,
    options
  );
});
