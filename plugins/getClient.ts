import { useConnect } from "~/composables/useConnect";

export default defineNuxtPlugin(async () => {
  const { getClient } = useConnect();

  await getClient();
});
