'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardHeader() {
    const pathname = usePathname();
    const [showSupport, setShowSupport] = useState(false);

    const navLinks = [
        {
            name: 'Home',
            href: '/home',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            )
        },
        {
            name: 'Profile',
            href: '/profile',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="10" r="3" />
                    <path d="M7 20.662V19c0-1.657 2.239-3 5-3s5 1.343 5 3v1.662" />
                </svg>
            )
        },
        {
            name: 'Notification',
            href: '#',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
            )
        }
    ];

    return (
        <header className="w-full h-20 bg-white border-b border-gray-100 flex items-center px-4 md:px-8 sticky top-0 z-50">
            {/* Left Section: Logo */}
            <div className="flex-1">
                <Link href="/home" className="flex items-center w-fit">
                    <Image
                        src="/logo_blue.svg"
                        alt="Taxable"
                        width={90}
                        height={55}
                        className="md:w-[100px] md:h-[61px]"
                        priority
                    />
                </Link>
            </div>

            {/* Center Section: Navigation */}
            <nav className="flex items-center gap-4">
                {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${isActive
                                ? 'text-taxable-blue font-bold'
                                : 'text-taxable-gray font-medium hover:text-taxable-dark hover:bg-gray-50'
                                }`}
                            title={link.name}
                        >
                            {link.icon}
                            <span className="text-[15px] hidden md:inline">{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Right Section: Button */}
            <div className="flex-1 flex justify-end relative">
                <button
                    onClick={() => setShowSupport(!showSupport)}
                    className="px-3 md:px-5 h-[46px] border border-gray-100 rounded-[12px] text-[14px] font-bold text-taxable-dark hover:shadow-xs hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-2"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:hidden">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span className="hidden md:inline">Talk to an Accountant</span>
                </button>

                {showSupport && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowSupport(false)} />
                        <div className="absolute top-full mt-2 right-0 w-[280px] bg-white border border-gray-100 rounded-[32px] shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex flex-col gap-1">
                                <button className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-gray-50 transition-colors text-taxable-dark text-[16px] font-bold text-left">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg>
                                    Chat with support
                                </button>
                                <a href="mailto:support@taxable.ng" className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-gray-50 transition-colors text-taxable-dark text-[16px] font-bold font-sans">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                    support@taxable.ng
                                </a>
                                <button className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-gray-50 transition-colors text-taxable-dark text-[16px] font-bold text-left">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19c0-1.657 2.239-3 5-3s5 1.343 5 3v1.662" /></svg>
                                    Consult an Accountant
                                </button>
                                <button className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-gray-50 transition-colors text-taxable-dark text-[16px] font-bold text-left">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><path d="M8 6h10" /><path d="M8 10h10" /><path d="M8 14h10" /></svg>
                                    Visit FIRS Resources
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}
