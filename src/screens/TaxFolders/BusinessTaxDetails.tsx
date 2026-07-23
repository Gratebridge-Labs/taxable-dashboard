'use client';
import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, startTransition } from 'react';
import gsap from 'gsap';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PayeMonthlyFiling, calculateAnnualPAYE } from '@/screens/TaxFolders/BusinessPAYEContent';
import { PayeStaff } from '@/screens/TaxFolders/AddEmployeeDrawer';
import { Calendar } from '@/components/ui/calendar';
import { Spinner } from '@/components/ui/spinner';
import { BusinessVATContent } from './BusinessVAT';
import { BusinessWHTContent } from './BusinessWHT';
import { FilingSheet } from '@/screens/TaxFolders/TaxFolderShared';
import { PrimaryButton, SecondaryButton, SidebarItem } from '@/screens/TaxFolders/TaxFolderShared';
import { BusinessCITContent } from './BusinessCIT';
import { Home2Fill } from '@mingcute/react';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { toast } from 'sonner';
import { useTaxableApi } from '@/hooks/useTaxableApi';
import type { BusinessCompanyInfoRequest } from '@/types/api';
import { NIGERIA_STATES, getCitiesForState, getLgasForState } from '@/lib/nigeria-locations';
import {
    mapApiEmployeeToPayeStaff,
    mapPayeStaffToCreateRequest,
    mapPayeStaffToUpdateRequest,
    validatePayeStaffForApi,
} from '@/lib/paye-mappers';

const INDUSTRIES = [
    'Agriculture', 'Construction', 'Education', 'Energy & Utilities',
    'Financial Services', 'Healthcare', 'Hospitality & Tourism',
    'Information Technology', 'Legal Services', 'Logistics & Transportation',
    'Manufacturing', 'Media & Entertainment', 'Mining', 'NGO / Non-profit',
    'Real Estate', 'Retail & Commerce', 'Telecommunications', 'Other',
];

// Sidebar sections for Business
const BUSINESS_SECTIONS = [
    { key: 'company-info', label: 'Company Information', locked: false, route: null },
    { key: 'paye', label: 'PAYE (Payroll Tax)', locked: false, route: null },
    { key: 'vat', label: 'VAT (Sales Tax)', locked: false, route: null },
    { key: 'wht', label: 'WHT (Deductions)', locked: false, route: null },
    { key: 'company-income-tax', label: 'Company Income Tax', locked: false, route: null },
];

// ── Welcome Modal ─────────────────────────────────────────────────────────────
const WelcomeModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl w-full max-w-[380px] p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            {/* Icon */}
            <div className="w-12 h-12 rounded-full border-2 border-neutral-200 flex items-center justify-center mb-5">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-taxable-dark">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
            <h2 className="text-6 font-semibold text-neutral-800 mb-3">Welcome to your tax workspace!</h2>
            <p className="text-2 text-neutral-500 font-medium leading-relaxed mb-1.5">
                Everything you need is organized in sections on the left. Start with{' '}
                <span className="text-neutral-800 font-semibold">Company Information</span>{' '}
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

