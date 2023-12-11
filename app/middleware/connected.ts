/**
 * Redirects user to the index page if they are not connected.
 * 
 * If added to a page, the client needs to be connected for the
 * page to load, else they are redirected to the index page.
 */

export default defineNuxtRouteMiddleware(async () => {
  const user = useClient();

  if (!user.value) return navigateTo({ name: "index" });
});
