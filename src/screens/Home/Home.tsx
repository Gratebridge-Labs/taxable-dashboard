'use client';
import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import Lenis from 'lenis';
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

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const lenis = new Lenis({ lerp: 0.1 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__lenis = lenis;

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).__lenis = undefined;
        };
    }, []);

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
                                    <h1 className="text-7 font-semibold text-neutral-800 mb-2 tracking-tight">
                                        Hello {user?.firstName}, Welcome to Taxable
                                    </h1>
                                    <p className="text-2 text-neutral-400 font-medium">The 2026 tax cycle is currently active. Let's make sure you're compliant.</p>
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
                            <div className="mb-8 flex flex-col md:flex-row justify-between items-start gap-6">
                                <div data-animate>
                                    <h1 className="text-7 font-semibold text-neutral-800 mb-2 tracking-tight">
                                        Welcome, {user?.firstName}
                                    </h1>
                                </div>
                            </div>

                            {/* Dynamic Tax Filings Sections */}
                            {Object.entries(
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                profiles.reduce((acc: Record<string, any[]>, profile) => {
                                    const year = profile.year || '2026';
                                    if (!acc[year]) acc[year] = [];
                                    acc[year].push(profile);
                                    return acc;
                                }, {})
                            ).sort(([yearA], [yearB]) => Number(yearB) - Number(yearA)).map(([year, yearProfiles], index) => (
                                <section key={year} className="mb-10 last:mb-0" data-animate>
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10">
                                        <h2 className="text-5 font-semibold text-neutral-800">{year} Tax Filings</h2>
                                        {index === 0 ? (
                                            <button
                                                onClick={() => setIsSidebarOpen(true)}
                                                className="h-12 px-4 bg-taxable-blue text-white font-semibold text-3 rounded-xl w-full sm:w-auto text-center"
                                            >
                                                Create another tax filing
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setIsSidebarOpen(true)}
                                                className="text-2 font-medium text-neutral-500"
                                            >
                                                Add another tax type
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {yearProfiles.map((profile, index) => (
                                            <TaxFolderCard
                                                key={profile._id || profile.profileId || index}
                                                title={profile.fullName || profile.title || `${profile.profileType} — ${profile.year}`}
                                                description={profile.nin ? `Tax ID: ${profile.nin}` : (profile.description || `Your ${profile.profileType?.toLowerCase() || 'tax'} filing for ${profile.year || '2026'}.`)}
                                                statusText={profile.profileType || 'Tax'}
                                                onClick={() => handleFolderClick(profile)}
                                                onDelete={() => handleDeleteProfile(profile.profileId || profile._id)}
                                            />
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>

                        <section className="mt-16" data-animate>
                            <h2 className="text-5 font-semibold text-neutral-800 mb-6">Resources</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {VIDEOS.map((video, index) => (
                                    <VideoCard key={index} {...video} />
                                ))}
                            </div>
                        </section>
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
