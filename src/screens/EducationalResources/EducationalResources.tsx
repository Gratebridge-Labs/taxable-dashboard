'use client';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';

const VideoCard = ({ thumbnail, title, duration }: { thumbnail: string; title: string; duration: string }) => (
    <div className="group cursor-pointer">
        <div className="relative aspect-[16/11] w-full rounded-[32px] overflow-hidden mb-5 shadow-xs group-hover:shadow-md transition-all duration-300">
            <Image
                src={thumbnail}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#003787" className="ml-1">
                            <path d="M5 3L19 12L5 21V3Z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
        <div className="text-left px-1">
            <h3 className="text-[19px] font-bold text-taxable-dark mb-1.5 leading-tight">{title}</h3>
            <p className="text-[15px] text-taxable-gray font-medium">{duration}</p>
        </div>
    </div>
);

const FAQAccordion = ({ question, answer }: { question: string; answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="mb-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-8 py-6 bg-[#F8FAFC] rounded-[20px] flex items-center justify-between text-left transition-all hover:bg-gray-100"
            >
                <div>
                    <h3 className="text-base font-medium text-taxable-dark mb-1">{question}</h3>
                    <p className={`text-sm text-taxable-gray font-medium transition-all ${isOpen ? 'opacity-100 mt-2' : 'opacity-100 line-clamp-1'}`}>
                        {answer}
                    </p>
                </div>
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
        </div>
    );
};

export default function EducationalResources() {
    const [activeTab, setActiveTab] = useState('Video Tutorials');
    const [activeFAQCategory, setActiveFAQCategory] = useState('General Tax Questions');
    const [isSupportDropdownOpen, setIsSupportDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const tabs = ['Video Tutorials', 'Blog/Articles', 'Frequently Asked Questions'];

    const faqCategories = [
        'General Tax Questions',
        'Using Taxable',
        'Filing & Payment'
    ];

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
        },
        {
            question: "When is the tax filing deadline for 2026?",
            answer: "Individual tax returns must be filed by March 31, 2026. Here's what you need to know.."
        }
    ];

    const videos = [
        {
            thumbnail: '/taxable_tour_thumbnail.png',
            title: 'The Taxable Tour',
            duration: '8:37 mins'
        },
        {
            thumbnail: '/tax_reforms_thumbnail.png',
            title: "Nigeria's 2026 Tax Reforms Explained",
            duration: '8:37 mins'
        },
        {
            thumbnail: '/tax_reforms_thumbnail.png',
            title: "Nigeria's 2026 Tax Reforms Explained",
            duration: '8:37 mins'
        }
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsSupportDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen bg-[#FBFBFB]">
            <DashboardHeader />

            <main className="max-w-[1240px] mx-auto pt-8 pb-20 px-6">
                {/* Back Button & Breadcrumbs */}
                <div className="mb-8">
                    <Link href="/home" className="flex items-center gap-2 group mb-4">
                        <div className="w-8 h-8 rounded-full bg-[#F5F5F3] flex items-center justify-center transition-colors group-hover:bg-gray-200">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-taxable-dark">
                                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                            </svg>
                        </div>
                        <span className="text-[15px] font-bold text-taxable-dark">Back</span>
                    </Link>
                    <div className="flex items-center gap-2 text-[13px] font-medium text-taxable-gray">
                        <Link href="/home" className="hover:text-taxable-dark transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-taxable-dark">Educational resources</span>
                    </div>
                </div>

                {/* Header Section */}
                <div className="flex items-start justify-between mb-10">
                    <div>
                        <h1 className="text-2xl font-medium text-taxable-dark mb-3">Help Center & Resources</h1>
                        <p className="text-lg text-taxable-gray font-medium max-w-[500px] leading-relaxed">
                            Everything you need to understand Nigerian taxes and make the most of Taxable
                        </p>
                    </div>
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsSupportDropdownOpen(!isSupportDropdownOpen)}
                            className="h-[52px] px-7 bg-white border border-gray-100 rounded-[18px] text-[15px] font-bold text-taxable-dark shadow-xs hover:shadow-md transition-all flex items-center gap-2"
                        >
                            Contact support
                        </button>

                        {isSupportDropdownOpen && (
                            <div className="absolute top-14 right-0 w-[240px] bg-white rounded-[24px] shadow-2xl border border-gray-50 p-2 z-50 animate-in fade-in zoom-in duration-200">
                                <button className="w-full flex items-center gap-3 p-3 hover:bg-[#F8FAFC] rounded-xl transition-all group">
                                    <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] group-hover:bg-white flex items-center justify-center transition-colors">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-taxable-dark">Chat with support</span>
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 hover:bg-[#F8FAFC] rounded-xl transition-all group">
                                    <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] group-hover:bg-white flex items-center justify-center transition-colors">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-taxable-dark">support@taxable.ng</span>
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 hover:bg-[#F8FAFC] rounded-xl transition-all group">
                                    <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] group-hover:bg-white flex items-center justify-center transition-colors">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-taxable-dark">Consult an Accountant</span>
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 hover:bg-[#F8FAFC] rounded-xl transition-all group">
                                    <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] group-hover:bg-white flex items-center justify-center transition-colors">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-taxable-dark">Visit FIRS Resources</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-10 border-b border-gray-100 mb-12">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-lg font-medium transition-all relative ${activeTab === tab ? 'text-taxable-blue' : 'text-taxable-gray'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-taxable-blue rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content Sections */}
                {activeTab === 'Video Tutorials' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                        {videos.map((video, index) => (
                            <VideoCard key={index} {...video} />
                        ))}
                    </div>
                )}

                {activeTab === 'Frequently Asked Questions' && (
                    <div className="flex gap-12">
                        {/* FAQ Sidebar */}
                        <div className="w-[303px] h-[184px] bg-white rounded-[20px] border border-gray-100 p-3 shadow-sm flex flex-col shrink-0">
                            <h4 className="text-base font-medium text-taxable-dark mb-3 px-2">Select</h4>
                            <div className="flex flex-col gap-1 items-center">
                                {faqCategories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setActiveFAQCategory(category)}
                                        className={`w-[279px] h-[37px] flex items-center justify-between px-3 transition-all rounded-[8px] ${activeFAQCategory === category ? 'bg-[#F1F5F9] text-taxable-dark' : 'hover:bg-gray-50 text-taxable-gray'
                                            }`}
                                    >
                                        <span className={`text-sm ${activeFAQCategory === category ? 'font-semibold' : 'font-medium'}`}>{category}</span>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={activeFAQCategory === category ? 'text-taxable-dark' : 'text-gray-300'}>
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* FAQ Content */}
                        <div className="flex-1 max-w-[800px]">
                            {faqs.map((faq, index) => (
                                <FAQAccordion key={index} {...faq} />
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'Blog/Articles' && (
                    <div className="py-20 text-center">
                        <div className="flex items-center justify-center mx-auto mb-6">
                            <Image src="/icons/docs.svg" alt="empty" width={52} height={52} />
                        </div>
                        <h3 className="text-lg font-bold text-taxable-dark mb-2">No content yet</h3>
                        <p className="text-taxable-gray font-medium">We're currently preparing some great articles for you.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
