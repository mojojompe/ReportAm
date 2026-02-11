'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name?: string;
    // Add other user fields as needed
}

interface UserContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const logout = useCallback(() => {
        localStorage.removeItem('reportam_token');
        setToken(null);
        setUser(null);
        router.push('/signin');
    }, [router]);

    const refreshUser = useCallback(async () => {
        const storedToken = localStorage.getItem('reportam_token');
        if (!storedToken) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/proxy/auth/me', {
                headers: {
                    'Authorization': `Bearer ${storedToken}`,
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                setToken(storedToken);
            } else if (response.status === 401) {
                logout();
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const login = (newToken: string, userData: User) => {
        localStorage.setItem('reportam_token', newToken);
        setToken(newToken);
        setUser(userData);
        router.push('/dashboard'); // Or wherever you want to redirect after login
    };

    return (
        <UserContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
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
