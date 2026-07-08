'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export default function RootRedirect() {
    const router = useRouter();
    const { isAuthenticated, loading } = useUser();

    useEffect(() => {
        if (loading) return;
        router.replace(isAuthenticated ? '/home' : '/signin');
    }, [isAuthenticated, loading, router]);

    return null;
}