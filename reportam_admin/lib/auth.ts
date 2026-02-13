import axios from "axios";

// Auth utilities for admin dashboard
const AUTH_KEY = "reportam_admin_auth";
const TOKEN_KEY = "reportam_admin_token";

const API_BASE_URL = "https://reportam-backend-sun4.onrender.com/";

export const ADMIN_CREDENTIALS = {
    email: "admin@reportam.com",
    password: "password123",
};

export const authService = {
    login: async (email: string, password: string): Promise<boolean> => {
        try {
            // Call backend login endpoint
            const response = await axios.post(`${API_BASE_URL}api/admin/auth/login`, {
                email,
                password,
            });

            // Backend returns { token: "..." }
            if (response.data && response.data.token) {
                if (typeof window !== "undefined") {
                    localStorage.setItem(AUTH_KEY, "true");
                    localStorage.setItem(TOKEN_KEY, response.data.token);
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login error:", error);
            return false;
        }
    },

    logout: (): void => {
        if (typeof window !== "undefined") {
            localStorage.removeItem(AUTH_KEY);
            localStorage.removeItem(TOKEN_KEY);
        }
    },

    isAuthenticated: (): boolean => {
        if (typeof window !== "undefined") {
            return localStorage.getItem(AUTH_KEY) === "true" && !!localStorage.getItem(TOKEN_KEY);
        }
        return false;
    },

    getToken: (): string | null => {
        if (typeof window !== "undefined") {
            return localStorage.getItem(TOKEN_KEY);
        }
        return null;
    },
};

