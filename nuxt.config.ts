// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

export default defineNuxtConfig({
  devtools: { enabled: true },
  build: {
    transpile: ["vuetify"],
  },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
    "@nuxt/test-utils/module",
    "@nuxt/content",
    "@nuxtjs/color-mode",
  ],
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  nitro: {
    // Production
    storage: {
      db: {
        driver: "fs",
        base: "./.data/db",
      },
    },
    // Development
    devStorage: {
      db: {
        driver: "fs",
        base: "./.test_data/db",
      },
    },
  },
  extends: "@nuxt-themes/typography",
  content: {
    highlight: {
      theme: {
        default: "material-theme",
        // Default theme (same as single string)
        light: "light-plus",
        // Theme used if `html.dark`
        dark: "github-dark",
        // Theme used if `html.sepia`
        sepia: "monokai",
      },
    },
    documentDriven: true,
  },
  colorMode: {
    classSuffix: ''
  }
});
