import clientInstance from "~/server/utils/client";

/**
 * Update documents.
 *
 * @throws If any of the values passed to the updateDocument function is invalid.
 */

export default defineEventHandler(async (event) => {
  const { database, collection, filter, update, options, many } =
    await readBody<{
      database: string;
      collection: string;
      filter: {};
      update: {};
      options: {};
      many: boolean;
    }>(event);

  let result;
  try {
    result = await clientInstance.updateDocument(
      database,
      collection,
      filter,
      update,
      options,
      many
    );
  } catch (error: any) {
    throw createError({ message: error.message, statusCode: 400 });
  }

  return result;
});
