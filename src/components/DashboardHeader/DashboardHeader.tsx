'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';

export default function DashboardHeader() {
    const pathname = usePathname();
    const { user: _user } = useUser();
    const [showSupport, setShowSupport] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <header className="w-full h-16 bg-[#F5F5F5] border-b border-[#F5F5F5] sticky top-0 z-50">
            <div className="max-w-[1400px] mx-auto w-full h-full flex items-center px-4 md:px-8">
                {/* Left Section: Mobile Menu Icon & Logo */}
                <div className="flex-1 flex items-center gap-3">
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="md:hidden p-2 -ml-2 text-taxable-dark hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                    <Link href="/home" className="flex items-center w-fit">
                        <Image
                            src="/logo_blue.svg"
                            alt="Taxable"
                            width={80}
                            height={48}
                            className="md:w-[76px] md:h-[46px] w-[60px] h-[36px]"
                            priority
                        />
                    </Link>
                </div>

                {/* Center Section: Navigation (Desktop) */}
                <nav className="hidden md:flex items-center gap-4">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${isActive
                                    ? 'text-taxable-blue font-bold bg-blue-50/50'
                                    : 'text-taxable-gray font-medium hover:text-taxable-dark hover:bg-gray-50'
                                    }`}
                                title={link.name}
                            >
                                {link.icon}
                                <span className="text-[15px]">{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Section: Support Button */}
                <div className="flex-1 flex items-center justify-end gap-3 md:gap-4 relative">
                    <button
                        onClick={() => setShowSupport(!showSupport)}
                        className="px-3 md:px-5 h-[42px] md:h-[46px] border-none bg-white rounded-[12px] text-[13px] md:text-[14px] font-bold text-taxable-dark hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-2"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span className="hidden sm:inline">Contact support</span>
                        <span className="sm:hidden">Help</span>
                    </button>

                    {showSupport && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowSupport(false)} />
                            <div className="absolute top-full mt-2 right-0 w-[280px] bg-white border border-gray-100 rounded-[32px] shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="flex flex-col gap-1">
                                    <button className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-gray-50 transition-colors text-taxable-dark text-[14px] font-semibold text-left">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg>
                                        Chat with support
                                    </button>
                                    <a href="mailto:support@taxable.ng" className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-gray-50 transition-colors text-taxable-dark text-[14px] font-semibold font-sans">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                        support@taxable.ng
                                    </a>
                                    <button className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-gray-50 transition-colors text-taxable-dark text-[14px] font-semibold text-left">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19c0-1.657 2.239-3 5-3s5 1.343 5 3v1.662" /></svg>
                                        Consult Accountant
                                    </button>
                                    <button className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-gray-50 transition-colors text-taxable-dark text-[14px] font-semibold text-left">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><path d="M8 6h10" /><path d="M8 10h10" /><path d="M8 14h10" /></svg>
                                        Visit FIRS Resources
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Sidebar Navigation */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 md:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[60] shadow-2xl p-6 md:hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <Image
                                    src="/logo_blue.svg"
                                    alt="Taxable"
                                    width={80}
                                    height={48}
                                />
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 text-taxable-gray hover:text-taxable-dark rounded-lg transition-colors"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            <nav className="flex flex-col gap-2">
                                {navLinks.map((link) => {
                                    const isActive = pathname === link.href;
                                    return (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${isActive
                                                ? 'bg-blue-50 text-taxable-blue font-bold shadow-sm shadow-blue-100/50'
                                                : 'text-taxable-gray font-semibold hover:bg-gray-50 hover:text-taxable-dark'
                                                }`}
                                        >
                                            <div className={`${isActive ? 'text-taxable-blue' : 'text-gray-400'}`}>
                                                {link.icon}
                                            </div>
                                            <span className="text-[16px]">{link.name}</span>
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="mt-auto pt-6 border-t border-gray-100">
                                <p className="text-[12px] text-gray-400 font-medium px-4">© 2026 Taxable Nigeria</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}
