'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/components/Toast/ToastProvider';
import { useTaxableApi } from '@/hooks/useTaxableApi';
import type { Profile, Income, Deduction, DeductionType } from '@/types/api';

// Sub-components and Shared Utilities
import { MONTHS, fromIsoDate, toIsoDate } from './PITShared';
import { PITSidebar } from './PITSidebar';
import { PersonalInfoSection, PersonalInfo } from './PersonalInfoSection';
import { IncomeDeductionsSection } from './IncomeDeductionsSection';
import { PITModals } from './PITModals';
import ReviewAndFile from './ReviewAndFile';

export default function PITDetails() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: authLoading, isAuthenticated } = useUser();
    const toast = useToast();
    const api = useTaxableApi();
    const profileId = searchParams?.get('id');

    // ─── Component State ──────────────────────────────────────────────────
    const [activeSection, setActiveSection] = useState<'personal-info' | 'income-deductions' | 'review'>('personal-info');
    const [sectionInitialized, setSectionInitialized] = useState(false);
    const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // Personal Info State
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
        nin: '',
        fullName: '',
        email: '',
        phone: '',
        streetAddress: '',
        city: '',
        state: '',
        residencyStatus: 'resident'
    });
    const [savingPersonalInfo, setSavingPersonalInfo] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Income & Deductions State
    const [periodMode, setPeriodMode] = useState<'monthly' | 'annually'>('monthly');
    const [activeMonth, setActiveMonth] = useState<string>('January');
    const [expandedMonth, setExpandedMonth] = useState<string | null>('January');
    const [incomeSubTab, setIncomeSubTab] = useState<'income' | 'deductions'>('income');

    const [incomeData, setIncomeData] = useState<Income[]>([]);
    const [deductions, setDeductions] = useState<Deduction[]>([]);
    const [taxSummary, setTaxSummary] = useState<any>(null);

    const [currentMonthIncome, setCurrentMonthIncome] = useState({
        salary: '',
        bonuses: '',
        commissions: '',
        freelance: '',
        digitalAssets: ''
    });
    const [annualIncome, setAnnualIncome] = useState({
        salary: '',
        bonuses: '',
        commissions: '',
        freelance: '',
        digitalAssets: ''
    });

    const [reliefs, setReliefs] = useState({
        rentRelief: '',
        pension: '',
        healthInsurance: '',
        mortgage: ''
    });
    const [documentUrls, setDocumentUrls] = useState({
        rentRelief: '',
        healthInsurance: '',
        pension: '',
        mortgage: ''
    });
    const [uploadedFileNames, setUploadedFileNames] = useState({
        rentRelief: '',
        healthInsurance: '',
        pension: '',
        mortgage: ''
    });

    const [savingMonthlyIncome, setSavingMonthlyIncome] = useState(false);
    const [savingReliefs, setSavingReliefs] = useState(false);

    // Summaries
    const [monthlyTaxByMonth, setMonthlyTaxByMonth] = useState<Record<number, number>>({});
    const [paidMonths, setPaidMonths] = useState<Set<number>>(new Set());

    // Modal States
    const [helpModalOpen, setHelpModalOpen] = useState(false);
    const [bookingTaxAgent, setBookingTaxAgent] = useState(false);
    const [confirmFilingPrefOpen, setConfirmFilingPrefOpen] = useState(false);
    const [pendingPeriodMode, setPendingPeriodMode] = useState<'monthly' | 'annually' | null>(null);
    const [switchingFilingPref, setSwitchingFilingPref] = useState(false);

    // ─── Data Loading ─────────────────────────────────────────────────────
    const loadProfileData = useCallback(async () => {
        if (!profileId) return;
        
        // Wait for auth to be ready (avoid race condition on reload)
        if (authLoading || !isAuthenticated) return;
        
        setProfileLoading(true);
        try {
            const profile = await api.getProfile(profileId);
            if (profile) {
                setCurrentProfile(profile);

                setPersonalInfo({
                    nin: profile.nin || '',
                    fullName: profile.fullName || user?.firstName || user?.name || 'User',
                    email: user?.email || '',
                    phone: user?.phone || '',
                    streetAddress: profile.street || '',
                    city: profile.city || '',
                    state: profile.state || '',
                    residencyStatus: (profile as any).residencyStatus || 'resident'
                });

                const pref = profile.filingPreference === 'annual' ? 'annually' : 'monthly';
                setPeriodMode(pref);
                if (pref === 'monthly' && !expandedMonth) {
                    setExpandedMonth('January');
                }

                // Fetch Income & Deductions
                const [incomeRes, deductionRes] = await Promise.all([
                    api.getIncomeData(profileId),
                    api.getDeductionList(profileId, profile.year)
                ]);

                if (incomeRes.success) setIncomeData(incomeRes.data.incomes || []);
                if (deductionRes.success) setDeductions(deductionRes.data.deductions || []);

                // Determine starting section - Background auto-continue logic
                if (!sectionInitialized) {
                    const hasPersonalInfo = !!(profile.nin && profile.fullName);
                    const hasIncome = (incomeRes.data?.incomes || []).some((inc: any) => inc && inc.length > 0);
                    const hasDeducts = (deductionRes.data?.deductions || []).length > 0;

                    // Auto-continue to the most appropriate section
                    if (!hasPersonalInfo) {
                        setActiveSection('personal-info');
                    } else if (!hasIncome && !hasDeducts) {
                        setActiveSection('income-deductions');
                    } else {
                        setActiveSection('review');
                    }
                    setSectionInitialized(true);
                }

                // Fetch Summaries for estimated tax display - Only calculate for months with data
                if (pref === 'monthly') {
                    // Only calculate tax for months that have income data
                    (incomeRes.data?.incomes || []).forEach((monthData: any[], monthIndex: number) => {
                        if (Array.isArray(monthData) && monthData.length > 0) {
                            const monthNum = monthIndex + 1;
                            api.calculateTaxByMonth(profileId, monthNum).then((sumRes: any) => {
                                if (sumRes.success && sumRes.data) {
                                    const taxAmount = (sumRes.data as any).taxSummary?.monthlyTax || (sumRes.data as any).taxSummary?.totalTaxAmount || 0;
                                    setMonthlyTaxByMonth(prev => ({ ...prev, [monthNum]: taxAmount }));
                                }
                            }).catch((err) => {
                                // Silent fail - some months may not have sufficient data for tax calculation
                                console.warn(`Failed to fetch tax summary for month ${monthNum}:`, err?.message);
                                // Don't set tax amount for months with insufficient data
                            });
                        }
                    });
                } else {
                    api.getTaxSummary(profileId).then((annRes: any) => {
                        if (annRes.success) setTaxSummary(annRes.data);
                    }).catch((err) => {
                        // Silent fail - annual tax summary may not be available yet due to insufficient data
                        console.warn('Failed to fetch annual tax summary:', err?.message);
                        // Don't set tax summary if data is insufficient
                    });
                }
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load profile');
        } finally {
            setProfileLoading(false);
            setLoading(false);
        }
    }, [profileId, user, sectionInitialized, api, authLoading, isAuthenticated]);

    useEffect(() => {
        loadProfileData();
    }, [loadProfileData]);

    const handleUpdateProfileProp = async (prop: string, val: any) => {
        if (!profileId || !currentProfile) return;
        try {
            const nextProfile = { ...currentProfile, [prop]: val };
            await api.completeProfile(profileId, nextProfile as any);
            setCurrentProfile(nextProfile);
            toast.success('Profile updated');
        } catch (err: any) {
            toast.error(err.message || 'Update failed');
        }
    };


    const normalizeDeduction = useCallback((d: any) => {
        const type = (d?.type ?? d?.deductionType) as string | undefined;
        const value = (d?.value ?? d?.amount) as number | undefined;
        const frequency = (d?.frequency ?? 'annual') as string;
        const month = (d?.month ?? null) as number | null;
        const documentUrl = d?.documentUrl as string | undefined;
        return { type, value, frequency, month, documentUrl, raw: d };
    }, []);

    const activeMonthNum = MONTHS.indexOf(activeMonth as any) + 1;

    const monthScopedDeductions = useMemo(() => {
        const list = (deductions || []).map(normalizeDeduction).filter(d => !!d.type);
        if (periodMode !== 'monthly') return list;
        return list.filter(d => {
            if (d.frequency === 'monthly') return d.month === activeMonthNum;
            if (d.type === 'rent_relief') return activeMonthNum === 1;
            return false;
        });
    }, [deductions, normalizeDeduction, periodMode, activeMonthNum]);

    useEffect(() => {
        const index = periodMode === 'annually' ? 0 : activeMonthNum - 1;
        const monthItems = (incomeData[index] as any) || [];

        const empty = { salary: '', bonuses: '', commissions: '', freelance: '', digitalAssets: '' };
        
        const salary = monthItems.find((i: any) => i.type === 'employment')?.grossSalary?.toString() || '';
        const bonuses = monthItems.find((i: any) => i.type === 'employment')?.bonuses?.toString() || '';
        const commissions = monthItems.find((i: any) => i.type === 'employment')?.commissions?.toString() || '';
        const freelance = monthItems.find((i: any) => i.type === 'freelance')?.value?.toString() || '';
        const digitalAssets = monthItems.find((i: any) => i.type === 'digital_assets' || i.type === 'crypto')?.value?.toString() || '';
        
        const data = { salary, bonuses, commissions, freelance, digitalAssets };
        if (periodMode === 'annually') setAnnualIncome(data);
        else setCurrentMonthIncome(data);
    }, [incomeData, activeMonthNum, periodMode]);

    useEffect(() => {
        const reliefMap = { rentRelief: '', pension: '', healthInsurance: '', mortgage: '' };
        const docUrlMap = { rentRelief: '', healthInsurance: '', pension: '', mortgage: '' };

        monthScopedDeductions.forEach(d => {
            if (!d.type) return;
            const type = d.type;
            if (type === 'rent_relief') {
                reliefMap.rentRelief = (d.value ?? '').toString();
                if (d.documentUrl) docUrlMap.rentRelief = d.documentUrl;
            } else if (type === 'pension') {
                reliefMap.pension = (d.value ?? '').toString();
                if (d.documentUrl) docUrlMap.pension = d.documentUrl;
            } else if (['insurance', 'nhis', 'health_insurance'].includes(type)) {
                reliefMap.healthInsurance = (d.value ?? '').toString();
                if (d.documentUrl) docUrlMap.healthInsurance = d.documentUrl;
            } else if (['mortgage', 'mortgage_interest'].includes(type)) {
                reliefMap.mortgage = (d.value ?? '').toString();
                if (d.documentUrl) docUrlMap.mortgage = d.documentUrl;
            }
        });

        setReliefs(reliefMap);
        setDocumentUrls(docUrlMap);
    }, [monthScopedDeductions]);

    const handleSaveDeductions = useCallback(async () => {
        if (!profileId || !currentProfile) return;
        setSavingReliefs(true);
        try {
            const isMonthly = periodMode === 'monthly';
            const frequency = isMonthly ? 'monthly' : 'annual';
            const monthToSend = isMonthly ? activeMonthNum : null;

            const batchItems: any[] = [
                ...(reliefs.rentRelief && parseFloat(reliefs.rentRelief) > 0 ? [{ deductionType: 'rent_relief' as DeductionType, amount: parseFloat(reliefs.rentRelief), documentUrl: documentUrls.rentRelief || undefined, frequency, month: monthToSend }] : []),
                ...(reliefs.pension && parseFloat(reliefs.pension) > 0 ? [{ deductionType: 'pension' as DeductionType, amount: parseFloat(reliefs.pension), documentUrl: documentUrls.pension || undefined, frequency, month: monthToSend }] : []),
                ...(reliefs.healthInsurance && parseFloat(reliefs.healthInsurance) > 0 ? [{ deductionType: 'insurance' as DeductionType, amount: parseFloat(reliefs.healthInsurance), documentUrl: documentUrls.healthInsurance || undefined, frequency, month: monthToSend }] : []),
                ...(reliefs.mortgage && parseFloat(reliefs.mortgage) > 0 ? [{ deductionType: 'mortgage' as DeductionType, amount: parseFloat(reliefs.mortgage), documentUrl: documentUrls.mortgage || undefined, frequency, month: monthToSend }] : []),
            ];

            if (batchItems.length === 0) {
                toast.warning('Please enter at least one deduction amount.');
                return;
            }

            for (const item of batchItems) {
                const wantType = item.deductionType as string;
                const existing = (deductions || []).map(normalizeDeduction).find(d =>
                    (d.type === wantType || d.type === (wantType === 'mortgage' ? 'mortgage_interest' : wantType)) &&
                    (isMonthly ? (d.frequency === 'monthly' && d.month === activeMonthNum) : (d.frequency === 'annual' || d.month === null))
                );

                if (existing?.raw?._id) {
                    await api.updateDeduction(existing.raw._id, { profileId, year: currentProfile.year, type: wantType as any, value: item.amount, frequency: item.frequency as any, month: item.month, documentUrl: item.documentUrl });
                } else {
                    await api.batchCreateDeductions({ profileId, year: currentProfile.year, deductions: [item] as any });
                }
            }

            const res = await api.getDeductionList(profileId, currentProfile.year);
            if (res.success) setDeductions(res.data.deductions || []);
            toast.success('Deductions saved successfully!');
            
            // Auto-calculate tax for the current month after saving deductions
            if (periodMode === 'monthly') {
                console.log(`🔥 Starting tax calculation for ${activeMonth} (month ${activeMonthNum})`);
                console.log(`📊 Current monthlyTaxByMonth state:`, monthlyTaxByMonth);
                console.log(`📊 Current activeMonthNum: ${activeMonthNum}`);
                try {
                    const taxResult = await api.calculateTaxByMonth(profileId, activeMonthNum);
                    console.log(`📡 Tax API response for ${activeMonth}:`, JSON.stringify(taxResult, null, 2));
                    
                    if (taxResult.success && taxResult.data) {
                        // Get netTaxPayable from the calculation object
                        const taxAmount = (taxResult.data as any).taxSummary?.monthlyTax || (taxResult.data as any).taxSummary?.totalTaxAmount || 0;
                        
                        console.log(`💰 Extracted tax amount: ₦${taxAmount}`);
                        
                        // Update the monthly tax for this specific month
                        setMonthlyTaxByMonth(prev => {
                            const updated = { ...prev, [activeMonthNum]: taxAmount };
                            console.log(`📝 Updated monthlyTaxByMonth:`, updated);
                            return updated;
                        });
                        
                        console.log(`✅ Tax calculated for ${activeMonth}: ₦${taxAmount.toLocaleString()}`);
                        
                        // Force re-render of displayedTaxAmount
                        setTaxUpdateTrigger(prev => prev + 1);
                    } else {
                        console.log(`⚠️ Tax calculation failed or returned no data:`, taxResult);
                    }
                } catch (err: any) {
                    console.error(`❌ Failed to calculate tax for ${activeMonth}:`, err);
                    // Don't show error to user - tax calculation failure shouldn't block deduction save
                }
            }
            
            // Auto-advance to next month for monthly filing after completing deductions
            if (periodMode === 'monthly') {
                const currentMonthIndex = MONTHS.indexOf(activeMonth as any);
                if (currentMonthIndex < MONTHS.length - 1) {
                    const nextMonth = MONTHS[currentMonthIndex + 1];
                    setActiveMonth(nextMonth);
                    setExpandedMonth(nextMonth);
                    setIncomeSubTab('income'); // Switch to income tab for next month
                }
            }
            
            // Background sync after a short delay to verify data consistency
            setTimeout(async () => {
                try {
                    const res = await api.getDeductionList(profileId, currentProfile.year);
                    if (res.success) setDeductions(res.data.deductions || []);
                } catch (err) {
                    console.warn('Background sync failed:', err);
                }
            }, 2000); // 2 seconds later
        } catch (err: any) {
            toast.error(err.message || 'Failed to save deductions');
        } finally {
            setSavingReliefs(false);
        }
    }, [profileId, currentProfile, reliefs, documentUrls, deductions, normalizeDeduction, activeMonthNum, periodMode, api, toast]);

    const handleSavePersonalInfo = async () => {
        if (!profileId) return;
        setSavingPersonalInfo(true);
        try {
            const normalizedNin = (personalInfo.nin || '').replace(/\D/g, '');
            
            await api.updatePersonalInfo(profileId, {
                nin: normalizedNin || undefined,
                fullName: personalInfo.fullName,
                streetAddress: personalInfo.streetAddress,
                city: personalInfo.city,
                state: personalInfo.state,
                residencyStatus: personalInfo.residencyStatus
            });
            
            if (currentProfile) {
                await api.completeProfile(profileId, {
                    ...currentProfile,
                    nin: normalizedNin || undefined,
                    street: personalInfo.streetAddress || currentProfile.street || undefined,
                    dob: currentProfile.dob || undefined,
                } as any);
            }
            
            setSaveSuccess(true);
            setTimeout(() => {
                setSaveSuccess(false);
                setActiveSection('income-deductions');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                toast.success('Personal information saved successfully!');
            }, 500);
        } catch (err: any) {
            toast.error(err.message || 'Failed to save personal information');
        } finally {
            setSavingPersonalInfo(false);
        }
    };

    const [taxUpdateTrigger, setTaxUpdateTrigger] = useState(0);

    const handleIncomeSaved = useCallback((monthNum: number) => {
        console.log(`📥 Income saved for month ${monthNum}`);
    }, []);

    const displayedTaxAmount = useMemo(() => {
        if (periodMode === 'monthly') {
            // Calculate cumulative total of all calculated monthly taxes
            const totalTax = Object.values(monthlyTaxByMonth).reduce((sum: number, tax: number) => {
                return sum + (typeof tax === 'number' ? tax : 0);
            }, 0);
            return `₦${totalTax.toLocaleString()}`;
        }
        const annual = taxSummary?.taxSummary?.estimatedAnnualTax;
        return annual ? `₦${annual.toLocaleString()}` : '₦0';
    }, [periodMode, monthlyTaxByMonth, taxSummary, taxUpdateTrigger]);

    // Show loading while authentication is being checked
    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003787]"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        router.push('/sign-in');
        return null;
    }

    // Show loading while profile data is being fetched
    if (loading || profileLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003787]"></div>
            </div>
        );
    }

    if (error || !currentProfile) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <h3 className="text-lg font-bold text-[#0C0C0E] mb-2">{error || 'Profile not found'}</h3>
                    <button onClick={() => router.push('/tax-folders')} className="px-4 py-2 bg-[#003787] text-white rounded-xl">Back to Tax Folders</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans pb-24 md:pb-20">
            <DashboardHeader />

            <main className="max-w-[1340px] mx-auto px-4 md:px-8 py-6 md:py-8">
                <div className="flex flex-col gap-4 mb-6 border-b border-gray-100 pb-4 md:pb-6">
                    <div className="md:hidden flex justify-between items-end">
                        <h1 className="text-base font-bold text-[#0C0C0E]">{personalInfo.fullName || 'User'}</h1>
                        <div className="text-right">
                            <h2 className="text-base font-bold text-[#0C0C0E]">{displayedTaxAmount}</h2>
                            <p className="text-[11px] text-[#6B7280] font-medium">Est. Tax</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[13px] font-bold text-[#0C0C0E] hover:text-[#003787] transition-colors w-fit">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                            Back
                        </button>
                    </div>

                    <div className="hidden md:flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 text-[12px] text-[#9CA3AF] font-medium mb-2">
                                <span>{currentProfile.year} Individual Tax</span><span>/</span>
                                <span className="text-[#6B7280]">{activeSection === 'personal-info' ? 'Personal Information' : activeSection === 'review' ? 'Review & File' : incomeSubTab === 'income' ? 'Income' : 'Deductions'}</span>
                            </div>
                            <h1 className="text-lg font-bold text-[#0C0C0E]">{personalInfo.fullName || 'User'}, {currentProfile.year} Individual Tax</h1>
                        </div>
                        <div className="text-right">
                            <h2 className="text-base font-bold text-[#0C0C0E]">{displayedTaxAmount}</h2>
                            <p className="text-[13px] text-[#6B7280] font-medium">Estimated Net Tax Payable</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-start justify-start gap-8 mt-8">
                    <PITSidebar
                        activeSection={activeSection}
                        incomeSubTab={incomeSubTab}
                        setActiveSection={setActiveSection}
                        setIncomeSubTab={setIncomeSubTab}
                        mobileSidebarOpen={mobileSidebarOpen}
                        setMobileSidebarOpen={setMobileSidebarOpen}
                        setHelpModalOpen={setHelpModalOpen}
                    />

                    <div className="flex-1 min-w-0">
                        {activeSection === 'personal-info' && (
                            <PersonalInfoSection personalInfo={personalInfo} setPersonalInfo={setPersonalInfo as any} saveSuccess={saveSuccess} savingPersonalInfo={savingPersonalInfo} onSave={handleSavePersonalInfo} currentProfile={currentProfile} onUpdateProfileProp={handleUpdateProfileProp} />
                        )}

                        {activeSection === 'income-deductions' && (
                            <IncomeDeductionsSection
                                currentProfile={currentProfile}
                                profileId={profileId!}
                                periodMode={periodMode}
                                setPeriodMode={(m: any) => { setPendingPeriodMode(m); setConfirmFilingPrefOpen(true); }}
                                activeMonth={activeMonth}
                                setActiveMonth={(m: any) => setActiveMonth(m)}
                                expandedMonth={expandedMonth}
                                setExpandedMonth={(m: any) => setExpandedMonth(m)}
                                incomeSubTab={incomeSubTab}
                                setIncomeSubTab={setIncomeSubTab}
                                paidMonths={paidMonths}
                                currentMonthIncome={currentMonthIncome}
                                setCurrentMonthIncome={setCurrentMonthIncome}
                                annualIncome={annualIncome}
                                setAnnualIncome={setAnnualIncome}
                                savingMonthlyIncome={savingMonthlyIncome}
                                setSavingMonthlyIncome={setSavingMonthlyIncome}
                                setIncomeData={setIncomeData}
                                reliefs={reliefs}
                                setReliefs={setReliefs}
                                documentUrls={documentUrls}
                                setDocumentUrls={setDocumentUrls as any}
                                uploadedFileNames={uploadedFileNames}
                                setUploadedFileNames={setUploadedFileNames as any}
                                deductions={deductions}
                                monthScopedDeductions={monthScopedDeductions}
                                savingReliefs={savingReliefs}
                                activeMonthNum={activeMonthNum}
                                handleSaveDeductions={handleSaveDeductions}
                                setActiveSection={setActiveSection}
                                incomeData={incomeData}
                                updateAnnualIncomeData={api.updateAnnualIncomeData}
                                updateMonthlyIncomeData={api.updateMonthlyIncomeData}
                                getIncomeData={api.getIncomeData}
                                uploadSimple={api.uploadSimple}
                                toast={toast as any}
                                setIncomeSaved={() => {}}
                                onIncomeSaved={handleIncomeSaved}
                            />
                        )}

                        {activeSection === 'review' && (
                            <ReviewAndFile 
                                profileId={profileId!} 
                                filingPreference={periodMode === 'annually' ? 'annual' : 'monthly'} 
                                year={currentProfile.year} 
                                onEdit={(section, tab) => {
                                    setActiveSection(section);
                                    if (tab) setIncomeSubTab(tab);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            />
                        )}
                    </div>
                </div>
            </main>

            <PITModals
                confirmFilingPrefOpen={confirmFilingPrefOpen}
                setConfirmFilingPrefOpen={setConfirmFilingPrefOpen}
                pendingPeriodMode={pendingPeriodMode as any}
                setPendingPeriodMode={setPendingPeriodMode}
                switchingFilingPref={switchingFilingPref}
                onConfirmFilingPref={async () => {
                    if (!profileId || !pendingPeriodMode) return;
                    setSwitchingFilingPref(true);
                    try {
                        const filingPreference = pendingPeriodMode === 'annually' ? 'annual' : 'monthly';
                        await api.completeProfile(profileId, { ...currentProfile, filingPreference } as any);
                        setPeriodMode(pendingPeriodMode);
                        setIncomeSubTab('income');
                        setActiveMonth('January');
                        setExpandedMonth(pendingPeriodMode === 'monthly' ? 'January' : null);
                        if (currentProfile) setCurrentProfile({ ...currentProfile, filingPreference });
                        toast.success(`Switched to ${pendingPeriodMode === 'monthly' ? 'Monthly' : 'Annual'} filing.`);
                        setConfirmFilingPrefOpen(false);
                    } catch (err: any) {
                        toast.error(err.message || 'Failed to update filing preference');
                    } finally {
                        setSwitchingFilingPref(false);
                    }
                }}
                helpModalOpen={helpModalOpen}
                setHelpModalOpen={setHelpModalOpen}
                bookingTaxAgent={bookingTaxAgent}
                onBookTaxAgent={async () => {
                    if (!profileId) return;
                    setBookingTaxAgent(true);
                    try {
                        const res = await api.createTaxAgentPaymentLink(profileId);
                        if (res?.data?.authorization_url) window.open(res.data.authorization_url, '_blank');
                        setHelpModalOpen(false);
                    } catch (err: any) {
                        toast.error(err.message || 'Failed to generate payment link');
                    } finally {
                        setBookingTaxAgent(false);
                    }
                }}
            />
        </div>
    );
}
