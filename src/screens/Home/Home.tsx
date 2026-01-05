'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SetupSidebar from '@/components/SetupSidebar/SetupSidebar';
import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';
import { useApi } from '@/hooks/useApi';
import { useUser } from '@/contexts/UserContext';

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

const TaxFolderCard = ({
    title,
    valueText,
    description,
    status,
    statusText,
    isInactive = false,
    onClick
}: {
    title: string,
    valueText: string,
    description: string,
    status: 'complete' | 'progress' | 'none' | 'filed',
    statusText: string,
    isInactive?: boolean,
    onClick?: () => void
}) => (
    <div
        onClick={onClick}
        className={`group cursor-pointer ${isInactive ? 'pointer-events-none opacity-80' : ''}`}
    >
        <div className="w-full h-[323px] bg-white rounded-[34px] border border-gray-100 p-6 shadow-xs hover:shadow-md transition-all flex flex-col">
            {/* Icon Container */}
            <div className={`w-full h-[145px] rounded-[24px] flex items-center justify-center mb-5 ${isInactive ? 'bg-[#F5F5F5]' : 'bg-[#FAFAFA]'}`}>
                <Image
                    src={isInactive ? "/icons/inactive_folder.svg" : "/icons/folder.svg"}
                    alt="folder"
                    width={60}
                    height={58}
                    className="transition-transform group-hover:scale-110 duration-500"
                />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-start text-left">
                <h3 className="text-[19px] font-bold text-taxable-dark mb-1.5">{title}</h3>
                <p className="text-sm font-semibold text-taxable-dark mb-1">{valueText}</p>
                <div className="relative w-full">
                    <p className="text-[13px] text-taxable-gray font-medium leading-relaxed mb-4 line-clamp-2">
                        {description}
                    </p>
                </div>

                <div className="mt-auto">
                    <StatusBadge type={status} text={statusText} />
                </div>
            </div>
        </div>
    </div>
);

const VideoCard = ({ thumbnail, title, duration }: { thumbnail: string; title: string; duration: string }) => (
    <div className="group cursor-pointer">
        <div className="relative aspect-[16/10] w-full rounded-[24px] overflow-hidden mb-4 shadow-xs group-hover:shadow-md transition-all duration-300">
            <Image
                src={thumbnail}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#003787" className="ml-0.5">
                        <path d="M5 3L19 12L5 21V3Z" />
                    </svg>
                </div>
            </div>
        </div>
        <div className="text-left px-0.5">
            <h3 className="text-[17px] font-semibold text-taxable-dark mb-1 leading-tight">{title}</h3>
            <p className="text-sm text-taxable-gray font-medium">{duration}</p>
        </div>
    </div>
);

const FAQItem = ({ question, answer }: { question: string; answer: string }) => (
    <div className="w-full bg-taxable-lightgray2 rounded-[18px] p-6 mb-3 cursor-pointer">
        <h4 className="text-[15px] font-medium text-taxable-dark mb-1.5">{question}</h4>
        <p className="text-[14px] text-taxable-gray font-medium leading-relaxed">{answer}</p>
    </div>
);

const FAQSection = () => {
    const [activeTab, setActiveTab] = useState('FAQs');
    const tabs = ['FAQs', 'Guides', '2026 Reforms'];

    const faqs = [
        {
            question: "Do I need to file taxes if I'm self-employed?",
            answer: "Yes. If you earn income from freelancing, online business, or any self-employment"
        },
        {
            question: "What's my Tax Identification Number (TIN) and how do I get one?",
            answer: "Your TIN is a unique number issued by FIRS. Here's how to register..."
        },
        {
            question: "When is the tax filing deadline for 2026?",
            answer: "Individual tax returns must be filed by March 31, 2026. Here's what you need to know.."
        }
    ];

    return (
        <div className="mt-24 pb-20">
            <h2 className="text-2xl font-medium text-taxable-dark mb-8">Common Tax Questions</h2>

            <div className="flex gap-10 border-b border-gray-100 mb-8 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-[15px] font-bold transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-[#003787]' : 'text-taxable-gray'
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#003787] rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            <div className="max-w-[760px] flex flex-col gap-3 text-[17px] font-medium text-taxable-gray">
                {activeTab === 'FAQs' ? (
                    faqs.map((faq, index) => (
                        <FAQItem key={index} {...faq} />
                    ))
                ) : activeTab === 'Guides' ? (
                    <div className="py-8">GUIDES</div>
                ) : (
                    <div className="py-8">TAX REFORM</div>
                )}
            </div>
        </div>
    );
};


