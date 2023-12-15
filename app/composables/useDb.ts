import type { AllDatabaseInfo, DatabaseInfo } from "./useDbsInfo";
import type { AssignedRolesOnDbs } from "./useRolesInfo";

/**
 * Implements functions for dealing with databases after connecting.
 */

export const useDb = () => {
  const databasesInfo = useDbsInfo();
  const rolesInfo = useRolesInfo();

  const setDbsInfo = (newValue: AllDatabaseInfo) => {
    databasesInfo.value = newValue;
  };

  const setRolesInfo = (newValue: AssignedRolesOnDbs) => {
    rolesInfo.value = newValue;
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

  return {
    setDbsInfo,
    setRolesInfo,
    getDbsInfo,
    getRolesInfo,
    createDb,
    dropDb,
  };
};
