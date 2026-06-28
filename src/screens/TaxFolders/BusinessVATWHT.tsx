'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftLine } from '@mingcute/react';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Drawer, DrawerContent, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import Lenis from 'lenis';
import {
    SectionHeading, DescriptionText, PrimaryButton, SecondaryButton,
    FilingSheet, CardTitle, CardContainer, FormFieldRow, FormLabel, MonthList,
    UploadContainer,
} from './TaxFolderShared';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const EXEMPT_CATEGORIES = [
    'Select', 'Medical / Healthcare', 'Educational materials', 'Basic food items',
    'Financial services', 'Transportation', 'Rent (residential)', 'None / Not applicable',
];

const VAT_RATE = 0.075;

const fmt = (n: number) => `₦${Math.round(n).toLocaleString()}`;

// ── VAT Form Types ────────────────────────────────────────────────────────────
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

// ── WHT Types ─────────────────────────────────────────────────────────────────
const WHT_TYPES = [
    'Select', 'WHT on Services (5%)', 'WHT on Rent (10%)', 'WHT on Dividends (10%)',
    'WHT on Interest (10%)', 'WHT on Royalties (10%)', 'WHT on Construction (2.5%)', 'WHT on Haulage (5%)',
];

interface WHTDeduction {
    id: number;
    payee: string; tin: string; whtType: string;
    gross: string; whtRate: string; whtDeducted: string; netPaid: string; date: string;
}

const defaultDeduction = (): Omit<WHTDeduction, 'id'> => ({
    payee: '', tin: '', whtType: 'Select',
    gross: '', whtRate: '', whtDeducted: 'Select', netPaid: '', date: '',
});

const STORAGE_KEY_WHT_DEDUCTIONS = 'taxable_wht_deductions';
const STORAGE_KEY_WHT_FILED = 'taxable_wht_filed';
const STORAGE_KEY_WHT_MONTH = 'taxable_wht_month';

