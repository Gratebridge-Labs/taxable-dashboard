'use client';
import React, { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddEmployeeDrawer, PayeStaff } from '@/screens/TaxFolders/AddEmployeeDrawer';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

// ── PAYE Calculation (2026 Nigeria Tax Act) ─────────────────────────
const PAYE_BANDS = [
    { limit: 800000, rate: 0 },
    { limit: 2200000, rate: 0.15 },
    { limit: 9000000, rate: 0.18 },
    { limit: 13000000, rate: 0.21 },
    { limit: 25000000, rate: 0.23 },
    { limit: Infinity, rate: 0.25 },
];

export function calculateAnnualPAYE(st: PayeStaff) {
    const annualGross = st.gross * 12;
    const pension = st.pensionOn ? Math.round(annualGross * 0.08) : 0;
    const nhf = st.nhfOn ? Math.round(annualGross * 0.025) : 0;
    const hmo = st.hmoOn ? Math.round(annualGross * 0.05) : 0;
    const rentRelief = st.annualRentChecked ? Math.min((Number(st.annualRent.replace(/,/g, '')) || 0) * 0.20, 500000) : 0;
    const taxableIncome = Math.max(0, annualGross - pension - nhf - hmo - rentRelief);

    let remaining = taxableIncome;
    let annualTax = 0;
    for (const band of PAYE_BANDS) {
        const chunk = Math.min(remaining, band.limit);
        annualTax += chunk * band.rate;
        remaining -= chunk;
        if (remaining <= 0) break;
    }

    return { annualTax: Math.round(annualTax), monthlyTax: Math.round(annualTax / 12), taxableIncome: Math.round(taxableIncome) };
}

