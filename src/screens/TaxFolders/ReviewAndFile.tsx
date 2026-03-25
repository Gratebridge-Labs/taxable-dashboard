'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Download, Info, ChevronRight, HelpCircle, Calculator } from 'lucide-react';
import { useTaxableApi } from '@/lib';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/components/Toast/ToastProvider';

interface ReviewAndFileProps {
    profileId?: string;
    filingPreference?: 'monthly' | 'annual';
    year?: number;
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
                <span className="text-base text-taxable-dark font-extrabold">{totalValue}</span>
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

export default function ReviewAndFile({ profileId: propProfileId, filingPreference = 'annual', year = 2026 }: ReviewAndFileProps) {
    const searchParams = useSearchParams();
    const profileId = propProfileId || searchParams.get('profileId') || searchParams.get('id') || '';
    
    const { submitProfile, fileTax, createFilingPaymentLink, calculateTaxGet, calculateTaxByMonth, getIncomeData, getDeductionList } = useTaxableApi();
    const toast = useToast();
    
    const [submitting, setSubmitting] = useState(false);
    const [filing, setFiling] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [currentStep, setCurrentStep] = useState<'review' | 'submit' | 'file' | 'pay'>('review');
    
    const [incomeData, setIncomeData] = useState<any[][]>([]);
    const [deductions, setDeductions] = useState<any[]>([]);
    const [taxCalculation, setTaxCalculation] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!profileId) return;
            setLoading(true);
            try {
                const [incomeRes, deductionRes] = await Promise.all([
                    getIncomeData(profileId),
                    getDeductionList(profileId, year)
                ]);
                
                if (incomeRes.success && incomeRes.data.incomes) {
                    setIncomeData(incomeRes.data.incomes);
                }
                if (deductionRes.success) {
                    setDeductions(deductionRes.data?.deductions || []);
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [profileId, year, getIncomeData, getDeductionList]);

    const calculatedIncome = useMemo(() => {
        let employmentIncome = 0;
        let freelanceIncome = 0;
        let digitalAssetsIncome = 0;
        
        if (filingPreference === 'annual' && incomeData[0]) {
            incomeData[0].forEach((item: any) => {
                if (item.type === 'employment') {
                    employmentIncome += (item.grossSalary || 0) + (item.bonuses || 0) + (item.commissions || 0);
                } else if (item.type === 'freelance') {
                    freelanceIncome += item.value || 0;
                } else if (item.type === 'digital_assets') {
                    digitalAssetsIncome += item.value || 0;
                }
            });
        } else {
            incomeData.forEach((monthData: any[]) => {
                monthData.forEach((item: any) => {
                    if (item.type === 'employment') {
                        employmentIncome += (item.grossSalary || 0) + (item.bonuses || 0) + (item.commissions || 0);
                    } else if (item.type === 'freelance') {
                        freelanceIncome += item.value || 0;
                    } else if (item.type === 'digital_assets') {
                        digitalAssetsIncome += item.value || 0;
                    }
                });
            });
        }
        
        return {
            employmentIncome,
            freelanceIncome,
            digitalAssetsIncome,
            otherIncome: freelanceIncome + digitalAssetsIncome,
            totalIncome: employmentIncome + freelanceIncome + digitalAssetsIncome
        };
    }, [incomeData, filingPreference]);

    const totalDeductions = useMemo(() => {
        return deductions.reduce((sum, d) => sum + (d.amount || 0), 0);
    }, [deductions]);

    const estimatedTax = taxCalculation?.calculation?.netTaxPayable || 0;
    const cra = taxCalculation?.calculation?.consolidatedReliefAllowance || 0;
    const grossTax = taxCalculation?.calculation?.grossTax || 0;

    const formatCurrency = (amount: number) => {
        if (amount === 0 || amount === undefined || amount === null) return '₦0';
        return `₦${amount.toLocaleString()}`;
    };

    const handleCalculate = async () => {
        if (!profileId) return;
        setCalculating(true);
        try {
            if (filingPreference === 'annual') {
                const result = await calculateTaxGet(profileId);
                if (result.success) {
                    setTaxCalculation(result.data);
                }
            } else {
                const result = await calculateTaxByMonth(profileId, 1);
                if (result.success) {
                    setTaxCalculation(result.data);
                }
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to calculate tax');
        } finally {
            setCalculating(false);
        }
    };

    const handleSubmitProfile = async () => {
        if (!profileId) return;
        setSubmitting(true);
        try {
            await submitProfile(profileId);
            setCurrentStep('file');
        } catch (err: any) {
            toast.error(err.message || 'Failed to submit profile');
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileTax = async () => {
        if (!profileId) return;
        setFiling(true);
        try {
            await fileTax(profileId);
            setCurrentStep('pay');
        } catch (err: any) {
            toast.error(err.message || 'Failed to file tax');
        } finally {
            setFiling(false);
        }
    };

    const handlePayment = async () => {
        if (!profileId) return;
        setProcessingPayment(true);
        try {
            const result = await createFilingPaymentLink(profileId);
            if (result.data?.authorization_url) {
                window.open(result.data.authorization_url, '_blank');
            } else {
                toast.success('Payment link created successfully!');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to create payment link');
        } finally {
            setProcessingPayment(false);
        }
    };

    if (currentStep === 'submit') {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-taxable-dark mb-2">Profile Submitted!</h2>
                    <p className="text-taxable-gray mb-6">Your profile has been submitted successfully.</p>
                    <button 
                        onClick={handleFileTax}
                        disabled={filing}
                        className="h-14 px-8 bg-[#00388D] text-white font-bold rounded-2xl hover:bg-[#002b6d] transition-all shadow-lg shadow-blue-900/10 disabled:opacity-50"
                    >
                        {filing ? 'Filing...' : 'File Tax Return'}
                    </button>
                </div>
            </div>
        );
    }

    if (currentStep === 'file') {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-taxable-dark mb-2">Tax Filed!</h2>
                    <p className="text-taxable-gray mb-2">Your tax return has been filed successfully.</p>
                    <p className="text-[14px] font-bold text-taxable-dark mb-6">Amount Due: {formatCurrency(estimatedTax)}</p>
                    <button 
                        onClick={handlePayment}
                        disabled={processingPayment}
                        className="h-14 px-8 bg-[#16A34A] text-white font-bold rounded-2xl hover:bg-[#15803d] transition-all shadow-lg shadow-green-900/10 disabled:opacity-50"
                    >
                        {processingPayment ? 'Processing...' : 'Pay Now'}
                    </button>
                </div>
            </div>
        );
    }

    if (currentStep === 'pay') {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-taxable-dark mb-2">Payment Complete!</h2>
                    <p className="text-taxable-gray">Your tax payment has been processed.</p>
                </div>
            </div>
        );
    }

    const hasData = calculatedIncome.totalIncome > 0 || totalDeductions > 0 || estimatedTax > 0;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-lg font-extrabold text-taxable-dark mb-1">
                        {hasData ? 'Your Tax Filings Is Ready' : 'Review Your Tax Details'}
                    </h2>
                    <p className="text-[14px] text-taxable-gray font-medium">
                        {hasData ? 'Based on the information you provided, you need to file:' : 'Add income and deductions to see your tax calculation.'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleCalculate}
                        disabled={calculating}
                        className="h-14 px-6 bg-white border border-[#00388D] text-[#00388D] font-bold rounded-2xl hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        <Calculator size={18} />
                        {calculating ? 'Calculating...' : 'Calculate Tax'}
                    </button>
                    {hasData && (
                        <button
                            onClick={handleSubmitProfile}
                            disabled={submitting}
                            className="h-14 px-8 bg-[#00388D] text-white font-bold rounded-2xl hover:bg-[#002b6d] transition-all shadow-lg shadow-blue-900/10 disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Profile'}
                        </button>
                    )}
                </div>
            </div>

            {hasData ? (
                <>
                    <div className="flex gap-6 overflow-x-auto pb-4 mb-14 no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
                        <SummaryCard
                            title="Form A - Personal Income Tax Return"
                            income={formatCurrency(calculatedIncome.totalIncome)}
                            deductions={formatCurrency(totalDeductions)}
                            onDownload={() => { }}
                        />
                        <SummaryCard
                            title="Employment Income"
                            income={formatCurrency(calculatedIncome.employmentIncome)}
                            deductions={formatCurrency(totalDeductions)}
                            onDownload={() => { }}
                        />
                        <SummaryCard
                            title="Other Income"
                            income={formatCurrency(calculatedIncome.otherIncome)}
                            deductions="₦0"
                            onDownload={() => { }}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16">
                        <div>
                            <BreakdownTable
                                title="Total Income Breakdown"
                                rows={[
                                    { label: 'Employment income', value: formatCurrency(calculatedIncome.employmentIncome) },
                                    { label: 'Freelance income', value: formatCurrency(calculatedIncome.freelanceIncome) },
                                    { label: 'Digital Assets/Crypto', value: formatCurrency(calculatedIncome.digitalAssetsIncome) },
                                ]}
                                totalLabel="Total Income"
                                totalValue={formatCurrency(calculatedIncome.totalIncome)}
                            />

                            <div className="mt-20">
                                <h3 className="text-base font-extrabold text-taxable-dark mb-4">Apply Tax Brackets</h3>
                                <p className="text-[13px] text-taxable-gray font-medium leading-relaxed mb-8">
                                    Nigeria uses progressive tax rates. Here's how your income is taxed across different brackets
                                </p>

                                {taxCalculation?.calculation?.taxBreakdown && taxCalculation.calculation.taxBreakdown.length > 0 ? (
                                    <div className="mb-6">
                                        {taxCalculation.calculation.taxBreakdown.map((bracket: any, i: number) => (
                                            <TaxBracketRow 
                                                key={i}
                                                label={bracket.bracket || `Bracket ${i + 1}`}
                                                rate={bracket.rate || ''}
                                                value={formatCurrency(bracket.tax || 0)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mb-6">
                                        <TaxBracketRow label="First ₦300,000" rate="7%" value={formatCurrency(Math.min(calculatedIncome.totalIncome, 300000) * 0.07)} />
                                        <TaxBracketRow label="Next ₦300,000" rate="11%" value={formatCurrency(Math.max(0, Math.min(calculatedIncome.totalIncome - 300000, 300000)) * 0.11)} />
                                        <TaxBracketRow label="Next ₦500,000" rate="19%" value={formatCurrency(Math.max(0, Math.min(calculatedIncome.totalIncome - 600000, 500000)) * 0.19)} />
                                        <TaxBracketRow label="Next ₦500,000" rate="21%" value={formatCurrency(Math.max(0, Math.min(calculatedIncome.totalIncome - 1100000, 500000)) * 0.21)} />
                                        <TaxBracketRow label="Remaining" rate="24%" value={formatCurrency(Math.max(0, calculatedIncome.totalIncome - 1600000) * 0.24)} />
                                    </div>
                                )}

                                <div className="flex items-center justify-between py-6 border-t border-gray-100">
                                    <span className="text-[15px] text-taxable-gray font-bold">Gross Tax</span>
                                    <span className="text-base text-taxable-dark font-extrabold">{formatCurrency(grossTax)}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <BreakdownTable
                                title="Deductions & Reliefs"
                                rows={deductions.map((d: any) => ({
                                    label: d.deductionType || 'Deduction',
                                    value: formatCurrency(d.amount || 0)
                                }))}
                                totalLabel="Total Deductions"
                                totalValue={formatCurrency(totalDeductions)}
                            />

                            <div className="mt-20">
                                <h3 className="text-base font-extrabold text-taxable-dark mb-4">Apply Personal Reliefs</h3>
                                <p className="text-[13px] text-taxable-gray font-medium leading-relaxed mb-6">
                                    Consolidated Relief Allowance (CRA) Higher of: 1% of gross income OR ₦200,000 + 20% of gross income
                                </p>

                                <div className="bg-white/50 border border-gray-50 rounded-2xl p-6 mb-8">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[14px] text-taxable-dark font-bold">Your CRA</span>
                                            <span className="text-[14px] text-taxable-dark font-bold">{formatCurrency(cra)}</span>
                                        </div>
                                        <p className="text-[12px] text-taxable-gray font-medium italic">
                                            (Higher of 1% gross OR ₦200,000 + 20% of gross)
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between py-6 border-t border-gray-100 mt-5">
                                    <span className="text-[15px] text-taxable-gray font-bold">Net Tax Payable</span>
                                    <span className="text-base text-taxable-dark font-extrabold">{formatCurrency(estimatedTax)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-12">
                    <p className="text-[14px] text-taxable-gray">No tax data available yet. Add income and deductions to see your calculation.</p>
                </div>
            )}
        </div>
    );
}