import { ref, computed } from "vue";
import { UserRole, type User } from "../types";
import { userApi } from "../services/api";

export type AuthIdentity = "Alice" | "Bob" | "Admin";

export interface AuthUser {
    identity: AuthIdentity;
    displayName: string;
    role: UserRole;
    userId: number | null;
}

const STORAGE_KEY = "vm.auth";

function readStorage(): AuthUser | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
        return null;
    }
}

const currentUser = ref<AuthUser | null>(readStorage());

function persist(user: AuthUser | null) {
    if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
}

function findRequester(users: User[], name: string): User | undefined {
    const needle = name.toLowerCase();
    return users.find(
        (u) => u.role === UserRole.REQUESTER && u.name.toLowerCase().includes(needle)
    );
}

function findValidator(users: User[]): User | undefined {
    return users.find((u) => u.role === UserRole.VALIDATOR);
}

export async function login(identity: AuthIdentity): Promise<AuthUser> {
    const users = await userApi.getAll();

    let resolved: AuthUser;
    if (identity === "Admin") {
        const validator = findValidator(users);
        resolved = {
            identity,
            displayName: "Admin",
            role: UserRole.VALIDATOR,
            userId: validator?.id ?? null,
        };
    } else {
        const match = findRequester(users, identity);
        if (!match) {
            throw new Error(`No requester named ${identity} was found`);
        }
        resolved = {
            identity,
            displayName: identity,
            role: UserRole.REQUESTER,
            userId: match.id,
        };
    }

    currentUser.value = resolved;
    persist(resolved);
    return resolved;
}

export function logout() {
    currentUser.value = null;
    persist(null);
}

export function useAuth() {
    return {
        currentUser: computed(() => currentUser.value),
        isLoggedIn: computed(() => currentUser.value !== null),
        login,
        logout,
    };
}
