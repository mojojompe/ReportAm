// TEMPORARY TEST FILE - Test report submission without image
// This will help confirm if the issue is with multipart/form-data handling

import axios from "axios";

const API_BASE_URL = "https://reportam-backend-sun4.onrender.com/";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Test function - call this from console to test
export const testReportSubmission = async () => {
    try {
        console.log("Testing JSON submission...");
        const response = await api.post("/api/reports", {
            type: "community",
            category: "Road",
            description: "Test report without image",
            address_text: "Test location",
            community_name: "Test LGA",
            city_id: "6987f5273f9c36081a5d51cd", // Oyo state ID from existing reports
            lat: 7.3775,
            lng: 3.9470,
        });
        console.log("Success!", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Error:", error.response?.data);
        throw error;
    }
};

// If JSON works but FormData doesn't, the backend is missing multer middleware
