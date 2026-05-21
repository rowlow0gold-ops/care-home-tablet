import { createApp } from "vue";
import { Quasar, Notify, Dialog } from "quasar";
import { createPinia } from "pinia";

import App from "./App.vue";
import { router } from "./router";

import "@quasar/extras/material-icons/material-icons.css";
import "quasar/src/css/index.sass";
import "./styles/app.css";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(Quasar, {
  plugins: { Notify, Dialog },
  config: {
    brand: {
      primary: "#0E8A5F",
      secondary: "#14A17A",
      accent: "#14A17A",
      dark: "#0F172A",
      positive: "#10B981",
      negative: "#EF4444",
      warning: "#F59E0B",
      info: "#3B82F6",
    },
    notify: { position: "top", timeout: 2500 },
  },
});
app.mount("#q-app");
