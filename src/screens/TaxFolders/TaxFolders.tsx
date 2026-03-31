'use client';
import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useProfile } from '@/contexts/ProfileContext';
import { useUser } from '@/contexts/UserContext';
import { useTaxableApi } from '@/lib';
import type { Profile } from '@/types/api';

const NavItem = ({ iconSrc, label, active = false, href = "#" }: { iconSrc: string; label: string; active?: boolean; href?: string }) => (
    <Link href={href} className={`flex items-center gap-2 px-3 py-2 text-[15px] font-medium transition-all group whitespace-nowrap ${active ? 'text-taxable-dark' : 'text-taxable-gray hover:text-taxable-dark'}`}>
        <Image src={iconSrc} alt={label} width={18} height={18} className={`${active ? 'opacity-100' : 'opacity-60'} group-hover:opacity-100 transition-opacity`} />
        <span>{label}</span>
    </Link>
);

const StatusBadge = ({ type, text }: { type: 'complete' | 'progress' | 'none' | 'filed', text: string }) => {
    const styles = {
        complete: 'bg-[#E6F9F3] text-[#10B981]',
        progress: 'bg-[#FFF7ED] text-[#F97316]',
        none: 'bg-gray-100 text-taxable-gray',
        filed: 'bg-[#EFF6FF] text-[#2563EB]'
    };

    return (
        <span className={`text-[13px] font-semibold px-2.5 py-1 rounded-full ${styles[type]}`}>
            {text}
        </span>
    );
};

interface TaxFolderCardProps {
    profile: Profile;
    taxAmount?: string;
    description?: string;
    status: 'complete' | 'progress' | 'none' | 'filed';
    statusText: string;
    isInactive?: boolean;
}

