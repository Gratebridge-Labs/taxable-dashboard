'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useLayoutEffect, useRef, startTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import { Home2Fill } from '@mingcute/react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/components/Toast/ToastProvider';
import { useTaxableApi } from '@/hooks/useTaxableApi';
import { Skeleton } from '@/components/ui/skeleton';
import { PrimaryButton, SecondaryButton, FormFieldRow, FormLabel, FilingSheet } from '@/screens/TaxFolders/TaxFolderShared';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stepper, StepperItem, StepperIndicator, StepperTitle, StepperSeparator, StepperTrigger } from '@/components/ui/stepper';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import type { Profile } from '@/types/api';

// Sub-components and Shared Utilities
import { MONTHS } from './PITShared';
import { PITSidebar } from './PITSidebar';
import { PersonalInfoSection, PersonalInfo } from './PersonalInfoSection';
import { PITModals } from './PITModals';

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
    const { loading: authLoading, isAuthenticated } = useUser();
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
    const [_expandedMonth, _setExpandedMonth] = useState<string | null>('January');

    // V2 Income & Deductions State (VAT-style stepper)
    const INCOME_STEPS = [
        { key: 'income', step: 1, title: 'Income Sources' },
        { key: 'deductions', step: 2, title: 'Deductions & Reliefs' },
    ];
    const [incomeStep, setIncomeStep] = useState<'income' | 'deductions'>('income');
    const [completedIncomeSteps, setCompletedIncomeSteps] = useState<Set<number>>(new Set());
    const [recordedMonths, setRecordedMonths] = useState<Set<number>>(new Set());
    const hasRecordedData = recordedMonths.size > 0;
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
        const monthData = incomeByMonth[activeMonthNum - 1] ?? {};
        const hasData = Object.values(monthData).some(v => v !== undefined && v !== '' && Number((v as string)?.replace(/,/g, '') || 0) > 0);
        if (hasData) {
            setRecordedMonths(prev => new Set([...prev, activeMonthNum - 1]));
        } else {
            setRecordedMonths(prev => { const r = new Set(prev); r.delete(activeMonthNum - 1); return r; });
        }
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
    const [incomeFiles, setIncomeFiles] = useState<Record<string, { name: string }[]>>({});
    const healthRef = useRef<HTMLInputElement>(null);
    const pensionRef = useRef<HTMLInputElement>(null);
    const mortgageRef = useRef<HTMLInputElement>(null);
    const salaryRef = useRef<HTMLInputElement>(null);
    const businessRef = useRef<HTMLInputElement>(null);
    const freelanceRef = useRef<HTMLInputElement>(null);
    const investmentRef = useRef<HTMLInputElement>(null);
    const rentalRef = useRef<HTMLInputElement>(null);
    const cryptoRef = useRef<HTMLInputElement>(null);
    const rentRef = useRef<HTMLInputElement>(null);
    const STORAGE_KEY_PIT_INCOME = `taxable_pit_income_${profileId}`;

    // Annual Filing state
    const [legalConfirmPIT1, setLegalConfirmPIT1] = useState(false);
    const [legalConfirmPIT2, setLegalConfirmPIT2] = useState(false);
    const [showFilingSheetPIT, setShowFilingSheetPIT] = useState(false);
    const [annualReturnFiledPIT, setAnnualReturnFiledPIT] = useState(() => {
        try { return localStorage.getItem(`taxable_pit_filed_${profileId}`) === 'true'; } catch { return false; }
    });

    // Modal States
    const [helpModalOpen, setHelpModalOpen] = useState(false);
    const [bookingTaxAgent, setBookingTaxAgent] = useState(false);
    const [confirmFilingPrefOpen, setConfirmFilingPrefOpen] = useState(false);
    const [pendingPeriodMode, setPendingPeriodMode] = useState<'monthly' | 'annually' | null>(null);
    const [switchingFilingPref, _setSwitchingFilingPref] = useState(false);
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

                // Determine starting section - Background auto-continue logic
                if (!sectionInitialized) {
                    const hasPersonalInfo = !!(profile.nin && profile.fullName);

                    // Auto-continue to the most appropriate section
                    if (!hasPersonalInfo) {
                        setActiveSection('personal-info');
                    } else {
                        setActiveSection('income-deductions');
                    }
                    setSectionInitialized(true);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load profile');
        } finally {
            setProfileLoading(false);
            setLoading(false);
        }
    }, [profileId, sectionInitialized, api, authLoading, isAuthenticated]);

    useEffect(() => {
        loadProfileData();
    }, [loadProfileData, authLoading, isAuthenticated]);

    // Fallback: if profileLoading is stuck true and auth is ready, try loading
    useEffect(() => {
        if (!authLoading && isAuthenticated && profileLoading && !profileId) {
            // ProfileId not ready yet, will be picked up when it changes
        }
    }, [authLoading, isAuthenticated, profileLoading, profileId]);


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
                } else {
                    setActiveMonth(INCOME_MONTH_NAMES[idx]!);
                    setIncomeStep('income');
                    setCompletedIncomeSteps(new Set());
                }
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
        setHasUnsavedIncome(true);
    };
    const currentDeductions = deductionsByMonth[activeMonthNum - 1] ?? {};
    const businessIncome = (Number((currentIncome as any).businessRevenue?.replace(/,/g, '')) || 0) - (Number((currentIncome as any).businessExpenses?.replace(/,/g, '')) || 0);
    const freelanceNet = (Number((currentIncome as any).freelanceInvoiced?.replace(/,/g, '')) || 0) - (Number((currentIncome as any).freelanceWHT?.replace(/,/g, '')) || 0);
    const fmt = (n: number) => n > 0 ? `₦${Math.round(n).toLocaleString()}` : '₦ 0';
    const totalMonthlyIncome = (Number((currentIncome as any).salaryTakeHome?.replace(/,/g, '')) || 0) + Math.max(0, businessIncome) + Math.max(0, freelanceNet) + (Number((currentIncome as any).investmentIncome?.replace(/,/g, '')) || 0) + (Number((currentIncome as any).rentalIncome?.replace(/,/g, '')) || 0) + (Number((currentIncome as any).digitalGains?.replace(/,/g, '')) || 0);
    const totalDeductions = ((v: any) => (Number((v as any).rent?.replace(/,/g, '')) || 0) + (Number((v as any).healthInsurance?.replace(/,/g, '')) || 0) + (Number((v as any).pension?.replace(/,/g, '')) || 0) + (Number((v as any).mortgageInterest?.replace(/,/g, '')) || 0))(currentDeductions);
    const _monthlyTaxable = Math.max(0, totalMonthlyIncome - totalDeductions);

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

    const handleFilePITReturn = () => {
        setAnnualReturnFiledPIT(true);
        setShowFilingSheetPIT(false);
        try { localStorage.setItem(`taxable_pit_filed_${profileId}`, 'true'); } catch {}
        toast.success('Annual return filed successfully!');
    };

    const monthlyBreakdown = periodMode === 'monthly' ? INCOME_MONTH_NAMES.map((_, idx) => {
        const inc = incomeByMonth[idx] ?? {};
        const ded = deductionsByMonth[idx] ?? {};
        const bi = (Number((inc as any).businessRevenue?.replace(/,/g, '')) || 0) - (Number((inc as any).businessExpenses?.replace(/,/g, '')) || 0);
        const fn = (Number((inc as any).freelanceInvoiced?.replace(/,/g, '')) || 0) - (Number((inc as any).freelanceWHT?.replace(/,/g, '')) || 0);
        const mi = (Number((inc as any).salaryTakeHome?.replace(/,/g, '')) || 0) + Math.max(0, bi) + Math.max(0, fn) + (Number((inc as any).investmentIncome?.replace(/,/g, '')) || 0) + (Number((inc as any).rentalIncome?.replace(/,/g, '')) || 0) + (Number((inc as any).digitalGains?.replace(/,/g, '')) || 0);
        const md = (Number((ded as any).rent?.replace(/,/g, '')) || 0) + (Number((ded as any).healthInsurance?.replace(/,/g, '')) || 0) + (Number((ded as any).pension?.replace(/,/g, '')) || 0) + (Number((ded as any).mortgageInterest?.replace(/,/g, '')) || 0);
        return { month: INCOME_MONTH_NAMES[idx], income: mi, deductions: md, taxable: Math.max(0, mi - md) };
    }) : [];

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
                            if (v === 'annually' && hasRecordedData) return;
                            if (v !== periodMode && v === 'annually' && monthCount > 1) {
                                setPendingPeriodMode(v as 'monthly' | 'annually');
                                setConfirmFilingPrefOpen(true);
                            } else {
                                setPeriodMode(v as 'monthly' | 'annually');
                            }
                        }}>
                            <TabsList className="h-9 bg-neutral-50 rounded-lg p-0.5">
                                <TabsTrigger value="monthly" className="text-2 px-3 py-1 rounded-md !text-neutral-300 font-medium data-active:!bg-neutral-800 data-active:!text-white">Monthly</TabsTrigger>
                                <TabsTrigger value="annually" className="text-2 px-3 py-1 rounded-md !text-neutral-300 font-medium data-active:!bg-neutral-800 data-active:!text-white" disabled={hasRecordedData}>Annual</TabsTrigger>
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
                                             <Input type="text" placeholder="₦ 0.00" value={periodMode === 'annually' ? fieldSumFmt('salaryTakeHome') : (currentIncome as any).salaryTakeHome ?? ''} onChange={fmtInput((v) => setIncomeField('salaryTakeHome', v))} disabled={periodMode === 'annually' && hasRecordedData} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                    </div>
                                    <div className="mt-3">
                                        <div className="bg-white flex items-center justify-between gap-4 p-3 border border-dashed border-neutral-200 rounded-xl">
                                            <span className="text-1 text-neutral-400 font-medium">Upload payslip / proof of employment</span>
                                            <button onClick={() => salaryRef.current?.click()} className="cursor-pointer text-2 font-semibold text-neutral-800 bg-transparent border-none p-0">Upload</button>
                                            <input ref={salaryRef} type="file" hidden accept=".pdf,.jpg,.png" onChange={(e) => { const f = e.target.files; if (!f) return; setIncomeFiles(prev => ({ ...prev, ['salary_' + (activeMonthNum - 1)]: [...(prev['salary_' + (activeMonthNum - 1)] ?? []), ...Array.from(f).map(x => ({ name: x.name }))] })); e.target.value = ''; }} />
                                        </div>
                                        {((incomeFiles['salary_' + (activeMonthNum - 1)] ?? [])).map((file, i) => (
                                            <div key={i} className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-neutral-100 rounded-lg">
                                                <span className="text-1 text-neutral-600">{file.name}</span>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-neutral-400 cursor-pointer ml-1" onClick={() => setIncomeFiles(prev => ({ ...prev, ['salary_' + (activeMonthNum - 1)]: (prev['salary_' + (activeMonthNum - 1)] ?? []).filter((_, j) => j !== i) }))}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(currentProfile?.primaryIncomeSources ?? []).includes('Business/Self-employment') && (
                                <div className="bg-neutral-50 rounded-3xl p-5">
                                    <h3 className="text-3 font-semibold text-neutral-800 mb-4">Business Income</h3>
                                    <div className="space-y-3">
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="Total monthly revenue from your business or self-employment activities.">{periodMode === 'annually' ? 'Annual' : 'Monthly'} Gross Revenue</FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={periodMode === 'annually' ? fieldSumFmt('businessRevenue') : (currentIncome as any).businessRevenue ?? ''} onChange={fmtInput((v) => setIncomeField('businessRevenue', v))} disabled={periodMode === 'annually' && hasRecordedData} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="Total monthly expenses incurred in running your business.">{periodMode === 'annually' ? 'Annual' : 'Monthly'} Business Expenses</FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={periodMode === 'annually' ? fieldSumFmt('businessExpenses') : (currentIncome as any).businessExpenses ?? ''} onChange={fmtInput((v) => setIncomeField('businessExpenses', v))} disabled={periodMode === 'annually' && hasRecordedData} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                    </div>
                                    <div className="mt-3">
                                        <div className="bg-white flex items-center justify-between gap-4 p-3 border border-dashed border-neutral-200 rounded-xl">
                                            <span className="text-1 text-neutral-400 font-medium">Upload invoices / bank statements</span>
                                            <button onClick={() => businessRef.current?.click()} className="cursor-pointer text-2 font-semibold text-neutral-800 bg-transparent border-none p-0">Upload</button>
                                            <input ref={businessRef} type="file" hidden accept=".pdf,.jpg,.png" onChange={(e) => { const f = e.target.files; if (!f) return; setIncomeFiles(prev => ({ ...prev, ['business_' + (activeMonthNum - 1)]: [...(prev['business_' + (activeMonthNum - 1)] ?? []), ...Array.from(f).map(x => ({ name: x.name }))] })); e.target.value = ''; }} />
                                        </div>
                                        {((incomeFiles['business_' + (activeMonthNum - 1)] ?? [])).map((file, i) => (
                                            <div key={i} className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-neutral-100 rounded-lg">
                                                <span className="text-1 text-neutral-600">{file.name}</span>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-neutral-400 cursor-pointer ml-1" onClick={() => setIncomeFiles(prev => ({ ...prev, ['business_' + (activeMonthNum - 1)]: (prev['business_' + (activeMonthNum - 1)] ?? []).filter((_, j) => j !== i) }))}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(currentProfile?.primaryIncomeSources ?? []).includes('Freelance/Consulting') && (
                                <div className="bg-neutral-50 rounded-3xl p-5">
                                    <h3 className="text-3 font-semibold text-neutral-800 mb-4">Freelance / Consulting</h3>
                                    <div className="space-y-3">
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="Total value of invoices that were paid by your clients this month.">Total Project Invoices Paid</FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={periodMode === 'annually' ? fieldSumFmt('freelanceInvoiced') : (currentIncome as any).freelanceInvoiced ?? ''} onChange={fmtInput((v) => setIncomeField('freelanceInvoiced', v))} disabled={periodMode === 'annually' && hasRecordedData} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="Enter any tax amount your clients held back from your payment (usually 5%). We track this as a direct credit to lower your final PIT bill.">Less: WHT Deducted at Source</FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={periodMode === 'annually' ? fieldSumFmt('freelanceWHT') : (currentIncome as any).freelanceWHT ?? ''} onChange={fmtInput((v) => setIncomeField('freelanceWHT', v))} disabled={periodMode === 'annually' && hasRecordedData} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                    </div>
                                    <div className="mt-3">
                                        <div className="bg-white flex items-center justify-between gap-4 p-3 border border-dashed border-neutral-200 rounded-xl">
                                            <span className="text-1 text-neutral-400 font-medium">Upload invoices / contracts</span>
                                            <button onClick={() => freelanceRef.current?.click()} className="cursor-pointer text-2 font-semibold text-neutral-800 bg-transparent border-none p-0">Upload</button>
                                            <input ref={freelanceRef} type="file" hidden accept=".pdf,.jpg,.png" onChange={(e) => { const f = e.target.files; if (!f) return; setIncomeFiles(prev => ({ ...prev, ['freelance_' + (activeMonthNum - 1)]: [...(prev['freelance_' + (activeMonthNum - 1)] ?? []), ...Array.from(f).map(x => ({ name: x.name }))] })); e.target.value = ''; }} />
                                        </div>
                                        {((incomeFiles['freelance_' + (activeMonthNum - 1)] ?? [])).map((file, i) => (
                                            <div key={i} className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-neutral-100 rounded-lg">
                                                <span className="text-1 text-neutral-600">{file.name}</span>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-neutral-400 cursor-pointer ml-1" onClick={() => setIncomeFiles(prev => ({ ...prev, ['freelance_' + (activeMonthNum - 1)]: (prev['freelance_' + (activeMonthNum - 1)] ?? []).filter((_, j) => j !== i) }))}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(currentProfile?.primaryIncomeSources ?? []).includes('Investment income') && (
                                <div className="bg-neutral-50 rounded-3xl p-5">
                                    <div className="space-y-3">
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="Dividends and interest earned on your investments this month.">Dividends / Interest Received</FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={periodMode === 'annually' ? fieldSumFmt('investmentIncome') : (currentIncome as any).investmentIncome ?? ''} onChange={fmtInput((v) => setIncomeField('investmentIncome', v))} disabled={periodMode === 'annually' && hasRecordedData} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                    </div>
                                    <div className="mt-3">
                                        <div className="bg-white flex items-center justify-between gap-4 p-3 border border-dashed border-neutral-200 rounded-xl">
                                            <span className="text-1 text-neutral-400 font-medium">Upload investment statements</span>
                                            <button onClick={() => investmentRef.current?.click()} className="cursor-pointer text-2 font-semibold text-neutral-800 bg-transparent border-none p-0">Upload</button>
                                            <input ref={investmentRef} type="file" hidden accept=".pdf,.jpg,.png" onChange={(e) => { const f = e.target.files; if (!f) return; setIncomeFiles(prev => ({ ...prev, ['investment_' + (activeMonthNum - 1)]: [...(prev['investment_' + (activeMonthNum - 1)] ?? []), ...Array.from(f).map(x => ({ name: x.name }))] })); e.target.value = ''; }} />
                                        </div>
                                        {((incomeFiles['investment_' + (activeMonthNum - 1)] ?? [])).map((file, i) => (
                                            <div key={i} className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-neutral-100 rounded-lg">
                                                <span className="text-1 text-neutral-600">{file.name}</span>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-neutral-400 cursor-pointer ml-1" onClick={() => setIncomeFiles(prev => ({ ...prev, ['investment_' + (activeMonthNum - 1)]: (prev['investment_' + (activeMonthNum - 1)] ?? []).filter((_, j) => j !== i) }))}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(currentProfile?.primaryIncomeSources ?? []).includes('Rental income') && (
                                <div className="bg-neutral-50 rounded-3xl p-5">
                                    <div className="space-y-3">
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="Total rent payments collected from your tenants this month.">Gross Rent Payments Collected</FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={periodMode === 'annually' ? fieldSumFmt('rentalIncome') : (currentIncome as any).rentalIncome ?? ''} onChange={fmtInput((v) => setIncomeField('rentalIncome', v))} disabled={periodMode === 'annually' && hasRecordedData} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                    </div>
                                    <div className="mt-3">
                                        <div className="bg-white flex items-center justify-between gap-4 p-3 border border-dashed border-neutral-200 rounded-xl">
                                            <span className="text-1 text-neutral-400 font-medium">Upload lease agreement / receipts</span>
                                            <button onClick={() => rentalRef.current?.click()} className="cursor-pointer text-2 font-semibold text-neutral-800 bg-transparent border-none p-0">Upload</button>
                                            <input ref={rentalRef} type="file" hidden accept=".pdf,.jpg,.png" onChange={(e) => { const f = e.target.files; if (!f) return; setIncomeFiles(prev => ({ ...prev, ['rental_' + (activeMonthNum - 1)]: [...(prev['rental_' + (activeMonthNum - 1)] ?? []), ...Array.from(f).map(x => ({ name: x.name }))] })); e.target.value = ''; }} />
                                        </div>
                                        {((incomeFiles['rental_' + (activeMonthNum - 1)] ?? [])).map((file, i) => (
                                            <div key={i} className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-neutral-100 rounded-lg">
                                                <span className="text-1 text-neutral-600">{file.name}</span>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-neutral-400 cursor-pointer ml-1" onClick={() => setIncomeFiles(prev => ({ ...prev, ['rental_' + (activeMonthNum - 1)]: (prev['rental_' + (activeMonthNum - 1)] ?? []).filter((_, j) => j !== i) }))}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(currentProfile?.primaryIncomeSources ?? []).includes('Digital Assets/Crypto') && (
                                <div className="bg-neutral-50 rounded-3xl p-5">
                                    <div className="space-y-3">
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="Total realized profits from asset sales or trading inside the month.">Net Crypto / Digital Asset Gains</FormLabel>
                                                <Input type="text" placeholder="₦ 0.00" value={periodMode === 'annually' ? fieldSumFmt('digitalGains') : (currentIncome as any).digitalGains ?? ''} onChange={fmtInput((v) => setIncomeField('digitalGains', v))} disabled={periodMode === 'annually' && hasRecordedData} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                    </div>
                                    <div className="mt-3">
                                        <div className="bg-white flex items-center justify-between gap-4 p-3 border border-dashed border-neutral-200 rounded-xl">
                                            <span className="text-1 text-neutral-400 font-medium">Upload exchange / trading statements</span>
                                            <button onClick={() => cryptoRef.current?.click()} className="cursor-pointer text-2 font-semibold text-neutral-800 bg-transparent border-none p-0">Upload</button>
                                            <input ref={cryptoRef} type="file" hidden accept=".pdf,.jpg,.png" onChange={(e) => { const f = e.target.files; if (!f) return; setIncomeFiles(prev => ({ ...prev, ['crypto_' + (activeMonthNum - 1)]: [...(prev['crypto_' + (activeMonthNum - 1)] ?? []), ...Array.from(f).map(x => ({ name: x.name }))] })); e.target.value = ''; }} />
                                        </div>
                                        {((incomeFiles['crypto_' + (activeMonthNum - 1)] ?? [])).map((file, i) => (
                                            <div key={i} className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-neutral-100 rounded-lg">
                                                <span className="text-1 text-neutral-600">{file.name}</span>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-neutral-400 cursor-pointer ml-1" onClick={() => setIncomeFiles(prev => ({ ...prev, ['crypto_' + (activeMonthNum - 1)]: (prev['crypto_' + (activeMonthNum - 1)] ?? []).filter((_, j) => j !== i) }))}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </div>
                                        ))}
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
                                            <Input type="text" placeholder="₦ 0.00" value={periodMode === 'annually' ? dedFieldSumFmt('rent') : (currentDeductions as any).rent ?? ''} onChange={fmtInput((v) => setDeductionField('rent', v))} disabled={periodMode === 'annually' && hasRecordedData} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                    </div>
                                    <div className="mt-3">
                                        <div className="bg-white flex items-center justify-between gap-4 p-3 border border-dashed border-neutral-200 rounded-xl">
                                            <span className="text-1 text-neutral-400 font-medium">Upload rent receipt / lease agreement</span>
                                            <button onClick={() => rentRef.current?.click()} className="cursor-pointer text-2 font-semibold text-neutral-800 bg-transparent border-none p-0">Upload</button>
                                            <input ref={rentRef} type="file" hidden accept=".pdf,.jpg,.png" onChange={(e) => { const f = e.target.files; if (!f) return; setDeductionFiles(prev => ({ ...prev, ['rent_' + (activeMonthNum - 1)]: [...(prev['rent_' + (activeMonthNum - 1)] ?? []), ...Array.from(f).map(x => ({ name: x.name }))] })); e.target.value = ''; }} />
                                        </div>
                                        {((deductionFiles['rent_' + (activeMonthNum - 1)] ?? [])).map((file, i) => (
                                            <div key={i} className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-neutral-100 rounded-lg">
                                                <span className="text-1 text-neutral-600">{file.name}</span>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-neutral-400 cursor-pointer ml-1" onClick={() => setDeductionFiles(prev => ({ ...prev, ['rent_' + (activeMonthNum - 1)]: (prev['rent_' + (activeMonthNum - 1)] ?? []).filter((_, j) => j !== i) }))}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentProfile?.hasHealthInsurance && (
                                <div className="bg-neutral-50 rounded-3xl p-5">
                                    <div className="space-y-3">
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="The exact medical insurance premium amount you paid out of pocket this month.">{periodMode === 'annually' ? 'Annual' : 'Monthly'} HMO / Health Insurance Premium</FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={periodMode === 'annually' ? dedFieldSumFmt('healthInsurance') : (currentDeductions as any).healthInsurance ?? ''} onChange={fmtInput((v) => setDeductionField('healthInsurance', v))} disabled={periodMode === 'annually' && hasRecordedData} className="w-[180px] text-left" />
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
                                            <Input type="text" placeholder="₦ 0.00" value={periodMode === 'annually' ? dedFieldSumFmt('pension') : (currentDeductions as any).pension ?? ''} onChange={fmtInput((v) => setDeductionField('pension', v))} disabled={periodMode === 'annually' && hasRecordedData} className="w-[180px] text-left" />
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
                                            <Input type="text" placeholder="₦ 0.00" value={periodMode === 'annually' ? dedFieldSumFmt('mortgageInterest') : (currentDeductions as any).mortgageInterest ?? ''} onChange={fmtInput((v) => setDeductionField('mortgageInterest', v))} disabled={periodMode === 'annually' && hasRecordedData} className="w-[180px] text-left" />
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
                                 <p className="text-1 text-neutral-400 font-medium">{periodMode === 'annually' ? '' : Object.keys(incomeByMonth).length + ' of 12 months tracked'}</p>
                            </div>
                        )}
                    </div>
                </div>
                </div>
            </div>
        );
    };


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
            if (saved.incomeFiles) setIncomeFiles(saved.incomeFiles);
            if (saved.recordedMonths) setRecordedMonths(new Set(saved.recordedMonths));
        } catch { /* ignore */ }
    }, []);

    // Auto-save income data to localStorage
    useEffect(() => {
        if (!profileId) return;
        try {
            localStorage.setItem(STORAGE_KEY_PIT_INCOME, JSON.stringify({
                incomeByMonth, deductionsByMonth, deductionFiles, incomeFiles,
                recordedMonths: Array.from(recordedMonths),
            }));
        } catch { /* ignore */ }
    }, [incomeByMonth, deductionsByMonth, deductionFiles, incomeFiles, recordedMonths, STORAGE_KEY_PIT_INCOME]);

    // Auto-save personal info to localStorage
    useEffect(() => {
        if (!profileId) return;
        try { localStorage.setItem(`taxable_pit_personal_${profileId}`, JSON.stringify(personalInfo)); } catch {}
    }, [personalInfo, profileId]);

    // Persist annual return filed status
    useEffect(() => {
        try { localStorage.setItem(`taxable_pit_filed_${profileId}`, String(annualReturnFiledPIT)); } catch {}
    }, [annualReturnFiledPIT, profileId]);

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
                    <h3 className="text-5 font-semibold text-neutral-800 mb-2">{error || 'Profile not found'}</h3>
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
                            annualReturnFiledPIT ? (
                                <div className="w-full max-w-[500px] mx-auto text-center py-12" data-animate>
                                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <h2 className="text-6 font-semibold text-neutral-800 mb-2">Annual Return Filed</h2>
                                    <p className="text-2 text-neutral-500 font-medium mb-6">Your annual PIT return has been successfully submitted.</p>
                                    <SecondaryButton onClick={() => setActiveSection('income-deductions')}>Back</SecondaryButton>
                                </div>
                            ) : (
                            <div className="w-full max-w-[800px] mx-auto" data-animate>

                                {/* Section 1: Summary Cards */}
                                <div className="mb-14">
                                    <h2 className="text-5 font-semibold text-neutral-800 tracking-[-0.02em] mb-6">Annual Filing Summary</h2>
                                    <div className="flex gap-4">
                                        <div className="flex-1 bg-white border border-neutral-100 rounded-2xl p-4 text-left">
                                            <p className="text-1 text-neutral-500 font-medium">Gross Income</p>
                                            <p className="text-4 font-semibold text-neutral-800 mt-1">{fmt(ytdGrossIncome)}</p>
                                        </div>
                                        <div className="flex-1 bg-white border border-neutral-100 rounded-2xl p-4 text-left">
                                            <p className="text-1 text-neutral-500 font-medium">Total Deductions</p>
                                            <p className="text-4 font-semibold text-neutral-800 mt-1">-{fmt(ytdDeductions)}</p>
                                        </div>
                                        <div className="flex-1 bg-white border border-neutral-100 rounded-2xl p-4 text-left">
                                            <p className="text-1 text-neutral-500 font-medium">Taxable Income</p>
                                            <p className="text-4 font-semibold text-neutral-800 mt-1">{fmt(annualTaxable)}</p>
                                        </div>
                                        <div className="flex-1 bg-white border border-neutral-100 rounded-2xl p-4 text-left">
                                            <p className="text-1 text-neutral-500 font-medium">Estimated PIT</p>
                                            <p className="text-4 font-semibold text-neutral-800 mt-1">{fmt(estimatedAnnualTax)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Accordion */}
                                <div className="mb-14">
                                     <Accordion defaultValue={[]} className="space-y-1">
                                        <AccordionItem value="summary" className="bg-neutral-50 border border-neutral-100 rounded-2xl">
                                            <AccordionTrigger className="px-4 py-3 text-2 font-semibold text-neutral-800">
                                                Tax Calculation Breakdown
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 pb-4">
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between text-2"><span className="text-neutral-500">Gross Income</span><span className="font-medium text-neutral-800">{fmt(ytdGrossIncome)}</span></div>
                                                    <div className="flex items-center justify-between text-2"><span className="text-neutral-500">Total Deductions</span><span className="font-medium text-neutral-800">-{fmt(ytdDeductions)}</span></div>
                                                    <div className="flex items-center justify-between text-2 pt-2 border-t border-neutral-100"><span className="font-semibold text-neutral-800">Taxable Income</span><span className="font-semibold text-neutral-800">{fmt(annualTaxable)}</span></div>

                                                    <div className="border-t border-neutral-100 pt-3 mt-3">
                                                        <h4 className="text-2 font-semibold text-neutral-700 mb-3">PAYE Bands Applied</h4>
                                                        {(() => {
                                                            let remaining = annualTaxable;
                                                            const bandLabels = [
                                                                { limit: 800000, rate: 0, label: 'First ₦800,000' },
                                                                { limit: 2200000, rate: 0.15, label: 'Next ₦2,200,000' },
                                                                { limit: 9000000, rate: 0.18, label: 'Next ₦9,000,000' },
                                                                { limit: 13000000, rate: 0.21, label: 'Next ₦13,000,000' },
                                                                { limit: 25000000, rate: 0.23, label: 'Next ₦25,000,000' },
                                                                { limit: Infinity, rate: 0.25, label: 'Above ₦50,000,000' },
                                                            ];
                                                            return bandLabels.map((band, i) => {
                                                                const chunk = Math.min(Math.max(0, remaining), band.limit);
                                                                remaining -= chunk;
                                                                if (chunk <= 0) return null;
                                                                return (
                                                                     <div key={i} className="flex items-center justify-between text-2 py-2">
                                                                         <span className="text-neutral-500">{band.label} ({Math.round(band.rate * 100)}%)</span>
                                                                         <span className="font-medium text-neutral-500">{fmt(Math.round(chunk * band.rate))}</span>
                                                                    </div>
                                                                );
                                                            });
                                                        })()}
                                                        <div className="flex items-center justify-between text-2 pt-2 border-t border-neutral-100 mt-2">
                                                            <span className="font-semibold text-neutral-800">Estimated PIT</span>
                                                            <span className="font-semibold text-neutral-800">{fmt(estimatedAnnualTax)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>

                                        {periodMode === 'monthly' && (
                                        <AccordionItem value="monthly" className="bg-neutral-50 border border-neutral-100 rounded-2xl">
                                            <AccordionTrigger className="px-4 py-3 text-2 font-semibold text-neutral-800">
                                                Monthly Breakdown
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 pb-4">
                                                <div className="bg-white border border-neutral-50 rounded-2xl overflow-hidden">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow className="bg-neutral-50">
                                                                <TableHead className="px-6 py-4 font-medium text-neutral-400">Month</TableHead>
                                                                <TableHead className="px-6 py-4 font-medium text-neutral-400">Gross Income</TableHead>
                                                                <TableHead className="px-6 py-4 font-medium text-neutral-400">Deductions</TableHead>
                                                                <TableHead className="px-6 py-4 font-medium text-neutral-400">Taxable Income</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {monthlyBreakdown.filter(m => m.income > 0).map(m => (
                                                                <TableRow key={m.month} className="cursor-pointer">
                                                                    <TableCell className="px-6 py-4 font-medium text-neutral-600">{m.month}</TableCell>
                                                                    <TableCell className="px-6 py-4 font-medium text-neutral-600">{fmt(m.income)}</TableCell>
                                                                    <TableCell className="px-6 py-4 font-medium text-neutral-600">{fmt(m.deductions)}</TableCell>
                                                                    <TableCell className="px-6 py-4 font-medium text-neutral-600">{fmt(m.taxable)}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                        )}
                                    </Accordion>
                                </div>

                                {/* Section 3: Legal Declaration + CTA */}
                                <div className="space-y-3 mb-8">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <Checkbox checked={legalConfirmPIT1} onCheckedChange={(c) => setLegalConfirmPIT1(c === true)} className="mt-0.5" />
                                        <span className="text-2 text-neutral-600 font-medium leading-relaxed">I confirm that the income and deductions I've entered are accurate.</span>
                                    </label>
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <Checkbox checked={legalConfirmPIT2} onCheckedChange={(c) => setLegalConfirmPIT2(c === true)} className="mt-0.5" />
                                        <span className="text-2 text-neutral-600 font-medium leading-relaxed">I authorize Taxable to act as my designated tax agent to finalize this submission.</span>
                                    </label>
                                </div>

                                <div className="mb-8">
                                    <PrimaryButton onClick={() => setShowFilingSheetPIT(true)} disabled={!legalConfirmPIT1 || !legalConfirmPIT2}>
                                        {estimatedAnnualTax > 0 ? `Pay & File PIT` : 'File PIT Return'}
                                    </PrimaryButton>
                                </div>

                                <FilingSheet open={showFilingSheetPIT} onClose={() => setShowFilingSheetPIT(false)} onFile={handleFilePITReturn} />
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <PITModals
                confirmFilingPrefOpen={confirmFilingPrefOpen}
                setConfirmFilingPrefOpen={setConfirmFilingPrefOpen}
                pendingPeriodMode={pendingPeriodMode as any}
                setPendingPeriodMode={setPendingPeriodMode}
                switchingFilingPref={switchingFilingPref}
                onConfirmFilingPref={() => {
                    if (!pendingPeriodMode) return;
                    setPeriodMode(pendingPeriodMode);
                    setActiveMonth('January');
                    _setExpandedMonth(pendingPeriodMode === 'monthly' ? 'January' : null);
                    if (currentProfile) setCurrentProfile({ ...currentProfile, filingPreference: pendingPeriodMode === 'annually' ? 'annual' : 'monthly' });
                    toast.success(`Switched to ${pendingPeriodMode === 'monthly' ? 'Monthly' : 'Annual'} view.`);
                    setConfirmFilingPrefOpen(false);
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
