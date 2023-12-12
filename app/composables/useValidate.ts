/**
 * Contains functions for validating user input.
 */

export const useValidate = () => {
  /**
   * Validates that the given name is not an empty string and
   * has not been used for another connection.
   *
   * @async
   *
   * @param name Name as provided by the user.
   *
   * @returns true if the name is valid, else an error message is returned.
   */
  const validateName = async (name: string) => {
    if (!name) return "name is required";

    const found = (await $fetch("/validate/name", {
      method: "POST",
      body: { name },
    })) as boolean;

    return found ? "name already assigned" : true;
  };

  /**
   * Validates that the given uri is not an empty string and has
   * valid format.
   *
   * @param uri mongodb connection uri.
   *
   * @returns true if the uri is valid, else an error message is returned.
   */
  const validateUri = (uri: string) => {
    if (!uri) return "uri is required";

    if (!/^.+:\/\/.+:.+@.+:\d+.*$/.exec(uri)) return "invalid uri format";

    if (!/^mongodb:\/\/.+$/.exec(uri) && !/^mongodb+srv:\/\/.+$/.exec(uri))
      return 'Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"';

    return true;
  };

  /**
   * Validates that the given scheme is not an empty string and is
   * either `mongodb` or `mongodb+srv`.
   *
   * @param scheme scheme used to connect to the database.
   *
   * @returns true if the scheme is valid, else an error message is returned.
   */
  const validateScheme = (scheme: string) => {
    if (!scheme) return "scheme is required";

    if (!/^mongodb$/.exec(scheme) && !/^mongodb+srv$/.exec(scheme))
      return 'Invalid scheme, expected scheme to be "mongodb" or "mongodb+srv"';

    return true;
  };

  /**
   * Validates that the host is not an empty string.
   *
   * @param host host to connect to.
   *
   * @returns true if the host is valid, else an error message is returned.
   */
  const validateHost = (host: string) => {
    if (!host) return "host is required";

    return true;
  };

  /**
   * Validates that the port is not empty and is a number.
   *
   * @param port port to connect to.
   *
   * @returns true if the port is valid, else an error message is returned.
   */
  const validatePort = (port: string) => {
    if (!port) return "port is required";

    if (!parseInt(port)) return "port must be a number";

    return true;
  };

  /**
   * Validates that the user is not empty.
   *
   * @param user the connecting user.
   *
   * @returns true if the user is valid, else an error message is returned.
   */
  const validateUser = (user: string) => {
    if (!user) return "user is required";

    return true;
  };

  /**
   * Validates that the password is not empty.
   *
   * @param port password for the user that is connecting.
   *
   * @returns true if the password is valid, else an error message is returned.
   */
  const validatePassword = (password: string) => {
    if (!password) return "password is required";

    return true;
  };

  return {
    validateName,
    validateUri,
    validateScheme,
    validateHost,
    validatePort,
    validateUser,
    validatePassword,
  };
};