interface MonthlyFilingProps {
    activeMonth: string;
    activeStep: 'method' | 'table';
    isFiled: boolean;
    totalPAYE: number;
    staff: PayeStaff[];
    sourceMonth: string | null;
    filedMonths: Set<string>;
    payeStaffByMonth: Record<string, PayeStaff[]>;
    onMonthChange: (month: string) => void;
    onAddStaff: (staff: PayeStaff) => void;
    onRemoveStaff: (staff: PayeStaff) => void;
    onSaveStaff: (oldStaff: PayeStaff, newStaff: PayeStaff) => void;
    onCopyStaff: (sourceMonth: string) => void;
    onFile?: () => void;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function PayeMonthlyFiling({
    activeMonth, activeStep, isFiled, totalPAYE, staff, sourceMonth,
    filedMonths, payeStaffByMonth, onMonthChange,
    onAddStaff, onRemoveStaff, onSaveStaff, onCopyStaff, onFile,
}: MonthlyFilingProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<PayeStaff | null>(null);
    const [skipCopyConfirmation, setSkipCopyConfirmation] = useState(false);
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [pendingCopy, setPendingCopy] = useState<{ sourceMonth: string } | null>(null);
    const [onboardingMonth, setOnboardingMonth] = useState(activeMonth);
    const fmt = (n: number) => `₦${n.toLocaleString()}`;

    const openAddDrawer = () => {
        setEditingStaff(null);
        setDrawerOpen(true);
    };

    const openViewDrawer = (st: PayeStaff) => {
        setEditingStaff(st);
        setDrawerOpen(true);
    };

    const handleCopyClick = (source: string) => {
        if (skipCopyConfirmation) {
            performCopy(source);
        } else {
            setPendingCopy({ sourceMonth: source });
            setShowCopyModal(true);
        }
    };

    const performCopy = (source: string) => {
        onCopyStaff(source);
    };

    const handleOnboardingContinue = () => {
        onMonthChange(onboardingMonth);
        openAddDrawer();
    };

    const hasAnyData = Object.values(payeStaffByMonth).some(arr => arr.length > 0);
    const isFirstTime = !hasAnyData;

    const monthSelector = (
        <div data-animate>
        <Select value={activeMonth} onValueChange={(v) => v && onMonthChange(v)}>
            <SelectTrigger className="w-fit min-w-[180px] h-10 rounded-xl bg-white border-neutral-50 text-3">
                <div className="flex items-center gap-2 mr-6">
                    <span>{activeMonth}</span>
                    {isFiled && <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-200 text-2 font-semibold px-2 py-0 h-5">Filed</Badge>}
                    {!isFiled && staff.length > 0 && <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-amber-200 text-2 font-semibold px-2 py-0 h-5">Draft</Badge>}
                </div>
            </SelectTrigger>
            <SelectContent>
                {MONTHS.map(m => {
                    const monthFiled = filedMonths.has(m);
                    const monthHasData = (payeStaffByMonth[m] || []).length > 0;
                    return (
                        <SelectItem key={m} value={m}>
                            <div className="flex items-center gap-2">
                                <span>{m}</span>
                                {monthFiled &&
                                    <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-200 text-2 font-semibold px-2 py-0 h-5">Filed</Badge>
                                }
                                {!monthFiled && monthHasData &&
                                    <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-amber-200 text-2 font-semibold px-2 py-0 h-5">Draft</Badge>
                                }
                            </div>
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
        </div>
    );

    const entryOptions = (
        <div data-animate className="max-w-[480px] mx-auto">
            <h2 className="text-6 font-bold text-neutral-800 mb-1">How do you want to add payroll data?</h2>
            <p className="text-3 text-neutral-500 font-medium mb-6">Upload or enter your payroll for this month</p>

            {isFirstTime ? (
                <>
                    <RadioGroup value="manual" className="space-y-0 mb-8">
                        <label className="flex items-center gap-3 py-3.5 cursor-pointer">
                            <RadioGroupItem value="manual" />
                            <span className="text-3 font-medium text-neutral-800">Manual entry (add staff one by one)</span>
                        </label>
                        <label className="flex items-center gap-3 py-3.5 cursor-not-allowed opacity-40">
                            <RadioGroupItem value="csv" disabled />
                            <span className="text-3 font-medium text-neutral-800">Upload CSV/Excel (bulk upload)</span>
                        </label>
                        <label className="flex items-center gap-3 py-3.5 cursor-not-allowed opacity-40">
                            <RadioGroupItem value="software" disabled />
                            <span className="text-3 font-medium text-neutral-800">Connect payroll software (QuickBooks, Zoho)</span>
                        </label>
                    </RadioGroup>

                    <div className="mb-8">
                        <label className="block text-2 font-medium text-neutral-700 mb-2">Select starting month</label>
                        <Select value={onboardingMonth} onValueChange={(v) => v && setOnboardingMonth(v)}>
                            <SelectTrigger className="w-[300px] h-10 rounded-xl bg-white text-3">
                                <SelectValue placeholder="Choose a month" />
                            </SelectTrigger>
                            <SelectContent>
                                {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <button
                        onClick={handleOnboardingContinue}
                        className="h-12 px-8 bg-taxable-blue text-white font-semibold rounded-xl text-3"
                    >
                        Continue
                    </button>
                </>
            ) : (
                <>
                    <RadioGroup value={sourceMonth ? 'copy' : 'manual'} className="space-y-0 mb-8">
                        {sourceMonth && (
                            <label className="flex items-center gap-3 py-3.5 cursor-pointer" onClick={() => handleCopyClick(sourceMonth)}>
                                <RadioGroupItem value="copy" />
                                <span className="text-3 font-medium text-neutral-800">Copy from {sourceMonth} 2026</span>
                            </label>
                        )}
                        <label className="flex items-center gap-3 py-3.5 cursor-pointer">
                            <RadioGroupItem value="manual" />
                            <span className="text-3 font-medium text-neutral-800">Manual entry (add staff one by one)</span>
                        </label>
                        <label className="flex items-center gap-3 py-3.5 cursor-not-allowed opacity-40">
                            <RadioGroupItem value="csv" disabled />
                            <span className="text-3 font-medium text-neutral-800">Upload CSV/Excel (bulk upload)</span>
                        </label>
                        <label className="flex items-center gap-3 py-3.5 cursor-not-allowed opacity-40">
                            <RadioGroupItem value="software" disabled />
                            <span className="text-3 font-medium text-neutral-800">Connect payroll software (QuickBooks, Zoho)</span>
                        </label>
                    </RadioGroup>

                    {sourceMonth ? (
                        <button
                            onClick={() => handleCopyClick(sourceMonth)}
                            className="h-12 px-8 bg-taxable-blue text-white font-semibold rounded-xl text-3"
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            onClick={() => openAddDrawer()}
                            className="h-12 px-8 bg-taxable-blue text-white font-semibold rounded-xl text-3"
                        >
                            Continue
                        </button>
                    )}
                </>
            )}
        </div>
    );

    const tableContent = (
        <div data-animate className="w-full">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                    <h2 className="text-6 font-semibold text-neutral-800 tracking-[-0.02em]">Employee Payroll</h2>
                    {monthSelector}
                </div>
                <button
                    onClick={() => openAddDrawer()}
                    className="h-12 px-4 bg-white border border-neutral-100 text-neutral-800 font-semibold rounded-xl text-3"
                >
                    Add employee
                </button>
            </div>
            <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden mb-8">
                <Table className="text-2 [&_tr]:border-neutral-50">
                    <TableHeader>
                        <TableRow className="bg-neutral-50 hover:bg-neutral-50">
                            {['Full Name', 'Gross Income', 'HMO', 'Pension', 'NHF', 'Taxable Income', 'JRB Tax ID', 'Job Position', 'Email Address', 'Phone Number'].map(h => (
                                <TableHead key={h} className="px-6 py-4 font-medium text-neutral-500">{h}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {staff.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className="px-6 py-8 text-center text-3 text-neutral-400 font-medium">
                                    No employees yet. Add employee to see payroll calculations.
                                </TableCell>
                            </TableRow>
                        ) : (
                            staff.map((st, i) => {
                                const pension = st.pensionOn ? Math.round(st.gross * 0.08) : 0;
                                const nhf = st.nhfOn ? Math.round(st.gross * 0.025) : 0;
                                const hmo = st.hmoOn ? Math.round(st.gross * 0.025) : 0;
                                const taxableIncome = Math.max(0, st.gross - pension - nhf - hmo);
                                return (
                                    <TableRow key={i} className="cursor-pointer" onClick={() => openViewDrawer(st)}>
                                        <TableCell className="px-6 py-4 font-medium text-neutral-600">{st.firstName} {st.lastName}</TableCell>
                                        <TableCell className="px-6 py-4 font-medium text-neutral-600">{fmt(st.gross)}</TableCell>
                                        <TableCell className="px-6 py-4 font-medium text-neutral-600">{fmt(hmo)}</TableCell>
                                        <TableCell className="px-6 py-4 font-medium text-neutral-600">{fmt(pension)}</TableCell>
                                        <TableCell className="px-6 py-4 font-medium text-neutral-600">{fmt(nhf)}</TableCell>
                                        <TableCell className="px-6 py-4 font-semibold text-neutral-800">{fmt(taxableIncome)}</TableCell>
                                        <TableCell className="px-6 py-4 font-medium text-neutral-600">{st.taxId}</TableCell>
                                        <TableCell className="px-6 py-4 font-medium text-neutral-600">{st.position}</TableCell>
                                        <TableCell className="px-6 py-4 font-medium text-neutral-600">{st.email}</TableCell>
                                        <TableCell className="px-6 py-4 font-medium text-neutral-600">{st.phone}</TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <p className="text-2 font-semibold text-neutral-500 mb-0.5">Total PAYE due this month</p>
                    <p className="text-7 font-bold text-neutral-800">{fmt(totalPAYE)}</p>
                </div>
                <button
                    onClick={onFile}
                    className="h-12 px-6 bg-taxable-blue text-white font-semibold rounded-xl text-3 disabled:bg-neutral-100 disabled:text-neutral-400"
                >
                    {isFiled ? 'File & Pay' : `File ${activeMonth.slice(0, 3)} PAYE`}
                </button>
            </div>
        </div>
    );

    if (activeStep === 'method') {
        return (
            <>
                {!isFirstTime && <div className="mb-6 flex items-center gap-4">
                    <h2 className="text-6 font-semibold text-neutral-800 tracking-[-0.02em]">Employee Payroll</h2>
                    {monthSelector}
                </div>}
                {entryOptions}
                <AddEmployeeDrawer
                    open={drawerOpen}
                    onClose={() => { setDrawerOpen(false); setEditingStaff(null); }}
                    onAdd={(newStaff) => onAddStaff(newStaff)}
                    editStaff={editingStaff}
                    onRemove={onRemoveStaff}
                    onSave={(updated) => {
                        if (editingStaff) onSaveStaff(editingStaff, updated);
                    }}
                />
                {showCopyModal && pendingCopy && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20" onClick={() => setShowCopyModal(false)}>
                        <div className="bg-white rounded-2xl p-6 max-w-[400px] mx-4 w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-col items-center text-center">
                                <h3 className="text-6 font-semibold text-neutral-800 mb-2">Copy payroll data?</h3>
                                <p className="text-3 text-neutral-500 font-medium mb-4">
                                    This will copy all employees from {pendingCopy.sourceMonth} 2026 to {activeMonth} 2026. You can edit them independently.
                                </p>
                                <label className="flex items-center gap-2 mb-6 cursor-pointer">
                                    <Checkbox checked={skipCopyConfirmation} onCheckedChange={() => setSkipCopyConfirmation(p => !p)} />
                                    <span className="text-3 font-medium text-neutral-700">Don't show this again</span>
                                </label>
                                <div className="flex gap-3 w-full">
                                    <button onClick={() => setShowCopyModal(false)} className="flex-1 h-12 border border-neutral-200 bg-white text-neutral-800 font-semibold rounded-xl text-3">Cancel</button>
                                    <button onClick={() => { performCopy(pendingCopy.sourceMonth); setShowCopyModal(false); }} className="flex-1 h-12 bg-taxable-blue text-white font-semibold rounded-xl text-3">Copy</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <>
            {tableContent}
            <AddEmployeeDrawer
                open={drawerOpen}
                onClose={() => { setDrawerOpen(false); setEditingStaff(null); }}
                onAdd={(newStaff) => onAddStaff(newStaff)}
                editStaff={editingStaff}
                onRemove={onRemoveStaff}
                onSave={(updated) => { if (editingStaff) onSaveStaff(editingStaff, updated); }}
            />
        </>
    );
}

interface AnnualReturnsProps {
    staffCount: number;
    totalAnnualPAYE: number;
    totalGrossPayroll: number;
    filedMonthsCount: number;
    hasDiscrepancies?: boolean;
}

export function PayeAnnualReturns({
    staffCount, totalAnnualPAYE, totalGrossPayroll, filedMonthsCount = 0, hasDiscrepancies = false,
}: AnnualReturnsProps) {
    const fmtN = (n: number) => `₦${n.toLocaleString()}`;
    return (
        <div className="max-w-[680px] mx-auto">
            <h2 className="text-6 font-bold text-neutral-800 mb-1">PAYE · Annual Returns (2026)</h2>
            <p className="text-3 text-neutral-500 font-medium mb-6">Your annual PAYE reconciliation is ready</p>
            <div className="space-y-3 mb-7">
                {[`${staffCount} employees`, `${filedMonthsCount} months of payroll data`, `Total PAYE remitted: ${fmtN(totalAnnualPAYE)}`, `Total Gross Payroll: ${fmtN(totalGrossPayroll)}`, hasDiscrepancies ? 'Discrepancies found' : 'No discrepancies'].map((line, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <span className="text-3 font-semibold text-neutral-800">{line}</span>
                    </div>
                ))}
            </div>
            <div className="flex gap-3 mb-8">
                <button className="flex-1 h-12 border border-neutral-300 text-neutral-800 font-semibold rounded-xl text-3">Download Return</button>
                <button className="flex-1 h-12 bg-taxable-blue text-white font-semibold rounded-xl text-3">Submit to LIRS</button>
            </div>
        </div>
    );
}
