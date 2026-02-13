import axios from "axios";

const API_BASE_URL = "https://reportam-backend-sun4.onrender.com/";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const reportApi = {
    // Submit a new report - UPDATED to use FormData
    submitReport: async (formData: FormData) => {
        const response = await api.post("/api/reports", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    // Trigger SOS - Use emergency endpoint with FormData
    triggerSOS: async (location: { lat: number; lng: number }) => {
        const formData = new FormData();
        formData.append("type", "general");
        formData.append("category", "Emergency");
        formData.append("description", "🚨 EMERGENCY SOS ALERT - Immediate assistance required!");
        formData.append("address_text", `Emergency at: ${location.lat}, ${location.lng}`);
        formData.append("lat", location.lat.toString());
        formData.append("lng", location.lng.toString());
        // Note: Backend requires image, but for SOS we might need to handle this differently
        // For now, creating a placeholder - backend should make image optional for emergency

        const response = await api.post("/api/reports/emergency", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    // Get recent reports (for the feed)
    getReports: async (filters?: {
        status?: string;
        isEmergency?: boolean;
        category?: string;
        type?: string;
        page?: number;
        limit?: number;
    }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append("status", filters.status);
        if (filters?.isEmergency !== undefined) params.append("is_emergency", filters.isEmergency.toString());
        if (filters?.category) params.append("category", filters.category);
        if (filters?.type) params.append("type", filters.type);
        if (filters?.page) params.append("page", filters.page.toString());
        if (filters?.limit) params.append("limit", filters.limit.toString());

        const response = await api.get(`/api/reports?${params}`);
        return response.data;
    },

    // Get all states - UPDATED to access .data property
    getStates: async () => {
        const response = await api.get("/api/locations/states");
        return response.data.data || response.data; // Handle both formats
    },

    // Get LGAs for a state - UPDATED to access .data property
    getLgas: async (stateId: string) => {
        const response = await api.get(`/api/locations/states/${stateId}/lgas`);
        return response.data.data || response.data; // Handle both formats
    },

    // Mark user as affected by a report
    markAffected: async (reportId: string) => {
        const response = await api.post(`/api/reports/${reportId}/affected`);
        return response.data;
    },

    // Unmark user as affected
    unmarkAffected: async (reportId: string) => {
        const response = await api.delete(`/api/reports/${reportId}/affected`);
        return response.data;
    },
};
