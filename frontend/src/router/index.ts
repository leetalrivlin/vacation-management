import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import RequesterView from "../views/RequesterView.vue";
import ValidatorView from "../views/ValidatorView.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/", name: "home", component: HomeView },
        { path: "/requester", name: "requester", component: RequesterView },
        { path: "/validator", name: "validator", component: ValidatorView },
    ],
});

export default router;