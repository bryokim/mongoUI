export interface DatabaseInfo {
  name: string;
  collections: Array<string>;
  roles: Array<string>;
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
  return useState<DatabaseInfo[] | null>("databases", () => null);
};
