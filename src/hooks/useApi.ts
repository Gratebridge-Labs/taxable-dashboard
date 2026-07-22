'use client';
import { useState, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api-endpoints';

const BASE_URL = API_BASE_URL;

export class ApiError extends Error {
    data: unknown;
    constructor(message: string, data?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.data = data;
    }
}

interface ApiConfig extends RequestInit {
    useToken?: boolean;
    skipContentType?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiResponse = Record<string, any>;

export const useApi = () => {
    const { token, logout, loading: authLoading } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const request = useCallback(async (endpoint: string, config: ApiConfig = {}): Promise<ApiResponse> => {
        const { useToken = true, skipContentType, ...customConfig } = config;

        setLoading(true);
        setError(null);

        const headers: Record<string, string> = {
            'Accept': 'application/json',
        };

        if (!skipContentType && customConfig.method && ['POST', 'PUT', 'PATCH'].includes(customConfig.method)) {
            headers['Content-Type'] = 'application/json';
        }

        if (useToken) {
            if (!token) {
                if (authLoading) {
                    setLoading(false);
                    return {} as ApiResponse;
                }
                router.push('/signin');
                setLoading(false);
                throw new ApiError('Authentication required');
            }
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                ...customConfig,
                headers: {
                    ...headers,
                    ...customConfig.headers as Record<string, string>,
                },
            });

            const text = await response.text();
            let responseData: unknown;
            try {
                responseData = JSON.parse(text);
            } catch {
                responseData = text;
            }

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    router.push('/signin');
                }
                const rd = responseData as Record<string, unknown> | string;
                const errorMessage = (typeof rd === 'object' && rd && (rd.message as string)) ||
                    (typeof rd === 'object' && rd && (rd.error as string)) ||
                    `Error: ${response.status} ${response.statusText}`;
                throw new ApiError(errorMessage, responseData);
            }

            return responseData as ApiResponse;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Something went wrong';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [token, logout, router, authLoading]);

    const get = useCallback((endpoint: string, config?: ApiConfig): Promise<ApiResponse> =>
        request(endpoint, { ...config, method: 'GET' }), [request]);

    const post = useCallback((endpoint: string, body?: unknown, config?: ApiConfig): Promise<ApiResponse> =>
        request(endpoint, { ...config, method: 'POST', body: JSON.stringify(body) }), [request]);

    const put = useCallback((endpoint: string, body?: unknown, config?: ApiConfig): Promise<ApiResponse> =>
        request(endpoint, { ...config, method: 'PUT', body: JSON.stringify(body) }), [request]);

    const patch = useCallback((endpoint: string, body?: unknown, config?: ApiConfig): Promise<ApiResponse> =>
        request(endpoint, { ...config, method: 'PATCH', body: JSON.stringify(body) }), [request]);

    const del = useCallback((endpoint: string, config?: ApiConfig): Promise<ApiResponse> =>
        request(endpoint, { ...config, method: 'DELETE' }), [request]);

    const upload = useCallback(async (endpoint: string, formData: FormData, config: ApiConfig = {}): Promise<ApiResponse> => {
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
                    return {} as ApiResponse;
                }
                router.push('/signin');
                setLoading(false);
                throw new ApiError('Authentication required');
            }
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                ...config,
                headers: {
                    ...headers,
                    ...config.headers as Record<string, string>,
                },
                body: formData,
            });

            const uploadText = await response.text();
            let responseData: Record<string, unknown>;
            try {
                responseData = JSON.parse(uploadText) as Record<string, unknown>;
            } catch {
                throw new ApiError(`Error: ${response.status} ${response.statusText}`);
            }

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    router.push('/signin');
                }
                const errorMessage = responseData?.message as string || responseData?.error as string || `Error: ${response.status}`;
                throw new ApiError(errorMessage);
            }

            return responseData as ApiResponse;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Something went wrong';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [token, logout, router, authLoading]);

    return { get, post, put, patch, del, upload, loading, error };
};