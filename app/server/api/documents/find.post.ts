import clientInstance from "~/server/utils/client";

/**
 * Finds documents matching filter in a certain collection.
 */
export default defineEventHandler(async (event) => {
  const { database, collection, filter } = await readBody<{
    database: string;
    collection: string;
    filter: { [propName: string]: any };
  }>(event);

  return await clientInstance.findDocuments(
    database,
    collection,
    filter
  );
});
