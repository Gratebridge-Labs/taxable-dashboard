'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';

export default function DashboardHeader() {
    const pathname = usePathname();
    useUser();
    const [showSupport, setShowSupport] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        {
            name: 'Home',
            href: '/home',
            icon: (
                <span className="flex items-center justify-center w-5 h-5 shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="block">
                        <path d="M10.772 2.688a2 2 0 0 1 2.456 0l8.384 6.52c.753.587.337 1.792-.615 1.792H20v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8h-.997c-.953 0-1.367-1.206-.615-1.791z" fill="currentColor"/>
                    </svg>
                </span>
            )
        },
        {
            name: 'Profile',
            href: '/profile',
            icon: (
                <span className="flex items-center justify-center w-5 h-5 shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="block">
                        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2M8.5 9.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0m9.758 7.484A7.985 7.985 0 0 1 12 20a7.985 7.985 0 0 1-6.258-3.016C7.363 15.821 9.575 15 12 15s4.637.821 6.258 1.984" fill="currentColor"/>
                    </svg>
                </span>
            )
        },
        {
            name: 'Resources',
            href: '/educational-resources',
            icon: (
                <span className="flex items-center justify-center w-5 h-5 shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="block">
                        <path d="M3.255 3.667A1.01 1.01 0 0 1 4.022 2H16.5a4.5 4.5 0 1 1 0 9H4.022a1.01 1.01 0 0 1-.767-1.667l.754-.88a3 3 0 0 0 0-3.905l-.754-.88ZM3 16.5A4.5 4.5 0 0 1 7.5 12h12.478a1.01 1.01 0 0 1 .767 1.667l-.755.88a3 3 0 0 0 0 3.905l.755.88A1.01 1.01 0 0 1 19.978 21H7.5A4.5 4.5 0 0 1 3 16.5" fill="currentColor"/>
                    </svg>
                </span>
            )
        },
        {
            name: 'Notification',
            href: '#',
            icon: (
                <span className="flex items-center justify-center w-5 h-5 shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="block">
                        <path d="M12 2a7 7 0 0 0-7 7v3.528a1 1 0 0 1-.105.447l-1.717 3.433A1.1 1.1 0 0 0 4.162 18h15.676a1.1 1.1 0 0 0 .984-1.592l-1.716-3.433a1 1 0 0 1-.106-.447V9a7 7 0 0 0-7-7m0 19a3.001 3.001 0 0 1-2.83-2h5.66A3.001 3.001 0 0 1 12 21" fill="currentColor"/>
                    </svg>
                </span>
            )
        }
    ];

    return (
        <header className="w-full h-16 bg-white border-b border-neutral-100">
            <div className="max-w-[1400px] mx-auto w-full h-full flex items-center px-4 md:px-8">
                {/* Left Section: Mobile Menu Icon & Logo */}
                <div className="flex-1 flex items-center gap-3">
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="md:hidden p-2 -ml-2 text-taxable-dark rounded-lg"
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
                                className={`flex items-center gap-1 px-3 py-2 rounded-xl ${isActive
                                    ? 'bg-white text-taxable-blue font-semibold'
                                    : 'text-neutral-400 font-medium'
                                    }`}
                                title={link.name}
                            >
                                {link.icon}
                                <span className="text-3">{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Section: Support Button */}
                <div className="flex-1 flex items-center justify-end gap-3 md:gap-4 relative">
                    <button
                        onClick={() => setShowSupport(!showSupport)}
                        className="px-4 h-12 bg-white border border-neutral-100 text-taxable-dark font-semibold rounded-xl cursor-pointer text-3"
                    >
                        Contact support
                    </button>

                    {showSupport && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowSupport(false)} />
                            <div className="absolute top-full mt-2 right-0 w-[280px] bg-white border border-neutral-200 rounded-4xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="flex flex-col gap-1">
                                    <button className="flex items-center gap-4 px-4 py-3 rounded-2xl text-taxable-dark text-[14px] font-semibold text-left">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-neutral-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg>
                                        Chat with support
                                    </button>
                                    <a href="mailto:support@taxable.ng" className="flex items-center gap-4 px-4 py-3 rounded-2xl text-taxable-dark text-[14px] font-semibold">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-neutral-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                        support@taxable.ng
                                    </a>
                                    <button className="flex items-center gap-4 px-4 py-3 rounded-2xl text-taxable-dark text-[14px] font-semibold text-left">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-neutral-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19c0-1.657 2.239-3 5-3s5 1.343 5 3v1.662" /></svg>
                                        Consult Accountant
                                    </button>
                                    <button className="flex items-center gap-4 px-4 py-3 rounded-2xl text-taxable-dark text-[14px] font-semibold text-left">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-neutral-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><path d="M8 6h10" /><path d="M8 10h10" /><path d="M8 14h10" /></svg>
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
                                    className="p-2 text-taxable-gray rounded-lg"
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
                                            className={`flex items-center gap-4 px-4 py-4 rounded-2xl ${isActive
                                                ? 'bg-white text-taxable-blue font-semibold'
                                                : 'text-neutral-400 font-medium'
                                                }`}
                                        >
                                            {link.icon}
                                            <span className="text-[16px]">{link.name}</span>
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="mt-auto pt-6 border-t border-neutral-200">
                                <p className="text-1 text-neutral-400 font-medium px-4">© 2026 Taxable Nigeria</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}
