'use client';
import React, { useState, useEffect, useLayoutEffect, startTransition } from 'react';
import gsap from 'gsap';
import Lenis from 'lenis';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PayeMonthlyFiling, PayeAnnualReturns } from '@/screens/TaxFolders/BusinessPAYEContent';
import { PayeStaff } from '@/screens/TaxFolders/AddEmployeeDrawer';
import { Calendar } from '@/components/ui/calendar';
import { Spinner } from '@/components/ui/spinner';
import { BusinessVATWHTContent } from './BusinessVATWHT';
import { FilingSheet } from '@/screens/TaxFolders/TaxFolderShared';
import { BusinessCITContent } from './BusinessCIT';

// ── Mock data ─────────────────────────────────────────────────────────────────
const NIGERIA_STATES = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
    'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT',
    'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
    'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
    'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

const NIGERIA_CITIES = [
    'Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Benin City',
    'Enugu', 'Aba', 'Onitsha', 'Warri', 'Calabar', 'Uyo', 'Kaduna',
    'Jos', 'Maiduguri', 'Akure', 'Abeokuta', 'Asaba', 'Owerri', 'Ile-Ife',
];

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
    { key: 'paye', label: 'PAYE', locked: false, route: null },
    { key: 'vat-wht', label: 'VAT/WHT', locked: false, route: null },
    { key: 'company-income-tax', label: 'Company Income Tax', locked: false, route: null },
];

// ── Helper ────────────────────────────────────────────────────────────────────
const HintIcon = ({ tip }: { tip: string }) => (
    <div className="relative group inline-flex items-center ml-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-neutral-800 text-white text-1 leading-snug rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 font-medium">
            {tip}
        </div>
    </div>
);

