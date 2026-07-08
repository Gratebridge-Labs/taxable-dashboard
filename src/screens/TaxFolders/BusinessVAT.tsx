'use client';
import React, { useState, useEffect, startTransition } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Attachment, AttachmentGroup, AttachmentMedia, AttachmentContent, AttachmentTitle, AttachmentDescription, AttachmentActions, AttachmentAction } from '@/components/ui/attachment';
import { FileTextIcon, XIcon } from 'lucide-react';
import { InformationFill } from '@mingcute/react';
import {
    Stepper, StepperItem, StepperIndicator, StepperTitle,
    StepperSeparator, StepperTrigger,
} from '@/components/ui/stepper';
import {
    SectionHeading, DescriptionText, PrimaryButton, SecondaryButton,
    FilingSheet, FormFieldRow, FormLabel,
} from './TaxFolderShared';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const VAT_RATE = 0.075;

// ── Hint Icon ──────────────────────────────────────────────────────────
const HintIcon = ({ tip }: { tip: string }) => (
    <span className="relative group inline-flex items-center ml-1 align-middle cursor-default">
        <InformationFill className="w-3.5 h-3.5" color="#E5E5E5" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-neutral-800 text-white text-1 leading-snug rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40 font-medium">
            {tip}
        </div>
    </span>
);

// ── VAT Filing Data ─────────────────────────────────────────────────────
export interface VATFilingData {
    standardSales: string;
    exemptSales: string;
    wvatCredit: string;
    allowableInputVAT: string;
    nonAllowableOverheads: string;
    nonAllowableCapEx: string;
    broughtForwardCredit: string;
    salesScheduleUploaded: boolean;
    purchaseInvoicesUploaded: boolean;
    disclaimerAccepted: boolean;
    filed: boolean;
}

const defaultFilingData = (): VATFilingData => ({
    standardSales: '', exemptSales: '', wvatCredit: '', allowableInputVAT: '',
    nonAllowableOverheads: '', nonAllowableCapEx: '', broughtForwardCredit: '',
    salesScheduleUploaded: false, purchaseInvoicesUploaded: false, disclaimerAccepted: false,
    filed: false,
});

const fmt = (n: number) => `₦${Math.round(n).toLocaleString()}`;

