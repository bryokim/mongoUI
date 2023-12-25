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
 * import { useClientInfo } from '@/composables/useClient';
 *
 * const client = useClientInfo().value
 *
 * console.log(client);
 */
export const useClientInfo = () => {
  return useState<client | null>("client", () => null);
};
