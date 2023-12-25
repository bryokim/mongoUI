import clientInstance from "~/server/utils/client";

/**
 * Drops a database.
 */

export default defineEventHandler(async (event) => {
  const { database } = await readBody<{ database: string }>(event);

  const dropped = await clientInstance.dropDatabase(database);

  if (dropped) {
    return { detail: "ok" };
  } else {
    return { detail: "error" };
  }
});
