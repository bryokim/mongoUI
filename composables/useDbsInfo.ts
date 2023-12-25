export interface DatabaseInfo {
  name: string;
  collections: Array<string>;
  roles?: Array<string>;
}

export interface AllDatabaseInfo {
  nonEmpty?: DatabaseInfo[];
  empty?: DatabaseInfo[];
}

/**
 * Holds an array of `DatabaseInfo` objects.
 *
 * @see DatabaseInfo
 *
 * @example
 * import { useDbsInfo } from '@/composables/useDbsInfo';
 *
 * const databasesInfo = useDbsInfo().value
 *
 * console.log(databasesInfo);
 */
export const useDbsInfo = () => {
  return useState<AllDatabaseInfo | null>("databases", () => null);
};
