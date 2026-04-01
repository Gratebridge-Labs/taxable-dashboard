'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { IncomeField, DeductionItem } from './PITComponents';
import { MONTHS } from './PITShared';
import type { Deduction } from '@/types/api';

interface IncomeState {
    salary: string;
    bonuses: string;
    commissions: string;
    freelance: string;
    digitalAssets: string;
}

interface ReliefsState {
    rentRelief: string;
    pension: string;
    healthInsurance: string;
    mortgage: string;
}

interface DocumentUrlsState {
    rentRelief: string;
    healthInsurance: string;
    pension: string;
    mortgage: string;
}

interface UploadedFileNamesState {
    rentRelief: string;
    healthInsurance: string;
    pension: string;
    mortgage: string;
}

interface MonthScopedDeduction {
    type?: string;
    value?: number;
    frequency: string;
    month: number | null;
    documentUrl?: string;
    raw: any;
}

export interface IncomeDeductionsSectionProps {
    // Profile / period context
    currentProfile: any;
    profileId: string;
    periodMode: 'monthly' | 'annually';
    setPeriodMode: (m: 'monthly' | 'annually') => void;
    activeMonth: string;
    setActiveMonth: (m: string) => void;
    expandedMonth: string | null;
    setExpandedMonth: (m: string | null) => void;
    incomeSubTab: 'income' | 'deductions';
    setIncomeSubTab: (t: 'income' | 'deductions') => void;
    paidMonths: Set<number>;

    // Income state
    currentMonthIncome: IncomeState;
    setCurrentMonthIncome: (s: IncomeState) => void;
    annualIncome: IncomeState;
    setAnnualIncome: (s: IncomeState) => void;
    savingMonthlyIncome: boolean;
    setSavingMonthlyIncome: (v: boolean) => void;
    setIncomeSaved: (v: boolean) => void;
    incomeData: any[];
    setIncomeData: (d: any) => void;

    // Deductions / reliefs state
    reliefs: ReliefsState;
    setReliefs: (r: ReliefsState) => void;
    documentUrls: DocumentUrlsState;
    setDocumentUrls: React.Dispatch<React.SetStateAction<DocumentUrlsState>>;
    uploadedFileNames: UploadedFileNamesState;
    setUploadedFileNames: React.Dispatch<React.SetStateAction<UploadedFileNamesState>>;
    deductions: Deduction[];
    monthScopedDeductions: MonthScopedDeduction[];
    savingReliefs: boolean;
    activeMonthNum: number;

    // Actions
    handleSaveDeductions: () => Promise<void>;
    setActiveSection: (s: 'personal-info' | 'income-deductions' | 'review') => void;
    toast: any;

    // API helpers
    updateAnnualIncomeData: (profileId: string, data: any) => Promise<any>;
    updateMonthlyIncomeData: (profileId: string, month: number, data: any) => Promise<any>;
    getIncomeData: (profileId: string) => Promise<any>;
    uploadSimple: (file: File) => Promise<any>;
    onIncomeSaved?: (monthNum: number) => void;
}

