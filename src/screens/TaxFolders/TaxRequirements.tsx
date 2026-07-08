'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';

const TaxCard = ({ title, description, badge = "Not started", buttonLabel = "Start filing", href = "#" }: { title: string; description: string; badge?: string; buttonLabel?: string; href?: string }) => (
    <div className="flex flex-col w-[303px] min-h-[398px] h-full">
        {/* Card Header Illustration Placeholder */}
        <div className="w-full aspect-[4/3] bg-neutral-100 rounded-4xl mb-8 flex items-center justify-center">
            <div className="w-full px-14 space-y-4">
                <div className="h-2.5 w-1/3 bg-neutral-200 rounded-full" />
                <div className="h-2.5 w-3/4 bg-neutral-200 rounded-full opacity-60" />
                <div className="h-2.5 w-1/2 bg-neutral-200 rounded-full opacity-60" />
            </div>
        </div>

        <h3 className="text-xl font-semibold text-taxable-dark mb-2.5">{title}</h3>
        <p className="text-base text-taxable-gray font-medium leading-relaxed mb-6">
            {description}
        </p>

        <div className="mt-auto">
            <div className="inline-flex px-3 py-1 bg-taxable-lightgray text-taxable-dark text-2 font-medium rounded-full w-fit mb-6 uppercase tracking-wider">
                {badge}
            </div>

            <Link
                href={href}
                className="w-fit h-12 px-8 flex items-center justify-center bg-taxable-blue text-taxable-light font-semibold rounded-xl"
            >
                {buttonLabel}
            </Link>
        </div>
    </div>
);

export default function TaxRequirements() {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-white pb-20">
            <DashboardHeader />

            <main className="max-w-[1280px] mx-auto px-12 py-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-3 font-medium text-taxable-dark mb-4"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back
                </button>

                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-2 text-neutral-400 font-medium mb-12">
                    <span>Home</span>
                    <span>/</span>
                    <span className="text-neutral-500">Personal Income tax</span>
                </div>

                <div className="mb-12">
                    <h1 className="text-2xl font-medium text-taxable-dark mb-3">Your 2026 Tax Filing Requirements</h1>
                    <p className="text-3 text-neutral-500 font-medium">Based on the information you provided, these are the taxes you're <br /> required to file</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    <TaxCard
                        title="Personal Income Tax (PIT)"
                        description="Applies to your individual income from salary and business activities."
                        href="/tax-folders/pit"
                    />
                    <TaxCard
                        title="Company Income Tax (CIT)"
                        description="Required for your registered business entity."
                    />
                    <TaxCard
                        title="Company Income Tax (CIT)"
                        description="Required for your registered business entity."
                    />
                </div>

                <div className="flex items-center gap-4">
                    <button className="h-12 px-8 bg-taxable-blue text-white font-semibold rounded-xl">
                        Get started
                    </button>
                    <button className="h-12 px-8 bg-white border border-neutral-100 text-taxable-dark font-semibold rounded-xl">
                        Watch more guides
                    </button>
                </div>
            </main>
        </div>
    );
}
