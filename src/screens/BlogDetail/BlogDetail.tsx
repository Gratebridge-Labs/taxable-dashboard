'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { MoveLeft, Calendar, User, Share2, ArrowRight, MessageSquare } from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';
import { useApi } from '@/hooks/useApi';

interface Blog {
    _id: string;
    title: string;
    slug: string;
    content: string;
    featuredImage?: string;
    coverImage?: string;
    category?: string;
    buttonType?: 'consultation' | 'create_account';
    author?: {
        fullName: string;
        role?: string;
    };
    updatedAt: string;
}

export default function BlogDetail() {
    const { slug } = useParams();
    const router = useRouter();
    const { get } = useApi();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBlog = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // First attempt: Try to fetch all blogs and find the one with matching slug
            // (Based on your logs, fetching /blogs is reliable)
            const response = await get('/blogs', { useToken: false });

            if (response?.success) {
                const blogData = response.data?.blogs || (Array.isArray(response.data) ? response.data : []);
                const foundBlog = blogData.find((b: any) => b.slug === slug);

                if (foundBlog) {
                    setBlog(foundBlog);
                    return;
                }
            }

            // Fallback attempt: Try direct slug endpoint if not found in list
            const directResponse = await get(`/blogs/${slug}`, { useToken: false });
            if (directResponse?.success) {
                setBlog(directResponse.data?.blog || directResponse.data || null);
            } else {
                setError("Blog post not found");
            }
        } catch (err: any) {
            console.error("Failed to fetch blog:", err);
            setError(err.message || "Failed to load blog post");
        } finally {
            setLoading(false);
        }
    }, [slug, get]);

    useEffect(() => {
        if (slug) fetchBlog();
    }, [slug, fetchBlog]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <DashboardHeader />
                <div className="max-w-[800px] mx-auto pt-16 px-6">
                    <div className="animate-pulse">
                        <div className="h-4 w-24 bg-gray-100 rounded mb-8" />
                        <div className="h-12 w-3/4 bg-gray-100 rounded mb-6" />
                        <div className="h-6 w-1/4 bg-gray-100 rounded mb-12" />
                        <div className="aspect-[21/9] w-full bg-gray-100 rounded-[32px] mb-12" />
                        <div className="space-y-4">
                            <div className="h-4 w-full bg-gray-100 rounded" />
                            <div className="h-4 w-full bg-gray-100 rounded" />
                            <div className="h-4 w-2/3 bg-gray-100 rounded" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen bg-white">
                <DashboardHeader />
                <div className="max-w-[800px] mx-auto pt-20 px-6 text-center">
                    <h2 className="text-2xl font-bold text-taxable-dark mb-4">Post not found</h2>
                    <p className="text-taxable-gray mb-8">The article you're looking for might have been moved or removed.</p>
                    <Link href="/educational-resources" className="inline-flex items-center gap-2 px-6 py-3 bg-taxable-blue text-white rounded-xl font-bold transition-transform hover:scale-105">
                        <MoveLeft size={20} />
                        Back to Resources
                    </Link>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-NG', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-white selection:bg-taxable-blue/10 selection:text-taxable-blue">
            <DashboardHeader />

            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-[800px] mx-auto pt-10 md:pt-16 pb-24 px-6"
            >
                {/* Back Button */}
                <Link href="/educational-resources" className="inline-flex items-center gap-2 text-taxable-gray hover:text-taxable-dark transition-colors mb-8 group">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                        <MoveLeft size={16} />
                    </div>
                    <span className="text-sm font-bold">Back to resources</span>
                </Link>

                {/* Meta & Title */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 bg-blue-50 text-taxable-blue text-[12px] font-bold rounded-full uppercase tracking-wider">
                            {blog.category || 'Tax Guide'}
                        </span>
                        <div className="flex items-center gap-2 text-gray-400 text-sm font-medium border-l border-gray-200 pl-3">
                            <Calendar size={14} />
                            {formatDate(blog.updatedAt)}
                        </div>
                    </div>
                    <h1 className="text-[32px] md:text-[44px] font-extrabold text-taxable-dark leading-[1.15] mb-8">
                        {blog.title}
                    </h1>

                    {/* Author & Share */}
                    <div className="flex items-center justify-between py-6 border-y border-gray-50 mb-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-taxable-blue/10 flex items-center justify-center text-taxable-blue font-bold">
                                {blog.author?.fullName.charAt(0) || 'T'}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-taxable-dark">{blog.author?.fullName || 'Taxable Team'}</p>
                                <p className="text-[12px] text-taxable-gray font-medium">{blog.author?.role || 'Tax Expert'}</p>
                            </div>
                        </div>
                        <button className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-taxable-gray hover:text-taxable-blue hover:border-taxable-blue transition-all">
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Featured Image */}
                {(blog.featuredImage || blog.coverImage) && (
                    <div className="relative aspect-[21/10] w-full rounded-[32px] overflow-hidden mb-12 shadow-2xl shadow-taxable-blue/10">
                        <Image
                            src={blog.featuredImage || blog.coverImage || ''}
                            alt={blog.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                {/* Content */}
                <article className="prose prose-lg max-w-none prose-headings:text-taxable-dark prose-headings:font-bold prose-p:text-taxable-gray prose-p:leading-relaxed prose-a:text-taxable-blue prose-strong:text-taxable-dark">
                    <ReactMarkdown>{blog.content}</ReactMarkdown>
                </article>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-20 p-8 md:p-12 bg-[#001A41] rounded-[40px] text-white relative overflow-hidden"
                >
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="max-w-[440px]">
                            <h3 className="text-2xl md:text-3xl font-bold mb-3">
                                {blog.buttonType === 'consultation'
                                    ? "Need professional tax advice?"
                                    : "Take control of your taxes today"}
                            </h3>
                            <p className="text-gray-400 text-[16px] md:text-[18px] leading-relaxed">
                                {blog.buttonType === 'consultation'
                                    ? "Our expert accountants are ready to help you navigate complex Nigerian tax laws."
                                    : "Join thousands of Nigerians using Taxable to simplify their tax compliance."}
                            </p>
                        </div>

                        {blog.buttonType === 'consultation' ? (
                            <button className="h-[56px] px-8 bg-white text-taxable-dark font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-all shrink-0">
                                <MessageSquare size={20} />
                                Book a consultation
                            </button>
                        ) : (
                            <Link href="/signup" className="h-[56px] px-8 bg-taxable-blue text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shrink-0">
                                Get started
                                <ArrowRight size={20} />
                            </Link>
                        )}
                    </div>
                    {/* Abstract background elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-taxable-blue/20 blur-[100px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-taxable-blue/10 blur-[100px] -ml-32 -mb-32" />
                </motion.div>
            </motion.main>
        </div>
    );
}
