'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo, useLayoutEffect, useRef, startTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import { Home2Fill } from '@mingcute/react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/components/Toast/ToastProvider';
import { useTaxableApi } from '@/hooks/useTaxableApi';
import { Skeleton } from '@/components/ui/skeleton';
import { PrimaryButton, SecondaryButton, FormFieldRow, FormLabel } from '@/screens/TaxFolders/TaxFolderShared';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stepper, StepperItem, StepperIndicator, StepperTitle, StepperSeparator, StepperTrigger } from '@/components/ui/stepper';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import type { Profile, Income, Deduction, DeductionType } from '@/types/api';

// Sub-components and Shared Utilities
import { MONTHS } from './PITShared';
import { PITSidebar } from './PITSidebar';
import { PersonalInfoSection, PersonalInfo } from './PersonalInfoSection';
import { PITModals } from './PITModals';
import ReviewAndFile from './ReviewAndFile';

// ── Welcome Modal ─────────────────────────────────────────────────────────────
const PITWelcomeModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl w-full max-w-[380px] p-7 shadow-2xl">
            <div className="w-12 h-12 rounded-full border-2 border-neutral-200 flex items-center justify-center mb-5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-800">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
            <h2 className="text-6 font-semibold text-neutral-800 mb-3">Welcome to your tax workspace!</h2>
            <p className="text-2 text-neutral-500 font-medium leading-relaxed mb-1.5">
                We've organized your tax filing into simple sections. Start with{' '}
                <span className="text-neutral-800 font-semibold">Personal Info</span>{' '}
                and work your way down.
            </p>
            <p className="text-2 text-neutral-500 font-medium leading-relaxed mb-7">
                Your progress is saved automatically.
            </p>
            <PrimaryButton onClick={onClose} className="w-full">
                Got it
            </PrimaryButton>
        </div>
    </div>
);

const SkeletonLoader = () => (
    <div className="min-h-screen bg-neutral-50">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-14 pb-8">
            <div className="mb-8">
                <Skeleton className="h-5 w-16 mb-2" />
                <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex items-start gap-10">
                <div className="w-[250px] flex-shrink-0 space-y-2">
                    <Skeleton className="h-4 w-24 mb-3" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex-1 space-y-6 max-w-[400px]">
                    <Skeleton className="h-7 w-52" />
                    <Skeleton className="h-10 w-full" />
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-10" />
                        <Skeleton className="h-10" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-10" />
                        <Skeleton className="h-10" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-12 w-32" />
                </div>
            </div>
        </div>
    </div>
);

