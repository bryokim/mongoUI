import clientInstance from "~/server/utils/client";

/**
 * Finds all the documents in a collection pagewise.
 */

export default defineEventHandler(async (event) => {
  const { database, collection, page, filter, options } = await readBody<{
    database: string;
    collection: string;
    page: number;
    filter: {};
    options: {};
  }>(event);

  const docs = await clientInstance.findDocumentsInPage(
    database,
    collection,
    page,
    filter,
    options
  );

  return docs;
});
