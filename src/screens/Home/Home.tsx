'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SetupSidebar from '@/components/SetupSidebar/SetupSidebar';
import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';

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
    isInactive = false
}: {
    title: string,
    valueText: string,
    description: string,
    status: 'complete' | 'progress' | 'none' | 'filed',
    statusText: string,
    isInactive?: boolean
}) => (
    <Link href="/tax-folders/pit" className="group">
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
    </Link>
);

const VideoCard = ({ thumbnail, title, duration }: { thumbnail: string; title: string; duration: string }) => (
    <div className="group cursor-pointer">
        <div className="relative aspect-[16/10] w-full rounded-[24px] overflow-hidden mb-4 shadow-xs group-hover:shadow-md transition-all duration-300">
            <Image
                src={thumbnail}
                alt={title}
                fill
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [hasTaxFolders, setHasTaxFolders] = useState(false);

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

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans">
            <DashboardHeader />

            {/* Main Content */}
            <main className="max-w-[1280px] mx-auto px-12 py-16">
                {!hasTaxFolders ? (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                            <div>
                                <h1 className="text-[32px] font-bold text-taxable-dark mb-2 tracking-tight">
                                    Hello, Gideon. Welcome to Taxable
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
                        <div className="mb-14">
                            <h1 className="text-[28px] font-semibold text-taxable-dark mb-2 tracking-tight">
                                Hello, Gideon, Welcome back
                            </h1>
                            <p className="text-base text-taxable-gray font-medium">
                                You have 3 tax filings ready for 2026. Click any card to begin.
                            </p>
                        </div>

                        {/* 2026 Filings */}
                        <section className="mb-16">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-2xl font-bold text-taxable-dark">2026 Tax Filings</h2>
                                <button className="h-12 px-6 bg-[#003787] hover:opacity-90 text-white font-semibold rounded-xl transition-all">
                                    Create another tax filing
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <TaxFolderCard
                                    title="2026 Individual Tax"
                                    valueText="Tax Due - ₦145,000"
                                    description="For your personal income from employment, dividends, and other investments."
                                    status="progress"
                                    statusText="3 of 7 sections complete"
                                />
                                <TaxFolderCard
                                    title="2026 Business Tax"
                                    valueText="Tax Due - ₦420,000"
                                    description="For income from your registered business operations and activities."
                                    status="complete"
                                    statusText="All sections complete"
                                />
                                <TaxFolderCard
                                    title="2026 Joint Spouse Tax"
                                    valueText="Tax Due - ₦420,000"
                                    description="File jointly with your spouse to combine income and potentially reduce tax."
                                    status="none"
                                    statusText="Not started"
                                />
                            </div>
                        </section>

                        {/* 2025 Filings */}
                        <section>
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-2xl font-bold text-taxable-dark">2025 Tax Filings</h2>
                                <button className="h-12 px-6 bg-white border border-gray-200 hover:bg-gray-50 text-taxable-dark font-semibold rounded-xl transition-all">
                                    Add another tax type
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <TaxFolderCard
                                    title="2026 Individual Tax"
                                    valueText="Tax Paid - ₦320,000"
                                    description="Your individual tax filing for the 2025 tax year."
                                    status="filed"
                                    statusText="Tax Filed- March 15, 2026"
                                    isInactive
                                />
                                <TaxFolderCard
                                    title="2026 Individual Tax"
                                    valueText="Tax Paid - ₦320,000"
                                    description="Your individual tax filing for the 2025 tax year."
                                    status="filed"
                                    statusText="Tax Filed- March 15, 2026"
                                    isInactive
                                />
                                <TaxFolderCard
                                    title="2026 Joint Spouse Tax"
                                    valueText="Applies to your individual income from salaries, bonuses, and side hustles."
                                    description="Your joint tax filing for the 2025 tax year."
                                    status="none"
                                    statusText="Not started"
                                    isInactive
                                />
                            </div>
                        </section>
                    </div>
                )}
            </main>

            <SetupSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onComplete={() => {
                    setIsSidebarOpen(false);
                    setHasTaxFolders(true);
                }}
            />
        </div>
    );
}
