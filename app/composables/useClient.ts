export interface User {
  user: string;
  roles: Array<{
    role: string;
    db: string;
  }>;
}

export interface client {
  uri: string;
  name: string;
  userInfo: User;
  databases: Array<string>;
}

/**
 * Holds the current client as its value.
 *
 * @example
 * import { useClient } from '@/composables/useClient';
 *
 * const client = useClient().value
 *
 * console.log(client);
 */
export const useClient = () => {
  return useState<client | null>("client", () => null);
};
