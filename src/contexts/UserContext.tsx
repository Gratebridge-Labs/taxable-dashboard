'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/api-endpoints';
import type { User } from '@/types/api';

interface UserContextType {
    user: User | null;
    token: string | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    setUser: (userData: User) => void;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
    loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async (currentToken?: string) => {
        const tokenToUse = currentToken || token;
        if (!tokenToUse) return;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${tokenToUse}`,
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                const text = await response.text();
                const result = JSON.parse(text);
                if (result.success && result.data.user) {
                    setUser(result.data.user);
                    sessionStorage.setItem('taxable_user', JSON.stringify(result.data.user));
                }
            } else if (response.status === 401) {
                // Token is invalid/expired — clear auth state so isAuthenticated reflects reality
                setToken(null);
                setUser(null);
                sessionStorage.removeItem('taxable_token');
                sessionStorage.removeItem('taxable_user');
            }
        } catch (err: unknown) {
            console.error('Failed to refresh user data:', err instanceof Error ? err.message : 'Unknown error');
        }
    }, [token]);

    useEffect(() => {
        const storedToken = sessionStorage.getItem('taxable_token');
        const storedUser = sessionStorage.getItem('taxable_user');

        if (storedToken) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setToken(storedToken);

            if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (err: unknown) {
                    console.error('Failed to parse stored user:', err instanceof Error ? err.message : 'Unknown error');
                    sessionStorage.removeItem('taxable_user');
                }
            }
            refreshUser(storedToken).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [refreshUser]);

    const login = useCallback((newToken: string, userData: User) => {
        setToken(newToken);
        setUser(userData);
        sessionStorage.setItem('taxable_token', newToken);
        if (userData) {
            sessionStorage.setItem('taxable_user', JSON.stringify(userData));
        }
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        sessionStorage.removeItem('taxable_token');
        sessionStorage.removeItem('taxable_user');
    }, []);

    const setUserCallback = useCallback((userData: User) => {
        setUser(userData);
    }, []);

    return (
        <UserContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                setUser: setUserCallback,
                refreshUser,
                isAuthenticated: !!(token && user),
                loading,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};