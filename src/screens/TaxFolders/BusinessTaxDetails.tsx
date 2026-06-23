'use client';
import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';
import { BusinessVATWHTContent } from './BusinessVATWHT';
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
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-neutral-800 text-white text-[11px] leading-snug rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 font-medium">
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
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all mb-0.5 ${active ? 'bg-neutral-100' : 'hover:bg-neutral-50'}`}
    >
        <div className="flex items-center gap-3 text-left">
            <span className={`text-lg leading-none ${locked ? 'opacity-40' : ''}`}>
                {locked ? '🗂️' : '📁'}
            </span>
            <div className="flex items-center gap-2">
                <span className={`text-[13px] font-semibold ${locked ? 'text-neutral-400' : active ? 'text-neutral-800' : 'text-neutral-700'}`}>
                    {label}
                </span>
                {completed && (
                    <div className="w-4 h-4 bg-[#10B981] rounded-[3px] flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
        <svg className={`w-3.5 h-3.5 flex-shrink-0 ${locked ? 'text-gray-200' : active ? 'text-neutral-800' : 'placeholder:text-neutral-300'}`}
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
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0C0C0E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
            <h2 className="text-base font-bold text-neutral-800 mb-3">Welcome to your tax workspace!</h2>
            <p className="text-[14px] text-neutral-500 font-medium leading-relaxed mb-1.5">
                Everything you need is organized in sections on the left. Start with{' '}
                <span className="text-neutral-800 font-bold">Company Information</span>{' '}
                and work your way down.
            </p>
            <p className="text-[14px] text-neutral-500 font-medium leading-relaxed mb-7">
                Your progress is saved automatically.
            </p>
            <button
                onClick={onClose}
                className="w-full h-12 bg-taxable-blue text-white text-[15px] font-bold rounded-xl hover:opacity-90 transition-opacity"
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
    const pathname = usePathname();

    const taxYear = searchParams.get('year') || '2026';
    const [showWelcomeModal, setShowWelcomeModal] = React.useState(false);
    const [activeSection, setActiveSection] = React.useState('company-info');
    const [submitting, setSubmitting] = React.useState(false);

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

    // PAYE inline state
    const [payeSubSection, setPayeSubSection] = React.useState<'monthly-filing' | 'annual-returns'>('monthly-filing');
    const [vatWhtSubSection, setVatWhtSubSection] = React.useState<'file-vat' | 'remit-wht' | 'wht-balance'>('file-vat');
    const [citSubSection, setCitSubSection] = React.useState<'quarterly' | 'file-returns' | 'tax-adjustment' | 'wht-credits' | 'review'>('quarterly');

    const [activeMonth, setActiveMonth] = React.useState('January');
    const [payeStep, setPayeStep] = React.useState<Record<string, 'method' | 'table'>>({});
    const [payeMethod, setPayeMethod] = React.useState<Record<string, string>>({});
    const [filedMonths, _setFiledMonths] = React.useState<Set<string>>(new Set());
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [showPayeFilingModal, setShowPayeFilingModal] = React.useState(false);
    const [showBreakdown, setShowBreakdown] = React.useState(false);
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const PAYE_SAMPLE_STAFF = [
        { name: 'Olumide Adeyemi', tin: '12345678901', gross: 12500000, paye: 1450000, pension: 1000000, nhf: 312500 },
        { name: 'Chidi Okonkwo', tin: '23456789012', gross: 8400000, paye: 820000, pension: 672000, nhf: 210000 },
        { name: 'Amina Abubakar', tin: '34567890123', gross: 15000000, paye: 1950000, pension: 1200000, nhf: 375000 },
        { name: 'Babajide Sowore', tin: '45678901234', gross: 750000, paye: 60000, pension: 60000, nhf: 18750 },
        { name: 'Ifeanyi Uba', tin: '56789012345', gross: 22000000, paye: 315000, pension: 1760000, nhf: 550000 },
        { name: 'Zainab Dahiru', tin: '67890123456', gross: 4200000, paye: 85000, pension: 336000, nhf: 105000 },
        { name: 'Emeka Nnaman', tin: '78901234567', gross: 1800000, paye: 540000, pension: 144000, nhf: 45000 },
    ];

    // CIT fields
    const [_annualRevenue, _setAnnualRevenue] = React.useState('');
    const [_taxableProfit, _setTaxableProfit] = React.useState('');

    React.useEffect(() => {
        const isNew = searchParams.get('new');
        if (isNew === 'workspace') {
            setShowWelcomeModal(true);
            router.replace(pathname);
        }
    }, []);

    const handleSaveAndContinue = async () => {
        setSubmitting(true);
        await new Promise(res => setTimeout(res, 500));
        const sections = ['company-info', 'paye', 'company-income-tax', 'review'];
        const idx = sections.indexOf(activeSection);
        if (idx < sections.length - 1) {
            setActiveSection(sections[idx + 1]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setSubmitting(false);
    };

    const companyDisplayName = companyName || 'ABC Ventures Ltd';

    return (
        <div className="min-h-screen bg-neutral-100 font-sans pb-20">
            <DashboardHeader />

            {showWelcomeModal && <WelcomeModal onClose={() => setShowWelcomeModal(false)} />}

            <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
                {/* Back + Breadcrumb */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-[13px] font-bold text-neutral-800 hover:text-taxable-blue transition-colors shrink-0"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                        </svg>
                        Back
                    </button>
                    <div className="flex items-center gap-1.5 text-[12px] text-neutral-400 font-medium">
                        <span>{taxYear} Individual Tax</span>
                        <span>/</span>
                        <span className="text-neutral-500">
                            {BUSINESS_SECTIONS.find(s => s.key === activeSection)?.label ?? 'Company Information'}
                        </span>
                    </div>
                </div>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-lg font-bold text-neutral-800 mb-2">
                        {companyDisplayName}, {taxYear} Company Tax
                    </h1>
                    {/* Outstanding badge */}
                    <div className="inline-flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <span className="text-[13px] font-bold text-amber-600">Outstanding: ₦145,000</span>
                    </div>
                </div>

                {/* 3-column layout */}
                <div className="flex items-start gap-6">
                    {/* Left sidebar */}
                    <div className="w-[220px] flex-shrink-0 flex flex-col gap-4 sticky top-24">
                        {/* Main sections */}
                        <div>
                            <div className="flex items-center justify-between mb-2 px-1">
                                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Select</p>
                                <button className="flex items-center gap-1 text-[11px] font-bold text-taxable-blue hover:opacity-70 transition-opacity">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    Edit Section
                                </button>
                            </div>
                            <div>
                                {BUSINESS_SECTIONS.map(sec => (
                                    <div key={sec.key}>
                                        <SidebarItem
                                            label={sec.label}
                                            active={activeSection === sec.key}
                                            completed={false}
                                            locked={false}
                                            onClick={() => {
                                                if (sec.route) { router.push(sec.route); }
                                                else { setActiveSection(sec.key); }
                                            }}
                                        />
                                        {/* PAYE sub-items */}
                                        {sec.key === 'paye' && activeSection === 'paye' && (
                                            <div className="ml-9 mb-1">
                                                {(['monthly-filing', 'annual-returns'] as const).map(sub => (
                                                    <button key={sub}
                                                        onClick={() => setPayeSubSection(sub)}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-[12.5px] font-semibold transition-colors mb-0.5 ${payeSubSection === sub ? 'text-neutral-800 bg-neutral-100' : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                                                            }`}>
                                                        <span className="flex items-center justify-between">
                                                            {sub === 'monthly-filing' ? 'Monthly Filing' : 'Annual Returns'}
                                                            {sub === 'monthly-filing' && (
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                            )}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
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
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-[12.5px] font-semibold transition-colors mb-0.5 ${vatWhtSubSection === sub.id ? 'text-neutral-800 bg-neutral-100' : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
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
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-[12.5px] font-semibold transition-colors mb-0.5 ${citSubSection === sub.id ? 'text-neutral-800 bg-neutral-100' : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
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

                        {/* Locked bottom section */}
                        <div>
                            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 px-1">Select</p>
                            <SidebarItem
                                label="Review & File"
                                active={activeSection === 'review'}
                                completed={false}
                                locked={true}
                                onClick={() => setActiveSection('review')}
                            />
                        </div>

                        {/* Book accountant CTA */}
                        <div className="bg-white rounded-[16px] p-5 border border-neutral-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                                </svg>
                                <h4 className="text-[13px] font-bold text-neutral-800">Need expert eyes on your return?</h4>
                            </div>
                            <p className="text-[12px] text-neutral-500 font-medium leading-relaxed mb-4">
                                Get your return reviewed by a certified tax accountant. They'll ensure accuracy, compliance, and file for you.
                            </p>
                            <button className="w-full py-2.5 bg-white border border-neutral-200 rounded-xl text-[12px] font-bold text-neutral-800 hover:bg-neutral-50 transition-all">
                                Book Accountant (₦15,000)
                            </button>
                        </div>
                    </div>

                    {/* Main form area */}
                    <div className="flex-1 min-w-0">
                        {/* Company Information */}
                        {activeSection === 'company-info' && (
                            <div className="animate-in fade-in duration-300 flex items-start justify-center gap-8">
                                <h2 className="text-base font-bold text-neutral-800 mb-6">Company Information</h2>

                                <div className="space-y-6 max-w-[480px]">
                                    {/* RC/BN number */}
                                    <div>
                                        <label className="block text-[13px] font-semibold text-neutral-700 mb-2">
                                            RC/BN number
                                            <HintIcon tip="Your Companies Registration Number (RC) or Business Name (BN) from CAC." />
                                        </label>
                                        <input
                                            type="text"
                                            value={rcbn}
                                            onChange={e => setRcbn(e.target.value)}
                                            className="w-full h-11 border border-neutral-200 bg-neutral-100 rounded-xl px-4 text-[14px] font-medium text-neutral-800 focus:outline-none focus:border-taxable-blue/40 transition-all"
                                        />
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            <span className="text-[12px] font-bold text-green-600">Verified</span>
                                        </div>
                                    </div>

                                    {/* Company name */}
                                    <div>
                                        <label className="block text-[13px] font-semibold text-neutral-700 mb-2">
                                            Company name
                                            <HintIcon tip="The registered name of your company as it appears in the CAC certificate." />
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. ABC Ventures Ltd"
                                            value={companyName}
                                            onChange={e => setCompanyName(e.target.value)}
                                            className="w-full h-11 border border-neutral-200 bg-neutral-100 rounded-xl px-4 text-[14px] font-medium text-neutral-800 placeholder:placeholder:text-neutral-300 focus:outline-none focus:border-taxable-blue/40 transition-all"
                                        />
                                    </div>

                                    {/* Industry + Date of incorporation (2-column) */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[13px] font-semibold text-neutral-700 mb-2">
                                                Industry/sector
                                                <HintIcon tip="The primary industry your company operates in." />
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={industry}
                                                    onChange={e => setIndustry(e.target.value)}
                                                    className="w-full h-11 border border-neutral-200 bg-neutral-100 rounded-xl px-4 text-[14px] font-medium text-neutral-800 focus:outline-none focus:border-taxable-blue/40 transition-all appearance-none"
                                                >
                                                    <option value="" disabled>Select</option>
                                                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                                                </select>
                                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="6 9 12 15 18 9" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-semibold text-neutral-700 mb-2">
                                                Date of incorporation
                                                <HintIcon tip="Found on your CAC certificate of incorporation." />
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="DD / MM / YYYY"
                                                value={incorporationDate}
                                                onChange={e => setIncorporationDate(e.target.value)}
                                                className="w-full h-11 border border-neutral-200 bg-neutral-100 rounded-xl px-4 text-[14px] font-medium text-neutral-800 placeholder:placeholder:text-neutral-300 focus:outline-none focus:border-taxable-blue/40 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Registered office address */}
                                    <div>
                                        <label className="block text-[13px] font-semibold text-neutral-700 mb-2">
                                            Registered office address
                                            <HintIcon tip="The address registered with CAC for your business." />
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Address"
                                            value={address}
                                            onChange={e => setAddress(e.target.value)}
                                            className="w-full h-11 border border-neutral-200 bg-neutral-100 rounded-xl px-4 text-[14px] font-medium text-neutral-800 placeholder:placeholder:text-neutral-300 focus:outline-none focus:border-taxable-blue/40 transition-all mb-3"
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="relative">
                                                <select value={city} onChange={e => setCity(e.target.value)}
                                                    className="w-full h-11 border border-neutral-200 bg-neutral-100 rounded-xl px-4 text-[14px] font-medium text-neutral-800 focus:outline-none focus:border-taxable-blue/40 transition-all appearance-none">
                                                    <option value="" disabled>City</option>
                                                    {NIGERIA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="6 9 12 15 18 9" />
                                                </svg>
                                            </div>
                                            <div className="relative">
                                                <select value={state} onChange={e => setState(e.target.value)}
                                                    className="w-full h-11 border border-neutral-200 bg-neutral-100 rounded-xl px-4 text-[14px] font-medium text-neutral-800 focus:outline-none focus:border-taxable-blue/40 transition-all appearance-none">
                                                    <option value="" disabled>State</option>
                                                    {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="6 9 12 15 18 9" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pay CIT quarterly */}
                                    <button
                                        type="button"
                                        onClick={() => setPayQuarterly(p => !p)}
                                        className="flex items-center gap-3 group"
                                    >
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${payQuarterly ? 'border-taxable-blue bg-taxable-blue' : 'border-neutral-300 bg-white'}`}>
                                            {payQuarterly && (
                                                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="text-[13px] font-semibold text-neutral-700 group-hover:text-neutral-800 transition-colors">
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
                                                    <label className="flex items-center text-[13px] font-semibold text-neutral-700 mb-2">
                                                        What's your estimated annual profit for 2026?
                                                        <HintIcon tip="Enter your projected profit before tax. We'll use this to calculate quarterly installments." />
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="N0"
                                                        value={estimatedAnnualProfit}
                                                        onChange={e => setEstimatedAnnualProfit(e.target.value.replace(/[^0-9.]/g, ''))}
                                                        className="w-full h-11 border border-neutral-200 bg-neutral-100 rounded-xl px-4 text-[14px] font-medium text-neutral-800 placeholder:placeholder:text-neutral-300 focus:outline-none focus:border-taxable-blue/40 transition-all"
                                                    />
                                                </div>
                                                {profitNum > 0 && (
                                                    <div className="pt-1">
                                                        <div className="grid grid-cols-2 gap-6 mb-3">
                                                            <div>
                                                                <p className="text-[11px] font-semibold text-neutral-500 mb-1">Estimated CIT (30%)</p>
                                                                <p className="text-base font-bold text-neutral-800">{qFmt(estimatedCIT)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[11px] font-semibold text-neutral-500 mb-1">Quarterly payment</p>
                                                                <p className="text-base font-bold text-neutral-800">{qFmt(quarterlyPayment)}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-[12px] font-medium text-neutral-500">
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
                                        disabled={submitting}
                                        className="h-12 px-8 bg-taxable-blue text-white font-bold rounded-xl hover:bg-taxable-blue/80 transition-colors disabled:opacity-50 text-[14px]"
                                    >
                                        {submitting ? 'Saving...' : 'Save & Continue'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PAYE section */}
                        {activeSection === 'paye' && payeSubSection === 'monthly-filing' && (() => {
                            const curStep = payeStep[activeMonth] ?? 'method';
                            const curMethod = payeMethod[activeMonth] ?? (activeMonth === 'January' ? 'manual' : 'copy');
                            const activeMonthIndex = MONTHS.indexOf(activeMonth);
                            const isFiled = filedMonths.has(activeMonth);
                            const totalPAYE = PAYE_SAMPLE_STAFF.reduce((s, st) => s + st.paye, 0);
                            const fmt = (n: number) => `₦${n.toLocaleString()}`;

                            // Month column visibility: hidden only on January's very first method screen
                            const showMonthCol = !(activeMonth === 'January' && curStep === 'method' && filedMonths.size === 0);

                            // How many months to show in column: min 3, grows as you navigate further
                            const visibleMonthCount = Math.min(MONTHS.length, Math.max(3, activeMonthIndex + 2));
                            const visibleMonths = MONTHS.slice(0, visibleMonthCount);

                            const MONTH_METHODS = activeMonth === 'January'
                                ? [
                                    { id: 'manual', label: 'Manual entry (add staff one by one)' },
                                    { id: 'csv', label: 'Upload CSV/Excel (bulk upload)' },
                                    { id: 'software', label: 'Connect payroll software (QuickBooks, Zoho)' },
                                ]
                                : [
                                    { id: 'copy', label: 'Copy from last month' },
                                    { id: 'manual', label: 'Manual entry (add staff one by one)' },
                                    { id: 'csv', label: 'Upload CSV/Excel (bulk upload)' },
                                    { id: 'software', label: 'Connect payroll software (QuickBooks, Zoho)' },
                                ];

                            const methodContent = (
                                <div className="max-w-[480px] mx-auto">
                                    <h2 className="text-base font-bold text-neutral-800 mb-1">How do you want to add payroll data?</h2>
                                    <p className="text-[13px] text-neutral-500 font-medium mb-6">Upload or enter your payroll for this month</p>
                                    <div className="mb-8">
                                        {MONTH_METHODS.map(opt => (
                                            <button key={opt.id} onClick={() => setPayeMethod(p => ({ ...p, [activeMonth]: opt.id }))}
                                                className="w-full flex items-center gap-3 py-3.5 text-left">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${curMethod === opt.id ? 'border-taxable-blue' : 'border-neutral-300'}`}>
                                                    {curMethod === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-taxable-blue" />}
                                                </div>
                                                <span className="text-[14px] font-semibold text-neutral-800">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setPayeStep(s => ({ ...s, [activeMonth]: 'table' }))}
                                        className="h-11 px-8 bg-taxable-blue text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-[14px]">
                                        Continue
                                    </button>
                                </div>
                            );

                            const tableContent = (
                                <div className="w-full">
                                    {/* Table top bar */}
                                    <div className="flex items-center justify-between mb-3">
                                        <h2 className="text-[15px] font-bold text-neutral-800">Staff Payroll ({activeMonth} 2026)</h2>
                                        <div className="flex items-center gap-3">
                                            <button className="flex items-center gap-1.5 text-[12px] font-bold text-taxable-blue hover:opacity-80">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                                Add staff
                                            </button>
                                            {isFiled && (
                                                <button className="flex items-center gap-1.5 text-[12px] font-bold text-neutral-500 hover:opacity-80">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                    Edit staff
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {/* Payroll table */}
                                    <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white mb-6">
                                        <table className="w-full text-left text-[12px]">
                                            <thead className="bg-neutral-100 border-b border-neutral-100">
                                                <tr>
                                                    <th className="px-4 py-3 font-bold text-neutral-500">Staff Name</th>
                                                    <th className="px-4 py-3 font-bold text-neutral-500">Tax ID (NIN)</th>
                                                    <th className="px-4 py-3 font-bold text-neutral-500">Gross Salary</th>
                                                    <th className="px-4 py-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-4 h-4 bg-taxable-blue rounded flex items-center justify-center">
                                                                <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                            </div>
                                                            <span className="font-bold text-neutral-500">PAYE</span>
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-4 h-4 bg-taxable-blue rounded flex items-center justify-center">
                                                                <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                            </div>
                                                            <span className="font-bold text-neutral-500">Pension (8%)</span>
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-4 h-4 rounded border-2 border-neutral-300 bg-white" />
                                                            <span className="font-bold text-neutral-400">NHF (2.5%)</span>
                                                        </div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-50">
                                                {PAYE_SAMPLE_STAFF.map((st, i) => (
                                                    <tr key={i} className="hover:bg-neutral-100 transition-colors">
                                                        <td className="px-4 py-3 font-semibold text-neutral-800">{st.name}</td>
                                                        <td className="px-4 py-3 text-neutral-500">{st.tin}</td>
                                                        <td className="px-4 py-3 font-semibold text-neutral-800">{fmt(st.gross)}</td>
                                                        <td className="px-4 py-3 font-semibold text-neutral-800">{fmt(st.paye)}</td>
                                                        <td className="px-4 py-3 font-semibold text-neutral-800">{fmt(st.pension)}</td>
                                                        <td className="px-4 py-3 text-neutral-400">{fmt(st.nhf)}</td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-white">
                                                    <td className="px-4 py-3"><input placeholder="Enter name" className="w-full text-[12px] text-neutral-400 bg-transparent focus:outline-none" /></td>
                                                    <td className="px-4 py-3"><input placeholder="Enter NIN" className="w-full text-[12px] text-neutral-400 bg-transparent focus:outline-none" /></td>
                                                    <td className="px-4 py-3"><input placeholder="Enter salary" className="w-full text-[12px] text-neutral-400 bg-transparent focus:outline-none" /></td>
                                                    <td colSpan={3} />
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Footer */}
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-[12px] font-semibold text-neutral-500 mb-1">Total PAYE due this month</p>
                                            <p className="text-[24px] font-bold text-neutral-800">₦{totalPAYE.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {isFiled && (
                                                <button className="h-11 px-6 border border-neutral-300 text-neutral-800 font-bold rounded-xl hover:bg-neutral-50 transition-colors text-[13px]">
                                                    Download Return
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setShowPayeFilingModal(true)}
                                                className="h-11 px-6 bg-taxable-blue text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-[13px]">
                                                {isFiled ? 'File & Pay' : `File ${activeMonth} PAYE`}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );

                            return showMonthCol ? (
                                <div className="flex gap-6 w-full">
                                    {/* Month column */}
                                    <div className="w-[120px] flex-shrink-0 sticky top-24">
                                        {visibleMonths.map((m: string) => {
                                            const isActive = m === activeMonth;
                                            return (
                                                <button key={m} onClick={() => setActiveMonth(m)}
                                                    className={`w-full flex items-center gap-2.5 px-3 py-[9px] rounded-xl mb-0.5 text-left text-[13px] transition-all ${isActive
                                                        ? 'bg-[#F3F4F6] text-[#111827] font-bold'
                                                        : 'text-neutral-400 font-medium hover:bg-neutral-50'
                                                        }`}>
                                                    {isActive ? (
                                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <rect x="2" y="4" width="20" height="18" rx="2.5" fill="#111827" />
                                                            <circle cx="7.5" cy="14" r="1.3" fill="white" />
                                                            <circle cx="12" cy="14" r="1.3" fill="white" />
                                                            <circle cx="16.5" cy="14" r="1.3" fill="white" />
                                                            <circle cx="7.5" cy="18.5" r="1.3" fill="white" />
                                                            <circle cx="12" cy="18.5" r="1.3" fill="white" />
                                                            <rect x="7" y="1" width="2" height="5" rx="1" fill="#111827" />
                                                            <rect x="15" y="1" width="2" height="5" rx="1" fill="#111827" />
                                                        </svg>
                                                    ) : (
                                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#C9CDD6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                                            <rect x="2" y="4" width="20" height="18" rx="2.5" />
                                                            <line x1="2" y1="10" x2="22" y2="10" />
                                                            <line x1="8" y1="1" x2="8" y2="6" />
                                                            <line x1="16" y1="1" x2="16" y2="6" />
                                                            <circle cx="7.5" cy="14" r="0.8" fill="#C9CDD6" stroke="none" />
                                                            <circle cx="12" cy="14" r="0.8" fill="#C9CDD6" stroke="none" />
                                                            <circle cx="16.5" cy="14" r="0.8" fill="#C9CDD6" stroke="none" />
                                                            <circle cx="7.5" cy="18.5" r="0.8" fill="#C9CDD6" stroke="none" />
                                                        </svg>
                                                    )}
                                                    {m}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {/* Right content */}
                                    <div className="flex-1 min-w-0">
                                        {curStep === 'method' ? methodContent : tableContent}
                                    </div>
                                </div>
                            ) : (
                                // No month column — January first-time method selection
                                methodContent
                            );
                        })()}

                        {/* PAYE Annual Returns */}
                        {activeSection === 'paye' && payeSubSection === 'annual-returns' && (() => {
                            const ANNUAL_DATA = [
                                { month: 'January', deducted: 102000, remitted: 102000 },
                                { month: 'February', deducted: 105000, remitted: 105000 },
                                { month: 'March', deducted: 110000, remitted: 110000 },
                                { month: 'April', deducted: 110000, remitted: 110000 },
                                { month: 'May', deducted: 110000, remitted: 110000 },
                                { month: 'June', deducted: 110000, remitted: 110000 },
                                { month: 'July', deducted: 110000, remitted: 110000 },
                                { month: 'August', deducted: 110000, remitted: 110000 },
                                { month: 'September', deducted: 110000, remitted: 110000 },
                                { month: 'October', deducted: 110000, remitted: 110000 },
                                { month: 'November', deducted: 110000, remitted: 110000 },
                                { month: 'December', deducted: 110000, remitted: 110000 },
                            ];
                            const totalDeducted = ANNUAL_DATA.reduce((s, r) => s + r.deducted, 0);
                            const totalRemitted = ANNUAL_DATA.reduce((s, r) => s + r.remitted, 0);
                            const fmtN = (n: number) => `₦${n.toLocaleString()}`;
                            const CHECKS = [
                                'All 12 months filed (Jan - Dec 2025)',
                                `Total PAYE deducted: ${fmtN(totalDeducted)}`,
                                `Total PAYE remitted: ${fmtN(totalRemitted)}`,
                                'No discrepancies',
                            ];
                            return (
                                <div className="max-w-[620px] mx-auto animate-in fade-in duration-300">
                                    <h2 className="text-base font-bold text-neutral-800 mb-1">PAYE · Annual Returns (2026)</h2>
                                    <p className="text-[13px] text-neutral-500 font-medium mb-6">Your annual PAYE reconciliation</p>

                                    {/* Status check list */}
                                    <div className="space-y-3 mb-7">
                                        {CHECKS.map(c => (
                                            <div key={c} className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full bg-[#16A34A] flex items-center justify-center flex-shrink-0">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                </div>
                                                <span className="text-[14px] font-semibold text-neutral-800">{c}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-3 mb-6">
                                        <button className="h-11 px-6 border border-neutral-300 text-neutral-800 font-bold rounded-xl hover:bg-neutral-50 transition-colors text-[13px]">
                                            Download Return
                                        </button>
                                        <button className="h-11 px-6 bg-taxable-blue text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-[13px]">
                                            Submit Annual Return
                                        </button>
                                    </div>

                                    {/* Breakdown toggle */}
                                    <button
                                        onClick={() => setShowBreakdown(b => !b)}
                                        className="flex items-center gap-1.5 text-[13px] font-bold text-taxable-blue hover:opacity-80 transition-opacity mb-4">
                                        View Breakdown
                                        <svg
                                            width="14" height="14" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                                            className={`transition-transform ${showBreakdown ? 'rotate-180' : ''}`}>
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </button>

                                    {/* Breakdown table */}
                                    {showBreakdown && (
                                        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                                            <table className="w-full text-left text-[13px]">
                                                <thead className="bg-neutral-100 border-b border-neutral-100">
                                                    <tr>
                                                        <th className="px-5 py-3 font-bold text-neutral-500">Month</th>
                                                        <th className="px-5 py-3 font-bold text-neutral-500">PAYE Deducted</th>
                                                        <th className="px-5 py-3 font-bold text-neutral-500">PAYE Remitted</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-neutral-50">
                                                    {ANNUAL_DATA.map(row => (
                                                        <tr key={row.month} className="hover:bg-neutral-100 transition-colors">
                                                            <td className="px-5 py-3 font-medium text-neutral-700">{row.month}</td>
                                                            <td className="px-5 py-3 font-semibold text-neutral-800">{fmtN(row.deducted)}</td>
                                                            <td className="px-5 py-3 font-semibold text-neutral-800">{fmtN(row.remitted)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot className="border-t border-neutral-200 bg-neutral-100">
                                                    <tr>
                                                        <td className="px-5 py-3">
                                                            <p className="text-[11px] font-semibold text-neutral-500 mb-0.5">Total PAYE Deducted</p>
                                                            <p className="text-base font-bold text-neutral-800">{fmtN(totalDeducted)}</p>
                                                        </td>
                                                        <td colSpan={2} className="px-5 py-3">
                                                            <p className="text-[11px] font-semibold text-neutral-500 mb-0.5">PAYE Remitted</p>
                                                            <p className="text-base font-bold text-neutral-800">{fmtN(totalRemitted)}</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan={3} className="px-5 pb-4">
                                                            <div className="flex items-center gap-4">
                                                                <span className="flex items-center gap-1.5 text-[12px] font-bold text-green-600">
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                                    All months filed and paid
                                                                </span>
                                                                <span className="text-[#D1D5DB]">·</span>
                                                                <span className="flex items-center gap-1.5 text-[12px] font-bold text-green-600">
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                                    No discrepancies
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* VAT/WHT section */}
                        {activeSection === 'vat-wht' && (
                            <div className="animate-in fade-in duration-300 w-full">
                                <BusinessVATWHTContent
                                    activeSubMenu={vatWhtSubSection}
                                    onSubMenuChange={setVatWhtSubSection}
                                />
                            </div>
                        )}

                        {/* CIT section */}
                        {activeSection === 'company-income-tax' && (
                            <div className="animate-in fade-in duration-300 w-full">
                                <BusinessCITContent
                                    activeSubMenu={citSubSection}
                                    onSubMenuChange={setCitSubSection}
                                />
                            </div>
                        )}

                        {/* Review section */}
                        {activeSection === 'review' && (
                            <div className="animate-in fade-in duration-300 bg-white rounded-2xl border border-neutral-100 p-8 text-center">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-neutral-800 mb-2">Ready to file?</h3>
                                <p className="text-[14px] text-neutral-500 font-medium mb-6">
                                    Review your information and submit your company tax return.
                                </p>
                                <button
                                    onClick={() => router.push('/home')}
                                    className="h-12 px-10 bg-taxable-blue text-white font-bold rounded-xl hover:bg-taxable-blue/80 transition-colors text-[14px]"
                                >
                                    Submit Tax Return
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
