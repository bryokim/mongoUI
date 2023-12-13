import { client } from "~/composables/useClientInfo";

/**
 * Updates clientInfo.
 */

export default defineEventHandler(async (event) => {
  const { name, newClientInfo } = await readBody<{
    name: string;
    newClientInfo: client;
  }>(event);

  const clientInfo = (await useStorage("db").getItem(name)) as client;

  const nameChanged =
    clientInfo.name === newClientInfo.name ? "" : clientInfo.name;

  clientInfo.name = newClientInfo.name;

  if (nameChanged) {
    await useStorage("db").removeItem(nameChanged);
  }

  await useStorage("db").setItem(clientInfo.name, clientInfo);
});
