import clientInstance from "~/server/utils/client";

export default defineEventHandler(async (event) => {
  const roles = await clientInstance.userRoles();

  const parsedRoles = await parseRoles(roles);

  return parsedRoles;
});
