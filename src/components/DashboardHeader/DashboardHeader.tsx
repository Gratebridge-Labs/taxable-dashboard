'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface NavItemProps {
    iconSrc: string;
    label: string;
    href?: string;
    active?: boolean;
}

const NavItem = ({ iconSrc, label, href = "#", active = false }: NavItemProps) => (
    <Link
        href={href}
        className={`flex items-center gap-2 px-3 py-2 text-[15px] font-medium transition-all group whitespace-nowrap ${active ? 'text-taxable-dark' : 'text-taxable-gray hover:text-taxable-dark'
            }`}
    >
        <Image
            src={iconSrc}
            alt={label}
            width={18}
            height={18}
            className={`${active ? 'opacity-100' : 'opacity-60'} group-hover:opacity-100 transition-opacity`}
        />
        <span>{label}</span>
    </Link>
);

export default function DashboardHeader() {
    return (
        <header className="w-full h-24 bg-white border-b border-gray-100 flex items-center px-12 sticky top-0 z-50">
            <div className="flex-1 flex items-center">
                <Link href="/home">
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
                <NavItem iconSrc="/icons/transaction.svg" label="Educational resources" href="/home" />
                <NavItem iconSrc="/icons/notification.svg" label="Push Notifications" />
            </nav>

            <div className="flex-1 flex justify-end items-center">
                <div className="w-11 h-11 rounded-full bg-gray-100 overflow-hidden cursor-pointer hover:ring-2 hover:ring-taxable-blue/20 transition-all">
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Image src="/icons/profile.svg" alt="Profile" width={28} height={28} className="opacity-40" />
                    </div>
                </div>
            </div>
        </header>
    );
}
