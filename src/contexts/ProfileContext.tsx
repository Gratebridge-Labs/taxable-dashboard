'use client';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useTaxableApi } from '@/lib';
import { useUser } from '@/contexts/UserContext';
import type { Profile } from '@/types/api';

interface ProfileContextType {
    currentProfile: Profile | null;
    profiles: Profile[];
    setCurrentProfile: (profile: Profile | null) => void;
    setProfiles: (profiles: Profile[]) => void;
    loading: boolean;
    error: string | null;
    fetchProfiles: () => Promise<void>;
    fetchProfile: (profileId: string) => Promise<Profile | null>;
    clearError: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { getProfileList, getProfile } = useTaxableApi();
    const { token } = useUser();

    const clearError = useCallback(() => setError(null), []);

    const fetchProfiles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getProfileList();

            if (response.success && response.data.profiles) {
                setProfiles(response.data.profiles);
            } else if (response.message === 'Profile not found') {
                setProfiles([]);
            } else {
                setProfiles([]);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch profiles';
            if (message !== 'Profile not found') {
                setError(message);
            } else {
                setProfiles([]);
            }
            console.error('[ProfileContext] Error:', err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [getProfileList]);

    const fetchProfile = useCallback(async (profileId: string): Promise<Profile | null> => {
        setLoading(true);
        setError(null);
        try {
            const profile = await getProfile(profileId);
            if (profile) {
                setCurrentProfile(profile);
                return profile;
            }
            return null;
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch profile');
            console.error('[ProfileContext] Failed to fetch profile:', err instanceof Error ? err.message : 'Unknown error');
            return null;
        } finally {
            setLoading(false);
        }
    }, [getProfile]);

    useEffect(() => {
        if (token) {
            fetchProfiles();
        }
    }, [token, fetchProfiles]);

    return (
        <ProfileContext.Provider
            value={{
                currentProfile,
                profiles,
                setCurrentProfile,
                setProfiles,
                loading,
                error,
                fetchProfiles,
                fetchProfile,
                clearError,
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};

export default ProfileContext;