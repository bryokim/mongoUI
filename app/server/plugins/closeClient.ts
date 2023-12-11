import clientInstance from "../utils/client";

/**
 * Closes the client if any is connected when the Nitro is closed.
 * This prevents leaving open connections when the closing the app.
 */

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hookOnce("close", async () => {
    await clientInstance.clearCurrentClient();
  });
});
