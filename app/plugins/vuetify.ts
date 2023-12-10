import "@mdi/font/css/materialdesignicons.css";

import "vuetify/styles";
import { createVuetify, type ThemeDefinition } from "vuetify";
import { VBtn } from "vuetify/components";

const myCustomTheme: ThemeDefinition = {
  dark: false,
  colors: {
    background: "#316A99",
    surface: "#316a99",
    primary: "#00FFFF",
    "primary-2": "#91EAFD",
    secondary: "#03DAC6",
    error: "#c40000",
    info: "#2196F3",
    success: "#91FD94",
    warning: "#FFD686",
    danger: "#F5516E",
    "purple-1": "#7000FF",
    "purple-2": "#91A8FD"
  },
};

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: "myCustomTheme",
      themes: {
        myCustomTheme,
      },
    },
    aliases: {
        VBtnBlock: VBtn,
      },
      defaults: {
        VBtnBlock: {
          class: "button text-lowercase",
          elevation: "10",
          rounded: "lg",
          block: true,
        },
      },
  });
  app.vueApp.use(vuetify);
});
