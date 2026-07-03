'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { PrimaryButton, SecondaryButton } from './TaxFolderShared';
import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';
import { InformationFill } from '@mingcute/react';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) => `₦${Math.round(n).toLocaleString()}`;
const num = (s: string) => Number(s.replace(/,/g, '')) || 0;

const HintIcon = ({ tip }: { tip: string }) => (
    <span className="relative group inline-flex items-center ml-1 align-middle cursor-default">
        <InformationFill className="w-3.5 h-3.5" color="#E5E5E5" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-neutral-800 text-white text-1 leading-snug rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40 font-medium">
            {tip}
        </div>
    </span>
);

// ── Left Sidebar ──────────────────────────────────────────────────────────────
const CIT_SUBSECTIONS = [
    { key: 'quarterly', label: 'Quarterly Assessments' },
    { key: 'file-returns', label: 'File Annual Returns' },
    { key: 'tax-adjustment', label: 'Tax Adjustment' },
    { key: 'wht-credits', label: 'WHT Credits' },
    { key: 'review', label: 'Review' },
];

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
        { key: 'vat-wht', label: 'VAT/WHT', route: '/tax-folders/business-vat-wht' },
        { key: 'cit', label: 'Company Income Tax', route: null, children: CIT_SUBSECTIONS },
    ];

    return (
        <div className="w-[220px] flex-shrink-0 flex flex-col gap-4 sticky top-24">
            <div>
                <div className="flex items-center justify-between mb-2 px-1">
                    <p className="text-1 font-semibold text-neutral-400 uppercase tracking-wider">Select</p>
                    <button className="flex items-center gap-1 text-1 font-semibold text-taxable-blue  ">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Edit section
                    </button>
                </div>
                <div>
                    {NAV.map(item => {
                        const isExpanded = item.key === 'cit';
                        return (
                            <div key={item.key}>
                                <button
                                    onClick={() => item.route && router.push(item.route)}
                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl mb-0.5"
                                >
                                    <div className="flex items-center gap-3 text-left">
                                        <span className="text-lg leading-none">📁</span>
                                        <span className="text-2 font-semibold text-neutral-700">{item.label}</span>
                                    </div>
                                    {isExpanded ? (
                                        <svg className="w-3.5 h-3.5 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <polyline points="18 15 12 9 6 15" />
                                        </svg>
                                    ) : (
                                        <svg className="w-3.5 h-3.5 placeholder:text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    )}
                                </button>
                                {isExpanded && item.children && (
                                    <div className="ml-9 mb-1">
                                        {item.children.map(child => (
                                            <button
                                                key={child.key}
                                                onClick={() => onSubSection(child.key)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-2 font-semibold  mb-0.5 ${activeSubSection === child.key ? 'text-neutral-800 bg-neutral-100' : 'text-neutral-500'}`}
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
            <div className="bg-white rounded-[16px] p-5 border border-neutral-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-taxable-blue" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                    </svg>
                    <h4 className="text-2 font-semibold text-neutral-800">Need expert eyes on your return?</h4>
                </div>
                <p className="text-1 text-neutral-500 font-medium leading-relaxed mb-4">
                    Get your return reviewed by a certified tax accountant. They'll ensure accuracy, compliance, and file for you.
                </p>
                <button className="w-full py-2.5 bg-white border border-neutral-200 rounded-xl text-1 font-semibold text-neutral-800">
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
                <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-neutral-100">
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full  ">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-neutral-800" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                        </svg>
                    </button>
                    <h3 className="text-3 font-semibold text-neutral-800">How do you want to file?</h3>
                </div>
                <div className="flex-1 px-6 py-5">
                    {OPTIONS.map(opt => (
                        <button key={opt.id} onClick={() => setMethod(opt.id)} className="w-full flex items-start gap-3 py-4 text-left">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${method === opt.id ? 'border-taxable-blue' : 'border-neutral-300'}`}>
                                {method === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-taxable-blue" />}
                            </div>
                            <div>
                                <p className="text-3 font-semibold text-neutral-800 mb-0.5">{opt.label}</p>
                                <p className="text-1 text-neutral-500 font-medium leading-relaxed">{opt.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
                <div className="px-6 pb-6 flex gap-3 border-t border-neutral-100 pt-4">
                    <button onClick={onClose} className="flex-1 h-11 border border-neutral-200 rounded-xl text-3 font-semibold text-neutral-800  ">Back</button>
                    <button onClick={onFile} className="flex-[2] h-11 bg-taxable-blue text-white rounded-xl text-3 font-semibold ">Continue</button>
                </div>
            </div>
        </div>
    );
};

// ── Input field helper ────────────────────────────────────────────────────────
const Field = ({ label, tip, value, onChange, readOnly, placeholder }: {
    label: string; tip?: string; value: string; onChange?: (v: string) => void;
    readOnly?: boolean; placeholder?: string;
}) => (
    <div>
        <label className="flex items-center text-1 font-semibold text-neutral-500 mb-1.5">
            {label} {tip && <HintIcon tip={tip} />}
        </label>
        <Input type="text" value={value} onChange={e => onChange?.(e.target.value.replace(/[^0-9.]/g, ''))} placeholder={placeholder ?? 'N0'} disabled={readOnly} />
    </div>
);

// ── Row in review ledger ──────────────────────────────────────────────────────
const LedgerRow = ({ label, value, bold, indent, prefix }: {
    label: string; value: string; bold?: boolean; indent?: boolean; prefix?: string;
}) => (
    <div className={`flex items-center justify-between py-2.5 ${bold ? 'border-t border-neutral-100 mt-1' : ''}`}>
        <span className={`text-2 ${bold ? 'font-semibold text-neutral-800' : 'font-medium text-neutral-500'} ${indent ? 'pl-4' : ''}`}>{label}</span>
        <span className={`text-2 ${bold ? 'font-semibold text-neutral-800' : 'font-semibold text-neutral-800'}`}>
            {prefix}{value}
        </span>
    </div>
);

const SectionHeader = ({ label }: { label: string }) => (
    <p className="text-2 font-semibold text-neutral-800 mt-5 mb-1">{label}</p>
);

// ── WHT Type options ──────────────────────────────────────────────────────────
const WHT_TYPES = ['Select', 'WHT on Services (5%)', 'WHT on Rent (10%)', 'WHT on Dividends (10%)', 'WHT on Interest (10%)', 'WHT on Royalties (10%)', 'WHT on Construction (2.5%)'];
const WHT_RATES = ['Select', '2.5%', '5%', '10%'];

// ── Embeddable content component (no page shell) ──────────────────────────────
export function BusinessCITContent({
    activeSubMenu,
    onSubMenuChange,
    estimatedAnnualRevenue,
    profitMargin,
}: {
    activeSubMenu?: 'quarterly' | 'file-returns' | 'tax-adjustment' | 'wht-credits' | 'review';
    onSubMenuChange?: (s: 'quarterly' | 'file-returns' | 'tax-adjustment' | 'wht-credits' | 'review') => void;
    estimatedAnnualRevenue?: string;
    profitMargin?: string;
} = {}) {
    const router = useRouter();
    const [internalSubSection, setInternalSubSection] = useState<'quarterly' | 'file-returns' | 'tax-adjustment' | 'wht-credits' | 'review'>('quarterly');
    const subSection = activeSubMenu ?? internalSubSection;
    const setSubSectionLocal = onSubMenuChange ?? setInternalSubSection;

    const setSubSection = (s: 'quarterly' | 'file-returns' | 'tax-adjustment' | 'wht-credits' | 'review') => {
        setSubSectionLocal(s);
        if (s === 'file-returns') setStep('method');
    };

    const [step, setStep] = useState<'method' | 'form'>('method');
    const [entryMethod, setEntryMethod] = useState<'manual' | 'pdf' | 'software'>('manual');
    const [showFilingModal, setShowFilingModal] = useState(false);

    // Quarterly assessments
    const [paidQuarters, setPaidQuarters] = useState<Set<number>>(new Set([0, 1]));
    const [deferredQuarters, setDeferredQuarters] = useState<Set<number>>(new Set());
    const [showDeferModal, setShowDeferModal] = useState(false);
    const [deferModalQuarter, setDeferModalQuarter] = useState<number | null>(null);
    const [payQuarter, setPayQuarter] = useState<number | null>(null);

    // Financials
    const [totalRevenue, setTotalRevenue] = useState('');
    const [otherIncome, setOtherIncome] = useState('');
    const [cogs, setCogs] = useState('');
    const [opex, setOpex] = useState('');
    const [depreciation, setDepreciation] = useState('');
    const [interestPaid, setInterestPaid] = useState('');
    const [otherExpenses, setOtherExpenses] = useState('');

    // Tax Adjustments
    const [nonDeductible, setNonDeductible] = useState('');
    const [capitalAllowances, setCapitalAllowances] = useState('');
    const [pioneerRelief, setPioneerRelief] = useState('');
    const [otherDeductions, setOtherDeductions] = useState('');

    // WHT Credits
    const [whtCredits, setWhtCredits] = useState([{
        creditNoteNo: '', issuerName: '', issuerTIN: '', whtType: 'Select',
        whtRate: 'Select', grossAmount: '', whtAmount: '', dateIssued: '', paymentRef: '',
    }]);

    // Derived financials
    const totalRev = num(totalRevenue) + num(otherIncome);
    const totalExp = num(cogs) + num(opex) + num(depreciation) + num(interestPaid) + num(otherExpenses);
    const nhf = totalRev * 0.025;
    const accountingProfit = totalRev - totalExp - nhf;
    const addBack = num(nonDeductible);
    const subtract = num(capitalAllowances) + num(pioneerRelief) + num(otherDeductions);
    const taxableProfit = accountingProfit + addBack - subtract;
    const citRate = taxableProfit * 0.30;
    const eduTax = taxableProfit * 0.025;
    const grossTaxDue = citRate + eduTax;
    const totalWHTCredits = whtCredits.reduce((s, c) => s + num(c.whtAmount), 0);
    const netTaxPayable = Math.max(0, grossTaxDue - totalWHTCredits);

    const ENTRY_OPTIONS = [
        { id: 'manual' as const, label: 'Manual entry (enter revenue and expenses below)' },
        { id: 'pdf' as const, label: 'Upload financial statements (PDF/Excel)' },
        { id: 'software' as const, label: 'Connect accounting software (QuickBooks, Xero, Zoho)' },
    ];

    const _breadcrumb = subSection === 'quarterly' ? 'Quarterly Assessments'
        : subSection === 'file-returns' ? 'File Annual Returns'
            : subSection === 'tax-adjustment' ? 'Tax Adjustment'
                : subSection === 'wht-credits' ? 'WHT Credits'
                    : 'Review';

    return (
        <div className="flex items-start gap-8 w-full">
            {showFilingModal && <FilingModal onClose={() => setShowFilingModal(false)} onFile={() => setShowFilingModal(false)} />}
            {!activeSubMenu && (
                <LeftSidebar
                    activeSubSection={subSection}
                    onSubSection={s => setSubSection(s as 'quarterly' | 'file-returns' | 'tax-adjustment' | 'wht-credits' | 'review')}
                    router={router}
                />
            )}
            {/* ── Right content ── */}
            <div className="flex-1 min-w-0">

                {/* ── Quarterly Assessments ── */}
                {subSection === 'quarterly' && (() => {
                    const rev = Number((estimatedAnnualRevenue || '').replace(/,/g, '')) || 0;
                    const margin = profitMargin ? Number(profitMargin.replace('%', '')) / 100 : 0;
                    const estimatedProfit = rev * margin;
                    const totalCIT = estimatedProfit * 0.30;
                    const perQuarter = totalCIT / 4;
                    const qFmt = (n: number) => `₦${Math.round(n).toLocaleString()}`;
                    const quarters = [
                        { label: 'Q1 2026', due: 'Mar 31' },
                        { label: 'Q2 2026', due: 'Jun 30' },
                        { label: 'Q3 2026', due: 'Sep 30' },
                        { label: 'Q4 2026', due: 'Dec 31' },
                    ];
                    const settledCount = paidQuarters.size + deferredQuarters.size;
                    const allSettled = settledCount === 4;
                    const allPaid = paidQuarters.size === 4;
                    const totalPaid = paidQuarters.size * perQuarter;
                    const remaining = Math.max(0, totalCIT - totalPaid);
                    const paidPct = totalCIT > 0 ? Math.round((totalPaid / totalCIT) * 100) : 0;
                    const nextUnpaid = quarters.findIndex((_, i) => !paidQuarters.has(i) && !deferredQuarters.has(i));

                    return (
                        <div className="w-full max-w-[500px] mx-auto">
                            {/* Defer confirmation modal */}
                            {showDeferModal && deferModalQuarter !== null && (
                                <div className="fixed inset-0 z-[200] flex items-center justify-center">
                                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[380px] mx-4 p-7 text-center">
                                        <div className="w-12 h-12 rounded-full border-2 border-neutral-200 flex items-center justify-center mx-auto mb-4">
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-700">
                                                <polyline points="20 6 9 17 4 12" />
                                                <circle cx="12" cy="12" r="10" />
                                            </svg>
                                        </div>
                                        <h3 className="text-5 font-semibold text-neutral-800 tracking-[-0.02em] mb-3">Defer to annual filing</h3>
                                        <p className="text-2 text-neutral-500 font-medium leading-relaxed mb-6">
                                            You chose to defer Q{deferModalQuarter + 1} payment to annual filing. You'll settle this when you file your CIT return in June 2026.
                                        </p>
                                        <PrimaryButton
                                            onClick={() => {
                                                setDeferredQuarters(prev => new Set([...prev, deferModalQuarter!]));
                                                setShowDeferModal(false);
                                                setDeferModalQuarter(null);
                                            }}
                                            className="w-full">
                                            Got it
                                        </PrimaryButton>
                                    </div>
                                </div>
                            )}

                            <h2 className="text-5 font-semibold text-neutral-800 tracking-[-0.02em] mb-1">Quarterly Assessments (2026)</h2>
                            <p className="text-2 text-neutral-500 font-medium mb-8">Pay your estimated CIT in quarterly installments</p>

                            <div className="space-y-12">
                            <div className="flex flex-col gap-6">
                            {/* Summary */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-2">
                                    <span className="text-neutral-500 font-medium">Estimated annual revenue</span>
                                    <span className="font-semibold text-neutral-800">{qFmt(rev)}</span>
                                </div>
                                <div className="flex items-center justify-between text-2">
                                    <span className="text-neutral-500 font-medium">Profit margin</span>
                                    <span className="font-semibold text-neutral-800">{profitMargin || '—'}</span>
                                </div>
                                <div className="flex items-center justify-between text-2">
                                    <span className="text-neutral-500 font-medium">Estimated annual profit</span>
                                    <span className="font-semibold text-neutral-800">{qFmt(estimatedProfit)}</span>
                                </div>
                                <div className="flex items-center justify-between text-2">
                                    <span className="text-neutral-500 font-medium">Estimated CIT (30%)</span>
                                    <span className="font-semibold text-neutral-800">{qFmt(totalCIT)}</span>
                                </div>
                                <div className="flex items-center justify-between text-2">
                                    <span className="text-neutral-500 font-medium">Per quarter</span>
                                    <span className="font-semibold text-neutral-800">{qFmt(perQuarter)}</span>
                                </div>
                            </div>
                            </div>

                            {/* Quarters table */}
                            <div className="bg-white border border-neutral-50 rounded-2xl overflow-hidden">
                                <Table className="text-2 [&_tr]:border-neutral-50">
                                    <TableHeader>
                                        <TableRow className="bg-neutral-50">
                                            {['Quarter', 'Due Date', 'Amount', 'Status'].map(h => (
                                                <TableHead key={h} className="px-6 py-4 font-medium text-neutral-500">{h}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {quarters.map((q, i) => (
                                            <TableRow key={q.label}>
                                                <TableCell className="px-6 py-4 font-medium text-neutral-500">{q.label}</TableCell>
                                                <TableCell className="px-6 py-4 text-neutral-500">{q.due}</TableCell>
                                                <TableCell className="px-6 py-4 font-medium text-neutral-700">{qFmt(perQuarter)}</TableCell>
                                                <TableCell className="px-6 py-4">
                                                    {paidQuarters.has(i) ? (
                                                        <Badge className="bg-green-50 text-green-600 border-green-200 text-1 font-medium px-2 py-0 h-5">Paid</Badge>
                                                    ) : deferredQuarters.has(i) ? (
                                                        <Badge className="bg-amber-50 text-amber-600 border-amber-200 text-1 font-medium px-2 py-0 h-5">Deferred</Badge>
                                                    ) : i === nextUnpaid && nextUnpaid === 3 ? null : i === nextUnpaid ? (
                                                        <Badge className="bg-neutral-100 text-neutral-500 border-neutral-200 text-1 font-medium px-2 py-0 h-5">Pending</Badge>
                                                    ) : (
                                                        <Badge className="bg-neutral-100 text-neutral-500 border-neutral-200 text-1 font-medium px-2 py-0 h-5">Upcoming</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {nextUnpaid !== -1 && (
                                    <div className="px-6 py-4 border-t border-neutral-50">
                                        {nextUnpaid === 3 ? (
                                            <div className="flex gap-3">
                                                <SecondaryButton onClick={() => { setDeferModalQuarter(3); setShowDeferModal(true); }} className="flex-1">
                                                    Defer to Annual Filing
                                                </SecondaryButton>
                                                <PrimaryButton onClick={() => setPayQuarter(3)} className="flex-1">
                                                    File Q4 taxes
                                                </PrimaryButton>
                                            </div>
                                        ) : (
                                            <PrimaryButton onClick={() => setPayQuarter(nextUnpaid)} className="w-full">
                                                File Q{nextUnpaid + 1} taxes
                                            </PrimaryButton>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Payment confirmation drawer */}
                            <Drawer open={payQuarter !== null} onOpenChange={(o) => { if (!o) setPayQuarter(null); }}>
                                <DrawerContent className="bg-white w-full max-w-full px-4 pb-6">
                                    <DrawerTitle className="sr-only">File Quarter</DrawerTitle>
                                    <div className="max-w-[420px] mx-auto w-full pt-6 text-center">
                                        <h2 className="text-5 font-semibold text-neutral-800 mb-8">
                                            File {payQuarter !== null ? quarters[payQuarter].label : ''}
                                        </h2>
                                        {payQuarter !== null && (() => {
                                            const q = quarters[payQuarter];
                                            return (
                                                <div className="space-y-4 mb-8 text-left">
                                                    <div className="flex items-center justify-between py-2.5 border-b border-neutral-50">
                                                        <span className="text-2 text-neutral-500 font-medium">Quarter</span>
                                                        <span className="text-2 font-semibold text-neutral-800">{q.label}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between py-2.5 border-b border-neutral-50">
                                                        <span className="text-2 text-neutral-500 font-medium">Due Date</span>
                                                        <span className="text-2 font-semibold text-neutral-800">{q.due}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between py-2.5">
                                                        <span className="text-2 text-neutral-500 font-medium">Amount</span>
                                                        <span className="text-5 font-semibold text-neutral-800 tracking-[-0.02em]">{qFmt(perQuarter)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                        <div className="flex gap-3">
                                            <DrawerClose asChild>
                                                <button type="button" onClick={() => setPayQuarter(null)} className="flex-1 h-12 border border-neutral-200 bg-white rounded-xl text-3 font-semibold text-neutral-800">
                                                    Back
                                                </button>
                                            </DrawerClose>
                                            <button type="button" onClick={() => { if (payQuarter !== null) { setPaidQuarters(prev => new Set([...prev, payQuarter!])); setPayQuarter(null); } }} className="flex-1 h-12 bg-taxable-blue text-white font-semibold rounded-xl text-3">
                                                Continue
                                            </button>
                                        </div>
                                    </div>
                                </DrawerContent>
                            </Drawer>

                            {/* Totals */}
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-1 font-semibold text-neutral-500 mb-1">Total paid ({paidPct}%)</p>
                                    <p className="text-7 font-semibold text-neutral-800">{qFmt(totalPaid)}</p>
                                </div>
                                <div>
                                    <p className="text-1 font-semibold text-neutral-500 mb-1">Remaining</p>
                                    <p className="text-7 font-semibold text-neutral-800">{qFmt(remaining)}</p>
                                </div>
                            </div>
                            </div>

                            {/* Bottom notice + CTA */}
                            {allPaid ? (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-2">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 mt-0.5 text-neutral-500">
                                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                        <p className="text-1 font-medium text-neutral-500 leading-relaxed">
                                            You've completed your 2025 quarterly payments.<br />Now it's time to file your annual return based on actual profit.
                                        </p>
                                    </div>
                                    <PrimaryButton onClick={() => setSubSection('file-returns')}>
                                        File Annual CIT
                                    </PrimaryButton>
                                </div>
                            ) : allSettled ? (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-2">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 mt-0.5 text-amber-500">
                                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                        <p className="text-1 font-semibold text-amber-600 leading-relaxed">
                                            Remember: When you file your annual CIT in June 2027, we'll reconcile based on your actual profit. You may owe more or get a refund.
                                        </p>
                                    </div>
                                    <PrimaryButton onClick={() => setSubSection('file-returns')}>
                                        File Annual CIT
                                    </PrimaryButton>
                                </div>
                            ) : (
                                <div className="flex items-start gap-2">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 mt-0.5 text-amber-500">
                                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    <p className="text-1 font-semibold text-amber-600 leading-relaxed">
                                        Remember: When you file your annual CIT in June 2027, we'll reconcile based on your actual profit. You may owe more or get a refund.
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* ── Step 1: Method selection ── */}
                {subSection === 'file-returns' && step === 'method' && (
                    <div className="max-w-[520px] mx-auto">
                        <h2 className="text-5 font-semibold text-neutral-800 mb-1">Enter your company's financial performance</h2>
                        <p className="text-2 text-neutral-500 font-medium mb-6">How do you want to provide your financials?</p>
                        <div className="space-y-0 mb-8">
                            {ENTRY_OPTIONS.map(opt => (
                                <button key={opt.id} onClick={() => setEntryMethod(opt.id)} className="w-full flex items-center gap-3 py-3.5 text-left">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0  ${entryMethod === opt.id ? 'border-taxable-blue' : 'border-neutral-300'}`}>
                                        {entryMethod === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-taxable-blue" />}
                                    </div>
                                    <span className="text-3 font-semibold text-neutral-800">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setStep('form')} className="h-11 px-8 bg-taxable-blue text-white font-semibold rounded-xl  text-3">
                            Continue
                        </button>
                    </div>
                )}

                {/* ── Step 2: Financial Inputs ── */}
                {subSection === 'file-returns' && step === 'form' && (
                    <div className="w-full max-w-[500px] mx-auto">
                        <div className="space-y-10">
                        {/* Revenue */}
                        <div>
                        <h2 className="text-3 font-semibold text-neutral-800 mb-4">Revenue</h2>
                        <div className="bg-white border border-neutral-200 rounded-2xl p-[12px]">
                            <div className="grid grid-cols-3 gap-4">
                                <Field label="Total revenue" tip="All revenue earned from your main business activities." value={totalRevenue} onChange={setTotalRevenue} />
                                <Field label="Other income" tip="Non-operating income e.g. interest earned, dividend received." value={otherIncome} onChange={setOtherIncome} />
                                <Field label="Total Revenue" tip="Automatically calculated: Total revenue + Other income." value={totalRev > 0 ? fmt(totalRev) : ''} readOnly placeholder="N0" />
                            </div>
                        </div>
                        </div>

                        {/* Expenses */}
                        <div>
                        <h2 className="text-3 font-semibold text-neutral-800 mb-4">Expenses</h2>
                        <div className="bg-white border border-neutral-200 rounded-2xl p-[12px]">
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Cost of goods sold (COGS)" tip="Direct costs of producing goods/services sold." value={cogs} onChange={setCogs} />
                                <Field label="Operating expenses" tip="Day-to-day running costs: salaries, rent, utilities." value={opex} onChange={setOpex} />
                                <Field label="Depreciation" tip="Annual reduction in value of fixed assets." value={depreciation} onChange={setDepreciation} />
                                <Field label="Interest paid" tip="Interest on business loans or credit facilities." value={interestPaid} onChange={setInterestPaid} />
                                <Field label="Other expenses" tip="Any other allowable business expenses not listed above." value={otherExpenses} onChange={setOtherExpenses} />
                            </div>
                        </div>
                        </div>

                        {/* Financial statements */}
                        <div>
                        <h2 className="text-3 font-semibold text-neutral-800 mb-4">Financial statements</h2>
                        <div className="bg-white border border-neutral-200 rounded-2xl p-[12px]">
                            <div className="flex items-center justify-between gap-4 p-3 border border-dashed border-neutral-200 rounded-xl">
                                <div className="flex items-center gap-2.5">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-neutral-400" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                                    </svg>
                                    <div>
                                        <p className="text-1 font-semibold text-neutral-700">Upload your financial statements</p>
                                        <p className="text-1 text-neutral-400 font-medium">PDF, JPG, or PNG (Max 5MB)</p>
                                    </div>
                                </div>
                                <button className="h-8 px-4 border border-neutral-300 rounded-lg text-1 font-semibold text-neutral-800  ">Upload</button>
                            </div>
                        </div>
                        </div>
                        </div>

                        <button onClick={() => setSubSection('tax-adjustment')} className="h-12 px-8 bg-taxable-blue text-white font-semibold rounded-xl  text-3">
                            Continue to Tax Adjustments
                        </button>
                    </div>
                )}

                {/* ── Tax Adjustment ── */}
                {subSection === 'tax-adjustment' && (
                    <div className="w-full max-w-[500px] mx-auto">
                        <h2 className="text-5 font-semibold text-neutral-800 mb-1">Tax Adjustments</h2>
                        <p className="text-2 text-neutral-500 font-medium mb-6">Adjust your accounting profit to get taxable profit</p>

                        <div className="space-y-10">
                        <div>
                            <p className="text-1 font-semibold text-neutral-500 mb-1">Accounting Profit</p>
                            <p className="text-9 font-semibold text-neutral-800">{fmt(accountingProfit)}</p>
                        </div>

                        <div className="bg-white border border-neutral-200 rounded-2xl p-[12px] space-y-5">
                            {/* Add back */}
                            <div>
                                <p className="text-2 font-semibold text-neutral-800 mb-3">Add back</p>
                                <div className="flex items-center justify-between gap-4">
                                    <label className="flex items-center text-2 font-semibold text-neutral-700 whitespace-nowrap flex-shrink-0">
                                        Non-deductible expenses <HintIcon tip="Expenses not allowed by FIRS e.g. fines, penalties, personal expenses." />
                                    </label>
                                    <Input type="text" placeholder="N0" value={nonDeductible}
                                        onChange={e => setNonDeductible(e.target.value.replace(/[^0-9.]/g, ''))}
                                        className="w-[180px] flex-shrink-0" />
                                </div>
                            </div>

                            <div className="border-t border-neutral-100 pt-4">
                                <p className="text-2 font-semibold text-neutral-800 mb-3">Subtract</p>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Capital Allowances', tip: 'Tax-allowable depreciation of fixed assets.', value: capitalAllowances, set: setCapitalAllowances },
                                        { label: 'Pioneer Status Relief (if applicable)', tip: 'Companies in pioneer industries may get full tax exemption for 3-5 years.', value: pioneerRelief, set: setPioneerRelief },
                                        { label: 'Other deductions', tip: 'Any other FIRS-approved deductions.', value: otherDeductions, set: setOtherDeductions },
                                    ].map(({ label, tip, value, set }) => (
                                        <div key={label} className="flex items-center justify-between gap-4">
                                            <label className="flex items-center text-2 font-semibold text-neutral-700 whitespace-nowrap flex-shrink-0">
                                                {label} <HintIcon tip={tip} />
                                            </label>
                                            <Input type="text" placeholder="N0" value={value}
                                                onChange={e => set(e.target.value.replace(/[^0-9.]/g, ''))}
                                                className="w-[180px] flex-shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-1 font-semibold text-neutral-500 mb-1">Taxable Profit</p>
                            <p className="text-9 font-semibold text-neutral-800">{fmt(taxableProfit)}</p>
                        </div>
                        </div>

                        <button onClick={() => setSubSection('wht-credits')} className="h-12 px-8 bg-taxable-blue text-white font-semibold rounded-xl  text-3">
                            Continue to WHT Credits
                        </button>
                    </div>
                )}

                {/* ── WHT Credits ── */}
                {subSection === 'wht-credits' && (
                    <div className="w-full max-w-[500px] mx-auto">
                        <h2 className="text-5 font-semibold text-neutral-800 mb-1">WHT Credits</h2>
                        <p className="text-2 text-neutral-500 font-medium leading-relaxed mb-6">
                            WHT is tax your clients already paid to FIRS on your behalf.<br />
                            You can deduct this from your final tax bill.
                        </p>

                        <div className="space-y-10">
                        <div>
                        <p className="text-2 font-semibold text-neutral-800 mb-3">Upload your WHT credit notes</p>

                        {whtCredits.map((credit, idx) => (
                            <div key={idx} className="bg-white border border-neutral-200 rounded-2xl p-[12px] mb-4">
                                <div className="space-y-3">
                                    {/* Credit Note Number */}
                                    <div className="flex items-center justify-between gap-4">
                                        <label className="flex items-center text-2 font-semibold text-neutral-700 whitespace-nowrap flex-shrink-0">
                                            Credit Note Number <HintIcon tip="The unique reference on your WHT credit note certificate." />
                                        </label>
                                        <Input type="text" placeholder="Enter" value={credit.creditNoteNo}
                                            onChange={e => {
                                                const r = [...whtCredits]; r[idx] = { ...r[idx], creditNoteNo: e.target.value };
                                                setWhtCredits(r);
                                            }}
                                            className="w-[220px] flex-shrink-0" />
                                    </div>
                                    {/* Issuer Name */}
                                    <div className="flex items-center justify-between gap-4">
                                        <label className="flex items-center text-2 font-semibold text-neutral-700 whitespace-nowrap flex-shrink-0">
                                            Issuer (Withholder) Name <HintIcon tip="The company or person that deducted WHT from payments to you." />
                                        </label>
                                        <Input type="text" placeholder="Enter" value={credit.issuerName}
                                            onChange={e => { const r = [...whtCredits]; r[idx] = { ...r[idx], issuerName: e.target.value }; setWhtCredits(r); }}
                                            className="w-[220px] flex-shrink-0" />
                                    </div>
                                    {/* Issuer TIN */}
                                    <div className="flex items-center justify-between gap-4">
                                        <label className="flex items-center text-2 font-semibold text-neutral-700 whitespace-nowrap flex-shrink-0">
                                            Issuer TIN <HintIcon tip="Tax Identification Number of the withholder." />
                                        </label>
                                        <Input type="text" placeholder="Enter" value={credit.issuerTIN}
                                            onChange={e => { const r = [...whtCredits]; r[idx] = { ...r[idx], issuerTIN: e.target.value }; setWhtCredits(r); }}
                                            className="w-[220px] flex-shrink-0" />
                                    </div>
                                    {/* WHT Type */}
                                    <div className="flex items-center justify-between gap-4">
                                        <label className="flex items-center text-2 font-semibold text-neutral-700 whitespace-nowrap flex-shrink-0">
                                            WHT Type <HintIcon tip="Nature of the transaction e.g. services, rent, dividends." />
                                        </label>
                                        <SearchableSelect
                                            options={WHT_TYPES}
                                            value={credit.whtType}
                                            onChange={(v) => { const r = [...whtCredits]; r[idx] = { ...r[idx], whtType: v }; setWhtCredits(r); }}
                                            className="w-[220px] flex-shrink-0"
                                        />
                                    </div>
                                    {/* WHT Rate */}
                                    <div className="flex items-center justify-between gap-4">
                                        <label className="flex items-center text-2 font-semibold text-neutral-700 whitespace-nowrap flex-shrink-0">
                                            WHT Rate <HintIcon tip="Applicable rate as shown on your credit note." />
                                        </label>
                                        <SearchableSelect
                                            options={WHT_RATES}
                                            value={credit.whtRate}
                                            onChange={(v) => { const r = [...whtCredits]; r[idx] = { ...r[idx], whtRate: v }; setWhtCredits(r); }}
                                            className="w-[220px] flex-shrink-0"
                                        />
                                    </div>
                                    {/* Gross Amount */}
                                    <div className="flex items-center justify-between gap-4">
                                        <label className="flex items-center text-2 font-semibold text-neutral-700 whitespace-nowrap flex-shrink-0">
                                            Gross Amount <HintIcon tip="Total contract value before WHT deduction." />
                                        </label>
                                        <Input type="text" placeholder="N0" value={credit.grossAmount}
                                            onChange={e => { const r = [...whtCredits]; r[idx] = { ...r[idx], grossAmount: e.target.value.replace(/[^0-9.]/g, '') }; setWhtCredits(r); }}
                                            className="w-[220px] flex-shrink-0" />
                                    </div>
                                    {/* WHT Amount */}
                                    <div className="flex items-center justify-between gap-4">
                                        <label className="flex items-center text-2 font-semibold text-neutral-700 whitespace-nowrap flex-shrink-0">
                                            WHT Amount <HintIcon tip="Actual WHT deducted, as stated on the credit note." />
                                        </label>
                                        <Input type="text" placeholder="N0" value={credit.whtAmount}
                                            onChange={e => { const r = [...whtCredits]; r[idx] = { ...r[idx], whtAmount: e.target.value.replace(/[^0-9.]/g, '') }; setWhtCredits(r); }}
                                            className="w-[220px] flex-shrink-0" />
                                    </div>
                                    {/* Date Issued */}
                                    <div className="flex items-center justify-between gap-4">
                                        <label className="flex items-center text-2 font-semibold text-neutral-700 whitespace-nowrap flex-shrink-0">
                                            Date Issued <HintIcon tip="Date on the WHT credit note certificate." />
                                        </label>
                                        <Input type="text" placeholder="dd/mm/yyyy" value={credit.dateIssued}
                                            onChange={e => { const r = [...whtCredits]; r[idx] = { ...r[idx], dateIssued: e.target.value }; setWhtCredits(r); }}
                                            className="w-[220px] flex-shrink-0" />
                                    </div>
                                    {/* Payment Reference */}
                                    <div className="flex items-center justify-between gap-4">
                                        <label className="flex items-center text-2 font-semibold text-neutral-700 whitespace-nowrap flex-shrink-0">
                                            Payment Reference <HintIcon tip="Reference number for the original payment transaction." />
                                        </label>
                                        <Input type="text" placeholder="Enter" value={credit.paymentRef}
                                            onChange={e => { const r = [...whtCredits]; r[idx] = { ...r[idx], paymentRef: e.target.value }; setWhtCredits(r); }}
                                            className="w-[220px] flex-shrink-0" />
                                    </div>

                                    {/* Upload */}
                                    <div className="flex items-center justify-between gap-4 p-3 border border-dashed border-neutral-200 rounded-xl mt-1">
                                        <div className="flex items-center gap-2.5">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-neutral-400" strokeWidth="2">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                                            </svg>
                                            <div>
                                                <p className="text-1 font-semibold text-neutral-700">Upload your financial statements</p>
                                                <p className="text-1 text-neutral-400 font-medium">PDF, JPG, or PNG (Max 5MB)</p>
                                            </div>
                                        </div>
                                        <button className="h-8 px-4 border border-neutral-300 rounded-lg text-1 font-semibold text-neutral-800  ">Upload</button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => setWhtCredits(prev => [...prev, { creditNoteNo: '', issuerName: '', issuerTIN: '', whtType: 'Select', whtRate: 'Select', grossAmount: '', whtAmount: '', dateIssued: '', paymentRef: '' }])}
                            className="flex items-center gap-1.5 text-2 font-semibold text-taxable-blue  ">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Upload Another WHT Credit Note
                        </button>
                        </div>
                        </div>

                        <button onClick={() => setSubSection('review')} className="h-12 px-8 bg-taxable-blue text-white font-semibold rounded-xl  text-3">
                            Continue to Review
                        </button>
                    </div>
                )}

                {/* ── Review ── */}
                {subSection === 'review' && (
                    <div className="w-full max-w-[500px] mx-auto">
                        <h2 className="text-5 font-semibold text-neutral-800 mb-6">Your CIT calculation for 2025</h2>

                        <div className="space-y-10">
                        <div className="bg-white border border-neutral-200 rounded-2xl p-[12px]">
                            <LedgerRow label="Revenue" value={fmt(totalRev)} />
                            <LedgerRow label="Expenses" value={`-${fmt(totalExp)}`} />
                            <LedgerRow label="NHF (2.5%)" value={`-${fmt(nhf)}`} />
                            <LedgerRow label="Accounting Profit" value={fmt(accountingProfit)} bold />

                            <SectionHeader label="Tax Adjustments" />
                            <LedgerRow label="Non-deductible expenses" value={`+${fmt(num(nonDeductible))}`} indent />
                            <LedgerRow label="Capital Allowances" value={`-${fmt(num(capitalAllowances))}`} indent />
                            <LedgerRow label="Taxable Profit" value={fmt(taxableProfit)} bold />

                            <LedgerRow label="CIT Rate (30%)" value={fmt(citRate)} />
                            <LedgerRow label="Education Tax (2.5%)" value={fmt(eduTax)} />
                            <LedgerRow label="Gross Tax Due" value={fmt(grossTaxDue)} bold />

                            <SectionHeader label="Credits" />
                            <LedgerRow label="WHT Credits" value={`-${fmt(totalWHTCredits)}`} indent />
                            <LedgerRow label="Quarterly payments" value={`-₦0`} indent />
                            <LedgerRow label="Net Tax Payable" value={fmt(netTaxPayable)} bold />
                        </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 h-12 border border-neutral-300 text-neutral-800 font-semibold rounded-xl   text-3">
                                Download PDF
                            </button>
                            <button onClick={() => setShowFilingModal(true)} className="flex-1 h-12 bg-taxable-blue text-white font-semibold rounded-xl  text-3">
                                File & Pay
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

// ── Standalone page wrapper (keeps old route working) ───────────────────
export default function BusinessCIT() {
    const _router = useRouter();
    return (
        <div className="min-h-screen bg-white pb-20">
            <DashboardHeader />
            <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
                <BusinessCITContent />
            </main>
        </div>
    );
}
