import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "./stores/authStore";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Initialize auth state
const authStore = useAuthStore();
authStore.init();

app.mount("#app");
