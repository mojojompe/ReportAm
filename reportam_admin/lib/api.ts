import axios from "axios";

// Base URL
const API_BASE_URL = "https://reportam-backend-sun4.onrender.com/";

// TypeScript interfaces for API responses
interface Report {
    _id: string;
    id?: string;
    description: string;
    title?: string;
    category: string;
    type: string;
    status: "pending" | "in-progress" | "resolved";
    address_text?: string;
    community_name?: string;
    location?: string;
    state?: string;
    lga?: string;
    lat?: number;
    lng?: number;
    image?: string;
    imageUrl?: string;
    is_emergency?: boolean;
    priority?: string;
    createdAt: string;
    updatedAt: string;
    timestamp?: string;
}

interface ReportsResponse {
    reports: Report[];
    total: number;
    page: number;
    limit: number;
}

interface StatsResponse {
    total: number;
    pending: number;
    resolved: number;
    critical: number;
}

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add request interceptor to include authentication headers
api.interceptors.request.use(
    (config) => {
        // For admin endpoints, add JWT Bearer token
        if (typeof window !== "undefined") {
            // Import authService to get token
            const token = localStorage.getItem("reportam_admin_token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// Helper function to extract reports array from response
const extractReports = (data: any): Report[] => {
    // Backend returns { reports: [...], total, page, limit }
    if (data.reports && Array.isArray(data.reports)) {
        return data.reports;
    }
    // Fallback for direct array or data.data format
    if (Array.isArray(data)) {
        return data;
    }
    if (data.data && Array.isArray(data.data)) {
        return data.data;
    }
    return [];
};

export const adminApi = {
    getReports: async (): Promise<Report[]> => {
        try {
            const response = await api.get("/api/reports");
            return extractReports(response.data);
        } catch (error) {
            console.error("Admin API Error:", error);
            return [];
        }
    },

    updateStatus: async (id: string, status: string) => {
        const response = await api.patch(`/api/admin/reports/${id}/status`, { status });
        return response.data;
    },

    deleteReport: async (id: string) => {
        const response = await api.delete(`/api/admin/reports/${id}`);
        return response.data;
    },

    getStats: async (): Promise<StatsResponse> => {
        const reportsList = await adminApi.getReports();

        return {
            total: reportsList.length,
            pending: reportsList.filter((r) => r.status === "pending").length,
            resolved: reportsList.filter((r) => r.status === "resolved").length,
            critical: reportsList.filter((r) => r.is_emergency || r.priority === "high").length,
        };
    },

    getComments: async (): Promise<any[]> => {
        try {
            const response = await api.get("/api/admin/comments");
            return response.data;
        } catch (error) {
            console.error("Failed to fetch comments:", error);
            return [];
        }
    },

    deleteComment: async (id: string) => {
        const response = await api.delete(`/api/admin/comments/${id}`);
        return response.data;
    },

    // Location endpoints
    getStates: async () => {
        const response = await api.get("/api/locations/states");
        return response.data.data || response.data;
    },

    getLgas: async (stateId: string) => {
        const response = await api.get(`/api/locations/states/${stateId}/lgas`);
        return response.data.data || response.data;
    },
};
