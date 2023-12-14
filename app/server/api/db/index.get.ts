import clientInstance from "~/server/utils/client";

/**
 * Gets the dbsInfo.
 */

export default defineEventHandler(async (event) => {
  return await clientInstance.dbsInfo();
});
