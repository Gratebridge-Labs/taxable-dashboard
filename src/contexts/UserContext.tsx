'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: string;
    email: string;
    fullName?: string;
    [key: string]: any;
}

interface UserContextType {
    user: User | null;
    token: string | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
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

        if (storedToken && storedUser && storedUser !== 'undefined') {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error('Failed to parse stored user:', err);
                localStorage.removeItem('taxable_user');
                localStorage.removeItem('taxable_token');
            }
        }
        setLoading(false);
    }, []);

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
