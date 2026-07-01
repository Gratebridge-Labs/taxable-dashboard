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
    SectionHeading, DescriptionText, PrimaryButton, SecondaryButton,
    FilingSheet, FormFieldRow, FormLabel, CardTitle,
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
export function BusinessVATContent() {
    const [vatStep, setVatStep] = useState<'gatekeeper' | 'output-vat' | 'input-vat' | 'adjustments' | 'review'>('gatekeeper');
    const [entryMethod, setEntryMethod] = useState<'manual' | 'csv' | 'software'>('manual');
    const [activeMonth, setActiveMonth] = useState(0);
    const [periodMode, setPeriodMode] = useState<'monthly' | 'annually'>('monthly');
    const [filedMonths, setFiledMonths] = useState<Set<number>>(new Set());
    const [monthData, setMonthData] = useState<Record<number, VATFilingData>>({});
    const [showFilingModal, setShowFilingModal] = useState(false);
    const [salesScheduleFiles, setSalesScheduleFiles] = useState<{ name: string }[]>([]);
    const [purchaseInvoiceFiles, setPurchaseInvoiceFiles] = useState<{ name: string }[]>([]);

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

    const handleFile = () => {
        setFiledMonths(prev => new Set([...prev, activeMonth]));
        setMonthData(prev => ({ ...prev, [activeMonth]: { ...(prev[activeMonth] ?? defaultFilingData()), filed: true } }));
        setShowFilingModal(false);
        if (activeMonth < 11) setActiveMonth(m => m + 1);
        setVatStep('gatekeeper');
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

    return (
        <div className="w-full">
            {/* ── Step 1: Gatekeeper ── */}
            {vatStep === 'gatekeeper' && (
                <div className="max-w-[480px] mx-auto" data-animate>
                    <SectionHeading>File Monthly VAT Return</SectionHeading>
                    <DescriptionText>How do you want to enter your VAT data?</DescriptionText>

                    <RadioGroup value={entryMethod} onValueChange={(v) => setEntryMethod(v as 'manual' | 'csv' | 'software')} className="space-y-0 mb-8">
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

                    <div className="mb-8">
                        <label className="block text-2 font-medium text-neutral-500 mb-2">Select month <HintIcon tip="The month you're filing VAT for." /></label>
                        <Select value={MONTHS[activeMonth]} onValueChange={(v) => { if (v) setActiveMonth(MONTHS.indexOf(v)); }}>
                            <SelectTrigger className="w-[300px] h-10 rounded-xl bg-white text-3">
                                <SelectValue placeholder="Choose a month" />
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
                    </div>

                    <PrimaryButton onClick={() => setVatStep('output-vat')}>
                        Continue
                    </PrimaryButton>
                </div>
            )}

            {/* ── Step 2: Output VAT (Sales) ── */}
            {vatStep === 'output-vat' && (
                <div className="max-w-[500px] mx-auto" data-animate>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-taxable-blue text-white text-2 font-semibold flex items-center justify-center">1</div>
                        <h2 className="text-5 font-semibold text-neutral-800 tracking-[-0.02em]">Output VAT (Sales)</h2>
                    </div>
                    <div className="flex items-start gap-2 mb-6 p-3 bg-amber-50 rounded-xl">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 mt-0.5 text-amber-600"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        <p className="text-2 text-amber-700 font-medium leading-relaxed">Only include cash actually received this month. Do not include unpaid invoices.</p>
                    </div>

                    <div className="bg-neutral-50 rounded-3xl p-5 mb-6">
                        <div className="space-y-3">
                            <FormFieldRow className="justify-between">
                                <FormLabel tip="Total standard sales before VAT — cash actually received this month.">Standard Sales (7.5%)</FormLabel>
                                <Input type="text" value={data.standardSales} onChange={fmtInput(setField('standardSales'))} placeholder="N0" className="w-[150px] text-left" />
                            </FormFieldRow>
                            <FormFieldRow className="justify-between">
                                <FormLabel tip="Automatically calculated: Standard Sales × 7.5%">Output VAT @ 7.5%</FormLabel>
                                <Input type="text" value={outputVAT > 0 ? fmt(outputVAT) : 'N0'} disabled className="w-[150px] text-left bg-neutral-50 text-neutral-300" />
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

                    <PrimaryButton onClick={() => setVatStep('input-vat')}>
                        Next: Input VAT
                    </PrimaryButton>
                </div>
            )}

            {/* ── Step 3: Input VAT (Purchases) ── */}
            {vatStep === 'input-vat' && (
                <div className="max-w-[500px] mx-auto" data-animate>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-taxable-blue text-white text-2 font-semibold flex items-center justify-center">2</div>
                        <h2 className="text-5 font-semibold text-neutral-800 tracking-[-0.02em]">Input VAT (Purchases)</h2>
                    </div>
                    <div className="flex items-start gap-2 mb-6 p-3 bg-amber-50 rounded-xl">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 mt-0.5 text-amber-600"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        <p className="text-2 text-amber-700 font-medium leading-relaxed">Only claim VAT back on raw materials or inventory for direct resale. VAT on overheads (rent, fuel) and assets is non-allowable.</p>
                    </div>

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

                    <PrimaryButton onClick={() => setVatStep('adjustments')}>
                        Next: Adjustments
                    </PrimaryButton>
                </div>
            )}

            {/* ── Step 4: Adjustments ── */}
            {vatStep === 'adjustments' && (
                <div className="max-w-[500px] mx-auto" data-animate>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-taxable-blue text-white text-2 font-semibold flex items-center justify-center">3</div>
                        <h2 className="text-5 font-semibold text-neutral-800 tracking-[-0.02em]">Adjustments</h2>
                    </div>

                    <div className="bg-neutral-50 rounded-3xl p-5 mb-6">
                        <FormFieldRow className="justify-between">
                            <FormLabel tip="VAT credit carried forward from the previous month. Auto-populated if available.">Brought-Forward VAT Credit</FormLabel>
                            <Input type="text" value={data.broughtForwardCredit} onChange={fmtInput(setField('broughtForwardCredit'))} placeholder="N0" className="w-[150px] text-left" />
                        </FormFieldRow>
                    </div>

                    <PrimaryButton onClick={() => setVatStep('review')}>
                        Review Tax Return
                    </PrimaryButton>
                </div>
            )}

            {/* ── Step 5: Review ── */}
            {vatStep === 'review' && (
                <div className="max-w-[500px] mx-auto" data-animate>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-taxable-blue text-white text-2 font-semibold flex items-center justify-center">4</div>
                        <h2 className="text-5 font-semibold text-neutral-800 tracking-[-0.02em]">Review & Submit</h2>
                    </div>

                    <div className="bg-neutral-50 rounded-3xl p-5 mb-6">
                        <div className="space-y-2.5">
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
                                <span className={`font-semibold text-4 ${isCredit ? 'text-blue-600' : 'text-neutral-900'}`}>{isCredit ? fmt(Math.abs(netPosition)) : fmt(netPosition)}</span>
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

                    <PrimaryButton onClick={() => setShowFilingModal(true)} disabled={!data.disclaimerAccepted}>
                        Submit VAT Return
                    </PrimaryButton>
                </div>
            )}

            {/* Filing Sheet */}
            <FilingSheet open={showFilingModal} onClose={() => setShowFilingModal(false)} onFile={handleFile} />
        </div>
    );
}
