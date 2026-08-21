'use client';

import React, { useState, useRef, useEffect, useCallback, startTransition } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Drawer, DrawerContent, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import {
    Stepper, StepperItem, StepperIndicator, StepperTitle,
    StepperSeparator, StepperTrigger,
} from '@/components/ui/stepper';
import { Spinner } from '@/components/ui/spinner';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';
import { useTaxableApi } from '@/hooks/useTaxableApi';
import { prepareUploadFile, validateFileSize, MAX_UPLOAD_BYTES } from '@/lib/file-upload';
import type {
    CitFiling,
    CitQuarterlyData,
    CitWhtCredit,
    CsvImportData,
    UpsertCitRequest,
} from '@/types/api';

import { PrimaryButton, SecondaryButton, SecondaryButtonSm, FormFieldRow, FormLabel, FilingSheet } from './TaxFolderShared';
import { CsvImportPanel } from './CsvImportPanel';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) => `₦${Math.round(n).toLocaleString()}`;
const num = (s: string) => Number(String(s).replace(/,/g, '')) || 0;

const formatMoneyInput = (n: number | undefined | null): string => {
    if (n == null || n === 0) return '';
    const parts = String(n).split('.');
    const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length > 1 ? `${integer}.${parts[1]}` : integer;
};

const isNotFoundError = (err: unknown): boolean => {
    const message = err instanceof Error ? err.message : String(err ?? '');
    return /not found|404|no filing|no cit/i.test(message);
};

type WhtCreditUi = {
    id: string;
    clientName: string;
    clientTIN: string;
    creditRef: string;
    grossValue: string;
    withheldAmount: string;
    certificateUrl?: string;
};

const creditToUi = (c: CitWhtCredit): WhtCreditUi => ({
    id: c.id,
    clientName: c.clientName ?? '',
    clientTIN: c.clientTIN ?? '',
    creditRef: c.creditRef ?? '',
    grossValue: formatMoneyInput(c.grossValue),
    withheldAmount: formatMoneyInput(c.withheldAmount),
    certificateUrl: c.certificateUrl ?? undefined,
});

type AnnualStep = 'financials' | 'tax-adjustments' | 'wht-credits' | 'review';

