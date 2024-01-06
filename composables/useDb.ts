import type { AllDatabaseInfo, DatabaseInfo } from "./useDbsInfo";
import type { AssignedRolesOnDbs } from "./useRolesInfo";

/**
 * Implements functions for dealing with databases after connecting.
 */

export const useDb = () => {
  const databasesInfo = useDbsInfo();
  const rolesInfo = useRolesInfo();
  const pagesInfo = usePage();

  const setDbsInfo = (newValue: AllDatabaseInfo) => {
    databasesInfo.value = newValue;
  };

  const setRolesInfo = (newValue: AssignedRolesOnDbs) => {
    rolesInfo.value = newValue;
  };

  const setPage = (newValue: number, database: string, collection: string) => {
    if (!pagesInfo.value[database]) pagesInfo.value[database] = {};

    pagesInfo.value[database][collection] = newValue;
  };

  /**
   * Gets database info and sets the value for `useDbsInfo`.
   *
   * @async
   */
  const getDbsInfo = async () => {
    const dbsAndCols = await $fetch("/api/db");

    setDbsInfo(dbsAndCols);
  };

  /**
   * Gets roles info and sets the value for `useRolesInfo`.
   *
   * @async
   */
  const getRolesInfo = async () => {
    const rolesInfo = await $fetch("/api/db/roles");

    setRolesInfo(rolesInfo);
  };

  /**
   * Creates a new empty database.
   *
   * The database is implied and is only added to the mongodb
   * when the first document is inserted.
   *
   * @param database name of the new database.
   * @param collection name of the new collection.
   */
  const createDb = async (database: string, collection: string) => {
    const data = (await $fetch("/api/db/create", {
      method: "POST",
      body: {
        database,
        collection,
      },
    })) as DatabaseInfo[];

    setDbsInfo({ nonEmpty: useDbsInfo().value?.nonEmpty, empty: data });
  };

  /**
   * Sends request to drop a database.
   *
   * @async
   *
   * @param database name of the database to drop.
   */
  const dropDb = async (database: string) => {
    const dropped = await $fetch("/api/db/drop", {
      method: "POST",
      body: { database },
    });

    if (dropped.detail == "ok") {
      // Reload `useDbsInfo` with the new databases.
      await getDbsInfo();
    } else {
      throw Error("Error occurred while dropping the database");
    }
  };

  /**
   * Sends request to create a new collection.
   *
   * @async
   *
   * @param database name of the database to add the collection into.
   * @param collection name of the new collection.
   */
  const createCollection = async (database: string, collection: string) => {
    const created = await $fetch("/api/collection/create", {
      method: "POST",
      body: { database, collection },
    });

    if (created.detail == "ok") {
      // Reload `useDbsInfo` with the new collections.
      await getDbsInfo();
    } else {
      throw Error("Error occurred while creating the collection");
    }
  };

  /**
   * Sends request to drop a collection.
   *
   * @async
   * @param database name of the database.
   * @param collection name of the collection
   */
  const dropCollection = async (database: string, collection: string) => {
    const dropped = await $fetch("/api/collection/drop", {
      method: "POST",
      body: { database, collection },
    });

    if (dropped) {
      // Reload `useDbsInfo` with the new collections.
      await getDbsInfo();
    } else {
      throw Error("Error occurred while creating the collection");
    }
  };

  /**
   * Finds documents in the next page to be added to the display.
   *
   * @param database name of the database.
   * @param collection name of the collection.
   * @param side the side of the infinity scroll being loaded.
   * @param filter search criteria.
   * @param options optional settings passed to the command.
   * @returns array of documents in the next current page.
   */
  const findDocumentsInPage = async (
    database: string,
    collection: string,
    side: string,
    filter = {},
    options = {}
  ) => {
    let nextPage = 0;

    if (pagesInfo.value[database]) {
      nextPage = pagesInfo.value[database][collection];
    } else {
      setPage(0, database, collection);
    }

    const documents = await $fetch("/api/collection/documents", {
      method: "POST",
      body: {
        database,
        collection,
        page: nextPage,
        filter,
        options,
      },
    });

    // Increment or decrement page depending on the side being loaded.
    if (side === "end" && documents.length > 0) {
      setPage(nextPage + 1, database, collection);
    } else if (side === "start" && nextPage - 1 >= 0) {
      setPage(nextPage - 1, database, collection);
    }

    return documents;
  };

  /**
   * Finds documents that match filter in the given collection.
   * If `many` is set to `false`, filter is not considered when
   * @async
   * @param database name of the database.
   * @param collection name of the collection.
   * @param many Whether to find multiple documents. Set to `false` to `findOne`.
   * @param filter search criteria.
   * @param options optional settings passed to the command.
   * @returns documents that match the filter.
   */
  const findDocuments = async (
    database: string,
    collection: string,
    many = true,
    filter = {},
    options = {}
  ) => {
    const documents = await $fetch("/api/documents/find", {
      method: "POST",
      body: {
        database,
        collection,
        filter,
        options,
        many,
      },
    });

    return documents;
  };

  /**
   * Inserts documents.
   * @async
   *
   * @param database name of the database.
   * @param collection name of the collection.
   * @param document document or array of documents to be inserted.
   * @returns insertion results.
   */
  const insertDocument = async (
    database: string,
    collection: string,
    document: {} | {}[]
  ) => {
    const result = await $fetch("/api/documents/insert", {
      method: "POST",
      body: {
        database,
        collection,
        document,
      },
    });

    // reload databases. Empty databases move to non-empty if a document is added.
    await getDbsInfo();

    return result;
  };

  /**
   * Gets the schema of a collection.
   * The schema is not fully descriptive and only has a depth of 1.
   * @async
   *
   * @param database name of the database.
   * @param collection name of the collection.
   * @returns schema of the collection.
   */
  const getSchema = async (database: string, collection: string) => {
    const schema: { [propName: string]: string } = await $fetch(
      "/api/collection/schema",
      {
        method: "GET",
        query: {
          database,
          collection,
        },
      }
    );

    return schema;
  };

  /**
   * Updates documents.
   *
   * @param database name of the database.
   * @param collection name of the collection.
   * @param filter query to filter values to be updated.
   * @param update changes to be applied to the documents.
   * @param options options passed to the update action.
   * @param many whether to update many documents.
   * @returns result of the update.
   */
  const updateDocument = async (
    database: string,
    collection: string,
    filter: {},
    update: {},
    options: {} = {},
    many: boolean = false
  ) => {
    const result = await $fetch("/api/documents/update", {
      method: "POST",
      body: { database, collection, filter, update, options, many },
    });
    return result;
  };

  /**
   * Deletes documents.
   *
   * @async
   * @param database name of the database.
   * @param collection name of the collection.
   * @param filter query to filter values to be deleted.
   * @param options options passed to the delete action.
   * @param many whether to delete many documents.
   * @returns result of the delete operation.
   */
  const deleteDocument = async (
    database: string,
    collection: string,
    filter: {},
    options = {},
    many: boolean = false
  ) => {
    const result = await $fetch("/api/documents/delete", {
      method: "POST",
      body: { database, collection, filter, options, many },
    });
    return result;
  };

  /**
   * Finds the number of documents in a collection.
   *
   * @param database name of the database.
   * @param collection name of the collection.
   * @param filter filter for the count.
   * @param options optional settings passed to the command.
   * @returns number of documents in the collection.
   */
  const countDocuments = async (
    database: string,
    collection: string,
    filter = {},
    options = {}
  ) => {
    const count = await $fetch("/api/documents/count", {
      method: "POST",
      body: {
        database,
        collection,
        filter,
        options,
      },
    });

    return count;
  };

  return {
    setDbsInfo,
    setRolesInfo,
    setPage,
    getDbsInfo,
    getRolesInfo,
    createDb,
    dropDb,
    createCollection,
    dropCollection,
    findDocumentsInPage,
    findDocuments,
    insertDocument,
    getSchema,
    updateDocument,
    deleteDocument,
    countDocuments,
  };
};