const TaxFolderCard = ({ profile, taxAmount, description, status, statusText, isInactive = false }: TaxFolderCardProps) => {
    const title = `${profile.year} ${profile.profileType} Tax`;
    const profileTypeDescriptions: Record<string, string> = {
        'Individual': 'For your personal income from employment, dividends, and other investments.',
        'Business': 'For income from your registered business operations and activities.',
    };
    const defaultDescription = profileTypeDescriptions[profile.profileType] || 'Tax filing profile';

    const getHref = () => {
        if (profile.profileType === 'Individual') {
            return `/tax-folders/pit?profileId=${profile.profileId}`;
        }
        return `/tax-folders/business?profileId=${profile.profileId}`;
    };

    return (
        <Link href={getHref()} className="group">
            <div className="w-[322px] h-[323px] bg-white rounded-[34px] border border-gray-100 p-6 transition-all flex flex-col shadow-none hover:shadow-none" style={{ boxShadow: 'none' }}>
                <div className={`w-full h-[145px] rounded-[24px] flex items-center justify-center mb-5 ${isInactive ? 'bg-[#F5F5F5]' : 'bg-[#FAFAFA]'}`}>
                    <Image
                        src={isInactive ? "/icons/inactive_folder.svg" : "/icons/folder.svg"}
                        alt="folder"
                        width={60}
                        height={58}
                        className="transition-transform group-hover:scale-110 duration-500"
                    />
                </div>

                <div className="flex-1 flex flex-col items-start text-left">
                    <h3 className="text-[19px] font-bold text-taxable-dark mb-1.5">{title}</h3>
                    <p className="text-sm font-semibold text-taxable-dark mb-1">{taxAmount || 'Calculating...'}</p>
                    <p className="text-[13px] text-taxable-gray font-medium leading-relaxed mb-4 truncate w-full">
                        {description || defaultDescription}
                    </p>

                    <div className="mt-auto">
                        <StatusBadge type={status} text={statusText} />
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default function TaxFolders() {
    const { user } = useUser();
    const { profiles, loading: profilesLoading, fetchProfiles } = useProfile();
    const { getTaxSummary } = useTaxableApi();
    const [taxSummaries, setTaxSummaries] = useState<Record<string, any>>({});
    const [summariesLoading, setSummariesLoading] = useState(false);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    useEffect(() => {
        const fetchSummaries = async () => {
            if (profiles.length === 0) return;
            
            setSummariesLoading(true);
            const summaries: Record<string, any> = {};
            
            for (const profile of profiles) {
                try {
                    const response = await getTaxSummary(profile.profileId);
                    if (response.success) {
                        summaries[profile.profileId] = response.data;
                    }
                } catch (err) {
                    console.error(`Failed to fetch tax summary for ${profile.profileId}:`, err);
                }
            }
            
            setTaxSummaries(summaries);
            setSummariesLoading(false);
        };

        fetchSummaries();
    }, [profiles, getTaxSummary]);

    const { currentYearProfiles, previousYearProfiles } = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return {
            currentYearProfiles: profiles.filter(p => p.year === currentYear),
            previousYearProfiles: profiles.filter(p => p.year < currentYear)
        };
    }, [profiles]);

    const getStatusFromFilingStatus = (filingStatus: string): 'complete' | 'progress' | 'none' | 'filed' => {
        const statusMap: Record<string, 'complete' | 'progress' | 'none' | 'filed'> = {
            'filed': 'filed',
            'tax_agent_approved': 'complete',
            'tax_agent_review': 'progress',
            'submitted': 'progress',
            'upload_done': 'progress',
            'pending_upload': 'none',
            'pending_accountant_payment': 'progress',
            'pending_filing_payment': 'progress',
        };
        return statusMap[filingStatus] || 'none';
    };

    const getStatusText = (profile: Profile, summary: any) => {
        if (profile.filingStatus === 'filed') {
            return 'Tax Filed';
        }
        if (profile.filingStatus === 'tax_agent_approved') {
            return 'All sections complete';
        }
        if (profile.filingStatus === 'tax_agent_review' || profile.filingStatus === 'submitted') {
            return 'Under review';
        }
        if (profile.filingStatus === 'upload_done') {
            return 'Documents uploaded';
        }
        return 'Not started';
    };

    const formatTaxAmount = (profile: Profile, summary: any) => {
        if (!summary?.taxSummary) return 'Calculating...';
        const { estimatedAnnualTax, isRefund } = summary.taxSummary;
        if (isRefund) {
            return `Tax Refund - ₦${estimatedAnnualTax.toLocaleString()}`;
        }
        return `Tax Due - ₦${estimatedAnnualTax.toLocaleString()}`;
    };

    const userName = user?.firstName || 'User';
    const hasProfiles = profiles.length > 0;

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans">
            <header className="w-full h-24 bg-white border-b border-gray-100 flex items-center px-12 sticky top-0 z-50">
                <div className="flex-1 flex items-center">
                    <Link href="/home">
                        <Image src="/logo_blue.svg" alt="Taxable" width={100} height={61} priority />
                    </Link>
                </div>

                <nav className="hidden md:flex items-center justify-center gap-6">
                    <NavItem iconSrc="/icons/people.svg" label="Tax folders" active href="/tax-folders" />
                    <NavItem iconSrc="/icons/transaction.svg" label="Educational resources" href="/home" />
                    <NavItem iconSrc="/icons/notification.svg" label="Push Notifications" />
                </nav>

                <div className="flex-1 flex justify-end items-center">
                    <div className="w-11 h-11 rounded-full bg-gray-100 overflow-hidden cursor-pointer hover:ring-2 hover:ring-taxable-blue/20 transition-all">
                        <Link href="/profile">
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <Image src="/icons/profile.svg" alt="Profile" width={28} height={28} className="opacity-40" />
                            </div>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-[1280px] mx-auto px-12 py-12">
                <div className="mb-14">
                    <h1 className="text-[28px] font-semibold text-taxable-dark mb-2 tracking-tight">
                        Hello, {userName}, Welcome back
                    </h1>
                    {hasProfiles ? (
                        <p className="text-base text-taxable-gray font-medium">
                            You have {currentYearProfiles.length} tax filing{currentYearProfiles.length !== 1 ? 's' : ''} ready for {new Date().getFullYear()}. Click any card to begin.
                        </p>
                    ) : (
                        <p className="text-base text-taxable-gray font-medium">
                            You don't have any tax filings yet. Create one to get started.
                        </p>
                    )}
                </div>

                {profilesLoading || summariesLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003787]"></div>
                    </div>
                ) : hasProfiles ? (
                    <>
                        {currentYearProfiles.length > 0 && (
                            <section className="mb-16">
                                <div className="flex justify-between items-center mb-10">
                                    <h2 className="text-2xl font-bold text-taxable-dark">{new Date().getFullYear()} Tax Filings</h2>
                                    <button className="h-12 px-6 bg-[#003787] hover:opacity-90 text-white font-semibold rounded-xl transition-all">
                                        Create another tax filing
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {currentYearProfiles.map(profile => (
                                        <TaxFolderCard
                                            key={profile.profileId}
                                            profile={profile}
                                            taxAmount={formatTaxAmount(profile, taxSummaries[profile.profileId])}
                                            status={getStatusFromFilingStatus(profile.filingStatus)}
                                            statusText={getStatusText(profile, taxSummaries[profile.profileId])}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {previousYearProfiles.length > 0 && (
                            <section>
                                <div className="flex justify-between items-center mb-10">
                                    <h2 className="text-2xl font-bold text-taxable-dark">Previous Years</h2>
                                    <button className="h-12 px-6 bg-white border border-gray-200 hover:bg-gray-50 text-taxable-dark font-semibold rounded-xl transition-all">
                                        Add another tax type
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {previousYearProfiles.map(profile => (
                                        <TaxFolderCard
                                            key={profile.profileId}
                                            profile={profile}
                                            taxAmount={formatTaxAmount(profile, taxSummaries[profile.profileId])}
                                            status={getStatusFromFilingStatus(profile.filingStatus)}
                                            statusText={getStatusText(profile, taxSummaries[profile.profileId])}
                                            isInactive
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <Image src="/icons/folder.svg" alt="No filings" width={48} height={48} className="opacity-40" />
                        </div>
                        <h3 className="text-xl font-semibold text-taxable-dark mb-2">No Tax Filings Yet</h3>
                        <p className="text-taxable-gray mb-6">Create your first tax filing to get started</p>
                        <Link href="/onboarding/step1">
                            <button className="h-12 px-6 bg-[#003787] hover:opacity-90 text-white font-semibold rounded-xl transition-all">
                                Create Tax Filing
                            </button>
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}