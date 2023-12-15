export interface AssignedRolesOnDbs {
  superuser: boolean;
  createDatabase?: boolean;
  dropDatabases?: string[];
  collections?: string[];
  readDocument?: string[];
  writeDocument?: string[];
}

export const useRolesInfo = () => {
  return useState<AssignedRolesOnDbs>("rolesInfo", () => ({
    superuser: false,
  }));
};
