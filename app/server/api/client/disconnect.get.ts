import clientInstance from "~/server/utils/client";

export default defineEventHandler(async (event) => {
  await clientInstance.clearCurrentClient();
});
