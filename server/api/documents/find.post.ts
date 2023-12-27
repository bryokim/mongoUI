import clientInstance from "~/server/utils/client";

/**
 * Finds documents matching filter in a certain collection.
 */
export default defineEventHandler(async (event) => {
  const { database, collection, filter, options, many } = await readBody<{
    database: string;
    collection: string;
    filter: { [propName: string]: any };
    options: {};
    many: boolean;
  }>(event);

  return many
    ? await clientInstance.findDocuments(database, collection, filter, options)
    : await clientInstance.findOne(database, collection, filter, options);
});
