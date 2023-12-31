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

    if (!/^(.+):\/\/(.+):(.+)@([^:?/]+)(:\d+)?.*$/.exec(uri))
      return "invalid uri format";

    if (!/^mongodb:\/\/.+$/.exec(uri) && !/^mongodb\+srv:\/\/.+$/.exec(uri))
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
   * Validates that the password is not empty and if user is reconnecting,
   * they enter the correct password.
   *
   * @async
   *
   * @param password password for the user that is connecting.
   * @param name the name of the connection. It is optional. Use only if
   * you are checking if password matches stored one.
   *
   * @returns true if the password is valid, else an error message is returned.
   */
  const validatePassword = async (password: string, name: string = "") => {
    if (!password) return "password is required";

    if (name) {
      const isCorrect = await $fetch("/validate/password", {
        method: "POST",
        body: {
          name,
          enteredPassword: password,
        },
      });

      if (!isCorrect) return "invalid password";
    }
    return true;
  };

  /**
   * Validates that the database being added does not exist.
   *
   * @async
   *
   * @param database name of the new database.
   *
   * @returns true if the database is valid, else an error message is returned.
   */
  const validateDatabase = async (database: string) => {
    if (!database) return "database is required";

    let found: boolean | undefined = await $fetch("/validate/database", {
      method: "POST",
      body: { database: database.trim() },
    });

    if (!found) {
      found = useDbsInfo().value?.empty?.some((db) => db.name === database);
    }

    if (found) return "database already assigned";

    return true;
  };

  /**
   * Validates that the collection being added does not exist on the
   * given database.
   *
   * @async
   *
   * @param database name of the database.
   * @param collection name of the collection being added.
   *
   * @returns true if the collection is valid, else an error message is returned.
   */
  const validateCollection = async (database: string, collection: string) => {
    if (!collection) return "collection is required";

    const emptyDatabase = useDbsInfo().value.empty?.filter(
      (db) => db.name === database
    );

    let found = false;

    if (emptyDatabase && emptyDatabase?.length !== 0) {
      found = emptyDatabase[0].collections.includes(collection);
    } else {
      found = await $fetch("/validate/collection", {
        method: "POST",
        body: { database, collection },
      });
    }
    return found ? "collection already assigned" : true;
  };

  /**
   * Validates that the filter is a valid JSON string and is not empty.
   *
   * @param filter search criteria being entered by the user.
   * @returns true if the filter is valid, else an error message.
   */
  const validateFilter = (filter: string) => {
    if (!filter) return "filter is required";

    try {
      JSON.parse(filter);
    } catch (error) {
      return "filter must be valid JSON";
    }

    return true;
  };

  /**
   * Validates a json value.
   *
   * @param json JSON value to validate.
   * @param fieldName name of the field attached to the value.
   * @returns true if the json is valid, else an error message.
   */
  const validateJSON = (json: string, fieldName: string) => {
    if (!document) return `${fieldName} is required`;

    try {
      JSON.parse(json);
    } catch (error) {
      return `${fieldName} must be a valid JSON`;
    }

    const parsedDocument = JSON.parse(json);

    if (Array.isArray(parsedDocument)) {
      if (parsedDocument.length === 0)
        return `${fieldName} cannot be an empty array`;

      for (const value of parsedDocument) {
        if (typeof value !== "object") return "Array can only contain objects";
        else if (Object.keys(value).length === 0)
          return "Array contains empty object";
      }
    } else if (
      Object.keys(parsedDocument).length === 0 &&
      fieldName !== "filter"
    ) {
      return `${fieldName} cannot be an empty object`;
    } else if (typeof parsedDocument !== "object") {
      return `${fieldName} must be an object`;
    }

    return true;
  };

  /**
   * Validates options value.
   *
   * @param options value to validate.
   * @returns true if options is valid, else an error message.
   */
  const validateOptions = (options: string) => {
    if (options) {
      try {
        JSON.parse(options);
      } catch (error) {
        return "options must be valid JSON";
      }

      if (Array.isArray(options)) {
        return "options cannot be an array";
      }
    }

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
    validateDatabase,
    validateCollection,
    validateFilter,
    validateJSON,
    validateOptions,
  };
};
