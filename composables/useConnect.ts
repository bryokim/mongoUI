import { useClientInfo, type client } from "./useClientInfo";

export const useConnect = () => {
  const client = useClientInfo();
  const { getDbsInfo, setDbsInfo, setRolesInfo } = useDb();

  /**
   * Sets the value for `useClientInfo` to the new client.
   *
   * @param {client} newClient new client.
   */
  const setClient = (newClient: client) => {
    client.value = newClient;
  };

  /**
   * Calls the `/api/connect` endpoint that creates a new mongodb connection
   * if none exists. Also sets the `useClientInfo` value to the return value of
   * the connection call.
   *
   * @async
   *
   * @param name name of the new connection.
   * @param uri mongodb connection uri.
   */
  const connect = async (name: string, uri: string) => {
    const data = (await $fetch("/api/client/connect", {
      method: "POST",
      body: { name, uri },
    })) as client;

    if (data) setClient(data);

    // Load this client's database info into `useDbsInfo`
    await getDbsInfo();
  };

  /**
   * Calls the `/api/disconnect` endpoint that disconnects the current mongodb
   * connection.
   * Sets the `useClientInfo` value to null.
   *
   * @async
   */
  const disconnect = async () => {
    await $fetch("/api/client/disconnect");

    client.value = null;

    // Restore `useDbsInfo` and `useRolesInfo` to default.
    setDbsInfo({});
    setRolesInfo({ superuser: false });
  };

  /**
   * Gets the current connected client if any and sets the `useClientInfo` value.
   *
   * @async
   */
  const getClient = async () => {
    const data = (await $fetch("/api/client")) as client;

    if (data) setClient(data);
  };

  /**
   * Reconnects to a saved connection.
   *
   * @async
   *
   * @param name the name of the connection to reconnect to.
   * @param password the password as entered by user.
   */
  const reconnect = async (name: string, password: string) => {
    const data = await $fetch("/api/client/reconnect", {
      method: "POST",
      body: {
        name,
        password,
      },
    });

    if (data) setClient(data);

    // Load this client's database info into `useDbsInfo`
    await getDbsInfo();
  };

  return {
    connect,
    disconnect,
    getClient,
    reconnect,
  };
};
