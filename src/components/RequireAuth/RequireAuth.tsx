'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

interface RequireAuthProps {
    children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
    const router = useRouter();
    const { isAuthenticated, loading } = useUser();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.replace('/signin');
        }
    }, [isAuthenticated, loading, router]);

    if (loading || !isAuthenticated) return null;

    return children;
}