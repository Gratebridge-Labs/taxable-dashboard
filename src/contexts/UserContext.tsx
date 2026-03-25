'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api-endpoints';

interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    emailVerified?: boolean;
    twoFactorEnabled?: boolean;
    [key: string]: any;
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

    useEffect(() => {
        // Initialize auth state from localStorage
        const storedToken = localStorage.getItem('taxable_token');
        const storedUser = localStorage.getItem('taxable_user');

        if (storedToken) {
            setToken(storedToken);

            if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (err) {
                    console.error('Failed to parse stored user:', err);
                }
            }
            // Fetch fresh user data if we have a token
            refreshUser(storedToken).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const refreshUser = async (currentToken?: string) => {
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
        } catch (err) {
            console.error('Failed to refresh user data:', err);
        }
    };

    useEffect(() => {
        if (token) {
            console.log('🔑 Auth Token:', token);
        }
    }, [token]);

    const login = (newToken: string, userData: User) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('taxable_token', newToken);
        if (userData) {
            localStorage.setItem('taxable_user', JSON.stringify(userData));
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('taxable_token');
        localStorage.removeItem('taxable_user');
    };

    return (
        <UserContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                setUser,
                refreshUser,
                isAuthenticated: !!token,
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
