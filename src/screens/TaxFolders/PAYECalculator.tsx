'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';

// Actually use Old rates which match the screenshot better
const PAYE_BANDS = [
    { limit: 800_000, rate: 0.00 },
    { limit: 2_200_000, rate: 0.07 },
    { limit: 9_000_000, rate: 0.11 },
    { limit: Infinity, rate: 0.15 },
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
        const monthlyLimit = prevLimit === 0
            ? `First ₦${fmtShort(band.limit / 12)}/month: ${(band.rate * 100).toFixed(0)}%`
            : `Next portion: ${(band.rate * 100).toFixed(0)}%`;
        breakdown.push({ label: monthlyLimit, amount: Math.round(tax / 12), rate: band.rate });
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

// ── Deduction row ─────────────────────────────────────────────────────────────
const DeductionRow = ({
    label,
    hint,
    checked,
    onToggle,
    amount,
    onAmountChange,
    suffix,
    disabled: _disabled,
    autoCalc,
}: {
    label: string;
    hint?: string;
    checked: boolean;
    onToggle: () => void;
    amount: string;
    onAmountChange: (v: string) => void;
    suffix?: string;
    disabled?: boolean;
    autoCalc?: boolean;
}) => (
    <div className="flex items-center gap-4 py-3 last:border-0">
        {/* Checkbox */}
        <button
            type="button"
            onClick={onToggle}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? 'border-taxable-blue bg-taxable-blue' : 'border-neutral-300 bg-white'
                }`}
        >
            {checked && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </button>

        {/* Label */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className={`text-2 font-semibold ${checked ? 'text-neutral-800' : 'text-neutral-500'}`}>{label}</span>
            {hint && (
                <div className="relative group">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-neutral-400" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-neutral-800 text-white text-[11px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                        {hint}
                    </div>
                </div>
            )}
        </div>

        {/* Amount */}
        <div className={`w-40 flex-shrink-0 border rounded-lg px-3 py-2 flex items-center gap-2 ${checked ? 'border-neutral-200 bg-white' : 'border-neutral-100 bg-neutral-50'
            }`}>
            <span className="text-2 font-bold text-neutral-800 flex-shrink-0">₦</span>
            <input
                type="text"
                value={checked ? amount : ''}
                placeholder="0"
                disabled={!checked || autoCalc}
                onChange={e => {
                    const raw = e.target.value.replace(/[^0-9.]/g, '');
                    onAmountChange(raw);
                }}
                className={`flex-1 w-0 min-w-0 text-2 font-bold bg-transparent border-none outline-none placeholder:text-neutral-300 ${(!checked || autoCalc) ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
            />
            {suffix && checked && (
                <span className="text-1 text-neutral-400 flex-shrink-0">{suffix}</span>
            )}
        </div>
    </div>
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
    const [lifeInsOn, setLifeInsOn] = useState(true);
    const [lifeInsAmt, setLifeInsAmt] = useState('20000');
    const [rentOn, setRentOn] = useState(false);
    const [rentAmt, setRentAmt] = useState('');

    const [showBreakdown, setShowBreakdown] = useState(false);

    // Derived numbers
    const gross = parseFloat(grossSalary.replace(/,/g, '')) || 0;
    const bonus = parseFloat(bonuses.replace(/,/g, '')) || 0;
    const monthlyGross = gross + bonus;
    const pensionAmt = pensionOn ? Math.round(monthlyGross * 0.08) : 0;
    const nhfAmt = nhfOn ? Math.round(monthlyGross * 0.025) : 0;
    const lifeAmt = lifeInsOn ? (parseFloat(lifeInsAmt.replace(/,/g, '')) || 0) : 0;
    const rentRelief = rentOn ? Math.round((parseFloat(rentAmt.replace(/,/g, '')) || 0) / 12) : 0;

    const totalMonthlyDeductions = pensionAmt + nhfAmt + lifeAmt + rentRelief;
    const monthlyTaxable = Math.max(0, monthlyGross - totalMonthlyDeductions);
    const annualTaxable = monthlyTaxable * 12;

    const { total: monthlyPAYE, breakdown: taxBreakdown } = useMemo(
        () => calcPAYE(annualTaxable),
        [annualTaxable]
    );

    const hasData = gross > 0;

    return (
        <div className="min-h-screen bg-taxable-light pb-20">
            <DashboardHeader />

            <main className="max-w-[760px] mx-auto px-4 md:px-8 py-8">
                {/* Back + Breadcrumb */}
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-2 font-bold text-neutral-800 hover:text-taxable-blue transition-colors"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                        </svg>
                        Back
                    </button>
                    <div className="flex items-center gap-1.5 text-1 text-neutral-400 font-medium">
                        <span>Dashboard</span>
                        <span>/</span>
                        <span className="text-neutral-500">Calculate my monthly PAYE</span>
                    </div>
                </div>

                {/* Title */}
                <div className="mb-8">
                    <h1 className="text-[28px] font-bold text-neutral-800 mb-1">PAYE Calculator</h1>
                    <p className="text-[14px] text-neutral-400 font-medium">
                        Estimate how much income tax your employer should deduct from your salary each month.
                    </p>
                </div>

                {/* Salary section */}
                <div className="mb-6">
                    <h2 className="text-[16px] font-bold text-neutral-800 mb-3">Your Salary</h2>
                    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                        {/* Gross salary */}
                        <div className="px-5 py-4">
                            <p className="text-1 font-semibold text-neutral-500 mb-2">What's your monthly gross salary</p>
                            <div className="flex items-center gap-2">
                                <span className="text-3 font-bold text-neutral-800">₦</span>
                                <input
                                    type="text"
                                    placeholder="0"
                                    value={grossSalary}
                                    onChange={e => setGrossSalary(e.target.value.replace(/[^0-9.]/g, ''))}
                                    className="flex-1 text-3 font-bold text-neutral-800 placeholder:text-neutral-300 bg-transparent border-none outline-none"
                                />
                            </div>
                            <p className="text-[11px] text-neutral-400 font-medium mt-1.5">
                                Enter the amount before any deductions. Don't include bonuses unless they're paid monthly
                            </p>
                        </div>

                        {/* Bonuses */}
                        <div className="px-5 py-4">
                            <p className="text-1 font-semibold text-neutral-500 mb-2">Monthly bonuses or allowances</p>
                            <div className="flex items-center gap-2">
                                <span className="text-3 font-bold text-neutral-800">₦</span>
                                <input
                                    type="text"
                                    placeholder="0"
                                    value={bonuses}
                                    onChange={e => setBonuses(e.target.value.replace(/[^0-9.]/g, ''))}
                                    className="flex-1 text-3 font-bold text-neutral-800 placeholder:text-neutral-300 bg-transparent border-none outline-none"
                                />
                            </div>
                            <p className="text-[11px] text-neutral-400 font-medium mt-1.5">
                                Only include bonuses that are paid every month, like housing or transport allowances.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Deductions section */}
                <div className="mb-6">
                    <h2 className="text-[16px] font-bold text-neutral-800 mb-3">Your Deductions</h2>
                    <div className="bg-white border border-neutral-200 rounded-2xl px-5 py-2">
                        <DeductionRow
                            label="Pension (8%)"
                            hint="Mandatory pension contribution — 8% of gross salary, deducted before tax."
                            checked={pensionOn}
                            onToggle={() => setPensionOn(p => !p)}
                            amount={grossSalary ? pensionAmt.toLocaleString() : ''}
                            onAmountChange={() => { }}
                            autoCalc
                        />
                        <DeductionRow
                            label="National Housing Funds (2.5%)"
                            hint="NHF contribution — 2.5% of basic salary."
                            checked={nhfOn}
                            onToggle={() => setNhfOn(p => !p)}
                            amount={grossSalary ? nhfAmt.toLocaleString() : ''}
                            onAmountChange={() => { }}
                            autoCalc
                        />
                        <DeductionRow
                            label="Life Insurance"
                            hint="Life assurance premiums are tax deductible."
                            checked={lifeInsOn}
                            onToggle={() => setLifeInsOn(p => !p)}
                            amount={lifeInsAmt}
                            onAmountChange={setLifeInsAmt}
                            suffix="/month"
                        />
                        <DeductionRow
                            label="I pay rent"
                            hint="Under 2026 reforms, 20% of annual rent (up to ₦500k relief) is deductible."
                            checked={rentOn}
                            onToggle={() => setRentOn(p => !p)}
                            amount={rentAmt}
                            onAmountChange={setRentAmt}
                            suffix="/year"
                        />
                    </div>
                </div>

                {/* Result */}
                <div className="mb-6">
                    <p className="text-2 font-semibold text-neutral-500 mb-1">Your monthly PAYE</p>
                    <p className={`text-[40px] font-bold leading-none mb-1 ${hasData ? 'text-neutral-800' : 'text-neutral-300'}`}>
                        {hasData ? fmtN(monthlyPAYE) : '₦—'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-neutral-400" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        <p className="text-1 text-neutral-400 font-medium">Your employer should deduct this much each month</p>
                    </div>
                </div>

                {/* Breakdown toggle */}
                {hasData && (
                    <div className="mb-6">
                        <button
                            onClick={() => setShowBreakdown(s => !s)}
                            className="flex items-center gap-1.5 text-2 font-bold text-taxable-blue hover:opacity-80 transition-opacity"
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
                            <div className="mt-4 bg-white border border-neutral-200 rounded-2xl overflow-hidden text-2 font-medium animate-in fade-in slide-in-from-top-2 duration-200">
                                {/* Income rows */}
                                <div className="space-y-0">
                                    <div className="flex justify-between items-center px-5 py-3">
                                        <span className="text-neutral-500">Gross Salary</span>
                                        <span className="font-bold text-neutral-800">{fmtN(monthlyGross)}</span>
                                    </div>
                                    {pensionOn && (
                                        <div className="flex justify-between items-center px-5 py-3">
                                            <span className="text-neutral-500">Pension (8%)</span>
                                            <span className="font-bold text-red-500">-{fmtN(pensionAmt)}</span>
                                        </div>
                                    )}
                                    {nhfOn && (
                                        <div className="flex justify-between items-center px-5 py-3">
                                            <span className="text-neutral-500">NHF (2.5%)</span>
                                            <span className="font-bold text-red-500">-{fmtN(nhfAmt)}</span>
                                        </div>
                                    )}
                                    {lifeInsOn && (
                                        <div className="flex justify-between items-center px-5 py-3">
                                            <span className="text-neutral-500">Life Insurance</span>
                                            <span className="font-bold text-red-500">-{fmtN(lifeAmt)}</span>
                                        </div>
                                    )}
                                    {rentOn && (
                                        <div className="flex justify-between items-center px-5 py-3">
                                            <span className="text-neutral-500">Rent Relief</span>
                                            <span className="font-bold text-red-500">-{fmtN(rentRelief)} ({fmtN(parseFloat(rentAmt) || 0)} annual ÷ 12)</span>
                                        </div>
                                    )}
                                </div>

                                {/* Taxable income */}
                                <div className="flex justify-between items-center px-5 py-3 bg-neutral-50 border-t border-neutral-100">
                                    <span className="font-bold text-neutral-800">Taxable Income</span>
                                    <span className="font-bold text-neutral-800">{fmtN(monthlyTaxable)}</span>
                                </div>

                                {/* Tax bands */}
                                <div className="px-5 pt-4 pb-2">
                                    <p className="text-1 font-bold text-neutral-800 mb-2">Progressive Tax Rates</p>
                                    <div className="space-y-0">
                                        {taxBreakdown.map((band, i) => (
                                            <div key={i} className="flex justify-between items-center py-2">
                                                <span className="text-neutral-500">{band.label}</span>
                                                <span className="font-bold text-neutral-800">{fmtN(band.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="flex justify-between items-center px-5 py-4 bg-taxable-blue text-white">
                                    <span className="font-bold">Total PAYE</span>
                                    <span className="font-bold text-lg">{fmtN(monthlyPAYE)}/month</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 mb-4">
                    <button className="flex-1 h-12 border border-neutral-200 text-neutral-800 font-bold rounded-xl hover:bg-neutral-50 transition-colors text-[14px]">
                        Download PDF
                    </button>
                    <button
                        onClick={() => router.push('/tax-folders/pit')}
                        className="flex-[2] h-12 bg-taxable-blue text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-[14px]"
                    >
                        File PIT taxes
                    </button>
                </div>

                {/* Mismatch help */}
                <p className="text-center text-2 text-neutral-500 font-medium">
                    This doesn't match my payslip.{' '}
                    <a href="#" className="text-taxable-blue font-bold hover:underline">Get help</a>
                </p>
            </main>
        </div>
    );
}
