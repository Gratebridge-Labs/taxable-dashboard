'use client';
import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { useRouter } from 'next/navigation';
import SetupSidebar from '@/components/SetupSidebar/SetupSidebar';
import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';
import { TaxFolderCard } from '@/screens/Home/TaxFolderCard';
import { VideoCard } from '@/screens/Home/VideoCard';
import { FAQSection } from '@/screens/Home/FAQSection';
import { toast } from 'sonner';

import { useUser } from '@/contexts/UserContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useTaxableApi } from '@/hooks/useTaxableApi';

const VIDEOS = [
    { thumbnail: "/thumbnails/tour.png", title: "The Taxable Tour", duration: "8:37 mins" },
    { thumbnail: "/thumbnails/reforms.png", title: "Nigeria's 2026 Tax Reforms Explained", duration: "8:37 mins" },
    { thumbnail: "/thumbnails/reforms.png", title: "Nigeria's 2026 Tax Reforms Explained", duration: "8:37 mins" },
];

export default function Home() {
    const { user, isAuthenticated, loading: authLoading } = useUser();
    const { profiles, loading: profilesLoading, fetchProfiles } = useProfile();
    const { deleteProfile } = useTaxableApi();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const handleDeleteProfile = useCallback(async (profileId: string) => {
        try {
            await deleteProfile(profileId);
            fetchProfiles();
        } catch (err: unknown) {
            console.error('Failed to delete profile:', err instanceof Error ? err.message : 'Unknown error');
            toast.error('Failed to delete tax folder. Please try again.');
        }
    }, [deleteProfile, fetchProfiles]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchProfiles();
        }
    }, [isAuthenticated, fetchProfiles]);

    const hasTaxFolders = profiles.length > 0;
    const isInitialLoading = authLoading || profilesLoading;

    const containerRef = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);

    useLayoutEffect(() => {
        if (isInitialLoading || authLoading) return;
        if (hasAnimated.current) return;
        hasAnimated.current = true;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                '[data-animate]',
                { opacity: 0, y: 12 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    stagger: 0.06,
                    ease: 'power2.out',
                    onStart: () => gsap.set('[data-animate]', { transition: 'none' }),
                    onComplete: () => gsap.set('[data-animate]', { clearProps: 'transition' }),
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [isInitialLoading, authLoading]);

    const router = useRouter();
    const [resumeProfileId, setResumeProfileId] = useState<string | null>(null);
    const [resumeData, setResumeData] = useState<{ year?: string; category?: string } | undefined>(undefined);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFolderClick = (profile: any) => {
        if (profile.profileType === 'Individual') {
            // Determine which section to resume from based on profile progress
            let section = 'personal-info';
            const hasIncome = (profile.incomeRecordsCount ?? 0) > 0 || profile.hasIncome;
            const hasDeductions = (profile.deductionsCount ?? 0) > 0 || profile.hasDeductions;
            const personalInfoComplete = !!(profile.fullName || profile.nin || profile.dob || profile.street || profile.streetAddress);

            if (personalInfoComplete && (hasIncome || hasDeductions)) {
                section = 'income-deductions';
            } else if (personalInfoComplete) {
                section = 'income-deductions';
            }

            router.push(`/tax-folders/pit?id=${profile.profileId}&section=${section}`);
        } else if (profile.profileType === 'Business') {
            router.push(`/tax-folders/business?profileId=${profile.profileId}`);
        } else {
            setResumeProfileId(profile.profileId);
            setResumeData({
                year: profile.year,
                category: profile.profileType
            });
            setIsSidebarOpen(true);
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-white">
            <DashboardHeader />

            {/* Main Content */}
            <main className="max-w-[1280px] mx-auto px-6 md:px-12 pt-10 pb-6 md:pb-8">
                { !hasTaxFolders ? (
                    <>
                        <div className="flex flex-col gap-12">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                                <div data-animate>
                                    <h1 className="text-5 font-semibold text-neutral-800 mb-2 tracking-tight">
                                        Hello {user?.firstName}, Welcome to Taxable
                                    </h1>
                                    <p className="text-1 text-neutral-400 font-medium">The 2026 tax cycle is currently active. Let's make sure you're compliant.</p>
                                </div>

                                <div data-animate className="w-full md:w-auto">
                                    <button
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="h-12 px-4 bg-taxable-blue text-white font-semibold rounded-xl whitespace-nowrap"
                                    >
                                        Create new tax filing
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {VIDEOS.map((video, index) => (
                                    <div key={index} data-animate><VideoCard {...video} /></div>
                                ))}
                            </div>
                        </div>

                        <FAQSection />
                    </>
                ) : (
                    <>
                        <div className="animate-in fade-in duration-700">

                            {/* Tax Filings */}
                            <section data-animate>
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                                    <h2 className="text-5 font-medium text-neutral-800 mb-1 tracking-[-0.02em] font-[family-name:var(--font-merriweather)]">Tax Filings</h2>
                                    <button
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="h-10 px-5 bg-taxable-blue text-white font-semibold text-2 rounded-xl w-full sm:w-auto text-center"
                                    >
                                        Create another tax filing
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {[...profiles]
                                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                        .map((profile, index) => (
                                            <TaxFolderCard
                                                key={profile.profileId || profile.id || index}
                                                title={profile.fullName || `${profile.profileType} — ${profile.year}`}
                                                description={profile.nin ? `Tax ID: ${profile.nin}` : `Your ${profile.profileType?.toLowerCase() || 'tax'} filing for ${profile.year || '2026'}.`}
                                                statusText={profile.profileType || 'Tax'}
                                                year={profile.year}
                                                onClick={() => handleFolderClick(profile)}
                                                onDelete={() => handleDeleteProfile(profile.profileId || profile.id)}
                                            />
                                        ))}
                                </div>
                            </section>
                        </div>
                    </>
                )}
            </main>

            <SetupSidebar
                isOpen={isSidebarOpen}
                resumeProfileId={resumeProfileId}
                initialData={resumeData}
                onClose={() => {
                    setIsSidebarOpen(false);
                    setResumeProfileId(null);
                    setResumeData(undefined);
                }}
                onComplete={(shouldRedirect, profileId) => {
                    setIsSidebarOpen(false);
                    setResumeProfileId(null);
                    setResumeData(undefined);
                    fetchProfiles();
                    if (shouldRedirect && profileId) {
                        router.push(`/tax-folders/pit?id=${profileId}&new=workspace`);
                    }
                }}
            />
        </div>
    );
}
