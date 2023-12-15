import clientInstance from "~/server/utils/client";

export default defineEventHandler(async (event) => {
  const { database } = await readBody<{ database: string }>(event);

  return (await clientInstance.databases()).some((db) => db === database);
});
