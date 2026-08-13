'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Home2Fill } from '@mingcute/react';
import { toast } from 'sonner';
import { FormFieldRow, FormLabel, PrimaryButton } from '@/screens/TaxFolders/TaxFolderShared';
import { PayeFilingSheet } from '@/screens/TaxFolders/PayeFilingSheet';

// 2026 Nigeria Tax Act PAYE bands
const PAYE_BANDS = [
    { limit: 800_000, rate: 0.00 },
    { limit: 3_000_000, rate: 0.15 },
    { limit: 12_000_000, rate: 0.18 },
    { limit: 25_000_000, rate: 0.21 },
    { limit: 50_000_000, rate: 0.23 },
    { limit: Infinity, rate: 0.25 },
];

function calcPAYE(annualTaxable: number): {
    total: number;
    breakdown: { label: string; amount: number; rate: number }[];
} {
    let remaining = Math.max(0, annualTaxable);
    let total = 0;
    const breakdown: { label: string; amount: number; rate: number }[] = [];
    let prevLimit = 0;

    for (const band of PAYE_BANDS) {
        if (remaining <= 0) break;
        const slice = Math.min(remaining, band.limit - prevLimit);
        const tax = slice * band.rate;
        total += tax;

        // Show each band as a MONTHLY range (whole panel is monthly).
        const monthlyWidth = (band.limit - prevLimit) / 12;
        const label = prevLimit === 0
            ? `First ₦${fmtShort(monthlyWidth)}: ${(band.rate * 100).toFixed(0)}%`
            : Number.isFinite(band.limit)
                ? `Next ₦${fmtShort(monthlyWidth)}: ${(band.rate * 100).toFixed(0)}%`
                : `Remainder: ${(band.rate * 100).toFixed(0)}%`;

        breakdown.push({ label, amount: Math.round(tax / 12), rate: band.rate });
        remaining -= slice;
        prevLimit = band.limit;
    }

    return { total: Math.round(total / 12), breakdown };
}

function fmtShort(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.0', '')}M`;
    if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
    return n.toLocaleString();
}

function fmtN(n: number): string {
    if (!n && n !== 0) return '₦0';
    return `₦${Math.round(n).toLocaleString()}`;
}

const fmtInput = (set: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    const parts = raw.split('.');
    const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    set(parts.length > 1 ? integer + '.' + parts.slice(1).join('') : integer);
};

