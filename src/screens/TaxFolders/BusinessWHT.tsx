'use client';
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Drawer, DrawerContent, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { WHTDeduction, useWhtDeductions } from './useWhtDeductions';
import {
    SectionHeading, DescriptionText, PrimaryButton, SecondaryButton,
    FilingSheet, FormFieldRow, FormLabel,
} from './TaxFolderShared';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const fmt = (n: number) => `₦${Math.round(n).toLocaleString()}`;

// ── WHT Types ─────────────────────────────────────────────────────────────────
const WHT_TYPES = [
    'Select', 'WHT on Services (5%)', 'WHT on Rent (10%)', 'WHT on Dividends (10%)',
    'WHT on Interest (10%)', 'WHT on Royalties (10%)', 'WHT on Construction (2.5%)', 'WHT on Haulage (5%)',
];

const defaultDeduction = (): Omit<WHTDeduction, 'id'> => ({
    payee: '', tin: '', whtType: 'Select',
    gross: '', whtRate: '', whtDeducted: 'Select', netPaid: '', date: '',
});

const STORAGE_KEY_WHT_DEDUCTIONS = 'taxable_wht_deductions';
const STORAGE_KEY_WHT_FILED = 'taxable_wht_filed';
const STORAGE_KEY_WHT_MONTH = 'taxable_wht_month';
const STORAGE_KEY_WHT_CREDITS = 'taxable_wht_credits';

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

            <div className="bg-neutral-50 rounded-3xl p-5 mb-12">
                <h3 className="text-3 font-semibold text-neutral-800 mb-12">Payee Details (who you paid)</h3>
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
                <h3 className="text-3 font-semibold text-neutral-800 mb-12">Payment Details</h3>
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
                        <Input type="text" placeholder="N0" value={form.gross} onChange={e => { const raw = e.target.value.replace(/[^0-9.]/g, ''); const parts = raw.split('.'); const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); set('gross')(parts.length > 1 ? integer + '.' + parts.slice(1).join('') : integer); }} className="w-[150px] text-left" />
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
            <div className="grid grid-cols-3 gap-8 mb-12">
                <div>
                    <p className="text-1 font-semibold text-neutral-400 mb-0.5">Payee</p>
                    <p className="text-2 font-semibold text-neutral-800">{d.payee || 'N/A'}</p>
                </div>
                <div>
                    <p className="text-1 font-semibold text-neutral-400 mb-0.5">TIN</p>
                    <p className="text-2 font-semibold text-neutral-800">{d.tin || 'N/A'}</p>
                </div>
                <div>
                    <p className="text-1 font-semibold text-neutral-400 mb-0.5">Type</p>
                    <p className="text-2 font-semibold text-neutral-800">{d.whtType !== 'Select' ? d.whtType : 'N/A'}</p>
                </div>
                <div>
                    <p className="text-1 font-semibold text-neutral-400 mb-0.5">Gross</p>
                    <p className="text-2 font-bold text-neutral-800">{fmt(gross)}</p>
                </div>
                <div>
                    <p className="text-1 font-semibold text-neutral-400 mb-0.5">WHT</p>
                    <p className="text-2 font-bold text-neutral-800">{fmt(wht)}</p>
                </div>
                <div>
                    <p className="text-1 font-semibold text-neutral-400 mb-0.5">Net</p>
                    <p className="text-2 font-bold text-neutral-800">{fmt(net)}</p>
                </div>
                <div>
                    <p className="text-1 font-semibold text-neutral-400 mb-0.5">Date</p>
                    <p className="text-2 font-semibold text-neutral-800">{d.date || '—'}</p>
                </div>
            </div>
            <div className="flex gap-2 pt-2">
                <SecondaryButton onClick={onRemove}>Remove</SecondaryButton>
                <SecondaryButton onClick={onEdit}>Edit</SecondaryButton>
            </div>
        </div>);
};

