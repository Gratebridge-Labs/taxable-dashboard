'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardHeader() {
    const pathname = usePathname();

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
        <header className="w-full h-20 bg-white border-b border-gray-100 flex items-center px-8 sticky top-0 z-50">
            {/* Left Section: Logo */}
            <div className="flex-1">
                <Link href="/home" className="flex items-center w-fit">
                    <Image
                        src="/logo_blue.svg"
                        alt="Taxable"
                        width={100}
                        height={61}
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
                        >
                            {link.icon}
                            <span className="text-[15px]">{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Right Section: Button */}
            <div className="flex-1 flex justify-end">
                <button className="px-5 h-[46px] border border-gray-100 rounded-xl text-[14px] font-bold text-taxable-dark hover:shadow-xs hover:bg-gray-50 transition-all cursor-pointer">
                    Talk to an Accountant
                </button>
            </div>
        </header>
    );
}