export const IncomeDeductionsSection = ({
    currentProfile,
    profileId,
    periodMode,
    setPeriodMode,
    activeMonth,
    setActiveMonth,
    expandedMonth,
    setExpandedMonth,
    incomeSubTab,
    setIncomeSubTab,
    paidMonths,
    currentMonthIncome,
    setCurrentMonthIncome,
    annualIncome,
    setAnnualIncome,
    savingMonthlyIncome,
    setSavingMonthlyIncome,
    setIncomeSaved,
    incomeData,
    setIncomeData,
    reliefs,
    setReliefs,
    documentUrls,
    setDocumentUrls,
    uploadedFileNames,
    setUploadedFileNames,
    deductions,
    monthScopedDeductions,
    savingReliefs,
    activeMonthNum,
    handleSaveDeductions,
    setActiveSection,
    toast,
    updateAnnualIncomeData,
    updateMonthlyIncomeData,
    getIncomeData,
    uploadSimple,
    onIncomeSaved,
}: IncomeDeductionsSectionProps) => {

    const handleCopyFromLastMonth = () => {
        const currentIndex = MONTHS.indexOf(activeMonth as any);
        if (currentIndex <= 0) return;
        
        const lastMonthData = incomeData?.[currentIndex - 1];
        if (!lastMonthData || !Array.isArray(lastMonthData) || lastMonthData.length === 0) {
            toast.info('No income data in previous month to copy');
            return;
        }

        let salary = '', bonuses = '', commissions = '', freelance = '', digitalAssets = '';
        
        lastMonthData.forEach((entry: any) => {
            if (entry.type === 'employment') {
                salary = String(entry.grossSalary || '');
                bonuses = String(entry.bonuses || '');
                commissions = String(entry.commissions || '');
            } else if (entry.type === 'freelance') {
                freelance = String(entry.value || '');
            } else if (entry.type === 'digital_assets') {
                digitalAssets = String(entry.value || '');
            }
        });

        setCurrentMonthIncome({ salary, bonuses, commissions, freelance, digitalAssets });
        toast.success(`Income copied from ${MONTHS[currentIndex - 1]}`);
    };

    const handleSaveIncome = async () => {
        if (!profileId || !currentProfile) return;
        setSavingMonthlyIncome(true);
        try {
            const monthNum = MONTHS.indexOf(activeMonth as any) + 1;
            const incomeDataToUse = periodMode === 'annually' ? annualIncome : currentMonthIncome;

            type IncomeEntry =
                | { type: 'employment'; grossSalary: number; bonuses: number; commissions: number; documentUrl?: string }
                | { type: 'freelance'; value: number; documentUrl?: string }
                | { type: 'digital_assets'; value: number; documentUrl?: string };

            const newIncomes: IncomeEntry[] = [];

            const salaryAmount = parseFloat(incomeDataToUse.salary) || 0;
            const bonusAmount = parseFloat(incomeDataToUse.bonuses) || 0;
            const commissionAmount = parseFloat(incomeDataToUse.commissions) || 0;
            const freelanceAmount = parseFloat(incomeDataToUse.freelance) || 0;
            const digitalAssetsAmount = parseFloat((incomeDataToUse as any).digitalAssets) || 0;

            if (salaryAmount > 0 || bonusAmount > 0 || commissionAmount > 0) {
                newIncomes.push({ type: 'employment', grossSalary: salaryAmount, bonuses: bonusAmount, commissions: commissionAmount, documentUrl: undefined });
            }
            if (freelanceAmount > 0) {
                newIncomes.push({ type: 'freelance', value: freelanceAmount, documentUrl: undefined });
            }
            if (digitalAssetsAmount > 0) {
                newIncomes.push({ type: 'digital_assets', value: digitalAssetsAmount, documentUrl: undefined });
            }

            if (periodMode === 'annually') {
                await updateAnnualIncomeData(profileId, { incomes: newIncomes });
            } else {
                await updateMonthlyIncomeData(profileId, monthNum, { incomes: newIncomes });
            }

            // Optimistically update local state instead of refetching
            if (periodMode === 'annually') {
                // For annual, update index 0
                setIncomeData((prev: any[]) => {
                    const newData = [...prev];
                    newData[0] = newIncomes;
                    return newData;
                });
            } else {
                // For monthly, update the specific month index
                setIncomeData((prev: any[]) => {
                    const newData = [...prev];
                    newData[monthNum - 1] = newIncomes;
                    return newData;
                });
            }

            toast.success(periodMode === 'annually' ? 'Annual income saved!' : `${activeMonth} income saved!`);
            setIncomeSaved(true);
            
            // Trigger tax calculation after saving income
            if (onIncomeSaved) {
                onIncomeSaved(monthNum);
            }
            
            setIncomeSubTab('deductions');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            toast.error(err.message || 'Failed to save income');
        } finally {
            setSavingMonthlyIncome(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row items-start justify-start gap-6 md:gap-4 w-full">
            {/* Sub-navigation Sidebar — Month Selector */}
            <div className="w-full md:w-[240px] flex-shrink-0 space-y-4 md:space-y-6 pb-2 md:sticky md:top-8 md:self-start">
                <div className="flex items-center gap-4 px-1">
                    <span className={`text-[13px] font-bold transition-colors ${periodMode === 'monthly' ? 'text-[#0C0C0E]' : 'text-[#94A3B8]'}`}>Monthly</span>
                    <button
                        onClick={() => setPeriodMode(periodMode === 'monthly' ? 'annually' : 'monthly')}
                        className="w-10 h-5 bg-[#003787] rounded-full relative p-0.5 transition-all"
                    >
                        <div className={`w-4 h-4 bg-white rounded-full transition-all ${periodMode === 'annually' ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                    <span className={`text-[13px] font-bold transition-colors ${periodMode === 'annually' ? 'text-[#0C0C0E]' : 'text-[#94A3B8]'}`}>Annually</span>
                </div>

                <div className="bg-[#F8FAFC]/50 rounded-3xl p-1 space-y-1">
                    {periodMode === 'monthly' ? (() => {
                        const filledMonthsSet = new Set<number>();
                        const completedMonthsSet = new Set<number>();
                        
                        (incomeData || []).forEach((monthData: any[], monthIndex) => {
                            if (Array.isArray(monthData) && monthData.length > 0) {
                                filledMonthsSet.add(monthIndex + 1);
                            }
                        });
                        
                        (deductions || []).forEach((d: any) => {
                            if (d.frequency === 'monthly' && typeof d.month === 'number') {
                                if (filledMonthsSet.has(d.month)) {
                                    completedMonthsSet.add(d.month);
                                }
                            }
                        });
                        
                        let maxVisibleMonth = 3;
                        for (let m = 1; m <= 12; m++) {
                            if (filledMonthsSet.has(m) || completedMonthsSet.has(m)) {
                                maxVisibleMonth = Math.max(maxVisibleMonth, m + 3);
                            }
                        }
                        maxVisibleMonth = Math.min(maxVisibleMonth, 12);

                        return MONTHS.slice(0, maxVisibleMonth).map(month => {
                            const monthNum = MONTHS.indexOf(month) + 1;
                            const isActive = activeMonth === month;
                            const isCompleted = completedMonthsSet.has(monthNum);
                            
                            const isHighlighted = isActive || isCompleted;
                            
                            return (
                                <div key={month} className="space-y-1">
                                    <button
                                        onClick={() => {
                                            setExpandedMonth(expandedMonth === month ? null : month);
                                            setActiveMonth(month);
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-3 rounded-2xl transition-all ${isHighlighted ? 'bg-white' : 'hover:bg-gray-50'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {(() => {
                                                const paid = paidMonths.has(monthNum);
                                                if (!paid) {
                                                    return (
                                                        <img
                                                            src={isHighlighted ? '/icons/calender_fill.svg' : '/icons/calender.svg'}
                                                            alt="calendar"
                                                            className="w-4 h-4"
                                                        />
                                                    );
                                                }
                                                return (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.8">
                                                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                );
                                            })()}
                                            <span className={`text-[13px] font-bold ${isHighlighted ? 'text-[#0C0C0E]' : 'text-[#94A3B8]'}`}>{month}</span>
                                        </div>
                                        <svg
                                            width="12" height="12" viewBox="0 0 24 24" fill="none"
                                            stroke={isHighlighted ? '#0C0C0E' : '#94A3B8'}
                                            strokeWidth="3"
                                            className={`transition-transform ${expandedMonth === month ? 'rotate-180' : ''}`}
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </button>

                                    {expandedMonth === month && periodMode === 'monthly' && (
                                        <div className="px-4 pb-2 space-y-1 ml-7">
                                            <button
                                                onClick={() => setIncomeSubTab('income')}
                                                className={`w-full text-left px-3 py-2 rounded-xl text-[13px] font-bold transition-colors ${incomeSubTab === 'income' ? 'bg-[#F1F5F9] text-[#0C0C0E]' : 'text-[#64748B] hover:text-[#0C0C0E]'}`}
                                            >
                                                Income
                                            </button>
                                            <button
                                                onClick={() => setIncomeSubTab('deductions')}
                                                className={`w-full text-left px-3 py-2 rounded-xl text-[13px] font-bold transition-colors ${incomeSubTab === 'deductions' ? 'bg-[#F1F5F9] text-[#0C0C0E]' : 'text-[#64748B] hover:text-[#0C0C0E]'}`}
                                            >
                                                Deductions
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        });
                    })() : (
                        <>
                            <button
                                type="button"
                                onClick={() => setIncomeSubTab('income')}
                                className={`w-full flex items-center justify-between px-3 py-4 rounded-2xl transition-all ${incomeSubTab === 'income' ? 'bg-white text-[#0C0C0E]' : 'hover:bg-gray-50 text-[#94A3B8]'}`}
                            >
                                <span className={`text-[13px] font-bold ${incomeSubTab === 'income' ? 'text-[#0C0C0E]' : 'text-[#94A3B8]'}`}>Total Income for {currentProfile?.year || 2026}</span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={incomeSubTab === 'income' ? '#0C0C0E' : '#94A3B8'} strokeWidth="3"><polyline points="9 18 15 12 9 6" /></svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIncomeSubTab('deductions')}
                                className={`w-full flex items-center justify-between px-3 py-4 rounded-2xl transition-all ${incomeSubTab === 'deductions' ? 'bg-white text-[#0C0C0E]' : 'hover:bg-gray-50 text-[#94A3B8]'}`}
                            >
                                <span className={`text-[13px] font-bold ${incomeSubTab === 'deductions' ? 'text-[#0C0C0E]' : 'text-[#94A3B8]'}`}>Total deductible for {currentProfile?.year || 2026}</span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={incomeSubTab === 'deductions' ? '#0C0C0E' : '#94A3B8'} strokeWidth="3"><polyline points="9 18 15 12 9 6" /></svg>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Form Area */}
            <div className="flex-1 max-w-[700px] space-y-6">
                <div className="flex items-center gap-4">
                    <p className="text-[14px] text-[#64748B] font-medium leading-relaxed">
                        {periodMode === 'annually'
                            ? `Enter your total annual income for ${currentProfile?.year || 2026}. Skip fields that don't apply to you.`
                            : `Enter your income for ${activeMonth} ${currentProfile?.year || 2026}. Skip fields that don't apply to you. You can update amounts anytime.`
                        }
                    </p>
                </div>

                {/* ── Income sub-tab ── */}
                {incomeSubTab === 'income' ? (
                    <div className="space-y-10">
                        {/* Employment Income - Only show if Salary/Employment is selected */}
                        {currentProfile?.primaryIncomeSources?.some((s: string) => s.toLowerCase().includes('salary') || s.toLowerCase().includes('employment')) && (
                            <div>
                                <h3 className="text-[19px] font-medium text-[#262626] mb-6" style={{ fontFamily: 'Archivo', lineHeight: '20px', letterSpacing: '-0.6%' }}>Employment Income</h3>
                                <div className="bg-[#F5F5F5] rounded-[24px] p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                                        {periodMode === 'annually' ? (
                                            <>
                                                <IncomeField label="Annual Gross Salary" value={annualIncome.salary} onChange={(val) => setAnnualIncome({ ...annualIncome, salary: val })} helpText="Your total annual basic salary before any deductions. This is the fixed regular payment from your employer." />
                                                <IncomeField label="Annual Bonuses" value={annualIncome.bonuses} onChange={(val) => setAnnualIncome({ ...annualIncome, bonuses: val })} helpText="Any performance bonuses, 13th month pay, or holiday bonuses received during the year." />
                                                <IncomeField label="Annual Commissions" value={annualIncome.commissions} onChange={(val) => setAnnualIncome({ ...annualIncome, commissions: val })} helpText="Sales commissions or service-based earnings paid by your employer or clients." />
                                            </>
                                        ) : (
                                            <>
                                                <IncomeField label="Gross Salary/wages" value={currentMonthIncome.salary} onChange={(val) => setCurrentMonthIncome({ ...currentMonthIncome, salary: val })} helpText="Your monthly basic salary before any deductions. This is the fixed regular payment from your employer." />
                                                <IncomeField label="Bonuses" value={currentMonthIncome.bonuses} onChange={(val) => setCurrentMonthIncome({ ...currentMonthIncome, bonuses: val })} helpText="Performance bonuses, 13th month pay, or holiday bonuses received this month." />
                                                <IncomeField label="Commissions" value={currentMonthIncome.commissions} onChange={(val) => setCurrentMonthIncome({ ...currentMonthIncome, commissions: val })} helpText="Sales commissions or service-based earnings paid this month." />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Other Income - Only show if Freelance, Digital Assets, or Investment is selected */}
                        {currentProfile?.primaryIncomeSources?.some((s: string) => 
                            s.toLowerCase().includes('freelance') || 
                            s.toLowerCase().includes('consulting') ||
                            s.toLowerCase().includes('digital') ||
                            s.toLowerCase().includes('crypto') ||
                            s.toLowerCase().includes('investment') ||
                            s.toLowerCase().includes('rental')
                        ) && (
                            <div>
                                <h3 className="text-[19px] font-medium text-[#262626] mb-6" style={{ fontFamily: 'Archivo', lineHeight: '20px', letterSpacing: '-0.6%' }}>Other Income</h3>
                                <div className="bg-[#F5F5F5] rounded-[24px] p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                        {periodMode === 'annually' ? (
                                            <>
                                                {currentProfile.primaryIncomeSources.some((s: string) => s.toLowerCase().includes('freelance') || s.toLowerCase().includes('consulting')) && (
                                                    <IncomeField label="Freelance/consulting fees" value={annualIncome.freelance} onChange={(val) => setAnnualIncome({ ...annualIncome, freelance: val })} helpText="Income from freelance work, consulting, or any self-employment activities outside your main job." />
                                                )}
                                                {currentProfile.primaryIncomeSources.some((s: string) => s.toLowerCase().includes('digital') || s.toLowerCase().includes('crypto') || s.toLowerCase().includes('investment')) && (
                                                    <IncomeField label="Digital Assets/Crypto" value={annualIncome.digitalAssets} onChange={(val) => setAnnualIncome({ ...annualIncome, digitalAssets: val })} helpText="Income from cryptocurrency transactions, NFT sales, or digital asset investments." />
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {currentProfile.primaryIncomeSources.some((s: string) => s.toLowerCase().includes('freelance') || s.toLowerCase().includes('consulting')) && (
                                                    <IncomeField label="Freelance/consulting fees" value={currentMonthIncome.freelance} onChange={(val) => setCurrentMonthIncome({ ...currentMonthIncome, freelance: val })} helpText="Income from freelance work, consulting, or any self-employment activities this month." />
                                                )}
                                                {currentProfile.primaryIncomeSources.some((s: string) => s.toLowerCase().includes('digital') || s.toLowerCase().includes('crypto') || s.toLowerCase().includes('investment')) && (
                                                    <IncomeField label="Digital Assets/Crypto" value={(currentMonthIncome as any).digitalAssets || ''} onChange={(val) => setCurrentMonthIncome({ ...currentMonthIncome, digitalAssets: val } as any)} helpText="Income from cryptocurrency transactions, NFT sales, or digital asset investments this month." />
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* ── Deductions sub-tab ── */
                    <div className="space-y-6">
                        {/* Rent Relief */}
                        {currentProfile?.paysRent && (
                            <div>
                                <h3 className="text-[19px] font-medium text-[#262626] mb-6" style={{ fontFamily: 'Archivo', lineHeight: '20px', letterSpacing: '-0.6%' }}>Rent Relief</h3>
                                <div className="bg-[#F5F5F5] rounded-[24px] p-4">
                                    {(() => {
                                        const rentDeduction = (deductions || []).find(d => (d.deductionType as string) === 'rent_relief');
                                        const rentStatus = rentDeduction?.verificationStatus;
                                        const hasUpload = !!uploadedFileNames.rentRelief || !!documentUrls.rentRelief || !!rentDeduction?.documentUrl;
                                        return (
                                            <DeductionItem
                                                label="Annual Rent Commitment"
                                                value={reliefs.rentRelief}
                                                onChange={(val) => setReliefs({ ...reliefs, rentRelief: val })}
                                                uploadLabel="Upload Tenancy Agreements or Receipt"
                                                fileName={uploadedFileNames.rentRelief || (hasUpload ? 'Document uploaded' : (rentDeduction ? `Rent Receipt (₦${Number((rentDeduction as any).amount ?? (rentDeduction as any).value ?? 0).toLocaleString()})` : 'Proof of Rent Required'))}
                                                status={rentStatus === 'verified' ? 'verified' : rentStatus === 'pending' ? 'pending' : hasUpload ? 'completed' : undefined}
                                                statusMessage={rentStatus === 'verified' ? 'Verified. Your rent relief has been approved.' : rentStatus === 'pending' ? 'Verification in Progress — Our system is matching your document with NRS records' : undefined}
                                                onUpload={async (file) => {
                                                    const res = await uploadSimple(file);
                                                    setDocumentUrls(p => ({ ...p, rentRelief: res.data.url }));
                                                    setUploadedFileNames(p => ({ ...p, rentRelief: file.name }));
                                                }}
                                                onDeleteFile={() => {
                                                    setDocumentUrls(p => ({ ...p, rentRelief: '' }));
                                                    setUploadedFileNames(p => ({ ...p, rentRelief: '' }));
                                                }}
                                                helpText="Your total annual rent payment. This qualifies you for rent relief of up to 10% of your gross income."
                                                uploadHelpText="Upload your tenancy agreement or rent receipts as proof of your rent commitment."
                                            />
                                        );
                                    })()}
                                </div>
                            </div>
                        )}

                        {/* Health Insurance */}
                        {currentProfile?.hasHealthInsurance && (
                            <div>
                                <h3 className="text-[19px] font-medium text-[#262626] mb-6" style={{ fontFamily: 'Archivo', lineHeight: '20px', letterSpacing: '-0.6%' }}>Health Insurance (NHIS)</h3>
                                <div className="bg-[#F5F5F5] rounded-[24px] p-4">
                                    {(() => {
                                        const nhisDeduction = (monthScopedDeductions || []).find(d => d.type === 'insurance' || d.type === 'nhis' || d.type === 'health_insurance')?.raw;
                                        const nhisStatus = nhisDeduction?.verificationStatus;
                                        const hasUpload = !!uploadedFileNames.healthInsurance || !!documentUrls.healthInsurance || !!nhisDeduction?.documentUrl;
                                        return (
                                            <DeductionItem
                                                label="Health Insurance Premium"
                                                value={reliefs.healthInsurance}
                                                onChange={(val) => setReliefs({ ...reliefs, healthInsurance: val })}
                                                uploadLabel="Upload Health Insurance Statement"
                                                fileName={uploadedFileNames.healthInsurance || (hasUpload ? 'Document uploaded' : (nhisDeduction ? `Insurance Receipt (₦${Number((nhisDeduction as any).amount ?? (nhisDeduction as any).value ?? 0).toLocaleString()})` : 'Upload Insurance Statement'))}
                                                status={nhisStatus === 'verified' ? 'verified' : nhisStatus === 'pending' ? 'pending' : hasUpload ? 'completed' : undefined}
                                                statusMessage={nhisStatus === 'verified' ? 'Verified. Your health insurance relief has been applied.' : nhisStatus === 'pending' ? 'Verification in Progress — Our system is matching your document with NRS records' : undefined}
                                                onUpload={async (file) => {
                                                    const res = await uploadSimple(file);
                                                    setDocumentUrls(p => ({ ...p, healthInsurance: res.data.url }));
                                                    setUploadedFileNames(p => ({ ...p, healthInsurance: file.name }));
                                                }}
                                                onDeleteFile={() => {
                                                    setDocumentUrls(p => ({ ...p, healthInsurance: '' }));
                                                    setUploadedFileNames(p => ({ ...p, healthInsurance: '' }));
                                                }}
                                                helpText="Your annual National Health Insurance Scheme (NHIS) contribution. This qualifies for a 5% tax relief on your taxable income."
                                                uploadHelpText="Upload your NHIS payment receipt or insurance statement as proof of your health insurance contributions."
                                            />
                                        );
                                    })()}
                                </div>
                            </div>
                        )}

                        {/* Pension */}
                        {currentProfile?.hasPension && (
                            <div>
                                <h3 className="text-[19px] font-medium text-[#262626] mb-6" style={{ fontFamily: 'Archivo', lineHeight: '20px', letterSpacing: '-0.6%' }}>Statutory Deductions</h3>
                                <div className="bg-[#F5F5F5] rounded-[24px] p-4">
                                    {(() => {
                                        const pensionDeduction = (deductions || []).find(d => (d.deductionType as string) === 'pension');
                                        const pensionStatus = pensionDeduction?.verificationStatus;
                                        const hasUpload = !!uploadedFileNames.pension || !!documentUrls.pension || !!pensionDeduction?.documentUrl;
                                        return (
                                            <DeductionItem
                                                label="Pension"
                                                value={reliefs.pension}
                                                onChange={(val) => setReliefs({ ...reliefs, pension: val })}
                                                uploadLabel="Upload your Pension Statement"
                                                fileName={uploadedFileNames.pension || (hasUpload ? 'Document uploaded' : (pensionDeduction ? `Pension Receipt (₦${Number((pensionDeduction as any).amount ?? (pensionDeduction as any).value ?? 0).toLocaleString()})` : 'Upload Pension Statement'))}
                                                status={pensionStatus === 'verified' ? 'verified' : pensionStatus === 'pending' ? 'pending' : hasUpload ? 'completed' : undefined}
                                                statusMessage={pensionStatus === 'verified' ? 'Verified. A 5% pension deduction has been applied to your taxable income.' : pensionStatus === 'pending' ? 'Verification in Progress — Our system is matching your document with NRS records' : undefined}
                                                onUpload={async (file) => {
                                                    const res = await uploadSimple(file);
                                                    setDocumentUrls(p => ({ ...p, pension: res.data.url }));
                                                    setUploadedFileNames(p => ({ ...p, pension: file.name }));
                                                }}
                                                onDeleteFile={() => {
                                                    setDocumentUrls(p => ({ ...p, pension: '' }));
                                                    setUploadedFileNames(p => ({ ...p, pension: '' }));
                                                }}
                                                helpText="Your annual pension contribution to a registered pension fund. Qualifies for 8% tax relief on your gross income."
                                                uploadHelpText="Upload your pension statement or payslip showing pension deductions as proof of your contributions."
                                            />
                                        );
                                    })()}
                                </div>
                            </div>
                        )}

                        {/* Mortgage */}
                        {currentProfile?.paysMortgage && (
                            <div>
                                <h3 className="text-[19px] font-medium text-[#262626] mb-6" style={{ fontFamily: 'Archivo', lineHeight: '20px', letterSpacing: '-0.6%' }}>Mortgage Interest Relief</h3>
                                <div className="bg-[#F5F5F5] rounded-[24px] p-4">
                                    {(() => {
                                        const mortgageDeduction = (monthScopedDeductions || []).find(d => d.type === 'mortgage' || d.type === 'mortgage_interest')?.raw;
                                        const mortgageStatus = mortgageDeduction?.verificationStatus;
                                        const hasUpload = !!uploadedFileNames.mortgage || !!documentUrls.mortgage || !!mortgageDeduction?.documentUrl;
                                        return (
                                            <DeductionItem
                                                label="Mortgage Interest Paid"
                                                value={reliefs.mortgage}
                                                onChange={(val) => setReliefs({ ...reliefs, mortgage: val })}
                                                uploadLabel="Upload Mortgage Statement"
                                                fileName={uploadedFileNames.mortgage || (hasUpload ? 'Document uploaded' : (mortgageDeduction ? `Mortgage Statement (₦${Number((mortgageDeduction as any).amount ?? (mortgageDeduction as any).value ?? 0).toLocaleString()})` : 'Upload Mortgage Statement'))}
                                                status={mortgageStatus === 'verified' ? 'verified' : mortgageStatus === 'pending' ? 'pending' : hasUpload ? 'completed' : undefined}
                                                statusMessage={mortgageStatus === 'verified' ? 'Verified. Your mortgage interest relief has been applied.' : mortgageStatus === 'pending' ? 'Verification in Progress — Our system is matching your document with NRS records' : undefined}
                                                onUpload={async (file) => {
                                                    const res = await uploadSimple(file);
                                                    setDocumentUrls(p => ({ ...p, mortgage: res.data.url }));
                                                    setUploadedFileNames(p => ({ ...p, mortgage: file.name }));
                                                }}
                                                onDeleteFile={() => {
                                                    setDocumentUrls(p => ({ ...p, mortgage: '' }));
                                                    setUploadedFileNames(p => ({ ...p, mortgage: '' }));
                                                }}
                                                helpText="The interest portion of your mortgage payments made during the year. Qualifies for mortgage interest relief on your taxable income."
                                                uploadHelpText="Upload your mortgage statement or loan amortization schedule showing the interest paid."
                                            />
                                        );
                                    })()}
                                </div>
                            </div>
                        )}

                        {/* Fallback */}
                        {!currentProfile?.paysRent && !currentProfile?.hasHealthInsurance && !currentProfile?.hasPension && !currentProfile?.paysMortgage && (
                            <div className="py-12 text-center">
                                <p className="text-[14px] text-[#94A3B8] font-medium">No deductions applicable based on your profile.</p>
                                <p className="text-[12px] text-[#94A3B8] mt-1">If this seems incorrect, please update your profile settings.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Action Buttons ── */}
                {periodMode === 'annually' && incomeSubTab === 'deductions' ? (
                    <div className="mt-10 flex justify-start">
                        <button
                            type="button"
                            onClick={async () => {
                                await handleSaveDeductions();
                                setActiveSection('review');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            disabled={savingReliefs}
                            className="h-11 px-6 rounded-xl bg-[#003787] text-white text-[13px] font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {savingReliefs ? 'Saving...' : 'File annual tax returns'}
                        </button>
                    </div>
                ) : (
                    <div className="mt-8 flex gap-3 justify-start">
                        {incomeSubTab === 'deductions' ? (
                            <button
                                type="button"
                                onClick={handleSaveDeductions}
                                disabled={savingReliefs}
                                className="h-11 px-6 rounded-xl bg-[#003787] text-white text-[13px] font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {savingReliefs ? 'Saving...' : 'Save Deductions'}
                            </button>
                        ) : (
                            <>
                                {periodMode === 'monthly' && activeMonth !== 'January' && (
                                    <button
                                        type="button"
                                        onClick={handleCopyFromLastMonth}
                                        className="h-11 px-4 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#003787] text-[13px] font-semibold transition-colors flex items-center gap-2"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                        </svg>
                                        Copy last month
                                    </button>
                                )}
                                <button
                                    onClick={handleSaveIncome}
                                    disabled={savingMonthlyIncome}
                                    className="h-11 px-6 rounded-xl bg-[#003787] text-white text-[13px] font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {savingMonthlyIncome ? 'Saving...' : 'Save & Continue'}
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
