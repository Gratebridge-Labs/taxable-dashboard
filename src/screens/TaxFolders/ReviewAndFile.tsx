'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Download, Info, ChevronRight, HelpCircle } from 'lucide-react';

interface ReviewAndFileProps {
    data?: any;
    onSaveAndContinue?: () => void;
}

const SummaryCard = ({ title, income, deductions, onDownload }: { title: string; income: string; deductions: string; onDownload: () => void }) => (
    <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] min-w-[340px] flex-shrink-0">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-[17px] font-bold text-taxable-dark">{title}</h3>
            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Info size={12} />
            </div>
        </div>

        <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
                <span className="text-[14px] text-taxable-gray font-medium">Total Income</span>
                <span className="text-[14px] text-taxable-dark font-bold">{income}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-[14px] text-taxable-gray font-medium">Total Deductions & Reliefs</span>
                <span className="text-[14px] text-taxable-dark font-bold">{deductions}</span>
            </div>
        </div>

        <button
            onClick={onDownload}
            className="w-full py-4 border border-gray-100 rounded-2xl flex items-center justify-center gap-2 text-[14px] font-bold text-taxable-dark hover:bg-gray-50 transition-all"
        >
            <Download size={18} />
            Download
        </button>
    </div>
);

const BreakdownTable = ({ title, rows, totalLabel, totalValue }: { title: string; rows: { label: string; value: string }[]; totalLabel: string; totalValue: string }) => (
    <div className="mb-14">
        <h3 className="text-[17px] font-bold text-taxable-dark mb-6">{title}</h3>
        <div className="space-y-5">
            {rows.map((row, i) => (
                <div key={i} className="flex items-center justify-between pb-1">
                    <span className="text-[14px] text-taxable-gray font-medium">{row.label}</span>
                    <span className="text-[14px] text-taxable-dark font-bold">{row.value}</span>
                </div>
            ))}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[15px] text-taxable-gray font-bold">{totalLabel}</span>
                <span className="text-[18px] text-taxable-dark font-extrabold">{totalValue}</span>
            </div>
        </div>
    </div>
);

const TaxBracketRow = ({ label, rate, value }: { label: string; rate: string; value: string }) => (
    <div className="grid grid-cols-3 py-4 border-b border-gray-50 last:border-b-0">
        <span className="text-[14px] text-taxable-dark font-bold">{label}</span>
        <span className="text-[14px] text-taxable-gray font-medium">{rate}</span>
        <span className="text-[14px] text-taxable-dark font-bold text-right">{value}</span>
    </div>
);

export default function ReviewAndFile({ data, onSaveAndContinue }: ReviewAndFileProps) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top Banner Section */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-[22px] font-extrabold text-taxable-dark mb-1">Your Tax Filings Is Ready</h2>
                    <p className="text-[14px] text-taxable-gray font-medium">Based on the information you provided, you need to file:</p>
                </div>
                <button
                    onClick={onSaveAndContinue}
                    className="h-14 px-8 bg-[#00388D] text-white font-bold rounded-2xl hover:bg-[#002b6d] transition-all shadow-lg shadow-blue-900/10"
                >
                    Save & Continue
                </button>
            </div>

            {/* Horizontal Cards Scroll */}
            <div className="flex gap-6 overflow-x-auto pb-4 mb-14 no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
                <SummaryCard
                    title="Form A - Personal Income Tax Return"
                    income="₦5,700,000"
                    deductions="₦564,000"
                    onDownload={() => { }}
                />
                <SummaryCard
                    title="Form B - Employment Income Schedule"
                    income="₦5,700,000"
                    deductions="₦564,000"
                    onDownload={() => { }}
                />
                <SummaryCard
                    title="Direct Assessment Form"
                    income="₦0"
                    deductions="₦0"
                    onDownload={() => { }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16">
                <div>
                    <BreakdownTable
                        title="Total Income (Employment + Business + Other)"
                        rows={[
                            { label: 'Employment income', value: '₦5,700,000' },
                            { label: 'Business income', value: '₦0' },
                            { label: 'Investment income', value: '₦0' },
                            { label: 'Other income', value: '₦0' },
                        ]}
                        totalLabel="Other income"
                        totalValue="₦5,700,000"
                    />

                    <div className="mt-20">
                        <h3 className="text-[19px] font-extrabold text-taxable-dark mb-4">Apply Tax Brackets</h3>
                        <p className="text-[13px] text-taxable-gray font-medium leading-relaxed mb-8">
                            Nigeria uses progressive tax rates. Here's how your income is taxed across different brackets
                        </p>

                        <div className="mb-6">
                            <TaxBracketRow label="First ₦300,000" rate="7%" value="₦21,000" />
                            <TaxBracketRow label="Next ₦300,000" rate="11%" value="₦33,000" />
                            <TaxBracketRow label="Next ₦500,000" rate="19%" value="₦33,000" />
                            <TaxBracketRow label="Next ₦500,000" rate="21%" value="₦33,000" />
                            <TaxBracketRow label="Remaining ₦1,936,000" rate="24%" value="₦33,000" />
                        </div>

                        <div className="flex items-center justify-between py-6 border-t border-gray-100">
                            <span className="text-[15px] text-taxable-gray font-bold">Gross Tax</span>
                            <span className="text-[18px] text-taxable-dark font-extrabold">₦1,024,640</span>
                        </div>
                    </div>
                </div>

                <div>
                    <BreakdownTable
                        title="Deductions & Reliefs"
                        rows={[
                            { label: 'Pension contributions', value: '₦384,000' },
                            { label: 'National Housing Fund (NHF)', value: '₦120,000' },
                            { label: 'Life Insurance premiums', value: '₦60,000' },
                        ]}
                        totalLabel="Total Deductions"
                        totalValue="₦564,000"
                    />

                    <div className="mt-20">
                        <h3 className="text-[19px] font-extrabold text-taxable-dark mb-4">Apply Personal Reliefs</h3>
                        <p className="text-[13px] text-taxable-gray font-medium leading-relaxed mb-6">
                            Consolidated Relief Allowance (CRA) Higher of: 1% of gross income OR ₦200,000 + 20% of gross income
                        </p>

                        <div className="bg-white/50 border border-gray-50 rounded-2xl p-6 mb-8">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[14px] text-taxable-dark font-bold">Your CRA - ₦1,187,000</span>
                                </div>
                                <p className="text-[12px] text-taxable-gray font-medium italic">
                                    (₦200,000 + 20% of ₦5,700,000) But capped at 20% of gross income = ₦1,140,000
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <TaxBracketRow label="Next ₦300,000" rate="11%" value="₦33,000" />
                            <TaxBracketRow label="Next ₦500,000" rate="19%" value="₦33,000" />
                            <TaxBracketRow label="Next ₦500,000" rate="21%" value="₦33,000" />
                            <TaxBracketRow label="Remaining ₦1,936,000" rate="24%" value="₦33,000" />
                        </div>

                        <div className="flex items-center justify-between py-6 border-t border-gray-100 mt-5">
                            <span className="text-[15px] text-taxable-gray font-bold">Gross Tax</span>
                            <span className="text-[18px] text-taxable-dark font-extrabold">₦1,024,640</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
