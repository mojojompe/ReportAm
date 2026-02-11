'use client';

import { useState, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';

interface ApiOptions extends RequestInit {
    data?: any;
}

export const useApi = () => {
    const { token, logout } = useUser();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const request = useCallback(
        async (endpoint: string, options: ApiOptions = {}) => {
            setLoading(true);
            setError(null);

            const { data, ...restOptions } = options;
            const url = endpoint.startsWith('/api/proxy') ? endpoint : `/api/proxy${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

            const headers = new Headers(restOptions.headers || {});
            headers.set('Accept', 'application/json');

            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }

            if (data && !(data instanceof FormData)) {
                headers.set('Content-Type', 'application/json');
                restOptions.body = JSON.stringify(data);
            } else if (data instanceof FormData) {
                // Fetch will set the multipart/form-data boundary automatically
                restOptions.body = data;
            }

            try {
                const response = await fetch(url, {
                    ...restOptions,
                    headers,
                });

                if (response.status === 401) {
                    logout();
                    throw new Error('Unauthorized');
                }

                const responseData = await response.json();

                if (!response.ok) {
                    throw new Error(responseData.message || 'Something went wrong');
                }

                return responseData;
            } catch (err: any) {
                const errorMessage = err.message || 'An unexpected error occurred';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [token, logout]
    );

    const get = (endpoint: string, options?: ApiOptions) => request(endpoint, { ...options, method: 'GET' });
    const post = (endpoint: string, data?: any, options?: ApiOptions) => request(endpoint, { ...options, method: 'POST', data });
    const put = (endpoint: string, data?: any, options?: ApiOptions) => request(endpoint, { ...options, method: 'PUT', data });
    const patch = (endpoint: string, data?: any, options?: ApiOptions) => request(endpoint, { ...options, method: 'PATCH', data });
    const del = (endpoint: string, options?: ApiOptions) => request(endpoint, { ...options, method: 'DELETE' });

    const upload = (endpoint: string, formData: FormData, options?: ApiOptions) =>
        request(endpoint, { ...options, method: 'POST', data: formData });

    return { get, post, put, patch, del, upload, loading, error };
};
