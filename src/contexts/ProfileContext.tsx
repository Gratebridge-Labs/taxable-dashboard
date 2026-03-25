'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useTaxableApi } from '@/lib';
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

    const clearError = useCallback(() => setError(null), []);

    const fetchProfiles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('[ProfileContext] Fetching profiles...');
            const response = await getProfileList();
            console.log('[ProfileContext] Profile list response:', response);
            
            // "Profile not found" means no profiles exist - not an error
            if (response.success && response.data.profiles) {
                console.log('[ProfileContext] Profiles loaded:', response.data.profiles.length);
                setProfiles(response.data.profiles);
            } else if (response.message === 'Profile not found') {
                console.log('[ProfileContext] No profiles exist for this user');
                setProfiles([]);
            } else {
                console.log('[ProfileContext] No profiles or failed response');
                setProfiles([]);
            }
        } catch (err: any) {
            // Only set error if it's not a "no profiles" situation
            if (err.message !== 'Profile not found') {
                setError(err.message || 'Failed to fetch profiles');
            } else {
                setProfiles([]);
            }
            console.error('[ProfileContext] Error:', err);
        } finally {
            setLoading(false);
        }
    }, [getProfileList]);

    const fetchProfile = useCallback(async (profileId: string): Promise<Profile | null> => {
        console.log('[ProfileContext] fetchProfile called with:', profileId);
        setLoading(true);
        setError(null);
        try {
            const profile = await getProfile(profileId);
            console.log('[ProfileContext] getProfile returned:', profile);
            if (profile) {
                setCurrentProfile(profile);
                return profile;
            }
            return null;
        } catch (err: any) {
            setError(err.message || 'Failed to fetch profile');
            console.error('[ProfileContext] Failed to fetch profile:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [getProfile]);

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