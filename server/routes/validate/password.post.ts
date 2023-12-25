import { type client } from "~/composables/useClientInfo";
import { parseUri } from "~/server/utils/parse";

/**
 * Confirms that provided password is valid by comparing to the stored
 * password.
 */

export default defineEventHandler(async (event) => {
  const { name, enteredPassword } = await readBody<{
    name: string;
    enteredPassword: string;
  }>(event);

  const { uri } = (await useStorage("db").getItem(name)) as client;

  const { password } = parseUri(uri);

  return encodeURIComponent(enteredPassword) === password;
});
