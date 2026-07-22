'use client';
import React, { useState, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// ── Constants ─────────────────────────────────────────────────────────────────
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

// Mock staff payroll data (gross = annual ₦)
const INITIAL_STAFF = [
    { id: 1, name: 'Adeyemi John Tunde', email: 'john.adeyemi@company.ng', phone: '+234 803 456', position: 'Senior Accountant', nationality: 'Nigerian', taxId: '12345678901', gross: 12_500_000, pensionOn: true, nhfOn: false },
    { id: 2, name: 'Ibrahim Sarah Amina', email: 'sarah.ibrahim@company.ng', phone: '+234 805 123', position: 'Marketing Manager', nationality: 'Nigerian', taxId: '23456789012', gross: 8_400_000, pensionOn: true, nhfOn: false },
    { id: 3, name: 'Okonkwo Chidi Prince', email: 'chidi.okonkwo@company.ng', phone: '+234 806 789', position: 'Software Engineer', nationality: 'Nigerian', taxId: '34567890123', gross: 15_000_000, pensionOn: true, nhfOn: false },
    { id: 4, name: 'Bello Fatima Zainab', email: 'fatima.bello@company.ng', phone: '+234 807 234', position: 'HR Officer', nationality: 'Nigerian', taxId: '45678901234', gross: 750_000, pensionOn: true, nhfOn: false },
    { id: 5, name: 'Olawale Biodun James', email: 'biodun.olawale@company.ng', phone: '+234 808 345', position: 'Sales Executive', nationality: 'Nigerian', taxId: '56789012345', gross: 22_000_000, pensionOn: true, nhfOn: false },
    { id: 6, name: 'Nnamdi Grace Chioma', email: 'grace.nnamdi@company.ng', phone: '+234 809 456', position: 'Admin Assistant', nationality: 'Nigerian', taxId: '67890123456', gross: 4_200_000, pensionOn: true, nhfOn: false },
    { id: 7, name: 'Musa Abdullahi Ahmed', email: 'abdullahi.musa@company.ng', phone: '+234 810 567', position: 'Operations Manager', nationality: 'Nigerian', taxId: '78901234567', gross: 1_800_000, pensionOn: true, nhfOn: false },
];

type Staff = typeof INITIAL_STAFF[number];

// ── PAYE Calculation (2026 Nigeria Tax Act) ─────────────────────────
const PAYE_BANDS = [
    { limit: 800_000, rate: 0.00 },
    { limit: 3_000_000, rate: 0.15 },
    { limit: 12_000_000, rate: 0.18 },
    { limit: 25_000_000, rate: 0.21 },
    { limit: 50_000_000, rate: 0.23 },
    { limit: Infinity, rate: 0.25 },
];

function calcMonthlyPAYE(annualGross: number, pensionOn: boolean, nhfOn: boolean): number {
    const pension = pensionOn ? annualGross * 0.08 : 0;
    const nhf = nhfOn ? annualGross * 0.025 : 0;
    const taxable = Math.max(0, annualGross - pension - nhf);

    let remaining = taxable;
    let tax = 0;
    let prev = 0;
    for (const band of PAYE_BANDS) {
        if (remaining <= 0) break;
        const slice = Math.min(remaining, band.limit - prev);
        tax += slice * band.rate;
        remaining -= slice;
        prev = band.limit;
    }
    return Math.round(tax / 12);
}

function fmtN(n: number) {
    return `₦${Math.round(n).toLocaleString()}`;
}

// ── Add Staff Modal ───────────────────────────────────────────────────────────
const AddStaffModal = ({ onClose, onAdd }: { onClose: () => void; onAdd: (s: Staff) => void }) => {
    const [form, setForm] = useState({ name: '', email: '', phone: '', position: '', nationality: 'Nigerian', taxId: '', gross: '' });
    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

    const handleAdd = () => {
        if (!form.name || !form.gross) return;
        onAdd({ id: Date.now(), ...form, gross: Number(form.gross.replace(/,/g, '')), pensionOn: true, nhfOn: false });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl w-full max-w-[480px] p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-3 font-semibold text-neutral-800 mb-5">Add staff member</h3>
                <div className="grid grid-cols-2 gap-4 mb-5">
                    {([
                        ['name', 'Full name'], ['email', 'Email'], ['phone', 'Phone'], ['position', 'Job position'],
                        ['taxId', 'JRB Tax ID'], ['gross', 'Annual gross income (₦)'],
                    ] as [keyof typeof form, string][]).map(([k, label]) => (
                        <div key={k}>
                            <label className="block text-2 font-semibold text-neutral-500 mb-1">{label}</label>
                            <Input
                                type="text"
                                value={form[k]}
                                onChange={set(k)}
                                placeholder={label}
                            />
                        </div>
                    ))}
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 h-12 border border-neutral-200 bg-white text-neutral-800 font-semibold rounded-xl text-3">Cancel</button>
                    <button onClick={handleAdd} className="flex-1 h-12 bg-taxable-blue text-white font-semibold rounded-xl text-3 flex items-center justify-center gap-2">Add staff</button>
                </div>
            </div>
        </div>
    );
};

// ── Filing Modal ──────────────────────────────────────────────────────────────
const FilingModal = ({
    month: _month, onClose, onFile,
}: { month: string; onClose: () => void; onFile: () => void }) => {
    const [method, setMethod] = useState<'download' | 'taxable' | 'accountant'>('download');

    const OPTIONS: { id: typeof method; label: string; desc: string }[] = [
        { id: 'download', label: 'Download forms (Free)', desc: 'Download pre-filled FIRS forms and file yourself.' },
        { id: 'taxable', label: 'Let Taxable file for you (₦8,000)', desc: 'We submit your return directly to FIRS.' },
        { id: 'accountant', label: 'Get accountant review first (₦25,000)', desc: 'A licensed accountant reviews before filing.' },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white h-full w-full max-w-[380px] shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-neutral-100">
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full  transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-taxable-dark">
                            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                        </svg>
                    </button>
                    <h3 className="text-3 font-semibold text-neutral-800">How do you want to file?</h3>
                </div>

                {/* Options */}
                <div className="flex-1 px-6 py-5 space-y-0">
                    {OPTIONS.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setMethod(opt.id)}
                            className="w-full flex items-start gap-3 py-4 text-left"
                        >
                            {/* Radio */}
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${method === opt.id ? 'border-taxable-blue' : 'border-neutral-300'}`}>
                                {method === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-taxable-blue" />}
                            </div>
                            <div>
                                <p className="text-3 font-semibold text-neutral-800 mb-0.5">{opt.label}</p>
                                <p className="text-2 text-neutral-500 font-medium leading-relaxed">{opt.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex gap-3 border-t border-neutral-100 pt-4">
                    <button onClick={onClose} className="flex-1 h-12 border border-neutral-200 bg-white text-neutral-800 font-semibold rounded-xl text-3">Back</button>
                    <button onClick={onFile} className="flex-[2] h-12 bg-taxable-blue text-white font-semibold rounded-xl text-3 flex items-center justify-center gap-2">Continue</button>
                </div>
            </div>
        </div>
    );
};

// ── Main component ────────────────────────────────────────────────────────────
export default function BusinessPAYE() {
    const router = useRouter();

    const [view, setView] = useState<'monthly' | 'annual'>('monthly');
    const [step, setStep] = useState<'method' | 'table'>('method');
    const [entryMethod, setEntryMethod] = useState<'manual' | 'csv' | 'software'>('manual');
    const [activeMonth, setActiveMonth] = useState(0); // 0 = January
    const [filedMonths, setFiledMonths] = useState<Set<number>>(new Set());

    const [staff, setStaff] = useState<Staff[]>(INITIAL_STAFF);
    const [showAddStaff, setShowAddStaff] = useState(false);
    const [showFilingModal, setShowFilingModal] = useState(false);

    // Annual Returns state
    const [payerId, setPayerId] = useState('');
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [breakdownTab, setBreakdownTab] = useState<'monthly' | 'levy'>('monthly');

    const togglePension = (id: number) => setStaff(s => s.map(e => e.id === id ? { ...e, pensionOn: !e.pensionOn } : e));
    const toggleNhf = (id: number) => setStaff(s => s.map(e => e.id === id ? { ...e, nhfOn: !e.nhfOn } : e));

    const totalPAYE = staff.reduce((sum, e) => sum + calcMonthlyPAYE(e.gross, e.pensionOn, e.nhfOn), 0);

    const handleFile = () => {
        setFiledMonths(prev => new Set([...prev, activeMonth]));
        setShowFilingModal(false);
        // Advance to next month
        if (activeMonth < 11) setActiveMonth(m => m + 1);
    };

    const ENTRY_OPTIONS: { id: typeof entryMethod; label: string; disabled?: boolean }[] = [
        { id: 'manual', label: 'Manual entry (add staff one by one)' },
        { id: 'csv', label: 'Upload CSV/Excel (bulk upload)', disabled: true },
        { id: 'software', label: 'Connect payroll software (QuickBooks, Zoho)', disabled: true },
    ];

    const contentRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            gsap.set('[data-animate]', { opacity: 1, y: 0, clearProps: 'all' });
            return;
        }
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
                }
            );
        }, contentRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={contentRef} className="min-h-screen bg-white pb-20">
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
                        <span>2026 Company Tax</span><span>/</span>
                        <span className="text-neutral-300">{view === 'monthly' ? 'PAYE · Monthly Filing' : 'PAYE · Annual Returns'}</span>
                    </div>
                </div>
            </div>

            {showAddStaff && (
                <AddStaffModal
                    onClose={() => setShowAddStaff(false)}
                    onAdd={s => setStaff(prev => [...prev, s])}
                />
            )}
            {showFilingModal && (
                <FilingModal
                    month={MONTHS[activeMonth]}
                    onClose={() => setShowFilingModal(false)}
                    onFile={handleFile}
                />
            )}

            <main className="max-w-[1200px] mx-auto px-4 md:px-6 pt-14 pb-8">

                {/* Page title + tab toggle */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-7 font-semibold text-neutral-800">Pay As You Earn (PAYE)</h1>
                    {step === 'table' && (
                        <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-white">
                            <button
                                onClick={() => { setView('monthly'); setStep('method'); }}
                                className={`px-4 py-2 text-3 font-semibold transition-colors ${view === 'monthly' ? 'bg-neutral-800 text-white' : 'text-neutral-500 '}`}
                            >
                                Monthly Filing
                            </button>
                            <button
                                onClick={() => setView('annual')}
                                className={`px-4 py-2 text-3 font-semibold transition-colors ${view === 'annual' ? 'bg-neutral-800 text-white' : 'text-neutral-500 '}`}
                            >
                                Annual Returns
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Step: Method selection ── */}
                {view === 'monthly' && step === 'method' && (
                    <div data-animate className="max-w-[480px] mx-auto">
                        <h2 className="text-6 font-semibold text-neutral-800 mb-1">How do you want to add payroll data?</h2>
                        <p className="text-3 text-neutral-500 font-medium mb-6">Upload or enter your payroll for this month</p>

                        <RadioGroup value={entryMethod} onValueChange={(v) => setEntryMethod(v as 'manual' | 'csv' | 'software')} className="space-y-0 mb-8">
                            {ENTRY_OPTIONS.map(opt => (
                                <label key={opt.id} className={`flex items-center gap-3 py-3.5 cursor-pointer ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                    <RadioGroupItem value={opt.id} disabled={opt.disabled} />
                                    <span className="text-3 font-medium text-neutral-800">{opt.label}</span>
                                </label>
                            ))}
                        </RadioGroup>

                        <button
                            onClick={() => setStep('table')}
                            className="h-12 px-8 bg-taxable-blue text-white font-semibold rounded-xl text-3 flex items-center justify-center gap-2"
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* ── Step: Payroll table ── */}
                {view === 'monthly' && step === 'table' && (
                    <div data-animate>
                        {/* Month tabs */}
                        <div className="flex items-center gap-0 mb-6 overflow-x-auto no-scrollbar">
                            {MONTHS.map((m, i) => {
                                const filed = filedMonths.has(i);
                                const isActive = i === activeMonth;
                                return (
                                    <button
                                        key={m}
                                        onClick={() => setActiveMonth(i)}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-3 font-semibold whitespace-nowrap transition-all ${isActive
                                            ? 'bg-neutral-100 text-neutral-800'
                                            : 'text-neutral-400'
                                            }`}
                                    >
                                        {filed ? (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        ) : (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                            </svg>
                                        )}
                                        {m.slice(0, 3)}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Table header */}
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-3 font-semibold text-neutral-800">
                                Staff Payroll ({MONTHS[activeMonth]} 2026)
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowAddStaff(true)}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-2 font-semibold text-taxable-blue border border-taxable-blue/20"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    Add staff
                                </button>
                                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-2 font-semibold text-neutral-800 border border-neutral-200">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Edit staff
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden mb-6">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-2">
                                    <thead className="bg-neutral-100 border-b border-neutral-100">
                                        <tr>
                                            {['Surname', 'Email Address', 'Phone number', 'Job position', 'Nationality', 'JRB Tax ID', 'Gross income'].map(col => (
                                                <th key={col} className="px-4 py-3 font-semibold text-neutral-500 whitespace-nowrap">{col}</th>
                                            ))}
                                            {/* Pension checkbox header */}
                                            <th className="px-4 py-3 font-semibold text-neutral-500 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-3.5 h-3.5 rounded border-2 border-taxable-blue bg-taxable-blue flex items-center justify-center flex-shrink-0">
                                                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                                                            <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </div>
                                                    Pension (8%)
                                                </div>
                                            </th>
                                            {/* NHF checkbox header */}
                                            <th className="px-4 py-3 font-semibold text-neutral-500 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-3.5 h-3.5 rounded border-2 border-neutral-300 bg-white flex-shrink-0" />
                                                    NHF (2.5%)
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 font-semibold text-neutral-500 whitespace-nowrap">Chargeable income</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-50">
                                        {staff.map(emp => {
                                            const pension = emp.pensionOn ? Math.round(emp.gross * 0.08) : 0;
                                            const nhf = emp.nhfOn ? Math.round(emp.gross * 0.025) : 0;
                                            const chargeable = Math.max(0, emp.gross - pension - nhf);
                                            return (
                                                <tr key={emp.id} className="">
                                                    <td className="px-4 py-3 font-semibold text-neutral-800 whitespace-nowrap">{emp.name}</td>
                                                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">{emp.email}</td>
                                                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">{emp.phone}</td>
                                                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">{emp.position}</td>
                                                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">{emp.nationality}</td>
                                                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">{emp.taxId}</td>
                                                    <td className="px-4 py-3 font-semibold text-neutral-800 whitespace-nowrap">{fmtN(emp.gross)}</td>
                                                    {/* Pension */}
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => togglePension(emp.id)}
                                                                className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${emp.pensionOn ? 'border-taxable-blue bg-taxable-blue' : 'border-neutral-300 bg-white'}`}
                                                            >
                                                                {emp.pensionOn && (
                                                                    <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                                                                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                            <span className={`font-semibold ${emp.pensionOn ? 'text-neutral-800' : 'text-neutral-400'}`}>{fmtN(pension)}</span>
                                                        </div>
                                                    </td>
                                                    {/* NHF */}
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => toggleNhf(emp.id)}
                                                                className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${emp.nhfOn ? 'border-taxable-blue bg-taxable-blue' : 'border-neutral-300 bg-white'}`}
                                                            >
                                                                {emp.nhfOn && (
                                                                    <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                                                                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                            <span className={`font-semibold ${emp.nhfOn ? 'text-neutral-800' : 'text-neutral-400'}`}>{fmtN(nhf)}</span>
                                                        </div>
                                                    </td>
                                                    {/* Chargeable */}
                                                    <td className="px-4 py-3 font-semibold text-neutral-800 whitespace-nowrap">{fmtN(chargeable)}</td>
                                                </tr>
                                            );
                                        })}

                                        {/* Empty input row */}
                                        <tr className="bg-neutral-50">
                                            {['Enter name', 'Enter salary', 'Enter salary', 'Enter N/N', 'Enter salary', 'Enter salary', 'Enter salary', '', '', 'Enter salary'].map((ph, i) => (
                                                <td key={i} className="px-4 py-3">
                                                    {ph ? (
                                                        <input
                                                            type="text"
                                                            placeholder={ph}
                                                            className="w-full bg-transparent text-2 font-medium text-neutral-400 placeholder:text-neutral-300 border-none outline-none"
                                                        />
                                                    ) : <div className="w-6" />}
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Footer bar */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2 font-semibold text-neutral-500 mb-0.5">Total PAYE due this month</p>
                                <p className="text-7 font-semibold text-neutral-800">{fmtN(totalPAYE)}</p>
                            </div>
                            <button
                                onClick={() => setShowFilingModal(true)}
                                className="h-12 px-6 bg-taxable-blue text-white font-semibold rounded-xl text-3 flex items-center justify-center gap-2"
                            >
                                File {MONTHS[activeMonth].slice(0, 3)} PAYE
                            </button>
                        </div>
                    </div>
                )}


                {/* ── Annual Returns ── */}
                {view === 'annual' && (() => {
                    // Derive annual totals from staff
                    const totalAnnualPAYE = staff.reduce((s, e) => s + calcMonthlyPAYE(e.gross, e.pensionOn, e.nhfOn) * 12, 0);
                    const totalGrossPayroll = staff.reduce((s, e) => s + e.gross, 0);
                    // Monthly breakdown – same payroll each month for mock
                    const monthlyGross = totalGrossPayroll / 12;
                    const monthlyPAYE = totalAnnualPAYE / 12;
                    const FILED_DATES = ['Feb 8', 'Mar 10', 'Apr 7', 'May 9', 'Jun 8', 'Jul 10', 'Aug 6', 'Sep 9', 'Oct 8', 'Nov 7', 'Dec 10', 'Jan 9, 2027'];
                    // Development Levy – 4% on chargeable income > ₦1,000,000
                    const levyStaff = staff
                        .map(e => {
                            const pension = e.pensionOn ? e.gross * 0.08 : 0;
                            const nhf = e.nhfOn ? e.gross * 0.025 : 0;
                            const chargeable = Math.max(0, e.gross - pension - nhf);
                            return { name: e.name.split(' ').slice(0, 2).join(' '), chargeable, levy: chargeable > 1_000_000 ? Math.round(chargeable * 0.04) : 0 };
                        })
                        .filter(e => e.levy > 0);
                    const totalLevy = levyStaff.reduce((s, e) => s + e.levy, 0);

                    return (
                        <div data-animate className="max-w-[680px] mx-auto">
                            {/* Title */}
                            <h2 className="text-6 font-semibold text-neutral-800 mb-1">PAYE · Annual Returns (2026)</h2>
                            <p className="text-3 text-neutral-500 font-medium mb-6">Your annual PAYE reconciliation is ready</p>

                            {/* Summary bullets */}
                            <div className="space-y-3 mb-7">
                                {[
                                    `${staff.length} employees`,
                                    `${staff.length * 12} months of payroll data (${staff.length} staffs x 12 months)`,
                                    `Total PAYE remitted: ${fmtN(totalAnnualPAYE)}`,
                                    `Total Development Levy: ${fmtN(totalLevy)}`,
                                    'No discrepancies',
                                ].map((line, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                        <span className="text-3 font-semibold text-neutral-800">
                                            {line.includes('months of payroll data') ? (
                                                <>
                                                    {`${staff.length * 12} months of payroll data `}
                                                    <span className="text-neutral-500 font-medium">({staff.length} staffs x 12 months)</span>
                                                </>
                                            ) : line}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Payer ID */}
                            <div className="mb-6">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <label className="text-3 font-semibold text-neutral-800">Payer ID</label>
                                    <div className="relative group">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-neutral-400" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                                        </svg>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-neutral-800 text-white text-1 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 font-medium">
                                            Your company's State IRS (Internal Revenue Service) ID, obtained from your state tax authority.
                                        </div>
                                    </div>
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Enter Your Company's State IRS ID"
                                    value={payerId}
                                    onChange={e => setPayerId(e.target.value)}
                                />
                                <div className="flex items-center gap-1 mt-2">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-neutral-400" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                                    </svg>
                                    <p className="text-2 text-neutral-400 font-medium">
                                        Don't have an IRS ID?{' '}
                                        <a href="#" className="text-taxable-blue font-semibold hover:underline">Apply here</a>
                                    </p>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-3 mb-8">
                                <button className="flex-1 h-12 border border-neutral-300 text-neutral-800 font-semibold rounded-xl text-3">
                                    Download Return
                                </button>
                                <button className="flex-1 h-12 bg-taxable-blue text-white font-semibold rounded-xl text-3 flex items-center justify-center gap-2">
                                    Submit to LIRS
                                </button>
                            </div>

                            {/* View Breakdown toggle */}
                            <button
                                onClick={() => setShowBreakdown(s => !s)}
                                className="flex items-center gap-1.5 text-3 font-semibold text-taxable-blue mb-4"
                            >
                                View Breakdown
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                                    className={`transition-transform duration-200 ${showBreakdown ? 'rotate-180' : ''}`}>
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>

                            {showBreakdown && (
                                <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    {/* Tabs */}
                                    <div className="flex border-b border-neutral-100">
                                        {(['monthly', 'levy'] as const).map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => setBreakdownTab(tab)}
                                                className={`flex-1 py-3.5 text-3 font-semibold transition-colors border-b-2 ${breakdownTab === tab
                                                    ? 'border-taxable-blue text-taxable-blue'
                                                    : 'border-transparent text-neutral-400'
                                                    }`}
                                            >
                                                {tab === 'monthly' ? 'Monthly Breakdown' : 'Development Levy'}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Monthly Breakdown tab */}
                                    {breakdownTab === 'monthly' && (
                                        <div>
                                            <table className="w-full text-left text-3">
                                                <thead className="bg-neutral-100 border-b border-neutral-100">
                                                    <tr>
                                                        {['Month', 'Gross Payroll', 'PAYE Due', 'Date Filed', 'Status'].map(h => (
                                                            <th key={h} className="px-5 py-3 font-semibold text-neutral-500">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-neutral-50">
                                                    {MONTHS.map((m, i) => (
                                                        <tr key={m} className="">
                                                            <td className="px-5 py-3 font-semibold text-neutral-800">{m}</td>
                                                            <td className="px-5 py-3 text-neutral-800 font-medium">{fmtN(monthlyGross)}</td>
                                                            <td className="px-5 py-3 text-neutral-800 font-medium">{fmtN(monthlyPAYE)}</td>
                                                            <td className="px-5 py-3 text-neutral-500">{FILED_DATES[i]}</td>
                                                            <td className="px-5 py-3">
                                                                <span className="flex items-center gap-1 text-green-600 font-semibold">
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                        <polyline points="20 6 9 17 4 12" />
                                                                    </svg>
                                                                    Paid
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {/* Footer */}
                                            <div className="px-5 py-4 border-t border-neutral-100 flex items-center justify-between">
                                                <div className="flex gap-8">
                                                    <div>
                                                        <p className="text-1 font-semibold text-neutral-500 mb-0.5">Total Gross</p>
                                                        <p className="text-5 font-semibold text-neutral-800">{fmtN(totalGrossPayroll)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-1 font-semibold text-neutral-500 mb-0.5">PAYE Remitted</p>
                                                        <p className="text-5 font-semibold text-neutral-800">{fmtN(totalAnnualPAYE)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-2 font-semibold text-green-600">
                                                    <span className="flex items-center gap-1">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                        All months filed and paid
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                        No discrepancies
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Development Levy tab */}
                                    {breakdownTab === 'levy' && (
                                        <div className="p-5">
                                            <p className="text-3 text-neutral-500 font-medium leading-relaxed mb-5">
                                                Development Levy is a <strong className="text-neutral-800">4%</strong> additional tax on employees with annual chargeable income above ₦1,000,000.{' '}
                                                <strong className="text-neutral-800">{levyStaff.length} out of {staff.length} employees</strong> qualify for Development Levy
                                            </p>
                                            <table className="w-full text-left text-3 mb-5">
                                                <thead className="border-b border-neutral-100">
                                                    <tr>
                                                        {['Employee Name', 'Chargeable Income', 'Levy'].map(h => (
                                                            <th key={h} className="pb-2 font-semibold text-neutral-500">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-neutral-50">
                                                    {levyStaff.map((e, i) => (
                                                        <tr key={i} className="">
                                                            <td className="py-3 font-semibold text-neutral-800">{e.name}</td>
                                                            <td className="py-3 text-neutral-800 font-medium">{fmtN(e.chargeable)}</td>
                                                            <td className="py-3 font-semibold text-neutral-800">{fmtN(e.levy)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <div className="border-t border-neutral-100 pt-4">
                                                <p className="text-2 font-semibold text-neutral-500 mb-1">Total Levy</p>
                                                <p className="text-7 font-semibold text-neutral-800">{fmtN(totalLevy)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })()}
            </main>
        </div>
    );
}
