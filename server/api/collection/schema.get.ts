import clientInstance from "~/server/utils/client";

/**
 * Gets the schema of a collection.
 */

export default defineEventHandler(async (event) => {
  const { database, collection } = getQuery<{
    database: string;
    collection: string;
  }>(event);

  const document: { [propName: string]: any } | null =
    await clientInstance.findOne(database, collection);

  delete document?._id;

  for (const key in document) {
    if (typeof document[key] !== "function") {
      if (typeof document[key] === "object") {
        const specifiedTypes = [Array, Date];
        for (const i in specifiedTypes) {
          if (document[key] instanceof specifiedTypes[i]) {
            document[key] = `${typeof document[key]} ==is_${
              specifiedTypes[i].name
            }==`;
            break;
          } else document[key] = typeof document[key];
        }
      } else document[key] = typeof document[key];
    }
  }

  return document;
});
