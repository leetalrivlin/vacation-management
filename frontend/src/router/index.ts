import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import RequesterView from "../views/RequesterView.vue";
import ValidatorView from "../views/ValidatorView.vue";
import { useAuth } from "../composables/useAuth";
import { UserRole } from "../types";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/", name: "home", component: HomeView, meta: { public: true } },
        {
            path: "/user",
            name: "user",
            component: RequesterView,
            meta: { role: UserRole.REQUESTER },
        },
        {
            path: "/admin",
            name: "admin",
            component: ValidatorView,
            meta: { role: UserRole.VALIDATOR },
        },
    ],
});

router.beforeEach((to) => {
    const { currentUser } = useAuth();
    const user = currentUser.value;

    if (to.meta.public) {
        if (user) {
            return user.role === UserRole.VALIDATOR ? "/admin" : "/user";
        }
        return true;
    }

    if (!user) return "/";

    if (to.meta.role && to.meta.role !== user.role) {
        return user.role === UserRole.VALIDATOR ? "/admin" : "/user";
    }

    return true;
});

export default router;