// ── Deduction row (PIT-style card row) ────────────────────────────────────────
const DeductionRow = ({
    label,
    hint,
    checked,
    onToggle,
    amount,
    onChange,
    autoCalc,
}: {
    label: string;
    hint: string;
    checked: boolean;
    onToggle: () => void;
    amount: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    autoCalc?: boolean;
}) => (
    <FormFieldRow className="justify-between">
        <div className="flex items-center gap-3">
            <Checkbox checked={checked} onCheckedChange={() => onToggle()} />
            <FormLabel tip={hint}>{label}</FormLabel>
        </div>
        <Input
            type="text"
            placeholder="₦ 0.00"
            value={checked ? amount : ''}
            disabled={!checked || autoCalc}
            onChange={onChange}
            className="w-[150px] text-left"
        />
    </FormFieldRow>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function PAYECalculator() {
    const router = useRouter();

    // Salary inputs
    const [grossSalary, setGrossSalary] = useState('');
    const [bonuses, setBonuses] = useState('');

    // Deductions
    const [pensionOn, setPensionOn] = useState(true);
    const [nhfOn, setNhfOn] = useState(false);
    const [hmoOn, setHmoOn] = useState(true);
    const [annualRentOn, setAnnualRentOn] = useState(false);
    const [annualRentAmt, setAnnualRentAmt] = useState('');

    const [showBreakdown, setShowBreakdown] = useState(false);
    const [showPayeFiling, setShowPayeFiling] = useState(false);

    // Derived numbers
    const gross = parseFloat(grossSalary.replace(/,/g, '')) || 0;
    const bonus = parseFloat(bonuses.replace(/,/g, '')) || 0;
    const monthlyGross = gross + bonus;
    const pensionAmt = pensionOn ? Math.round(monthlyGross * 0.08) : 0;
    const nhfAmt = nhfOn ? Math.round(monthlyGross * 0.025) : 0;
    const hmoAmt = hmoOn ? Math.round(monthlyGross * 0.05) : 0;
    const rentReliefMonthly = annualRentOn
        ? Math.round((Math.min((parseFloat(annualRentAmt.replace(/,/g, '')) || 0) * 0.20, 500000)) / 12)
        : 0;

    const totalMonthlyDeductions = pensionAmt + nhfAmt + hmoAmt + rentReliefMonthly;
    const monthlyTaxable = Math.max(0, monthlyGross - totalMonthlyDeductions);
    const annualTaxable = monthlyTaxable * 12;

    const { total: monthlyPAYE, breakdown: taxBreakdown } = useMemo(
        () => calcPAYE(annualTaxable),
        [annualTaxable]
    );

    const hasData = gross > 0;

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Breadcrumb nav bar */}
            <div className="w-full bg-white border-b border-neutral-100 py-3">
                <div className="max-w-[1280px] mx-auto px-6 md:px-12 w-full flex flex-col gap-1">
                    <button onClick={() => router.push('/home')} className="flex items-center gap-2 text-3 font-semibold text-neutral-800 w-fit shrink-0">
                        <Home2Fill className="w-5 h-5" color="#E5E5E5" />
                        Home
                    </button>
                    <div className="flex items-center gap-2 text-1 text-neutral-300 font-medium">
                        <span>Monthly PAYE</span>
                        <span>/</span>
                        <span className="text-neutral-300">Calculate and File Monthly PAYE</span>
                    </div>
                </div>
            </div>

            <main className="max-w-[500px] mx-auto px-6 md:px-12 pt-10 pb-8">
                {/* Title */}
                <div className="mb-6">
                    <h1 className="text-5 font-medium text-neutral-800 mb-1 tracking-[-0.02em] font-[family-name:var(--font-merriweather)]">PAYE Calculator</h1>
                    <p className="text-1 text-neutral-400 font-medium">
                        Estimate how much income tax your employer should deduct from your salary each month.
                    </p>
                </div>

                {/* Salary card */}
                <div className="bg-neutral-50 rounded-3xl p-5 mb-6">
                    <h3 className="text-3 font-semibold text-neutral-800 mb-4">Your Salary</h3>
                    <div className="space-y-3">
                        <FormFieldRow className="justify-between">
                            <FormLabel tip="Your monthly gross salary before any deductions. Don't include bonuses unless they're paid monthly.">Gross Salary</FormLabel>
                            <Input type="text" placeholder="₦ 0.00" value={grossSalary} onChange={fmtInput(setGrossSalary)} className="w-[180px] text-left" />
                        </FormFieldRow>
                        <FormFieldRow className="justify-between">
                            <FormLabel tip="Only include bonuses that are paid every month, like housing or transport allowances.">Bonuses / Allowances</FormLabel>
                            <Input type="text" placeholder="₦ 0.00" value={bonuses} onChange={fmtInput(setBonuses)} className="w-[180px] text-left" />
                        </FormFieldRow>
                    </div>
                </div>

                {/* Deductions card */}
                <div className="bg-neutral-50 rounded-3xl p-5 mb-6">
                    <h3 className="text-3 font-semibold text-neutral-800 mb-4">Deductions [This month]</h3>
                    <div className="space-y-3">
                        <DeductionRow
                            label="Pension (8%)"
                            hint="Mandatory pension contribution — 8% of gross salary, deducted before tax."
                            checked={pensionOn}
                            onToggle={() => setPensionOn(p => !p)}
                            amount={grossSalary ? pensionAmt.toLocaleString() : ''}
                            onChange={() => { }}
                            autoCalc
                        />
                        <DeductionRow
                            label="NHF (2.5%)"
                            hint="National Housing Funds contribution — 2.5% of basic salary."
                            checked={nhfOn}
                            onToggle={() => setNhfOn(p => !p)}
                            amount={grossSalary ? nhfAmt.toLocaleString() : ''}
                            onChange={() => { }}
                            autoCalc
                        />
                        <DeductionRow
                            label="HMO (5%)"
                            hint="Health Maintenance Organisation contribution — 5% of gross salary."
                            checked={hmoOn}
                            onToggle={() => setHmoOn(p => !p)}
                            amount={grossSalary ? hmoAmt.toLocaleString() : ''}
                            onChange={() => { }}
                            autoCalc
                        />
                        <DeductionRow
                            label="Annual Rent"
                            hint="Under 2026 reforms, 20% of annual rent (up to ₦500k relief) is deductible."
                            checked={annualRentOn}
                            onToggle={() => setAnnualRentOn(p => !p)}
                            amount={annualRentAmt}
                            onChange={fmtInput(setAnnualRentAmt)}
                        />
                    </div>
                </div>

                {/* Result card */}
                <div className="bg-neutral-50 rounded-3xl p-5 mb-6">
                    <p className="text-2 font-semibold text-neutral-500 mb-1">Your monthly PAYE</p>
                    <p className={`text-7 font-semibold leading-none mb-1 ${hasData ? 'text-neutral-800' : 'text-neutral-300'}`}>
                        {hasData ? fmtN(monthlyPAYE) : '₦0'}
                    </p>
                </div>

                {/* Breakdown toggle */}
                {hasData && (
                    <div className="mb-6">
                        <button
                            onClick={() => setShowBreakdown(s => !s)}
                            className="flex items-center gap-1.5 text-2 font-semibold text-taxable-blue"
                        >
                            {showBreakdown ? 'Hide' : 'Show'} calculation breakdown
                            <svg
                                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                                className={`transition-transform duration-200 ${showBreakdown ? 'rotate-180' : ''}`}
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>

                        {showBreakdown && (
                            <div className="mt-4 bg-white border border-neutral-100 rounded-2xl overflow-hidden text-2 font-medium animate-in fade-in slide-in-from-top-2 duration-200">
                                {/* Income rows */}
                                <div className="space-y-0">
                                    <div className="flex justify-between items-center px-5 py-3">
                                        <span className="text-neutral-500">Gross Salary</span>
                                        <span className="font-semibold text-neutral-800">{fmtN(monthlyGross)}</span>
                                    </div>
                                    {pensionOn && (
                                        <div className="flex justify-between items-center px-5 py-3">
                                            <span className="text-neutral-500">Pension (8%)</span>
                                            <span className="font-semibold text-destructive">-{fmtN(pensionAmt)}</span>
                                        </div>
                                    )}
                                    {nhfOn && (
                                        <div className="flex justify-between items-center px-5 py-3">
                                            <span className="text-neutral-500">NHF (2.5%)</span>
                                            <span className="font-semibold text-destructive">-{fmtN(nhfAmt)}</span>
                                        </div>
                                    )}
                                    {hmoOn && (
                                        <div className="flex justify-between items-center px-5 py-3">
                                            <span className="text-neutral-500">HMO (5%)</span>
                                            <span className="font-semibold text-destructive">-{fmtN(hmoAmt)}</span>
                                        </div>
                                    )}
                                    {annualRentOn && rentReliefMonthly > 0 && (
                                        <div className="flex justify-between items-center px-5 py-3">
                                            <span className="text-neutral-500">Rent Relief</span>
                                            <span className="font-semibold text-destructive">-{fmtN(rentReliefMonthly)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Taxable income */}
                                <div className="flex justify-between items-center px-5 py-3 bg-neutral-50 border-t border-neutral-100">
                                    <span className="font-semibold text-neutral-800">Taxable Income</span>
                                    <span className="font-semibold text-neutral-800">{fmtN(monthlyTaxable)}</span>
                                </div>

                                {/* Tax bands */}
                                <div className="px-5 pt-4 pb-2">
                                    <p className="text-1 font-semibold text-neutral-800 mb-2">Progressive Tax Rates</p>
                                    <div className="space-y-0">
                                        {taxBreakdown.map((band, i) => (
                                            <div key={i} className="flex justify-between items-center py-2">
                                                <span className="text-neutral-500">{band.label}</span>
                                                <span className="font-semibold text-neutral-800">{fmtN(band.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Action */}
                <div className="flex gap-3 mb-4">
                    <PrimaryButton className="w-full" onClick={() => setShowPayeFiling(true)} disabled={!hasData}>
                        File your PAYE
                    </PrimaryButton>
                </div>
            </main>

            <PayeFilingSheet
                open={showPayeFiling}
                onClose={() => setShowPayeFiling(false)}
                onFile={() => toast.success('Return filed')}
            />
        </div>
    );
}
