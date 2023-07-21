import { createApp } from "vue";
import App from "./App.vue";
import VueCookies from "vue-cookies";

import "./assets/css/base.less";

const app = createApp(App);
app.use(VueCookies, { expires: "30d" });
app.mount("#app");