// ── WHT Remittance ─────────────────────────────────────────────────────────────
const WHTRemittance = () => {
    const {
        dataByMonth: deductionsByMonth,
        activeMonth, setActiveMonth,
        periodMode, setPeriodMode,
        currentData: deductions,
        total, annualTotal,
        pendingRemove, setPendingRemove,
        pendingPayee,
        saveItem, handleConfirmRemove,
    } = useWhtDeductions(STORAGE_KEY_WHT_DEDUCTIONS, STORAGE_KEY_WHT_MONTH);

    const [showFormSheet, setShowFormSheet] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [editSourceMonth, setEditSourceMonth] = useState<number | null>(null);
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

    const dueDate = MONTHS[(activeMonth + 1) % 12].slice(0, 3) + ' 21, 2025';
    const canSave = form.payee.trim() && form.tin.trim() && form.whtType !== 'Select' && form.gross.trim() && form.date.trim();

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_WHT_FILED, JSON.stringify(Array.from(filedMonths)));
    }, [filedMonths]);

    const handleSave = () => {
        const d = { ...form, whtDeducted: String(Math.round(autoWHT)), netPaid: String(Math.round(autoNet)), whtRate: String(autoRate) };
        saveItem(d, editId, editSourceMonth ?? undefined);
        setEditId(null);
        setEditSourceMonth(null);
        setForm(defaultDeduction());
        setShowFormSheet(false);
    };

    const handleCancel = () => {
        setForm(defaultDeduction());
        setShowFormSheet(false);
        setEditId(null);
        setEditSourceMonth(null);
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
            <div className="w-[220px] flex-shrink-0 sticky top-24 self-start p-3">
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
                                {!filedMonths.has(activeMonth) && (deductionsByMonth[activeMonth] || []).length > 0 &&
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
                                        {!filedMonths.has(i) && (deductionsByMonth[i] || []).length > 0 &&
                                            <Badge variant="secondary" className="bg-neutral-100 text-neutral-500 border-neutral-200 text-2 font-semibold px-2 py-0 h-5">Draft</Badge>
                                        }
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <FilingSheet open={showFilingModal} onClose={() => setShowFilingModal(false)} onFile={handleFile} />

            {pendingRemove && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20" onClick={() => setPendingRemove(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-[400px] mx-4 w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                            </div>
                            <h3 className="text-6 font-semibold text-neutral-800 mb-2">Remove Deduction?</h3>
                            <p className="text-2 text-neutral-500 font-medium mb-6">
                                Are you sure you want to remove <span className="font-semibold text-neutral-800">{pendingPayee || 'this deduction'}</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 w-full">
                                <SecondaryButton className="flex-1" onClick={() => setPendingRemove(null)}>Cancel</SecondaryButton>
                                <button onClick={handleConfirmRemove} className="flex-1 h-12 bg-red-600 text-white font-semibold rounded-xl text-3">
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Drawer open={showFormSheet} onOpenChange={(open) => { if (!open) handleCancel(); }}>
                <DrawerContent className="bg-white w-full max-w-full px-4 pb-4 max-h-[85vh]">
                    <DrawerTitle className="sr-only">Add WHT Deduction</DrawerTitle>
                    <div className="max-w-[450px] mx-auto w-full pt-2 text-center">
                        <h2 className="text-5 font-semibold text-neutral-800 mb-8">Add WHT Deduction</h2>
                    </div>
                    <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                        <div className="max-w-[450px] mx-auto w-full pb-[32px]">
                            <h3 className="text-3 font-semibold text-neutral-800 mb-12">Payee Details (who you paid)</h3>
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

                            <h3 className="text-3 font-semibold text-neutral-800 mb-12">Payment Details</h3>
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
                                        <Input type="text" placeholder="N0" value={form.gross} onChange={e => { const raw = e.target.value.replace(/[^0-9.]/g, ''); const parts = raw.split('.'); const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); set('gross')(parts.length > 1 ? integer + '.' + parts.slice(1).join('') : integer); }} className="w-[150px] text-left" />
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
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <SectionHeading>Annual WHT Return</SectionHeading>
                                <p className="text-2 text-neutral-500 font-medium">Annual reconciliation of withholding tax deductions</p>
                            </div>
                            {Object.values(deductionsByMonth).some(arr => arr.length > 0) && (
                                <SecondaryButton onClick={openAdd}>Add WHT Deduction</SecondaryButton>
                            )}
                        </div>
                        {!Object.values(deductionsByMonth).some(arr => arr.length > 0) ? (
                            <p className="text-2 font-medium text-neutral-500 mb-6">No WHT deductions recorded for any month</p>
                        ) : (
                            <>
                                <div className="flex flex-col gap-6 mb-12">
                                    {Object.entries(deductionsByMonth).map(([monthKey, monthDeductions]) =>
                                        monthDeductions.length > 0 && (
                                            <div key={monthKey}>
                                                <p className="text-3 font-semibold text-neutral-800 mb-3">{MONTHS[Number(monthKey)]}</p>
                                                <div className="flex flex-col gap-3">
                                                    {monthDeductions.map(d => (
                                                        <PayeeCard key={d.id} d={d}
                                                            onRemove={() => setPendingRemove({ monthKey: Number(monthKey), id: d.id })}
                                                            onEdit={() => { setEditSourceMonth(Number(monthKey)); openEdit(d); }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                                <div className="mb-6">
                                    <p className="text-2 font-medium text-neutral-800 mb-1">Total Withholding Tax to remit</p>
                                    <p className="text-5 font-semibold text-neutral-800 tracking-[-0.02em]">₦{Math.round(annualTotal).toLocaleString()}</p>
                                </div>
                                <div className="flex gap-3">
                                    <PrimaryButton onClick={() => setShowFilingModal(true)}>
                                        File & Remit ({annualTotal >= 1_000_000 ? `₦${(annualTotal / 1_000_000).toFixed(1)}M` : annualTotal >= 1000 ? `₦${Math.round(annualTotal / 1000)}K` : fmt(annualTotal)})
                                    </PrimaryButton>
                                </div>
                            </>
                        )}
                    </div>
                ) : deductions.length === 0 ? (
                    <div>
                        <SectionHeading>Remit {MONTHS[activeMonth]} Withholding Tax</SectionHeading>
                        <p className="text-2 text-neutral-500 font-medium mb-6">Record payments and calculate withholding tax to remit</p>
                        <p className="text-2 font-medium text-neutral-500 mb-6">No WHT deductions recorded yet</p>
                        <SecondaryButton onClick={openAdd}>Add WHT Deduction</SecondaryButton>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <SectionHeading>Remit {MONTHS[activeMonth]} Withholding Tax</SectionHeading>
                                <p className="text-2 text-neutral-500 font-medium">Record payments and calculate withholding tax to remit</p>
                            </div>
                            <SecondaryButton onClick={openAdd}>Add WHT Deduction</SecondaryButton>
                        </div>

                        <div className="flex flex-col gap-3 mb-12">
                            {deductions.map(d => (
                                <PayeeCard key={d.id} d={d}
                                    onRemove={() => setPendingRemove({ monthKey: activeMonth, id: d.id })}
                                    onEdit={() => openEdit(d)}
                                />
                            ))}
                        </div>

                        <div className="flex items-end justify-between mb-6">
                            <div className="flex flex-col gap-3">
                                <div>
                                    <p className="text-2 font-medium text-neutral-800 mb-1">Total Withholding Tax to remit</p>
                                    <p className="text-5 font-semibold text-neutral-800 tracking-[-0.02em]">₦{Math.round(total).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-amber-600" strokeWidth="2.5">
                                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    <p className="text-2 font-semibold text-amber-600">Due by: {dueDate}</p>
                                </div>
                            </div>
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
    const {
        dataByMonth: creditsByMonth,
        activeMonth, setActiveMonth,
        periodMode, setPeriodMode,
        currentData: credits,
        total, annualTotal,
        pendingRemove, setPendingRemove,
        pendingPayee,
        saveItem, handleConfirmRemove,
    } = useWhtDeductions(STORAGE_KEY_WHT_CREDITS);

    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [editSourceMonth, setEditSourceMonth] = useState<number | null>(null);

    const handleSave = (d: Omit<WHTDeduction, 'id'>) => {
        saveItem(d, editId, editSourceMonth ?? undefined);
        setEditId(null);
        setEditSourceMonth(null);
        setShowForm(false);
    };

    return (
        <div className="flex gap-10">
            <div className="w-[220px] flex-shrink-0 sticky top-24 self-start p-3">
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
                                {(creditsByMonth[activeMonth] || []).length > 0 &&
                                    <Badge variant="secondary" className="bg-neutral-100 text-neutral-500 border-neutral-200 text-2 font-semibold px-2 py-0 h-5">Draft</Badge>
                                }
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {MONTHS.map((m, i) => (
                                <SelectItem key={m} value={m}>
                                    <div className="flex items-center gap-2">
                                        <span>{m}</span>
                                        {(creditsByMonth[i] || []).length > 0 &&
                                            <Badge variant="secondary" className="bg-neutral-100 text-neutral-500 border-neutral-200 text-2 font-semibold px-2 py-0 h-5">Draft</Badge>
                                        }
                                    </div>
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
                            const all = Object.values(creditsByMonth).flat();
                            const d = all.find(x => x.id === editId)!;
                            return Object.fromEntries(Object.entries(d).filter(([k]) => k !== 'id')) as Omit<WHTDeduction, 'id'>;
                        })() : undefined}
                        onSave={handleSave}
                        onCancel={() => { setShowForm(false); setEditId(null); setEditSourceMonth(null); }}
                    />
                ) : periodMode === 'annually' && Object.values(creditsByMonth).some(arr => arr.length > 0) ? (
                    <div>
                        <SectionHeading>WHT Credit Notes</SectionHeading>
                        <DescriptionText>WHT deducted from payments received — used to offset your CIT liability.</DescriptionText>

                        <div className="space-y-6 mb-12">
                            {Object.entries(creditsByMonth).map(([monthKey, monthCredits]) =>
                                monthCredits.length > 0 && (
                                    <div key={monthKey}>
                                        <p className="text-3 font-semibold text-neutral-800 mb-3">{MONTHS[Number(monthKey)]}</p>
                                        <div className="space-y-3">
                                            {monthCredits.map(d => (
                                                <PayeeCard key={d.id} d={d}
                                                    onRemove={() => setPendingRemove({ monthKey: Number(monthKey), id: d.id })}
                                                    onEdit={() => { setEditSourceMonth(Number(monthKey)); setEditId(d.id); }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>

                        <button onClick={() => setShowForm(true)}
                            className="flex items-center gap-1.5 text-2 font-semibold text-taxable-blue mb-7">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Add Another WHT Credit Note
                        </button>

                        <div className="mb-6 bg-neutral-50 border border-neutral-100 rounded-2xl p-5 inline-flex gap-8">
                            <div>
                                <p className="text-1 font-semibold text-neutral-500 mb-1">Total WHT Credit</p>
                                <p className="text-7 font-semibold text-taxable-blue tracking-[-0.02em]">₦{Math.round(annualTotal).toLocaleString()}</p>
                            </div>
                            <PrimaryButton className="self-center">
                                Apply to CIT</PrimaryButton>
                        </div>
                    </div>
                ) : (creditsByMonth[activeMonth] || []).length === 0 && (periodMode === 'monthly' || !Object.values(creditsByMonth).some(arr => arr.length > 0)) ? (
                    <div className="flex flex-col items-start gap-3">
                        <SectionHeading>WHT Credit Notes</SectionHeading>
                        <p className="text-2 text-neutral-500 font-medium">WHT deducted from payments received — used to offset your CIT liability.</p>
                        <button onClick={() => setShowForm(true)}
                            className="mt-2 flex items-center gap-1.5 text-2 font-semibold text-taxable-blue">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Add WHT Credit Note
                        </button>
                    </div>
                ) : (
                    <div>
                        <SectionHeading>WHT Credit Notes</SectionHeading>
                        <DescriptionText>WHT deducted from payments received — used to offset your CIT liability.</DescriptionText>

                        <div className="space-y-3 mb-12">
                            {credits.map(d => (
                                <PayeeCard key={d.id} d={d}
                                    onRemove={() => setPendingRemove({ monthKey: activeMonth, id: d.id })}
                                    onEdit={() => { setEditSourceMonth(activeMonth); setEditId(d.id); }}
                                />
                            ))}
                        </div>

                        <button onClick={() => setShowForm(true)}
                            className="flex items-center gap-1.5 text-2 font-semibold text-taxable-blue mb-7">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Add Another WHT Credit Note
                        </button>

                        <div className="mb-6 bg-neutral-50 border border-neutral-100 rounded-2xl p-5 inline-flex gap-8">
                            <div>
                                <p className="text-1 font-semibold text-neutral-500 mb-1">Total WHT Credit</p>
                                <p className="text-7 font-semibold text-taxable-blue tracking-[-0.02em]">₦{Math.round(total).toLocaleString()}</p>
                            </div>
                            <PrimaryButton className="self-center">
                                Apply to CIT</PrimaryButton>
                        </div>
                    </div>
                )}
            </div>

            {pendingRemove && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20" onClick={() => setPendingRemove(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-[400px] mx-4 w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                            </div>
                            <h3 className="text-6 font-semibold text-neutral-800 mb-2">Remove Credit Note?</h3>
                            <p className="text-2 text-neutral-500 font-medium mb-6">
                                Are you sure you want to remove <span className="font-semibold text-neutral-800">{pendingPayee || 'this credit note'}</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 w-full">
                                <SecondaryButton className="flex-1" onClick={() => setPendingRemove(null)}>Cancel</SecondaryButton>
                                <button onClick={handleConfirmRemove} className="flex-1 h-12 bg-red-600 text-white font-semibold rounded-xl text-3">
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Embeddable content component (no page shell) ──────────────────────────────
export function BusinessWHTContent({
    activeSubMenu,
}: {
    activeSubMenu?: 'remit-wht' | 'wht-balance';
}) {
    const [internalSubSection, setInternalSubSection] = useState<'remit-wht' | 'wht-balance'>('remit-wht');
    const subSection = activeSubMenu ?? internalSubSection;

    return (
        <div className="w-full">
            <div className="flex-1 min-w-0">
                {subSection === 'remit-wht' && <WHTRemittance />}
                {subSection === 'wht-balance' && <WHTCreditBalance />}
            </div>
        </div>
    );
}

export type { WHTDeduction };
