'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTaxableApi } from '@/lib';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/components/Toast/ToastProvider';

const InfoTooltip = ({ text }: { text: string }) => (
    <div className="relative group inline-flex ml-1">
        <span className="w-3.5 h-3.5 rounded-full bg-neutral-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-800 text-white text-[11px] rounded-lg w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-normal">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800"></div>
        </div>
    </div>
);

interface ReviewAndFileProps {
    profileId?: string;
    filingPreference?: 'monthly' | 'annual';
    year?: number;
    onEdit?: (section: 'personal-info' | 'income-deductions', tab?: 'income' | 'deductions') => void;
    monthlyTaxByMonth?: Record<number, number>;
}

// ── Tax Bracket helpers ──────────────────────────────────────────────────────
const TAX_BRACKETS = [
    { label: 'First ₦300,000', limit: 300_000, rate: 0.07 },
    { label: 'Next ₦300,000', limit: 300_000, rate: 0.11 },
    { label: 'Next ₦500,000', limit: 500_000, rate: 0.19 },
    { label: 'Next ₦500,000', limit: 500_000, rate: 0.21 },
    { label: 'Remaining', limit: Infinity, rate: 0.24 },
];

function computeBrackets(taxableIncome: number) {
    let remaining = Math.max(0, taxableIncome);
    return TAX_BRACKETS.map((b) => {
        const chunk = Math.min(remaining, b.limit);
        remaining -= chunk;
        return { label: b.label, rate: `${(b.rate * 100).toFixed(0)}%`, tax: chunk * b.rate };
    });
}

function computeCRA(grossIncome: number) {
    // CRA = Higher of: 1% of gross OR ₦200,000 + 20% of gross
    const option1 = grossIncome * 0.01;
    const option2 = 200_000 + grossIncome * 0.2;
    return Math.max(option1, option2);
}

const fmt = (n: number) => (n === 0 ? '₦0' : `₦${n.toLocaleString()}`);

// ── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ label, value }: { label: string; value: string }) => (
    <div className="flex-1 min-w-0">
        <p className="text-1 text-neutral-500 font-medium mb-1">{label}</p>
        <p className="text-[18px] md:text-[22px] font-extrabold text-neutral-800 leading-tight truncate">{value}</p>
    </div>
);

const SectionDivider = () => <div className="border-t border-neutral-100 my-10" />;

// ── Main component ───────────────────────────────────────────────────────────