export default function PITDetails() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: authLoading, isAuthenticated } = useUser();
    const toast = useToast();
    const api = useTaxableApi();
    const profileId = searchParams?.get('id') || '';

    // ─── Component State ──────────────────────────────────────────────────
    const [activeSection, setActiveSection] = useState<'personal-info' | 'income-deductions' | 'review'>('personal-info');
    const [sectionInitialized, setSectionInitialized] = useState(false);
    const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Personal Info State
    const defaultPersonalInfo: PersonalInfo = {
        nin: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: '',
        streetAddress: '',
        city: '',
        state: '',
        lga: '',
        isResident: true,
    };

    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(() => {
        try {
            const id = searchParams?.get('id');
            if (!id) return { ...defaultPersonalInfo };
            const cached = localStorage.getItem(`taxable_pit_personal_${id}`);
            if (cached) return { ...defaultPersonalInfo, ...JSON.parse(cached) };
        } catch { /* ignore */ }
        return { ...defaultPersonalInfo };
    });
    const [savingPersonalInfo, setSavingPersonalInfo] = useState(false);
    const [personalInfoSaved, setPersonalInfoSaved] = useState(false);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    // Income & Deductions State
    const [periodMode, setPeriodMode] = useState<'monthly' | 'annually'>('monthly');
    const [activeMonth, setActiveMonth] = useState<string>('January');
    const [expandedMonth, setExpandedMonth] = useState<string | null>('January');
    const [_incomeSubTab, _setIncomeSubTab] = useState<'income' | 'deductions'>('income');

    const [incomeData, setIncomeData] = useState<Income[]>([]);
    const [deductions, setDeductions] = useState<Deduction[]>([]);

    const [_currentMonthIncome, _setCurrentMonthIncome] = useState({
        salary: '',
        bonuses: '',
        commissions: '',
        freelance: '',
        digitalAssets: ''
    });
    const [_annualIncome, _setAnnualIncome] = useState({
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
    const [_uploadedFileNames, _setUploadedFileNames] = useState({
        rentRelief: '',
        healthInsurance: '',
        pension: '',
        mortgage: ''
    });

    const [_savingMonthlyIncome, _setSavingMonthlyIncome] = useState(false);
    const [_savingReliefs, _setSavingReliefs] = useState(false);

    const [_taxSummary, _setTaxSummary] = useState<any>(null);

    // V2 Income & Deductions State (VAT-style stepper)
    const INCOME_STEPS = [
        { key: 'income', step: 1, title: 'Income Sources' },
        { key: 'deductions', step: 2, title: 'Deductions & Reliefs' },
    ];
    const [incomeStep, setIncomeStep] = useState<'income' | 'deductions'>('income');
    const [completedIncomeSteps, setCompletedIncomeSteps] = useState<Set<number>>(new Set());
    const [recordedMonths, setRecordedMonths] = useState<Set<number>>(new Set());
    const [hasUnsavedIncome, setHasUnsavedIncome] = useState(false);
    const [showUnsavedIncomeModal, setShowUnsavedIncomeModal] = useState(false);
    const [pendingIncomeAction, setPendingIncomeAction] = useState<string | null>(null);

    const goForward = (target: 'income' | 'deductions') => {
        const stepNum: Record<string, number> = { income: 1, deductions: 2 };
        const currentStepNum = stepNum[incomeStep];
        if (currentStepNum) setCompletedIncomeSteps(prev => new Set([...prev, currentStepNum]));
        setIncomeStep(target);
    };
    const goBack = (target: 'income' | 'deductions') => {
        setIncomeStep(target);
    };

    const handleUnsavedConfirm = () => {
        if (pendingIncomeAction === 'month_change') {
            setIncomeByMonth(prev => { const r = { ...prev }; delete r[activeMonthNum - 1]; return r; });
            setDeductionsByMonth(prev => { const r = { ...prev }; delete r[activeMonthNum - 1]; return r; });
        }
        setHasUnsavedIncome(false);
        setShowUnsavedIncomeModal(false);
        setPendingIncomeAction(null);
    };

    const handleSaveMonth = () => {
        setRecordedMonths(prev => new Set([...prev, activeMonthNum - 1]));
        setHasUnsavedIncome(false);
        toast.success(`Data recorded for ${INCOME_MONTH_NAMES[activeMonthNum - 1]}`);
        if (activeMonthNum < 12) {
            setActiveMonth(INCOME_MONTH_NAMES[activeMonthNum]);
        }
        setIncomeStep('income');
        setCompletedIncomeSteps(new Set());
    };

    const [incomeByMonth, setIncomeByMonth] = useState<Record<number, {
        salaryTakeHome: string; businessRevenue: string; businessExpenses: string;
        freelanceInvoiced: string; freelanceWHT: string;
        investmentIncome: string; rentalIncome: string; digitalGains: string;
    }>>({});

    const fmtInput = (set: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9.]/g, '');
        const parts = raw.split('.');
        const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        set(parts.length > 1 ? integer + '.' + parts.slice(1).join('') : integer);
    };

    const setIncomeField = (field: string, value: string) => {
        setIncomeByMonth(prev => ({ ...prev, [activeMonthNum - 1]: { ...(prev[activeMonthNum - 1] ?? {}), [field]: value } }));
        setHasUnsavedIncome(true);
    };

    const fieldSum = (field: string) => String(Object.values(incomeByMonth).reduce((s, m) => s + Number((m as any)[field]?.replace(/,/g, '') || 0), 0));
    const fieldSumFmt = (field: string) => { const v = Number(fieldSum(field).replace(/,/g, '')); return v > 0 ? v.toLocaleString() : ''; };
    const dedFieldSum = (field: string) => String(Object.values(deductionsByMonth).reduce((s, m) => s + Number((m as any)[field]?.replace(/,/g, '') || 0), 0));
    const dedFieldSumFmt = (field: string) => { const v = Number(dedFieldSum(field).replace(/,/g, '')); return v > 0 ? v.toLocaleString() : ''; };

    const [deductionsByMonth, setDeductionsByMonth] = useState<Record<number, {
        rent: string; healthInsurance: string; pension: string; mortgageInterest: string;
    }>>({});

    const [deductionFiles, setDeductionFiles] = useState<Record<string, { name: string }[]>>({});
    const healthRef = useRef<HTMLInputElement>(null);
    const pensionRef = useRef<HTMLInputElement>(null);
    const mortgageRef = useRef<HTMLInputElement>(null);
    const STORAGE_KEY_PIT_INCOME = `taxable_pit_income_${profileId}`;

    // Summaries
    const [monthlyTaxByMonth, setMonthlyTaxByMonth] = useState<Record<number, number>>({});
    const [_paidMonths] = useState<Set<number>>(new Set());

    // Modal States
    const [helpModalOpen, setHelpModalOpen] = useState(false);
    const [bookingTaxAgent, setBookingTaxAgent] = useState(false);
    const [confirmFilingPrefOpen, setConfirmFilingPrefOpen] = useState(false);
    const [pendingPeriodMode, setPendingPeriodMode] = useState<'monthly' | 'annually' | null>(null);
    const [switchingFilingPref, setSwitchingFilingPref] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // ─── Data Loading ─────────────────────────────────────────────────────
    const loadProfileData = useCallback(async () => {
        if (!profileId) return;
        
        // Wait for auth to be ready (avoid race condition on reload)
        if (authLoading || !isAuthenticated) {
            // Reset loading states - auth is still loading, don't show stuck loading
            setProfileLoading(false);
            setLoading(false);
            return;
        }
        
        setProfileLoading(true);
        try {
            const profile = await api.getProfile(profileId);
            if (profile) {
                setCurrentProfile(profile);

                setPersonalInfo(prev => ({
                    nin: profile.nin || prev.nin,
                    firstName: (profile as any).firstName || (profile.fullName && profile.fullName.split(' ')[0]) || prev.firstName,
                    lastName: (profile as any).lastName || (profile.fullName && profile.fullName.split(' ').slice(1).join(' ')) || prev.lastName,
                    email: prev.email,
                    phone: prev.phone,
                    dob: profile.dob || prev.dob,
                    streetAddress: profile.street || prev.streetAddress,
                    city: profile.city || prev.city,
                    state: profile.state || prev.state,
                    lga: (profile as any).lga || prev.lga,
                    isResident: (profile as any).residencyStatus !== 'non-resident',
                }));

                if (profile.fullName) {
                    setPersonalInfoSaved(true);
                }

                const pref = profile.filingPreference === 'annual' ? 'annually' : 'monthly';
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
                        if (annRes.success) _setTaxSummary(annRes.data);
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
    }, [loadProfileData, authLoading, isAuthenticated]);

    // Fallback: if profileLoading is stuck true and auth is ready, try loading
    useEffect(() => {
        if (!authLoading && isAuthenticated && profileLoading && !profileId) {
            // ProfileId not ready yet, will be picked up when it changes
        }
    }, [authLoading, isAuthenticated, profileLoading, profileId]);


    const normalizeDeduction = useCallback((d: any) => {
        const type = (d?.type ?? d?.deductionType) as string | undefined;
        const value = (d?.value ?? d?.amount) as number | undefined;
        const frequency = (d?.frequency ?? 'annual') as string;
        const month = (d?.month ?? null) as number | null;
        const documentUrl = d?.documentUrl as string | undefined;
        return { type, value, frequency, month, documentUrl, raw: d };
    }, []);

    const activeMonthNum = MONTHS.indexOf(activeMonth as any) + 1;

    // V2 Income month selector + stepper
    const INCOME_MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const incomeMonthSelector = (
        <Select value={INCOME_MONTH_NAMES[activeMonthNum - 1]} onValueChange={(v) => {
            const idx = INCOME_MONTH_NAMES.indexOf(v ?? '');
            if (idx >= 0 && INCOME_MONTH_NAMES[idx]) {
                if (hasUnsavedIncome) {
                    setPendingIncomeAction('month_change');
                    setShowUnsavedIncomeModal(true);
                } else setActiveMonth(INCOME_MONTH_NAMES[idx]!);
            }
        }}>
            <SelectTrigger className="w-fit min-w-[180px] h-10 rounded-xl bg-white border-neutral-50 text-3">
                <div className="flex items-center gap-2 mr-6">
                    <span>{INCOME_MONTH_NAMES[activeMonthNum - 1]}</span>
                    {recordedMonths.has(activeMonthNum - 1) &&
                        <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-200 text-2 font-semibold px-2 py-0 h-5">Recorded</Badge>
                    }
                </div>
            </SelectTrigger>
            <SelectContent>
                {INCOME_MONTH_NAMES.map((m, i) => (
                    <SelectItem key={m} value={m}>
                        <div className="flex items-center gap-2">
                            <span>{m}</span>
                            {recordedMonths.has(i) &&
                                <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-200 text-2 font-semibold px-2 py-0 h-5">Recorded</Badge>
                            }
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );

    const incomeStepIndex = incomeStep === 'income' ? 1 : 2;

    // V2 derived calculations
    const currentIncome = incomeByMonth[activeMonthNum - 1] ?? {};
    const setDeductionField = (field: string, value: string) => {
        setDeductionsByMonth(prev => ({ ...prev, [activeMonthNum - 1]: { ...(prev[activeMonthNum - 1] ?? {}), [field]: value } }));
    };
    const currentDeductions = deductionsByMonth[activeMonthNum - 1] ?? {};
    const businessIncome = (Number((currentIncome as any).businessRevenue?.replace(/,/g, '')) || 0) - (Number((currentIncome as any).businessExpenses?.replace(/,/g, '')) || 0);
    const freelanceNet = (Number((currentIncome as any).freelanceInvoiced?.replace(/,/g, '')) || 0) - (Number((currentIncome as any).freelanceWHT?.replace(/,/g, '')) || 0);
    const fmt = (n: number) => n > 0 ? `₦${Math.round(n).toLocaleString()}` : '₦ 0';
    const totalMonthlyIncome = (Number((currentIncome as any).salaryTakeHome?.replace(/,/g, '')) || 0) + Math.max(0, businessIncome) + Math.max(0, freelanceNet) + (Number((currentIncome as any).investmentIncome?.replace(/,/g, '')) || 0) + (Number((currentIncome as any).rentalIncome?.replace(/,/g, '')) || 0) + (Number((currentIncome as any).digitalGains?.replace(/,/g, '')) || 0);
    const totalDeductions = ((v: any) => (Number((v as any).rent?.replace(/,/g, '')) || 0) + (Number((v as any).healthInsurance?.replace(/,/g, '')) || 0) + (Number((v as any).pension?.replace(/,/g, '')) || 0) + (Number((v as any).mortgageInterest?.replace(/,/g, '')) || 0))(currentDeductions);
    const monthlyTaxable = Math.max(0, totalMonthlyIncome - totalDeductions);

    const PAYE_BANDS = [
        { limit: 800000, rate: 0 },
        { limit: 2200000, rate: 0.15 },
        { limit: 9000000, rate: 0.18 },
        { limit: 13000000, rate: 0.21 },
        { limit: 25000000, rate: 0.25 },
        { limit: Infinity, rate: 0.25 },
    ];

    const calculatePAYE = (annualTaxable: number) => {
        let remaining = annualTaxable;
        let tax = 0;
        for (const band of PAYE_BANDS) {
            const chunk = Math.min(remaining, band.limit);
            tax += chunk * band.rate;
            remaining -= chunk;
            if (remaining <= 0) break;
        }
        return { annualTax: Math.round(tax), monthlyTax: Math.round(tax / 12) };
    };

    const _monthlyPAYE = calculatePAYE(monthlyTaxable * 12).monthlyTax;

    // YTD totals (sum across all months)
    const ytdGrossIncome = Object.values(incomeByMonth).reduce((sum, m) => {
        const bi = (Number((m as any).businessRevenue?.replace(/,/g, '')) || 0) - (Number((m as any).businessExpenses?.replace(/,/g, '')) || 0);
        const fn = (Number((m as any).freelanceInvoiced?.replace(/,/g, '')) || 0) - (Number((m as any).freelanceWHT?.replace(/,/g, '')) || 0);
        return sum + (Number((m as any).salaryTakeHome?.replace(/,/g, '')) || 0) + Math.max(0, bi) + Math.max(0, fn) + (Number((m as any).investmentIncome?.replace(/,/g, '')) || 0) + (Number((m as any).rentalIncome?.replace(/,/g, '')) || 0) + (Number((m as any).digitalGains?.replace(/,/g, '')) || 0);
    }, 0);
    const ytdDeductions = Object.values(deductionsByMonth).reduce((sum, m) => sum + (Number((m as any).rent?.replace(/,/g, '')) || 0) + (Number((m as any).healthInsurance?.replace(/,/g, '')) || 0) + (Number((m as any).pension?.replace(/,/g, '')) || 0) + (Number((m as any).mortgageInterest?.replace(/,/g, '')) || 0), 0);
    const monthCount = Object.keys(incomeByMonth).length || 1;
    const annualizedGross = ytdGrossIncome;
    const annualizedDeds = ytdDeductions;
    const annualTaxable = Math.max(0, annualizedGross - annualizedDeds);
    const estimatedAnnualTax = calculatePAYE(annualTaxable).annualTax;

    const renderIncomeSection = () => {
        if (activeSection !== 'income-deductions') return null;
        return (
            <div className="w-full">
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <h1 className="text-5 font-semibold text-neutral-800 tracking-[-0.02em]">
                                Income &amp; Deductions
                            </h1>
                            {periodMode === 'monthly' && incomeMonthSelector}
                        </div>
                        <Tabs value={periodMode} onValueChange={(v) => {
                            if (v !== periodMode && v === 'annually' && monthCount > 1) {
                                setPendingPeriodMode(v as 'monthly' | 'annually');
                                setConfirmFilingPrefOpen(true);
                            } else {
                                setPeriodMode(v as 'monthly' | 'annually');
                            }
                        }}>
                            <TabsList className="h-9 bg-neutral-50 rounded-lg p-0.5">
                                <TabsTrigger value="monthly" className="text-2 px-3 py-1 rounded-md !text-neutral-300 font-medium data-active:!bg-neutral-800 data-active:!text-white">Monthly</TabsTrigger>
                                <TabsTrigger value="annually" className="text-2 px-3 py-1 rounded-md !text-neutral-300 font-medium data-active:!bg-neutral-800 data-active:!text-white">Annual</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <Stepper value={incomeStepIndex} onValueChange={(step) => {
                        const map: Record<number, 'income' | 'deductions'> = {1: 'income', 2: 'deductions'};
                        if (step <= incomeStepIndex) goBack(map[step]);
                    }} className="max-w-[400px]">
                        {INCOME_STEPS.map((s, idx) => (
                            <StepperItem key={s.key} step={s.step} completed={completedIncomeSteps.has(s.step)} disabled={s.step > incomeStepIndex} className="[&:not(:last-child)]:flex-1 data-[state=inactive]:[&_h3]:text-neutral-400 [&_h3]:text-neutral-800">
                                <StepperTrigger className="flex items-center gap-3 max-md:flex-col">
                                    <StepperIndicator />
                                    <div className="text-center md:text-left">
                                        <StepperTitle className="text-2 font-medium">{s.title}</StepperTitle>
                                    </div>
                                </StepperTrigger>
                                {idx < INCOME_STEPS.length - 1 && <StepperSeparator className="md:mx-4" />}
                            </StepperItem>
                        ))}
                    </Stepper>
                </div>

                <div className="flex gap-16">
                <div className="flex-1 min-w-0 max-w-[500px]">

                {/* Step 1: Income Sources */}
                {incomeStep === 'income' && (
                    <div data-animate>

                        <div className="space-y-4">
                            {(currentProfile?.primaryIncomeSources ?? []).includes('Salary / Employment') && (
                                <div className="bg-neutral-50 rounded-3xl p-5">
                                    <div className="space-y-3">
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="The actual cash amount transferred to your bank account by your employer after taxes and pensions are deducted.">{periodMode === 'annually' ? 'Annual' : 'Monthly'} Take-Home Pay</FormLabel>
                                             <Input type="text" placeholder="₦ 0.00" value={periodMode === 'annually' ? fieldSumFmt('salaryTakeHome') : (currentIncome as any).salaryTakeHome ?? ''} onChange={fmtInput((v) => setIncomeField('salaryTakeHome', v))} disabled={periodMode === 'annually'} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                    </div>
                                </div>
                            )}

                            {(currentProfile?.primaryIncomeSources ?? []).includes('Business/Self-employment') && (
                                <div className="bg-neutral-50 rounded-3xl p-5">
                                    <h3 className="text-3 font-semibold text-neutral-800 mb-4">Business Income</h3>
                                    <div className="space-y-3">
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="Total monthly revenue from your business or self-employment activities.">{periodMode === 'annually' ? 'Annual' : 'Monthly'} Gross Revenue</FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={periodMode === 'annually' ? fieldSumFmt('businessRevenue') : (currentIncome as any).businessRevenue ?? ''} onChange={fmtInput((v) => setIncomeField('businessRevenue', v))} disabled={periodMode === 'annually'} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="Total monthly expenses incurred in running your business.">{periodMode === 'annually' ? 'Annual' : 'Monthly'} Business Expenses</FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={periodMode === 'annually' ? fieldSumFmt('businessExpenses') : (currentIncome as any).businessExpenses ?? ''} onChange={fmtInput((v) => setIncomeField('businessExpenses', v))} disabled={periodMode === 'annually'} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                    </div>
                                </div>
                            )}

                            {(currentProfile?.primaryIncomeSources ?? []).includes('Freelance/Consulting') && (
                                <div className="bg-neutral-50 rounded-3xl p-5">
                                    <h3 className="text-3 font-semibold text-neutral-800 mb-4">Freelance / Consulting</h3>
                                    <div className="space-y-3">
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="Total value of invoices that were paid by your clients this month.">Total Project Invoices Paid</FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={periodMode === 'annually' ? fieldSumFmt('freelanceInvoiced') : (currentIncome as any).freelanceInvoiced ?? ''} onChange={fmtInput((v) => setIncomeField('freelanceInvoiced', v))} disabled={periodMode === 'annually'} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="Enter any tax amount your clients held back from your payment (usually 5%). We track this as a direct credit to lower your final PIT bill.">Less: WHT Deducted at Source</FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={periodMode === 'annually' ? fieldSumFmt('freelanceWHT') : (currentIncome as any).freelanceWHT ?? ''} onChange={fmtInput((v) => setIncomeField('freelanceWHT', v))} disabled={periodMode === 'annually'} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                    </div>
                                </div>
                            )}

                            {(currentProfile?.primaryIncomeSources ?? []).includes('Investment income') && (
                                <div className="bg-neutral-50 rounded-3xl p-5">
                                    <div className="space-y-3">
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="Dividends and interest earned on your investments this month.">Dividends / Interest Received</FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={periodMode === 'annually' ? fieldSumFmt('investmentIncome') : (currentIncome as any).investmentIncome ?? ''} onChange={fmtInput((v) => setIncomeField('investmentIncome', v))} disabled={periodMode === 'annually'} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                    </div>
                                </div>
                            )}

                            {(currentProfile?.primaryIncomeSources ?? []).includes('Rental income') && (
                                <div className="bg-neutral-50 rounded-3xl p-5">
                                    <div className="space-y-3">
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="Total rent payments collected from your tenants this month.">Gross Rent Payments Collected</FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={periodMode === 'annually' ? fieldSumFmt('rentalIncome') : (currentIncome as any).rentalIncome ?? ''} onChange={fmtInput((v) => setIncomeField('rentalIncome', v))} disabled={periodMode === 'annually'} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                    </div>
                                </div>
                            )}

                            {(currentProfile?.primaryIncomeSources ?? []).includes('Digital Assets/Crypto') && (
                                <div className="bg-neutral-50 rounded-3xl p-5">
                                    <div className="space-y-3">
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="Total realized profits from asset sales or trading inside the month.">Net Crypto / Digital Asset Gains</FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={periodMode === 'annually' ? fieldSumFmt('digitalGains') : (currentIncome as any).digitalGains ?? ''} onChange={fmtInput((v) => setIncomeField('digitalGains', v))} disabled={periodMode === 'annually'} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                    </div>
                                </div>
                            )}

                            {(currentProfile?.primaryIncomeSources ?? []).length === 0 && (
                                <p className="text-2 text-neutral-500 font-medium">No income sources selected during onboarding.</p>
                            )}
                        </div>

                        <div className="flex gap-3 mt-8">
                            <PrimaryButton onClick={() => goForward('deductions')}>
                                Next: Deductions &amp; Reliefs
                            </PrimaryButton>
                        </div>
                    </div>
                )}

                {/* Step 2: Deductions & Reliefs */}
                {incomeStep === 'deductions' && (
                    <div className="max-w-[500px] mx-auto" data-animate>
                        <h2 className="text-3 font-semibold text-neutral-800 tracking-[-0.02em] mb-6">Deductions &amp; Reliefs</h2>

                        <div className="space-y-4">
                            {currentProfile?.paysRent && (
                                <div className="bg-neutral-50 rounded-3xl p-5">
                                    <div className="space-y-3">
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="Your monthly rent payment. The system caps this at 20% of actual rent or ₦500,000 per year, whichever is lower.">{periodMode === 'annually' ? 'Annual' : 'Monthly'} Rent Allocation</FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={periodMode === 'annually' ? dedFieldSumFmt('rent') : (currentDeductions as any).rent ?? ''} onChange={fmtInput((v) => setDeductionField('rent', v))} disabled={periodMode === 'annually'} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                    </div>
                                </div>
                            )}

                            {currentProfile?.hasHealthInsurance && (
                                <div className="bg-neutral-50 rounded-3xl p-5">
                                    <div className="space-y-3">
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="The exact medical insurance premium amount you paid out of pocket this month.">{periodMode === 'annually' ? 'Annual' : 'Monthly'} HMO / Health Insurance Premium</FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={periodMode === 'annually' ? dedFieldSumFmt('healthInsurance') : (currentDeductions as any).healthInsurance ?? ''} onChange={fmtInput((v) => setDeductionField('healthInsurance', v))} disabled={periodMode === 'annually'} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                    </div>
                                    <div className="mt-3">
                                        <div className="bg-white flex items-center justify-between gap-4 p-3 border border-dashed border-neutral-200 rounded-xl">
                                            <span className="text-1 text-neutral-400 font-medium">Upload insurance receipt</span>
                                            <button onClick={() => healthRef.current?.click()} className="cursor-pointer text-2 font-semibold text-neutral-800 bg-transparent border-none p-0">Upload</button>
                                            <input ref={healthRef} type="file" hidden accept=".pdf,.jpg,.png" onChange={(e) => { const f = e.target.files; if (!f) return; setDeductionFiles(prev => ({ ...prev, ['health_' + (activeMonthNum - 1)]: [...(prev['health_' + (activeMonthNum - 1)] ?? []), ...Array.from(f).map(x => ({ name: x.name }))] })); e.target.value = ''; }} />
                                        </div>
                                        {((deductionFiles['health_' + (activeMonthNum - 1)] ?? [])).map((file, i) => (
                                            <div key={i} className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-neutral-100 rounded-lg">
                                                <span className="text-1 text-neutral-600">{file.name}</span>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-neutral-400 cursor-pointer ml-1" onClick={() => setDeductionFiles(prev => ({ ...prev, ['health_' + (activeMonthNum - 1)]: (prev['health_' + (activeMonthNum - 1)] ?? []).filter((_, j) => j !== i) }))}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentProfile?.hasPension && (
                                <div className="bg-neutral-50 rounded-3xl p-5">
                                    <div className="space-y-3">
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="Your personal contribution paid directly into your Pension Fund Administrator (PFA) account this month.">{periodMode === 'annually' ? 'Annual' : 'Monthly'} Pension Contribution</FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={periodMode === 'annually' ? dedFieldSumFmt('pension') : (currentDeductions as any).pension ?? ''} onChange={fmtInput((v) => setDeductionField('pension', v))} disabled={periodMode === 'annually'} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                    </div>
                                    <div className="mt-3">
                                        <div className="bg-white flex items-center justify-between gap-4 p-3 border border-dashed border-neutral-200 rounded-xl">
                                            <span className="text-1 text-neutral-400 font-medium">Upload pension receipt</span>
                                            <button onClick={() => pensionRef.current?.click()} className="cursor-pointer text-2 font-semibold text-neutral-800 bg-transparent border-none p-0">Upload</button>
                                            <input ref={pensionRef} type="file" hidden accept=".pdf,.jpg,.png" onChange={(e) => { const f = e.target.files; if (!f) return; setDeductionFiles(prev => ({ ...prev, ['pension_' + (activeMonthNum - 1)]: [...(prev['pension_' + (activeMonthNum - 1)] ?? []), ...Array.from(f).map(x => ({ name: x.name }))] })); e.target.value = ''; }} />
                                        </div>
                                        {((deductionFiles['pension_' + (activeMonthNum - 1)] ?? [])).map((file, i) => (
                                            <div key={i} className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-neutral-100 rounded-lg">
                                                <span className="text-1 text-neutral-600">{file.name}</span>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-neutral-400 cursor-pointer ml-1" onClick={() => setDeductionFiles(prev => ({ ...prev, ['pension_' + (activeMonthNum - 1)]: (prev['pension_' + (activeMonthNum - 1)] ?? []).filter((_, j) => j !== i) }))}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentProfile?.hasMortgage && (
                                <div className="bg-neutral-50 rounded-3xl p-5">
                                    <div className="space-y-3">
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="Only enter the interest portion of your monthly mortgage payment, as the principal repayment is not tax-deductible by law.">{periodMode === 'annually' ? 'Annual' : 'Monthly'} Mortgage Interest Paid</FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={periodMode === 'annually' ? dedFieldSumFmt('mortgageInterest') : (currentDeductions as any).mortgageInterest ?? ''} onChange={fmtInput((v) => setDeductionField('mortgageInterest', v))} disabled={periodMode === 'annually'} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                    </div>
                                    <div className="mt-3">
                                        <div className="bg-white flex items-center justify-between gap-4 p-3 border border-dashed border-neutral-200 rounded-xl">
                                            <span className="text-1 text-neutral-400 font-medium">Upload mortgage receipt</span>
                                            <button onClick={() => mortgageRef.current?.click()} className="cursor-pointer text-2 font-semibold text-neutral-800 bg-transparent border-none p-0">Upload</button>
                                            <input ref={mortgageRef} type="file" hidden accept=".pdf,.jpg,.png" onChange={(e) => { const f = e.target.files; if (!f) return; setDeductionFiles(prev => ({ ...prev, ['mortgage_' + (activeMonthNum - 1)]: [...(prev['mortgage_' + (activeMonthNum - 1)] ?? []), ...Array.from(f).map(x => ({ name: x.name }))] })); e.target.value = ''; }} />
                                        </div>
                                        {((deductionFiles['mortgage_' + (activeMonthNum - 1)] ?? [])).map((file, i) => (
                                            <div key={i} className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-neutral-100 rounded-lg">
                                                <span className="text-1 text-neutral-600">{file.name}</span>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-neutral-400 cursor-pointer ml-1" onClick={() => setDeductionFiles(prev => ({ ...prev, ['mortgage_' + (activeMonthNum - 1)]: (prev['mortgage_' + (activeMonthNum - 1)] ?? []).filter((_, j) => j !== i) }))}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!currentProfile?.paysRent && !currentProfile?.hasHealthInsurance && !currentProfile?.hasPension && !currentProfile?.hasMortgage && (
                                <p className="text-2 text-neutral-500 font-medium">No deductions or reliefs selected during onboarding.</p>
                            )}
                        </div>

                        <div className="flex gap-3 mt-8">
                            <SecondaryButton onClick={() => goBack('income')}>Back</SecondaryButton>
                            {periodMode === 'monthly' && activeMonthNum === 12 ? (
                                <PrimaryButton onClick={() => { handleSaveMonth(); setActiveSection('review'); }}>
                                    Save &amp; File Annual Filing
                                </PrimaryButton>
                            ) : (
                                <PrimaryButton onClick={() => handleSaveMonth()}>Save</PrimaryButton>
                            )}
                            {periodMode === 'annually' && (
                                <PrimaryButton onClick={() => { handleSaveMonth(); setActiveSection('review'); }}>
                                    Save &amp; File Annual Filing
                                </PrimaryButton>
                            )}
                        </div>
                    </div>
                )}

                </div>

                {/* Right panel — Estimated Annual Summary */}
                <div className="w-[280px] flex-shrink-0 sticky top-24 self-start border border-neutral-50 rounded-xl p-4">
                    <h3 className="text-2 font-semibold text-neutral-800 mb-3">Estimated Annual Summary</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-2">
                            <span className="text-neutral-500">Gross Income</span>
                            <span className="font-medium text-neutral-500">{fmt(annualizedGross)}</span>
                        </div>
                        <div className="flex items-center justify-between text-2">
                            <span className="text-neutral-500">Deductions</span>
                            <span className="font-medium text-neutral-500">-{fmt(annualizedDeds)}</span>
                        </div>
                        <div className="border-t border-neutral-100 pt-2 mt-2">
                            <div className="flex items-center justify-between text-2">
                                <span className="font-semibold text-neutral-800">Taxable Income</span>
                                <span className="font-semibold text-neutral-500">{fmt(annualTaxable)}</span>
                            </div>
                        </div>
                        <div className="border-t border-neutral-100 pt-2 mt-2">
                            <div className="flex items-center justify-between text-2">
                                <span className="font-semibold text-neutral-800">Estimated PIT</span>
                                <span className="text-3 font-semibold text-neutral-800">{fmt(estimatedAnnualTax)}</span>
                            </div>
                        </div>
                        {monthCount > 1 && (
                            <div className="border-t border-neutral-100 pt-2 mt-2">
                                <p className="text-1 text-neutral-400 font-medium">{periodMode === 'annually' ? '' : `${Object.keys(incomeByMonth).length} of 12 months tracked`}</p>
                            </div>
                        )}
                    </div>
                </div>
                </div>
            </div>
        );
    };


    const monthScopedDeductions = useMemo(() => {
        const list = (deductions || []).map(normalizeDeduction).filter(d => !!d.type);
        if (periodMode !== 'monthly') return list;
        return list.filter(d => {
            if (d.frequency === 'monthly') return d.month === activeMonthNum;
            if (d.type === 'rent_relief') return true;
            return false;
        });
    }, [deductions, normalizeDeduction, periodMode, activeMonthNum]);

    useEffect(() => {
        const index = periodMode === 'annually' ? 0 : activeMonthNum - 1;
        const monthItems = (incomeData[index] as any) || [];

        const salary = monthItems.find((i: any) => i.type === 'employment')?.grossSalary?.toString() || '';
        const bonuses = monthItems.find((i: any) => i.type === 'employment')?.bonuses?.toString() || '';
        const commissions = monthItems.find((i: any) => i.type === 'employment')?.commissions?.toString() || '';
        const freelance = monthItems.find((i: any) => i.type === 'freelance')?.value?.toString() || '';
        const digitalAssets = monthItems.find((i: any) => i.type === 'digital_assets' || i.type === 'crypto')?.value?.toString() || '';
        
        const data = { salary, bonuses, commissions, freelance, digitalAssets };
        if (periodMode === 'annually') _setAnnualIncome(data);
        else _setCurrentMonthIncome(data);
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

    const _handleSaveDeductions = useCallback(async () => {
        if (!profileId || !currentProfile) return;
        
        const missingFields: string[] = [];
        if (!currentProfile.dob) missingFields.push('Date of Birth');
        if (!currentProfile.street) missingFields.push('Street Address');
        if (!currentProfile.city) missingFields.push('City');
        if (!currentProfile.state) missingFields.push('State');
        
        if (missingFields.length > 0) {
            toast.error(`Please complete your Personal Information first. Missing: ${missingFields.join(', ')}`);
            setActiveSection('personal-info');
            return;
        }
        
        _setSavingReliefs(true);
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
                    _setIncomeSubTab('income'); // Switch to income tab for next month
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
            _setSavingReliefs(false);
        }
    }, [profileId, currentProfile, reliefs, documentUrls, deductions, normalizeDeduction, activeMonthNum, periodMode, api, toast]);

    const handleSavePersonalInfo = useCallback(async () => {
        setSavingPersonalInfo(true);
        try {
            const normalizedNin = (personalInfo.nin || '').replace(/\D/g, '');
            const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();

            await api.updatePersonalInfo(profileId, {
                nin: normalizedNin || undefined,
                fullName: fullName,
                dob: personalInfo.dob,
                streetAddress: personalInfo.streetAddress,
                city: personalInfo.city,
                state: personalInfo.state,
                residencyStatus: personalInfo.isResident ? 'resident' : 'non-resident',
            });
            
            if (currentProfile) {
                await api.completeProfile(profileId, {
                    ...currentProfile,
                    nin: normalizedNin || undefined,
                    street: personalInfo.streetAddress || currentProfile.street || undefined,
                    dob: personalInfo.dob || currentProfile.dob || undefined,
                } as any);
            }

            setPersonalInfoSaved(true);

            setTimeout(() => {
                setActiveSection('income-deductions');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                toast.success('Personal information saved successfully!');
            }, 500);
        } catch (err: any) {
            console.error('[PIT] Save personal info failed:', err);
            toast.error(err.message || 'Failed to save personal information');
        } finally {
            setSavingPersonalInfo(false);
        }
    }, [profileId, personalInfo, currentProfile, api, toast]);

    const _handleIncomeSaved = useCallback((monthNum: number) => {
        console.log(`📥 Income saved for month ${monthNum}`);
    }, []);

    const personalInfoComplete = !!(
        personalInfo.firstName &&
        personalInfo.lastName &&
        personalInfo.nin &&
        personalInfo.email &&
        personalInfo.phone &&
        personalInfo.dob &&
        personalInfo.streetAddress &&
        personalInfo.city &&
        personalInfo.state &&
        personalInfo.lga &&
        personalInfoSaved
    );

    // Lenis smooth scroll
    useLayoutEffect(() => {
        if (typeof window === 'undefined') return;
        if ((window as any).__lenis) return;
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;
        const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.8 });
        (window as any).__lenis = lenis;
        const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
        return () => { lenis.destroy(); (window as any).__lenis = undefined; };
    }, []);

    // GSAP reveal animations
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('[data-animate]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: 'power2.out' });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    // Restore income data from localStorage on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_PIT_INCOME);
            if (!raw) return;
            const saved = JSON.parse(raw);
            if (saved.incomeByMonth) setIncomeByMonth(saved.incomeByMonth);
            if (saved.deductionsByMonth) setDeductionsByMonth(saved.deductionsByMonth);
            if (saved.deductionFiles) setDeductionFiles(saved.deductionFiles);
            if (saved.recordedMonths) setRecordedMonths(new Set(saved.recordedMonths));
        } catch { /* ignore */ }
    }, []);

    // Auto-save income data to localStorage
    useEffect(() => {
        if (!profileId) return;
        try {
            localStorage.setItem(STORAGE_KEY_PIT_INCOME, JSON.stringify({
                incomeByMonth, deductionsByMonth, deductionFiles,
                recordedMonths: Array.from(recordedMonths),
            }));
        } catch { /* ignore */ }
    }, [incomeByMonth, deductionsByMonth, deductionFiles, recordedMonths, STORAGE_KEY_PIT_INCOME]);

    // Auto-save personal info to localStorage
    useEffect(() => {
        if (!profileId) return;
        try { localStorage.setItem(`taxable_pit_personal_${profileId}`, JSON.stringify(personalInfo)); } catch {}
    }, [personalInfo, profileId]);

    // Show welcome modal for new workspaces
    useEffect(() => {
        const isNew = searchParams?.get('new');
        if (isNew === 'workspace') {
            startTransition(() => {
                setShowWelcomeModal(true);
            });
            router.replace(window.location.pathname);
        }
    }, []);

    // Show skeleton while authentication is being checked
    if (authLoading) {
        return <SkeletonLoader />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        router.push('/sign-in');
        return null;
    }

    // Show skeleton while profile data is being fetched
    if (loading || profileLoading) {
        return <SkeletonLoader />;
    }

    if (error || !currentProfile) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">{error || 'Profile not found'}</h3>
                    <button onClick={() => router.push('/tax-folders')} className="px-4 py-2 bg-taxable-blue text-white rounded-xl">Back to Tax Folders</button>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-white pb-24 md:pb-20">
            {/* Breadcrumb nav bar */}
            <div className="w-full bg-white border-b border-neutral-100 px-4 md:px-8 py-3">
                <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-1">
                    <button onClick={() => router.push('/home')} className="flex items-center gap-2 text-3 font-semibold text-neutral-800 w-fit shrink-0">
                        <Home2Fill className="w-5 h-5" color="#E5E5E5" />
                        Home
                    </button>
                    <div className="flex items-center gap-2 text-1 text-neutral-300 font-medium">
                        <span>{currentProfile.year} Individual Tax</span>
                        <span>/</span>
                         <span className="text-neutral-300">{({ 'personal-info': 'Personal Information', 'income-deductions': 'Income & Deductions', 'review': 'Annual Filing' })[activeSection] || 'Personal Information'}</span>
                    </div>
                </div>
            </div>

            <main className="max-w-[1200px] mx-auto px-4 md:px-8 pt-14 pb-8">
                <div className="flex items-start gap-10">
                    <PITSidebar
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                        personalInfoComplete={personalInfoComplete}
                    />

                    <div className="flex-1 min-w-0">
                         {activeSection === 'personal-info' && (
                             <PersonalInfoSection personalInfo={personalInfo} setPersonalInfo={setPersonalInfo as any} savingPersonalInfo={savingPersonalInfo} onSave={handleSavePersonalInfo} />
                        )}

                         {renderIncomeSection()}

                          {activeSection === 'review' && (
                            <ReviewAndFile 
                                profileId={profileId!} 
                                filingPreference={periodMode === 'annually' ? 'annual' : 'monthly'} 
                                year={currentProfile.year} 
                                monthlyTaxByMonth={monthlyTaxByMonth}
                                onEdit={(section, tab) => {
                                    setActiveSection(section);
                                    if (tab) _setIncomeSubTab(tab);
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
                        _setIncomeSubTab('income');
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

            {showUnsavedIncomeModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-[380px] p-6 shadow-2xl">
                        <h3 className="text-5 font-semibold text-neutral-800 mb-2">Unsaved Changes</h3>
                        <p className="text-2 text-neutral-500 font-medium mb-6">You have unsaved changes for {INCOME_MONTH_NAMES[activeMonthNum - 1]}. Save before leaving?</p>
                        <div className="flex gap-3 w-full">
                            <SecondaryButton className="flex-1" onClick={() => { handleUnsavedConfirm(); setShowUnsavedIncomeModal(false); }}>
                                Discard
                            </SecondaryButton>
                            <SecondaryButton className="flex-1" onClick={() => setShowUnsavedIncomeModal(false)}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton className="flex-1" onClick={() => { handleSaveMonth(); setShowUnsavedIncomeModal(false); }}>
                                Save
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            )}

            {showWelcomeModal && <PITWelcomeModal onClose={() => setShowWelcomeModal(false)} />}
        </div>
    );
}
