import clientInstance from "~/server/utils/client";
import { client } from "~/composables/useClient";

/**
 * Restores clientInfo if there is an existing open connection.
 */

export default defineEventHandler(async (event) => {
  const name = clientInstance.name;

  if (name) {
    const clientInfo = await useStorage("db").getItem(name);

    // Close and reset client if the file is not found or is empty.
    if (!clientInfo) clientInstance.clearCurrentClient();

    return clientInfo as client;
  }
});
