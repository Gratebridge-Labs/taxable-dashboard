'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';
import ReviewAndFile from './ReviewAndFile';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function PITDetails() {
    const router = useRouter();

    const [activeSection, setActiveSection] = useState<'personal-info' | 'tax-reliefs' | 'income-deductions' | 'review'>('personal-info');

    // Income & Deductions specific state
    const [periodMode, setPeriodMode] = useState<'monthly' | 'annually'>('monthly');
    const [activeMonth, setActiveMonth] = useState('January');
    const [incomeSubTab, setIncomeSubTab] = useState<'income' | 'deductions'>('income');

    const renderSidebar = () => (
        <div className="w-[240px] flex-shrink-0 flex flex-col gap-6 sticky top-24">
            <div>
                <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2 px-1">Select</p>
                <div className="space-y-0.5">
                    {[
                        { key: 'personal-info', label: 'Personal Information' },
                        { key: 'tax-reliefs', label: 'Tax Reliefs' },
                    ].map(sec => (
                        <button
                            key={sec.key}
                            onClick={() => setActiveSection(sec.key as any)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${activeSection === sec.key ? 'bg-[#F1F5F9] text-[#0C0C0E]' : 'hover:bg-gray-50 text-[#374151]'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`text-lg leading-none ${activeSection !== sec.key ? 'opacity-60' : ''}`}>📁</span>
                                <span className="text-[13px] font-semibold">{sec.label}</span>
                            </div>
                            <svg className={`w-3.5 h-3.5 flex-shrink-0 ${activeSection === sec.key ? 'text-[#0C0C0E]' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2 px-1">Select</p>
                <div className="space-y-0.5">
                    {[
                        { key: 'income-deductions', label: 'Income & Deductions' },
                        { key: 'review', label: 'Review & File' },
                    ].map(sec => (
                        <button
                            key={sec.key}
                            onClick={() => setActiveSection(sec.key as any)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${activeSection === sec.key ? 'bg-[#F1F5F9] text-[#0C0C0E]' : 'hover:bg-gray-50 text-[#374151]'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`text-lg leading-none ${activeSection !== sec.key ? 'opacity-60' : ''}`}>{sec.key === 'review' ? '📄' : '📁'}</span>
                                <span className="text-[13px] font-semibold">{sec.label}</span>
                            </div>
                            <svg className={`w-3.5 h-3.5 flex-shrink-0 ${activeSection === sec.key ? 'text-[#0C0C0E]' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-4 bg-white border border-gray-100 rounded-[20px] p-5">
                <div className="flex items-center gap-2 mb-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#003787" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    <h4 className="text-[13px] font-bold text-[#0C0C0E]">Need expert eyes on your return?</h4>
                </div>
                <p className="text-[12px] text-[#6B7280] leading-relaxed font-medium mb-4">
                    Get your return reviewed by a certified tax accountant. They'll ensure accuracy, compliance, and file for you.
                </p>
                <button className="w-full h-10 border border-gray-200 text-[#0C0C0E] font-bold rounded-xl hover:bg-gray-50 transition-colors text-[12px]">
                    Book Accountant (₦15,000)
                </button>
            </div>
        </div>
    );

    const activeLabel = {
        'personal-info': 'Personal Information',
        'tax-reliefs': 'Tax Reliefs',
        'income-deductions': 'Income & Deductions',
        'review': 'Review & File',
    }[activeSection];

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans pb-20">
            <DashboardHeader />

            <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
                {/* Back + Breadcrumb */}
                <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-5">
                            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[13px] font-bold text-[#0C0C0E] hover:text-[#003787] transition-colors">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                                </svg>
                                Back
                            </button>
                            <div className="flex items-center gap-1.5 text-[12px] text-[#9CA3AF] font-medium">
                                <span>2028 Individual Tax</span><span>/</span>
                                <span className="text-[#6B7280]">{activeLabel}</span>
                                {activeSection === 'income-deductions' && periodMode === 'monthly' && (
                                    <><span>/</span><span className="text-[#6B7280]">{activeMonth}</span><span>/</span><span className="text-[#6B7280] capitalize">{incomeSubTab}</span></>
                                )}
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <h1 className="text-lg font-bold text-[#0C0C0E] mb-1.5">Gideon Akin, 2026 Individual Tax</h1>
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-[12px] font-bold text-[#16A34A]">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    Tax Compliant
                                </span>
                                <span className="text-[#D1D5DB]">·</span>
                                <span className="text-[12px] text-[#6B7280] font-medium">TCC Valid until Dec 31, 2026</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <h2 className="text-base font-bold text-[#0C0C0E]">₦0 (no data yet)</h2>
                        <p className="text-[13px] text-[#6B7280] font-medium">Estimated Net Tax Payable</p>
                    </div>
                </div>

                <div className="flex items-start justify-center gap-8 mt-8">
                    {renderSidebar()}

                    <div className="flex-1 min-w-0">
                        {activeSection === 'personal-info' && (
                            <div className="flex items-start justify-center gap-8">
                                <div className="flex-1 space-y-7 max-w-[480px]">
                                    <h2 className="text-base font-bold text-[#0C0C0E]">Personal Information</h2>

                                    <div>
                                        <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] mb-2">
                                            Tax ID (Tax Identification Number)
                                            <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                        </label>
                                        <input type="text" readOnly value="12345678901" className="w-full h-11 border border-gray-100 bg-gray-50 rounded-xl px-4 text-[14px] font-medium text-[#6B7280] focus:outline-none" />
                                        <p className="flex items-center gap-1 mt-2 text-[12px] font-semibold text-[#16A34A]">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                            Verified
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151]">
                                            Residency status
                                            <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[14px] font-semibold text-[#16A34A]">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                                <polyline points="18 8 21 11 18 14" />
                                            </svg>
                                            Resident of Nigeria
                                        </div>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] mb-2">
                                            Full Legal Name
                                            <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                        </label>
                                        <input type="text" value="Gideon Akin" readOnly className="w-full h-11 border border-gray-100 bg-gray-50 rounded-xl px-4 text-[14px] font-medium text-[#6B7280] focus:outline-none" />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] mb-2">
                                            Date of birth
                                            <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                        </label>
                                        <input type="text" placeholder="DD / MM / YYYY" className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all placeholder:text-gray-300" />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] mb-2">
                                            Street Address
                                            <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                        </label>
                                        <input type="text" placeholder="Enter" className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all placeholder:text-gray-300 mb-3" />
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="relative">
                                                <select className="appearance-none w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#9CA3AF] focus:outline-none focus:border-[#003787]/40 transition-all">
                                                    <option>City</option>
                                                </select>
                                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                                            </div>
                                            <div className="relative">
                                                <select className="appearance-none w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#9CA3AF] focus:outline-none focus:border-[#003787]/40 transition-all">
                                                    <option>State</option>
                                                </select>
                                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="h-11 px-8 bg-[#003787] text-white font-bold rounded-xl hover:bg-[#002b6d] transition-colors text-[14px]">
                                        Save & Continue
                                    </button>
                                </div>

                                <div className="w-[280px] bg-[#FAFAFA] border border-gray-100/60 p-6 rounded-2xl flex-shrink-0">
                                    <h4 className="flex items-center gap-2 text-[14px] font-bold text-[#0C0C0E] mb-3">
                                        <span className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center text-[10px] font-bold">i</span>
                                        Why we need this
                                    </h4>
                                    <p className="text-[13px] text-[#6B7280] leading-relaxed font-medium mb-5">
                                        Your personal details help us identify you with FIRS and ensure your tax return is filed correctly. All information is encrypted and stored securely. We only share data with FIRS when you choose to file.
                                    </p>
                                    <div className="space-y-3">
                                        <a href="#" className="flex items-center gap-2 text-[13px] font-semibold text-[#0C0C0E] hover:text-[#003787] transition-colors group">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-[#003787]">
                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                                            </svg>
                                            How to find your TIN
                                        </a>
                                        <a href="#" className="flex items-center gap-2 text-[13px] font-semibold text-[#0C0C0E] hover:text-[#003787] transition-colors group">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-[#003787]">
                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                                            </svg>
                                            Understanding tax filing
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'tax-reliefs' && (
                            <div className="flex items-start justify-center gap-8">
                                <div className="flex-1 space-y-8 max-w-[480px]">
                                    <div>
                                        <h2 className="text-base font-bold text-[#0C0C0E] mb-5">Rent Relief</h2>
                                        <div className="space-y-5">
                                            <div>
                                                <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] mb-2">
                                                    Annual Rent Commitment.
                                                    <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                                </label>
                                                <input type="text" placeholder="₦0" className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all placeholder:text-gray-300" />
                                            </div>
                                            <div>
                                                <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] mb-2">
                                                    Upload Tenancy Agreements or Receipt
                                                    <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                                </label>
                                                <div className="border border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer bg-white">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                            📄
                                                        </div>
                                                        <div>
                                                            <p className="text-[13px] font-semibold text-[#0C0C0E]">Proof of Rent Required</p>
                                                            <p className="text-[11px] font-medium text-gray-500">PDF, JPG, or PNG (Max 5MB)</p>
                                                        </div>
                                                    </div>
                                                    <div className="px-4 py-2 rounded-lg border border-gray-200 text-[13px] font-semibold text-[#0C0C0E]">
                                                        Upload
                                                    </div>
                                                </div>
                                                <p className="flex items-start gap-1.5 mt-3 text-[11px] font-medium text-gray-500">
                                                    <span className="w-3 h-3 rounded-full border border-gray-400 flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">i</span>
                                                    Once uploaded, our system will verify your document against NRS records to lock in your tax relief
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-base font-bold text-[#0C0C0E] mb-5">Statutory Deductions</h2>

                                        <div className="bg-[#FAFAFA] border border-gray-100/60 rounded-2xl p-5 space-y-5 mb-5">
                                            <div>
                                                <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] mb-2">
                                                    Pension
                                                    <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                                </label>
                                                <input type="text" placeholder="₦0" className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all placeholder:text-gray-300" />
                                            </div>
                                            <div>
                                                <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] mb-2">
                                                    Upload your Pension Statement
                                                    <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                                </label>
                                                <div className="border border-gray-200 rounded-xl p-3.5 flex items-center justify-between bg-white">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                            📄
                                                        </div>
                                                        <div>
                                                            <p className="text-[13px] font-semibold text-[#0C0C0E]">Pension Receipt</p>
                                                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                                                                120 KB · <span className="flex items-center gap-1 text-[#16A34A]"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Completed</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button className="text-gray-400 hover:text-red-500 p-1">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" /></svg>
                                                    </button>
                                                </div>
                                                <p className="mt-2 text-[11.5px] font-semibold text-amber-600">
                                                    Verification in Progress — Our system is matching your document with NRS records
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-[#FAFAFA] border border-gray-100/60 rounded-2xl p-5 space-y-5 mb-5">
                                            <div>
                                                <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] mb-2">
                                                    National Housing Fund (NHF)
                                                    <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                                </label>
                                                <input type="text" placeholder="₦0" className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all placeholder:text-gray-300" />
                                            </div>
                                            <div>
                                                <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] mb-2">
                                                    Upload your NHF contribution history
                                                    <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                                </label>
                                                <div className="border border-gray-200 rounded-xl p-3.5 flex items-center justify-between bg-white">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                            📄
                                                        </div>
                                                        <div>
                                                            <p className="text-[13px] font-semibold text-[#0C0C0E]">NHF Contribution</p>
                                                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                                                                120 KB · <span className="flex items-center gap-1 text-[#16A34A]"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Completed</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button className="text-gray-400 hover:text-red-500 p-1">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" /></svg>
                                                    </button>
                                                </div>
                                                <p className="mt-2 text-[11.5px] font-medium text-[#16A34A]">
                                                    Verified. A 2.5% deduction has been effected. Your taxable income has been reduced to [Amount].
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-[#FAFAFA] border border-gray-100/60 rounded-2xl p-5 space-y-5">
                                            <div>
                                                <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] mb-2">
                                                    Life Insurance
                                                    <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                                </label>
                                                <input type="text" placeholder="₦0" className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all placeholder:text-gray-300" />
                                            </div>
                                            <div>
                                                <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] mb-2">
                                                    Upload your Insurance Certificate
                                                    <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                                </label>
                                                <div className="border border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer bg-white">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                            📄
                                                        </div>
                                                        <div>
                                                            <p className="text-[13px] font-semibold text-[#0C0C0E]">Proof of Insurance Required</p>
                                                            <p className="text-[11px] font-medium text-gray-500">PDF, JPG, or PNG (Max 5MB)</p>
                                                        </div>
                                                    </div>
                                                    <div className="px-4 py-2 rounded-lg border border-gray-200 text-[13px] font-semibold text-[#0C0C0E]">
                                                        Upload
                                                    </div>
                                                </div>
                                                <p className="flex items-start gap-1.5 mt-3 text-[11px] font-medium text-gray-500">
                                                    <span className="w-3 h-3 rounded-full border border-gray-400 flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">i</span>
                                                    Once uploaded, our system will verify your document against NRS records to lock in your tax relief
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="h-11 px-8 bg-[#003787] text-white font-bold rounded-xl hover:bg-[#002b6d] transition-colors text-[14px]">
                                        Save & Continue
                                    </button>
                                </div>

                                <div className="w-[280px] bg-[#FAFAFA] border border-gray-100/60 p-6 rounded-2xl flex-shrink-0 sticky top-6">
                                    <h4 className="flex items-center gap-2 text-[14px] font-bold text-[#0C0C0E] mb-3">
                                        <span className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center text-[10px] font-bold">i</span>
                                        Take Your Time
                                    </h4>
                                    <p className="text-[13px] text-[#6B7280] leading-relaxed font-medium mb-6">
                                        Deductions and reliefs are your legal way to reduce the tax you owe. Don't worry if you don't have a receipt yet; you can save your progress now and return to upload your proof anytime before the March 31, 2027 deadline.
                                    </p>
                                    <div className="space-y-4 pt-4 border-t border-gray-200">
                                        <button className="flex items-center gap-2 text-[13px] font-bold text-[#0C0C0E] hover:text-[#003787] transition-colors">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                            Chat with support
                                        </button>
                                        <button className="flex items-center gap-2 text-[13px] font-bold text-[#0C0C0E] hover:text-[#003787] transition-colors">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                            Email us
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'income-deductions' && (
                            <div className="flex gap-10">

                                <div className="w-[180px] flex-shrink-0 space-y-4 sticky top-24">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className={`text-[13px] font-semibold ${periodMode === 'monthly' ? 'text-[#0C0C0E]' : 'text-gray-400'}`}>Monthly</span>
                                        <button
                                            onClick={() => setPeriodMode(p => p === 'monthly' ? 'annually' : 'monthly')}
                                            className={`relative w-10 h-5 rounded-full transition-colors ${periodMode === 'monthly' ? 'bg-[#003787]' : 'bg-gray-300'}`}
                                        >
                                            <div className={`absolute left-0 top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${periodMode === 'monthly' ? 'translate-x-[2px]' : 'translate-x-[22px]'}`} />
                                        </button>
                                        <span className={`text-[13px] font-semibold ${periodMode === 'annually' ? 'text-[#0C0C0E]' : 'text-gray-400'}`}>Annually</span>
                                    </div>

                                    {periodMode === 'monthly' ? (
                                        <div className="space-y-1">
                                            {MONTHS.map((m, i) => {
                                                const isActive = m === activeMonth;
                                                const isCompleted = i < MONTHS.indexOf(activeMonth); // Mock completed state
                                                return (
                                                    <div key={m}>
                                                        <button
                                                            onClick={() => setActiveMonth(m)}
                                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${isActive ? 'bg-[#F9FAFB] text-[#0C0C0E] font-bold' : 'hover:bg-gray-50 text-gray-400 font-semibold'
                                                                } text-[13px]`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span>🗓️</span>
                                                                {m}
                                                            </div>
                                                            {isActive && (
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                                                            )}
                                                        </button>
                                                        {isActive && (
                                                            <div className="ml-8 mt-1 space-y-1">
                                                                <button
                                                                    onClick={() => setIncomeSubTab('income')}
                                                                    className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-semibold ${incomeSubTab === 'income' ? 'bg-gray-100 text-[#0C0C0E]' : 'text-gray-500 hover:bg-gray-50'}`}
                                                                >
                                                                    Income
                                                                </button>
                                                                <button
                                                                    onClick={() => setIncomeSubTab('deductions')}
                                                                    className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-semibold ${incomeSubTab === 'deductions' ? 'bg-gray-100 text-[#0C0C0E]' : 'text-gray-500 hover:bg-gray-50'}`}
                                                                >
                                                                    Deductions
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <button className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 text-[#0C0C0E] font-bold text-[13px] border border-gray-100 flex items-center justify-between">
                                                Total Income for 2026
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 rotate-[-90deg]"><polyline points="6 9 12 15 18 9" /></svg>
                                            </button>
                                            <button className="w-full text-left px-4 py-3 rounded-xl border border-transparent hover:border-gray-100 text-[#6B7280] font-semibold text-[13px] flex items-center justify-between">
                                                Total deductible for 2026
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 rotate-[-90deg]"><polyline points="6 9 12 15 18 9" /></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 pb-10">
                                    <p className="text-[13px] text-[#6B7280] font-medium leading-relaxed mb-8 max-w-[500px]">
                                        {periodMode === 'monthly' ?
                                            `Enter your ${incomeSubTab} for ${activeMonth} 2026. Skip fields that don't apply to you. You can update amounts anytime.` :
                                            `Enter your total income for 2026. Skip fields that don't apply to you. You can update amounts anytime.`
                                        }
                                    </p>

                                    {incomeSubTab === 'income' && (
                                        <div className="space-y-10">
                                            <div>
                                                <h3 className="text-sm font-bold text-[#0C0C0E] mb-4">Employment Income</h3>
                                                <div className="bg-[#FAFAFA] border border-gray-100/60 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                                                    <div>
                                                        <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6B7280] mb-2">
                                                            Gross Salary/wages <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                                        </label>
                                                        <input type="text" placeholder="₦0" className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all placeholder:text-gray-300" />
                                                    </div>
                                                    <div>
                                                        <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6B7280] mb-2">
                                                            Bonuses <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                                        </label>
                                                        <input type="text" placeholder="₦0" className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all placeholder:text-gray-300" />
                                                    </div>
                                                    <div>
                                                        <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6B7280] mb-2">
                                                            Commissions <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                                        </label>
                                                        <input type="text" placeholder="₦0" className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all placeholder:text-gray-300" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-bold text-[#0C0C0E] mb-4">Investment Income</h3>
                                                <div className="bg-[#FAFAFA] border border-gray-100/60 rounded-2xl p-5 space-y-5">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                        <div>
                                                            <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6B7280] mb-2">
                                                                Dividends <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                                            </label>
                                                            <input type="text" placeholder="₦0" className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all placeholder:text-gray-300" />
                                                        </div>
                                                        <div>
                                                            <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6B7280] mb-2">
                                                                Interest (bank, bonds, etc.) <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                                            </label>
                                                            <input type="text" placeholder="₦0" className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all placeholder:text-gray-300" />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                        <div>
                                                            <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6B7280] mb-2">
                                                                Capital gains (stocks, property sales) <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                                            </label>
                                                            <input type="text" placeholder="₦0" className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all placeholder:text-gray-300" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-bold text-[#0C0C0E] mb-4">Other Income</h3>
                                                <div className="bg-[#FAFAFA] border border-gray-100/60 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                                                    <div>
                                                        <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6B7280] mb-2">
                                                            Freelance/consulting fees <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                                        </label>
                                                        <input type="text" placeholder="₦0" className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all placeholder:text-gray-300" />
                                                    </div>
                                                    <div>
                                                        <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6B7280] mb-2">
                                                            Royalties <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                                        </label>
                                                        <input type="text" placeholder="₦0" className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all placeholder:text-gray-300" />
                                                    </div>
                                                    <div>
                                                        <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6B7280] mb-2">
                                                            Other <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                                        </label>
                                                        <input type="text" placeholder="₦0" className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all placeholder:text-gray-300" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 pt-4">
                                                <button className="h-11 px-8 bg-[#003787] text-white font-bold rounded-xl hover:bg-[#002b6d] transition-colors text-[14px]">
                                                    Save & Continue
                                                </button>
                                                {periodMode === 'monthly' && (
                                                    <button className="h-11 px-6 bg-white border border-gray-200 text-[#0C0C0E] font-bold rounded-xl hover:bg-gray-50 transition-colors text-[14px]">
                                                        Copy from last month
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeSection === 'review' && (
                            <ReviewAndFile />
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
}
