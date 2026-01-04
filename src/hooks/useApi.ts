'use client';
import { useState, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';

const BASE_URL = 'https://api.gettaxable.com/api';

interface ApiConfig extends RequestInit {
    useToken?: boolean;
}

export const useApi = () => {
    const { token } = useUser();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);

    const request = useCallback(async (endpoint: string, config: ApiConfig = {}) => {
        const { useToken = true, ...customConfig } = config;

        setLoading(true);
        setError(null);

        const headers: Record<string, string> = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };

        if (useToken && token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                ...customConfig,
                headers: {
                    ...headers,
                    ...customConfig.headers,
                },
            });

            let responseData;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            if (!response.ok) {
                // Centralized error parsing: prioritizing backend message
                const errorMessage = responseData?.message || responseData?.error || `Error: ${response.status} ${response.statusText}`;
                throw new Error(errorMessage);
            }

            setData(responseData);
            return responseData;
        } catch (err: any) {
            const message = err.message || 'Something went wrong';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [token]);

    const get = useCallback((endpoint: string, config?: ApiConfig) =>
        request(endpoint, { ...config, method: 'GET' }), [request]);

    const post = useCallback((endpoint: string, body?: any, config?: ApiConfig) =>
        request(endpoint, { ...config, method: 'POST', body: JSON.stringify(body) }), [request]);

    const put = useCallback((endpoint: string, body?: any, config?: ApiConfig) =>
        request(endpoint, { ...config, method: 'PUT', body: JSON.stringify(body) }), [request]);

    const patch = useCallback((endpoint: string, body?: any, config?: ApiConfig) =>
        request(endpoint, { ...config, method: 'PATCH', body: JSON.stringify(body) }), [request]);

    const del = useCallback((endpoint: string, config?: ApiConfig) =>
        request(endpoint, { ...config, method: 'DELETE' }), [request]);

    const upload = useCallback(async (endpoint: string, formData: FormData, config: ApiConfig = {}) => {
        const { useToken = true } = config;
        setLoading(true);
        setError(null);

        const headers: Record<string, string> = {
            'Accept': 'application/json',
        };

        if (useToken && token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                ...config,
                headers: {
                    ...headers,
                    ...config.headers,
                },
                body: formData,
            });

            const responseData = await response.json();

            if (!response.ok) {
                const errorMessage = responseData?.message || responseData?.error || `Error: ${response.status}`;
                throw new Error(errorMessage);
            }

            setData(responseData);
            return responseData;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [token]);

    return { get, post, put, patch, del, upload, loading, error, data };
};
