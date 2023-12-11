import clientInstance from "../utils/client";

export default defineEventHandler(async (event) => {
  await clientInstance.clearCurrentClient();
});
