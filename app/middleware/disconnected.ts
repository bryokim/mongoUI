/**
 * Redirects user to the home page if they are connected.
 * 
 * If added to a page, the client needs to be closed/disconnected
 * else if a connected client is found they're redirected to the
 * home page.
 */

export default defineNuxtRouteMiddleware(async () => {
  const user = useClient();

  if (user.value) return navigateTo({ name: "home" });
});