// ── File Upload Section (standalone child component) ──────────────────────────
function FileUploadSection({
    label, description, accept, required, profileId, category, descriptionTag,
    onUploaded,
}: {
    label: string;
    description: string;
    accept: string;
    required?: boolean;
    profileId?: string;
    category: string;
    descriptionTag?: string;
    onUploaded: (urls: string[]) => void;
}) {
    const { uploadFile } = useTaxableApi();
    const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const el = inputRef.current;
        if (!el) return;
        const handler = async (e: Event) => {
            const fl = (e.target as HTMLInputElement).files;
            (e.target as HTMLInputElement).value = '';
            if (!fl || fl.length === 0) return;
            for (const f of Array.from(fl)) {
                if (!validateFileSize(f)) {
                    toast.error(`${f.name} is too large — max ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB`);
                    continue;
                }
                setUploading(true);
                try {
                    const prepared = (await prepareUploadFile(f)) ?? f;
                    const res = await uploadFile(profileId ?? 'default', prepared, category, descriptionTag ?? description);
                    const url = res?.data?.url;
                    if (!url) {
                        toast.error('Upload failed — no file URL returned.');
                        continue;
                    }
                    setFiles(prev => {
                        const next = [...prev, { name: f.name, url }];
                        onUploaded(next.map(x => x.url));
                        return next;
                    });
                    toast.success(`${label} uploaded`);
                } catch (err: unknown) {
                    console.error('[BusinessCIT] Failed to upload:', err instanceof Error ? err.message : 'Unknown error');
                    toast.error(err instanceof Error ? err.message : 'Failed to upload file. Please try again.');
                } finally {
                    setUploading(false);
                }
            }
        };
        el.addEventListener('change', handler);
        return () => el.removeEventListener('change', handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileId, category, description, descriptionTag, uploadFile]);

    return (
        <div className="bg-neutral-50 rounded-2xl p-5">
            <h3 className="text-3 font-semibold text-neutral-800 mb-4">
                {label} {required && <span className="text-destructive">*</span>}
                {!required && <span className="text-neutral-400 font-medium text-1">(Optional)</span>}
            </h3>
            <p className="text-1 font-medium text-neutral-500 mb-3">{description}</p>
            <div className="bg-white relative flex items-center justify-between gap-4 p-3 border border-dashed border-neutral-200 rounded-xl">
                <div className="flex items-center gap-2.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    <span className="text-1 text-neutral-400 font-medium">{(accept || '').split(',').join(', ').toUpperCase()} accepted</span>
                </div>
                <span className="text-2 font-semibold text-taxable-blue pointer-events-none">{uploading ? <Spinner className="size-4" /> : 'Upload'}</span>
                <input ref={inputRef} type="file" accept={accept} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
            </div>
            {files.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {files.map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-neutral-100 rounded-lg">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                            <span className="text-1 text-neutral-600">{f.name}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-neutral-400 cursor-pointer" onClick={() => setFiles(prev => {
                                const next = prev.filter((_, j) => j !== i);
                                onUploaded(next.map(x => x.url));
                                return next;
                            })}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

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

// ── WHT Credit Form Content (read-only + editable) ─────────────────────────────
function CreditFormContent({
    form, onChange, disabled, readOnlyStyle,
    certificateFiles, setCertificateFiles, certificateRef, certificateUploading,
}: {
    form: { clientName: string; clientTIN: string; creditRef: string; grossValue: string; withheldAmount: string };
    onChange: (k: string, v: string) => void;
    disabled: boolean;
    readOnlyStyle: string;
    certificateFiles: { name: string }[];
    setCertificateFiles: React.Dispatch<React.SetStateAction<{ name: string }[]>>;
    certificateRef: React.RefObject<HTMLInputElement | null>;
    certificateUploading?: boolean;
}) {
    return (
        <>
            <div className="bg-neutral-50 rounded-2xl p-5">
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

            <div className="bg-neutral-50 rounded-2xl p-5">
                <h3 className="text-3 font-semibold text-neutral-800 mb-4">Upload FIRS WHT Credit Certificate <span className="text-destructive">*</span></h3>
                {disabled ? (
                    <p className={`text-3 font-medium ${readOnlyStyle}`}>No certificate uploaded</p>
                ) : (
                    <>
                        <div className="bg-white flex items-center justify-between gap-4 p-3 border border-dashed border-neutral-200 rounded-xl">
                            <span className="text-1 text-neutral-400 font-medium">image or PDF certificate received</span>
                            <button onClick={() => certificateRef.current?.click()} disabled={certificateUploading} className="cursor-pointer text-2 font-semibold text-taxable-blue bg-transparent border-none p-0 disabled:opacity-50 disabled:cursor-not-allowed">{certificateUploading ? <Spinner className="size-4" /> : 'Upload'}</button>
                            <input ref={certificateRef} type="file" hidden accept=".pdf,.png,.jpg,.jpeg" />
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
    profileId = 'default',
    taxYear = '2025',
    estimatedAnnualRevenue,
    profitMargin,
    onEstimatedRevenueChange,
    onProfitMarginChange,
}: {
    activeSubMenu?: 'quarterly' | 'file-returns';
    onSubMenuChange?: (s: 'quarterly' | 'file-returns') => void;
    payQuarterly?: boolean;
    profileId?: string;
    taxYear?: string;
    estimatedAnnualRevenue?: string;
    profitMargin?: string;
    onEstimatedRevenueChange?: (v: string) => void;
    onProfitMarginChange?: (v: string) => void;
} = {}) {
    const router = useRouter();
    const {
        getCit,
        upsertCit,
        fileCit,
        listCitWhtCredits,
        createCitWhtCredit,
        updateCitWhtCredit,
        deleteCitWhtCredit,
        getCitQuarterly,
        payCitQuarter,
        deferCitQuarter,
        uploadFile,
    } = useTaxableApi();

    const yearNum = Number(taxYear) || new Date().getFullYear();
    const canSync = Boolean(profileId) && profileId !== 'default';

    const [internalSubSection, setInternalSubSection] = useState<'quarterly' | 'file-returns'>('quarterly');
    const subSection = activeSubMenu ?? internalSubSection;
    const setSubSectionLocal = onSubMenuChange ?? setInternalSubSection;

    const [loading, setLoading] = useState(canSync);
    const [saving, setSaving] = useState(false);
    const [showFilingReviewSheet, setShowFilingReviewSheet] = useState(false);
    const [annualReturnFiled, setAnnualReturnFiled] = useState(false);
    const [legalConfirm1, setLegalConfirm1] = useState(false);
    const [legalConfirm2, setLegalConfirm2] = useState(false);
    const [rolloverRefund, setRolloverRefund] = useState<'rollover' | 'refund'>('rollover');
    const [annualStep, setAnnualStep] = useState<AnnualStep>('financials');
    const [completedAnnualSteps, setCompletedAnnualSteps] = useState<Set<number>>(new Set());

    const setSubSection = (s: 'quarterly' | 'file-returns') => {
        setSubSectionLocal(s);
        if (s === 'file-returns') {
            setAnnualStep('financials');
            setCompletedAnnualSteps(new Set());
        }
    };

    const goForward = (target: AnnualStep) => {
        const stepNum: Record<string, number> = { financials: 1, 'tax-adjustments': 2, 'wht-credits': 3, review: 4 };
        const currentStepNum = stepNum[annualStep];
        if (currentStepNum) setCompletedAnnualSteps(prev => new Set([...prev, currentStepNum]));
        setAnnualStep(target);
    };

    // Quarterly assessments
    const [quarterPayments, setQuarterPayments] = useState<Record<number, number>>({});
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
    const [financialStatementUrl, setFinancialStatementUrl] = useState<string | null>(null);
    const [_trialBalanceUrl, setTrialBalanceUrl] = useState<string | null>(null);

    // Tax Adjustments
    const [govFines, setGovFines] = useState('');
    const [accountingDepreciation, setAccountingDepreciation] = useState('');
    const [generalProvisions, setGeneralProvisions] = useState('');
    const [class1Assets, setClass1Assets] = useState('');
    const [class2Assets, setClass2Assets] = useState('');
    const [class3Assets, setClass3Assets] = useState('');

    // WHT Credits
    const [whtCredits, setWhtCredits] = useState<WhtCreditUi[]>([]);
    const [whtCreditStep, setWhtCreditStep] = useState<'method' | 'table'>('method');
    const [creditEntryMethod, setCreditEntryMethod] = useState<'manual' | 'csv' | 'software'>('manual');
    const [csvImported, setCsvImported] = useState(false);
    const [importingCsv, setImportingCsv] = useState(false);
    const [showCreditSheet, setShowCreditSheet] = useState(false);
    const [editCreditIdx, setEditCreditIdx] = useState<number | null>(null);
    const [isEditingCredit, setIsEditingCredit] = useState(false);
    const [showRemoveCredit, setShowRemoveCredit] = useState(false);

    const defaultCreditForm = () => ({
        clientName: '', clientTIN: '', creditRef: '',
        grossValue: '', withheldAmount: '', certificateUrl: '',
    });

    const [creditForm, setCreditForm] = useState(defaultCreditForm);
    const [creditCertificateFiles, setCreditCertificateFiles] = useState<{ name: string }[]>([]);
    const [certificateUploading, setCertificateUploading] = useState(false);
    const creditCertificateRef = useRef<HTMLInputElement>(null);

    // React-Compiler-safe WHT certificate upload (button + ref + native addEventListener)
    useEffect(() => {
        const input = creditCertificateRef.current;
        if (!input) return;
        const onChange = async (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            (e.target as HTMLInputElement).value = '';
            if (!file) return;
            if (!validateFileSize(file)) {
                toast.error(`File too large — max ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB`);
                return;
            }
            if (!canSync || !profileId) {
                toast.error('Profile required to upload certificate');
                return;
            }
            setCertificateUploading(true);
            try {
                const prepared = (await prepareUploadFile(file)) ?? file;
                const res = await uploadFile(profileId, prepared, 'cit-wht-certificate', `${creditForm.clientName || 'WHT credit'} certificate`);
                const url = res?.data?.url;
                if (!url) {
                    toast.error('Upload failed — no file URL returned.');
                    return;
                }
                setCreditCertificateFiles(prev => [...prev, { name: file.name }]);
                setCreditForm(f => ({ ...f, certificateUrl: url }));
                toast.success('Certificate uploaded');
            } catch (err: unknown) {
                console.error('[BusinessCIT] Failed to upload certificate:', err instanceof Error ? err.message : 'Unknown error');
                toast.error(err instanceof Error ? err.message : 'Failed to upload certificate. Please try again.');
            } finally {
                setCertificateUploading(false);
            }
        };
        input.addEventListener('change', onChange);
        return () => input.removeEventListener('change', onChange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canSync, profileId, uploadFile, creditCertificateRef.current]);

    const resetFinancialState = useCallback(() => {
        setTotalRevenue('');
        setCogs('');
        setOpex('');
        setGovFines('');
        setAccountingDepreciation('');
        setGeneralProvisions('');
        setClass1Assets('');
        setClass2Assets('');
        setClass3Assets('');
        setAnnualReturnFiled(false);
        setRolloverRefund('rollover');
        setAnnualStep('financials');
        setCompletedAnnualSteps(new Set());
        setLegalConfirm1(false);
        setLegalConfirm2(false);
    }, []);

    const applyCitFiling = useCallback((filing: CitFiling) => {
        const f = filing.financials;
        const ca = filing.capitalAllowances;
        setTotalRevenue(formatMoneyInput(f?.totalRevenue));
        setCogs(formatMoneyInput(f?.cogs));
        setOpex(formatMoneyInput(f?.opex));
        setGovFines(formatMoneyInput(f?.govFines));
        setAccountingDepreciation(formatMoneyInput(f?.accountingDepreciation));
        setGeneralProvisions(formatMoneyInput(f?.generalProvisions));
        setClass1Assets(formatMoneyInput(ca?.class1Assets));
        setClass2Assets(formatMoneyInput(ca?.class2Assets));
        setClass3Assets(formatMoneyInput(ca?.class3Assets));
        setAnnualReturnFiled(Boolean(filing.filed || filing.status === 'filed'));
        if (filing.settlementPreference === 'rollover' || filing.settlementPreference === 'refund') {
            setRolloverRefund(filing.settlementPreference);
        }
    }, []);

    const applyQuarterly = useCallback((data: CitQuarterlyData) => {
        const payments: Record<number, number> = {};
        const deferred = new Set<number>();
        for (const q of data.quarters ?? []) {
            const idx = q.quarter - 1;
            if (idx < 0 || idx > 3) continue;
            if (q.status === 'paid') {
                payments[idx] = q.amountPaid > 0 ? q.amountPaid : q.amountDue;
            } else if (q.status === 'deferred') {
                deferred.add(idx);
            }
        }
        setQuarterPayments(payments);
        setDeferredQuarters(deferred);
    }, []);

    // Load annual CIT + WHT credits + quarterly when profile/year changes
    useEffect(() => {
        if (!canSync || !profileId) {
            startTransition(() => setLoading(false));
            return;
        }

        let cancelled = false;
        startTransition(() => {
            setLoading(true);
            resetFinancialState();
            setWhtCredits([]);
            setWhtCreditStep('method');
            setQuarterPayments({});
            setDeferredQuarters(new Set());
        });

        (async () => {
            try {
                const [citSettled, creditsSettled, quarterlySettled] = await Promise.allSettled([
                    getCit(profileId, yearNum),
                    listCitWhtCredits(profileId, yearNum),
                    getCitQuarterly(profileId, yearNum),
                ]);

                if (cancelled) return;

                startTransition(() => {
                    if (citSettled.status === 'fulfilled' && citSettled.value?.data) {
                        applyCitFiling(citSettled.value.data);
                    } else if (citSettled.status === 'rejected') {
                        if (!isNotFoundError(citSettled.reason)) {
                            console.error(
                                '[BusinessCIT] Failed to load CIT:',
                                citSettled.reason instanceof Error
                                    ? citSettled.reason.message
                                    : 'Unknown error'
                            );
                            toast.error(
                                citSettled.reason instanceof Error
                                    ? citSettled.reason.message
                                    : 'Failed to load CIT filing'
                            );
                        }
                    }

                    if (creditsSettled.status === 'fulfilled') {
                        const credits = creditsSettled.value?.data?.credits ?? [];
                        setWhtCredits(credits.map(creditToUi));
                        setWhtCreditStep(credits.length > 0 ? 'table' : 'method');
                    } else if (!isNotFoundError(creditsSettled.reason)) {
                        console.error(
                            '[BusinessCIT] Failed to load CIT WHT credits:',
                            creditsSettled.reason instanceof Error
                                ? creditsSettled.reason.message
                                : 'Unknown error'
                        );
                        toast.error(
                            creditsSettled.reason instanceof Error
                                ? creditsSettled.reason.message
                                : 'Failed to load WHT credits'
                        );
                    }

                    if (quarterlySettled.status === 'fulfilled' && quarterlySettled.value?.data) {
                        applyQuarterly(quarterlySettled.value.data);
                    } else if (
                        quarterlySettled.status === 'rejected'
                        && !isNotFoundError(quarterlySettled.reason)
                    ) {
                        console.error(
                            '[BusinessCIT] Failed to load CIT quarterly:',
                            quarterlySettled.reason instanceof Error
                                ? quarterlySettled.reason.message
                                : 'Unknown error'
                        );
                        toast.error(
                            quarterlySettled.reason instanceof Error
                                ? quarterlySettled.reason.message
                                : 'Failed to load quarterly assessments'
                        );
                    }
                });
            } catch (err: unknown) {
                console.error(
                    '[BusinessCIT] Failed to load CIT data:',
                    err instanceof Error ? err.message : 'Unknown error'
                );
                if (!cancelled) {
                    toast.error(err instanceof Error ? err.message : 'Failed to load CIT data');
                }
            } finally {
                if (!cancelled) {
                    startTransition(() => setLoading(false));
                }
            }
        })();

        return () => { cancelled = true; };
    }, [
        canSync,
        profileId,
        yearNum,
        getCit,
        listCitWhtCredits,
        getCitQuarterly,
        applyCitFiling,
        applyQuarterly,
        resetFinancialState,
    ]);

    // Derived financials
    const totalRev = num(totalRevenue);
    const totalExp = num(cogs) + num(opex);
    const accountingProfit = totalRev - totalExp;
    const nonDeductibleTotal = num(govFines) + num(accountingDepreciation) + num(generalProvisions);
    const totalCapitalAllowances = num(class1Assets) * 0.10 + num(class2Assets) * 0.20 + num(class3Assets) * 0.25;
    const assessableProfit = accountingProfit + nonDeductibleTotal - totalCapitalAllowances;
    const bracketRate = totalRev <= 25_000_000 && assessableProfit > 0 ? 0.20 : assessableProfit > 0 ? 0.30 : 0;
    const baseCIT = Math.max(0, assessableProfit) * bracketRate;
    const developmentLevy = Math.max(0, assessableProfit) * 0.04;
    const totalObligation = baseCIT + developmentLevy;
    const totalWHTCredits = whtCredits.reduce((s, c) => s + num(c.withheldAmount), 0);
    const totalQuarterlyPaid = Object.values(quarterPayments).reduce((s, v) => s + v, 0);
    const totalPrepayments = totalWHTCredits + totalQuarterlyPaid;
    const finalPosition = totalObligation - totalPrepayments;

    const buildUpsertPayload = useCallback((): UpsertCitRequest => {
        const payload: UpsertCitRequest = {
            year: yearNum,
            totalRevenue: num(totalRevenue),
            cogs: num(cogs),
            opex: num(opex),
            govFines: num(govFines),
            accountingDepreciation: num(accountingDepreciation),
            generalProvisions: num(generalProvisions),
            class1Assets: num(class1Assets),
            class2Assets: num(class2Assets),
            class3Assets: num(class3Assets),
            settlementPreference: rolloverRefund,
        };
        return payload;
    }, [
        yearNum,
        totalRevenue,
        cogs,
        opex,
        govFines,
        accountingDepreciation,
        generalProvisions,
        class1Assets,
        class2Assets,
        class3Assets,
        rolloverRefund,
    ]);

    const saveCit = useCallback(async (): Promise<boolean> => {
        if (!canSync || !profileId) {
            toast.error('Profile required to save CIT data');
            return false;
        }
        setSaving(true);
        try {
            const res = await upsertCit(profileId, buildUpsertPayload());
            if (res?.data) applyCitFiling(res.data);
            return true;
        } catch (err: unknown) {
            console.error(
                '[BusinessCIT] Failed to save CIT:',
                err instanceof Error ? err.message : 'Unknown error'
            );
            toast.error(err instanceof Error ? err.message : 'Failed to save CIT. Please try again.');
            return false;
        } finally {
            setSaving(false);
        }
    }, [canSync, profileId, upsertCit, buildUpsertPayload, applyCitFiling]);

    const continueWithSave = async (target: AnnualStep) => {
        const ok = await saveCit();
        if (!ok) return;
        goForward(target);
    };

    const handleFileQuarter = async () => {
        if (payQuarter === null) return;
        if (!canSync || !profileId) {
            toast.error('Profile required to pay quarterly CIT');
            return;
        }
        const quarter = payQuarter + 1;
        setSaving(true);
        try {
            const res = await payCitQuarter(profileId, {
                year: yearNum,
                quarter,
                amount: pendingQuarterAmount,
            });
            const paidAmount = res?.data?.amountPaid ?? pendingQuarterAmount;
            setQuarterPayments(prev => ({ ...prev, [payQuarter]: paidAmount }));
            setPayQuarter(null);
            setPendingQuarterAmount(0);
            setShowFilingSheet(false);
            toast.success(`Q${quarter} CIT payment recorded`);
        } catch (err: unknown) {
            console.error(
                '[BusinessCIT] Failed to pay CIT quarter:',
                err instanceof Error ? err.message : 'Unknown error'
            );
            toast.error(err instanceof Error ? err.message : 'Failed to pay quarter. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmDefer = async () => {
        if (deferModalQuarter === null) return;
        if (!canSync || !profileId) {
            toast.error('Profile required to defer quarterly CIT');
            return;
        }
        const quarter = deferModalQuarter + 1;
        setSaving(true);
        try {
            await deferCitQuarter(profileId, { year: yearNum, quarter });
            setDeferredQuarters(prev => new Set([...prev, deferModalQuarter]));
            setShowDeferModal(false);
            setDeferModalQuarter(null);
            toast.success(`Q${quarter} deferred to annual filing`);
        } catch (err: unknown) {
            console.error(
                '[BusinessCIT] Failed to defer CIT quarter:',
                err instanceof Error ? err.message : 'Unknown error'
            );
            toast.error(err instanceof Error ? err.message : 'Failed to defer quarter. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleFileAnnual = async () => {
        if (!canSync || !profileId) {
            toast.error('Profile required to file CIT');
            return;
        }
        setSaving(true);
        try {
            await upsertCit(profileId, buildUpsertPayload());
            const res = await fileCit(profileId, {
                year: yearNum,
                legalConfirmAccuracy: legalConfirm1,
                legalConfirmAuthority: legalConfirm2,
                settlementPreference: finalPosition < 0 ? rolloverRefund : undefined,
            });
            setAnnualReturnFiled(true);
            setShowFilingReviewSheet(false);
            if (res?.data?.settlementPreference) {
                setRolloverRefund(res.data.settlementPreference);
            }
            toast.success(`${taxYear} annual CIT return filed`);
        } catch (err: unknown) {
            console.error(
                '[BusinessCIT] Failed to file CIT:',
                err instanceof Error ? err.message : 'Unknown error'
            );
            toast.error(err instanceof Error ? err.message : 'Failed to file CIT. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const goBack = (target: AnnualStep) => {
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

    const handleCsvCreditImport = async (data: CsvImportData) => {
        const rows = data.cit_wht_credits?.credits ?? [];
        if (!rows.length) {
            toast.error('No WHT credit rows found in that file.');
            return;
        }
        if (!canSync || !profileId) {
            toast.error('Profile required to import WHT credits');
            return;
        }
        setImportingCsv(true);
        try {
            const created: WhtCreditUi[] = [];
            for (const row of rows) {
                const res = await createCitWhtCredit(profileId, {
                    year: yearNum,
                    clientName: row.clientName,
                    clientTIN: row.clientTIN,
                    creditRef: row.creditRef,
                    grossValue: row.grossValue,
                    withheldAmount: row.withheldAmount,
                });
                if (res?.data?.credit) created.push(creditToUi(res.data.credit));
            }
            if (created.length) {
                setWhtCredits(prev => [...prev, ...created]);
                setCsvImported(true);
                setWhtCreditStep('table');
            }
        } catch (err: unknown) {
            console.error(
                '[BusinessCIT] Failed to save imported WHT credits:',
                err instanceof Error ? err.message : 'Unknown error'
            );
            toast.error(err instanceof Error ? err.message : 'Imported file parsed, but saving credits failed.');
        } finally {
            setImportingCsv(false);
        }
    };

    const handleContinueCredits = () => {
        if (creditEntryMethod === 'csv' && !csvImported) {
            toast.error('Upload the sample CSV first, or switch to manual entry.');
            return;
        }
        openAddCredit();
    };

    const openEditCredit = (idx: number) => {
        const c = whtCredits[idx];
        setCreditForm({
            clientName: c.clientName, clientTIN: c.clientTIN, creditRef: c.creditRef,
            grossValue: c.grossValue, withheldAmount: c.withheldAmount,
            certificateUrl: c.certificateUrl ?? '',
        });
        setCreditCertificateFiles([]);
        setEditCreditIdx(idx);
        setIsEditingCredit(false);
        setShowRemoveCredit(false);
        setShowCreditSheet(true);
    };

    const handleSaveCredit = async () => {
        if (!canSync || !profileId) {
            toast.error('Profile required to save WHT credit');
            return;
        }
        const wasEdit = editCreditIdx !== null;
        setSaving(true);
        try {
            if (editCreditIdx !== null) {
                const existing = whtCredits[editCreditIdx];
                const res = await updateCitWhtCredit(profileId, existing.id, {
                    clientName: creditForm.clientName,
                    clientTIN: creditForm.clientTIN,
                    creditRef: creditForm.creditRef,
                    grossValue: num(creditForm.grossValue),
                    withheldAmount: num(creditForm.withheldAmount),
                    certificateUrl: creditForm.certificateUrl || undefined,
                });
                const updated = res?.data?.credit
                    ? creditToUi(res.data.credit)
                    : { ...existing, ...creditForm };
                setWhtCredits(prev => prev.map((c, i) => (i === editCreditIdx ? updated : c)));
            } else {
                const res = await createCitWhtCredit(profileId, {
                    year: yearNum,
                    clientName: creditForm.clientName,
                    clientTIN: creditForm.clientTIN,
                    creditRef: creditForm.creditRef,
                    grossValue: num(creditForm.grossValue),
                    withheldAmount: num(creditForm.withheldAmount),
                    certificateUrl: creditForm.certificateUrl || undefined,
                });
                if (res?.data?.credit) {
                    setWhtCredits(prev => [...prev, creditToUi(res.data.credit)]);
                }
            }
            setShowCreditSheet(false);
            setEditCreditIdx(null);
            setIsEditingCredit(false);
            setWhtCreditStep('table');
            toast.success(wasEdit ? 'WHT credit updated' : 'WHT credit added');
        } catch (err: unknown) {
            console.error(
                '[BusinessCIT] Failed to save WHT credit:',
                err instanceof Error ? err.message : 'Unknown error'
            );
            toast.error(err instanceof Error ? err.message : 'Failed to save WHT credit. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveCredit = async () => {
        if (editCreditIdx === null) return;
        if (!canSync || !profileId) {
            toast.error('Profile required to remove WHT credit');
            return;
        }
        const existing = whtCredits[editCreditIdx];
        setSaving(true);
        try {
            await deleteCitWhtCredit(profileId, existing.id);
            setWhtCredits(prev => prev.filter((_, i) => i !== editCreditIdx));
            setShowRemoveCredit(false);
            setShowCreditSheet(false);
            setEditCreditIdx(null);
            setIsEditingCredit(false);
            toast.success('WHT credit removed');
        } catch (err: unknown) {
            console.error(
                '[BusinessCIT] Failed to delete WHT credit:',
                err instanceof Error ? err.message : 'Unknown error'
            );
            toast.error(err instanceof Error ? err.message : 'Failed to remove WHT credit. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelCredit = () => {
        if (isEditingCredit && editCreditIdx !== null) {
            const c = whtCredits[editCreditIdx];
            setCreditForm({
                clientName: c.clientName, clientTIN: c.clientTIN, creditRef: c.creditRef,
                grossValue: c.grossValue, withheldAmount: c.withheldAmount,
                certificateUrl: c.certificateUrl ?? '',
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
           {loading ? (
             <div className="flex items-center justify-center py-24">
               <Spinner className="size-6 text-neutral-400" />
             </div>
           ) : (
           <>

           {/* ── Quarterly Assessments ── */}
           {subSection === 'quarterly' && (() => {
              const rev = Number((estimatedAnnualRevenue || '').replace(/,/g, '')) || 0;
              const margin = profitMargin ? Number(profitMargin.replace('%', '')) / 100 : 0;
              const estimatedProfit = rev * margin;
               const totalCIT = estimatedProfit > 0
                  ? estimatedProfit * (rev > 0 && rev <= 25_000_000 ? 0.20 : 0.30) * 1.04
                  : 0;
               const initialPerQuarter = totalCIT / 4;
               const quarters = [
                { label: 'Q1 ' + taxYear, due: 'Mar 31' },
                { label: 'Q2 ' + taxYear, due: 'Jun 30' },
                { label: 'Q3 ' + taxYear, due: 'Sep 30' },
                { label: 'Q4 ' + taxYear, due: 'Dec 31' },
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
                           <h3 className="text-5 font-medium text-neutral-800 tracking-[-0.02em] mb-3 font-[family-name:var(--font-merriweather)]">Defer to annual filing</h3>
                           <p className="text-1 text-neutral-500 font-medium leading-relaxed mb-6">
                               You chose to defer Q{deferModalQuarter + 1} payment to annual filing. You'll settle this when you file your CIT return in June {Number(taxYear) + 1}.
                           </p>
                           <PrimaryButton
                              onClick={handleConfirmDefer}
                              disabled={saving}
                              className="w-full">
                              {saving ? <Spinner /> : 'Got it'}
                           </PrimaryButton>
                      </div>
                   </div>, document.body)}

                   <div className="flex items-start justify-between mb-8">
                      <div>
                        <h2 className="text-5 font-medium text-neutral-800 tracking-[-0.02em] font-[family-name:var(--font-merriweather)]">Quarterly Assessments ({taxYear})</h2>
                        <p className="text-1 text-neutral-500 font-medium">Pay your estimated CIT in quarterly installments</p>
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
                        <span className="font-semibold text-neutral-800">{fmt(rev)}</span>
                      </div>
                      <div className="flex items-center justify-between text-2">
                        <span className="text-neutral-500 font-medium">Profit margin</span>
                        <span className="font-semibold text-neutral-800">{profitMargin || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between text-2">
                        <span className="text-neutral-500 font-medium">Estimated annual profit</span>
                        <span className="font-semibold text-neutral-800">{fmt(estimatedProfit)}</span>
                      </div>
                      <div className="flex items-center justify-between text-2">
                                       <span className="text-neutral-500 font-medium">Estimated CIT ({rev > 0 && rev <= 25_000_000 ? '20' : '30'}%)</span>
                        <span className="font-semibold text-neutral-800">{fmt(totalCIT)}</span>
                      </div>
                      <div className="flex items-center justify-between text-2">
                        <span className="text-neutral-500 font-medium">Per quarter</span>
                        <span className="font-semibold text-neutral-800">{fmt(initialPerQuarter)}</span>
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
                                <TableCell className="px-6 py-4 font-medium text-neutral-700">{amount > 0 ? fmt(amount) : '—'}</TableCell>
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
                                <PrimaryButton onClick={() => { setPendingQuarterAmount(quarterPayments[nextUnpaid] || (adjustedPerQuarter > 0 ? adjustedPerQuarter : 0)); setPayQuarter(nextUnpaid); setShowFilingSheet(true); }} className="flex-1">
                                   File Q4 taxes
                                </PrimaryButton>
                              </div>
                           ) : (
                              <PrimaryButton onClick={() => { setPendingQuarterAmount(quarterPayments[nextUnpaid] || (adjustedPerQuarter > 0 ? adjustedPerQuarter : 0)); setPayQuarter(nextUnpaid); setShowFilingSheet(true); }} className="w-full">
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
                           <h2 className="text-5 font-medium text-neutral-800 tracking-[-0.02em] mb-8 text-center font-[family-name:var(--font-merriweather)]">Edit Estimates</h2>
                           <div className="space-y-6">
                              <div>
                                <label className="block text-2 font-medium text-neutral-500 mb-1">
                                   Estimated annual gross revenue
                                   <InfoTooltip text="Your projected gross revenue for the current tax year." />
                                </label>
                                <Input type="text" placeholder="₦ 0.00" value={editRevenue}
                                   onChange={fmtInput(setEditRevenue)} />
                              </div>
                              <div>
                                <label className="block text-2 font-medium text-neutral-500 mb-2">
                                   Estimated profit margin
                                   <InfoTooltip text="Your estimated profit as a percentage of revenue." />
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
                                const editCIT = editRev > 0 && editMarg > 0
                                  ? editRev * editMarg * (editRev > 0 && editRev <= 25_000_000 ? 0.20 : 0.30) * 1.04
                                  : 0;
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
                        <p className="text-7 font-semibold text-neutral-800">{fmt(totalPaid)}</p>
                      </div>
                      <div>
                        <p className="text-1 font-semibold text-neutral-500 mb-1">Remaining</p>
                        <p className="text-7 font-semibold text-neutral-800">{fmt(remainingCIT)}</p>
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
                              You've completed your {yearNum} quarterly payments.<br />Now it's time to file your annual return based on actual profit.
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
                               We'll reconcile at year-end. Overpaid? You get a refund. Underpaid? You owe the difference.
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
                           Remember: When you file your annual CIT in June {Number(yearNum) + 1}, we'll reconcile based on your actual profit. You may owe more or get a refund.
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
                            <h1 className="text-5 font-medium text-neutral-800 tracking-[-0.02em] font-[family-name:var(--font-merriweather)]">
                                File {taxYear} Annual CIT Return
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
                                <div className="bg-neutral-50 rounded-2xl p-5">
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
                                <div className="bg-neutral-50 rounded-2xl p-5">
                                    <h3 className="text-3 font-semibold text-neutral-800 mb-4">Accounting Baseline</h3>
                                    <FormFieldRow className="justify-between">
                                        <FormLabel tip="Automatically calculated: Total Revenue − Cost of Sales − Operating Expenses. This is the starting point for tax adjustments in the next step.">Net Profit Before Tax</FormLabel>
                                        <Input type="text" value={totalRev > 0 ? fmt(totalRev - num(cogs) - num(opex)) : '₦ 0.00'} disabled className="w-[180px] text-left bg-neutral-50 text-neutral-400" />
                                    </FormFieldRow>
                                </div>

                                 <FileUploadSection
                                     label="Audited Financial Statements"
                                     description="Upload your audited financial statements for the tax year."
                                     accept=".pdf"
                                     required
                                     profileId={profileId}
                                     category="cit-audited-financials"
                                     onUploaded={(urls) => setFinancialStatementUrl(urls[urls.length - 1] ?? null)}
                                 />
                                 <FileUploadSection
                                     label="Trial Balance / General Ledger"
                                     description="Upload your trial balance or general ledger for additional verification."
                                     accept=".csv,.xlsx,.xls"
                                     profileId={profileId}
                                     category="cit-trial-balance"
                                     onUploaded={(urls) => setTrialBalanceUrl(urls[urls.length - 1] ?? null)}
                                 />
                            </div>

                            <div className="flex gap-3 mt-8">
                                <PrimaryButton
                                    onClick={() => continueWithSave('tax-adjustments')}
                                    disabled={!totalRevenue || saving}
                                >
                                    {saving ? <Spinner /> : 'Next: Tax Adjustments'}
                                </PrimaryButton>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Tax Adjustments */}
                    {annualStep === 'tax-adjustments' && (
                        <div className="w-full max-w-[500px] mx-auto" data-animate>
                            <div className="space-y-6">
                                {/* Section 1: Non-Deductible Expenses */}
                                <div className="bg-neutral-50 rounded-2xl p-5">
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
                                <div className="bg-neutral-50 rounded-2xl p-5">
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
                                <div className="bg-neutral-50 rounded-2xl p-5">
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
                                            <span className="text-2 font-semibold text-neutral-800">{fmt(assessableProfit)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <SecondaryButton onClick={() => goBack('financials')}>Back</SecondaryButton>
                                <PrimaryButton
                                    onClick={() => continueWithSave('wht-credits')}
                                    disabled={saving}
                                >
                                    {saving ? <Spinner /> : 'Next: WHT Credits'}
                                </PrimaryButton>
                            </div>
                        </div>
                    )}

                    {/* Step 4: WHT Credits */}
                    {annualStep === 'wht-credits' && (
                        <div className="w-full max-w-[800px] mx-auto" data-animate>

                            {whtCreditStep === 'method' ? (
                                <div className="max-w-[500px] mx-auto">
                                    <p className="text-3 font-medium text-neutral-800 mb-4 font-[family-name:var(--font-merriweather)]">Choose how you'd like to enter your WHT credit notes.</p>
                                    <RadioGroup value={creditEntryMethod} onValueChange={(v) => setCreditEntryMethod(v as 'manual' | 'csv' | 'software')} className="space-y-0 mb-4">
                                        {CREDIT_ENTRY_OPTIONS.map(opt => {
                                            const disabled = opt.id === 'software';
                                            return (
                                                <label key={opt.id} className={`flex items-center gap-3 py-3.5 cursor-pointer ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                                    <RadioGroupItem value={opt.id} disabled={disabled} />
                                                    <span className="text-3 font-medium text-neutral-800">{opt.label}</span>
                                                </label>
                                            );
                                        })}
                                    </RadioGroup>
                                    {creditEntryMethod === 'csv' && (
                                        <CsvImportPanel
                                            profileId={profileId}
                                            importType="cit_wht_credits"
                                            hint="Download the sample, add one row per WHT credit note, then upload. Credits will fill this table."
                                            disabled={importingCsv}
                                            onImported={(data) => handleCsvCreditImport(data)}
                                        />
                                    )}
                                    <div className="flex gap-3 mt-6">
                                        <div className="flex gap-3">
                                            <SecondaryButton onClick={() => goBack('tax-adjustments')}>Back</SecondaryButton>
                                            <SecondaryButton onClick={() => { if (!importingCsv) handleContinueCredits(); }}>
                                                {importingCsv ? <Spinner /> : 'Continue'}
                                            </SecondaryButton>
                                        </div>
                                        <PrimaryButton onClick={() => goForward('review')} className="ml-auto">Next: Review</PrimaryButton>
                                    </div>
                                </div>
                            ) : whtCredits.length === 0 && editCreditIdx === null ? (
                                <div className="max-w-[500px] mx-auto">
                                    <p className="text-3 font-medium text-neutral-800 mb-4 font-[family-name:var(--font-merriweather)]">Choose how you'd like to enter your WHT credit notes.</p>
                                    <RadioGroup value={creditEntryMethod} onValueChange={(v) => setCreditEntryMethod(v as 'manual' | 'csv' | 'software')} className="space-y-0 mb-4">
                                        {CREDIT_ENTRY_OPTIONS.map(opt => {
                                            const disabled = opt.id === 'software';
                                            return (
                                                <label key={opt.id} className={`flex items-center gap-3 py-3.5 cursor-pointer ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                                    <RadioGroupItem value={opt.id} disabled={disabled} />
                                                    <span className="text-3 font-medium text-neutral-800">{opt.label}</span>
                                                </label>
                                            );
                                        })}
                                    </RadioGroup>
                                    {creditEntryMethod === 'csv' && (
                                        <CsvImportPanel
                                            profileId={profileId}
                                            importType="cit_wht_credits"
                                            hint="Download the sample, add one row per WHT credit note, then upload. Credits will fill this table."
                                            disabled={importingCsv}
                                            onImported={(data) => handleCsvCreditImport(data)}
                                        />
                                    )}
                                    <div className="flex gap-3 mt-6">
                                        <div className="flex gap-3">
                                            <SecondaryButton onClick={() => goBack('tax-adjustments')}>Back</SecondaryButton>
                                            <SecondaryButton onClick={() => { if (!importingCsv) handleContinueCredits(); }}>
                                                {importingCsv ? <Spinner /> : 'Continue'}
                                            </SecondaryButton>
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

                                    <div className="bg-white border border-neutral-50 rounded-2xl overflow-hidden mb-6">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-neutral-50">
                                                    {['Client Name', 'TIN', 'Credit Ref #', 'Gross Value', 'WHT Amount', 'Certificate'].map(h => (
                                                        <TableHead key={h} className="px-6 py-4 font-medium text-neutral-400 text-2">{h}</TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {whtCredits.map((c, idx) => (
                                                    <TableRow key={c.id || idx} className="cursor-pointer" onClick={() => openEditCredit(idx)}>
                                                        <TableCell className="px-6 py-4 text-2 font-medium text-neutral-600">{c.clientName || '—'}</TableCell>
                                                        <TableCell className="px-6 py-4 text-2 font-medium text-neutral-600">{c.clientTIN || '—'}</TableCell>
                                                        <TableCell className="px-6 py-4 text-2 font-medium text-neutral-600">{c.creditRef || '—'}</TableCell>
                                                        <TableCell className="px-6 py-4 text-2 font-medium text-neutral-600">{num(c.grossValue) > 0 ? fmt(num(c.grossValue)) : '—'}</TableCell>
                                                        <TableCell className="px-6 py-4 text-2 font-medium text-neutral-600">{num(c.withheldAmount) > 0 ? fmt(num(c.withheldAmount)) : '—'}</TableCell>
                                                        <TableCell className="px-6 py-4 text-2 font-medium text-neutral-600">{c.certificateUrl ? '✓' : '—'}</TableCell>
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
                                        <h2 className="text-5 font-medium text-neutral-800 mb-8 tracking-[-0.02em] font-[family-name:var(--font-merriweather)]">{editCreditIdx !== null ? (isEditingCredit ? 'Edit Credit Note' : 'Credit Note Details') : 'Add WHT Credit Note'}</h2>
                                    </div>
                                    <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                                        <div className="max-w-[550px] mx-auto w-full space-y-6">
                                            <div className="relative overflow-hidden">
                                                <div className={`transition-transform duration-300 ease-in-out ${isEditingCredit ? '-translate-x-full' : 'translate-x-0'}`}>
                                                    {editCreditIdx !== null && (
                                                        <div className="space-y-6">
                                                            <CreditFormContent form={creditForm} onChange={(k, v) => setCreditForm(f => ({ ...f, [k]: v }))} disabled={true} readOnlyStyle="bg-neutral-50 text-neutral-400" certificateFiles={creditCertificateFiles} setCertificateFiles={setCreditCertificateFiles} certificateRef={creditCertificateRef} certificateUploading={certificateUploading} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${isEditingCredit ? 'translate-x-0' : 'translate-x-full'}`}>
                                                    {isEditingCredit && (
                                                        <div className="space-y-6">
                                                            <CreditFormContent form={creditForm} onChange={(k, v) => setCreditForm(f => ({ ...f, [k]: v }))} disabled={false} readOnlyStyle="" certificateFiles={creditCertificateFiles} setCertificateFiles={setCreditCertificateFiles} certificateRef={creditCertificateRef} certificateUploading={certificateUploading} />
                                                        </div>
                                                    )}
                                                </div>
                                                {editCreditIdx === null && (
                                                    <div className="space-y-6">
                                                        <CreditFormContent form={creditForm} onChange={(k, v) => setCreditForm(f => ({ ...f, [k]: v }))} disabled={false} readOnlyStyle="" certificateFiles={creditCertificateFiles} setCertificateFiles={setCreditCertificateFiles} certificateRef={creditCertificateRef} certificateUploading={certificateUploading} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="max-w-[550px] mx-auto w-full pt-4 border-t border-neutral-100 mt-2">
                                        <div className="flex gap-3">
                                            {editCreditIdx !== null && !isEditingCredit ? (
                                                <>
                                                    <button onClick={() => setShowRemoveCredit(true)} className="flex-1 h-12 border border-red-200 bg-red-50 text-destructive font-semibold rounded-xl text-2">Remove</button>
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
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-destructive"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                                    </div>
                                                    <h3 className="text-5 font-medium text-neutral-800 mb-2 tracking-[-0.02em] font-[family-name:var(--font-merriweather)]">Remove Credit Note?</h3>
                                                    <p className="text-1 text-neutral-500 font-medium mb-6">This action cannot be undone.</p>
                                                    <div className="flex gap-3 w-full">
                                                        <SecondaryButton className="flex-1" onClick={() => setShowRemoveCredit(false)}>Cancel</SecondaryButton>
                                                        <button onClick={handleRemoveCredit} className="flex-1 h-12 bg-destructive text-white font-semibold rounded-xl text-2">Remove</button>
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
                        annualReturnFiled ? (
                            <div className="w-full max-w-[500px] mx-auto text-center py-12" data-animate>
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <h2 className="text-5 font-medium text-neutral-800 mb-2 tracking-[-0.02em] font-[family-name:var(--font-merriweather)]">Annual Return Filed</h2>
                                <p className="text-1 text-neutral-500 font-medium mb-6">
                                    Your {yearNum} annual CIT return has been successfully submitted to the NRS.
                                </p>
                                <div className="flex justify-center gap-3">
                                    <SecondaryButton onClick={() => goBack('wht-credits')}>Back</SecondaryButton>
                                    <PrimaryButton onClick={() => { setAnnualReturnFiled(false); setLegalConfirm1(false); setLegalConfirm2(false); setShowFilingReviewSheet(false); }}>
                                        File Another
                                    </PrimaryButton>
                                </div>
                            </div>
                        ) : (
                        <div className="w-full max-w-[800px] mx-auto" data-animate>

                            {/* ═══════════════════════════════════════════════════════
                               Section 1: Cards + State Messaging
                               ═══════════════════════════════════════════════════════ */}
                            <div className="mb-14">
                                <div className="flex gap-4">
                                    <div className="flex-1 bg-white border border-neutral-100 rounded-2xl p-4 text-left">
                                        <p className="text-1 text-neutral-500 font-medium">Gross CIT Owed</p>
                                        <p className="text-5 font-semibold text-neutral-800 mt-1">{fmt(baseCIT)}</p>
                                    </div>
                                    <div className="flex-1 bg-white border border-neutral-100 rounded-2xl p-4 text-left">
                                        <p className="text-1 text-neutral-500 font-medium">Development Levy (4%)</p>
                                        <p className="text-5 font-semibold text-neutral-800 mt-1">+{fmt(developmentLevy)}</p>
                                    </div>
                                    <div className="flex-1 bg-white border border-neutral-100 rounded-2xl p-4 text-left">
                                        <p className="text-1 text-neutral-500 font-medium">WHT Credits Applied</p>
                                        <p className="text-5 font-semibold text-neutral-800 mt-1">-{fmt(totalWHTCredits)}</p>
                                    </div>
                                    <div className="flex-1 bg-white border border-neutral-100 rounded-2xl p-4 text-left">
                                        <p className="text-1 text-neutral-500 font-medium">Quarterly Installments</p>
                                        <p className="text-5 font-semibold text-neutral-800 mt-1">-{fmt(totalQuarterlyPaid)}</p>
                                    </div>
                                </div>

                                {/* State messaging */}
                                {finalPosition > 0 && (
                                    <p className="text-2 text-amber-600 font-medium mt-4">You have an outstanding balance of {fmt(finalPosition)} due to the NRS.</p>
                                )}
                                {finalPosition < 0 && (
                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                                        <p className="text-2 font-semibold text-green-700 mb-3">You've overpaid by {fmt(Math.abs(finalPosition))}. Choose how to handle the surplus.</p>
                                        <RadioGroup value={rolloverRefund} onValueChange={(v) => setRolloverRefund(v as 'rollover' | 'refund')}>
                                            <label className="flex items-center gap-3 py-1.5 cursor-pointer">
                                                <RadioGroupItem value="rollover" />
                                                <span className="text-2 text-green-700">Apply as rollover credit to lower next year's Q1 payment</span>
                                            </label>
                                            <label className="flex items-center gap-3 py-1.5 cursor-pointer">
                                                <RadioGroupItem value="refund" />
                                                <span className="text-2 text-green-700">Request direct cash refund processing</span>
                                            </label>
                                        </RadioGroup>
                                    </div>
                                )}

                            </div>

                            {/* ═══════════════════════════════════════════════════════
                               Section 2: Core Data Checklist
                               ═══════════════════════════════════════════════════════ */}
                            <div className="mb-14">
                            <Accordion defaultValue={['accounting']} className="space-y-1">
                                <AccordionItem value="accounting" className="bg-neutral-50 border border-neutral-100 rounded-2xl">
                                    <AccordionTrigger className="px-4 py-3 text-2 font-semibold text-neutral-800">
                                        Accounting Baseline
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-2">
                                                <span className="text-neutral-500">Turnover / Gross Revenue</span>
                                                <span className="font-medium text-neutral-800">{fmt(totalRev)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-2">
                                                <span className="text-neutral-500">Net Accounting Profit before Tax</span>
                                                <span className="font-medium text-neutral-800">{fmt(accountingProfit)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-2">
                                                <span className="text-neutral-500">Attached Financial Statement File</span>
                                                <span className={`font-medium ${financialStatementUrl ? 'text-green-600' : 'text-neutral-400'}`}>
                                                    {financialStatementUrl ? '✓ Provided' : '—'}
                                                </span>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="legal" className="bg-neutral-50 border border-neutral-100 rounded-2xl">
                                    <AccordionTrigger className="px-4 py-3 text-2 font-semibold text-neutral-800">
                                        Legal Adjustments
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-2">
                                                <span className="text-neutral-500">Added-back Non-Deductible Expenses</span>
                                                <span className="font-medium text-neutral-800">{fmt(nonDeductibleTotal)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-2">
                                                <span className="text-neutral-500">Deducted Capital Allowances (Asset Relief)</span>
                                                <span className="font-medium text-neutral-800">{fmt(totalCapitalAllowances)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-2 pt-2 border-t border-neutral-100">
                                                <span className="font-semibold text-neutral-800">Final Taxable / Chargeable Profit</span>
                                                <span className="font-semibold text-neutral-800">{fmt(assessableProfit)}</span>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="prepaid" className="bg-neutral-50 border border-neutral-100 rounded-2xl">
                                    <AccordionTrigger className="px-4 py-3 text-2 font-semibold text-neutral-800">
                                        Prepaid Taxes
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-2">
                                                <span className="text-neutral-500">Total WHT Credit Notes (Verified)</span>
                                                <span className="font-medium text-neutral-800">{whtCredits.length} Certificate{whtCredits.length !== 1 ? 's' : ''} (Totaling {fmt(totalWHTCredits)})</span>
                                            </div>
                                            <div className="flex items-center justify-between text-2">
                                                <span className="text-neutral-500">Quarterly Installments Paid</span>
                                                <span className="font-medium text-neutral-800">
                                                    {['Q1', 'Q2', 'Q3', 'Q4'].filter((_, i) => (quarterPayments[i] || 0) > 0).join(', ') || '—'} (Totaling {fmt(totalQuarterlyPaid)})
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-2">
                                                <span className="text-neutral-500">Deferred to Annual Filing</span>
                                                <span className="font-medium text-neutral-800">
                                                    {['Q1', 'Q2', 'Q3', 'Q4'].filter((_, i) => deferredQuarters.has(i)).join(', ') || '—'}
                                                </span>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            </div>

                                {/* ═══════════════════════════════════════════════════════
                                   Section 3: Legal Declaration & Final Settlement
                                   ═══════════════════════════════════════════════════════ */}
                                <div className="space-y-3 mb-8">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <Checkbox checked={legalConfirm1} onCheckedChange={(c) => setLegalConfirm1(c === true)} className="mt-0.5" />
                                        <span className="text-2 text-neutral-600 font-medium leading-relaxed">I confirm that the numbers above perfectly match our uploaded audited financials.</span>
                                    </label>
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <Checkbox checked={legalConfirm2} onCheckedChange={(c) => setLegalConfirm2(c === true)} className="mt-0.5" />
                                        <span className="text-2 text-neutral-600 font-medium leading-relaxed">I authorize Taxable to act as our designated tax agent to finalize this submission.</span>
                                    </label>
                                </div>

                            {/* Final Settlement + CTA */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <p className="text-1 text-neutral-500 font-medium">Final Settlement Position</p>
                                    <p className="text-7 font-semibold text-neutral-800">{fmt(Math.abs(finalPosition))}</p>
                                </div>
                                <div className="flex gap-3">
                                    <SecondaryButton onClick={() => goBack('wht-credits')}>Back</SecondaryButton>
                                    <PrimaryButton onClick={() => setShowFilingReviewSheet(true)} disabled={!legalConfirm1 || !legalConfirm2} className="flex-shrink-0">
                                        {finalPosition > 0 ? 'Pay Balance & Submit Annual Return' : finalPosition < 0 ? 'File Return & Claim Credit' : 'Submit Annual Return'}
                                    </PrimaryButton>
                                </div>
                            </div>

                            <FilingSheet
                                open={showFilingReviewSheet}
                                onClose={() => setShowFilingReviewSheet(false)}
                                onFile={handleFileAnnual}
                            />
                        </div>
                    ))}
                </div>
            )}

           </>
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
