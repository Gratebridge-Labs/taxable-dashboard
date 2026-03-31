'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from 'react';
import { Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useTaxableApi } from '@/lib';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/components/Toast/ToastProvider';

interface ReviewAndFileProps {
    profileId?: string;
    filingPreference?: 'monthly' | 'annual';
    year?: number;
    onEdit?: (section: 'personal-info' | 'income-deductions', tab?: 'income' | 'deductions') => void;
}

const SummaryCard = ({ title, income, deductions, onEdit }: { title: string; income: string; deductions: string; onEdit?: () => void }) => (
    <div className="bg-white rounded-[32px] p-8 border border-gray-100 min-w-[340px] flex-shrink-0 relative group">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-[17px] font-bold text-taxable-dark">{title}</h3>
            {onEdit && (
                <button 
                    onClick={onEdit}
                    className="text-[12px] font-bold text-[#003787] opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                >
                    Edit
                </button>
            )}
            {!onEdit && (
                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <Info size={12} />
                </div>
            )}
        </div>

        <div className="space-y-3 md:space-y-4 mb-4 md:mb-8">
            <div className="flex items-center justify-between">
                <span className="text-[13px] md:text-[14px] text-taxable-gray font-medium">Total Income</span>
                <span className="text-[13px] md:text-[14px] text-taxable-dark font-bold">{income}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-[13px] md:text-[14px] text-taxable-gray font-medium">Total Deductions</span>
                <span className="text-[13px] md:text-[14px] text-taxable-dark font-bold">{deductions}</span>
            </div>
        </div>
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

export default function ReviewAndFile({ profileId: propProfileId, filingPreference = 'annual', year = 2026, onEdit }: ReviewAndFileProps) {
    const searchParams = useSearchParams();
    const profileId = propProfileId || searchParams.get('profileId') || searchParams.get('id') || '';
    
    const { submitProfile, fileTax, createFilingPaymentLink, getIncomeData, getDeductionList, getPaymentRecords } = useTaxableApi();
    const toast = useToast();
    
    const [submitting, setSubmitting] = useState(false);
    const [filing, setFiling] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [currentStep, setCurrentStep] = useState<'review' | 'submit' | 'file' | 'pay'>('review');
    
    const [incomeData, setIncomeData] = useState<any[][]>([]);
    const [deductions, setDeductions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentsByMonth, setPaymentsByMonth] = useState<Record<number, any>>({});
    const [paidMonths, setPaidMonths] = useState<Set<number>>(new Set());
    const [selectedMonths, setSelectedMonths] = useState<Set<number>>(new Set());

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

                // Payment records: filter to selected tax year and build month map
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

    useEffect(() => {
        // Default selection: months where user entered substantial income data (monthly filing)
        if (filingPreference !== 'monthly') return;
        const next = new Set<number>();
        (incomeData || []).forEach((m: any[], idx: number) => {
            if (Array.isArray(m) && m.length > 0) {
                next.add(idx + 1);
            }
        });
        (deductions || []).forEach((d: any) => {
            if ((d?.frequency === 'monthly') && typeof d?.month === 'number') next.add(d.month);
        });
        if (next.size > 0) setSelectedMonths(next);
    }, [filingPreference, incomeData, deductions]);

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
        return deductions.reduce((sum, d) => {
            const raw = d.value ?? d.amount ?? 0;
            const amount = typeof raw === 'string' ? parseFloat(raw) : (raw || 0);
            return sum + amount;
        }, 0);
    }, [deductions]);

    const formatCurrency = (amount: number) => {
        if (amount === 0 || amount === undefined || amount === null) return '₦0';
        return `₦${amount.toLocaleString()}`;
    };

    const taxYearEnd = useMemo(() => new Date(year, 11, 31, 23, 59, 59, 999), [year]);
    const reviewWindowStart = useMemo(() => new Date(taxYearEnd.getTime() - 30 * 24 * 60 * 60 * 1000), [taxYearEnd]);
    const now = useMemo(() => new Date(), []);
    const reviewAndFileAllowed = useMemo(() => now >= reviewWindowStart, [now, reviewWindowStart]);

    const monthHasAnyData = (monthNum: number) => {
        if (filingPreference === 'annual') {
            const annualIncome = incomeData?.[0];
            if (Array.isArray(annualIncome) && annualIncome.length > 0) return true;
        }
        const income = incomeData?.[monthNum - 1];
        const hasIncome = Array.isArray(income) && income.length > 0;
        const hasMonthlyDeduction = (deductions || []).some((d: any) => d?.frequency === 'monthly' && d?.month === monthNum);
        return hasIncome || hasMonthlyDeduction;
    };

    const totalPaidForYear = useMemo(() => {
        let sum = 0;
        paidMonths.forEach((m) => {
            const p = paymentsByMonth[m];
            sum += Number(p?.amountNaira ?? 0);
        });
        return sum;
    }, [paidMonths, paymentsByMonth]);

    const taxSoFar = useMemo(() => {
        let sum = 0;
        selectedMonths.forEach((m) => {
            const p = paymentsByMonth[m];
            sum += Number(p?.calculationSnapshot?.monthlyTax ?? p?.amountNaira ?? 0);
        });
        return sum;
    }, [selectedMonths, paymentsByMonth]);

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
                    <p className="text-taxable-gray mb-6">Your tax return has been filed successfully.</p>
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

    const hasData = calculatedIncome.totalIncome > 0 || totalDeductions > 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003787]"></div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-lg font-extrabold text-taxable-dark mb-1">
                        {hasData ? 'Your Tax Filings Is Ready' : 'Review Your Tax Details'}
                    </h2>
                    <p className="text-[14px] text-taxable-gray font-medium">
                        {hasData ? 'Based on the information you provided, you need to file:' : 'Add income and deductions to see your tax summary.'}
                    </p>
                </div>
                <div className="flex gap-3">
                    {hasData && (
                        <button
                            onClick={handleSubmitProfile}
                            disabled={submitting || !reviewAndFileAllowed}
                            className="h-14 px-8 bg-[#00388D] text-white font-bold rounded-2xl hover:bg-[#002b6d] transition-all shadow-lg shadow-blue-900/10 disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Profile'}
                        </button>
                    )}
                </div>
            </div>

            {!reviewAndFileAllowed && (
                <div className="mb-10 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-amber-700">
                            <AlertTriangle size={18} />
                        </div>
                        <div>
                            <p className="text-[13px] font-semibold text-taxable-dark">
                                Review & File is available near year-end
                            </p>
                            <p className="mt-0.5 text-[12px] font-medium text-amber-800">
                                You can only review and file for {year} within 30 days to the end of the tax year (or after the year ends).
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {hasData ? (
                <>
                    <div className="flex gap-6 overflow-x-auto pb-4 mb-14 no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
                        <SummaryCard
                            title="Form A - Personal Income Tax Return"
                            income={formatCurrency(calculatedIncome.totalIncome)}
                            deductions={formatCurrency(totalDeductions)}
                            onEdit={() => onEdit?.('personal-info')}
                        />
                        <SummaryCard
                            title="Employment Income"
                            income={formatCurrency(calculatedIncome.employmentIncome)}
                            deductions={formatCurrency(totalDeductions)}
                            onEdit={() => onEdit?.('income-deductions', 'income')}
                        />
                        <SummaryCard
                            title="Other Income"
                            income={formatCurrency(calculatedIncome.otherIncome)}
                            deductions="₦0"
                            onEdit={() => onEdit?.('income-deductions', 'income')}
                        />
                    </div>

                    {filingPreference === 'monthly' && (
                        <div className="mb-14">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
                                <div>
                                    <h3 className="text-[17px] font-bold text-taxable-dark">Monthly payments summary</h3>
                                    <p className="text-[13px] text-taxable-gray font-medium mt-1">
                                        Your monthly tax payments for {year}. Tax is calculated when you enter income and deductions.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedMonths(new Set(Array.from({ length: 12 }, (_, i) => i + 1).filter(monthHasAnyData)))}
                                    className="h-11 px-5 rounded-2xl border border-gray-200 bg-white text-taxable-dark font-bold text-[13px] hover:bg-gray-50 transition-colors whitespace-nowrap"
                                >
                                    Select months with data
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-white rounded-[28px] border border-gray-100 p-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                                            const label = new Date(year, m - 1, 1).toLocaleString(undefined, { month: 'long' });
                                            const checked = selectedMonths.has(m);
                                            const paid = paidMonths.has(m);
                                            const p = paymentsByMonth[m];
                                            const paidAmt = Number(p?.amountNaira ?? 0);
                                            const taxVal = p?.calculationSnapshot?.monthlyTax ?? 0;
                                            return (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedMonths((prev) => {
                                                            const next = new Set(prev);
                                                            if (next.has(m)) next.delete(m);
                                                            else next.add(m);
                                                            return next;
                                                        });
                                                    }}
                                                    className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                                                        checked
                                                            ? 'border-[#00388D] bg-[#F5F8FF]'
                                                            : 'border-gray-100 bg-white hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-[13px] font-bold text-taxable-dark">{label}</p>
                                                            <p className="text-[12px] text-taxable-gray font-medium mt-0.5">
                                                                {paid ? `Paid ₦${paidAmt.toLocaleString()}` : 'Unpaid'}
                                                            </p>
                                                        </div>
                                                        {paid && (
                                                            <div className="text-green-600">
                                                                <CheckCircle2 size={18} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    {checked && (
                                                        <div className="mt-2 flex items-center justify-between">
                                                            <span className="text-[12px] text-taxable-gray font-medium">Tax</span>
                                                            <span className="text-[12px] text-taxable-dark font-bold">{formatCurrency(taxVal)}</span>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="bg-white rounded-[28px] border border-gray-100 p-6">
                                    <h4 className="text-[14px] font-extrabold text-taxable-dark mb-4">Year-to-date</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[13px] text-taxable-gray font-medium">Selected months</span>
                                            <span className="text-[13px] text-taxable-dark font-bold">{selectedMonths.size}/12</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[13px] text-taxable-gray font-medium">Paid months</span>
                                            <span className="text-[13px] text-taxable-dark font-bold">{paidMonths.size}/12</span>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                            <span className="text-[13px] text-taxable-gray font-bold">Paid so far</span>
                                            <span className="text-[14px] text-taxable-dark font-extrabold">{formatCurrency(totalPaidForYear)}</span>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-[12px] text-taxable-gray font-medium leading-relaxed">
                                        Monthly payments are prepayments for that month. At year-end, we submit and file your return for {year} on your behalf.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

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
                                <h3 className="text-base font-extrabold text-taxable-dark mb-4">Tax Brackets Reference</h3>
                                <p className="text-[13px] text-taxable-gray font-medium leading-relaxed mb-8">
                                    Nigeria uses progressive tax rates. Here&apos;s how income is taxed across different brackets
                                </p>

                                <div className="mb-6">
                                    <TaxBracketRow label="First ₦300,000" rate="7%" value="..." />
                                    <TaxBracketRow label="Next ₦300,000" rate="11%" value="..." />
                                    <TaxBracketRow label="Next ₦500,000" rate="19%" value="..." />
                                    <TaxBracketRow label="Next ₦500,000" rate="21%" value="..." />
                                    <TaxBracketRow label="Remaining" rate="24%" value="..." />
                                </div>

                                <div className="flex items-center justify-between py-6 border-t border-gray-100">
                                    <span className="text-[15px] text-taxable-gray font-bold">Net Tax Payable</span>
                                    <span className="text-base text-taxable-dark font-extrabold">See PIT Details</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <BreakdownTable
                                title="Deductions & Reliefs"
                                rows={deductions.map((d: any) => {
                                    const rawAmount = d.value ?? d.amount ?? 0;
                                    const amount = typeof rawAmount === 'string' ? parseFloat(rawAmount) : (rawAmount || 0);
                                    const label = d.description ||
                                        (d.type === 'rent_relief' ? 'Rent Relief' :
                                         d.type === 'pension' ? 'Pension' :
                                         d.type === 'insurance' ? 'Health Insurance' :
                                         d.type === 'mortgage' || d.type === 'mortgage_interest' ? 'Mortgage Interest' :
                                         d.deductionType || d.type || 'Deduction');
                                    return { label, value: formatCurrency(amount) };
                                })}
                                totalLabel="Total Deductions"
                                totalValue={formatCurrency(totalDeductions)}
                            />

                            <div className="mt-20">
                                <h3 className="text-base font-extrabold text-taxable-dark mb-4">Personal Reliefs</h3>
                                <p className="text-[13px] text-taxable-gray font-medium leading-relaxed mb-6">
                                    Consolidated Relief Allowance (CRA) Higher of: 1% of gross income OR ₦200,000 + 20% of gross income
                                </p>

                                <div className="bg-white/50 border border-gray-50 rounded-2xl p-6 mb-8">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[14px] text-taxable-dark font-bold">Tax calculations</span>
                                            <span className="text-[14px] text-taxable-dark font-bold">See PIT Details</span>
                                        </div>
                                        <p className="text-[12px] text-taxable-gray font-medium italic">
                                            View detailed tax calculations in the Income & Deductions section
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-12">
                    <p className="text-[14px] text-taxable-gray">No tax data available yet. Add income and deductions to see your summary.</p>
                </div>
            )}
        </div>
    );
}
