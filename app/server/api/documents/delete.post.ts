import clientInstance from "~/server/utils/client";

/**
 * Delete documents.
 *
 * @throws If any of the values passed to the deleteDocument function is invalid.
 */

export default defineEventHandler(async (event) => {
  const { database, collection, filter, options, many } = await readBody<{
    database: string;
    collection: string;
    filter: {};
    options: {};
    many: boolean;
  }>(event);

  try {
    const result = await clientInstance.deleteDocument(
      database,
      collection,
      filter,
      options,
      many
    );
    return result;
  } catch (error: any) {
    throw createError({ message: error.message, statusCode: 400 });
  }
});
