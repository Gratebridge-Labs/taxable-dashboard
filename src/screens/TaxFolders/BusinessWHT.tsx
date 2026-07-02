'use client';
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Drawer, DrawerContent, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { FileTextIcon, XIcon } from 'lucide-react';
import { InformationFill } from '@mingcute/react';
import { WHTDeduction, useWhtDeductions } from './useWhtDeductions';

// ── Hint Icon ──────────────────────────────────────────────────────────
const HintIcon = ({ tip }: { tip: string }) => (
    <span className="relative group inline-flex items-center ml-1 align-middle cursor-default">
        <InformationFill className="w-3.5 h-3.5" color="#E5E5E5" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-neutral-800 text-white text-1 leading-snug rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40 font-medium">
            {tip}
        </div>
    </span>
);
import {
    SectionHeading, DescriptionText, PrimaryButton, SecondaryButton, SecondaryButtonSm,
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
    payee: '', tin: '', whtType: '',
    gross: '', whtRate: '', whtDeducted: '', netPaid: '', date: '',
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

// ── WHT Form Content (read-only + editable) ────────────────────────────────────
function WHTFormContent({
    form, set, autoWHT, disabled, readOnlyStyle,
    fileAttachments, setFileAttachments,
}: {
    form: Omit<WHTDeduction, 'id'>;
    set: (k: keyof Omit<WHTDeduction, 'id'>) => (val: string) => void;
    autoWHT: number;
    disabled: boolean;
    readOnlyStyle: string;
    fileAttachments: { name: string }[];
    setFileAttachments: React.Dispatch<React.SetStateAction<{ name: string }[]>>;
}) {
    return (
        <>
            {/* Section 1: Vendor Information */}
            <div className="bg-neutral-50 rounded-3xl p-5">
                <h3 className="text-3 font-semibold text-neutral-800 mb-4">Vendor Information</h3>
                <div className="space-y-3">
                    <FormFieldRow className="justify-between">
                        <FormLabel tip="Full legal name or company name of the vendor.">Vendor Name</FormLabel>
                        <Input type="text" placeholder="e.g. ABC Consulting Ltd" value={form.payee} onChange={e => set('payee')(e.target.value)} disabled={disabled} className={`w-[150px] text-left ${readOnlyStyle}`} />
                    </FormFieldRow>
                    <FormFieldRow className="justify-between">
                        <FormLabel tip="10 to 14-digit FIRS Tax Identification Number.">Tax Identification Number (TIN)</FormLabel>
                        <Input type="text" placeholder="10 to 14-digit FIRS TIN" value={form.tin} onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ''); if (v.length <= 14) set('tin')(v); }} disabled={disabled} className={`w-[150px] text-left ${readOnlyStyle}`} />
                    </FormFieldRow>
                </div>
            </div>

            {/* Section 2: Transaction Details */}
            <div className="bg-neutral-50 rounded-3xl p-5">
                <h3 className="text-3 font-semibold text-neutral-800 mb-4">Transaction Details</h3>
                <div className="space-y-3">
                    <FormFieldRow className="justify-between">
                        <FormLabel tip="Category of payment — determines the applicable WHT rate.">Payment Category</FormLabel>
                        {disabled ? (
                            <div className={`w-[150px] h-10 flex items-center px-3 rounded-xl text-3 ${readOnlyStyle}`}>{form.whtType || '—'}</div>
                        ) : (
                            <SearchableSelect
                                options={['Consultancy/Professional Fees', 'Contracts/Supplies', 'Transport & Logistics', 'Rent', 'Director Fees']}
                                value={form.whtType}
                                onChange={(v) => set('whtType')(v)}
                                placeholder="Select transaction type..."
                                className="w-[150px]"
                            />
                        )}
                    </FormFieldRow>
                    <FormFieldRow className="justify-between">
                        <FormLabel tip="Total invoice amount before WHT deduction.">Gross Invoice Amount</FormLabel>
                        <Input type="text" placeholder="₦ 0.00" value={form.gross} onChange={e => { const raw = e.target.value.replace(/[^0-9.]/g, ''); const parts = raw.split('.'); const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); set('gross')(parts.length > 1 ? integer + '.' + parts.slice(1).join('') : integer); }} disabled={disabled} className={`w-[150px] text-left ${readOnlyStyle}`} />
                    </FormFieldRow>
                </div>
            </div>

            {/* Section 3: Automated Calculations */}
            <div className="bg-neutral-50 rounded-3xl p-5">
                <div className="space-y-3">
                    <FormFieldRow className="justify-between">
                        <FormLabel tip="Select the applicable WHT rate.">WHT Rate</FormLabel>
                        {disabled ? (
                            <span className={`text-3 ${readOnlyStyle}`}>{form.whtRate || '—'}</span>
                        ) : (
                            <div className="flex gap-2">
                                {['5%', '10%'].map(rate => (
                                    <button
                                        key={rate}
                                        type="button"
                                        onClick={() => set('whtRate')(rate)}
                                        className={`h-9 px-4 rounded-full text-2 font-semibold ${form.whtRate === rate ? 'bg-neutral-800 text-white' : 'bg-white border border-neutral-200 text-neutral-400'}`}
                                    >
                                        {rate}
                                    </button>
                                ))}
                            </div>
                        )}
                    </FormFieldRow>
                    <FormFieldRow className="justify-between">
                        <FormLabel tip="Auto-calculated: Gross Invoice Amount × WHT Rate.">Amount to Withhold</FormLabel>
                        <Input type="text" value={autoWHT > 0 ? `₦${Math.round(autoWHT).toLocaleString()}` : '₦ 0.00'} disabled className="w-[150px] text-left bg-neutral-50 text-neutral-400" />
                    </FormFieldRow>
                </div>
            </div>

            {/* Section 4: Invoice or Payment Receipt */}
            <div className="bg-neutral-50 rounded-3xl p-5">
                <h3 className="text-3 font-semibold text-neutral-800 mb-4">Invoice or Payment Receipt</h3>
                {disabled ? (
                    <p className={`text-3 font-medium ${readOnlyStyle}`}>{form.receipt || 'No receipt uploaded'}</p>
                ) : (
                    <>
                        <div className="bg-white flex items-center justify-between gap-4 p-3 border border-dashed border-neutral-200 rounded-xl">
                            <div className="flex items-center gap-2.5">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                <span className="text-1 text-neutral-400 font-medium">PDF, PNG, or JPG (Max 5MB)</span>
                            </div>
                            <label className="cursor-pointer text-2 font-semibold text-taxable-blue">
                                Upload
                                <input type="file" hidden accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => {
                                    const files = e.target.files;
                                    if (!files) return;
                                    setFileAttachments(prev => [...prev, ...Array.from(files).map(f => ({ name: f.name }))]);
                                    e.target.value = '';
                                }} />
                            </label>
                        </div>
                        {fileAttachments.length > 0 && (
                            <div className="mt-3">
                                <div className="flex flex-wrap gap-2">
                                    {fileAttachments.map((f, i) => (
                                        <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-neutral-100 rounded-lg">
                                            <FileTextIcon className="w-3.5 h-3.5 text-neutral-400" />
                                            <span className="text-1 text-neutral-600">{f.name}</span>
                                            <XIcon className="w-3 h-3 text-neutral-400 cursor-pointer" onClick={() => setFileAttachments(prev => prev.filter((_, j) => j !== i))} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

// ── WHT Remittance ─────────────────────────────────────────────────────────────
const WHTRemittance = () => {
    const {
        dataByMonth: deductionsByMonth, setDataByMonth,
        activeMonth, setActiveMonth,
        currentData: deductions,
        total, annualTotal: _annualTotal, hasData,
        pendingRemove, setPendingRemove,
        pendingPayee,
        saveItem, handleConfirmRemove,
    } = useWhtDeductions(STORAGE_KEY_WHT_DEDUCTIONS, STORAGE_KEY_WHT_MONTH);

    useEffect(() => {
        if (!localStorage.getItem('wht_v3_cleared')) {
            localStorage.removeItem('taxable_wht_deductions');
            localStorage.removeItem('taxable_wht_filed');
            localStorage.removeItem('taxable_wht_month');
            localStorage.removeItem('taxable_wht_credits');
            localStorage.setItem('wht_v3_cleared', 'true');
        }
    }, []);

    const [showFormSheet, setShowFormSheet] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [editSourceMonth, setEditSourceMonth] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [whtStep, setWhtStep] = useState<'method' | 'table'>(hasData ? 'table' : 'method');
    const [entryMethod, setEntryMethod] = useState<'manual' | 'csv' | 'software'>('manual');
    const [filedMonths, setFiledMonths] = useState<Set<number>>(() => {
        try {
            if (!localStorage.getItem('wht_v3_cleared')) localStorage.removeItem(STORAGE_KEY_WHT_FILED);
            const v = JSON.parse(localStorage.getItem(STORAGE_KEY_WHT_FILED)!);
            return v ? new Set(v) : new Set();
        } catch { return new Set(); }
    });
    const [showFilingModal, setShowFilingModal] = useState(false);
    const [form, setForm] = useState(defaultDeduction());
    const [fileAttachments, setFileAttachments] = useState<{ name: string }[]>([]);
    const set = (k: keyof typeof form) => (val: string) => setForm(f => ({ ...f, [k]: val }));

    const grossNum = Number(form.gross.replace(/,/g, '')) || 0;
    const autoRate = form.whtRate === '10%' ? 10 : form.whtRate === '5%' ? 5 : 0;
    const autoWHT = grossNum * autoRate / 100;
    const autoNet = grossNum - autoWHT;

    const dueDate = MONTHS[(activeMonth + 1) % 12].slice(0, 3) + ' 21, 2025';
    const canSave = form.payee.trim() && form.tin.trim() && form.whtType.trim() && form.gross.trim() && form.tin.length >= 10 && form.tin.length <= 14 && form.whtRate.trim() && fileAttachments.length > 0;

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_WHT_FILED, JSON.stringify(Array.from(filedMonths)));
    }, [filedMonths]);

    const handleSave = () => {
        const receipt = fileAttachments.map(f => f.name).join(', ');
        const d = { ...form, whtDeducted: String(Math.round(autoWHT)), netPaid: String(Math.round(autoNet)), whtRate: String(autoRate), receipt };
        saveItem(d, editId, editSourceMonth ?? undefined);
        setEditId(null);
        setEditSourceMonth(null);
        setForm(defaultDeduction());
        setFileAttachments([]);
        setShowFormSheet(false);
        setIsEditing(false);
        setShowRemoveConfirm(false);
        if (!editId) setWhtStep('table');
    };

    const handleCancel = () => {
        setForm(defaultDeduction());
        setFileAttachments([]);
        setShowFormSheet(false);
        setEditId(null);
        setEditSourceMonth(null);
        setIsEditing(false);
        setShowRemoveConfirm(false);
    };

    const handleRemoveFromDrawer = () => {
        if (editId !== null) {
            const monthKey = editSourceMonth ?? activeMonth;
            setDataByMonth(prev => ({
                ...prev,
                [monthKey]: (prev[monthKey] || []).filter(x => x.id !== editId),
            }));
        }
        setShowRemoveConfirm(false);
        setShowFormSheet(false);
        setEditId(null);
        setEditSourceMonth(null);
        setIsEditing(false);
        setForm(defaultDeduction());
        setFileAttachments([]);
    };

    const openAdd = () => { setForm(defaultDeduction()); setFileAttachments([]); setEditId(null); setEditSourceMonth(null); setIsEditing(false); setShowRemoveConfirm(false); setShowFormSheet(true); };
    const openEdit = (d: WHTDeduction) => {
        setForm({ payee: d.payee, tin: d.tin, whtType: d.whtType, gross: d.gross, whtRate: d.whtRate ? `${d.whtRate}%` : '', whtDeducted: d.whtDeducted, netPaid: d.netPaid, date: d.date, receipt: d.receipt ?? '' });
        setFileAttachments(d.receipt ? d.receipt.split(', ').map(name => ({ name })) : []);
        setEditId(d.id);
        setEditSourceMonth(activeMonth);
        setIsEditing(false);
        setShowRemoveConfirm(false);
        setShowFormSheet(true);
    };

    const handleFile = () => {
        setFiledMonths(prev => new Set([...prev, activeMonth]));
        setShowFilingModal(false);
        if (activeMonth < 11) setActiveMonth(m => m + 1);
    };

    const monthSelector = (
        <Select value={MONTHS[activeMonth]} onValueChange={(v) => { if (v) setActiveMonth(MONTHS.indexOf(v)); }}>
            <SelectTrigger className="w-fit min-w-[180px] h-10 rounded-xl bg-white border-neutral-50 text-3">
                <div className="flex items-center gap-2 mr-6">
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
    );

    return (
        <div className="w-full">

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
                    <DrawerTitle className="sr-only">{editId ? 'Deduction Details' : 'Add WHT Deduction'}</DrawerTitle>
                    <div className="max-w-[450px] mx-auto w-full pt-2 text-center">
                        <h2 className="text-5 font-semibold text-neutral-800 mb-8">
                            {editId ? (isEditing ? (form.payee || 'Edit Deduction') : 'Deduction Details') : 'Add WHT Deduction'}
                        </h2>
                    </div>
                    <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                        <div className="max-w-[450px] mx-auto w-full space-y-6">
                            <div className="relative overflow-hidden">
                                <div className={`transition-transform duration-300 ease-in-out ${isEditing ? '-translate-x-full' : 'translate-x-0'}`}>
                                    {editId !== null && (
                                        <div className="space-y-6">
                                            <WHTFormContent form={form} set={set} autoWHT={autoWHT} disabled={true} readOnlyStyle="bg-neutral-50 text-neutral-400" fileAttachments={fileAttachments} setFileAttachments={setFileAttachments} />
                                        </div>
                                    )}
                                </div>
                                <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${isEditing ? 'translate-x-0' : 'translate-x-full'}`}>
                                    {isEditing && (
                                        <div className="space-y-6">
                                            <WHTFormContent form={form} set={set} autoWHT={autoWHT} disabled={false} readOnlyStyle="" fileAttachments={fileAttachments} setFileAttachments={setFileAttachments} />
                                        </div>
                                    )}
                                </div>
                                {editId === null && (
                                    <div className="space-y-6">
                                        <WHTFormContent form={form} set={set} autoWHT={autoWHT} disabled={false} readOnlyStyle="" fileAttachments={fileAttachments} setFileAttachments={setFileAttachments} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="max-w-[450px] mx-auto w-full pt-4 border-t border-neutral-100 mt-2">
                        <div className="flex gap-3">
                            {editId !== null && !isEditing ? (
                                <>
                                    <button onClick={() => setShowRemoveConfirm(true)} className="flex-1 h-12 border border-red-200 bg-red-50 text-red-600 font-semibold rounded-xl text-3">
                                        Remove Deduction
                                    </button>
                                    <PrimaryButton className="flex-1" onClick={() => setIsEditing(true)}>
                                        Edit Details
                                    </PrimaryButton>
                                </>
                            ) : editId !== null && isEditing ? (
                                <>
                                    <SecondaryButton className="flex-1" onClick={() => {
                                        const d = deductions.find(x => x.id === editId);
                                        if (d) {
                                            setForm({ payee: d.payee, tin: d.tin, whtType: d.whtType, gross: d.gross, whtRate: d.whtRate ? `${d.whtRate}%` : '', whtDeducted: d.whtDeducted, netPaid: d.netPaid, date: d.date, receipt: d.receipt ?? '' });
                                            setFileAttachments(d.receipt ? d.receipt.split(', ').map(name => ({ name })) : []);
                                        }
                                        setIsEditing(false);
                                    }}>Cancel</SecondaryButton>
                                    <PrimaryButton className="flex-1" onClick={handleSave} disabled={!canSave}>Save</PrimaryButton>
                                </>
                            ) : (
                                <>
                                    <DrawerClose asChild>
                                        <SecondaryButton className="flex-1">Cancel</SecondaryButton>
                                    </DrawerClose>
                                    <PrimaryButton className="flex-1" onClick={handleSave} disabled={!canSave}>Save WHT Deduction</PrimaryButton>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Remove confirmation modal inside drawer */}
                    {showRemoveConfirm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20" onClick={() => setShowRemoveConfirm(false)}>
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
                                        Are you sure you want to remove <span className="font-semibold text-neutral-800">{form.payee || 'this deduction'}</span>? This action cannot be undone.
                                    </p>
                                    <div className="flex gap-3 w-full">
                                        <SecondaryButton className="flex-1" onClick={() => setShowRemoveConfirm(false)}>Cancel</SecondaryButton>
                                        <button onClick={handleRemoveFromDrawer} className="flex-1 h-12 bg-red-600 text-white font-semibold rounded-xl text-3">
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DrawerContent>
            </Drawer>

            <div className="w-full">
                {whtStep === 'method' ? (
                    <div className="max-w-[480px] mx-auto" data-animate>
                        <h2 className="text-6 font-semibold text-neutral-800 tracking-[-0.02em] mb-1">How do you want to enter your WHT data?</h2>
                        <p className="text-2 text-neutral-500 font-medium mb-6">Choose how you'd like to enter your WHT deductions.</p>
                        <RadioGroup value={entryMethod} onValueChange={(v) => setEntryMethod(v as 'manual' | 'csv' | 'software')} className="space-y-0 mb-6">
                            {[
                                { id: 'manual' as const, label: 'Manual entry' },
                                { id: 'csv' as const, label: 'Upload sales & purchase ledgers (CSV/Excel)' },
                                { id: 'software' as const, label: 'Connect accounting software (QuickBooks, Xero, Zoho)' },
                            ].map(opt => {
                                const disabled = opt.id !== 'manual';
                                return (
                                    <label key={opt.id} className={`flex items-center gap-3 py-3.5 cursor-pointer ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
                                        <RadioGroupItem value={opt.id} disabled={disabled} />
                                        <span className="text-3 font-medium text-neutral-800">{opt.label}</span>
                                    </label>
                                );
                            })}
                        </RadioGroup>
                        <div className="mb-6">
                            <label className="block text-2 font-medium text-neutral-500 mb-2">Select starting month <HintIcon tip="The first month you'll file WHT for." /></label>
                            <Select value={MONTHS[activeMonth]} onValueChange={(v) => { if (v) setActiveMonth(MONTHS.indexOf(v)); }}>
                                <SelectTrigger className="w-full max-w-[300px] h-10 rounded-xl bg-white border-neutral-50 text-3">
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
                        </div>
                        <PrimaryButton onClick={() => openAdd()}>
                            Continue
                        </PrimaryButton>
                    </div>
                ) : deductions.length === 0 ? (
                    <div>
                        <div className="flex items-center gap-4 mb-14">
                            <h2 className="text-5 font-semibold text-neutral-800 tracking-[-0.02em]">Remit {MONTHS[activeMonth]} Withholding Tax</h2>
                            {monthSelector}
                        </div>
                        <div className="max-w-[480px] mx-auto" data-animate>
                            <p className="text-3 font-semibold text-neutral-800 mb-3">How do you want to add Withholding Tax data?</p>
                            <RadioGroup value={entryMethod} onValueChange={(v) => setEntryMethod(v as 'manual' | 'csv' | 'software')} className="space-y-0 mb-6">
                                {[
                                    { id: 'manual' as const, label: 'Manual entry' },
                                    { id: 'csv' as const, label: 'Upload sales & purchase ledgers (CSV/Excel)' },
                                    { id: 'software' as const, label: 'Connect accounting software (QuickBooks, Xero, Zoho)' },
                                ].map(opt => {
                                    const disabled = opt.id !== 'manual';
                                    return (
                                        <label key={opt.id} className={`flex items-center gap-3 py-3.5 cursor-pointer ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
                                            <RadioGroupItem value={opt.id} disabled={disabled} />
                                            <span className="text-3 font-medium text-neutral-800">{opt.label}</span>
                                        </label>
                                    );
                                })}
                            </RadioGroup>
                            <PrimaryButton onClick={() => openAdd()}>Continue</PrimaryButton>
                        </div>
                    </div>
                ) : (
                    <div data-animate>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <h2 className="text-5 font-semibold text-neutral-800 tracking-[-0.02em]">Remit {MONTHS[activeMonth]} Withholding Tax</h2>
                                {monthSelector}
                            </div>
                            <SecondaryButtonSm onClick={openAdd}>Add WHT Deduction</SecondaryButtonSm>
                        </div>

                        <div className="bg-white border border-neutral-50 rounded-2xl overflow-hidden mb-12">
                            <Table className="text-2 [&_tr]:border-neutral-50">
                                <TableHeader>
                                    <TableRow className="bg-neutral-50">
                                        {['Vendor name', 'Tax ID', 'Payment category', 'Gross Invoice amount', 'WHT rate', 'Amount to withhold', 'Receipt'].map(h => (
                                            <TableHead key={h} className="px-6 py-4 font-medium text-neutral-400">{h}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {deductions.map(d => {
                                        const gross = Number((d.gross || '').replace(/,/g, '')) || 0;
                                        const wht = Number(d.whtDeducted) || 0;
                                        return (
                                            <TableRow key={d.id} className="cursor-pointer" onClick={() => openEdit(d)}>
                                                <TableCell className="px-6 py-4 font-medium text-neutral-600">{d.payee || 'N/A'}</TableCell>
                                                <TableCell className="px-6 py-4 font-medium text-neutral-600">{d.tin || 'N/A'}</TableCell>
                                                <TableCell className="px-6 py-4 font-medium text-neutral-600">{d.whtType || 'N/A'}</TableCell>
                                                <TableCell className="px-6 py-4 font-medium text-neutral-600">{gross > 0 ? fmt(gross) : '—'}</TableCell>
                                                <TableCell className="px-6 py-4 font-medium text-neutral-600">{d.whtRate ? `${d.whtRate}%` : '—'}</TableCell>
                                                <TableCell className="px-6 py-4 font-medium text-neutral-600">{wht > 0 ? fmt(wht) : '—'}</TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <span className="max-w-[120px] truncate block text-neutral-600" title={d.receipt}>{d.receipt || '—'}</span>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex items-end justify-between mb-6">
                            <div className="flex flex-col gap-3">
                                <div>
                                    <p className="text-2 font-medium text-neutral-500 mb-1">Total Withholding Tax to remit</p>
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
    const [internalSubSection, _setInternalSubSection] = useState<'remit-wht' | 'wht-balance'>('remit-wht');
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
