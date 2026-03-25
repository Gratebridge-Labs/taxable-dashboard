'use client';
import { useState, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api-endpoints';

const BASE_URL = API_BASE_URL;

interface ApiConfig extends RequestInit {
    useToken?: boolean;
}

export const useApi = () => {
    const { token, logout, loading: authLoading } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);

    const request = useCallback(async (endpoint: string, config: ApiConfig = {}) => {
        const { useToken = true, ...customConfig } = config;

        if (useToken && authLoading) {
            // Auth state still loading — wait
        }

        setLoading(true);
        setError(null);

        const headers: Record<string, string> = {
            'Accept': 'application/json',
        };

        if (customConfig.method && ['POST', 'PUT', 'PATCH'].includes(customConfig.method)) {
            headers['Content-Type'] = 'application/json';
        }

        if (useToken) {
            if (!token) {
                if (authLoading) {
                    setLoading(false);
                    return;
                }
                console.warn('No token found for authenticated request, redirecting to login');
                router.push('/signin');
                setLoading(false);
                throw new Error('Authentication required');
            }
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
                if (response.status === 401) {
                    console.log('Session expired, logging out');
                    logout();
                    router.push('/signin');
                }
                const errorMessage = responseData?.message || responseData?.error || `Error: ${response.status} ${response.statusText}`;
                const error: any = new Error(errorMessage);
                error.data = responseData;
                throw error;
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
    }, [token, logout, router, authLoading]);

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

        if (useToken) {
            if (!token) {
                if (authLoading) {
                    setLoading(false);
                    return;
                }
                router.push('/signin');
                setLoading(false);
                throw new Error('Authentication required');
            }
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
                if (response.status === 401) {
                    logout();
                    router.push('/signin');
                }
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
    }, [token, logout, router, authLoading]);

    return { get, post, put, patch, del, upload, loading, error, data };
};
