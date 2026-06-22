'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/api-endpoints';

interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    emailVerified?: boolean;
    twoFactorEnabled?: boolean;
    tin?: string;
    whatsappReminders?: boolean;
    name?: string;
}

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
                const result = await response.json();
                if (result.success && result.data.user) {
                    setUser(result.data.user);
                    localStorage.setItem('taxable_user', JSON.stringify(result.data.user));
                }
            }
        } catch (err: unknown) {
            console.error('Failed to refresh user data:', err instanceof Error ? err.message : 'Unknown error');
        }
    }, [token]);

    useEffect(() => {
        const storedToken = localStorage.getItem('taxable_token');
        const storedUser = localStorage.getItem('taxable_user');

        if (storedToken) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setToken(storedToken);

            if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (err: unknown) {
                    console.error('Failed to parse stored user:', err instanceof Error ? err.message : 'Unknown error');
                    localStorage.removeItem('taxable_user');
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
        localStorage.setItem('taxable_token', newToken);
        if (userData) {
            localStorage.setItem('taxable_user', JSON.stringify(userData));
        }
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('taxable_token');
        localStorage.removeItem('taxable_user');
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