// ── Main component ────────────────────────────────────────────────────────────
export default function BusinessTaxDetails() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const profileId = searchParams.get('profileId') || 'default';
    const taxYear = searchParams.get('year') || '2026';
    const STORAGE_KEY = `taxable_business_info_${profileId}`;
    const {
        getBusinessCompanyInfo,
        updateBusinessCompanyInfo,
        listPayeEmployees,
        createPayeEmployee,
        updatePayeEmployee,
        deletePayeEmployee,
    } = useTaxableApi();

    // SessionStorage persistence — restore on client mount to avoid hydration mismatch
    const [showWelcomeModal, setShowWelcomeModal] = React.useState(false);
    const [activeSection, setActiveSection] = React.useState('company-info');
    const [submitting, setSubmitting] = React.useState(false);
    const [companyInfoSaved, setCompanyInfoSaved] = React.useState(false);
    // Hold form until company-info fetch (or local fallback) finishes — prevents late field pop-in
    const [companyInfoReady, setCompanyInfoReady] = React.useState(false);
    const hasUnsavedChanges = React.useRef(false);
    const [showUnsavedModal, setShowUnsavedModal] = React.useState(false);
    const [pendingNav, setPendingNav] = React.useState<string | null>(null);
    const [pendingCITSub, setPendingCITSub] = React.useState<'quarterly' | null>(null);

    // Company Info fields
    const [rcbn, setRcbn] = React.useState('');
    const [companyName, setCompanyName] = React.useState('');
    const [industry, setIndustry] = React.useState('');
    const [address, setAddress] = React.useState('');
    const [city, setCity] = React.useState('');
    const [state, setState] = React.useState('');
    const [lga, setLga] = React.useState('');
    const [payQuarterly, setPayQuarterly] = React.useState(false);
    const [estimatedAnnualRevenue, setEstimatedAnnualRevenue] = React.useState('');
    const [profitMargin, setProfitMargin] = React.useState('20%');

    const rev = Number((estimatedAnnualRevenue || '').replace(/,/g, '')) || 0;
    const margin = profitMargin ? Number(profitMargin.replace('%', '')) / 100 : 0;
    const estimatedProfit = rev * margin;
    const totalCIT = estimatedProfit * (rev > 0 && rev <= 25_000_000 ? 0.20 : 0.30);
    const perQuarter = totalCIT / 4;
    const qFmt = (n: number) => `₦${Math.round(n).toLocaleString()}`;

    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [incorporationDateObj, setIncorporationDateObj] = useState<Date | undefined>(undefined);

    const companyInfoComplete = Boolean(
        rcbn && companyName && industry && incorporationDateObj && address && city && state && lga
    );

    // PAYE inline state
    const [payeSubSection] = React.useState<'monthly-filing' | 'annual-returns'>('monthly-filing');
    const [citSubSection, setCitSubSection] = React.useState<'quarterly' | 'file-returns'>('quarterly');

    const [activeMonth, setActiveMonth] = React.useState('January');
    const [filedMonths, setFiledMonths] = React.useState<Set<string>>(new Set());
    const [showPayeFilingModal, setShowPayeFilingModal] = React.useState(false);
    const [payeStaffByMonth, setPayeStaffByMonth] = React.useState<Record<string, PayeStaff[]>>({});
    const [payeLoading, setPayeLoading] = React.useState(false);
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const yearNum = parseInt(taxYear, 10) || new Date().getFullYear();
    const activeMonthNumber = MONTHS.indexOf(activeMonth) + 1;

    // Determine sourceMonth (most recent previous month with data)
    const getSourceMonth = (currentMonth: string): string | null => {
        const currentIndex = MONTHS.indexOf(currentMonth);
        for (let i = currentIndex - 1; i >= 0; i--) {
            const month = MONTHS[i];
            if ((payeStaffByMonth[month] || []).length > 0) {
                return month;
            }
        }
        return null;
    };

    const taxIdParam = searchParams.get('taxId');

    // Clear only `new=workspace` — never strip profileId / year / taxId from the URL
    useEffect(() => {
        const isNew = searchParams.get('new');
        if (isNew !== 'workspace') return;

        startTransition(() => {
            setShowWelcomeModal(true);
        });

        const params = new URLSearchParams(searchParams.toString());
        params.delete('new');
        const qs = params.toString();
        router.replace(qs ? `/tax-folders/business?${qs}` : '/tax-folders/business');
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only when welcome flag is present
    }, [searchParams.get('new')]);

    // Load company info once before showing inputs (server → taxId → localStorage)
    useEffect(() => {
        let cancelled = false;
        setCompanyInfoReady(false);

        // Reset fields so a previous profile's data never flashes into the form
        setRcbn('');
        setCompanyName('');
        setIndustry('');
        setIncorporationDateObj(undefined);
        setAddress('');
        setCity('');
        setState('');
        setLga('');
        setPayQuarterly(false);
        setEstimatedAnnualRevenue('');
        setProfitMargin('20%');
        setCompanyInfoSaved(false);
        hasUnsavedChanges.current = false;

        const storageKey = `taxable_business_info_${profileId}`;

        const applyLocalFallback = () => {
            try {
                const raw = localStorage.getItem(storageKey);
                if (raw) {
                    const saved = JSON.parse(raw);
                    if (saved.rcbn) setRcbn(saved.rcbn);
                    if (saved.companyName) setCompanyName(saved.companyName);
                    if (saved.industry) setIndustry(saved.industry);
                    if (saved.incorporationDateObj) setIncorporationDateObj(new Date(saved.incorporationDateObj));
                    if (saved.lga) setLga(saved.lga);
                    if (saved.address) setAddress(saved.address);
                    if (saved.city) setCity(saved.city);
                    if (saved.state) setState(saved.state);
                    if (typeof saved.payQuarterly === 'boolean') setPayQuarterly(saved.payQuarterly);
                    if (saved.estimatedAnnualRevenue) setEstimatedAnnualRevenue(saved.estimatedAnnualRevenue);
                    if (saved.profitMargin) setProfitMargin(saved.profitMargin);
                    if (saved.companyName) setCompanyInfoSaved(true);
                } else if (taxIdParam) {
                    setRcbn(taxIdParam);
                }
            } catch {
                if (taxIdParam) setRcbn(taxIdParam);
            }
        };

        (async () => {
            if (!profileId || profileId === 'default') {
                applyLocalFallback();
                if (!cancelled) setCompanyInfoReady(true);
                return;
            }

            try {
                const res = await getBusinessCompanyInfo(profileId);
                if (cancelled) return;

                if (res?.success && res.data) {
                    const { companyInfo, citEstimate } = res.data;
                    const fmtAmount = (n: number) =>
                        Number.isFinite(n) ? Math.round(n).toLocaleString('en-US') : '';
                    const hasServerInfo = Boolean(companyInfo?.companyName || companyInfo?.RCNumber);

                    if (hasServerInfo) {
                        if (companyInfo?.RCNumber) setRcbn(companyInfo.RCNumber);
                        else if (taxIdParam) setRcbn(taxIdParam);
                        if (companyInfo?.companyName) setCompanyName(companyInfo.companyName);
                        if (companyInfo?.industrySector) setIndustry(companyInfo.industrySector);
                        if (companyInfo?.dateOfIncorporation) {
                            setIncorporationDateObj(new Date(companyInfo.dateOfIncorporation));
                        }
                        if (companyInfo?.businessAddress?.street) setAddress(companyInfo.businessAddress.street);
                        if (companyInfo?.businessAddress?.city) setCity(companyInfo.businessAddress.city);
                        if (companyInfo?.businessAddress?.state) setState(companyInfo.businessAddress.state);
                        if (companyInfo?.businessAddress?.lga) setLga(companyInfo.businessAddress.lga);

                        if (citEstimate) {
                            if (typeof citEstimate.payCitQuarterly === 'boolean') {
                                setPayQuarterly(citEstimate.payCitQuarterly);
                            }
                            if (typeof citEstimate.estimatedGrossRevenue === 'number') {
                                setEstimatedAnnualRevenue(fmtAmount(citEstimate.estimatedGrossRevenue));
                            }
                            if (typeof citEstimate.estimatedProfitMargin === 'number') {
                                setProfitMargin(`${citEstimate.estimatedProfitMargin}%`);
                            }
                        }

                        if (companyInfo?.companyName) setCompanyInfoSaved(true);
                        hasUnsavedChanges.current = false;
                    } else {
                        applyLocalFallback();
                    }
                } else {
                    applyLocalFallback();
                }
            } catch (err: unknown) {
                console.error(
                    '[BusinessTaxDetails] Failed to load company info:',
                    err instanceof Error ? err.message : 'Unknown error'
                );
                if (!cancelled) applyLocalFallback();
            } finally {
                if (!cancelled) setCompanyInfoReady(true);
            }
        })();

        return () => { cancelled = true; };
    }, [profileId, taxIdParam, getBusinessCompanyInfo]);

    // Load PAYE employees for the active month before showing the payroll table
    useEffect(() => {
        if (activeSection !== 'paye') return;
        if (!profileId || profileId === 'default') return;

        let cancelled = false;
        setPayeLoading(true);

        (async () => {
            try {
                const res = await listPayeEmployees(profileId, activeMonthNumber, yearNum);
                if (cancelled) return;
                const staff = (res.data?.employees ?? []).map(mapApiEmployeeToPayeStaff);
                setPayeStaffByMonth((prev) => ({ ...prev, [activeMonth]: staff }));
            } catch (err: unknown) {
                console.error(
                    '[BusinessTaxDetails] Failed to load PAYE employees:',
                    err instanceof Error ? err.message : 'Unknown error'
                );
                if (!cancelled) {
                    setPayeStaffByMonth((prev) => ({ ...prev, [activeMonth]: prev[activeMonth] || [] }));
                    toast.error(err instanceof Error ? err.message : 'Failed to load employees');
                }
            } finally {
                if (!cancelled) setPayeLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [activeSection, activeMonth, activeMonthNumber, profileId, yearNum, listPayeEmployees]);

    const handleAddPayeStaff = useCallback(async (newStaff: PayeStaff) => {
        if (!profileId || profileId === 'default') return;
        const validationError = validatePayeStaffForApi(newStaff);
        if (validationError) {
            toast.error(validationError);
            throw new Error(validationError);
        }
        try {
            const res = await createPayeEmployee(
                profileId,
                mapPayeStaffToCreateRequest(newStaff, activeMonthNumber)
            );
            const mapped = mapApiEmployeeToPayeStaff(res.data.employee);
            setPayeStaffByMonth((prev) => ({
                ...prev,
                [activeMonth]: [...(prev[activeMonth] || []), mapped],
            }));
            toast.success('Employee added');
        } catch (err: unknown) {
            console.error('[BusinessTaxDetails] Failed to add employee:', err instanceof Error ? err.message : 'Unknown error');
            toast.error(err instanceof Error ? err.message : 'Failed to add employee');
            throw err;
        }
    }, [profileId, activeMonth, activeMonthNumber, createPayeEmployee]);

    const handleSavePayeStaff = useCallback(async (_oldStaff: PayeStaff, newStaff: PayeStaff) => {
        if (!profileId || profileId === 'default') return;
        const validationError = validatePayeStaffForApi(newStaff);
        if (validationError) {
            toast.error(validationError);
            throw new Error(validationError);
        }
        try {
            const res = await updatePayeEmployee(
                profileId,
                newStaff.id,
                mapPayeStaffToUpdateRequest(newStaff)
            );
            const mapped = mapApiEmployeeToPayeStaff(res.data.employee);
            setPayeStaffByMonth((prev) => ({
                ...prev,
                [activeMonth]: (prev[activeMonth] || []).map((s) => (s.id === newStaff.id ? mapped : s)),
            }));
            toast.success('Employee updated');
        } catch (err: unknown) {
            console.error('[BusinessTaxDetails] Failed to update employee:', err instanceof Error ? err.message : 'Unknown error');
            toast.error(err instanceof Error ? err.message : 'Failed to update employee');
            throw err;
        }
    }, [profileId, activeMonth, updatePayeEmployee]);

    const handleRemovePayeStaff = useCallback(async (staff: PayeStaff) => {
        if (!profileId || profileId === 'default') return;
        try {
            await deletePayeEmployee(profileId, staff.id);
            setPayeStaffByMonth((prev) => ({
                ...prev,
                [activeMonth]: (prev[activeMonth] || []).filter((s) => s.id !== staff.id),
            }));
            toast.success('Employee removed');
        } catch (err: unknown) {
            console.error('[BusinessTaxDetails] Failed to delete employee:', err instanceof Error ? err.message : 'Unknown error');
            toast.error(err instanceof Error ? err.message : 'Failed to remove employee');
            throw err;
        }
    }, [profileId, activeMonth, deletePayeEmployee]);

    const handleCopyPayeStaff = useCallback(async (sourceMonth: string) => {
        if (!profileId || profileId === 'default') return;
        const sourceStaff = payeStaffByMonth[sourceMonth] || [];
        if (sourceStaff.length === 0) return;

        try {
            const created: PayeStaff[] = [];
            for (const st of sourceStaff) {
                const res = await createPayeEmployee(
                    profileId,
                    mapPayeStaffToCreateRequest(st, activeMonthNumber)
                );
                created.push(mapApiEmployeeToPayeStaff(res.data.employee));
            }
            setPayeStaffByMonth((prev) => ({
                ...prev,
                [activeMonth]: created,
            }));
            toast.success(`Copied ${created.length} employee(s) from ${sourceMonth}`);
        } catch (err: unknown) {
            console.error('[BusinessTaxDetails] Failed to copy employees:', err instanceof Error ? err.message : 'Unknown error');
            toast.error(err instanceof Error ? err.message : 'Failed to copy employees');
        }
    }, [profileId, activeMonth, activeMonthNumber, payeStaffByMonth, createPayeEmployee]);

    const containerRef = useRef<HTMLDivElement>(null);

    const animateSection = useCallback(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            gsap.set('[data-animate]', { opacity: 1, y: 0 });
            return;
        }
        gsap.fromTo(
            '[data-animate]',
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
        );
    }, []);

    useLayoutEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const ctx = gsap.context(() => {
            animateSection();
        }, containerRef);
        return () => ctx.revert();
    }, [animateSection]);

    // Re-animate when section changes
    useEffect(() => {
        animateSection();
    }, [activeSection, animateSection]);

    // Warn about unsaved changes before page refresh
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges.current) {
                e.preventDefault();
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, []);

    const handleSaveAndContinue = async () => {
        setSubmitting(true);

        // Cache locally regardless of network outcome
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            rcbn, companyName, industry, incorporationDateObj, address, city, state, lga,
            payQuarterly, estimatedAnnualRevenue, profitMargin,
        }));

        try {
            if (profileId && profileId !== 'default') {
                const payload: BusinessCompanyInfoRequest = {
                    companyName: companyName || undefined,
                    industrySector: industry || undefined,
                    dateOfIncorporation: incorporationDateObj ? format(incorporationDateObj, 'yyyy-MM-dd') : undefined,
                    businessAddress: {
                        street: address || undefined,
                        city: city || undefined,
                        state: state || undefined,
                        lga: lga || undefined,
                    },
                    payCitQuarterly: payQuarterly,
                };

                if (payQuarterly) {
                    if (rev > 0) payload.estimatedGrossRevenue = rev;
                    const marginValue = profitMargin ? Number(profitMargin.replace('%', '')) : NaN;
                    if (Number.isFinite(marginValue)) payload.estimatedProfitMargin = marginValue;
                }

                await updateBusinessCompanyInfo(profileId, payload);
            }

            hasUnsavedChanges.current = false;
            toast.success('Company information saved');
            setCompanyInfoSaved(true);

            const sections = ['company-info', 'paye', 'vat', 'wht', 'company-income-tax'];
            const idx = sections.indexOf(activeSection);
            if (idx < sections.length - 1) {
                setActiveSection(sections[idx + 1]);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err: unknown) {
            console.error('[BusinessTaxDetails] Failed to save company info:', err instanceof Error ? err.message : 'Unknown error');
            toast.error(err instanceof Error ? err.message : 'Failed to save company information. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleQuarterlyNav = () => {
        if (hasUnsavedChanges.current) {
            setPendingNav('company-income-tax');
            setPendingCITSub('quarterly');
            setShowUnsavedModal(true);
        } else {
            setActiveSection('company-income-tax');
            setCitSubSection('quarterly');
        }
    };

    const handlePayeFile = () => {
        setFiledMonths(prev => new Set(prev).add(activeMonth));
        setShowPayeFilingModal(false);
    };

    const handleEstimatedRevenueChange = (v: string) => {
        setEstimatedAnnualRevenue(v);
        hasUnsavedChanges.current = true;
    };

    const handleProfitMarginChange = (v: string) => {
        setProfitMargin(v);
        hasUnsavedChanges.current = true;
    };


    return (
        <div ref={containerRef} className="min-h-screen bg-white pb-20">
            {/* Custom nav bar */}
            <div className="w-full bg-white border-b border-neutral-100 px-4 md:px-8 py-3">
                <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-1">
                    <button onClick={() => router.push('/home')} className="flex items-center gap-2 text-3 font-semibold text-neutral-800 w-fit shrink-0">
                        <Home2Fill className="w-5 h-5" color="#E5E5E5" />
                        Home
                    </button>
                    <div className="flex items-center gap-2 text-1 text-neutral-300 font-medium">
                        <span>{taxYear} Company Tax</span>
                        <span>/</span>
                        <span className="text-neutral-300">{({ 'company-info': 'Company Information', paye: 'PAYE', vat: 'VAT', wht: 'WHT', 'company-income-tax': 'Company Income Tax' })[activeSection] || 'Company Information'}</span>
                    </div>
                </div>
            </div>

            {showWelcomeModal && <WelcomeModal onClose={() => setShowWelcomeModal(false)} />}

            <main className="max-w-[1200px] mx-auto px-4 md:px-8 pt-14 pb-8">

                {/* 3-column layout */}
                <div className="flex items-start gap-10 justify-center">
                    {/* Left sidebar */}
                    <div className="w-[250px] flex-shrink-0 flex flex-col gap-4 sticky top-24 border border-neutral-50 rounded-xl p-3">
                        {/* Main sections */}
                        <div>
                            <p className="text-1 font-semibold text-neutral-400 uppercase tracking-wider mb-2">Tax Sections</p>
                            <div>
                                {BUSINESS_SECTIONS.map(sec => (
                                    <div key={sec.key}>
                                        <SidebarItem
                                            label={sec.label}
                                            active={activeSection === sec.key && sec.key !== 'vat-wht' && sec.key !== 'company-income-tax'}
                                            completed={false}
                                            locked={sec.key !== 'company-info' && !companyInfoSaved}
                                            onClick={() => {
                                                if (hasUnsavedChanges.current && activeSection === 'company-info') {
                                                    setPendingNav(sec.key);
                                                    setShowUnsavedModal(true);
                                                    return;
                                                }
                                                if (sec.key !== 'company-info' && !companyInfoSaved) return;
                                                if (sec.route) { router.push(sec.route); }
                                                else { setActiveSection(sec.key); }
                                            }}
                                        />
                                        {/* CIT sub-items */}
                                        {sec.key === 'company-income-tax' && activeSection === 'company-income-tax' && (
                                            <div className="ml-9 mb-1">
                                                {[
                                                    ...(payQuarterly ? [{ id: 'quarterly', label: 'Quarterly Payments' }] : []),
                                                    { id: 'file-returns', label: 'Annual Filing' },
                                                ].map(sub => (
                                                    <button key={sub.id}
                                                        onClick={() => setCitSubSection(sub.id as 'quarterly' | 'file-returns')}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-2 font-medium mb-2 ${citSubSection === sub.id ? 'text-neutral-800 bg-neutral-100' : 'text-neutral-500'}`}>
                                                        {sub.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>


                    </div>

                    {/* Main form area */}
                    <div className="flex-1 min-w-0">
                        {/* Company Information */}
                        {activeSection === 'company-info' && (
                            <div data-animate className="flex flex-col items-center">
                                <h2 className="text-7 font-semibold text-neutral-800 tracking-[-0.02em] mb-8 w-full max-w-[400px]">Company Information</h2>

                                {!companyInfoReady ? (
                                    <div className="w-full max-w-[400px] flex items-center justify-center py-20">
                                        <Spinner />
                                    </div>
                                ) : (
                                        <div className="space-y-10 w-full max-w-[400px]">
                                            {/* RC/BN number */}
                                    <div>
                                        <label className="block text-2 font-medium text-neutral-500 mb-1">
                                            RC/BN number
                                            <InfoTooltip text="Your business registration number issued by CAC (Corporate Affairs Commission)." />
                                        </label>
                                        <Input
                                            type="text"
                                            value={rcbn}
                                            onChange={e => { setRcbn(e.target.value); hasUnsavedChanges.current = true; }}
                                        />
                                    </div>

                                    {/* Company name */}
                                    <div>
                                        <label className="block text-2 font-medium text-neutral-500 mb-1">
                                            Company name
                                            <InfoTooltip text="The registered name of your company as it appears in the CAC certificate." />
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="e.g. ABC Ventures Ltd"
                                            value={companyName}
                                            onChange={e => { setCompanyName(e.target.value); hasUnsavedChanges.current = true; }}
                                        />
                                    </div>

                                    {/* Industry + Date of incorporation (2-column) */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-2 font-medium text-neutral-500 mb-1">
                                                Industry/sector
                                                <InfoTooltip text="The primary industry your company operates in." />
                                            </label>
                                            <SearchableSelect value={industry} onChange={(v) => { setIndustry(v); hasUnsavedChanges.current = true; }} options={INDUSTRIES} placeholder="Select" />
                                    </div>
                                    <div>
                                        <label className="block text-2 font-medium text-neutral-500 mb-1">
                                            Date of incorporation
                                                <InfoTooltip text="Found on your CAC certificate of incorporation." />
                                            </label>
                                            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                                                <PopoverTrigger className="w-full h-10 flex items-center justify-start px-3 text-left font-normal text-3 text-neutral-800 border border-neutral-200 bg-white rounded-xl">
                                                    {incorporationDateObj ? format(incorporationDateObj, 'dd / MM / yyyy') : <span className="text-neutral-400">DD / MM / YYYY</span>}
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={incorporationDateObj}
                                                        onSelect={(date) => {
                                                            setIncorporationDateObj(date);
                                                            hasUnsavedChanges.current = true;
                                                            setDatePickerOpen(false);
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>

                                     {/* Registered office address */}
                                    <div>
                                        <label className="block text-2 font-medium text-neutral-500 mb-1">
                                            Address (building number, street)
                                            <InfoTooltip text="Your registered business address as listed with CAC." />
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="e.g. 27, Marina Street"
                                            value={address}
                                            onChange={e => { setAddress(e.target.value); hasUnsavedChanges.current = true; }}
                                            name="company-street-nofill"
                                            autoComplete="new-password"
                                            autoCorrect="off"
                                            spellCheck={false}
                                            data-lpignore="true"
                                            data-form-type="other"
                                            data-1p-ignore="true"
                                        />
                                        <div className="grid grid-cols-3 gap-3 mt-3">
                                            <SearchableSelect
                                                value={state}
                                                onChange={(v) => {
                                                    setState(v);
                                                    if (!getCitiesForState(v).includes(city)) setCity('');
                                                    if (!getLgasForState(v).includes(lga)) setLga('');
                                                    hasUnsavedChanges.current = true;
                                                }}
                                                options={NIGERIA_STATES}
                                                placeholder="State"
                                            />
                                            <SearchableSelect
                                                value={city}
                                                onChange={(v) => { setCity(v); hasUnsavedChanges.current = true; }}
                                                options={getCitiesForState(state)}
                                                placeholder="City"
                                                disabled={!state}
                                            />
                                            <SearchableSelect
                                                value={lga}
                                                onChange={(v) => { setLga(v); hasUnsavedChanges.current = true; }}
                                                options={getLgasForState(state)}
                                                placeholder="LGA"
                                                disabled={!state}
                                            />
                                        </div>
                                    </div>

                                      <div>
                                     {/* Pay CIT quarterly */}
                                     <label className="flex items-center gap-3 cursor-pointer">
                                         <Checkbox
                                             checked={payQuarterly}
                                              onCheckedChange={() => {
                                                  const next = !payQuarterly;
                                                  setPayQuarterly(next);
                                                  if (!next && citSubSection === 'quarterly') {
                                                      setCitSubSection('file-returns');
                                                  }
                                                  hasUnsavedChanges.current = true;
                                              }}
                                         />
                                         <span className="text-3 font-medium text-neutral-800">
                                             Pay CIT in quarterly installments
                                         </span>
                                         <InfoTooltip text="Pay your annual CIT liability in 4 equal installments throughout the year." />
                                     </label>
                                     <p className="text-2 text-neutral-400 font-medium mt-1">Spread your Company Income Tax across four payments instead of one lump sum.</p>
                                      {payQuarterly && (
                                      <div className="space-y-4 mt-10">
                                          <div>
                                              <label className="block text-2 font-medium text-neutral-500 mb-1">
                                                  Estimated annual gross revenue
                                                  <InfoTooltip text="Your projected gross revenue for the current tax year." />
                                              </label>
                                              <Input type="text" placeholder="₦ 0.00" value={estimatedAnnualRevenue}
                                                  onChange={e => { const raw = e.target.value.replace(/[^0-9.]/g, ''); const parts = raw.split('.'); const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); setEstimatedAnnualRevenue(parts.length > 1 ? integer + '.' + parts.slice(1).join('') : integer); hasUnsavedChanges.current = true; }} />
                                          </div>
                                          <div>
                                              <label className="block text-2 font-medium text-neutral-500 mb-2">
                                                  Estimated profit margin
                                                  <InfoTooltip text="Your estimated profit as a percentage of revenue." />
                                              </label>
                                              <div className="flex gap-2">
                                                  {['10%', '15%', '20%', '25%', '30%'].map(m => (
                                                      <button key={m} type="button"
                                                          onClick={() => { setProfitMargin(m); hasUnsavedChanges.current = true; }}
                                                           className={`h-8 px-3 rounded-full text-1 font-semibold ${profitMargin === m ? 'bg-neutral-800 text-white' : 'bg-white border border-neutral-200 text-neutral-400'}`}
                                                      >{m}</button>
                                                  ))}
                                              </div>
                                          </div>
                                          <hr className="border-neutral-100" />
                                           <div className="space-y-3">
                                              <div className="flex items-center justify-between text-2">
                                                  <span className="text-neutral-500 font-medium">Estimated annual CIT</span>
                                                  <span className="font-semibold text-neutral-800">{rev > 0 ? qFmt(totalCIT) : '—'}</span>
                                              </div>
                                              <div className="flex items-center justify-between text-2">
                                                  <span className="text-neutral-500 font-medium">Quarterly installment</span>
                                                  <span className="font-semibold text-neutral-800">{rev > 0 ? qFmt(perQuarter) : '—'}</span>
                                              </div>
                                          </div>
                                          <div>
                                              <p className="text-1 text-neutral-400 font-medium">You can find more details in <button onClick={handleQuarterlyNav} className="text-taxable-blue font-semibold">Quarterly Assessments</button></p>
                                          </div>
                                      </div>
                                      )}

                                     </div>

                                      {/* Save & Continue */}
                                    <PrimaryButton
                                        onClick={handleSaveAndContinue}
                                        disabled={submitting || !companyInfoComplete}
                                        className="w-full"
                                    >
                                        {submitting ? <Spinner /> : (companyInfoSaved ? 'Save & Continue' : 'Save & Continue to PAYE')}
                                    </PrimaryButton>
                                </div>
                                )}
                            </div>
                        )}

                        {/* PAYE section */}
                        {activeSection === 'paye' && payeSubSection === 'monthly-filing' && (() => {
                            if (payeLoading) {
                                return (
                                    <div data-animate className="flex items-center justify-center py-20">
                                        <Spinner />
                                    </div>
                                );
                            }

                            const isFiled = filedMonths.has(activeMonth);
                            const currentMonthStaff = payeStaffByMonth[activeMonth] || [];
                            const sourceMonth = getSourceMonth(activeMonth);
                            const hasData = currentMonthStaff.length > 0;
                            const activeStep = hasData ? 'table' as const : 'method' as const;
                            const totalPAYE = currentMonthStaff.reduce((s, st) => {
                                return s + calculateAnnualPAYE(st).monthlyTax;
                            }, 0);

                            return (
                                <div data-animate>
                                    <PayeMonthlyFiling
                                        activeMonth={activeMonth}
                                        activeStep={activeStep}
                                        isFiled={isFiled}
                                        totalPAYE={totalPAYE}
                                        staff={currentMonthStaff}
                                        sourceMonth={sourceMonth}
                                        filedMonths={filedMonths}
                                        payeStaffByMonth={payeStaffByMonth}
                                        onMonthChange={setActiveMonth}
                                        onAddStaff={handleAddPayeStaff}
                                        onRemoveStaff={handleRemovePayeStaff}
                                        onSaveStaff={handleSavePayeStaff}
                                        onCopyStaff={handleCopyPayeStaff}
                                        onFile={() => setShowPayeFilingModal(true)}
                                    />
                                </div>
                            );
                        })()}

                        {/* VAT section */}
                        {activeSection === 'vat' && (
                            <div data-animate className="w-full">
                                <BusinessVATContent profileId={profileId} taxYear={taxYear} />
                            </div>
                        )}

                        {/* WHT section */}
                        {activeSection === 'wht' && (
                            <div data-animate className="w-full">
                                <BusinessWHTContent profileId={profileId} taxYear={taxYear} />
                            </div>
                        )}

                        {/* CIT section */}
                        {activeSection === 'company-income-tax' && (
                            <div data-animate className="w-full">
                                <BusinessCITContent
                                    activeSubMenu={citSubSection}
                                    onSubMenuChange={setCitSubSection}
                                    payQuarterly={payQuarterly}
                                    profileId={profileId}
                                    taxYear={taxYear}
                                    estimatedAnnualRevenue={estimatedAnnualRevenue}
                                    profitMargin={profitMargin}
                                    onEstimatedRevenueChange={handleEstimatedRevenueChange}
                                    onProfitMarginChange={handleProfitMarginChange}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <FilingSheet
                open={showPayeFilingModal}
                onClose={() => setShowPayeFilingModal(false)}
                onFile={handlePayeFile}
            />

            {showUnsavedModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20" onClick={() => setShowUnsavedModal(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-[400px] mx-4 w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            </div>
                            <h3 className="text-6 font-semibold text-neutral-800 mb-2">Unsaved Changes</h3>
                            <p className="text-2 text-neutral-500 font-medium mb-6">
                                You have unsaved company information. What would you like to do?
                            </p>
                            <div className="flex gap-3 w-full">
                                <SecondaryButton className="flex-1" onClick={() => { setShowUnsavedModal(false); setPendingNav(null); }}>
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton className="flex-1" onClick={() => {
                                    handleSaveAndContinue().then(() => {
                                        if (pendingNav) setActiveSection(pendingNav);
                                        if (pendingCITSub) { setCitSubSection(pendingCITSub); setPendingCITSub(null); }
                                    });
                                    setShowUnsavedModal(false);
                                }}>
                                    Save & Leave
                                </PrimaryButton>
                            </div>
                            <button onClick={() => {
                                hasUnsavedChanges.current = false;
                                if (pendingNav) setActiveSection(pendingNav);
                                if (pendingCITSub) { setCitSubSection(pendingCITSub); setPendingCITSub(null); }
                                setShowUnsavedModal(false);
                                setPendingNav(null);
                            }} className="mt-3 text-2 font-semibold text-red-600">
                                Discard changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
