'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';
import { useApi } from '@/hooks/useApi';

interface Blog {
    _id: string;
    title: string;
    slug: string;
    excerpt?: string;
    summary?: string;
    content?: string;
    featuredImage?: string;
    coverImage?: string;
    category?: string;
    buttonType?: 'consultation' | 'create_account';
    updatedAt: string;
}

const VideoCard = ({ thumbnail, title, duration }: { thumbnail: string; title: string; duration: string }) => (
    <div className="group cursor-pointer">
        <div className="relative aspect-[16/11] w-full rounded-4xl overflow-hidden mb-5 shadow-xs group-hover:shadow-md transition-all duration-300">
            <Image
                src={thumbnail}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-1 text-taxable-blue">
                            <path d="M5 3L19 12L5 21V3Z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
        <div className="text-left px-1">
            <h3 className="text-5 font-bold text-taxable-dark mb-1.5 leading-tight">{title}</h3>
            <p className="text-3 text-taxable-gray font-medium">{duration}</p>
        </div>
    </div>
);

const BlogCard = ({ blog }: { blog: Blog }) => (
    <Link href={`/blog/${blog.slug}`} className="group cursor-pointer block">
        <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden mb-5 bg-slate-50 border border-neutral-100/50">
            {(blog.featuredImage || blog.coverImage) ? (
                <Image
                    src={blog.featuredImage || blog.coverImage || ''}
                    alt={blog.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center opacity-20">
                    <Image src="/icons/docs.svg" alt="placeholder" width={60} height={60} style={{ width: 'auto', height: 'auto' }} />
                </div>
            )}
        </div>
        <div>
            <div className="flex items-center gap-3 mb-2.5">
                <span className="px-2.5 py-1 bg-blue-50 text-taxable-blue text-[11px] font-bold rounded-md uppercase tracking-wider">
                    {blog.category || 'Tax Guide'}
                </span>
                <span className="text-2 font-semibold text-neutral-400">
                    {new Date(blog.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
            </div>
            <h3 className="text-[20px] font-bold text-taxable-dark mb-2 leading-tight group-hover:text-taxable-blue transition-colors">{blog.title}</h3>
            <p className="text-3 text-taxable-gray font-medium line-clamp-2 leading-relaxed">
                {blog.excerpt || blog.summary || blog.content?.replace(/<[^>]*>/g, '').slice(0, 120) + '...'}
            </p>
        </div>
    </Link>
);

const FAQAccordion = ({ question, answer }: { question: string; answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="mb-4">
            <div className="bg-slate-50 rounded-3xl overflow-hidden transition-all border border-transparent hover:border-neutral-100">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-8 py-6 flex items-center justify-between text-left transition-all"
                >
                    <div className="pr-4">
                        <h3 className="text-4 font-bold text-taxable-dark leading-snug">{question}</h3>
                        {!isOpen && (
                            <p className="text-3 text-taxable-gray font-medium mt-1.5 line-clamp-1">
                                {answer}
                            </p>
                        )}
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
                        className="text-slate-400 transition-transform duration-300 shrink-0"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>
                {isOpen && (
                    <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-[16px] text-taxable-gray font-medium leading-relaxed">
                            {answer}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function EducationalResources() {
    const [activeTab, setActiveTab] = useState('Blog/Articles');
    const [activeFAQCategory, setActiveFAQCategory] = useState('General Tax Questions');
    const [isSupportDropdownOpen, setIsSupportDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { get } = useApi();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [blogsLoading, setBlogsLoading] = useState(true);

    const fetchBlogs = useCallback(async () => {
        try {
            setBlogsLoading(true);
            console.log("Fetching blogs from /blogs...");
            const response = await get('/blogs', { useToken: false });
            console.log("Full Blogs Response received:", JSON.stringify(response, null, 2));

            if (response && (response.success === true || response.status === 'success' || response.blogs)) {
                // Highly resilient data extraction
                let blogData = [];

                if (response.data?.blogs && Array.isArray(response.data.blogs)) {
                    blogData = response.data.blogs;
                } else if (response.data?.articles && Array.isArray(response.data.articles)) {
                    blogData = response.data.articles;
                } else if (response.data?.blogPosts && Array.isArray(response.data.blogPosts)) {
                    blogData = response.data.blogPosts;
                } else if (Array.isArray(response.data)) {
                    blogData = response.data;
                } else if (response.blogs && Array.isArray(response.blogs)) {
                    blogData = response.blogs;
                } else if (response.data?.data?.blogs && Array.isArray(response.data.data.blogs)) {
                    blogData = response.data.data.blogs;
                }

                console.log("SUCCESS: Final Extracted Blogs count:", blogData.length);
                setBlogs(blogData);
            } else {
                console.warn("API returned invalid success state or missing data. Response keys:", response ? Object.keys(response) : "null/undefined");
            }
        } catch (err) {
            console.error("Critical error in fetchBlogs flow:", err);
        } finally {
            setBlogsLoading(false);
        }
    }, [get]);

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

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
            answer: "Your TIN is a unique number issued by FIRS. Here's how to register for a new TIN or retrieve your existing one via the FIRS portal."
        },
        {
            question: "When is the tax filing deadline for 2026?",
            answer: "Individual tax returns must be filed by March 31, 2026. Here's what you need to know about penalties for late filing."
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
        <div className="min-h-screen bg-neutral-50">
            <DashboardHeader />

            <main className="max-w-[1240px] mx-auto pt-6 md:pt-8 pb-20 px-4 md:px-6">
                {/* Back Button & Breadcrumbs */}
                <div className="mb-10">
                    <Link href="/home" className="flex items-center gap-2 group mb-4">
                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center transition-colors group-hover:bg-neutral-200">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-taxable-dark">
                                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                            </svg>
                        </div>
                        <span className="text-4 font-bold text-taxable-dark">Back</span>
                    </Link>
                    <div className="flex items-center gap-2 text-[14px] font-medium text-taxable-gray">
                        <Link href="/home" className="hover:text-taxable-dark transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-taxable-dark font-semibold">Educational resources</span>
                    </div>
                </div>

                {/* Header Section */}
                <div className="flex items-start justify-between mb-12">
                    <div className="flex-1">
                        <h1 className="text-[22px] md:text-[28px] font-bold text-taxable-dark mb-2 md:mb-3">Help Center & Resources</h1>
                        <p className="text-3 md:text-4 text-taxable-gray font-medium max-w-[500px] leading-relaxed">
                            Everything you need to understand Nigerian taxes and make the most of Taxable
                        </p>
                    </div>
                    <div className="relative shrink-0 ml-4" ref={dropdownRef}>
                        <button
                            onClick={() => setIsSupportDropdownOpen(!isSupportDropdownOpen)}
                            className="h-[46px] md:h-[52px] px-4 md:px-8 bg-white border border-neutral-100 rounded-2xl text-[14px] md:text-3 font-bold text-taxable-dark shadow-xs hover:shadow-md transition-all flex items-center whitespace-nowrap"
                        >
                            <span className="hidden sm:inline">Contact support</span>
                            <span className="sm:hidden">Support</span>
                        </button>

                        {isSupportDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsSupportDropdownOpen(false)} />
                                <div className="absolute top-full mt-2 right-0 w-[280px] bg-white border border-neutral-100 rounded-4xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="flex flex-col gap-1">
                                        <button className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-neutral-50 transition-colors text-taxable-dark text-[16px] font-bold text-left">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-neutral-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg>
                                            Chat with support
                                        </button>
                                        <a href="mailto:support@taxable.ng" className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-neutral-50 transition-colors text-taxable-dark text-[16px] font-bold">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-neutral-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                            support@taxable.ng
                                        </a>
                                        <button className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-neutral-50 transition-colors text-taxable-dark text-[16px] font-bold text-left">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-neutral-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19c0-1.657 2.239-3 5-3s5 1.343 5 3v1.662" /></svg>
                                            Consult an Accountant
                                        </button>
                                        <button className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-neutral-50 transition-colors text-taxable-dark text-[16px] font-bold text-left">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-neutral-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><path d="M8 6h10" /><path d="M8 10h10" /><path d="M8 14h10" /></svg>
                                            Visit FIRS Resources
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Debug Info (Visible only in development) */}
                <div className="hidden">
                    Tab: {activeTab}, Blogs: {blogs.length}, Loading: {blogsLoading ? 'YES' : 'NO'}
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-8 md:gap-12 border-b border-neutral-100 mb-8 md:mb-12 overflow-x-auto no-scrollbar scroll-smooth">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 md:pb-5 text-3 md:text-4 font-bold transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-taxable-blue' : 'text-taxable-gray'
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14">
                        {videos.map((video, index) => (
                            <VideoCard key={index} {...video} />
                        ))}
                    </div>
                )}

                {activeTab === 'Frequently Asked Questions' && (
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-start">
                        {/* FAQ Sidebar */}
                        <div className="w-full lg:w-[303px] bg-white rounded-3xl border border-neutral-100 p-4 shadow-xs shrink-0 lg:sticky lg:top-28">
                            <h4 className="text-3 font-bold text-taxable-dark mb-4 px-3">Select</h4>
                            <div className="flex flex-col gap-1.5">
                                {faqCategories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setActiveFAQCategory(category)}
                                        className={`w-full h-12 flex items-center justify-between px-3 transition-all rounded-xl ${activeFAQCategory === category ? 'bg-slate-100 text-taxable-dark' : 'hover:bg-neutral-50 text-taxable-gray'
                                            }`}
                                    >
                                        <span className={`text-[14.5px] ${activeFAQCategory === category ? 'font-bold' : 'font-semibold'}`}>{category}</span>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`transition-colors ${activeFAQCategory === category ? 'text-taxable-dark' : 'text-neutral-300'}`}>
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* FAQ Content */}
                        <div className="flex-1 max-w-[840px]">
                            <div className="space-y-4">
                                {faqs.map((faq, index) => (
                                    <FAQAccordion key={index} {...faq} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Blog/Articles' && (
                    <>
                        {blogsLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14 animate-pulse">
                                {[1, 2, 3].map(i => (
                                    <div key={i}>
                                        <div className="aspect-[16/10] bg-neutral-100 rounded-3xl mb-5" />
                                        <div className="h-4 bg-neutral-100 rounded w-1/4 mb-3" />
                                        <div className="h-6 bg-neutral-100 rounded w-3/4 mb-2" />
                                        <div className="h-4 bg-neutral-100 rounded w-full" />
                                    </div>
                                ))}
                            </div>
                        ) : blogs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14">
                                {blogs.map((blog) => (
                                    <BlogCard key={blog._id} blog={blog} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center bg-white rounded-4xl border border-neutral-100">
                                <div className="flex items-center justify-center mx-auto mb-6">
                                    <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center">
                                        <Image src="/icons/docs.svg" alt="empty" width={40} height={40} className="opacity-40" style={{ width: 'auto', height: 'auto' }} />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-taxable-dark mb-2">No articles yet</h3>
                                <p className="text-taxable-gray font-medium">We're currently preparing some insightful tax guides for you.</p>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
