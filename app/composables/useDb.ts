import type { AllDatabaseInfo, DatabaseInfo } from "./useDbsInfo";

/**
 * Implements functions for dealing with databases after connecting.
 */

export const useDb = () => {
  const databasesInfo = useDbsInfo();

  const setDbsInfo = (newValue: AllDatabaseInfo) => {
    databasesInfo.value = newValue;
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

  return {
    getDbsInfo,
    createDb,
  };
};