const SidebarItem = ({
    label, active = false, completed = false, locked = false, onClick
}: {
    label: string; active?: boolean; completed?: boolean; locked?: boolean; onClick: () => void
}) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl mb-1 ${active ? 'bg-neutral-100' : ''}`}
    >
        <div className="flex items-center gap-3 text-left">
            <span className={`flex items-center ${locked ? 'opacity-40' : ''}`}>
                <Image src={locked ? "/icons/folder-inactive.svg" : "/icons/folder.svg"} alt="" width={16} height={15} />
            </span>
            <div className="flex items-center gap-2">
                <span className={`text-3 font-medium ${locked ? 'text-neutral-400' : active ? 'text-neutral-800' : 'text-neutral-700'}`}>
                    {label}
                </span>
                {completed && (
                    <div className="w-4 h-4 bg-green-600 rounded-[3px] flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
        <svg className="w-3.5 h-3.5 flex-shrink-0 text-neutral-500"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    </button>
);

// ── Welcome Modal ─────────────────────────────────────────────────────────────
const WelcomeModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px]" onClick={onClose} />
        <div className="relative bg-white rounded-[20px] w-full max-w-[380px] p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            {/* Icon */}
            <div className="w-12 h-12 rounded-full border-2 border-neutral-200 flex items-center justify-center mb-5">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-taxable-dark">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
            <h2 className="text-6 font-bold text-neutral-800 mb-3">Welcome to your tax workspace!</h2>
            <p className="text-3 text-neutral-500 font-medium leading-relaxed mb-1.5">
                Everything you need is organized in sections on the left. Start with{' '}
                <span className="text-neutral-800 font-bold">Company Information</span>{' '}
                and work your way down.
            </p>
            <p className="text-3 text-neutral-500 font-medium leading-relaxed mb-7">
                Your progress is saved automatically.
            </p>
            <button
                onClick={onClose}
                className="w-full h-12 bg-taxable-blue text-white text-3 font-semibold rounded-xl"
            >
                Got it
            </button>
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

    // SessionStorage persistence — restore on client mount to avoid hydration mismatch
    const [showWelcomeModal, setShowWelcomeModal] = React.useState(false);
    const [activeSection, setActiveSection] = React.useState('company-info');
    const [submitting, setSubmitting] = React.useState(false);
    const [companyInfoSaved, setCompanyInfoSaved] = React.useState(false);

    // Company Info fields
    const [rcbn, setRcbn] = React.useState('12345678901');
    const [companyName, setCompanyName] = React.useState('');
    const [industry, setIndustry] = React.useState('');
    const [incorporationDate, setIncorporationDate] = React.useState('');
    const [address, setAddress] = React.useState('');
    const [city, setCity] = React.useState('');
    const [state, setState] = React.useState('');
    const [payQuarterly, setPayQuarterly] = React.useState(false);
    const [estimatedAnnualProfit, setEstimatedAnnualProfit] = React.useState('');

    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [incorporationDateObj, setIncorporationDateObj] = useState<Date | undefined>(undefined);

    const companyInfoComplete = Boolean(
        rcbn && companyName && industry && incorporationDateObj && address && city && state
    );

    // PAYE inline state
    const [payeSubSection, _setPayeSubSection] = React.useState<'monthly-filing' | 'annual-returns'>('monthly-filing');
    const [vatWhtSubSection, setVatWhtSubSection] = React.useState<'file-vat' | 'remit-wht' | 'wht-balance'>('file-vat');
    const [citSubSection, setCitSubSection] = React.useState<'quarterly' | 'file-returns' | 'tax-adjustment' | 'wht-credits' | 'review'>('quarterly');

    const [activeMonth, setActiveMonth] = React.useState('January');
    const [_payeStep, _setPayeStep] = React.useState<Record<string, 'method' | 'table'>>({});
    const [_payeMethod, _setPayeMethod] = React.useState<Record<string, string>>({});
    const [filedMonths, _setFiledMonths] = React.useState<Set<string>>(new Set());
    const [payeStaffByMonth, setPayeStaffByMonth] = React.useState<Record<string, PayeStaff[]>>({});
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [showPayeFilingModal, setShowPayeFilingModal] = React.useState(false);
    const [_showBreakdown, _setShowBreakdown] = React.useState(false);
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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

    useEffect(() => {
        const isNew = searchParams.get('new');
        if (isNew === 'workspace') {
            startTransition(() => {
                setShowWelcomeModal(true);
            });
            router.replace(window.location.pathname);
        }
    }, []);

    // Restore company info from sessionStorage on client mount
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const saved = JSON.parse(raw);
            startTransition(() => {
                if (saved.rcbn) setRcbn(saved.rcbn);
                if (saved.companyName) setCompanyName(saved.companyName);
                if (saved.industry) setIndustry(saved.industry);
                if (saved.incorporationDate) setIncorporationDate(saved.incorporationDate);
                if (saved.incorporationDateObj) setIncorporationDateObj(new Date(saved.incorporationDateObj));
                if (saved.address) setAddress(saved.address);
                if (saved.city) setCity(saved.city);
                if (saved.state) setState(saved.state);
                if (typeof saved.payQuarterly === 'boolean') setPayQuarterly(saved.payQuarterly);
                if (saved.estimatedAnnualProfit) setEstimatedAnnualProfit(saved.estimatedAnnualProfit);
            });
        } catch { /* ignore */ }
    }, []);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                '[data-animate]',
                { opacity: 0, y: 16 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    stagger: 0.06,
                    ease: 'power2.out',
                    onStart: () => gsap.set('[data-animate]', { transition: 'none' }),
                    onComplete: () => gsap.set('[data-animate]', { clearProps: 'transition' }),
                }
            );
        });
        return () => ctx.revert();
    }, []);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const lenis = new Lenis({ lerp: 0.1 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__lenis = lenis;

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).__lenis = undefined;
        };
    }, []);

    const handleSaveAndContinue = async () => {
        setSubmitting(true);
        setCompanyInfoSaved(true);

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
            rcbn, companyName, industry, incorporationDate, incorporationDateObj, address, city, state,
            payQuarterly, estimatedAnnualProfit,
        }));

        await new Promise(res => setTimeout(res, 500));
        const sections = ['company-info', 'paye', 'company-income-tax'];
        const idx = sections.indexOf(activeSection);
        if (idx < sections.length - 1) {
            setActiveSection(sections[idx + 1]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setSubmitting(false);
    };

    const handlePayeFile = () => {
        _setFiledMonths(prev => new Set(prev).add(activeMonth));
        setShowPayeFilingModal(false);
    };


    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Custom nav bar */}
            <div className="w-full bg-white border-b border-neutral-100 px-4 md:px-8 py-3">
                <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-1">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-3 font-semibold text-neutral-800 w-fit shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Back
                    </button>
                    <div className="flex items-center gap-2 text-1 text-neutral-300 font-medium">
                        <span>{taxYear} Company Tax</span>
                        <span>/</span>
                        <span className="text-neutral-300">Company Information</span>
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
                            <p className="text-1 font-bold text-neutral-400 uppercase tracking-wider mb-2">Select</p>
                            <div>
                                {BUSINESS_SECTIONS.map(sec => (
                                    <div key={sec.key}>
                                        <SidebarItem
                                            label={sec.label}
                                            active={activeSection === sec.key && sec.key !== 'vat-wht' && sec.key !== 'company-income-tax'}
                                            completed={false}
                                            locked={sec.key !== 'company-info' && !companyInfoSaved}
                                            onClick={() => {
                                                if (sec.key !== 'company-info' && !companyInfoSaved) return;
                                                if (sec.route) { router.push(sec.route); }
                                                else { setActiveSection(sec.key); }
                                            }}
                                        />
                                        {/* VAT/WHT sub-items */}
                                        {sec.key === 'vat-wht' && activeSection === 'vat-wht' && (
                                            <div className="ml-9 mb-1">
                                                {[
                                                    { id: 'file-vat', label: 'File Monthly VAT Return' },
                                                    { id: 'remit-wht', label: 'Remit Monthly WHT' },
                                                    { id: 'wht-balance', label: 'WHT Credit Notes' },
                                                ].map(sub => (
                                                    <button key={sub.id}
                                                        onClick={() => setVatWhtSubSection(sub.id as 'file-vat' | 'remit-wht' | 'wht-balance')}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-3 font-medium transition-colors mb-2 ${vatWhtSubSection === sub.id ? 'text-neutral-800 bg-neutral-100' : 'text-neutral-500  '
                                                            }`}>
                                                        {sub.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {/* CIT sub-items */}
                                        {sec.key === 'company-income-tax' && activeSection === 'company-income-tax' && (
                                            <div className="ml-9 mb-1">
                                                {[
                                                    { id: 'quarterly', label: 'Quarterly Assessments' },
                                                    { id: 'file-returns', label: 'File Annual Returns' },
                                                    { id: 'tax-adjustment', label: 'Tax Adjustment' },
                                                    { id: 'wht-credits', label: 'WHT Credits' },
                                                    { id: 'review', label: 'Review' },
                                                ].map(sub => (
                                                    <button key={sub.id}
                                                        onClick={() => setCitSubSection(sub.id as 'quarterly' | 'file-returns' | 'tax-adjustment' | 'wht-credits' | 'review')}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-3 font-medium transition-colors mb-2 ${citSubSection === sub.id ? 'text-neutral-800 bg-neutral-100' : 'text-neutral-500  '
                                                            }`}>
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
                                <h2 className="text-7 font-semibold text-taxable-dark tracking-[-0.02em] mb-8 w-full max-w-[400px]">Company Information</h2>

                                        <div className="space-y-10 w-full max-w-[400px]">
                                            {/* RC/BN number */}
                                    <div>
                                        <label className="block text-2 font-medium text-neutral-700 mb-1">
                                            RC/BN number
                                            <HintIcon tip="Your Companies Registration Number (RC) or Business Name (BN) from CAC." />
                                        </label>
                                        <Input
                                            type="text"
                                            value={rcbn}
                                            onChange={e => setRcbn(e.target.value)}
                                        />
                                    </div>

                                    {/* Company name */}
                                    <div>
                                        <label className="block text-2 font-medium text-neutral-700 mb-1">
                                            Company name
                                            <HintIcon tip="The registered name of your company as it appears in the CAC certificate." />
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="e.g. ABC Ventures Ltd"
                                            value={companyName}
                                            onChange={e => setCompanyName(e.target.value)}
                                        />
                                    </div>

                                    {/* Industry + Date of incorporation (2-column) */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-2 font-medium text-neutral-700 mb-1">
                                                Industry/sector
                                                <HintIcon tip="The primary industry your company operates in." />
                                            </label>
                                            <SearchableSelect value={industry} onChange={setIndustry} options={INDUSTRIES} placeholder="Select" />
                                    </div>
                                    <div>
                                        <label className="block text-2 font-medium text-neutral-700 mb-1">
                                            Date of incorporation
                                                <HintIcon tip="Found on your CAC certificate of incorporation." />
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
                                                            if (date) setIncorporationDate(format(date, 'yyyy-MM-dd'));
                                                            setDatePickerOpen(false);
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>

                                    {/* Registered office address */}
                                    <div>
                                        <label className="block text-2 font-medium text-neutral-700 mb-1">
                                            Registered office address
                                            <HintIcon tip="The address registered with CAC for your business." />
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Address"
                                            value={address}
                                            onChange={e => setAddress(e.target.value)}
                                        />
                                        <div className="grid grid-cols-2 gap-3 mt-3">
                                            <SearchableSelect value={city} onChange={setCity} options={NIGERIA_CITIES} placeholder="City" />
                                            <SearchableSelect value={state} onChange={setState} options={NIGERIA_STATES} placeholder="State" />
                                        </div>
                                    </div>

                                    {/* Pay CIT quarterly */}
                                    <button
                                        type="button"
                                        onClick={() => setPayQuarterly(p => !p)}
                                        className="flex items-center gap-3"
                                    >
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${payQuarterly ? 'border-taxable-blue bg-taxable-blue' : 'border-neutral-300 bg-white'}`}>
                                            {payQuarterly && (
                                                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="text-3 font-medium text-neutral-700">
                                            Pay CIT in quarterly installments
                                        </span>
                                        <HintIcon tip="Pay your annual CIT liability in 4 equal installments throughout the year." />
                                    </button>

                                    {/* Quarterly installments section */}
                                    {payQuarterly && (() => {
                                        const profitNum = Number(estimatedAnnualProfit.replace(/,/g, '')) || 0;
                                        const estimatedCIT = profitNum * 0.30;
                                        const quarterlyPayment = estimatedCIT / 4;
                                        const qFmt = (n: number) => `₦${Math.round(n).toLocaleString()}`;
                                        return (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="flex items-center text-2 font-medium text-neutral-700 mb-1">
                                                        What's your estimated annual profit for 2026?
                                                        <HintIcon tip="Enter your projected profit before tax. We'll use this to calculate quarterly installments." />
                                                    </label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-3 text-neutral-500 pointer-events-none">₦</span>
                                                        <Input
                                                            type="text"
                                                            placeholder="0"
                                                            value={estimatedAnnualProfit}
                                                            onChange={e => {
                                                                const raw = e.target.value.replace(/[^0-9.]/g, '');
                                                                const parts = raw.split('.');
                                                                const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                                                const formatted = parts.length > 1 ? integer + '.' + parts.slice(1).join('') : integer;
                                                                setEstimatedAnnualProfit(formatted);
                                                            }}
                                                            className="pl-8"
                                                        />
                                                    </div>
                                                </div>
                                                {profitNum > 0 && (
                                                    <div className="pt-1">
                                                        <div className="grid grid-cols-2 gap-6 mb-3">
                                                            <div>
                                                                <p className="text-1 font-semibold text-neutral-500 mb-1">Estimated CIT (30%)</p>
                                                                <p className="text-5 font-bold text-neutral-800">{qFmt(estimatedCIT)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-1 font-semibold text-neutral-500 mb-1">Quarterly payment</p>
                                                                <p className="text-5 font-bold text-neutral-800">{qFmt(quarterlyPayment)}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-2 font-medium text-neutral-500">
                                                            You'll pay {qFmt(quarterlyPayment)} on Mar 31, Jun 30, Sep 30, Dec 31.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* Save & Continue */}
                                    <button
                                        onClick={handleSaveAndContinue}
                                        disabled={submitting || !companyInfoComplete}
                                        className="h-12 px-8 bg-taxable-blue text-white font-semibold rounded-xl disabled:bg-neutral-100 disabled:text-neutral-400 text-3 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <Spinner /> : 'Save & Continue'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PAYE section */}
                        {activeSection === 'paye' && payeSubSection === 'monthly-filing' && (() => {
                            const isFiled = filedMonths.has(activeMonth);
                            const currentMonthStaff = payeStaffByMonth[activeMonth] || [];
                            const sourceMonth = getSourceMonth(activeMonth);
                            const hasData = currentMonthStaff.length > 0;
                            const activeStep = hasData ? 'table' as const : 'method' as const;
                            const totalPAYE = currentMonthStaff.reduce((s, st) => {
                                const pension = st.pensionOn ? Math.round(st.gross * 0.08) : 0;
                                const nhf = st.nhfOn ? Math.round(st.gross * 0.025) : 0;
                                const hmo = st.hmoOn ? Math.round(st.gross * 0.025) : 0;
                                const chargeable = Math.max(0, st.gross - pension - nhf - hmo);
                                return s + Math.round(chargeable * 0.07);
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
                                        onAddStaff={(newStaff) => setPayeStaffByMonth(prev => ({
                                            ...prev,
                                            [activeMonth]: [...(prev[activeMonth] || []), newStaff]
                                        }))}
                                        onRemoveStaff={(st) => setPayeStaffByMonth(prev => ({
                                            ...prev,
                                            [activeMonth]: (prev[activeMonth] || []).filter(s => s !== st)
                                        }))}
                                        onSaveStaff={(oldSt, newSt) => setPayeStaffByMonth(prev => ({
                                            ...prev,
                                            [activeMonth]: (prev[activeMonth] || []).map(s => s === oldSt ? newSt : s)
                                        }))}
                                        onCopyStaff={(source) => setPayeStaffByMonth(prev => ({
                                            ...prev,
                                            [activeMonth]: [...(prev[source] || [])]
                                        }))}
                                        onFile={() => setShowPayeFilingModal(true)}
                                    />
                                </div>
                            );
                        })()}

                        {/* PAYE Annual Returns */}
                        {activeSection === 'paye' && payeSubSection === 'annual-returns' && (() => {
                            const allStaff = Object.values(payeStaffByMonth).flat();
                            const totalAnnualPAYE = allStaff.reduce((s, st) => {
                                const pension = st.pensionOn ? Math.round(st.gross * 0.08) : 0;
                                const nhf = st.nhfOn ? Math.round(st.gross * 0.025) : 0;
                                const hmo = st.hmoOn ? Math.round(st.gross * 0.025) : 0;
                                const chargeable = Math.max(0, st.gross - pension - nhf - hmo);
                                return s + Math.round(chargeable * 0.07) * 12;
                            }, 0);
                            const totalGrossPayroll = allStaff.reduce((s, st) => s + st.gross, 0);
                            return (
                                <div data-animate>
                                    <PayeAnnualReturns
                                        staffCount={allStaff.length}
                                        totalAnnualPAYE={totalAnnualPAYE}
                                        totalGrossPayroll={totalGrossPayroll}
                                        filedMonthsCount={12}
                                    />
                                </div>
                            );
                        })()}

                        {/* VAT/WHT section */}
                        {activeSection === 'vat-wht' && (
                            <div data-animate className="w-full">
                                <BusinessVATWHTContent
                                    activeSubMenu={vatWhtSubSection}
                                    onSubMenuChange={setVatWhtSubSection}
                                />
                            </div>
                        )}

                        {/* CIT section */}
                        {activeSection === 'company-income-tax' && (
                            <div data-animate className="w-full">
                                <BusinessCITContent
                                    activeSubMenu={citSubSection}
                                    onSubMenuChange={setCitSubSection}
                                />
                            </div>
                        )}

                        {/* Review section */}
                        {activeSection === 'review' && (
                            <div data-animate className="bg-white rounded-2xl border border-neutral-100 p-8 text-center">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <h3 className="text-6 font-bold text-neutral-800 mb-2">Ready to file?</h3>
                                <p className="text-3 text-neutral-500 font-medium mb-6">
                                    Review your information and submit your company tax return.
                                </p>
                                <button
                                    onClick={() => router.push('/home')}
                                    className="h-12 px-10 bg-taxable-blue text-white font-semibold rounded-xl text-3"
                                >
                                    Submit Tax Return
                                </button>
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
        </div>
    );
}
