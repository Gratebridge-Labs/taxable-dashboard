'use client';

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
            className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-taxable-blue rounded-full shadow-lg flex items-center justify-center text-white"
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
                fixed md:relative inset-y-0 left-0 z-50 bg-neutral-100 md:bg-transparent
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
            <div className="bg-white rounded-[20px] p-[8px] border-[0.6px] border-neutral-100 flex flex-col     gap-[2px]">
                <span className="text-[13px] font-medium text-neutral-400 px-[8px] pt-[4px] pb-[4px]">Select</span>
                <button
                    onClick={() => { setActiveSection('personal-info'); setMobileSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between px-[8px] py-[12px] rounded-[10px] transition-all ${
                        activeSection === 'personal-info' ? 'bg-neutral-50' : 'hover:bg-neutral-50'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={personalInfoComplete || activeSection === 'personal-info' ? '' : 'opacity-40 grayscale'}>
                            <FolderIcon size={20} />
                        </div>
                        <span className={`text-[13px] ${activeSection === 'personal-info' ? 'font-semibold' : 'font-medium'} ${activeSection === 'personal-info' || personalInfoComplete ? 'text-neutral-800' : 'text-neutral-400'}`}>Personal Information</span>
                    </div>
                    {activeSection === 'personal-info' && <ChevronRight size={16} className="text-neutral-800" />}
                </button>

                <button
                    onClick={() => { setActiveSection('income-deductions'); setIncomeSubTab(incomeSubTab); setMobileSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between px-[8px] py-[12px] rounded-[10px] transition-all ${
                        activeSection === 'income-deductions' ? 'bg-neutral-50' : 'hover:bg-neutral-50'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={incomeDeductionsComplete || activeSection === 'income-deductions' ? '' : 'opacity-40 grayscale'}>
                            <FolderIcon size={20} />
                        </div>
                        <span className={`text-[13px] ${activeSection === 'income-deductions' ? 'font-semibold' : 'font-medium'} ${activeSection === 'income-deductions' || incomeDeductionsComplete ? 'text-neutral-800' : 'text-neutral-400'}`}>Income &amp; Deductions</span>
                    </div>
                    {activeSection === 'income-deductions' && <ChevronRight size={16} className="text-neutral-800" />}
                </button>

                <button
                    onClick={() => { setActiveSection('review'); setMobileSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between px-[8px] py-[12px] rounded-[10px] transition-all ${
                        activeSection === 'review' ? 'bg-neutral-50' : 'hover:bg-neutral-50'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={reviewComplete || activeSection === 'review' ? '' : 'opacity-40 grayscale'}>
                            <FolderIcon size={20} />
                        </div>
                        <span className={`text-[13px] ${activeSection === 'review' ? 'font-semibold' : 'font-medium'} ${activeSection === 'review' || reviewComplete ? 'text-neutral-800' : 'text-neutral-400'}`}>Review &amp; File</span>
                    </div>
                    {activeSection === 'review' && <ChevronRight size={16} className="text-neutral-800" />}
                </button>
            </div>

            {/* Expert Review Promo - Separated */}
            <div className="bg-neutral-100 rounded-3xl p-4 border border-neutral-200">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 flex items-center justify-center text-neutral-800">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                        </svg>
                    </div>
                    <h4 className="text-[14px] font-bold text-neutral-800">Need expert eyes?</h4>
                </div>
                <p className="text-[13px] text-neutral-500 mb-3" style={{ fontFamily: 'Archivo', fontWeight: 500, lineHeight: '160%', letterSpacing: '-0.6%' }}>
                    Get your return reviewed by a certified tax accountant. They'll ensure accuracy, compliance, and file for you.
                </p>
                <button
                    onClick={() => setHelpModalOpen(true)}
                    className="w-full h-11 bg-white border border-neutral-200 text-neutral-800 font-bold rounded-2xl hover:bg-neutral-50 transition-all text-[13px]"
                >
                    Book Accountant (₦15,000)
                </button>
            </div>
        </div>
    </>
);