export default function ReviewAndFile({
    profileId: propProfileId,
    filingPreference = 'annual',
    year = 2026,
    onEdit,
    monthlyTaxByMonth: _monthlyTaxByMonth = {},
}: ReviewAndFileProps) {
    const searchParams = useSearchParams();
    const profileId = propProfileId || searchParams.get('profileId') || searchParams.get('id') || '';

    const { submitProfile, fileTax, createFilingPaymentLink, getIncomeData, getDeductionList, getPaymentRecords } = useTaxableApi();
    const toast = useToast();

    const [submitting, setSubmitting] = useState(false);
    const [filing, setFiling] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [currentStep, setCurrentStep] = useState<'review' | 'submit' | 'file' | 'pay'>('review');
    const [showBreakdown, setShowBreakdown] = useState(true);

    const [incomeData, setIncomeData] = useState<any[][]>([]);
    const [deductions, setDeductions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [, setPaymentsByMonth] = useState<Record<number, any>>({});
    const [, setPaidMonths] = useState<Set<number>>(new Set());

    useEffect(() => {
        const fetchData = async () => {
            if (!profileId) return;
            setLoading(true);
            try {
                const [incomeRes, deductionRes, paymentsRes] = await Promise.all([
                    getIncomeData(profileId),
                    getDeductionList(profileId, year),
                    getPaymentRecords(profileId),
                ]);

                if (incomeRes.success && incomeRes.data.incomes) {
                    setIncomeData(incomeRes.data.incomes);
                }
                if (deductionRes.success) {
                    setDeductions(deductionRes.data?.deductions || []);
                }

                try {
                    const payments = (paymentsRes as any)?.data?.payments || [];
                    const byMonth: Record<number, any> = {};
                    const paid = new Set<number>();
                    payments
                        .filter((p: any) => typeof p?.year === 'number' && p.year === year)
                        .forEach((p: any) => {
                            const monthVal = typeof p?.month === 'number' ? p.month : undefined;
                            if (!monthVal) return;
                            byMonth[monthVal] = p;
                            const status = String(p?.status || '').toLowerCase();
                            const isPaid = status.includes('paid') || status.includes('success') || status.includes('completed');
                            if (isPaid) paid.add(monthVal);
                        });
                    setPaymentsByMonth(byMonth);
                    setPaidMonths(paid);
                } catch {
                    // non-blocking
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [profileId, year, getIncomeData, getDeductionList, getPaymentRecords]);

    // ── Calculated values ──────────────────────────────────────────────────
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
                (monthData || []).forEach((item: any) => {
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
            totalIncome: employmentIncome + freelanceIncome + digitalAssetsIncome,
        };
    }, [incomeData, filingPreference]);

    const totalDeductions = useMemo(() => {
        return deductions.reduce((sum, d) => {
            const raw = d.value ?? d.amount ?? 0;
            const amount = typeof raw === 'string' ? parseFloat(raw) : raw || 0;
            return sum + amount;
        }, 0);
    }, [deductions]);

    const cra = useMemo(() => computeCRA(calculatedIncome.totalIncome), [calculatedIncome.totalIncome]);

    const taxableIncome = useMemo(
        () => Math.max(0, calculatedIncome.totalIncome - totalDeductions - cra),
        [calculatedIncome.totalIncome, totalDeductions, cra]
    );

    const brackets = useMemo(() => computeBrackets(taxableIncome), [taxableIncome]);

    const grossTax = useMemo(() => brackets.reduce((s, b) => s + b.tax, 0), [brackets]);

    // ── Year-end window ────────────────────────────────────────────────────
    const taxYearEnd = useMemo(() => new Date(year, 11, 31, 23, 59, 59, 999), [year]);
    const reviewWindowStart = useMemo(() => new Date(taxYearEnd.getTime() - 30 * 24 * 60 * 60 * 1000), [taxYearEnd]);
    const now = useMemo(() => new Date(), []);
    const reviewAndFileAllowed = useMemo(() => now >= reviewWindowStart, [now, reviewWindowStart]);

    // ── Handlers ───────────────────────────────────────────────────────────
    const handleSubmitProfile = async () => {
        if (!profileId) return;
        if (!reviewAndFileAllowed) {
            toast.warning(`You can only review & file within 30 days to the end of ${year} (or after the year ends).`);
            return;
        }
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
        if (!reviewAndFileAllowed) {
            toast.warning(`You can only review & file within 30 days to the end of ${year} (or after the year ends).`);
            return;
        }
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

    // ── Step screens ───────────────────────────────────────────────────────
    if (currentStep === 'submit') {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-green-600" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-neutral-800 mb-2">Profile Submitted!</h2>
                    <p className="text-neutral-500 mb-6">Your profile has been submitted successfully.</p>
                    <button
                        onClick={handleFileTax}
                        disabled={filing}
                        className="h-14 px-8 bg-taxable-blue text-white font-bold rounded-2xl hover:bg-taxable-blue transition-all shadow-lg shadow-blue-900/10 disabled:opacity-50"
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
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-green-600" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-neutral-800 mb-2">Tax Filed!</h2>
                    <p className="text-neutral-500 mb-6">Your tax return has been filed successfully.</p>
                    <button
                        onClick={handlePayment}
                        disabled={processingPayment}
                        className="h-14 px-8 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-900/10 disabled:opacity-50"
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
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-green-600" strokeWidth="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-neutral-800 mb-2">Payment Complete!</h2>
                    <p className="text-neutral-500">Your tax payment has been processed.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-taxable-blue" />
            </div>
        );
    }

    const hasData = calculatedIncome.totalIncome > 0 || totalDeductions > 0;

    // ── Main review UI ─────────────────────────────────────────────────────
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[680px]">

            {/* ── Header row ── */}
            <div className="flex items-start justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-4 font-extrabold text-neutral-800 mb-1">
                        {hasData ? 'Your Tax Filings Is Ready' : 'Review Your Tax Details'}
                    </h2>
                    {hasData && (
                        <button
                            onClick={() => setShowBreakdown((v) => !v)}
                            className="text-2 font-semibold text-taxable-blue hover:underline"
                        >
                            {showBreakdown ? 'Hide calculation breakdown' : 'View calculation breakdown'}
                        </button>
                    )}
                </div>

                {hasData && (
                    <button
                        onClick={handleSubmitProfile}
                        disabled={submitting || !reviewAndFileAllowed}
                        className="flex-shrink-0 h-11 px-6 bg-taxable-blue text-white text-2 font-bold rounded-2xl hover:bg-taxable-blue transition-all shadow-md shadow-blue-900/20 disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'File my annual returns'}
                    </button>
                )}
            </div>

            {/* ── Year-end warning ── */}
            {!reviewAndFileAllowed && (
                <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-amber-700">
                            <AlertTriangle size={16} />
                        </div>
                        <div>
                            <p className="text-2 font-semibold text-neutral-800">Review & File is available near year-end</p>
                            <p className="mt-0.5 text-1 font-medium text-amber-800">
                                You can only review and file for {year} within 30 days to the end of the tax year (or after
                                the year ends).
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {hasData ? (
                <>
                    {/* ── Stats bar ── */}
                    <div className="flex flex-wrap gap-x-10 gap-y-6 mb-10 pb-10 border-b border-neutral-100">
                        <StatCard label="Total Income" value={fmt(calculatedIncome.totalIncome)} />
                        <StatCard label="Total deduction" value={fmt(totalDeductions)} />
                        <StatCard label="Taxable income" value={fmt(taxableIncome)} />
                        <StatCard label="Tax Due" value={fmt(grossTax)} />
                    </div>

                    {showBreakdown && (
                        <>
                            {/* ── Employment section ── */}
                            <section className="mb-10">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-[16px] font-bold text-neutral-800">Employment</h3>
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit('income-deductions', 'income')}
                                            className="text-1 font-bold text-taxable-blue hover:underline"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                                <p className="text-2 text-neutral-500 font-medium mb-6">
                                    Total Income: {fmt(calculatedIncome.employmentIncome)}
                                </p>

                                <div className="rounded-2xl overflow-hidden">
                                    {/* Header */}
                                    <div className="grid grid-cols-3 px-5 py-3 bg-neutral-50">
                                        <span className="text-1 font-bold text-neutral-400 uppercase tracking-wide">Bracket</span>
                                        <span className="text-1 font-bold text-neutral-400 uppercase tracking-wide text-center">Rate</span>
                                        <span className="text-1 font-bold text-neutral-400 uppercase tracking-wide text-right">Tax</span>
                                    </div>
                                    <div className="px-5 divide-y divide-neutral-50">
                                        {brackets.map((b, i) => (
                                            <div key={i} className="grid grid-cols-3 py-3">
                                                <span className="text-[14px] font-medium text-neutral-700">{b.label}</span>
                                                <span className="text-[14px] font-medium text-neutral-500 text-center">{b.rate}</span>
                                                <span className="text-[14px] font-bold text-neutral-800 text-right">{fmt(b.tax)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between px-5 py-4 bg-neutral-50">
                                        <span className="text-[14px] font-bold text-neutral-700">Taxable income</span>
                                        <span className="text-3 font-extrabold text-neutral-800">{fmt(taxableIncome)}</span>
                                    </div>
                                </div>
                            </section>

                            <SectionDivider />

                            {/* ── Deductions section ── */}
                            <section className="mb-10">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-[16px] font-bold text-neutral-800">Deductions</h3>
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit('income-deductions', 'deductions')}
                                            className="text-1 font-bold text-taxable-blue hover:underline"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                                <p className="text-2 text-neutral-500 font-medium mb-1">
                                    Consolidated Relief Allowance (CRA) Higher of: 1% of gross income OR ₦200,000 + 20% of gross income
                                </p>
                                <p className="text-2 font-semibold text-neutral-700 mb-6">
                                    Your CRA &ndash; {fmt(cra)}
                                    <span className="text-1 text-neutral-400 font-medium ml-2">
                                        (₦200,000 + 20% of {fmt(calculatedIncome.totalIncome)}; But capped at 20% of gross income &ndash; {fmt(calculatedIncome.totalIncome * 0.2)})
                                    </span>
                                </p>

                                <div className="rounded-2xl overflow-hidden">
                                    <div className="grid grid-cols-3 px-5 py-3 bg-neutral-50">
                                        <span className="text-1 font-bold text-neutral-400 uppercase tracking-wide">Bracket</span>
                                        <span className="text-1 font-bold text-neutral-400 uppercase tracking-wide text-center">Rate</span>
                                        <span className="text-1 font-bold text-neutral-400 uppercase tracking-wide text-right">Tax</span>
                                    </div>
                                    <div className="px-5 divide-y divide-neutral-50">
                                        {brackets.map((b, i) => (
                                            <div key={i} className="grid grid-cols-3 py-3">
                                                <span className="text-[14px] font-medium text-neutral-700">{b.label}</span>
                                                <span className="text-[14px] font-medium text-neutral-500 text-center">{b.rate}</span>
                                                <span className="text-[14px] font-bold text-neutral-800 text-right">{fmt(b.tax)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between px-5 py-4 bg-neutral-50">
                                        <span className="text-[14px] font-bold text-neutral-700">Gross Tax</span>
                                        <span className="text-3 font-extrabold text-neutral-800">{fmt(grossTax)}</span>
                                    </div>
                                </div>

                                {/* Itemised deductions list */}
                                {deductions.length > 0 && (
                                    <div className="mt-6 space-y-2">
                                        {deductions.map((d: any, i) => {
                                            const raw = d.value ?? d.amount ?? 0;
                                            const amount = typeof raw === 'string' ? parseFloat(raw) : raw || 0;
                                            const label =
                                                d.description ||
                                                (d.type === 'rent_relief' || d.deductionType === 'rent_relief' ? 'Rent Relief' :
                                                 d.type === 'pension' || d.deductionType === 'pension' ? 'Pension' :
                                                 d.type === 'health_insurance' || d.type === 'insurance' || d.deductionType === 'insurance' ? 'Health Insurance' :
                                                 d.type === 'life_insurance' || d.deductionType === 'life_insurance' ? 'Life Insurance' :
                                                 d.type === 'mortgage' || d.type === 'mortgage_interest' || d.deductionType === 'mortgage' ? 'Mortgage Interest' :
                                                 d.type === 'nhis' ? 'NHIS' :
                                                 d.type === 'gratuity' ? 'Gratuity' :
                                                 d.type === 'annuity' ? 'Annuity' :
                                                 d.type === 'long_term_insurance' ? 'Long Term Insurance' :
                                                 d.deductionType || d.type || 'Deduction');
                                            return (
                                                <div key={i} className="flex items-center justify-between py-2">
                                                    <span className="text-[14px] font-medium text-neutral-500">{label}</span>
                                                    <span className="text-[14px] font-bold text-neutral-800">{fmt(amount)}</span>
                                                </div>
                                            );
                                        })}
                                        <div className="flex items-center justify-between py-3 mt-2">
                                            <span className="text-[14px] font-bold text-neutral-700">Total Deductions</span>
                                            <span className="text-3 font-extrabold text-neutral-800">{fmt(totalDeductions)}</span>
                                        </div>
                                    </div>
                                )}
                            </section>

                            <SectionDivider />

                            {/* ── Calculations section ── */}
                            <section className="mb-10">
                                <h3 className="text-[16px] font-bold text-neutral-800 mb-2">Calculations</h3>
                                <p className="text-2 text-neutral-500 font-medium mb-1 flex items-center">
                                    Consolidated Relief Allowance (CRA)
                                    <InfoTooltip text="The CRA is a mandatory tax relief in Nigeria. It's the higher of 1% of gross income OR ₦200,000 plus 20% of gross income. This reduces your taxable income." />
                                </p>
                                <p className="text-2 font-semibold text-neutral-700 mb-6 flex items-center">
                                    Your CRA &ndash; {fmt(cra)}
                                    <InfoTooltip text="This is calculated as the higher of: (a) 1% of gross income, or (b) ₦200,000 + 20% of gross income. The result is capped at 20% of your gross income." />
                                </p>

                                <div className="rounded-2xl overflow-hidden">
                                    <div className="grid grid-cols-3 px-5 py-3 bg-neutral-50">
                                        <span className="text-1 font-bold text-neutral-400 uppercase tracking-wide">Bracket</span>
                                        <span className="text-1 font-bold text-neutral-400 uppercase tracking-wide text-center">Rate</span>
                                        <span className="text-1 font-bold text-neutral-400 uppercase tracking-wide text-right">Tax</span>
                                    </div>
                                    <div className="px-5 divide-y divide-neutral-50">
                                        {brackets.map((b, i) => (
                                            <div key={i} className="grid grid-cols-3 py-3">
                                                <span className="text-[14px] font-medium text-neutral-700">{b.label}</span>
                                                <span className="text-[14px] font-medium text-neutral-500 text-center">{b.rate}</span>
                                                <span className="text-[14px] font-bold text-neutral-800 text-right">{fmt(b.tax)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between px-5 py-4 bg-neutral-50">
                                        <span className="text-[14px] font-bold text-neutral-700">Gross Tax</span>
                                        <span className="text-3 font-extrabold text-neutral-800">{fmt(grossTax)}</span>
                                    </div>
                                </div>

                                {/* Summary rows */}
                                <div className="mt-6 space-y-0 divide-y divide-neutral-50 rounded-2xl overflow-hidden">
                                    <div className="flex items-center justify-between px-5 py-4">
                                        <span className="text-[14px] font-medium text-neutral-500 flex items-center">
                                            Total Income
                                            <InfoTooltip text="The sum of all your income sources including salary, bonuses, commissions, freelance income, and other earnings before any deductions." />
                                        </span>
                                        <span className="text-[14px] font-bold text-neutral-800">{fmt(calculatedIncome.totalIncome)}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-5 py-4">
                                        <span className="text-[14px] font-medium text-neutral-500 flex items-center">
                                            Total Deductions
                                            <InfoTooltip text="Approved deductions from your income such as pension contributions (8%), NHIS (5%), rent relief, and mortgage interest relief." />
                                        </span>
                                        <span className="text-[14px] font-bold text-neutral-800">{fmt(totalDeductions)}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-5 py-4">
                                        <span className="text-[14px] font-medium text-neutral-500 flex items-center">
                                            CRA
                                            <InfoTooltip text="Consolidated Relief Allowance - a mandatory tax relief given to all Nigerian taxpayers, calculated as the higher of 1% of gross income or ₦200,000 + 20% of gross income." />
                                        </span>
                                        <span className="text-[14px] font-bold text-neutral-800">{fmt(cra)}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-5 py-4">
                                        <span className="text-[14px] font-medium text-neutral-500 flex items-center">
                                            Taxable Income
                                            <InfoTooltip text="Your total income minus all deductions and CRA. This is the amount used to calculate your tax liability." />
                                        </span>
                                        <span className="text-[14px] font-bold text-neutral-800">{fmt(taxableIncome)}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-5 py-4 bg-neutral-50">
                                        <span className="text-3 font-extrabold text-neutral-800 flex items-center">
                                            Net Tax Due
                                            <InfoTooltip text="The final amount of tax you owe based on Nigeria's progressive tax brackets. This is calculated by applying the tax rates to your taxable income." />
                                        </span>
                                        <span className="text-[16px] font-extrabold text-taxable-blue">{fmt(grossTax)}</span>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                </>
            ) : (
                <div className="text-center py-16">
                    <p className="text-[14px] text-neutral-400">
                        No tax data available yet. Add income and deductions to see your summary.
                    </p>
                    {onEdit && (
                        <button
                            onClick={() => onEdit('income-deductions', 'income')}
                            className="mt-4 h-11 px-6 bg-taxable-blue text-white text-2 font-bold rounded-2xl hover:bg-taxable-blue transition-all"
                        >
                            Add Income & Deductions
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
