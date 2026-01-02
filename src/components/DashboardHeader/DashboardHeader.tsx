'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

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

            <div className="flex-1 flex justify-end items-center gap-4">
                {/* Notification Icon */}
                <div className="w-11 h-11 rounded-2xl bg-[#F5F5F3] flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-all">
                    <Image src="/icons/notification.svg" alt="Notifications" width={22} height={22} className="opacity-70" />
                </div>

                {/* Profile Icon */}
                <div className="w-11 h-11 rounded-2xl bg-gray-100 overflow-hidden cursor-pointer hover:ring-2 hover:ring-taxable-blue/20 transition-all">
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Image src="/icons/profile.svg" alt="Profile" width={28} height={28} className="opacity-40" />
                    </div>
                </div>
            </div>
        </header>
    );
}
