import type { DatabaseInfo } from "./useDbsInfo";

/**
 * Implements functions for dealing with databases after connecting.
 */

export const useDb = () => {
  const databasesInfo = useDbsInfo();

  const setDbsInfo = (newValue: DatabaseInfo[]) => {
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

  return {
    getDbsInfo,
  };
};
