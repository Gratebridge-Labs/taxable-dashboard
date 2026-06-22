'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';

// ── Constants ─────────────────────────────────────────────────────────────────
const MONTHS_SHORT = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const EXEMPT_CATEGORIES = [
    'Select',
    'Medical / Healthcare',
    'Educational materials',
    'Basic food items',
    'Financial services',
    'Transportation',
    'Rent (residential)',
    'None / Not applicable',
];

const VAT_RATE = 0.075;

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) => `₦${Math.round(n).toLocaleString()}`;

const HintIcon = ({ tip }: { tip: string }) => (
    <div className="relative group inline-flex items-center ml-1">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-gray-800 text-white text-[11px] leading-snug rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40 font-medium">
            {tip}
        </div>
    </div>
);

// ── Left sidebar ──────────────────────────────────────────────────────────────
const LeftSidebar = ({
    activeSubSection, onSubSection, router,
}: {
    activeSubSection: string;
    onSubSection: (s: string) => void;
    router: ReturnType<typeof useRouter>;
}) => {
    const NAV = [
        { key: 'company-info', label: 'Company Information', route: '/tax-folders/business' },
        { key: 'paye', label: 'PAYE', route: '/tax-folders/business-paye' },
        {
            key: 'vat-wht', label: 'VAT/WHT', route: null,
            children: [
                { key: 'file-vat', label: 'File Monthly VAT Return' },
                { key: 'remit-wht', label: 'Remit Monthly WHT' },
                { key: 'wht-balance', label: 'WHT Credit Notes' },
            ],
        },
        { key: 'cit', label: 'Company Income Tax', route: '/tax-folders/business' },
    ];

    return (
        <div className="w-[220px] flex-shrink-0 flex flex-col gap-4 sticky top-24">
            <div>
                <div className="flex items-center justify-between mb-2 px-1">
                    <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Select</p>
                    <button className="flex items-center gap-1 text-[11px] font-bold text-[#003787] hover:opacity-70 transition-opacity">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Edit section
                    </button>
                </div>
                <div>
                    {NAV.map(item => {
                        const isExpanded = item.key === 'vat-wht';
                        const isActive = item.key === 'vat-wht';
                        return (
                            <div key={item.key}>
                                <button
                                    onClick={() => item.route && router.push(item.route)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all mb-0.5 ${isActive ? 'hover:bg-gray-50' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-center gap-3 text-left">
                                        <span className="text-lg leading-none">📁</span>
                                        <span className={`text-[13px] font-semibold ${isActive ? 'text-[#0C0C0E]' : 'text-[#374151]'}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                    {isExpanded ? (
                                        <svg className="w-3.5 h-3.5 text-[#0C0C0E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <polyline points="18 15 12 9 6 15" />
                                        </svg>
                                    ) : (
                                        <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    )}
                                </button>
                                {/* Sub-items for VAT/WHT */}
                                {isExpanded && item.children && (
                                    <div className="ml-9 mb-1">
                                        {item.children.map(child => (
                                            <button
                                                key={child.key}
                                                onClick={() => onSubSection(child.key)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-[12.5px] font-semibold transition-colors mb-0.5 ${activeSubSection === child.key
                                                    ? 'text-[#0C0C0E] bg-[#F1F5F9]'
                                                    : 'text-[#6B7280] hover:text-[#374151] hover:bg-gray-50'}`}
                                            >
                                                {child.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Book accountant */}
            <div className="bg-white rounded-[16px] p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                    </svg>
                    <h4 className="text-[13px] font-bold text-[#0C0C0E]">Need expert eyes on your return?</h4>
                </div>
                <p className="text-[12px] text-[#6B7280] font-medium leading-relaxed mb-4">
                    Get your return reviewed by a certified tax accountant. They'll ensure accuracy, compliance, and file for you.
                </p>
                <button className="w-full py-2.5 bg-white border border-gray-200 rounded-xl text-[12px] font-bold text-[#0C0C0E] hover:bg-gray-50 transition-all">
                    Book Accountant (₦15,000)
                </button>
            </div>
        </div>
    );
};

// ── Filing Modal ──────────────────────────────────────────────────────────────
const FilingModal = ({ onClose, onFile }: { onClose: () => void; onFile: () => void }) => {
    const [method, setMethod] = useState<'download' | 'taxable' | 'accountant'>('download');
    const OPTIONS = [
        { id: 'download' as const, label: 'Download forms (Free)', desc: 'Download pre-filled FIRS forms and file yourself.' },
        { id: 'taxable' as const, label: 'Let Taxable file for you (₦8,000)', desc: 'We submit your return directly to FIRS.' },
        { id: 'accountant' as const, label: 'Get accountant review first (₦25,000)', desc: 'A licensed accountant reviews before filing.' },
    ];
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white h-full w-full max-w-[380px] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100">
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0C0C0E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                        </svg>
                    </button>
                    <h3 className="text-[16px] font-bold text-[#0C0C0E]">How do you want to file?</h3>
                </div>
                <div className="flex-1 px-6 py-5">
                    {OPTIONS.map(opt => (
                        <button key={opt.id} onClick={() => setMethod(opt.id)} className="w-full flex items-start gap-3 py-4 text-left">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${method === opt.id ? 'border-[#003787]' : 'border-gray-300'}`}>
                                {method === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-[#003787]" />}
                            </div>
                            <div>
                                <p className="text-[14px] font-semibold text-[#0C0C0E] mb-0.5">{opt.label}</p>
                                <p className="text-[12px] text-[#6B7280] font-medium leading-relaxed">{opt.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
                <div className="px-6 pb-6 flex gap-3 border-t border-gray-100 pt-4">
                    <button onClick={onClose} className="flex-1 h-11 border border-gray-200 rounded-xl text-[14px] font-bold text-[#0C0C0E] hover:bg-gray-50 transition-colors">Back</button>
                    <button onClick={onFile} className="flex-[2] h-11 bg-[#003787] text-white rounded-xl text-[14px] font-bold hover:opacity-90 transition-opacity">Continue</button>
                </div>
            </div>
        </div>
    );
};

// ── VAT Form ──────────────────────────────────────────────────────────────────
interface MonthVATData {
    totalSales: string;
    zeroRated: string;
    exempt: string;
    totalPurchases: string;
    filed: boolean;
}

const defaultMonth = (): MonthVATData => ({
    totalSales: '', zeroRated: '', exempt: 'Select', totalPurchases: '', filed: false,
});

// ── Shared Month Tab Column ───────────────────────────────────────────────────
const MonthTabCol = ({ activeMonth, setActiveMonth, filedMonths }: {
    activeMonth: number; setActiveMonth: (i: number) => void; filedMonths: Set<number>;
}) => (
    <div className="flex flex-col gap-0 w-[110px] flex-shrink-0 sticky top-24">
        {MONTHS_SHORT.slice(0, 3).map((m, i) => {
            const filed = filedMonths.has(i);
            const isActive = i === activeMonth;
            return (
                <button key={m} onClick={() => setActiveMonth(i)}
                    className={`flex items-center gap-2 px-2 py-2.5 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-all ${isActive ? 'bg-[#F1F5F9] text-[#0C0C0E]' : 'text-[#9CA3AF] hover:text-[#6B7280]'}`}>
                    {filed
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
                    {m.slice(0, 3)}
                </button>
            );
        })}
    </div>
);

// ── WHT Type options ──────────────────────────────────────────────────────────
const WHT_TYPES = [
    'Select',
    'WHT on Services (5%)',
    'WHT on Rent (10%)',
    'WHT on Dividends (10%)',
    'WHT on Interest (10%)',
    'WHT on Royalties (10%)',
    'WHT on Construction (2.5%)',
    'WHT on Haulage (5%)',
];

// ── WHT Deduction Form ────────────────────────────────────────────────────────
interface WHTDeduction {
    id: number;
    payee: string; tin: string; whtType: string;
    gross: string; whtRate: string; whtDeducted: string; netPaid: string; date: string;
}

const defaultDeduction = (): Omit<WHTDeduction, 'id'> => ({
    payee: '', tin: '', whtType: 'Select',
    gross: '', whtRate: '', whtDeducted: 'Select', netPaid: '', date: '',
});

const WHTDeductionForm = ({ onSave, onCancel, initial }: {
    onSave: (d: Omit<WHTDeduction, 'id'>) => void;
    onCancel: () => void;
    initial?: Omit<WHTDeduction, 'id'>;
}) => {
    const [form, setForm] = useState(initial ?? defaultDeduction());
    const set = (k: keyof typeof form) => (val: string) => setForm(f => ({ ...f, [k]: val }));

    // Auto-compute WHT deducted and net paid from gross + type
    const grossNum = Number(form.gross.replace(/,/g, '')) || 0;
    const rateMatch = form.whtType.match(/(\d+(?:\.\d+)?)%/);
    const autoRate = rateMatch ? Number(rateMatch[1]) : 0;
    const autoWHT = grossNum * autoRate / 100;
    const autoNet = grossNum - autoWHT;

    return (
        <div>
            <h2 className="text-base font-bold text-[#0C0C0E] mb-5">Add WHT Deduction</h2>

            {/* Payee Details */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
                <h3 className="text-[13px] font-bold text-[#0C0C0E] mb-4">Payee Details (who you paid)</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="flex items-center text-[12px] font-bold text-[#6B7280] mb-1.5">
                            Name <HintIcon tip="Full legal name or company name of the vendor/payee." />
                        </label>
                        <input type="text" placeholder="N0" value={form.payee}
                            onChange={e => set('payee')(e.target.value)}
                            className="w-full h-10 border border-gray-200 bg-[#F9FAFB] rounded-xl px-3 text-[13px] font-medium text-[#0C0C0E] placeholder:text-gray-300 focus:outline-none focus:border-[#003787]/40" />
                    </div>
                    <div>
                        <label className="flex items-center text-[12px] font-bold text-[#6B7280] mb-1.5">
                            TIN <HintIcon tip="Tax Identification Number of the payee." />
                        </label>
                        <input type="text" placeholder="N0" value={form.tin}
                            onChange={e => set('tin')(e.target.value)}
                            className="w-full h-10 border border-gray-200 bg-[#F9FAFB] rounded-xl px-3 text-[13px] font-medium text-[#0C0C0E] placeholder:text-gray-300 focus:outline-none focus:border-[#003787]/40" />
                    </div>
                </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
                <h3 className="text-[13px] font-bold text-[#0C0C0E] mb-4">Payment Details</h3>
                <div className="space-y-3">
                    {/* WHT Type */}
                    <div className="flex items-center justify-between gap-4">
                        <label className="flex items-center text-[13px] font-semibold text-[#374151] whitespace-nowrap flex-shrink-0">
                            WHT Type <HintIcon tip="The type of transaction determines the applicable WHT rate." />
                        </label>
                        <div className="relative w-[220px] flex-shrink-0">
                            <select value={form.whtType} onChange={e => set('whtType')(e.target.value)}
                                className="w-full h-10 border border-gray-200 bg-[#F9FAFB] rounded-xl px-3 text-[13px] font-medium text-[#0C0C0E] focus:outline-none appearance-none">
                                {WHT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                        </div>
                    </div>
                    {/* Gross payment */}
                    <div className="flex items-center justify-between gap-4">
                        <label className="flex items-center text-[13px] font-semibold text-[#374151] whitespace-nowrap flex-shrink-0">
                            Gross payment <HintIcon tip="Total amount paid before deducting WHT." />
                        </label>
                        <input type="text" placeholder="N0" value={form.gross}
                            onChange={e => set('gross')(e.target.value.replace(/[^0-9.]/g, ''))}
                            className="w-[220px] flex-shrink-0 h-10 border border-gray-200 bg-[#F9FAFB] rounded-xl px-3 text-[13px] font-medium text-[#0C0C0E] placeholder:text-gray-300 focus:outline-none focus:border-[#003787]/40" />
                    </div>
                    {/* WHT rate */}
                    <div className="flex items-center justify-between gap-4">
                        <label className="flex items-center text-[13px] font-semibold text-[#374151] whitespace-nowrap flex-shrink-0">
                            WHT rate <HintIcon tip="Applicable Withholding Tax rate set by FIRS." />
                        </label>
                        <div className="w-[220px] flex-shrink-0 h-10 border border-gray-200 bg-[#F9FAFB] rounded-xl px-3 flex items-center text-[13px] font-medium text-[#6B7280]">
                            {autoRate > 0 ? `${autoRate}%` : 'Select type above'}
                        </div>
                    </div>
                    {/* WHT deducted */}
                    <div className="flex items-center justify-between gap-4">
                        <label className="flex items-center text-[13px] font-semibold text-[#374151] whitespace-nowrap flex-shrink-0">
                            WHT deducted <HintIcon tip="Auto-calculated: Gross × WHT rate." />
                        </label>
                        <div className="w-[220px] flex-shrink-0 h-10 border border-gray-200 bg-[#F9FAFB] rounded-xl px-3 flex items-center text-[13px] font-medium text-[#0C0C0E]">
                            {autoWHT > 0 ? `₦${Math.round(autoWHT).toLocaleString()}` : 'Select'}
                        </div>
                    </div>
                    {/* Net paid */}
                    <div className="flex items-center justify-between gap-4">
                        <label className="flex items-center text-[13px] font-semibold text-[#374151] whitespace-nowrap flex-shrink-0">
                            Net paid to payee <HintIcon tip="Amount actually remitted: Gross minus WHT." />
                        </label>
                        <div className="w-[220px] flex-shrink-0 h-10 border border-gray-200 bg-[#F9FAFB] rounded-xl px-3 flex items-center text-[13px] font-medium text-[#0C0C0E]">
                            {autoNet > 0 ? `₦${Math.round(autoNet).toLocaleString()}` : 'N0'}
                        </div>
                    </div>
                    {/* Date */}
                    <div className="flex items-center justify-between gap-4">
                        <label className="flex items-center text-[13px] font-semibold text-[#374151] whitespace-nowrap flex-shrink-0">
                            Date of payment <HintIcon tip="The date when payment was made to the vendor." />
                        </label>
                        <input type="text" placeholder="dd/mm/yyyy" value={form.date}
                            onChange={e => set('date')(e.target.value)}
                            className="w-[220px] flex-shrink-0 h-10 border border-gray-200 bg-[#F9FAFB] rounded-xl px-3 text-[13px] font-medium text-[#0C0C0E] placeholder:text-gray-300 focus:outline-none focus:border-[#003787]/40" />
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
                <button onClick={onCancel} className="flex-1 h-11 border border-gray-300 rounded-xl text-[14px] font-bold text-[#0C0C0E] hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={() => onSave({ ...form, whtDeducted: String(Math.round(autoWHT)), netPaid: String(Math.round(autoNet)), whtRate: String(autoRate) })}
                    className="flex-[2] h-11 bg-[#003787] text-white rounded-xl text-[14px] font-bold hover:opacity-90 transition-opacity">
                    Save WHT Deduction
                </button>
            </div>
        </div>
    );
};

// ── Payee Card ────────────────────────────────────────────────────────────────
const PayeeCard = ({ d, onRemove, onEdit }: { d: WHTDeduction; onRemove: () => void; onEdit: () => void }) => {
    const gross = Number(d.gross) || 0;
    const wht = Number(d.whtDeducted) || 0;
    const net = Number(d.netPaid) || 0;
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="grid grid-cols-3 gap-4 mb-3">
                <div><p className="text-[11px] font-semibold text-[#9CA3AF] mb-0.5">Payee</p><p className="text-[13px] font-semibold text-[#0C0C0E]">{d.payee || 'N/A'}</p></div>
                <div><p className="text-[11px] font-semibold text-[#9CA3AF] mb-0.5">TIN</p><p className="text-[13px] font-semibold text-[#0C0C0E] font-mono">{d.tin || 'N/A'}</p></div>
                <div><p className="text-[11px] font-semibold text-[#9CA3AF] mb-0.5">Type</p><p className="text-[13px] font-semibold text-[#0C0C0E]">{d.whtType !== 'Select' ? d.whtType : 'N/A'}</p></div>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-3">
                <div><p className="text-[11px] font-semibold text-[#9CA3AF] mb-0.5">Gross</p><p className="text-[13px] font-bold text-[#0C0C0E]">{fmt(gross)}</p></div>
                <div><p className="text-[11px] font-semibold text-[#9CA3AF] mb-0.5">WHT</p><p className="text-[13px] font-bold text-[#0C0C0E]">{fmt(wht)}</p></div>
                <div><p className="text-[11px] font-semibold text-[#9CA3AF] mb-0.5">Net</p><p className="text-[13px] font-bold text-[#0C0C0E]">{fmt(net)}</p></div>
                <div><p className="text-[11px] font-semibold text-[#9CA3AF] mb-0.5">Date</p><p className="text-[13px] font-semibold text-[#0C0C0E]">{d.date || '—'}</p></div>
            </div>
            <div className="flex gap-2">
                <button onClick={onRemove} className="flex-1 h-9 border border-gray-200 rounded-xl text-[12px] font-bold text-[#0C0C0E] hover:bg-gray-50 transition-colors">Remove</button>
                <button onClick={onEdit} className="flex-1 h-9 border border-gray-200 rounded-xl text-[12px] font-bold text-[#0C0C0E] hover:bg-gray-50 transition-colors">Edit</button>
            </div>
        </div>
    );
};

// ── WHT Remittance ─────────────────────────────────────────────────────────────
const WHTRemittance = () => {
    const [deductions, setDeductions] = useState<WHTDeduction[]>([
        { id: 1, payee: 'John Adeyemi (Consultant)', tin: '12345678901', whtType: 'WHT on Services (5%)', gross: '1000000', whtRate: '5', whtDeducted: '50000', netPaid: '950000', date: '15 Jan 2025' },
    ]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [activeMonth, setActiveMonth] = useState(0);
    const [filedMonths, setFiledMonths] = useState<Set<number>>(new Set());
    const [showFilingModal, setShowFilingModal] = useState(false);

    const total = deductions.reduce((s, d) => s + (Number(d.whtDeducted) || 0), 0);
    const dueDate = MONTHS_SHORT[(activeMonth + 1) % 12].slice(0, 3) + ' 21, 2025';

    const handleSave = (d: Omit<WHTDeduction, 'id'>) => {
        if (editId !== null) {
            setDeductions(prev => prev.map(item => item.id === editId ? { ...d, id: editId } : item));
            setEditId(null);
        } else {
            setDeductions(prev => [...prev, { ...d, id: Date.now() }]);
        }
        setShowForm(false);
    };

    const handleFile = () => {
        setFiledMonths(prev => new Set([...prev, activeMonth]));
        setShowFilingModal(false);
        if (activeMonth < 11) setActiveMonth(m => m + 1);
    };

    return (
        <div className="flex gap-6">
            <MonthTabCol activeMonth={activeMonth} setActiveMonth={setActiveMonth} filedMonths={filedMonths} />

            {showFilingModal && <FilingModal onClose={() => setShowFilingModal(false)} onFile={handleFile} />}

            <div className="flex-1 min-w-0">
                {showForm || editId !== null ? (
                    <WHTDeductionForm
                        initial={editId !== null ? (() => { const d = deductions.find(x => x.id === editId)!; const { id: _id, ...rest } = d; return rest; })() : undefined}
                        onSave={handleSave}
                        onCancel={() => { setShowForm(false); setEditId(null); }}
                    />
                ) : (
                    <div>
                        <h2 className="text-[16px] font-bold text-[#0C0C0E] mb-5">Payee Details (who you paid)</h2>
                        <div className="space-y-3 mb-4">
                            {deductions.map(d => (
                                <PayeeCard key={d.id} d={d}
                                    onRemove={() => setDeductions(prev => prev.filter(x => x.id !== d.id))}
                                    onEdit={() => setEditId(d.id)}
                                />
                            ))}
                        </div>

                        <button onClick={() => setShowForm(true)}
                            className="flex items-center gap-1.5 text-[13px] font-bold text-[#003787] hover:opacity-80 transition-opacity mb-7">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Add Another WHT Deduction
                        </button>

                        <div className="mb-2">
                            <p className="text-[12px] font-semibold text-[#6B7280] mb-1">Total Withholding Tax to remit</p>
                            <p className="text-[32px] font-bold text-[#0C0C0E]">₦{Math.round(total).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-1.5 mb-6">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <p className="text-[12px] font-bold text-[#D97706]">Due by: {dueDate}</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex-1 h-12 border border-gray-300 text-[#0C0C0E] font-bold rounded-xl hover:bg-gray-50 transition-colors text-[14px]">
                                Download PDF
                            </button>
                            <button onClick={() => setShowFilingModal(true)}
                                className="flex-1 h-12 bg-[#003787] text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-[14px]">
                                File & Remit ({total >= 1_000_000 ? `₦${(total / 1_000_000).toFixed(1)}M` : total >= 1000 ? `₦${Math.round(total / 1000)}K` : fmt(total)})
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── WHT Credit Notes ───────────────────────────────────────────────────────────
const WHTCreditBalance = () => {
    const [credits, setCredits] = useState<WHTDeduction[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [activeMonth, setActiveMonth] = useState(0);
    const [filedMonths] = useState<Set<number>>(new Set());

    const total = credits.reduce((s, d) => s + (Number(d.whtDeducted) || 0), 0);

    const handleSave = (d: Omit<WHTDeduction, 'id'>) => {
        if (editId !== null) {
            setCredits(prev => prev.map(item => item.id === editId ? { ...d, id: editId } : item));
            setEditId(null);
        } else {
            setCredits(prev => [...prev, { ...d, id: Date.now() }]);
        }
        setShowForm(false);
    };

    return (
        <div className="flex gap-6">
            <MonthTabCol activeMonth={activeMonth} setActiveMonth={setActiveMonth} filedMonths={filedMonths} />

            <div className="flex-1 min-w-0">
                {(showForm || editId !== null) ? (
                    <WHTDeductionForm
                        initial={editId !== null ? (() => { const d = credits.find(x => x.id === editId)!; const { id: _id, ...rest } = d; return rest; })() : undefined}
                        onSave={handleSave}
                        onCancel={() => { setShowForm(false); setEditId(null); }}
                    />
                ) : credits.length === 0 ? (
                    // Empty state
                    <div className="flex flex-col items-start gap-3">
                        <h2 className="text-[16px] font-bold text-[#0C0C0E]">WHT Credit Notes</h2>
                        <p className="text-[13px] text-[#6B7280] font-medium">WHT deducted from payments received — used to offset your CIT liability.</p>
                        <button onClick={() => setShowForm(true)}
                            className="mt-2 flex items-center gap-1.5 text-[13px] font-bold text-[#003787] hover:opacity-80 transition-opacity">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Add WHT Credit Note
                        </button>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-[16px] font-bold text-[#0C0C0E] mb-5">Payee Details (who you paid)</h2>
                        <div className="space-y-3 mb-4">
                            {credits.map(d => (
                                <PayeeCard key={d.id} d={d}
                                    onRemove={() => setCredits(prev => prev.filter(x => x.id !== d.id))}
                                    onEdit={() => setEditId(d.id)}
                                />
                            ))}
                        </div>

                        <button onClick={() => setShowForm(true)}
                            className="flex items-center gap-1.5 text-[13px] font-bold text-[#003787] hover:opacity-80 transition-opacity mb-7">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Add Another WHT Credit Note
                        </button>

                        <div className="mb-6 bg-[#F0F7FF] border border-blue-100 rounded-2xl p-5 inline-flex gap-8">
                            <div>
                                <p className="text-[11px] font-semibold text-[#6B7280] mb-1">Total WHT Credit</p>
                                <p className="text-[24px] font-bold text-[#003787]">₦{Math.round(total).toLocaleString()}</p>
                            </div>
                            <button className="self-center h-10 px-5 bg-[#003787] text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-[13px]">
                                Apply to CIT
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Embeddable content component (no page shell) ──────────────────────────────
export function BusinessVATWHTContent({
    activeSubMenu,
    onSubMenuChange,
}: {
    activeSubMenu?: 'file-vat' | 'remit-wht' | 'wht-balance';
    onSubMenuChange?: (s: 'file-vat' | 'remit-wht' | 'wht-balance') => void;
} = {}) {
    const router = useRouter();

    // sidebar sub-section (internal state fallback)
    const [internalSubSection, setInternalSubSection] = useState<'file-vat' | 'remit-wht' | 'wht-balance'>('file-vat');
    const subSection = activeSubMenu ?? internalSubSection;
    const setSubSectionLocal = onSubMenuChange ?? setInternalSubSection;

    const setSubSection = (s: 'file-vat' | 'remit-wht' | 'wht-balance') => {
        setSubSectionLocal(s);
        setVatStep('method'); // Reset step when switching tab
    };

    // VAT filing state
    const [vatStep, setVatStep] = useState<'method' | 'form'>('method');
    const [entryMethod, setEntryMethod] = useState<'manual' | 'csv' | 'software'>('manual');
    const [activeMonth, setActiveMonth] = useState(0);
    const [filedMonths, setFiledMonths] = useState<Set<number>>(new Set());
    const [monthData, setMonthData] = useState<Record<number, MonthVATData>>({});
    const [, setShowFilingModal] = useState(false);

    const data = monthData[activeMonth] ?? defaultMonth();

    const setField = (field: keyof MonthVATData) => (val: string) =>
        setMonthData(prev => ({ ...prev, [activeMonth]: { ...(prev[activeMonth] ?? defaultMonth()), [field]: val } }));

    const totalSales = Number(data.totalSales.replace(/,/g, '')) || 0;
    const outputVAT = totalSales * VAT_RATE;
    const totalPurchases = Number(data.totalPurchases.replace(/,/g, '')) || 0;
    const inputVAT = totalPurchases * VAT_RATE;
    const netVAT = outputVAT - inputVAT;
    const isCredit = netVAT < 0;

    const dueDate = MONTHS_SHORT[(activeMonth + 1) % 12].slice(0, 3) + ' 21, 2026';

    const ENTRY_OPTIONS = [
        { id: 'manual' as const, label: 'Manual entry' },
        { id: 'csv' as const, label: 'Upload sales & purchase ledgers (CSV/Excel)' },
        { id: 'software' as const, label: 'Connect accounting software (QuickBooks, Xero, Zoho)' },
    ];

    return (
        <div className="flex items-start gap-8 w-full">
            {!activeSubMenu && (
                <LeftSidebar activeSubSection={subSection} onSubSection={s => setSubSection(s as 'file-vat' | 'remit-wht' | 'wht-balance')} router={router} />
            )}
            <div className="flex-1 min-w-0">

                {/* ── File Monthly VAT Return ── */}
                {subSection === 'file-vat' && vatStep === 'method' && (
                    <div className="max-w-[480px] mx-auto">
                        <h2 className="text-base font-bold text-[#0C0C0E] mb-1">File Monthly VAT Return</h2>
                        <p className="text-[13px] text-[#6B7280] font-medium mb-6">How do you want to enter your VAT data?</p>
                        <div className="space-y-0 mb-8">
                            {ENTRY_OPTIONS.map(opt => (
                                <button key={opt.id} onClick={() => setEntryMethod(opt.id)} className="w-full flex items-center gap-3 py-3.5 text-left">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${entryMethod === opt.id ? 'border-[#003787]' : 'border-gray-300'}`}>
                                        {entryMethod === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-[#003787]" />}
                                    </div>
                                    <span className="text-[14px] font-semibold text-[#0C0C0E]">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setVatStep('form')} className="h-11 px-8 bg-[#003787] text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-[14px]">
                            Continue
                        </button>
                    </div>
                )}

                {/* ── VAT Form ── */}
                {subSection === 'file-vat' && vatStep === 'form' && (
                    <div className="flex gap-6">
                        {/* Month tabs column */}
                        <div className="flex flex-col gap-0 w-[110px] flex-shrink-0 mt-1 sticky top-24">
                            {MONTHS_SHORT.slice(0, 6).map((m, i) => {
                                const filed = filedMonths.has(i);
                                const isActive = i === activeMonth;
                                return (
                                    <button key={m} onClick={() => setActiveMonth(i)}
                                        className={`flex items-center gap-2 px-2 py-2.5 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-all ${isActive ? 'bg-[#F1F5F9] text-[#0C0C0E]' : 'text-[#9CA3AF] hover:text-[#6B7280]'}`}>
                                        {filed
                                            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
                                        {m.slice(0, 3)}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Form */}
                        <div className="flex-1 min-w-0 space-y-6 pb-6">
                            {/* Output VAT card */}
                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                                <div className="px-5 py-3.5 border-b border-gray-100">
                                    <h3 className="text-[14px] font-bold text-[#0C0C0E]">Output VAT <span className="text-[#6B7280] font-medium">(VAT you charged customers)</span></h3>
                                </div>
                                <div className="p-5 space-y-3">
                                    {/* Total sales */}
                                    <div className="flex items-center justify-between gap-4">
                                        <label className="text-[13px] font-semibold text-[#374151] flex items-center whitespace-nowrap flex-shrink-0">
                                            Total sales (before VAT) <HintIcon tip="Your total revenue before any VAT is added." />
                                        </label>
                                        <input
                                            type="text"
                                            value={data.totalSales}
                                            onChange={e => setField('totalSales')(e.target.value.replace(/[^0-9.]/g, ''))}
                                            placeholder="N0"
                                            className="w-[160px] flex-shrink-0 h-10 border border-gray-200 bg-[#F9FAFB] rounded-xl px-3 text-[13px] font-medium text-[#0C0C0E] placeholder:text-gray-300 focus:outline-none focus:border-[#003787]/40 text-right"
                                        />
                                    </div>
                                    {/* VAT charged */}
                                    <div className="flex items-center justify-between gap-4">
                                        <label className="text-[13px] font-semibold text-[#374151] flex items-center whitespace-nowrap flex-shrink-0">
                                            VAT charged at 7.5% <HintIcon tip="Automatically calculated: Total sales × 7.5%" />
                                        </label>
                                        <div className="w-[160px] flex-shrink-0 h-10 border border-gray-200 bg-[#F9FAFB] rounded-xl px-3 flex items-center justify-end text-[13px] font-medium text-[#0C0C0E]">
                                            {outputVAT > 0 ? fmt(outputVAT) : 'N0'}
                                        </div>
                                    </div>
                                    {/* Zero-rated */}
                                    <div className="flex items-center justify-between gap-4">
                                        <label className="text-[13px] font-semibold text-[#374151] flex items-center whitespace-nowrap flex-shrink-0">
                                            Zero-rated sales (exports, etc.) <HintIcon tip="Sales where VAT is 0% — exports, certain goods." />
                                        </label>
                                        <input
                                            type="text"
                                            value={data.zeroRated}
                                            onChange={e => setField('zeroRated')(e.target.value.replace(/[^0-9.]/g, ''))}
                                            placeholder="N0"
                                            className="w-[160px] flex-shrink-0 h-10 border border-gray-200 bg-[#F9FAFB] rounded-xl px-3 text-[13px] font-medium text-[#0C0C0E] placeholder:text-gray-300 focus:outline-none focus:border-[#003787]/40 text-right"
                                        />
                                    </div>
                                    {/* Exempt sales */}
                                    <div className="flex items-center justify-between gap-4">
                                        <label className="text-[13px] font-semibold text-[#374151] flex items-center whitespace-nowrap flex-shrink-0">
                                            Exempt sales (medical, education, etc.) <HintIcon tip="Sales of exempt goods/services where VAT cannot be charged." />
                                        </label>
                                        <div className="relative w-[160px] flex-shrink-0">
                                            <select
                                                value={data.exempt}
                                                onChange={e => setField('exempt')(e.target.value)}
                                                className="w-full h-10 border border-gray-200 bg-[#F9FAFB] rounded-xl px-3 text-[13px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 appearance-none"
                                            >
                                                {EXEMPT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Upload */}
                                    <div className="flex items-center justify-between gap-4 mt-2 p-3 border border-dashed border-gray-200 rounded-xl">
                                        <div className="flex items-center gap-2.5">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                                            </svg>
                                            <div>
                                                <p className="text-[12px] font-semibold text-[#374151]">Upload your financial statements</p>
                                                <p className="text-[11px] text-[#9CA3AF] font-medium">PDF, JPG, or PNG (Max 5MB)</p>
                                            </div>
                                        </div>
                                        <button className="h-8 px-4 border border-gray-300 rounded-lg text-[12px] font-bold text-[#0C0C0E] hover:bg-gray-50 transition-colors">
                                            Upload
                                        </button>
                                    </div>

                                    {/* Total output */}
                                    <div className="pt-2">
                                        <p className="text-[11px] font-semibold text-[#6B7280] mb-0.5">Total output VAT</p>
                                        <p className="text-base font-bold text-[#0C0C0E]">{fmt(outputVAT)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Input VAT card */}
                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                                <div className="px-5 py-3.5 border-b border-gray-100">
                                    <h3 className="text-[14px] font-bold text-[#0C0C0E]">Input VAT <span className="text-[#6B7280] font-medium">(VAT you paid to suppliers)</span></h3>
                                </div>
                                <div className="p-5 space-y-3">
                                    {/* Total purchases */}
                                    <div className="flex items-center justify-between gap-4">
                                        <label className="text-[13px] font-semibold text-[#374151] flex items-center whitespace-nowrap flex-shrink-0">
                                            Total purchases (before VAT) <HintIcon tip="Your total spending on goods/services before VAT." />
                                        </label>
                                        <input
                                            type="text"
                                            value={data.totalPurchases}
                                            onChange={e => setField('totalPurchases')(e.target.value.replace(/[^0-9.]/g, ''))}
                                            placeholder="N0"
                                            className="w-[160px] flex-shrink-0 h-10 border border-gray-200 bg-[#F9FAFB] rounded-xl px-3 text-[13px] font-medium text-[#0C0C0E] placeholder:text-gray-300 focus:outline-none focus:border-[#003787]/40 text-right"
                                        />
                                    </div>
                                    {/* VAT paid */}
                                    <div className="flex items-center justify-between gap-4">
                                        <label className="text-[13px] font-semibold text-[#374151] flex items-center whitespace-nowrap flex-shrink-0">
                                            VAT paid at 7.5% <HintIcon tip="Automatically calculated: Total purchases × 7.5%" />
                                        </label>
                                        <div className="w-[160px] flex-shrink-0 h-10 border border-gray-200 bg-[#F9FAFB] rounded-xl px-3 flex items-center justify-end text-[13px] font-medium text-[#0C0C0E]">
                                            {inputVAT > 0 ? fmt(inputVAT) : 'N0'}
                                        </div>
                                    </div>

                                    {/* Upload */}
                                    <div className="flex items-center justify-between gap-4 mt-2 p-3 border border-dashed border-gray-200 rounded-xl">
                                        <div className="flex items-center gap-2.5">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                                            </svg>
                                            <div>
                                                <p className="text-[12px] font-semibold text-[#374151]">Upload your financial statements</p>
                                                <p className="text-[11px] text-[#9CA3AF] font-medium">PDF, JPG, or PNG (Max 5MB)</p>
                                            </div>
                                        </div>
                                        <button className="h-8 px-4 border border-gray-300 rounded-lg text-[12px] font-bold text-[#0C0C0E] hover:bg-gray-50 transition-colors">
                                            Upload
                                        </button>
                                    </div>

                                    {/* Total input */}
                                    <div className="pt-2">
                                        <p className="text-[11px] font-semibold text-[#6B7280] mb-0.5">Total input VAT</p>
                                        <p className="text-base font-bold text-[#0C0C0E]">{fmt(inputVAT)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Net VAT Payable */}
                            <div>
                                <h3 className="text-sm font-bold text-[#0C0C0E] mb-4">Net VAT Payable</h3>
                                <div className="space-y-2.5 mb-4">
                                    <div className="flex items-center justify-between text-[13px]">
                                        <span className="text-[#6B7280] font-medium">Output VAT</span>
                                        <span className="font-semibold text-[#0C0C0E]">{fmt(outputVAT)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[13px]">
                                        <span className="text-[#6B7280] font-medium">Input VAT</span>
                                        <span className="font-semibold text-[#0C0C0E]">-{fmt(inputVAT)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[14px] pt-2 border-t border-gray-100">
                                        <span className="font-bold text-[#0C0C0E]">Net VAT {isCredit ? 'credit' : 'due'}</span>
                                        <span className={`font-bold text-[17px] ${isCredit ? 'text-[#16A34A]' : 'text-[#0C0C0E]'}`}>
                                            {isCredit ? `+${fmt(Math.abs(netVAT))}` : fmt(netVAT)}
                                        </span>
                                    </div>
                                </div>

                                {/* Due / credit info */}
                                {!isCredit ? (
                                    <div className="flex items-start gap-1.5 mb-6">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" className="flex-shrink-0 mt-0.5">
                                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                        <p className="text-[12px] font-bold text-[#D97706]">Due by: {dueDate}</p>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-1.5 mb-6">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" className="flex-shrink-0 mt-0.5">
                                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                        <p className="text-[12px] font-bold text-[#D97706]">
                                            Due by: {dueDate}. You paid more VAT to suppliers than you collected from customers.
                                        </p>
                                    </div>
                                )}

                                {/* Buttons */}
                                <div className="flex gap-3">
                                    {isCredit ? (
                                        <>
                                            <button onClick={() => { setFiledMonths(prev => new Set([...prev, activeMonth])); if (activeMonth < 11) setActiveMonth(m => m + 1); }}
                                                className="flex-1 h-12 border border-gray-300 text-[#0C0C0E] font-bold rounded-xl hover:bg-gray-50 transition-colors text-[14px]">
                                                Carry Forward to {MONTHS_SHORT[(activeMonth + 1) % 12].slice(0, 3)}
                                            </button>
                                            <button onClick={() => setShowFilingModal(true)} className="flex-1 h-12 bg-[#003787] text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-[14px]">
                                                Claim Refund
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="flex-1 h-12 border border-gray-300 text-[#0C0C0E] font-bold rounded-xl hover:bg-gray-50 transition-colors text-[14px]">
                                                Download PDF
                                            </button>
                                            <button onClick={() => setShowFilingModal(true)} className="flex-1 h-12 bg-[#003787] text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-[14px]">
                                                File & Pay
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Remit Monthly WHT ── */}
                {subSection === 'remit-wht' && <WHTRemittance />}

                {/* ── WHT Credit Balance ── */}
                {subSection === 'wht-balance' && <WHTCreditBalance />}
            </div>
        </div>
    );
}

// ── Standalone page wrapper (keeps the old route working) ──────────────────
export default function BusinessVATWHT() {
    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans pb-20">
            <DashboardHeader />
            <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
                <BusinessVATWHTContent />
            </main>
        </div>
    );
}