export default function Home() {
    const { user, isAuthenticated, loading: authLoading } = useUser();
    const { get } = useApi();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [hasTaxFolders, setHasTaxFolders] = useState(false);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const fetchProfiles = useCallback(async () => {
        if (!isAuthenticated || authLoading) return;

        try {
            const response = await get('/taxableprofile/list');

            if (response?.success) {
                const profileList = response.data?.profiles || [];
                const count = response.data?.count ?? profileList.length;

                setProfiles(profileList);
                setHasTaxFolders(count > 0);
            }
        } catch (err) {
            console.error("❌ Failed to fetch tax profiles:", err);
        } finally {
            setIsInitialLoading(false);
        }
    }, [get, isAuthenticated, authLoading]);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    const videos = [
        {
            thumbnail: "/thumbnails/tour.png",
            title: "The Taxable Tour",
            duration: "8:37 mins"
        },
        {
            thumbnail: "/thumbnails/reforms.png",
            title: "Nigeria's 2026 Tax Reforms Explained",
            duration: "8:37 mins"
        },
        {
            thumbnail: "/thumbnails/reforms.png",
            title: "Nigeria's 2026 Tax Reforms Explained",
            duration: "8:37 mins"
        }
    ];

    const router = useRouter();
    const [resumeProfileId, setResumeProfileId] = useState<string | null>(null);
    const [resumeData, setResumeData] = useState<{ year?: string; category?: string } | undefined>(undefined);

    const handleFolderClick = (profile: any) => {
        if (!profile.baseQuestionsAnswered) {
            setResumeProfileId(profile.profileId);
            setResumeData({
                year: profile.year,
                category: profile.profileType
            });
            setIsSidebarOpen(true);
        } else {
            router.push(`/tax-folders/pit?id=${profile.profileId}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans">
            <DashboardHeader />

            {/* Main Content */}
            <main className="max-w-[1280px] mx-auto px-12 py-16">
                {isInitialLoading || authLoading ? (
                    <div className="flex flex-col gap-8 animate-pulse text-left">
                        <div className="space-y-4">
                            <div className="h-10 bg-gray-200 rounded-lg w-1/3"></div>
                            <div className="h-6 bg-gray-200 rounded-lg w-1/2"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="aspect-[16/10] bg-gray-200 rounded-[24px]"></div>
                            ))}
                        </div>
                    </div>
                ) : !hasTaxFolders ? (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                            <div>
                                <h1 className="text-[32px] font-bold text-taxable-dark mb-2 tracking-tight">
                                    Hello, {user?.firstName}. Welcome to Taxable
                                </h1>
                                <p className="text-[17px] text-taxable-gray font-medium leading-relaxed max-w-xl">
                                    The 2026 tax cycle is currently active. Let's make sure you're compliant.
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="h-12 px-6 bg-[#003787] hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-sm whitespace-nowrap"
                                >
                                    Get started with 2026 taxes
                                </button>
                                <Link
                                    href="/tax-folders/requirements"
                                    className="h-12 px-6 bg-white border border-gray-100 hover:bg-gray-50 text-taxable-dark font-bold rounded-xl transition-all shadow-sm flex items-center justify-center whitespace-nowrap"
                                >
                                    Watch more guides
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {videos.map((video, index) => (
                                <VideoCard key={index} {...video} />
                            ))}
                        </div>

                        <FAQSection />
                    </>
                ) : (
                    <div className="animate-in fade-in duration-700">
                        <div className="mb-14 flex flex-col md:flex-row justify-between items-start gap-6">
                            <div>
                                <h1 className="text-[28px] font-semibold text-taxable-dark mb-2 tracking-tight">
                                    Hello, {user?.firstName}, Welcome back
                                </h1>
                                <p className="text-base text-taxable-gray font-medium">
                                    You have {profiles.length} tax filing{profiles.length !== 1 ? 's' : ''} ready for 2026. Click any card to begin.
                                </p>
                            </div>

                            <Link href="/educational-resources" className="flex items-center gap-4 text-left group">
                                <Image
                                    src="/icons/docs.svg"
                                    alt="educational resources"
                                    width={42}
                                    height={33}
                                />
                                <span className="text-[17px] font-bold text-taxable-dark group-hover:text-taxable-blue transition-colors">Educational resources</span>
                                <svg
                                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    stroke="#737373" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                                    className="group-hover:translate-x-1 transition-transform group-hover:stroke-taxable-blue"
                                >
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </Link>
                        </div>

                        {/* Dynamic Tax Filings Sections */}
                        {Object.entries(
                            profiles.reduce((acc: Record<string, any[]>, profile) => {
                                const year = profile.year || '2026';
                                if (!acc[year]) acc[year] = [];
                                acc[year].push(profile);
                                return acc;
                            }, {})
                        ).sort(([yearA], [yearB]) => Number(yearB) - Number(yearA)).map(([year, yearProfiles]) => (
                            <section key={year} className="mb-16 last:mb-0">
                                <div className="flex justify-between items-center mb-10">
                                    <h2 className="text-2xl font-bold text-taxable-dark">{year} Tax Filings</h2>
                                    <button
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="h-12 px-6 bg-[#003787] hover:opacity-90 text-white font-semibold rounded-xl transition-all"
                                    >
                                        Create another tax filing
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {yearProfiles.map((profile, index) => (
                                        <TaxFolderCard
                                            key={profile._id || profile.profileId || index}
                                            title={profile.title || `${profile.year || year} ${profile.profileType || 'Tax'}`}
                                            valueText={profile.taxDue ? `Tax Due - ₦${profile.taxDue.toLocaleString()}` : "Calculation in progress"}
                                            description={profile.description || `Your ${profile.profileType?.toLowerCase() || 'tax'} filing for the ${profile.year || year} tax year.`}
                                            status={profile.status === 'draft' ? 'progress' : (profile.status || "none")}
                                            statusText={profile.statusText || (profile.status === 'draft' ? 'In progress' : 'Not started')}
                                            onClick={() => handleFolderClick(profile)}
                                        />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
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
