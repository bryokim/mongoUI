import { client } from "~/composables/useClientInfo";
import clientInstance from "~/server/utils/client";

/**
 * Reconnects to a saved connection.
 */

export default defineEventHandler(async (event) => {
  const { name, password } = await readBody<{ name: string; password: string }>(
    event
  );

  const isValid = (await $fetch("/validate/password", {
    method: "POST",
    body: {
      name,
      enteredPassword: password,
    },
  })) as boolean;

  if (!isValid) createError({ message: "Invalid password", statusCode: 401 });

  const clientInfo = (await useStorage("db").getItem(name)) as client;

  try {
    await clientInstance.setClient({
      uri: clientInfo.uri,
      name: clientInfo.name,
    });
  } catch (error: any) {
    throw createError({ statusCode: 400, message: error.message });
  }

  if (clientInstance.client) {
    return clientInfo as client;
  }

  throw createError({ message: "Server error", statusCode: 500 });
});
