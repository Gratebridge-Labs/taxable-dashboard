'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { FolderIcon } from './PITComponents';

export interface PITSidebarProps {
    activeSection: 'personal-info' | 'income-deductions' | 'review';
    incomeSubTab: 'income' | 'deductions';
    setActiveSection: (s: 'personal-info' | 'income-deductions' | 'review') => void;
    setIncomeSubTab: (t: 'income' | 'deductions') => void;
    mobileSidebarOpen: boolean;
    setMobileSidebarOpen: (open: boolean) => void;
    setHelpModalOpen: (open: boolean) => void;
    personalInfoComplete?: boolean;
    incomeDeductionsComplete?: boolean;
    reviewComplete?: boolean;
}

export const PITSidebar = ({
    activeSection,
    incomeSubTab,
    setActiveSection,
    setIncomeSubTab,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    setHelpModalOpen,
    personalInfoComplete = false,
    incomeDeductionsComplete = false,
    reviewComplete = false,
}: PITSidebarProps) => (
    <>
        {/* Mobile Toggle Button */}
        <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-[#003787] rounded-full shadow-lg flex items-center justify-center text-white"
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
        </button>

        {/* Mobile Overlay */}
        {mobileSidebarOpen && (
            <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileSidebarOpen(false)} />
        )}

        {/* Sidebar - Desktop & Mobile */}
        <div
            className={`
                md:w-[300px] md:flex-shrink-0 md:flex md:flex-col md:gap-5 md:sticky md:top-24
                fixed md:relative inset-y-0 left-0 z-50 bg-[#FAFAFA] md:bg-transparent
                transform transition-transform duration-300 ease-in-out
                ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                w-[300px] flex flex-col gap-4 p-4 shadow-xl md:shadow-none font-sans
            `}
        >
            {/* Mobile Close Button */}
            <button
                onClick={() => setMobileSidebarOpen(false)}
                className="md:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>

            {/* Sidebar Navigation Container */}
            <div className="bg-white rounded-3xl p-4 border border-[#F5F5F5] space-y-1">
                <button
                    onClick={() => { setActiveSection('personal-info'); setMobileSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-2xl transition-all ${
                        activeSection === 'personal-info' ? 'bg-[#F8FAFC]' : 'hover:bg-gray-50'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={personalInfoComplete || activeSection === 'personal-info' ? '' : 'opacity-40 grayscale'}>
                            <FolderIcon size={20} />
                        </div>
                        <span className={`text-[15px] font-semibold ${activeSection === 'personal-info' || personalInfoComplete ? 'text-[#262626]' : 'text-[#737373]'}`} style={{ fontFamily: 'Archivo' }}>Personal Information</span>
                    </div>
                    <ChevronRight size={16} className={activeSection === 'personal-info' ? 'text-[#262626]' : 'text-[#737373]'} />
                </button>

                <button
                    onClick={() => { setActiveSection('income-deductions'); setIncomeSubTab(incomeSubTab); setMobileSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-2xl transition-all ${
                        activeSection === 'income-deductions' ? 'bg-[#F8FAFC]' : 'hover:bg-gray-50'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={incomeDeductionsComplete || activeSection === 'income-deductions' ? '' : 'opacity-40 grayscale'}>
                            <FolderIcon size={20} />
                        </div>
                        <span className={`text-[15px] font-semibold ${activeSection === 'income-deductions' || incomeDeductionsComplete ? 'text-[#262626]' : 'text-[#737373]'}`} style={{ fontFamily: 'Archivo' }}>Income &amp; Deductions</span>
                    </div>
                    <ChevronRight size={16} className={activeSection === 'income-deductions' ? 'text-[#262626]' : 'text-[#737373]'} />
                </button>

                <button
                    onClick={() => { setActiveSection('review'); setMobileSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-2xl transition-all ${
                        activeSection === 'review' ? 'bg-[#F8FAFC]' : 'hover:bg-gray-50'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={reviewComplete || activeSection === 'review' ? '' : 'opacity-40 grayscale'}>
                            <FolderIcon size={20} />
                        </div>
                        <span className={`text-[15px] font-semibold ${activeSection === 'review' || reviewComplete ? 'text-[#262626]' : 'text-[#737373]'}`} style={{ fontFamily: 'Archivo' }}>Review &amp; File</span>
                    </div>
                    <ChevronRight size={16} className={activeSection === 'review' ? 'text-[#262626]' : 'text-[#737373]'} />
                </button>
            </div>

            {/* Expert Review Promo - Separated */}
            <div className="bg-[#FAFAFA] rounded-3xl p-4 border border-[#E2E8F0]">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 flex items-center justify-center text-[#0C0C0E]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                        </svg>
                    </div>
                    <h4 className="text-[14px] font-bold text-[#0C0C0E]">Need expert eyes?</h4>
                </div>
                <p className="text-[13px] text-[#737373] mb-3" style={{ fontFamily: 'Archivo', fontWeight: 500, lineHeight: '160%', letterSpacing: '-0.6%' }}>
                    Get your return reviewed by a certified tax accountant. They'll ensure accuracy, compliance, and file for you.
                </p>
                <button
                    onClick={() => setHelpModalOpen(true)}
                    className="w-full h-11 bg-white border border-[#E2E8F0] text-[#0C0C0E] font-bold rounded-2xl hover:bg-gray-50 transition-all text-[13px]"
                >
                    Book Accountant (₦15,000)
                </button>
            </div>
        </div>
    </>
);