// ── WHT Deduction Form (shared for WHT Credit Balance) ────────────────────────
const WHTDeductionForm = ({ onSave, onCancel, initial }: {
    onSave: (d: Omit<WHTDeduction, 'id'>) => void;
    onCancel: () => void;
    initial?: Omit<WHTDeduction, 'id'>;
}) => {
    const [form, setForm] = useState(initial ?? defaultDeduction());
    const set = (k: keyof typeof form) => (val: string) => setForm(f => ({ ...f, [k]: val }));

    const grossNum = Number(form.gross.replace(/,/g, '')) || 0;
    const rateMatch = form.whtType.match(/(\d+(?:\.\d+)?)%/);
    const autoRate = rateMatch ? Number(rateMatch[1]) : 0;
    const autoWHT = grossNum * autoRate / 100;
    const autoNet = grossNum - autoWHT;

    return (
        <div>
            <h2 className="text-5 font-semibold text-neutral-800 mb-5">Add WHT Deduction</h2>

            <div className="bg-neutral-50 rounded-3xl p-5 mb-4">
                <h3 className="text-3 font-semibold text-neutral-800 mb-4">Payee Details (who you paid)</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FormLabel tip="Full legal name or company name of the vendor/payee.">Name</FormLabel>
                        <Input type="text" placeholder="Enter name" value={form.payee} onChange={e => set('payee')(e.target.value)} />
                    </div>
                    <div>
                        <FormLabel tip="Tax Identification Number of the payee.">TIN</FormLabel>
                        <Input type="text" placeholder="Enter TIN" value={form.tin} onChange={e => set('tin')(e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="bg-neutral-50 rounded-3xl p-5">
                <h3 className="text-3 font-semibold text-neutral-800 mb-4">Payment Details</h3>
                <div className="space-y-3">
                    <FormFieldRow className="justify-between">
                        <FormLabel tip="The type of transaction determines the applicable WHT rate.">WHT Type</FormLabel>
                        <SearchableSelect
                            options={WHT_TYPES}
                            value={form.whtType}
                            onChange={(v) => set('whtType')(v)}
                            className="w-[150px]"
                        />
                    </FormFieldRow>
                    <FormFieldRow className="justify-between">
                        <FormLabel tip="Total amount paid before deducting WHT.">Gross payment</FormLabel>
                        <Input type="text" placeholder="N0" value={form.gross} onChange={e => set('gross')(e.target.value.replace(/[^0-9.]/g, ''))} className="w-[150px] text-left" />
                    </FormFieldRow>
                    <FormFieldRow className="justify-between">
                        <FormLabel tip="Applicable Withholding Tax rate set by FIRS.">WHT rate</FormLabel>
                        <Input type="text" value={autoRate > 0 ? `${autoRate}%` : 'Select type above'} disabled className="w-[150px] text-left bg-neutral-50 text-neutral-300" />
                    </FormFieldRow>
                    <FormFieldRow className="justify-between">
                        <FormLabel tip="Auto-calculated: Gross x WHT rate.">WHT deducted</FormLabel>
                        <Input type="text" value={autoWHT > 0 ? `₦${Math.round(autoWHT).toLocaleString()}` : 'Select'} disabled className="w-[150px] text-left bg-neutral-50 text-neutral-300" />
                    </FormFieldRow>
                    <FormFieldRow className="justify-between">
                        <FormLabel tip="Amount actually remitted: Gross minus WHT.">Net paid to payee</FormLabel>
                        <Input type="text" value={autoNet > 0 ? `₦${Math.round(autoNet).toLocaleString()}` : 'N0'} disabled className="w-[150px] text-left bg-neutral-50 text-neutral-300" />
                    </FormFieldRow>
                    <FormFieldRow className="justify-between">
                        <FormLabel tip="The date when payment was made to the vendor.">Date of payment</FormLabel>
                        <Input type="text" placeholder="dd/mm/yyyy" value={form.date} onChange={e => set('date')(e.target.value)} className="w-[150px] text-left" />
                    </FormFieldRow>
                </div>
            </div>

            <div className="flex gap-3">
                <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
                <PrimaryButton onClick={() => onSave({ ...form, whtDeducted: String(Math.round(autoWHT)), netPaid: String(Math.round(autoNet)), whtRate: String(autoRate) })}>
                    Save WHT Deduction
                </PrimaryButton>
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
        <div className="bg-neutral-50 rounded-3xl p-4">
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div><p className="text-1 font-semibold text-neutral-400 mb-0.5">Payee</p><p className="text-2 font-semibold text-neutral-800 truncate">{d.payee || 'N/A'}</p></div>
                <div><p className="text-1 font-semibold text-neutral-400 mb-0.5">TIN</p><p className="text-2 font-semibold text-neutral-800 font-mono">{d.tin || 'N/A'}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div><p className="text-1 font-semibold text-neutral-400 mb-0.5">Type</p><p className="text-2 font-semibold text-neutral-800 truncate">{d.whtType !== 'Select' ? d.whtType : 'N/A'}</p></div>
                <div><p className="text-1 font-semibold text-neutral-400 mb-0.5">Gross</p><p className="text-2 font-bold text-neutral-800">{fmt(gross)}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div><p className="text-1 font-semibold text-neutral-400 mb-0.5">WHT</p><p className="text-2 font-bold text-neutral-800">{fmt(wht)}</p></div>
                <div><p className="text-1 font-semibold text-neutral-400 mb-0.5">Net</p><p className="text-2 font-bold text-neutral-800">{fmt(net)}</p></div>
            </div>
            <div className="mb-3">
                <p className="text-1 font-semibold text-neutral-400 mb-0.5">Date</p>
                <p className="text-2 font-semibold text-neutral-800">{d.date || '—'}</p>
            </div>
            <div className="flex gap-2">
                <SecondaryButton className="h-8 px-4 text-1" onClick={onRemove}>Remove</SecondaryButton>
                <SecondaryButton className="h-8 px-4 text-1" onClick={onEdit}>Edit</SecondaryButton>
            </div>
        </div>
    );
};

// ── WHT Remittance ─────────────────────────────────────────────────────────────
const WHTRemittance = () => {
    const [deductions, setDeductions] = useState<WHTDeduction[]>(() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY_WHT_DEDUCTIONS)!) || []; } catch { return []; }
    });
    const [showFormSheet, setShowFormSheet] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [activeMonth, setActiveMonth] = useState(() => {
        try { const v = parseInt(localStorage.getItem(STORAGE_KEY_WHT_MONTH)!, 10); return v >= 0 && v <= 11 ? v : 0; } catch { return 0; }
    });
    const [filedMonths, setFiledMonths] = useState<Set<number>>(() => {
        try { const v = JSON.parse(localStorage.getItem(STORAGE_KEY_WHT_FILED)!); return v ? new Set(v) : new Set(); } catch { return new Set(); }
    });
    const [showFilingModal, setShowFilingModal] = useState(false);
    const [form, setForm] = useState(defaultDeduction());
    const set = (k: keyof typeof form) => (val: string) => setForm(f => ({ ...f, [k]: val }));

    const grossNum = Number(form.gross.replace(/,/g, '')) || 0;
    const rateMatch = form.whtType.match(/(\d+(?:\.\d+)?)%/);
    const autoRate = rateMatch ? Number(rateMatch[1]) : 0;
    const autoWHT = grossNum * autoRate / 100;
    const autoNet = grossNum - autoWHT;

    const total = deductions.reduce((s, d) => s + (Number(d.whtDeducted) || 0), 0);
    const [periodMode, setPeriodMode] = useState<'monthly' | 'annually'>('monthly');
    const dueDate = MONTHS[(activeMonth + 1) % 12].slice(0, 3) + ' 21, 2025';
    const canSave = form.payee.trim() && form.tin.trim() && form.whtType !== 'Select' && form.gross.trim() && form.date.trim();
    const hasAnyInput = form.payee.trim() || form.tin.trim() || form.whtType !== 'Select' || form.gross.trim() || form.date.trim();

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_WHT_DEDUCTIONS, JSON.stringify(deductions));
    }, [deductions]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_WHT_FILED, JSON.stringify(Array.from(filedMonths)));
    }, [filedMonths]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_WHT_MONTH, String(activeMonth));
    }, [activeMonth]);

    const handleSave = () => {
        const d = { ...form, whtDeducted: String(Math.round(autoWHT)), netPaid: String(Math.round(autoNet)), whtRate: String(autoRate) };
        if (editId !== null) {
            setDeductions(prev => prev.map(item => item.id === editId ? { ...d, id: editId } : item));
            setEditId(null);
        } else {
            setDeductions(prev => [...prev, { ...d, id: Date.now() }]);
        }
        setForm(defaultDeduction());
        setShowFormSheet(false);
    };

    const handleCancel = () => {
        setForm(defaultDeduction());
        setShowFormSheet(false);
        setEditId(null);
    };

    const openAdd = () => { setForm(defaultDeduction()); setShowFormSheet(true); };
    const openEdit = (d: WHTDeduction) => { setForm({ payee: d.payee, tin: d.tin, whtType: d.whtType, gross: d.gross, whtRate: d.whtRate, whtDeducted: d.whtDeducted, netPaid: d.netPaid, date: d.date }); setEditId(d.id); setShowFormSheet(true); };

    const handleFile = () => {
        setFiledMonths(prev => new Set([...prev, activeMonth]));
        setShowFilingModal(false);
        if (activeMonth < 11) setActiveMonth(m => m + 1);
    };

    return (
        <div className="flex gap-10">
            <div className="w-[220px] flex-shrink-0 sticky top-24 self-start p-[11px]">
                <div className="flex items-center gap-3 mb-6">
                    <span className={`text-3 font-medium ${periodMode === 'monthly' ? 'text-neutral-800' : 'text-neutral-500'}`}>Monthly</span>
                    <Switch checked={periodMode === 'annually'} onCheckedChange={(v) => setPeriodMode(v ? 'annually' : 'monthly')} />
                    <span className={`text-3 font-medium ${periodMode === 'annually' ? 'text-neutral-800' : 'text-neutral-500'}`}>Annually</span>
                </div>
                {periodMode === 'monthly' && (
                    <Select value={MONTHS[activeMonth]} onValueChange={(v) => { if (v) setActiveMonth(MONTHS.indexOf(v)); }}>
                        <SelectTrigger className="w-full h-10 rounded-xl bg-white text-3">
                            <div className="flex items-center gap-2">
                                <span>{MONTHS[activeMonth]}</span>
                                {filedMonths.has(activeMonth) &&
                                    <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-200 text-2 font-semibold px-2 py-0 h-5">Filed</Badge>
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
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <FilingSheet open={showFilingModal} onClose={() => setShowFilingModal(false)} onFile={handleFile} />

            <Drawer open={showFormSheet} onOpenChange={(open) => { if (!open) handleCancel(); }}>
                <DrawerContent className="bg-white w-full max-w-full px-4 pb-4 max-h-[85vh]">
                    <DrawerTitle className="sr-only">Add WHT Deduction</DrawerTitle>
                    <div className="max-w-[450px] mx-auto w-full pt-2 text-center">
                        <h2 className="text-5 font-semibold text-neutral-800 mb-8">Add WHT Deduction</h2>
                    </div>
                    <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                        <div className="max-w-[450px] mx-auto w-full pb-[32px]">
                            <h3 className="text-3 font-semibold text-neutral-800 mb-4">Payee Details (who you paid)</h3>
                            <div className="bg-neutral-50 rounded-3xl p-5 mb-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <FormLabel tip="Full legal name or company name of the vendor/payee.">Name</FormLabel>
                                        <Input type="text" placeholder="Enter name" value={form.payee} onChange={e => set('payee')(e.target.value)} />
                                    </div>
                                    <div>
                                        <FormLabel tip="Tax Identification Number of the payee.">TIN</FormLabel>
                                        <Input type="text" placeholder="Enter TIN" value={form.tin} onChange={e => set('tin')(e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-3 font-semibold text-neutral-800 mb-4">Payment Details</h3>
                            <div className="bg-neutral-50 rounded-3xl p-5">
                                <div className="space-y-3">
                                    <FormFieldRow className="justify-between">
                                        <FormLabel tip="The type of transaction determines the applicable WHT rate.">WHT Type</FormLabel>
                                        <SearchableSelect
                                            options={WHT_TYPES}
                                            value={form.whtType}
                                            onChange={(v) => set('whtType')(v)}
                                            className="w-[150px]"
                                        />
                                    </FormFieldRow>
                                    <FormFieldRow className="justify-between">
                                        <FormLabel tip="Total amount paid before deducting WHT.">Gross payment</FormLabel>
                                        <Input type="text" placeholder="N0" value={form.gross} onChange={e => set('gross')(e.target.value.replace(/[^0-9.]/g, ''))} className="w-[150px] text-left" />
                                    </FormFieldRow>
                                    <FormFieldRow className="justify-between">
                                        <FormLabel tip="Applicable Withholding Tax rate set by FIRS.">WHT rate</FormLabel>
                                        <Input type="text" value={autoRate > 0 ? `${autoRate}%` : 'Select type above'} disabled className="w-[150px] text-left bg-neutral-50 text-neutral-300" />
                                    </FormFieldRow>
                                    <FormFieldRow className="justify-between">
                                        <FormLabel tip="Auto-calculated: Gross x WHT rate.">WHT deducted</FormLabel>
                                        <Input type="text" value={autoWHT > 0 ? `₦${Math.round(autoWHT).toLocaleString()}` : 'Select'} disabled className="w-[150px] text-left bg-neutral-50 text-neutral-300" />
                                    </FormFieldRow>
                                    <FormFieldRow className="justify-between">
                                        <FormLabel tip="Amount actually remitted: Gross minus WHT.">Net paid to payee</FormLabel>
                                        <Input type="text" value={autoNet > 0 ? `₦${Math.round(autoNet).toLocaleString()}` : 'N0'} disabled className="w-[150px] text-left bg-neutral-50 text-neutral-300" />
                                    </FormFieldRow>
                                    <FormFieldRow className="justify-between">
                                        <FormLabel tip="The date when payment was made to the vendor.">Date of payment</FormLabel>
                                        <Input type="text" placeholder="dd/mm/yyyy" value={form.date} onChange={e => set('date')(e.target.value)} className="w-[150px] text-left" />
                                    </FormFieldRow>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="max-w-[450px] mx-auto w-full pt-4 border-t border-neutral-100 mt-2">
                        <div className="flex gap-3">
                            <DrawerClose asChild>
                                <SecondaryButton className="flex-1">Cancel</SecondaryButton>
                            </DrawerClose>
                            <PrimaryButton className="flex-1" onClick={handleSave} disabled={!canSave}>Save WHT Deduction</PrimaryButton>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>

            <div className="flex-1 max-w-[700px]">
                {periodMode === 'annually' ? (
                    <div>
                        <SectionHeading>Annual WHT Return</SectionHeading>
                        <DescriptionText>Annual reconciliation of withholding tax deductions</DescriptionText>
                        {deductions.length === 0 ? (
                            <p className="text-2 font-medium text-neutral-500 mb-6">No WHT deductions recorded for any month</p>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {deductions.map(d => (
                                        <PayeeCard key={d.id} d={d}
                                            onRemove={() => setDeductions(prev => prev.filter(x => x.id !== d.id))}
                                            onEdit={() => openEdit(d)}
                                        />
                                    ))}
                                </div>
                                <button onClick={openAdd}
                                    className="flex items-center gap-1.5 text-2 font-semibold text-taxable-blue mb-7">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                    Add Another WHT Deduction
                                </button>
                                <div className="mb-2">
                                    <p className="text-2 font-medium text-neutral-700 mb-1">Total Withholding Tax to remit</p>
                                    <p className="text-5 font-semibold text-neutral-800">₦{Math.round(total).toLocaleString()}</p>
                                </div>
                                <div className="flex gap-3">
                                    <SecondaryButton>Download PDF</SecondaryButton>
                                    <PrimaryButton onClick={() => setShowFilingModal(true)}>
                                        File & Remit ({total >= 1_000_000 ? `₦${(total / 1_000_000).toFixed(1)}M` : total >= 1000 ? `₦${Math.round(total / 1000)}K` : fmt(total)})
                                    </PrimaryButton>
                                </div>
                            </>
                        )}
                    </div>
                ) : deductions.length === 0 ? (
                    <div>
                        <SectionHeading>Remit Monthly WHT</SectionHeading>
                        <DescriptionText>Record payments and calculate withholding tax to remit</DescriptionText>
                        <p className="text-2 font-medium text-neutral-500 mb-6">No WHT deductions recorded yet</p>
                        <PrimaryButton onClick={openAdd}>Add WHT Deduction</PrimaryButton>
                    </div>
                ) : (
                    <div>
                        <SectionHeading>Remit Monthly WHT</SectionHeading>
                        <DescriptionText>Record payments and calculate withholding tax to remit</DescriptionText>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {deductions.map(d => (
                                <PayeeCard key={d.id} d={d}
                                    onRemove={() => setDeductions(prev => prev.filter(x => x.id !== d.id))}
                                    onEdit={() => openEdit(d)}
                                />
                            ))}
                        </div>

                        <button onClick={openAdd}
                            className="flex items-center gap-1.5 text-2 font-semibold text-taxable-blue hover:opacity-80 transition-opacity mb-7">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Add Another WHT Deduction
                        </button>

                        <div className="mb-2">
                            <p className="text-1 font-semibold text-neutral-500 mb-1">Total Withholding Tax to remit</p>
                            <p className="text-9 font-bold text-neutral-900">₦{Math.round(total).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-1.5 mb-6">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-amber-600" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <p className="text-1 font-bold text-amber-600">Due by: {dueDate}</p>
                        </div>
                        <div className="flex gap-3">
                            <SecondaryButton>Download PDF</SecondaryButton>
                            <PrimaryButton onClick={() => setShowFilingModal(true)}>
                                File & Remit ({total >= 1_000_000 ? `₦${(total / 1_000_000).toFixed(1)}M` : total >= 1000 ? `₦${Math.round(total / 1000)}K` : fmt(total)})
                            </PrimaryButton>
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
    const [filedMonths, _setFiledMonths] = useState<Set<number>>(new Set());
    const [periodMode, setPeriodMode] = useState<'monthly' | 'annually'>('monthly');

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
        <div className="flex gap-10">
            <div className="w-[220px] flex-shrink-0 sticky top-24 self-start p-[11px]">
                <div className="flex items-center gap-3 mb-6">
                    <span className={`text-3 font-medium ${periodMode === 'monthly' ? 'text-neutral-800' : 'text-neutral-500'}`}>Monthly</span>
                    <Switch checked={periodMode === 'annually'} onCheckedChange={(v) => setPeriodMode(v ? 'annually' : 'monthly')} />
                    <span className={`text-3 font-medium ${periodMode === 'annually' ? 'text-neutral-800' : 'text-neutral-500'}`}>Annually</span>
                </div>
                {periodMode === 'monthly' && (
                    <Select value={MONTHS[activeMonth]} onValueChange={(v) => { if (v) setActiveMonth(MONTHS.indexOf(v)); }}>
                        <SelectTrigger className="w-full h-10 rounded-xl bg-white text-3">
                            <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                            {MONTHS.map((m) => (
                                <SelectItem key={m} value={m}>
                                    <span>{m}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <div className="flex-1 min-w-0">
                {(showForm || editId !== null) ? (
                    <WHTDeductionForm
                        initial={editId !== null ? (() => {
                            const d = credits.find(x => x.id === editId)!;
                            return Object.fromEntries(Object.entries(d).filter(([k]) => k !== 'id')) as Omit<WHTDeduction, 'id'>;
                        })() : undefined}
                        onSave={handleSave}
                        onCancel={() => { setShowForm(false); setEditId(null); }}
                    />
                ) : credits.length === 0 ? (
                    <div className="flex flex-col items-start gap-3">
                        <SectionHeading>WHT Credit Notes</SectionHeading>
                        <p className="text-2 text-neutral-500 font-medium">WHT deducted from payments received — used to offset your CIT liability.</p>
                        <button onClick={() => setShowForm(true)}
                            className="mt-2 flex items-center gap-1.5 text-2 font-semibold text-taxable-blue hover:opacity-80 transition-opacity">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Add WHT Credit Note
                        </button>
                    </div>
                ) : (
                    <div>
                        <SectionHeading>WHT Credit Notes</SectionHeading>
                        <DescriptionText>WHT deducted from payments received — used to offset your CIT liability.</DescriptionText>

                        <div className="space-y-3 mb-4">
                            {credits.map(d => (
                                <PayeeCard key={d.id} d={d}
                                    onRemove={() => setCredits(prev => prev.filter(x => x.id !== d.id))}
                                    onEdit={() => setEditId(d.id)}
                                />
                            ))}
                        </div>

                        <button onClick={() => setShowForm(true)}
                            className="flex items-center gap-1.5 text-2 font-semibold text-taxable-blue hover:opacity-80 transition-opacity mb-7">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Add Another WHT Credit Note
                        </button>

                        <div className="mb-6 bg-blue-50 border border-blue-100 rounded-2xl p-5 inline-flex gap-8">
                            <div>
                                <p className="text-1 font-semibold text-neutral-500 mb-1">Total WHT Credit</p>
                                <p className="text-7 font-bold text-taxable-blue">₦{Math.round(total).toLocaleString()}</p>
                            </div>
                            <PrimaryButton className="self-center h-10 px-5 text-2">
                                Apply to CIT</PrimaryButton>
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
    onSubMenuChange: _onSubMenuChange,
}: {
    activeSubMenu?: 'file-vat' | 'remit-wht' | 'wht-balance';
    onSubMenuChange?: (s: 'file-vat' | 'remit-wht' | 'wht-balance') => void;
}) {
    const [internalSubSection, _setInternalSubSection] = useState<'file-vat' | 'remit-wht' | 'wht-balance'>('file-vat');
    const subSection = activeSubMenu ?? internalSubSection;

    const [vatStep, setVatStep] = useState<'method' | 'form'>('method');
    const [entryMethod, setEntryMethod] = useState<'manual' | 'csv' | 'software'>('manual');
    const [activeMonth, setActiveMonth] = useState(0);
    const [periodMode, setPeriodMode] = useState<'monthly' | 'annually'>('monthly');
    const [filedMonths, setFiledMonths] = useState<Set<number>>(new Set());
    const [monthData, setMonthData] = useState<Record<number, MonthVATData>>({});
    const [showFilingModal, setShowFilingModal] = useState(false);

    const data = monthData[activeMonth] ?? defaultMonth();

    const setField = (field: keyof MonthVATData) => (val: string) =>
        setMonthData(prev => ({ ...prev, [activeMonth]: { ...(prev[activeMonth] ?? defaultMonth()), [field]: val } }));

    const totalSales = Number(data.totalSales.replace(/,/g, '')) || 0;
    const outputVAT = totalSales * VAT_RATE;
    const totalPurchases = Number(data.totalPurchases.replace(/,/g, '')) || 0;
    const inputVAT = totalPurchases * VAT_RATE;
    const netVAT = outputVAT - inputVAT;
    const isCredit = netVAT < 0;

    const dueDate = MONTHS[(activeMonth + 1) % 12].slice(0, 3) + ' 21, 2026';

    const handleFile = () => {
        setFiledMonths(prev => new Set([...prev, activeMonth]));
        setShowFilingModal(false);
        if (activeMonth < 11) setActiveMonth(m => m + 1);
    };

    const ENTRY_OPTIONS = [
        { id: 'manual' as const, label: 'Manual entry' },
        { id: 'csv' as const, label: 'Upload sales & purchase ledgers (CSV/Excel)' },
        { id: 'software' as const, label: 'Connect accounting software (QuickBooks, Xero, Zoho)' },
    ];

    return (
        <div className="w-full">
            <div className="flex-1 min-w-0">

                {/* ── File Monthly VAT Return ── */}
                {subSection === 'file-vat' && vatStep === 'method' && (
                    <div className="max-w-[480px] mx-auto">
                        <SectionHeading>File Monthly VAT Return</SectionHeading>
                        <DescriptionText>How do you want to enter your VAT data?</DescriptionText>

                        <RadioGroup value={entryMethod} onValueChange={(v) => setEntryMethod(v as 'manual' | 'csv' | 'software')} className="space-y-0 mb-8">
                            {ENTRY_OPTIONS.map(opt => (
                                <label key={opt.id} className="flex items-center gap-3 py-3.5 cursor-pointer">
                                    <RadioGroupItem value={opt.id} />
                                    <span className="text-3 font-medium text-neutral-800">{opt.label}</span>
                                </label>
                            ))}
                        </RadioGroup>

                        <div className="mb-8">
                            <label className="block text-2 font-medium text-neutral-700 mb-2">Select month</label>
                            <Select value={MONTHS[activeMonth]} onValueChange={(v) => { if (v) setActiveMonth(MONTHS.indexOf(v)); }}>
                                <SelectTrigger className="w-[300px] h-10 rounded-xl bg-white text-3">
                                    <SelectValue placeholder="Choose a month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MONTHS.map((m) => (
                                        <SelectItem key={m} value={m}>
                                            <span>{m}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <PrimaryButton onClick={() => setVatStep('form')}>
                            Continue
                        </PrimaryButton>
                    </div>
                )}

                {/* ── VAT Form ── */}
                {subSection === 'file-vat' && vatStep === 'form' && (
                    <div className="flex gap-10">
                        <div className="w-[220px] flex-shrink-0">
                            <div className="flex items-center gap-3 mb-6">
                                <span className={`text-3 font-medium ${periodMode === 'monthly' ? 'text-neutral-800' : 'text-neutral-500'}`}>Monthly</span>
                                <Switch checked={periodMode === 'annually'} onCheckedChange={(v) => setPeriodMode(v ? 'annually' : 'monthly')} />
                                <span className={`text-3 font-medium ${periodMode === 'annually' ? 'text-neutral-800' : 'text-neutral-500'}`}>Annually</span>
                            </div>
                            {periodMode === 'monthly' && (
                                <Select value={MONTHS[activeMonth]} onValueChange={(v) => { if (v) setActiveMonth(MONTHS.indexOf(v)); }}>
                                    <SelectTrigger className="w-full h-10 rounded-xl bg-white text-3">
                                        <div className="flex items-center gap-2">
                                            <span>{MONTHS[activeMonth]}</span>
                                            {filedMonths.has(activeMonth) &&
                                                <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-200 text-2 font-semibold px-2 py-0 h-5">Filed</Badge>
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
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <FilingSheet open={showFilingModal} onClose={() => setShowFilingModal(false)} onFile={handleFile} />

                        <div className="flex-1 max-w-[500px] pb-6">
                            <SectionHeading>
                                {periodMode === 'annually' ? 'Annual VAT Return' : `${MONTHS[activeMonth]} VAT Return`}
                            </SectionHeading>

                            <div className="mt-4 space-y-10">
                            {/* Output VAT */}
                            <div>
                                <CardTitle>Output VAT <span className="text-neutral-500 font-medium">(VAT you charged customers)</span></CardTitle>
                                <div className="bg-neutral-50 rounded-3xl p-5">
                                    <div className="space-y-3">
                                    <FormFieldRow className="justify-between">
                                        <FormLabel tip="Your total revenue before any VAT is added.">Total sales (before VAT)</FormLabel>
                                        <Input type="text" value={data.totalSales}
                                            onChange={e => {
                                                const raw = e.target.value.replace(/[^0-9.]/g, '');
                                                const parts = raw.split('.');
                                                const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                                setField('totalSales')(parts.length > 1 ? integer + '.' + parts.slice(1).join('') : integer);
                                            }}
                                            placeholder="N0" className="w-[150px] text-left" />
                                    </FormFieldRow>
                                    <FormFieldRow className="justify-between">
                                        <FormLabel tip="Automatically calculated: Total sales x 7.5%">VAT charged at 7.5%</FormLabel>
                                        <Input type="text" value={outputVAT > 0 ? fmt(outputVAT) : 'N0'} disabled className="w-[150px] text-left bg-neutral-50 text-neutral-300" />
                                    </FormFieldRow>
                                    <FormFieldRow className="justify-between">
                                        <FormLabel tip="Sales where VAT is 0% — exports, certain goods.">Zero-rated sales (exports, etc.)</FormLabel>
                                        <Input type="text" value={data.zeroRated}
                                            onChange={e => {
                                                const raw = e.target.value.replace(/[^0-9.]/g, '');
                                                const parts = raw.split('.');
                                                const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                                setField('zeroRated')(parts.length > 1 ? integer + '.' + parts.slice(1).join('') : integer);
                                            }}
                                            placeholder="N0" className="w-[150px] text-left" />
                                    </FormFieldRow>
                                    <FormFieldRow className="justify-between">
                                        <FormLabel tip="Sales of exempt goods/services where VAT cannot be charged.">Exempt sales (medical, education, etc.)</FormLabel>
                                        <SearchableSelect
                                            options={EXEMPT_CATEGORIES}
                                            value={data.exempt}
                                            onChange={(v) => setField('exempt')(v)}
                                            placeholder="Select exempt category"
                                        />
                                    </FormFieldRow>

                                    <div className="mt-6">
                                    <UploadContainer
                                        label="Upload your financial statements"
                                        sublabel="PDF, JPG, or PNG (Max 5MB)"
                                    />
                                    </div>

                                    <div className="mt-6">
                                        <p className="text-2 font-medium text-neutral-700 mb-0.5">Total output VAT</p>
                                        <p className="text-5 font-semibold text-neutral-800">{fmt(outputVAT)}</p>
                                    </div>
                                    </div>
                                </div>
                            </div>

                            {/* Input VAT */}
                            <div>
                                <CardTitle>Input VAT <span className="text-neutral-500 font-medium">(VAT you paid to suppliers)</span></CardTitle>
                                <div className="bg-neutral-50 rounded-3xl p-5">
                                    <div className="space-y-3">
                                    <FormFieldRow className="justify-between">
                                        <FormLabel tip="Your total spending on goods/services before VAT.">Total purchases (before VAT)</FormLabel>
                                        <Input type="text" value={data.totalPurchases}
                                            onChange={e => {
                                                const raw = e.target.value.replace(/[^0-9.]/g, '');
                                                const parts = raw.split('.');
                                                const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                                setField('totalPurchases')(parts.length > 1 ? integer + '.' + parts.slice(1).join('') : integer);
                                            }}
                                            placeholder="N0" className="w-[150px] text-left" />
                                    </FormFieldRow>
                                    <FormFieldRow className="justify-between">
                                        <FormLabel tip="Automatically calculated: Total purchases x 7.5%">VAT paid at 7.5%</FormLabel>
                                        <Input type="text" value={inputVAT > 0 ? fmt(inputVAT) : 'N0'} disabled className="w-[150px] text-left bg-neutral-50 text-neutral-300" />
                                    </FormFieldRow>

                                    <div className="mt-6">
                                    <UploadContainer
                                        label="Upload your financial statements"
                                        sublabel="PDF, JPG, or PNG (Max 5MB)"
                                    />
                                    </div>

                                    <div className="mt-6">
                                        <p className="text-2 font-medium text-neutral-700 mb-0.5">Total input VAT</p>
                                        <p className="text-5 font-semibold text-neutral-800">{fmt(inputVAT)}</p>
                                    </div>
                                    </div>
                                </div>
                            </div>

                            {/* Net VAT Payable */}
                            <div>
                                <CardTitle>Net VAT Payable</CardTitle>
                                <div className="mt-4 space-y-6">
                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between text-2">
                                            <span className="text-neutral-500 font-medium">Output VAT</span>
                                            <span className="font-semibold text-neutral-500">{fmt(outputVAT)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-2">
                                            <span className="text-neutral-500 font-medium">Input VAT</span>
                                            <span className="font-semibold text-neutral-500">-{fmt(inputVAT)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-2 pt-2 border-t border-neutral-100">
                                            <span className="font-bold text-neutral-800">Net VAT {isCredit ? 'credit' : 'due'}</span>
                                            <span className={`font-bold text-4 ${isCredit ? 'text-green-600' : 'text-neutral-900'}`}>
                                                {isCredit ? `+${fmt(Math.abs(netVAT))}` : fmt(netVAT)}
                                            </span>
                                        </div>
                                    </div>

                                    {!isCredit ? (
                                        <div className="flex items-center gap-1.5">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="flex-shrink-0 text-amber-600" strokeWidth="2.5">
                                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                            </svg>
                                            <p className="text-1 font-bold text-amber-600">Due by: {dueDate}</p>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-1.5">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="flex-shrink-0 mt-0.5 text-amber-600" strokeWidth="2.5">
                                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                            </svg>
                                            <p className="text-1 font-bold text-amber-600">
                                                Due by: {dueDate}. You paid more VAT to suppliers than you collected from customers.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {isCredit ? (
                                    <>
                                        <SecondaryButton onClick={() => { setFiledMonths(prev => new Set([...prev, activeMonth])); if (activeMonth < 11) setActiveMonth(m => m + 1); }}>
                                            Carry Forward to {MONTHS[(activeMonth + 1) % 12].slice(0, 3)}
                                        </SecondaryButton>
                                        <PrimaryButton onClick={() => setShowFilingModal(true)}>
                                            Claim Refund
                                        </PrimaryButton>
                                    </>
                                ) : (
                                    <>
                                        <SecondaryButton>Download PDF</SecondaryButton>
                                        <PrimaryButton onClick={() => setShowFilingModal(true)}>
                                            File & Pay
                                        </PrimaryButton>
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

// ── Standalone page wrapper ──────────────────────────────────────────────────
export default function BusinessVATWHT() {
    const router = useRouter();
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.8,
        });
        (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        return () => {
            lenis.destroy();
            (window as unknown as { __lenis?: Lenis }).__lenis = undefined;
        };
    }, []);

    return (
        <div ref={contentRef} className="min-h-screen bg-white">
            <main className="max-w-[1340px] mx-auto px-4 md:px-8">
                <div className="pt-6 md:pt-8 mb-6">
                    <button onClick={() => router.push('/home')} className="flex items-center gap-1.5 text-2 font-semibold text-neutral-800 w-fit mb-[4px]">
                        <ArrowLeftLine size={14} />
                        Back
                    </button>
                    <div className="flex items-center gap-1.5 text-1 text-neutral-300 font-medium">
                        <span>2026 Company Tax</span><span>/</span>
                        <span className="text-neutral-300">VAT/WHT</span>
                    </div>
                </div>
                <BusinessVATWHTContent />
            </main>
        </div>
    );
}
