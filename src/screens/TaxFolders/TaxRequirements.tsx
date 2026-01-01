'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const NavItem = ({ iconSrc, label, active = false, href = "#" }: { iconSrc: string; label: string; active?: boolean; href?: string }) => (
    <Link
        href={href}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all whitespace-nowrap ${active
            ? 'text-taxable-blue bg-taxable-blue/5'
            : 'text-taxable-gray hover:text-taxable-dark hover:bg-gray-50'
            }`}
    >
        <Image src={iconSrc} alt={label} width={18} height={18} className={active ? '' : 'opacity-60'} />
        <span>{label}</span>
    </Link>
);

const TaxCard = ({ title, description, badge = "Not started", buttonLabel = "Start filing", href = "#" }: { title: string; description: string; badge?: string; buttonLabel?: string; href?: string }) => (
    <div className="flex flex-col w-[303px] min-h-[398px] h-full">
        {/* Card Header Illustration Placeholder */}
        <div className="w-full aspect-[4/3] bg-[#F1F5F9] rounded-[32px] mb-8 flex items-center justify-center">
            <div className="w-full px-14 space-y-4">
                <div className="h-2.5 w-1/3 bg-[#E2E8F0] rounded-full" />
                <div className="h-2.5 w-3/4 bg-[#E2E8F0] rounded-full opacity-60" />
                <div className="h-2.5 w-1/2 bg-[#E2E8F0] rounded-full opacity-60" />
            </div>
        </div>

        <h3 className="text-xl font-semibold text-taxable-dark mb-2.5">{title}</h3>
        <p className="text-base text-taxable-gray font-medium leading-relaxed mb-6">
            {description}
        </p>

        <div className="mt-auto">
            <div className="inline-flex px-3 py-1 bg-taxable-lightgray text-taxable-dark text-[13px] font-medium rounded-full w-fit mb-6 uppercase tracking-wider">
                {badge}
            </div>

            <Link
                href={href}
                className="w-fit h-12 px-8 flex items-center justify-center bg-taxable-blue text-taxable-light font-bold rounded-xl hover:bg-[#002b6d] transition-all"
            >
                {buttonLabel}
            </Link>
        </div>
    </div>
);

export default function TaxRequirements() {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans pb-20">
            {/* Header */}
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
                    <div className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shadow-sm flex items-center justify-center cursor-pointer hover:border-taxable-blue/30 transition-colors">
                        <Image src="/icons/profile.svg" alt="Profile" width={28} height={28} className="opacity-80" />
                    </div>
                </div>
            </header>

            <main className="max-w-[1280px] mx-auto px-12 py-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm font-medium text-taxable-dark hover:text-taxable-blue transition-colors mb-4"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back
                </button>

                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[13px] text-[#94A3B8] font-medium mb-12">
                    <span>Home</span>
                    <span>/</span>
                    <span className="text-[#64748B]">Personal Income tax</span>
                </div>

                <div className="mb-12">
                    <h1 className="text-2xl font-medium text-taxable-dark mb-3">Your 2026 Tax Filing Requirements</h1>
                    <p className="text-[15px] text-[#64748B] font-medium">Based on the information you provided, these are the taxes you're <br /> required to file</p>
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
                    <button className="h-14 px-8 bg-[#00388D] text-white font-bold rounded-2xl hover:bg-[#002b6d] transition-all">
                        Get started with 2026 taxes
                    </button>
                    <button className="h-14 px-8 bg-white border border-gray-100 text-taxable-dark font-bold rounded-2xl hover:bg-gray-50 transition-all">
                        Watch more guides
                    </button>
                </div>
            </main>
        </div>
    );
}
