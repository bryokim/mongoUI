import { useClient, type client } from "./useClient";

export const useConnect = () => {
  const client = useClient();

  /**
   * Sets the value for `useClient` to the new client.
   *
   * @param {client} newClient new client.
   */
  const setClient = (newClient: client) => {
    client.value = newClient;
  };

  /**
   * Calls the `/api/connect` endpoint that creates a new mongodb connection
   * if none exists. Also sets the `useClient` value to the return value of
   * the connection call.
   *
   * @async
   *
   * @param name name of the new connection.
   * @param uri mongodb connection uri.
   */
  const connect = async (name: string, uri: string) => {
    const data = (await $fetch("/api/connect", {
      method: "POST",
      body: { name, uri },
    })) as client;

    if (data) setClient(data);
  };

  /**
   * Calls the `/api/disconnect` endpoint that disconnects the current mongodb
   * connection.
   * Sets the `useClient` value to null.
   *
   * @async
   */
  const disconnect = async () => {
    await $fetch("/api/disconnect");

    client.value = null;
  };

  const getClient = async () => {
    const data = (await $fetch("/api/client")) as client;

    if (data) setClient(data);
  };

  return {
    connect,
    disconnect,
    getClient,
  };
};
