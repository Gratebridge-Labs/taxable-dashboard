'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const NavItem = ({ iconSrc, label, active = false, href = "#" }: { iconSrc: string; label: string; active?: boolean; href?: string }) => (
    <Link href={href} className={`flex items-center gap-2 px-3 py-2 text-[15px] font-medium transition-all group whitespace-nowrap ${active ? 'text-taxable-dark' : 'text-taxable-gray hover:text-taxable-dark'}`}>
        <Image src={iconSrc} alt={label} width={18} height={18} className={`${active ? 'opacity-100' : 'opacity-60'} group-hover:opacity-100 transition-opacity`} />
        <span>{label}</span>
    </Link>
);

const StatusBadge = ({ type, text }: { type: 'complete' | 'progress' | 'none' | 'filed', text: string }) => {
    const styles = {
        complete: 'bg-[#E6F9F3] text-[#10B981]',
        progress: 'bg-[#FFF7ED] text-[#F97316]',
        none: 'bg-gray-100 text-taxable-gray',
        filed: 'bg-[#EFF6FF] text-[#2563EB]'
    };

    return (
        <span className={`text-[13px] font-semibold px-2.5 py-1 rounded-full ${styles[type]}`}>
            {text}
        </span>
    );
};

const TaxFolderCard = ({
    title,
    valueText,
    description,
    status,
    statusText,
    isInactive = false
}: {
    title: string,
    valueText: string,
    description: string,
    status: 'complete' | 'progress' | 'none' | 'filed',
    statusText: string,
    isInactive?: boolean
}) => (
    <Link href="/tax-folders/pit" className="group">
        <div className="w-[322px] h-[323px] bg-white rounded-[34px] border border-gray-100 p-6 shadow-xs hover:shadow-md transition-all flex flex-col">
            {/* Icon Container */}
            <div className={`w-full h-[145px] rounded-[24px] flex items-center justify-center mb-5 ${isInactive ? 'bg-[#F5F5F5]' : 'bg-[#FAFAFA]'}`}>
                <Image
                    src={isInactive ? "/icons/inactive_folder.svg" : "/icons/folder.svg"}
                    alt="folder"
                    width={60}
                    height={58}
                    className="transition-transform group-hover:scale-110 duration-500"
                />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-start text-left">
                <h3 className="text-[19px] font-bold text-taxable-dark mb-1.5">{title}</h3>
                <p className="text-sm font-semibold text-taxable-dark mb-1">{valueText}</p>
                <p className="text-[13px] text-taxable-gray font-medium leading-relaxed mb-4 line-clamp-2">
                    {description}
                </p>

                <div className="mt-auto">
                    <StatusBadge type={status} text={statusText} />
                </div>
            </div>
        </div>
    </Link>
);

export default function TaxFolders() {
    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans">
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
                    <div className="w-11 h-11 rounded-full bg-gray-100 overflow-hidden cursor-pointer hover:ring-2 hover:ring-taxable-blue/20 transition-all">
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Image src="/icons/profile.svg" alt="Profile" width={28} height={28} className="opacity-40" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-[1280px] mx-auto px-12 py-12">
                <div className="mb-14">
                    <h1 className="text-[28px] font-semibold text-taxable-dark mb-2 tracking-tight">
                        Hello, Gideon, Welcome back
                    </h1>
                    <p className="text-base text-taxable-gray font-medium">
                        You have 3 tax filings ready for 2026. Click any card to begin.
                    </p>
                </div>

                {/* 2026 Filings */}
                <section className="mb-16">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl font-bold text-taxable-dark">2026 Tax Filings</h2>
                        <button className="h-12 px-6 bg-[#003787] hover:opacity-90 text-white font-semibold rounded-xl transition-all">
                            Create another tax filing
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <TaxFolderCard
                            title="2026 Individual Tax"
                            valueText="Tax Due - ₦145,000"
                            description="For your personal income from employment, dividends, and other investments."
                            status="progress"
                            statusText="3 of 7 sections complete"
                        />
                        <TaxFolderCard
                            title="2026 Business Tax"
                            valueText="Tax Due - ₦420,000"
                            description="For income from your registered business operations and activities."
                            status="complete"
                            statusText="All sections complete"
                        />
                        <TaxFolderCard
                            title="2026 Joint Spouse Tax"
                            valueText="Tax Due - ₦420,000"
                            description="File jointly with your spouse to combine income and potentially reduce tax."
                            status="none"
                            statusText="Not started"
                        />
                    </div>
                </section>

                {/* 2025 Filings */}
                <section>
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl font-bold text-taxable-dark">2025 Tax Filings</h2>
                        <button className="h-12 px-6 bg-white border border-gray-200 hover:bg-gray-50 text-taxable-dark font-semibold rounded-xl transition-all">
                            Add another tax type
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <TaxFolderCard
                            title="2026 Individual Tax"
                            valueText="Tax Paid - ₦320,000"
                            description="Your individual tax filing for the 2025 tax year."
                            status="filed"
                            statusText="Tax Filed- March 15, 2026"
                            isInactive
                        />
                        <TaxFolderCard
                            title="2026 Individual Tax"
                            valueText="Tax Paid - ₦320,000"
                            description="Your individual tax filing for the 2025 tax year."
                            status="filed"
                            statusText="Tax Filed- March 15, 2026"
                            isInactive
                        />
                        <TaxFolderCard
                            title="2026 Joint Spouse Tax"
                            valueText="Applies to your individual income from salaries, bonuses, and side hustles."
                            description="Your joint tax filing for the 2025 tax year."
                            status="none"
                            statusText="Not started"
                            isInactive
                        />
                    </div>
                </section>
            </main>
        </div>
    );
}
