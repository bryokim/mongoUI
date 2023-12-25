import { type client } from "~/composables/useClientInfo";
import { parseUri } from "~/server/utils/parse";

/**
 * Gets saved connections to be displayed on the load page.
 */

export default defineEventHandler(async (event) => {
  const keys = await useStorage("db").getKeys();

  const clientsInfo: Array<{
    name?: string;
    user?: string;
    host?: string;
    port?: number;
  } | null> = await processKeys(keys);

  return clientsInfo;
});

/**
 * Processes the available keys by getting the data they contain about
 * the client and parsing it to the required format.
 *
 * @async
 *
 * @param keys array of the available keys in the db storage.
 */
async function processKeys(keys: Array<string>) {
  const clientsInfo = await Promise.all(
    keys.map(async (key) => (await useStorage("db").getItem(key)) as client)
  );

  const validClientsInfo = clientsInfo.filter((clientInfo) => clientInfo);

  return validClientsInfo.map((clientInfo) => {
    const { user, host, port } = parseUri(clientInfo.uri);
    return { name: clientInfo.name, user, host, port };
  });
}
