import clientInstance from "~/server/utils/client";

/**
 * Finds all the documents in a collection pagewise.
 */

export default defineEventHandler(async (event) => {
  const { database, collection, page } = getQuery<{
    database: string;
    collection: string;
    page: number;
  }>(event);

  const docs = await clientInstance.findDocumentsInPage(
    database,
    collection,
    page
  );

  return docs;
});
