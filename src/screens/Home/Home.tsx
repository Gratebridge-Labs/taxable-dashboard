'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SetupSidebar from '@/components/SetupSidebar/SetupSidebar';

const NavItem = ({ iconSrc, label, href = "#" }: { iconSrc: string; label: string; href?: string }) => (
    <Link href={href} className="flex items-center gap-2 px-2 py-2 text-base font-medium text-taxable-gray hover:text-taxable-blue hover:bg-gray-50 rounded-xl transition-all group whitespace-nowrap">
        <Image src={iconSrc} alt={label} width={20} height={20} className="opacity-50 group-hover:opacity-100 transition-opacity" />
        <span className="tracking-tight">{label}</span>
    </Link>
);

const VideoCard = ({ thumbnail, title, duration }: { thumbnail: string; title: string; duration: string }) => (
    <div className="group cursor-pointer">
        <div className="relative w-[410px] h-[265px] rounded-[24px] overflow-hidden mb-5 shadow-sm group-hover:shadow-md transition-all duration-300">
            <Image
                src={thumbnail}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/20">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="ml-1">
                        <path d="M5 3L19 12L5 21V3Z" />
                    </svg>
                </div>
            </div>
        </div>
        <div className="w-[410px] text-left">
            <h3 className="text-xl font-semibold text-taxable-dark mb-1.5 leading-tight">{title}</h3>
            <p className="text-base text-taxable-gray font-medium">{duration}</p>
        </div>
    </div>
);

export default function Home() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col items-center">
            {/* Header */}
            <header className="w-full h-24 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-12 sticky top-0 z-50 transition-all">
                <div className="flex-1 flex items-center">
                    <Link href="/">
                        <Image
                            src="/logo_blue.svg"
                            alt="Taxable"
                            width={100}
                            height={61}
                            priority
                        />
                    </Link>
                </div>

                <nav className="hidden md:flex items-center justify-center gap-3 lg:gap-4">
                    <NavItem iconSrc="/icons/people.svg" label="Tax folders" href="/tax-folders" />
                    <NavItem iconSrc="/icons/transaction.svg" label="Educational resources" />
                    <NavItem iconSrc="/icons/fees.svg" label="Fees" />
                    <NavItem iconSrc="/icons/notification.svg" label="Push Notifications" />
                </nav>

                <div className="flex-1 flex justify-end items-center">
                    <div className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shadow-sm flex items-center justify-center cursor-pointer hover:border-taxable-blue/30 transition-colors">
                        <Image src="/icons/profile.svg" alt="Profile" width={28} height={28} className="opacity-80" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full max-w-[850px] flex flex-col items-start py-14">
                <div className="mb-10 w-full">
                    <h1 className="text-xl lg:text-2xl font-medium text-taxable-dark mb-1.5 tracking-tightest leading-tight">
                        Hello, Gideon. Welcome to Taxable
                    </h1>
                    <p className="text-base text-taxable-gray font-medium leading-tight max-w-2xl">
                        The 2026 tax cycle is currently active. Let's make sure you're compliant.
                    </p>
                </div>

                <div className="flex flex-wrap items-start gap-6 mb-8">
                    <VideoCard
                        thumbnail="/thumbnails/tour.png"
                        title="The Taxable Tour"
                        duration="8:37 mins"
                    />
                    <VideoCard
                        thumbnail="/thumbnails/reforms.png"
                        title="Nigeria's 2026 Tax Reforms Explained"
                        duration="8:37 mins"
                    />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="h-14 px-10 bg-taxable-blue hover:bg-taxable-blue/90 text-white font-bold rounded-2xl transition-all shadow-xl shadow-taxable-blue/20 active:scale-95"
                    >
                        Get started with 2026 taxes
                    </button>
                    <button className="h-14 px-10 bg-white border border-gray-200 hover:bg-gray-50 text-taxable-dark font-bold rounded-2xl transition-all active:scale-95 shadow-sm">
                        Watch more guides
                    </button>
                </div>
            </main>

            <SetupSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
        </div>
    );
}
