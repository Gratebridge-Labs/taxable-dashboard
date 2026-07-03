'use client';
import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Drawer, DrawerContent, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import {
    Stepper, StepperItem, StepperIndicator, StepperTitle,
    StepperSeparator, StepperTrigger,
} from '@/components/ui/stepper';
import { PrimaryButton, SecondaryButton, SecondaryButtonSm, FormFieldRow, FormLabel } from './TaxFolderShared';
import { FilingSheet } from './TaxFolderShared';
import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';
import { InformationFill } from '@mingcute/react';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) => `₦${Math.round(n).toLocaleString()}`;
const num = (s: string) => Number(s.replace(/,/g, '')) || 0;

// ── Hint Icon ─────────────────────────────────────────────────────────────────
const HintIcon = ({ tip }: { tip: string }) => (
    <span className="relative group inline-flex items-center ml-1 align-middle cursor-default">
        <InformationFill className="w-3.5 h-3.5" color="#E5E5E5" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-neutral-800 text-white text-1 leading-snug rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40 font-medium">
            {tip}
        </div>
    </span>
);

const fmtInput = (set: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    const parts = raw.split('.');
    const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    set(parts.length > 1 ? integer + '.' + parts.slice(1).join('') : integer);
};

// ── Left Sidebar ─────────────────────────────────────────────────────────────
const LeftSidebar = ({
    activeSubSection, onSubSection, router, payQuarterly,
}: {
    activeSubSection: string;
    onSubSection: (s: string) => void;
    router: ReturnType<typeof useRouter>;
    payQuarterly?: boolean;
}) => {
    const filteredSubSections = CIT_SUBSECTIONS.filter(s => payQuarterly || s.key !== 'quarterly');
    const NAV = [
        { key: 'company-info', label: 'Company Information', route: '/tax-folders/business' },
        { key: 'paye', label: 'PAYE', route: '/tax-folders/business-paye' },
        { key: 'vat-wht', label: 'VAT/WHT', route: '/tax-folders/business-vat-wht' },
        { key: 'cit', label: 'Company Income Tax', route: null, children: filteredSubSections },
    ];
    return (
        <div className="w-[200px] flex-shrink-0 hidden md:block">
            <div className="space-y-4">
                {NAV.map(item => {
                    const isActive = item.children ? item.children.some(c => c.key === activeSubSection) : false;
                    return (
                        <div key={item.key}>
                            <button
                                onClick={() => { if (item.route) router.push(item.route); }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-2 font-semibold ${isActive ? 'bg-neutral-100 text-neutral-800' : 'text-neutral-500'}`}>
                                <span className="text-3 leading-none">📁</span>
                                {item.label}
                            </button>
                            {item.children && isActive && (
                                <div className="ml-5 mt-1 space-y-0.5 border-l-2 border-neutral-100 pl-3">
                                    {item.children.map(sub => (
                                        <button key={sub.key}
                                            onClick={() => onSubSection(sub.key)}
                                            className={`block w-full text-left py-1.5 text-2 font-medium ${activeSubSection === sub.key ? 'text-neutral-800' : 'text-neutral-500'}`}>
                                            {sub.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

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

// ── Section header in review ledger ───────────────────────────────────────────
const SectionHeader = ({ label }: { label: string }) => (
    <div className="flex items-center gap-2 py-2.5 border-t border-neutral-100 mt-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-neutral-400" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span className="text-2 font-semibold text-neutral-600">{label}</span>
    </div>
);

// ── WHT Credit Form Content (read-only + editable) ─────────────────────────────
function CreditFormContent({
    form, onChange, disabled, readOnlyStyle,
    certificateFiles, setCertificateFiles, certificateRef,
}: {
    form: { clientName: string; clientTIN: string; creditRef: string; grossValue: string; withheldAmount: string };
    onChange: (k: string, v: string) => void;
    disabled: boolean;
    readOnlyStyle: string;
    certificateFiles: { name: string }[];
    setCertificateFiles: React.Dispatch<React.SetStateAction<{ name: string }[]>>;
    certificateRef: React.RefObject<HTMLInputElement | null>;
}) {
    return (
        <>
            <div className="bg-neutral-50 rounded-3xl p-5">
                <div className="space-y-3">
                                                    <FormFieldRow className="justify-between">
                                                        <FormLabel tip="The company or person that deducted WHT from payments to you.">Payer / Client Name</FormLabel>
                                                        <Input type="text" placeholder="e.g., MTN Nigeria Communications Plc" value={form.clientName} onChange={e => onChange('clientName', e.target.value)} disabled={disabled} className={`w-[180px] text-left ${readOnlyStyle}`} />
                                                    </FormFieldRow>
                                                    <FormFieldRow className="justify-between">
                                                        <FormLabel tip="Tax Identification Number of the withholder.">Payer Tax Identification Number (TIN)</FormLabel>
                                                        <Input type="text" placeholder="10 to 14-digit FIRS TIN" value={form.clientTIN} onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ''); if (v.length <= 14) onChange('clientTIN', v); }} disabled={disabled} className={`w-[180px] text-left ${readOnlyStyle}`} />
                                                    </FormFieldRow>
                                                    <FormFieldRow className="justify-between">
                                                        <FormLabel tip="The unique digital certificate ID issued on the government portal when your client remitted the tax.">FIRS Credit Note Reference Number</FormLabel>
                                                        <Input type="text" placeholder="e.g., WHT/2026/XXXXX" value={form.creditRef} onChange={e => onChange('creditRef', e.target.value)} disabled={disabled} className={`w-[180px] text-left ${readOnlyStyle}`} />
                                                    </FormFieldRow>
                                                    <FormFieldRow className="justify-between">
                                                        <FormLabel tip="Total contract value before WHT deduction.">Gross Invoice Value</FormLabel>
                                                        <Input type="text" placeholder="₦ 0.00" value={form.grossValue} onChange={e => { const raw = e.target.value.replace(/[^0-9.]/g, ''); const parts = raw.split('.'); const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); onChange('grossValue', parts.length > 1 ? integer + '.' + parts.slice(1).join('') : integer); }} disabled={disabled} className={`w-[180px] text-left ${readOnlyStyle}`} />
                                                    </FormFieldRow>
                                                    <FormFieldRow className="justify-between">
                                                        <FormLabel tip="Actual WHT deducted, as stated on the credit note.">Withheld Amount (Credit Value)</FormLabel>
                                                        <Input type="text" placeholder="₦ 0.00" value={form.withheldAmount} onChange={e => onChange('withheldAmount', e.target.value.replace(/[^0-9.]/g, ''))} disabled={disabled} className={`w-[180px] text-left ${readOnlyStyle}`} />
                    </FormFieldRow>
                </div>
            </div>

            <div className="bg-neutral-50 rounded-3xl p-5">
                <h3 className="text-3 font-semibold text-neutral-800 mb-4">Upload FIRS WHT Credit Certificate <span className="text-red-500">*</span></h3>
                {disabled ? (
                    <p className={`text-3 font-medium ${readOnlyStyle}`}>No certificate uploaded</p>
                ) : (
                    <>
                        <div className="bg-white flex items-center justify-between gap-4 p-3 border border-dashed border-neutral-200 rounded-xl">
                            <span className="text-1 text-neutral-400 font-medium">image or PDF certificate received</span>
                            <button onClick={() => certificateRef.current?.click()} className="cursor-pointer text-2 font-semibold text-taxable-blue bg-transparent border-none p-0">Upload</button>
                            <input ref={certificateRef} type="file" hidden accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => { const f = e.target.files; if (!f) return; setCertificateFiles(prev => [...prev, ...Array.from(f).map(x => ({ name: x.name }))]); e.target.value = ''; }} />
                        </div>
                        {certificateFiles.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {certificateFiles.map((f, i) => (
                                    <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-neutral-100 rounded-lg">
                                        <span className="text-1 text-neutral-600">{f.name}</span>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-neutral-400 cursor-pointer" onClick={() => setCertificateFiles(prev => prev.filter((_, j) => j !== i))}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

const CIT_SUBSECTIONS = [
    { key: 'quarterly', label: 'Quarterly Assessments' },
    { key: 'file-returns', label: 'File Annual Returns' },
];

// ── Embeddable content component (no page shell) ──────────────────────────────
export function BusinessCITContent({
    activeSubMenu,
    onSubMenuChange,
    payQuarterly,
    estimatedAnnualRevenue,
    profitMargin,
    onEstimatedRevenueChange,
    onProfitMarginChange,
}: {
    activeSubMenu?: 'quarterly' | 'file-returns';
    onSubMenuChange?: (s: 'quarterly' | 'file-returns') => void;
    payQuarterly?: boolean;
    estimatedAnnualRevenue?: string;
    profitMargin?: string;
    onEstimatedRevenueChange?: (v: string) => void;
    onProfitMarginChange?: (v: string) => void;
} = {}) {
    const router = useRouter();
    const [internalSubSection, setInternalSubSection] = useState<'quarterly' | 'file-returns'>('quarterly');
    const subSection = activeSubMenu ?? internalSubSection;
    const setSubSectionLocal = onSubMenuChange ?? setInternalSubSection;

    const setSubSection = (s: 'quarterly' | 'file-returns') => {
        setSubSectionLocal(s);
        if (s === 'file-returns') {
            setAnnualStep('financials');
            setCompletedAnnualSteps(new Set());
        }
    };

    const goForward = (target: 'financials' | 'tax-adjustments' | 'wht-credits' | 'review') => {
        const stepNum: Record<string, number> = { financials: 1, 'tax-adjustments': 2, 'wht-credits': 3, review: 4 };
        const currentStepNum = stepNum[annualStep];
        if (currentStepNum) setCompletedAnnualSteps(prev => new Set([...prev, currentStepNum]));
        setAnnualStep(target);
    };

    const [showFilingReviewSheet, setShowFilingReviewSheet] = useState(false);
    const [annualStep, setAnnualStep] = useState<'financials' | 'tax-adjustments' | 'wht-credits' | 'review'>('financials');
    const [completedAnnualSteps, setCompletedAnnualSteps] = useState<Set<number>>(new Set());

   // Quarterly assessments
   const [quarterPayments, setQuarterPayments] = useState<Record<number, number>>({0: 0, 1: 0});
   const [deferredQuarters, setDeferredQuarters] = useState<Set<number>>(new Set());
   const [showDeferModal, setShowDeferModal] = useState(false);
   const [deferModalQuarter, setDeferModalQuarter] = useState<number | null>(null);
   const [payQuarter, setPayQuarter] = useState<number | null>(null);
   const [pendingQuarterAmount, setPendingQuarterAmount] = useState(0);
   const [showFilingSheet, setShowFilingSheet] = useState(false);
   const [showEstimateDrawer, setShowEstimateDrawer] = useState(false);
   const [editRevenue, setEditRevenue] = useState('');
   const [editMargin, setEditMargin] = useState('20%');

    // Financials
    const [totalRevenue, setTotalRevenue] = useState('');
    const [cogs, setCogs] = useState('');
    const [opex, setOpex] = useState('');
    const [auditedFiles, setAuditedFiles] = useState<{ name: string }[]>([]);
    const [trialBalanceFiles, setTrialBalanceFiles] = useState<{ name: string }[]>([]);
    const auditedInputRef = useRef<HTMLInputElement>(null);
    const trialBalanceInputRef = useRef<HTMLInputElement>(null);

    // Tax Adjustments
    const [govFines, setGovFines] = useState('');
    const [accountingDepreciation, setAccountingDepreciation] = useState('');
    const [generalProvisions, setGeneralProvisions] = useState('');
    const [class1Assets, setClass1Assets] = useState('');
    const [class2Assets, setClass2Assets] = useState('');
    const [class3Assets, setClass3Assets] = useState('');

    // WHT Credits
    const [whtCredits, setWhtCredits] = useState<{
        clientName: string; clientTIN: string; creditRef: string;
        grossValue: string; withheldAmount: string;
    }[]>([]);
    const [whtCreditStep, setWhtCreditStep] = useState<'method' | 'table'>('method');
    const [creditEntryMethod, setCreditEntryMethod] = useState<'manual' | 'csv' | 'software'>('manual');
    const [showCreditSheet, setShowCreditSheet] = useState(false);
    const [editCreditIdx, setEditCreditIdx] = useState<number | null>(null);
    const [isEditingCredit, setIsEditingCredit] = useState(false);
    const [showRemoveCredit, setShowRemoveCredit] = useState(false);

    const defaultCreditForm = () => ({
        clientName: '', clientTIN: '', creditRef: '',
        grossValue: '', withheldAmount: '',
    });

    const [creditForm, setCreditForm] = useState(defaultCreditForm);
    const [creditCertificateFiles, setCreditCertificateFiles] = useState<{ name: string }[]>([]);
    const creditCertificateRef = useRef<HTMLInputElement>(null);

    // Derived financials
    const totalRev = num(totalRevenue);
    const totalExp = num(cogs) + num(opex);
    const nhf = totalRev * 0.025;
    const accountingProfit = totalRev - totalExp - nhf;
    const nonDeductibleTotal = num(govFines) + num(accountingDepreciation) + num(generalProvisions);
    const totalCapitalAllowances = num(class1Assets) * 0.10 + num(class2Assets) * 0.20 + num(class3Assets) * 0.25;
    const adjustedTaxableProfit = accountingProfit + nonDeductibleTotal - totalCapitalAllowances;
    const citRate = adjustedTaxableProfit * 0.30;
    const eduTax = adjustedTaxableProfit * 0.025;
    const grossTaxDue = citRate + eduTax;
    const totalWHTCredits = whtCredits.reduce((s, c) => s + num(c.withheldAmount), 0);
    const netTaxPayable = Math.max(0, grossTaxDue - totalWHTCredits);

    const _breadcrumb = subSection === 'quarterly' ? 'Quarterly Assessments'
        : 'File Annual Returns';

    const handleFileQuarter = () => {
        if (payQuarter !== null) {
            setQuarterPayments(prev => ({ ...prev, [payQuarter]: pendingQuarterAmount }));
            setPayQuarter(null);
            setPendingQuarterAmount(0);
        }
    };

    const goBack = (target: 'financials' | 'tax-adjustments' | 'wht-credits' | 'review') => {
        setAnnualStep(target);
    };

    const CREDIT_ENTRY_OPTIONS = [
        { id: 'manual' as const, label: 'Manual entry' },
        { id: 'csv' as const, label: 'Upload WHT credit notes (CSV/Excel)' },
        { id: 'software' as const, label: 'Connect accounting software (QuickBooks, Xero, Zoho)' },
    ];

    const openAddCredit = () => {
        setCreditForm(defaultCreditForm());
        setCreditCertificateFiles([]);
        setEditCreditIdx(null);
        setIsEditingCredit(false);
        setShowRemoveCredit(false);
        setShowCreditSheet(true);
    };

    const openEditCredit = (idx: number) => {
        const c = whtCredits[idx];
        setCreditForm({
            clientName: c.clientName, clientTIN: c.clientTIN, creditRef: c.creditRef,
            grossValue: c.grossValue, withheldAmount: c.withheldAmount,
        });
        setCreditCertificateFiles([]);
        setEditCreditIdx(idx);
        setIsEditingCredit(false);
        setShowRemoveCredit(false);
        setShowCreditSheet(true);
    };

    const handleSaveCredit = () => {
        if (editCreditIdx !== null) {
            const r = [...whtCredits];
            r[editCreditIdx] = creditForm;
            setWhtCredits(r);
        } else {
            setWhtCredits(prev => [...prev, creditForm]);
        }
        setShowCreditSheet(false);
        setEditCreditIdx(null);
        setIsEditingCredit(false);
        setWhtCreditStep('table');
    };

    const handleRemoveCredit = () => {
        if (editCreditIdx !== null) {
            setWhtCredits(prev => prev.filter((_, i) => i !== editCreditIdx));
        }
        setShowRemoveCredit(false);
        setShowCreditSheet(false);
        setEditCreditIdx(null);
        setIsEditingCredit(false);
    };

    const handleCancelCredit = () => {
        if (isEditingCredit && editCreditIdx !== null) {
            const c = whtCredits[editCreditIdx];
            setCreditForm({
                clientName: c.clientName, clientTIN: c.clientTIN, creditRef: c.creditRef,
                grossValue: c.grossValue, withheldAmount: c.withheldAmount,
            });
            setCreditCertificateFiles([]);
            setIsEditingCredit(false);
        } else {
            setShowCreditSheet(false);
            setEditCreditIdx(null);
            setIsEditingCredit(false);
        }
    };

    const CIT_ANNUAL_STEPS = [
        { key: 'financials', step: 1, title: 'Financial Inputs' },
        { key: 'tax-adjustments', step: 2, title: 'Tax Adjustments' },
        { key: 'wht-credits', step: 3, title: 'WHT Credits' },
        { key: 'review', step: 4, title: 'Review' },
    ];

    const stepIndex = annualStep === 'financials' ? 1
        : annualStep === 'tax-adjustments' ? 2
        : annualStep === 'wht-credits' ? 3
        : 4;

   return (
      <div className="flex items-start gap-8 w-full">
        {!activeSubMenu && (
                <LeftSidebar
                    activeSubSection={subSection}
                    onSubSection={s => setSubSection(s as 'quarterly' | 'file-returns')}
                    router={router}
                    payQuarterly={payQuarterly}
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
              const initialPerQuarter = totalCIT / 4;
              const qFmt = (n: number) => `₦${Math.round(n).toLocaleString()}`;
              const quarters = [
                { label: 'Q1 2026', due: 'Mar 31' },
                { label: 'Q2 2026', due: 'Jun 30' },
                { label: 'Q3 2026', due: 'Sep 30' },
                { label: 'Q4 2026', due: 'Dec 31' },
              ];
              const paidQSet = new Set(Object.keys(quarterPayments).filter(k => quarterPayments[Number(k)] > 0).map(Number));
              const totalPaid = Object.values(quarterPayments).reduce((s, v) => s + v, 0);
              const settledCount = paidQSet.size + deferredQuarters.size;
              const allSettled = settledCount === 4;
              const allPaid = paidQSet.size === 4;
              const remainingCIT = Math.max(0, totalCIT - totalPaid);
              const remainingQCount = 4 - paidQSet.size - deferredQuarters.size;
              const adjustedPerQuarter = remainingQCount > 0 ? remainingCIT / remainingQCount : 0;
              const paidPct = totalCIT > 0 ? Math.round((totalPaid / totalCIT) * 100) : 0;
              const nextUnpaid = quarters.findIndex((_, i) => !paidQSet.has(i) && !deferredQuarters.has(i));

              return (
                <div className="w-full max-w-[500px] mx-auto">
                   {/* Defer confirmation modal */}
                   {showDeferModal && deferModalQuarter !== null && createPortal(
                      <div className="fixed inset-0 z-[200] flex items-center justify-center">
                        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowDeferModal(false)} />
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
                   </div>, document.body)}

                   <div className="flex items-start justify-between mb-8">
                      <div>
                        <h2 className="text-5 font-semibold text-neutral-800 tracking-[-0.02em]">Quarterly Assessments (2026)</h2>
                        <p className="text-2 text-neutral-500 font-medium">Pay your estimated CIT in quarterly installments</p>
                      </div>
                      <SecondaryButtonSm onClick={() => { setEditRevenue(estimatedAnnualRevenue || ''); setEditMargin(profitMargin || '20%'); setShowEstimateDrawer(true); }}>
                        Edit Estimates
                      </SecondaryButtonSm>
                   </div>

                   <div className="space-y-12">
                   <div className="flex flex-col gap-6">
                   {/* Summary */}
                   <div className="space-y-4">
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
                        <span className="font-semibold text-neutral-800">{qFmt(initialPerQuarter)}</span>
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
                           {quarters.map((q, i) => {
                              const amount = quarterPayments[i] || (adjustedPerQuarter > 0 ? adjustedPerQuarter : 0);
                              const isCovered = remainingCIT <= 0 && !paidQSet.has(i) && !deferredQuarters.has(i);
                              return (
                              <TableRow key={q.label}>
                                <TableCell className="px-6 py-4 font-medium text-neutral-500">{q.label}</TableCell>
                                <TableCell className="px-6 py-4 text-neutral-500">{q.due}</TableCell>
                                <TableCell className="px-6 py-4 font-medium text-neutral-700">{amount > 0 ? qFmt(amount) : '—'}</TableCell>
                                <TableCell className="px-6 py-4">
                                   {paidQSet.has(i) ? (
                                      <Badge className="bg-green-50 text-green-600 border-green-200 text-1 font-medium px-2 py-0 h-5">Paid</Badge>
                                   ) : isCovered ? (
                                      <Badge className="bg-neutral-100 text-green-600 border-green-200 text-1 font-medium px-2 py-0 h-5">Covered</Badge>
                                   ) : deferredQuarters.has(i) ? (
                                      <Badge className="bg-amber-50 text-amber-600 border-amber-200 text-1 font-medium px-2 py-0 h-5">Deferred</Badge>
                                   ) : i === nextUnpaid && nextUnpaid === 3 ? null : i === nextUnpaid ? (
                                      <Badge className="bg-amber-50 text-amber-600 border-amber-200 text-1 font-medium px-2 py-0 h-5">Pending</Badge>
                                   ) : (
                                      <Badge className="bg-neutral-100 text-neutral-500 border-neutral-200 text-1 font-medium px-2 py-0 h-5">Upcoming</Badge>
                                   )}
                                </TableCell>
                              </TableRow>
                              );
                           })}
                        </TableBody>
                      </Table>
                      {nextUnpaid !== -1 && (
                        <div className="px-6 py-4 border-t border-neutral-50">
                           {nextUnpaid === 3 ? (
                              <div className="flex gap-3">
                                <SecondaryButton onClick={() => { setDeferModalQuarter(3); setShowDeferModal(true); }} className="flex-1">
                                   Defer to Annual Filing
                                </SecondaryButton>
                                <PrimaryButton onClick={() => { setPendingQuarterAmount(adjustedPerQuarter); setPayQuarter(nextUnpaid); setShowFilingSheet(true); }} className="flex-1">
                                   File Q4 taxes
                                </PrimaryButton>
                              </div>
                           ) : (
                              <PrimaryButton onClick={() => { setPendingQuarterAmount(adjustedPerQuarter); setPayQuarter(nextUnpaid); setShowFilingSheet(true); }} className="w-full">
                                File Q{nextUnpaid + 1} taxes
                              </PrimaryButton>
                           )}
                        </div>
                      )}
                   </div>

                   {/* Estimate editing drawer */}
                   <Drawer open={showEstimateDrawer} onOpenChange={(o) => { if (!o) setShowEstimateDrawer(false); }}>
                      <DrawerContent className="bg-white w-full max-w-full px-4 pb-6">
                        <DrawerTitle className="sr-only">Edit Estimates</DrawerTitle>
                        <div className="max-w-[420px] mx-auto w-full pt-6">
                           <h2 className="text-5 font-semibold text-neutral-800 tracking-[-0.02em] mb-8 text-center">Edit Estimates</h2>
                           <div className="space-y-6">
                              <div>
                                <label className="block text-2 font-medium text-neutral-500 mb-1">
                                   Estimated annual gross revenue
                                   <HintIcon tip="Your projected gross revenue for the current tax year." />
                                </label>
                                <Input type="text" placeholder="₦ 0.00" value={editRevenue}
                                   onChange={e => { const raw = e.target.value.replace(/[^0-9.]/g, ''); const parts = raw.split('.'); const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); setEditRevenue(parts.length > 1 ? integer + '.' + parts.slice(1).join('') : integer); }} />
                              </div>
                              <div>
                                <label className="block text-2 font-medium text-neutral-500 mb-2">
                                   Estimated profit margin
                                   <HintIcon tip="Your estimated profit as a percentage of revenue." />
                                </label>
                                <div className="flex gap-2">
                                   {['10%', '15%', '20%', '25%', '30%'].map(m => (
                                      <button key={m} type="button"
                                        onClick={() => setEditMargin(m)}
                                        className={`h-8 px-3 rounded-full text-1 font-semibold ${editMargin === m ? 'bg-neutral-800 text-white' : 'bg-white border border-neutral-200 text-neutral-400'}`}
                                      >{m}</button>
                                   ))}
                              </div>
                           </div>
                           <hr className="border-neutral-100" />
                            {(() => {
                               const editRev = Number((editRevenue || '').replace(/,/g, '')) || 0;
                               const editMarg = editMargin ? Number(editMargin.replace('%', '')) / 100 : 0;
                               const editCIT = editRev * editMarg * 0.30;
                               const editQtr = editCIT / 4;
                               return (
                                <div className="space-y-3">
                                   <div className="flex items-center justify-between text-2">
                                      <span className="text-neutral-500 font-medium">Estimated annual CIT</span>
                                      <span className="font-semibold text-neutral-800">{editRev > 0 ? fmt(editCIT) : '—'}</span>
                                   </div>
                                   <div className="flex items-center justify-between text-2">
                                      <span className="text-neutral-500 font-medium">Quarterly installment</span>
                                      <span className="font-semibold text-neutral-800">{editRev > 0 ? fmt(editQtr) : '—'}</span>
                                   </div>
                                </div>
                              );
                           })()}
                        </div>
                        <div className="flex gap-3 mt-8">
                              <DrawerClose asChild>
                                <SecondaryButton className="flex-1">Cancel</SecondaryButton>
                              </DrawerClose>
                              <PrimaryButton className="flex-1" onClick={() => {
                                onEstimatedRevenueChange?.(editRevenue);
                                onProfitMarginChange?.(editMargin);
                                setShowEstimateDrawer(false);
                              }}>Save</PrimaryButton>
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
                        <p className="text-7 font-semibold text-neutral-800">{qFmt(remainingCIT)}</p>
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

           <FilingSheet
              open={showFilingSheet}
              onClose={() => { setShowFilingSheet(false); setPayQuarter(null); setPendingQuarterAmount(0); }}
              onFile={handleFileQuarter}
           />

            {/* ── File Annual Returns (with Stepper) ── */}
            {subSection === 'file-returns' && (
                <div className="w-full">
                    {/* Stepper header */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-5 font-semibold text-neutral-800 tracking-[-0.02em]">
                                File 2025 Annual CIT Return
                            </h1>
                        </div>

                        <Stepper value={stepIndex} onValueChange={(s) => {
                            const map: Record<number, 'financials' | 'tax-adjustments' | 'wht-credits' | 'review'> = {
                                1: 'financials', 2: 'tax-adjustments', 3: 'wht-credits', 4: 'review',
                            };
                            if (s <= stepIndex) goBack(map[s]);
                        }}>
                            {CIT_ANNUAL_STEPS.map((s, idx) => (
                                <StepperItem key={s.key} step={s.step} completed={completedAnnualSteps.has(s.step)} disabled={s.step > stepIndex} className="[&:not(:last-child)]:flex-1 data-[state=inactive]:[&_h3]:text-neutral-400 [&_h3]:text-neutral-800">
                                    <StepperTrigger className="flex items-center gap-3 max-md:flex-col">
                                        <StepperIndicator />
                                        <div className="text-center md:text-left">
                                            <StepperTitle className="text-2 font-medium">{s.title}</StepperTitle>
                                        </div>
                                    </StepperTrigger>
                                    {idx < CIT_ANNUAL_STEPS.length - 1 && <StepperSeparator className="md:mx-4" />}
                                </StepperItem>
                            ))}
                        </Stepper>
                    </div>

                    {/* Step 1: Financial Inputs */}
                    {annualStep === 'financials' && (
                        <div className="w-full max-w-[500px] mx-auto" data-animate>
                            <div className="space-y-6">
                                {/* Section 1: Core Revenue & Cost Inputs */}
                                <div className="bg-neutral-50 rounded-3xl p-5">
                                    <h3 className="text-3 font-semibold text-neutral-800 mb-4">Core Revenue & Cost Inputs</h3>
                                    <div className="space-y-3">
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="The total gross sales or income generated by your business during the 12-month fiscal year.">Total Revenue / Turnover</FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={totalRevenue} onChange={fmtInput(setTotalRevenue)} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="Direct costs attributable to the production or purchase of the goods sold by your business.">Cost of Sales (COGS)</FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={cogs} onChange={fmtInput(setCogs)} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="General administrative and running costs (e.g., office rent, salaries, utilities, marketing).">Operating Expenses (OPEX)</FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={opex} onChange={fmtInput(setOpex)} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                    </div>
                                </div>

                                {/* Section 2: Accounting Baseline */}
                                <div className="bg-neutral-50 rounded-3xl p-5">
                                    <h3 className="text-3 font-semibold text-neutral-800 mb-4">Accounting Baseline</h3>
                                    <FormFieldRow className="justify-between">
                                        <FormLabel tip="Automatically calculated: Total Revenue − Cost of Sales − Operating Expenses. This is the starting point for tax adjustments in the next step.">Net Profit Before Tax</FormLabel>
                                        <Input type="text" value={totalRev > 0 ? fmt(totalRev - num(cogs) - num(opex)) : '₦ 0.00'} disabled className="w-[180px] text-left bg-neutral-50 text-neutral-400" />
                                    </FormFieldRow>
                                </div>

                                {/* Section 3: Document Evidence Layer */}
                                <div className="bg-neutral-50 rounded-3xl p-5">
                                    <h3 className="text-3 font-semibold text-neutral-800 mb-4">Document Evidence Layer</h3>
                                     <div className="space-y-6">
                                        <div>
                                            <p className="text-2 font-medium text-neutral-500 mb-2">Audited Financial Statements <span className="text-red-500">*</span></p>
                                            <div className="bg-white flex items-center justify-between gap-4 p-3 border border-dashed border-neutral-200 rounded-xl">
                                                <div className="flex items-center gap-2.5">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                                    <span className="text-1 text-neutral-400 font-medium">Upload Audited Financial Statements</span>
                                                </div>
                                                <button onClick={() => auditedInputRef.current?.click()} className="cursor-pointer text-2 font-semibold text-taxable-blue bg-transparent border-none p-0">
                                                    Upload
                                                </button>
                                                <input ref={auditedInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const files = e.target.files; if (!files) return; setAuditedFiles(prev => [...prev, ...Array.from(files).map(f => ({ name: f.name }))]); e.target.value = ''; }} />
                                            </div>
                                            {auditedFiles.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {auditedFiles.map((f, i) => (
                                                        <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-neutral-100 rounded-lg">
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                                            <span className="text-1 text-neutral-600">{f.name}</span>
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-neutral-400 cursor-pointer" onClick={() => setAuditedFiles(prev => prev.filter((_, j) => j !== i))}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-2 font-medium text-neutral-500 mb-2">Trial Balance / General Ledger <span className="text-neutral-400 font-medium text-1">(Optional)</span></p>
                                            <div className="bg-white flex items-center justify-between gap-4 p-3 border border-dashed border-neutral-200 rounded-xl">
                                                <div className="flex items-center gap-2.5">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                                    <span className="text-1 text-neutral-400 font-medium">Upload Trial Balance</span>
                                                </div>
                                                <button onClick={() => trialBalanceInputRef.current?.click()} className="cursor-pointer text-2 font-semibold text-taxable-blue bg-transparent border-none p-0">
                                                    Upload
                                                </button>
                                                <input ref={trialBalanceInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => { const files = e.target.files; if (!files) return; setTrialBalanceFiles(prev => [...prev, ...Array.from(files).map(f => ({ name: f.name }))]); e.target.value = ''; }} />
                                            </div>
                                            {trialBalanceFiles.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {trialBalanceFiles.map((f, i) => (
                                                        <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-neutral-100 rounded-lg">
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                                            <span className="text-1 text-neutral-600">{f.name}</span>
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-neutral-400 cursor-pointer" onClick={() => setTrialBalanceFiles(prev => prev.filter((_, j) => j !== i))}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <PrimaryButton onClick={() => goForward('tax-adjustments')} disabled={!totalRevenue}>
                                    Next: Tax Adjustments
                                </PrimaryButton>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Tax Adjustments */}
                    {annualStep === 'tax-adjustments' && (
                        <div className="w-full max-w-[500px] mx-auto" data-animate>
                            <div className="space-y-6">
                                {/* Section 1: Non-Deductible Expenses */}
                                <div className="bg-neutral-50 rounded-3xl p-5">
                                    <h3 className="text-3 font-semibold text-neutral-800 mb-4">Non-Deductible Expenses (Add-backs)</h3>
                                    <div className="space-y-3">
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="Any fine or penalty paid to a Federal, State, or Local government agency for regulatory violations (these are strictly non-deductible by law).">Government Fines & Penalties</FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={govFines} onChange={fmtInput(setGovFines)} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="The standard depreciation written off on your financial statement. Tax law does not recognize accounting depreciation; it must be added back and replaced by Capital Allowances.">Accounting Depreciation</FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={accountingDepreciation} onChange={fmtInput(setAccountingDepreciation)} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="Estimated or general provisions for bad debts. Only actual, realized bad debts are tax-deductible.">General Provisions / Estimated Losses</FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={generalProvisions} onChange={fmtInput(setGeneralProvisions)} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                        <div className="border-t border-neutral-100 pt-3">
                                            <FormFieldRow className="justify-between">
                                                <span className="text-2 font-semibold text-neutral-600">Non-Deductible Expenses</span>
                                                <span className="text-2 font-medium text-neutral-600">{fmt(nonDeductibleTotal)}</span>
                                            </FormFieldRow>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Capital Allowances */}
                                <div className="bg-neutral-50 rounded-3xl p-5">
                                    <h3 className="text-3 font-semibold text-neutral-800 mb-4">Capital Allowances (Deductions)</h3>
                                    <div className="space-y-3">
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="Total qualifying cost of permanent buildings, communication masts, heavy transport, or agricultural plants.">Class 1 Assets <span className="text-neutral-400">(10% Tax Relief)</span></FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={class1Assets} onChange={fmtInput(setClass1Assets)} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="Total qualifying cost of general plant & machinery, office equipment, furniture, and fittings.">Class 2 Assets <span className="text-neutral-400">(20% Tax Relief)</span></FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={class2Assets} onChange={fmtInput(setClass2Assets)} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                        <FormFieldRow className="justify-between">
                                            <FormLabel tip="Total qualifying cost of motor vehicles, corporate software, and electronic applications.">Class 3 Assets <span className="text-neutral-400">(25% Tax Relief)</span></FormLabel>
                                            <Input type="text" placeholder="₦ 0.00" value={class3Assets} onChange={fmtInput(setClass3Assets)} className="w-[180px] text-left" />
                                        </FormFieldRow>
                                        <div className="border-t border-neutral-100 pt-3">
                                            <FormFieldRow className="justify-between">
                                                <span className="text-2 font-semibold text-neutral-600">Total Capital Allowances</span>
                                                <span className="text-2 font-medium text-neutral-600">{totalCapitalAllowances > 0 ? fmt(totalCapitalAllowances) : '₦ 0'}</span>
                                            </FormFieldRow>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Adjusted Taxable Profit */}
                                <div className="bg-neutral-50 rounded-3xl p-5">
                                    <h3 className="text-3 font-semibold text-neutral-800 mb-4">Adjusted Taxable Profit</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-2">
                                            <span className="text-neutral-500 font-medium">Net Profit Before Tax</span>
                                            <span className="font-medium text-neutral-500">{fmt(accountingProfit)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-2">
                                            <span className="text-neutral-500 font-medium">+ Non-Deductible Expenses</span>
                                            <span className="font-medium text-neutral-500">{fmt(nonDeductibleTotal)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-2">
                                            <span className="text-neutral-500 font-medium">− Capital Allowances</span>
                                            <span className="font-medium text-neutral-500">{fmt(totalCapitalAllowances)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-2 pt-2 border-t border-neutral-100">
                                            <span className="text-2 font-semibold text-neutral-800">Adjusted Taxable Profit</span>
                                            <span className="text-2 font-semibold text-neutral-800">{fmt(adjustedTaxableProfit)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <SecondaryButton onClick={() => goBack('financials')}>Back</SecondaryButton>
                                <PrimaryButton onClick={() => goForward('wht-credits')}>
                                    Next: WHT Credits
                                </PrimaryButton>
                            </div>
                        </div>
                    )}

                    {/* Step 4: WHT Credits */}
                    {annualStep === 'wht-credits' && (
                        <div className="w-full max-w-[800px] mx-auto" data-animate>

                            {whtCreditStep === 'method' ? (
                                <div className="max-w-[500px] mx-auto">
                                    <p className="text-3 font-semibold text-neutral-800 mb-4">Choose how you'd like to enter your WHT credit notes.</p>
                                    <RadioGroup value={creditEntryMethod} onValueChange={(v) => setCreditEntryMethod(v as 'manual' | 'csv' | 'software')} className="space-y-0 mb-4">
                                        {CREDIT_ENTRY_OPTIONS.map(opt => {
                                            const disabled = opt.id !== 'manual';
                                            return (
                                                <label key={opt.id} className={`flex items-center gap-3 py-3.5 cursor-pointer ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                                    <RadioGroupItem value={opt.id} disabled={disabled} />
                                                    <span className="text-3 font-medium text-neutral-800">{opt.label}</span>
                                                </label>
                                            );
                                        })}
                                    </RadioGroup>
                                    <div className="flex gap-3 mt-6">
                                        <div className="flex gap-3">
                                            <SecondaryButton onClick={() => goBack('tax-adjustments')}>Back</SecondaryButton>
                                            <SecondaryButton onClick={() => openAddCredit()}>Continue</SecondaryButton>
                                        </div>
                                        <PrimaryButton onClick={() => goForward('review')} className="ml-auto">Next: Review</PrimaryButton>
                                    </div>
                                </div>
                            ) : whtCredits.length === 0 && editCreditIdx === null ? (
                                <div className="max-w-[500px] mx-auto">
                                    <p className="text-3 font-semibold text-neutral-800 mb-4">Choose how you'd like to enter your WHT credit notes.</p>
                                    <RadioGroup value={creditEntryMethod} onValueChange={(v) => setCreditEntryMethod(v as 'manual' | 'csv' | 'software')} className="space-y-0 mb-4">
                                        {CREDIT_ENTRY_OPTIONS.map(opt => {
                                            const disabled = opt.id !== 'manual';
                                            return (
                                                <label key={opt.id} className={`flex items-center gap-3 py-3.5 cursor-pointer ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                                    <RadioGroupItem value={opt.id} disabled={disabled} />
                                                    <span className="text-3 font-medium text-neutral-800">{opt.label}</span>
                                                </label>
                                            );
                                        })}
                                    </RadioGroup>
                                    <div className="flex gap-3 mt-6">
                                        <div className="flex gap-3">
                                            <SecondaryButton onClick={() => goBack('tax-adjustments')}>Back</SecondaryButton>
                                            <SecondaryButton onClick={() => openAddCredit()}>Continue</SecondaryButton>
                                        </div>
                                        <PrimaryButton onClick={() => goForward('review')} className="ml-auto">Next: Review</PrimaryButton>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-3 font-semibold text-neutral-800">WHT Credit Notes</h3>
                                        <SecondaryButtonSm onClick={() => openAddCredit()}>Add WHT Credit Note</SecondaryButtonSm>
                                    </div>

                                    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden mb-6">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    {['Client Name', 'TIN', 'Credit Ref #', 'Gross Value', 'WHT Amount', 'Certificate'].map(h => (
                                                        <TableHead key={h} className="px-6 py-4 font-medium text-neutral-400 text-2">{h}</TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {whtCredits.map((c, idx) => (
                                                    <TableRow key={idx} className="cursor-pointer" onClick={() => openEditCredit(idx)}>
                                                        <TableCell className="px-6 py-4 text-2 font-medium text-neutral-600">{c.clientName || '—'}</TableCell>
                                                        <TableCell className="px-6 py-4 text-2 font-medium text-neutral-600">{c.clientTIN || '—'}</TableCell>
                                                        <TableCell className="px-6 py-4 text-2 font-medium text-neutral-600">{c.creditRef || '—'}</TableCell>
                                                        <TableCell className="px-6 py-4 text-2 font-medium text-neutral-600">{num(c.grossValue) > 0 ? fmt(num(c.grossValue)) : '—'}</TableCell>
                                                        <TableCell className="px-6 py-4 text-2 font-medium text-neutral-600">{num(c.withheldAmount) > 0 ? fmt(num(c.withheldAmount)) : '—'}</TableCell>
                                                        <TableCell className="px-6 py-4 text-2 font-medium text-neutral-600">—</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl mb-6">
                                        <span className="text-2 font-medium text-neutral-500">Total WHT Credits</span>
                                        <span className="text-2 font-semibold text-neutral-800">{fmt(totalWHTCredits)}</span>
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <SecondaryButton onClick={() => goBack('tax-adjustments')}>Back</SecondaryButton>
                                        <PrimaryButton onClick={() => goForward('review')} className="ml-auto">Next: Review</PrimaryButton>
                                    </div>
                                </div>
                            )}

                            {/* Credit Note Drawer */}
                            <Drawer open={showCreditSheet} onOpenChange={(o) => { if (!o) handleCancelCredit(); }}>
                                <DrawerContent className="bg-white w-full max-w-full px-4 pb-4 max-h-[85vh]">
                                    <DrawerTitle className="sr-only">{editCreditIdx !== null ? 'Edit WHT Credit Note' : 'Add WHT Credit Note'}</DrawerTitle>
                                    <div className="max-w-[550px] mx-auto w-full pt-2 text-center">
                                        <h2 className="text-5 font-semibold text-neutral-800 mb-8">{editCreditIdx !== null ? (isEditingCredit ? 'Edit Credit Note' : 'Credit Note Details') : 'Add WHT Credit Note'}</h2>
                                    </div>
                                    <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                                        <div className="max-w-[550px] mx-auto w-full space-y-6">
                                            <div className="relative overflow-hidden">
                                                <div className={`transition-transform duration-300 ease-in-out ${isEditingCredit ? '-translate-x-full' : 'translate-x-0'}`}>
                                                    {editCreditIdx !== null && (
                                                        <div className="space-y-6">
                                                            <CreditFormContent form={creditForm} onChange={(k, v) => setCreditForm(f => ({ ...f, [k]: v }))} disabled={true} readOnlyStyle="bg-neutral-50 text-neutral-400" certificateFiles={creditCertificateFiles} setCertificateFiles={setCreditCertificateFiles} certificateRef={creditCertificateRef} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${isEditingCredit ? 'translate-x-0' : 'translate-x-full'}`}>
                                                    {isEditingCredit && (
                                                        <div className="space-y-6">
                                                            <CreditFormContent form={creditForm} onChange={(k, v) => setCreditForm(f => ({ ...f, [k]: v }))} disabled={false} readOnlyStyle="" certificateFiles={creditCertificateFiles} setCertificateFiles={setCreditCertificateFiles} certificateRef={creditCertificateRef} />
                                                        </div>
                                                    )}
                                                </div>
                                                {editCreditIdx === null && (
                                                    <div className="space-y-6">
                                                        <CreditFormContent form={creditForm} onChange={(k, v) => setCreditForm(f => ({ ...f, [k]: v }))} disabled={false} readOnlyStyle="" certificateFiles={creditCertificateFiles} setCertificateFiles={setCreditCertificateFiles} certificateRef={creditCertificateRef} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="max-w-[550px] mx-auto w-full pt-4 border-t border-neutral-100 mt-2">
                                        <div className="flex gap-3">
                                            {editCreditIdx !== null && !isEditingCredit ? (
                                                <>
                                                    <button onClick={() => setShowRemoveCredit(true)} className="flex-1 h-12 border border-red-200 bg-red-50 text-red-600 font-semibold rounded-xl text-3">Remove</button>
                                                    <PrimaryButton className="flex-1" onClick={() => setIsEditingCredit(true)}>Edit Details</PrimaryButton>
                                                </>
                                            ) : editCreditIdx !== null && isEditingCredit ? (
                                                <>
                                                    <SecondaryButton className="flex-1" onClick={handleCancelCredit}>Cancel</SecondaryButton>
                                                    <PrimaryButton className="flex-1" onClick={handleSaveCredit}>Save</PrimaryButton>
                                                </>
                                            ) : (
                                                <>
                                                    <DrawerClose asChild>
                                                        <SecondaryButton className="flex-1">Cancel</SecondaryButton>
                                                    </DrawerClose>
                                                    <PrimaryButton className="flex-1" onClick={handleSaveCredit}>Save Credit Note</PrimaryButton>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Remove confirmation */}
                                    {showRemoveCredit && (
                                        <div className="fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-sm bg-black/20" onClick={() => setShowRemoveCredit(false)}>
                                            <div className="bg-white rounded-2xl p-6 max-w-[400px] mx-4 w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex flex-col items-center text-center">
                                                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                                    </div>
                                                    <h3 className="text-6 font-semibold text-neutral-800 mb-2">Remove Credit Note?</h3>
                                                    <p className="text-2 text-neutral-500 font-medium mb-6">This action cannot be undone.</p>
                                                    <div className="flex gap-3 w-full">
                                                        <SecondaryButton className="flex-1" onClick={() => setShowRemoveCredit(false)}>Cancel</SecondaryButton>
                                                        <button onClick={handleRemoveCredit} className="flex-1 h-12 bg-red-600 text-white font-semibold rounded-xl text-3">Remove</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </DrawerContent>
                            </Drawer>
                        </div>
                    )}

                    {/* Step 5: Review */}
                    {annualStep === 'review' && (
                        <div className="w-full max-w-[500px] mx-auto" data-animate>
                            <div className="space-y-10">
                            <div className="bg-white border border-neutral-200 rounded-2xl p-3">
                                <LedgerRow label="Revenue" value={fmt(totalRev)} />
                                <LedgerRow label="Expenses" value={`-${fmt(totalExp)}`} />
                                <LedgerRow label="NHF (2.5%)" value={`-${fmt(nhf)}`} />
                                <LedgerRow label="Accounting Profit" value={fmt(accountingProfit)} bold />

                                <SectionHeader label="Tax Adjustments" />
                                <LedgerRow label="Non-deductible expenses" value={`+${fmt(nonDeductibleTotal)}`} indent />
                                <LedgerRow label="Capital Allowances" value={`-${fmt(totalCapitalAllowances)}`} indent />
                                <LedgerRow label="Taxable Profit" value={fmt(adjustedTaxableProfit)} bold />

                                <LedgerRow label="CIT Rate (30%)" value={fmt(citRate)} />
                                <LedgerRow label="Education Tax (2.5%)" value={fmt(eduTax)} />
                                <LedgerRow label="Gross Tax Due" value={fmt(grossTaxDue)} bold />

                                <SectionHeader label="Credits" />
                                <LedgerRow label="WHT Credits" value={`-${fmt(totalWHTCredits)}`} indent />
                                <LedgerRow label="Quarterly payments" value={`-${fmt(Object.values(quarterPayments).reduce((s, v) => s + v, 0))}`} indent />
                                <LedgerRow label="Net Tax Payable" value={fmt(netTaxPayable)} bold />
                            </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <SecondaryButton onClick={() => goBack('wht-credits')}>Back</SecondaryButton>
                                <PrimaryButton onClick={() => setShowFilingReviewSheet(true)}>
                                    File & Pay
                                </PrimaryButton>
                            </div>

                            <FilingSheet
                                open={showFilingReviewSheet}
                                onClose={() => setShowFilingReviewSheet(false)}
                                onFile={() => setShowFilingReviewSheet(false)}
                            />
                        </div>
                    )}
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
