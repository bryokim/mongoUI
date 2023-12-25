import clientInstance from "~/server/utils/client";

/**
 * Inserts documents into a database collection.
 */

export default defineEventHandler(async (event) => {
  const { database, collection, document } = await readBody<{
    database: string;
    collection: string;
    document: {} | {}[];
  }>(event);

  if (Array.isArray(document)) {
    if (document.length === 0)
      throw createError({
        message: "Document cannot be empty array",
        statusCode: 400,
      });
    for (const value of document) {
      if (typeof value !== "object")
        throw createError({
          message: "Array can only contain objects",
          statusCode: 400,
        });
      if (Object.keys(value).length === 0)
        throw createError({
          message: "Array contains empty object",
          statusCode: 400,
        });
    }
  }
  if (Object.keys(document).length === 0) {
    throw createError({
      message: "Document cannot be empty object",
      statusCode: 400,
    });
  }

  const result = await clientInstance.insertDocument(
    database,
    collection,
    document
  );

  return result;
});
