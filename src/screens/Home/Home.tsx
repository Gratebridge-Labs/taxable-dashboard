'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SetupSidebar from '@/components/SetupSidebar/SetupSidebar';

const NavItem = ({ iconSrc, label, href = "#" }: { iconSrc: string; label: string; href?: string }) => (
    <Link href={href} className="flex items-center gap-2 px-3 py-2 text-[15px] font-medium text-taxable-gray hover:text-taxable-dark transition-all group whitespace-nowrap">
        <Image src={iconSrc} alt={label} width={18} height={18} className="opacity-60 group-hover:opacity-100 transition-opacity" />
        <span>{label}</span>
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

export default function Home() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
            {/* Header */}
            <header className="w-full h-24 bg-white border-b border-gray-100 flex items-center px-12 sticky top-0 z-50">
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

                <nav className="hidden md:flex items-center justify-center gap-6">
                    <NavItem iconSrc="/icons/people.svg" label="Tax folders" href="/tax-folders" />
                    <NavItem iconSrc="/icons/transaction.svg" label="Educational resources" />
                    <NavItem iconSrc="/icons/notification.svg" label="Push Notifications" />
                </nav>

                <div className="flex-1 flex justify-end items-center">
                    <div className="w-11 h-11 rounded-full bg-gray-100 overflow-hidden cursor-pointer hover:ring-2 hover:ring-taxable-blue/20 transition-all">
                        {/* Placeholder for profile image */}
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Image src="/icons/profile.svg" alt="Profile" width={28} height={28} className="opacity-40" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-[1280px] mx-auto px-12 py-12">
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-[28px] font-semibold text-taxable-dark mb-2 tracking-tight">
                            Hello, Gideon. Welcome to Taxable
                        </h1>
                        <p className="text-base text-taxable-gray font-medium leading-relaxed max-w-xl">
                            The 2026 tax cycle is currently active. Let's make sure you're compliant.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="h-12 px-6 bg-[#003787] hover:opacity-90 text-white font-semibold rounded-xl transition-all shadow-sm"
                        >
                            Get started with 2026 taxes
                        </button>
                        <Link
                            href="/tax-folders/requirements"
                            className="h-12 px-6 bg-white border border-gray-200 hover:bg-gray-50 text-taxable-dark font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center"
                        >
                            Watch more guides
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {videos.map((video, index) => (
                        <VideoCard key={index} {...video} />
                    ))}
                </div>
            </main>

            <SetupSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
        </div>
    );
}
