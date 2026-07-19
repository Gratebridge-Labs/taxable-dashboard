'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';

export default function DashboardHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useUser();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
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

                {/* Right Section: Profile Pill */}
                <div className="flex-1 flex items-center justify-end gap-3 md:gap-4 relative">
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-2 bg-white border border-neutral-100 rounded-lg px-3 py-1.5 h-10"
                        >
                            <Image src="/Avatar.svg" alt="" width={28} height={28} className="rounded-full" />
                            <span className="text-3 font-semibold text-neutral-800">{user?.firstName} {user?.lastName}</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-neutral-400">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>

                        {showProfileMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                                <div className="absolute top-full mt-2 right-0 w-[200px] bg-white rounded-xl border border-neutral-100 p-1 z-50 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                                    <Link
                                        href="/profile"
                                        onClick={() => setShowProfileMenu(false)}
                                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-neutral-800 text-3 font-semibold hover:bg-neutral-50"
                                    >
                                        <span className="flex items-center justify-center w-5 h-5 shrink-0 text-neutral-400">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="block">
                                                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2M8.5 9.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0m9.758 7.484A7.985 7.985 0 0 1 12 20a7.985 7.985 0 0 1-6.258-3.016C7.363 15.821 9.575 15 12 15s4.637.821 6.258 1.984" fill="currentColor"/>
                                            </svg>
                                        </span>
                                        Profile
                                    </Link>
                                    <a
                                        href="mailto:support@taxable.ng"
                                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-neutral-800 text-3 font-semibold hover:bg-neutral-50"
                                    >
                                        <span className="flex items-center justify-center w-5 h-5 shrink-0 text-neutral-400">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="block">
                                                <path d="M20 11.943C20 7.562 16.424 4 12 4c-4.424 0-8 3.562-8 7.943 0 1.19.147 1.955.328 2.516.122.372.413.005.557-.13a2.5 2.5 0 0 1 3.472.05c1.421 1.412 2.732 3.37.921 5.17-.972.966-2.436 1.368-3.55.328-1.438-1.344-2.687-2.908-3.302-4.8C2.17 14.283 2 13.304 2 11.942 2 6.445 6.483 2 12 2s10 4.445 10 9.943c0 1.362-.169 2.341-.426 3.133-.615 1.893-1.864 3.457-3.302 4.8-1.114 1.041-2.578.64-3.55-.327-1.81-1.8-.5-3.758.92-5.17a2.5 2.5 0 0 1 3.473-.05c.277.26.414.57.557.13.181-.56.328-1.327.328-2.516" fill="currentColor"/>
                                            </svg>
                                        </span>
                                        Contact Support
                                    </a>
                                    <div className="border-t border-neutral-50 my-0.5" />
                                    <button
                                        onClick={() => { logout(); router.push('/signin'); }}
                                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-red-500 text-3 font-semibold hover:bg-red-50 w-full text-left"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x1="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                        Log out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
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