// ── VAT Content ─────────────────────────────────────────────────────────
export function BusinessVATContent({ profileId, taxYear }: { profileId?: string; taxYear?: string } = {}) {
    const [vatStep, setVatStep] = useState<'gatekeeper' | 'output-vat' | 'input-vat' | 'adjustments' | 'review'>('gatekeeper');
    const [entryMethod, setEntryMethod] = useState<'manual' | 'csv' | 'software'>('manual');
    const [activeMonth, setActiveMonth] = useState(0);
    const [filedMonths, setFiledMonths] = useState<Set<number>>(new Set());
    const [monthData, setMonthData] = useState<Record<number, VATFilingData>>({});
    const [showFilingModal, setShowFilingModal] = useState(false);
    const [salesScheduleFiles, setSalesScheduleFiles] = useState<{ name: string }[]>([]);
    const [purchaseInvoiceFiles, setPurchaseInvoiceFiles] = useState<{ name: string }[]>([]);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [dismissCashBanner, setDismissCashBanner] = useState(false);
    const [dismissInputBanner, setDismissInputBanner] = useState(false);

    const goForward = (target: 'gatekeeper' | 'output-vat' | 'input-vat' | 'adjustments' | 'review') => {
        const stepNum = { gatekeeper: 1, 'output-vat': 2, 'input-vat': 3, adjustments: 4, review: 5 }[target];
        const currentStepNum = { gatekeeper: 1, 'output-vat': 2, 'input-vat': 3, adjustments: 4, review: 5 }[vatStep];
        setCompletedSteps(prev => new Set([...prev, currentStepNum]));
        setVatStep(target);
    };

    const goBack = (target: 'gatekeeper' | 'output-vat' | 'input-vat' | 'adjustments' | 'review') => {
        setVatStep(target);
    };

    const data = monthData[activeMonth] ?? defaultFilingData();

    const setField = (field: keyof VATFilingData) => (val: string) =>
        setMonthData(prev => ({ ...prev, [activeMonth]: { ...(prev[activeMonth] ?? defaultFilingData()), [field]: val } }));

    const standardSalesNum = Number(data.standardSales.replace(/,/g, '')) || 0;
    const outputVAT = standardSalesNum * VAT_RATE;
    const allowableNum = Number(data.allowableInputVAT.replace(/,/g, '')) || 0;
    const wvatNum = Number(data.wvatCredit.replace(/,/g, '')) || 0;
    const bfNum = Number(data.broughtForwardCredit.replace(/,/g, '')) || 0;
    const netPosition = outputVAT - allowableNum - wvatNum - bfNum;
    const isCredit = netPosition < 0;

    const fmtInput = (set: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9.]/g, '');
        const parts = raw.split('.');
        const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        set(parts.length > 1 ? integer + '.' + parts.slice(1).join('') : integer);
    };

    // Auto-populate brought-forward credit from previous month
    useEffect(() => {
        if (activeMonth > 0 && !data.broughtForwardCredit) {
            const prev = monthData[activeMonth - 1];
            if (prev && prev.filed && netPosition < 0) {
                setField('broughtForwardCredit')(String(Math.abs(Math.round(netPosition))));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeMonth]);

    useEffect(() => {
        setDismissCashBanner(false);
        setDismissInputBanner(false);
    }, [vatStep]);

    useEffect(() => {
        setCompletedSteps(new Set());
        setSalesScheduleFiles([]);
        setPurchaseInvoiceFiles([]);
        setVatStep('gatekeeper');
    }, [activeMonth]);

    const VAT_STORAGE_KEY = `taxable_vat_${profileId ?? 'default'}_${taxYear ?? new Date().getFullYear()}`;

    // Restore VAT data from localStorage on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(VAT_STORAGE_KEY);
            if (!raw) return;
            const saved = JSON.parse(raw);
            if (saved.monthData) setMonthData(saved.monthData);
            if (saved.filedMonths) setFiledMonths(new Set(saved.filedMonths));
            if (typeof saved.activeMonth === 'number') setActiveMonth(saved.activeMonth);
        } catch { /* ignore */ }
    }, []);

    // Save VAT data to localStorage on change
    useEffect(() => {
        localStorage.setItem(VAT_STORAGE_KEY, JSON.stringify({
            monthData,
            filedMonths: Array.from(filedMonths),
            activeMonth,
        }));
    }, [monthData, filedMonths, activeMonth, VAT_STORAGE_KEY]);

    const handleFile = () => {
        setFiledMonths(prev => new Set([...prev, activeMonth]));
        setMonthData(prev => ({ ...prev, [activeMonth]: { ...(prev[activeMonth] ?? defaultFilingData()), filed: true } }));
        setShowFilingModal(false);
        if (activeMonth < 11) setActiveMonth(m => m + 1);
        goBack('gatekeeper');
    };

    const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'sales' | 'purchases') => {
        const files = e.target.files;
        if (!files) return;
        const items = Array.from(files).map(f => ({ name: f.name }));
        if (target === 'sales') {
            setSalesScheduleFiles(prev => [...prev, ...items]);
            setField('salesScheduleUploaded')('true');
        } else {
            setPurchaseInvoiceFiles(prev => [...prev, ...items]);
            setField('purchaseInvoicesUploaded')('true');
        }
        e.target.value = '';
    };

    const ENTRY_OPTIONS = [
        { id: 'manual' as const, label: 'Manual entry' },
        { id: 'csv' as const, label: 'Upload sales & purchase ledgers (CSV/Excel)' },
        { id: 'software' as const, label: 'Connect accounting software (QuickBooks, Xero, Zoho)' },
    ];

    const VAT_STEPS = [
        { key: 'gatekeeper', step: 1, title: 'Data Source' },
        { key: 'output-vat', step: 2, title: 'Output VAT' },
        { key: 'input-vat', step: 3, title: 'Input VAT' },
        { key: 'adjustments', step: 4, title: 'Adjustments' },
        { key: 'review', step: 5, title: 'Review' },
    ];

    const stepIndex = vatStep === 'gatekeeper' ? 1
        : vatStep === 'output-vat' ? 2
        : vatStep === 'input-vat' ? 3
        : vatStep === 'adjustments' ? 4
        : 5;

    const monthSelector = (
        <Select value={MONTHS[activeMonth]} onValueChange={(v) => { if (v) setActiveMonth(MONTHS.indexOf(v)); }}>
            <SelectTrigger className="w-fit min-w-[180px] h-10 rounded-xl bg-white border-neutral-50 text-3">
                <div className="flex items-center gap-2 mr-6">
                    <span>{MONTHS[activeMonth]}</span>
                    {filedMonths.has(activeMonth) &&
                        <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-200 text-2 font-semibold px-2 py-0 h-5">Filed</Badge>
                    }
                    {!filedMonths.has(activeMonth) && monthData[activeMonth] && (monthData[activeMonth].standardSales || monthData[activeMonth].allowableInputVAT) &&
                        <Badge variant="secondary" className="bg-neutral-100 text-neutral-500 border-neutral-200 text-2 font-semibold px-2 py-0 h-5">Draft</Badge>
                    }
                </div>
            </SelectTrigger>
            <SelectContent>
                {MONTHS.map((m, i) => (
                    <SelectItem key={m} value={m}>
                        <div className="flex items-center gap-2">
                            <span>{m}</span>
                            {filedMonths.has(i) &&
                                <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-200 text-2 font-semibold px-2 py-0 h-5">Filed</Badge>
                            }
                            {!filedMonths.has(i) && monthData[i] && (monthData[i].standardSales || monthData[i].allowableInputVAT) &&
                                <Badge variant="secondary" className="bg-neutral-100 text-neutral-500 border-neutral-200 text-2 font-semibold px-2 py-0 h-5">Draft</Badge>
                            }
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );

    return (
        <div className="w-full">
            {/* ── Header + Stepper ── */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <h1 className="text-5 font-semibold text-neutral-800 tracking-[-0.02em]">
                            File {MONTHS[activeMonth]} VAT Return
                        </h1>
                        {monthSelector}
                    </div>
                </div>

                <Stepper value={stepIndex} onValueChange={(step) => {
                    const map: Record<number, 'gatekeeper' | 'output-vat' | 'input-vat' | 'adjustments' | 'review'> = {
                        1: 'gatekeeper', 2: 'output-vat', 3: 'input-vat', 4: 'adjustments', 5: 'review'
                    };
                    if (step <= stepIndex) goBack(map[step]);
                }}>
                    {VAT_STEPS.map((s, idx) => (
                        <StepperItem key={s.key} step={s.step} completed={completedSteps.has(s.step)} disabled={s.step > stepIndex} className="[&:not(:last-child)]:flex-1 data-[state=inactive]:[&_h3]:text-neutral-400 [&_h3]:text-neutral-800">
                            <StepperTrigger className="flex items-center gap-3 max-md:flex-col">
                                <StepperIndicator />
                                <div className="text-center md:text-left">
                                    <StepperTitle className="text-2 font-medium">{s.title}</StepperTitle>
                                </div>
                            </StepperTrigger>
                            {idx < VAT_STEPS.length - 1 && <StepperSeparator className="md:mx-4" />}
                        </StepperItem>
                    ))}
                </Stepper>
            </div>

            {/* ── Step 1: Gatekeeper ── */}
            {vatStep === 'gatekeeper' && (
                <div className="max-w-[480px] mx-auto" data-animate>
                    <h2 className="text-3 font-semibold text-neutral-800 tracking-[-0.02em] mb-4">How do you want to enter your VAT data?</h2>

                    <RadioGroup value={entryMethod} onValueChange={(v) => setEntryMethod(v as 'manual' | 'csv' | 'software')} className="space-y-0 mb-6">
                        {ENTRY_OPTIONS.map(opt => {
                            const disabled = opt.id !== 'manual';
                            return (
                                <label key={opt.id} className={`flex items-center gap-3 py-3.5 cursor-pointer ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                    <RadioGroupItem value={opt.id} disabled={disabled} />
                                    <span className="text-3 font-medium text-neutral-800">{opt.label}</span>
                                </label>
                            );
                        })}
                    </RadioGroup>

                    <PrimaryButton onClick={() => goForward('output-vat')}>
                        Continue
                    </PrimaryButton>
                </div>
            )}

            {/* ── Step 2: Output VAT (Sales) ── */}
            {vatStep === 'output-vat' && (
                <div className="max-w-[500px] mx-auto" data-animate>
                    <h2 className="text-3 font-semibold text-neutral-800 tracking-[-0.02em] mb-4">Output VAT (Sales)</h2>
                    {!dismissCashBanner && (
                    <div className="relative flex items-start gap-2 mb-6 p-3 bg-amber-50 rounded-xl">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 mt-0.5 text-amber-600"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        <p className="text-2 text-amber-700 font-medium leading-relaxed flex-1">Only include cash actually received this month. Do not include unpaid invoices.</p>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" onClick={() => setDismissCashBanner(true)} className="flex-shrink-0 mt-0.5 text-amber-600 cursor-pointer"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </div>
                    )}

                    <div className="bg-neutral-50 rounded-3xl p-5 mb-6">
                        <div className="space-y-3">
                            <FormFieldRow className="justify-between">
                                <FormLabel tip="Total standard sales before VAT — cash actually received this month.">Standard Sales (7.5%)</FormLabel>
                                <Input type="text" value={data.standardSales} onChange={fmtInput(setField('standardSales'))} placeholder="N0" className="w-[150px] text-left" />
                            </FormFieldRow>
                            <FormFieldRow className="justify-between">
                                <FormLabel tip="Automatically calculated: Standard Sales × 7.5%">Output VAT @ 7.5%</FormLabel>
                                <Input type="text" value={outputVAT > 0 ? fmt(outputVAT) : 'N0'} disabled className="w-[150px] text-left bg-neutral-50 text-neutral-400" />
                            </FormFieldRow>
                            <FormFieldRow className="justify-between">
                                <FormLabel tip="Sales where VAT is 0% — exports, certain goods.">Exempt / Zero-Rated Sales</FormLabel>
                                <Input type="text" value={data.exemptSales} onChange={fmtInput(setField('exemptSales'))} placeholder="N0" className="w-[150px] text-left" />
                            </FormFieldRow>
                            <FormFieldRow className="justify-between">
                                <FormLabel tip="VAT deducted at source by government or corporate clients.">Withholding VAT (WVAT) Credit</FormLabel>
                                <Input type="text" value={data.wvatCredit} onChange={fmtInput(setField('wvatCredit'))} placeholder="N0" className="w-[150px] text-left" />
                            </FormFieldRow>
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-2 font-semibold text-neutral-700 mb-2">Upload Sales Schedule</p>
                        <div className="flex items-center justify-between gap-4 p-3 border border-dashed border-neutral-200 rounded-xl">
                            <div className="flex items-center gap-2.5">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                <span className="text-1 text-neutral-400 font-medium">Upload CSV or PDF of sales transactions</span>
                            </div>
                            <label className="cursor-pointer text-2 font-semibold text-taxable-blue">
                                Upload
                                <input type="file" hidden accept=".csv,.pdf,.xlsx" onChange={(e) => handleAttachmentUpload(e, 'sales')} />
                            </label>
                        </div>
                        {salesScheduleFiles.length > 0 && (
                            <div className="mt-3">
                                <AttachmentGroup>
                                    {salesScheduleFiles.map((f, i) => (
                                        <Attachment key={i} size="xs" className="bg-white">
                                            <AttachmentMedia><FileTextIcon className="text-neutral-400 w-3.5 h-3.5" /></AttachmentMedia>
                                            <AttachmentContent>
                                                <AttachmentTitle className="text-1">{f.name}</AttachmentTitle>
                                            </AttachmentContent>
                                            <AttachmentActions>
                                                <AttachmentAction onClick={() => setSalesScheduleFiles(prev => prev.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`}>
                                                    <XIcon />
                                                </AttachmentAction>
                                            </AttachmentActions>
                                        </Attachment>
                                    ))}
                                </AttachmentGroup>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <SecondaryButton onClick={() => goBack('gatekeeper')}>Back</SecondaryButton>
                        <PrimaryButton onClick={() => goForward('input-vat')} disabled={!data.standardSales}>
                            Next: Input VAT
                        </PrimaryButton>
                    </div>
                </div>
            )}

            {/* ── Step 3: Input VAT (Purchases) ── */}
            {vatStep === 'input-vat' && (
                <div className="max-w-[500px] mx-auto" data-animate>
                    <h2 className="text-3 font-semibold text-neutral-800 tracking-[-0.02em] mb-4">Input VAT (Purchases)</h2>
                    {!dismissInputBanner && (
                    <div className="relative flex items-start gap-2 mb-6 p-3 bg-amber-50 rounded-xl">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 mt-0.5 text-amber-600"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        <p className="text-2 text-amber-700 font-medium leading-relaxed flex-1">Only claim VAT back on raw materials or inventory for direct resale. VAT on overheads (rent, fuel) and assets is non-allowable.</p>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" onClick={() => setDismissInputBanner(true)} className="flex-shrink-0 mt-0.5 text-amber-600 cursor-pointer"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </div>
                    )}

                    <div className="bg-neutral-50 rounded-3xl p-5 mb-6">
                        <div className="space-y-3">
                            <FormFieldRow className="justify-between">
                                <FormLabel tip="VAT paid on raw materials or inventory purchased for direct resale. This reduces your VAT liability.">VAT on Inventory / Raw Materials (Allowable)</FormLabel>
                                <Input type="text" value={data.allowableInputVAT} onChange={fmtInput(setField('allowableInputVAT'))} placeholder="N0" className="w-[150px] text-left" />
                            </FormFieldRow>
                            <FormFieldRow className="justify-between">
                                <FormLabel tip="VAT on rent, diesel, internet, utilities — logged for records but cannot be deducted.">VAT on Operational Overheads (Non-Allowable)</FormLabel>
                                <Input type="text" value={data.nonAllowableOverheads} onChange={fmtInput(setField('nonAllowableOverheads'))} placeholder="N0" className="w-[150px] text-left" />
                            </FormFieldRow>
                            <FormFieldRow className="justify-between">
                                <FormLabel tip="VAT on machinery, laptops, equipment — logged for records but cannot be deducted.">VAT on Capital Expenditure (Non-Allowable)</FormLabel>
                                <Input type="text" value={data.nonAllowableCapEx} onChange={fmtInput(setField('nonAllowableCapEx'))} placeholder="N0" className="w-[150px] text-left" />
                            </FormFieldRow>
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-2 font-semibold text-neutral-700 mb-2">Upload Purchase Invoices & Receipts</p>
                        <div className="flex items-center justify-between gap-4 p-3 border border-dashed border-neutral-200 rounded-xl">
                            <div className="flex items-center gap-2.5">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                <span className="text-1 text-neutral-400 font-medium">Upload invoices supporting Allowable Input VAT</span>
                            </div>
                            <label className="cursor-pointer text-2 font-semibold text-taxable-blue">
                                Upload
                                <input type="file" hidden accept=".csv,.pdf,.xlsx,.jpg,.png" onChange={(e) => handleAttachmentUpload(e, 'purchases')} />
                            </label>
                        </div>
                        {purchaseInvoiceFiles.length > 0 && (
                            <div className="mt-3">
                                <AttachmentGroup>
                                    {purchaseInvoiceFiles.map((f, i) => (
                                        <Attachment key={i} size="xs" className="bg-white">
                                            <AttachmentMedia><FileTextIcon className="text-neutral-400 w-3.5 h-3.5" /></AttachmentMedia>
                                            <AttachmentContent>
                                                <AttachmentTitle className="text-1">{f.name}</AttachmentTitle>
                                            </AttachmentContent>
                                            <AttachmentActions>
                                                <AttachmentAction onClick={() => setPurchaseInvoiceFiles(prev => prev.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`}>
                                                    <XIcon />
                                                </AttachmentAction>
                                            </AttachmentActions>
                                        </Attachment>
                                    ))}
                                </AttachmentGroup>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <SecondaryButton onClick={() => goBack('output-vat')}>Back</SecondaryButton>
                        <PrimaryButton onClick={() => goForward('adjustments')} disabled={!data.allowableInputVAT}>
                            Next: Adjustments
                        </PrimaryButton>
                    </div>
                </div>
            )}

            {/* ── Step 4: Adjustments ── */}
            {vatStep === 'adjustments' && (
                <div className="max-w-[500px] mx-auto" data-animate>
                    <h2 className="text-3 font-semibold text-neutral-800 tracking-[-0.02em] mb-4">Adjustments</h2>

                    <div className="bg-neutral-50 rounded-3xl p-5 mb-0">
                        <FormFieldRow className="justify-between mb-0">
                            <FormLabel tip="VAT credit carried forward from the previous month. Auto-populated if available.">Brought-Forward VAT Credit</FormLabel>
                            <Input type="text" value={data.broughtForwardCredit} onChange={fmtInput(setField('broughtForwardCredit'))} placeholder="N0" className="w-[150px] text-left" />
                        </FormFieldRow>
                    </div>

                    <div className="flex gap-3">
                        <SecondaryButton onClick={() => goBack('input-vat')}>Back</SecondaryButton>
                        <PrimaryButton onClick={() => goForward('review')}>
                            Review Tax Return
                        </PrimaryButton>
                    </div>
                </div>
            )}

            {/* ── Step 5: Review ── */}
            {vatStep === 'review' && (
                <div className="max-w-[500px] mx-auto" data-animate>
                    <h2 className="text-3 font-semibold text-neutral-800 tracking-[-0.02em] mb-4">Review & Submit</h2>

                    <div className="bg-neutral-50 rounded-3xl p-5 mb-6">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between text-2">
                                <span className="text-neutral-500 font-medium">Output VAT Collected</span>
                                <span className="font-semibold text-neutral-800">{fmt(outputVAT)}</span>
                            </div>
                            <div className="flex items-center justify-between text-2">
                                <span className="text-neutral-500 font-medium">Less Allowable Input VAT</span>
                                <span className="font-semibold text-neutral-800">-{fmt(allowableNum)}</span>
                            </div>
                            <div className="flex items-center justify-between text-2">
                                <span className="text-neutral-500 font-medium">Less WVAT Credit</span>
                                <span className="font-semibold text-neutral-800">-{fmt(wvatNum)}</span>
                            </div>
                            <div className="flex items-center justify-between text-2">
                                <span className="text-neutral-500 font-medium">Less Brought-Forward Credit</span>
                                <span className="font-semibold text-neutral-800">-{fmt(bfNum)}</span>
                            </div>
                            <div className="flex items-center justify-between text-2 pt-2 border-t border-neutral-100">
                                <span className="font-semibold text-neutral-800">Net VAT {isCredit ? 'Credit' : 'Liability'}</span>
                                <span className={`font-semibold text-3 ${isCredit ? 'text-blue-600' : 'text-neutral-900'}`}>{isCredit ? fmt(Math.abs(netPosition)) : fmt(netPosition)}</span>
                            </div>
                        </div>
                    </div>

                    {isCredit ? (
                        <div className="flex items-start gap-2 mb-6 p-3 bg-blue-50 rounded-xl">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 mt-0.5 text-blue-600"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            <p className="text-2 text-blue-700 font-medium leading-relaxed">VAT Credit of {fmt(Math.abs(netPosition))} accumulated. This will roll over to offset next month's tax.</p>
                        </div>
                    ) : (
                        <div className="flex items-start gap-2 mb-6 p-3 bg-green-50 rounded-xl">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 mt-0.5 text-green-600"><polyline points="20 6 9 17 4 12" /></svg>
                            <p className="text-2 text-green-700 font-medium leading-relaxed">Net VAT Liability of {fmt(netPosition)} due by the 21st of next month.</p>
                        </div>
                    )}

                    <label className="flex items-start gap-3 mb-8 cursor-pointer">
                        <Checkbox checked={data.disclaimerAccepted} onCheckedChange={() => setField('disclaimerAccepted')(data.disclaimerAccepted ? '' : 'true')} className="mt-0.5" />
                        <span className="text-2 font-medium text-neutral-600 leading-relaxed">I confirm these records are accurate under the Nigeria Tax Act.</span>
                    </label>

                    <div className="flex gap-3">
                        <SecondaryButton onClick={() => goBack('adjustments')}>Back</SecondaryButton>
                        <PrimaryButton onClick={() => setShowFilingModal(true)} disabled={!data.disclaimerAccepted}>
                            Submit VAT Return
                        </PrimaryButton>
                    </div>
                </div>
            )}

            {/* Filing Sheet */}
            <FilingSheet open={showFilingModal} onClose={() => setShowFilingModal(false)} onFile={handleFile} />
        </div>
    );
}
