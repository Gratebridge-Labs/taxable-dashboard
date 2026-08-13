'use client';
import React, { useState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTaxableApi } from '@/lib';
import { useProfile } from '@/contexts/ProfileContext';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import type { ProfileCompleteRequest } from '@/types/api';

interface SetupSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete?: (shouldRedirect: boolean, profileId?: string) => void;
    resumeProfileId?: string | null;
    initialData?: {
        year?: string;
        category?: string;
    };
}

// ── Step 0 data ──────────────────────────────────────────────────────────────
const LIFE_QUESTIONS = [
    {
        id: 'nigeria_resident',
        question: 'Did/Will you live in Nigeria for 183+ days this tax year?',
        hint: 'This determines whether you declare worldwide income or only Nigerian-sourced income.',
        options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]
    },
    {
        id: 'pays_rent',
        question: 'Do you pay rent?',
        hint: "If yes, you're eligible for a 20% rent relief deduction (new in 2026). Could save you up to ₦500k.",
        options: [
            { value: 'yes', label: 'Yes, I rent my home' },
            { value: 'no', label: 'No, I own my home or live rent-free' }
        ]
    },
    {
        id: 'health_insurance',
        question: 'Do you pay for health insurance?',
        hint: null,
        options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]
    },
    {
        id: 'pension',
        question: 'Do you contribute to a pension plan?',
        hint: null,
        options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]
    },
    {
        id: 'mortgage',
        question: 'Do you pay a mortgage?',
        hint: null,
        options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]
    },
];



// ── Main component ────────────────────────────────────────────────────────────
export default function SetupSidebar({ isOpen, onClose, onComplete, resumeProfileId, initialData }: SetupSidebarProps) {
    const router = useRouter();
    const { createProfile, completeProfile } = useTaxableApi();
    const { fetchProfiles } = useProfile();
    
    const [step, setStep] = useState(0);
    const [subStep, setSubStep] = useState(0);
    const [loadingStep, setLoadingStep] = useState<0 | 1 | 2 | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Step 0 state
    const [filingType, setFilingType] = useState<'Individual' | 'Business' | null>(null);
    const [taxId, setTaxId] = useState('');
    const [filingIntent, setFilingIntent] = useState<'returns' | 'paye' | null>(null);
    const [taxYear, setTaxYear] = useState<'2026' | '2025'>('2026');
    const [businessServices, setBusinessServices] = useState<string[]>([]);

    const ninError = filingType === 'Individual' && taxId.length > 0 && taxId.length !== 11
        ? 'NIN must be exactly 11 digits'
        : null;
    const ninValid = filingType !== 'Individual' || taxId.length === 11 || taxId.length === 0;

    // Step 1 state — life questions
    const [lifeAnswers, setLifeAnswers] = useState<Record<string, string>>({});

    // ── Reset when opening ───────────────────────────────────────────────────
    useEffect(() => {
        if (isOpen) {
            startTransition(() => {
                if (resumeProfileId) {
                    setStep(1);
                    if (initialData?.year) setTaxYear(initialData.year as '2026' | '2025');
                    if (initialData?.category) setFilingType(initialData.category as 'Individual' | 'Business');
                } else {
                setStep(0);
                setSubStep(0);
                setFilingType(null);
                setTaxId('');
                setFilingIntent(null);
                setTaxYear('2026');
                setLifeAnswers({});
                setBusinessServices([]);
                }
            });
        }
    }, [isOpen, resumeProfileId]);

    if (!isOpen) return null;

    // ── Set life answer ──────────────────────────────────────────────────────
    const setLifeAnswer = (id: string, val: string) => {
        setLifeAnswers(prev => ({ ...prev, [id]: val }));
    };

    // ── Handle "Get Started" on step 0 ──────────────────────────────────────
    const handleGetStarted = async () => {
        if (!filingIntent) return;

        // Business flow → create profile then route to business tax details
        if (filingType === 'Business') {
            setLoadingStep(0);
            try {
                const profile = await createProfile(parseInt(taxYear), 'Business', {
                    intent: filingIntent === 'returns' ? 'file_returns' : 'calculate_paye',
                    taxId: taxId || undefined,
                    taxTypes: {
                        paye: businessServices.includes('PAYE'),
                        vatWht: businessServices.includes('VAT/WHT'),
                        cit: businessServices.includes('CIT'),
                    },
                });
                const createdProfileId = profile.profileId || profile.id;
                if (!createdProfileId) {
                    throw new Error('Profile created but no profile ID was returned');
                }
                await fetchProfiles();
                onClose();
                const params = new URLSearchParams({
                    profileId: createdProfileId,
                    year: taxYear,
                    new: 'workspace',
                });
                if (taxId) params.set('taxId', taxId);
                router.push(`/tax-folders/business?${params.toString()}`);
            } catch (err: unknown) {
                console.error('[SetupSidebar] Failed to create business profile:', err);
                setError(err instanceof Error ? err.message : 'Failed to create business profile');
            } finally {
                setLoadingStep(null);
            }
            return;
        }
        // Individual PAYE flow → go directly to the calculator
        if (filingIntent === 'paye') {
            onClose();
            router.push('/tax-folders/paye');
            return;
        }
        // Individual returns flow → advance to life questions
        setStep(1);
    };

    // ── Handle "Get Started" on step 1 → create + complete profile then redirect ──
    const handleCreateAndSubmit = async () => {
        try {
            setError(null);
            setLoadingStep(2);
            
            const profile = await createProfile(parseInt(taxYear), 'Individual');
            
            const completeData: ProfileCompleteRequest = {
                nin: taxId || undefined,
                residency183Days: lifeAnswers.nigeria_resident === 'yes',
                paysRent: lifeAnswers.pays_rent === 'yes',
                hasHealthInsurance: lifeAnswers.health_insurance === 'yes',
                hasPension: lifeAnswers.pension === 'yes',
                hasMortgage: lifeAnswers.mortgage === 'yes',
                filingPreference: taxYear === '2025' ? 'annual' : 'monthly',
            };
            
            await completeProfile(profile.profileId, completeData);
            await fetchProfiles();

            setLoadingStep(null);
            if (onComplete) {
                onComplete(true, profile.profileId);
            } else {
                onClose();
            }
        } catch (err: unknown) {
            console.error('[SetupSidebar] Failed to create profile:', err);
            setError(err instanceof Error ? err.message : 'Failed to create profile');
            setLoadingStep(null);
        }
    };

    // ── Step titles ──────────────────────────────────────────────────────────
    const getTitle = () => {
        if (step === 0) return 'Create a new tax filing';
        return `Setting up: ${taxYear} ${filingType} Tax Returns`;
    };

    const getSubtitle = () => {
        return null;
    };

    const allLifeQuestionsAnswered = Object.keys(lifeAnswers).length === LIFE_QUESTIONS.length;

    return (
        <>
            <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()} noBodyStyles>
                <DrawerContent className="flex flex-col max-h-[90dvh]">
                    <div data-lenis-prevent className="overflow-y-auto flex-1">
                        <div className="mx-auto max-w-[450px] px-6 py-8">

                            {/* Header */}
                            <div className="pb-6">
                                <h2 className="text-5 font-medium text-neutral-800 text-center tracking-[-0.02em] font-[family-name:var(--font-merriweather)]">{getTitle()}</h2>
                                {getSubtitle() && (
                                    <p className="text-1 font-medium mt-0.5 text-neutral-500 text-center">{getSubtitle()}</p>
                                )}
                            </div>

                            {/* Error display */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-1 text-red-600">
                                    {error}
                                </div>
                            )}

                            {/* ─── STEP 0: Create filing ─── */}
                            {step === 0 && (
                                <div className="space-y-1">
                                    {/* 1. What would you like to do? */}
                                    <p className="text-1 font-medium mb-2 text-neutral-500">
                                        What would you like to do?
                                    </p>
                                    <RadioGroup value={filingIntent || ''} onValueChange={(v) => { setFilingIntent(v as 'returns' | 'paye'); setSubStep(1); }} className="flex flex-col gap-4">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <RadioGroupItem value="returns" className="mt-0.5" />
                                            <p className="text-2 font-medium text-neutral-800">File my tax returns</p>
                                        </label>
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <RadioGroupItem value="paye" className="mt-0.5" />
                                            <p className="text-2 font-medium text-neutral-800">Calculate and File Monthly PAYE</p>
                                        </label>
                                    </RadioGroup>

                                    {/* 2. Who are you filing for? (not for PAYE — it routes directly to the calculator) */}
                                    {subStep >= 1 && filingIntent !== 'paye' && (
                                        <>
                                            <p className="text-1 font-medium mt-10 mb-2 text-neutral-500">
                                                Who are you filing for?
                                            </p>
                                            <RadioGroup value={filingType || ''} onValueChange={(v) => { setFilingType(v as 'Individual' | 'Business'); setSubStep(2); }} className="flex flex-col gap-6">
                                                <label className="flex items-start gap-3 cursor-pointer">
                                                    <RadioGroupItem value="Individual" className="mt-0.5" />
                                                    <div>
                                                        <p className="text-2 font-medium text-neutral-800">Individual</p>
                                                        <p className="text-1 font-medium mt-1 text-neutral-500">For salary earners, freelancers, sole proprietors, and self-employed individuals</p>
                                                    </div>
                                                </label>
                                                <label className="flex items-start gap-3 cursor-pointer">
                                                    <RadioGroupItem value="Business" className="mt-0.5" />
                                                    <div>
                                                        <p className="text-2 font-medium text-neutral-800">Businesses & Organizations</p>
                                                        <p className="text-1 font-medium mt-1 text-neutral-500">For registered companies (LTD, NGOs, Partnerships) subject to Corporate Income Tax</p>
                                                    </div>
                                                </label>
                                            </RadioGroup>
                                        </>
                                    )}

                                    {/* 3. Everything else (Tax ID + services + tax year) */}
                                    {subStep >= 2 && filingType && (
                                        <>
                                            <div className="pt-10">
                                                <label className="block text-1 font-medium mb-2 text-neutral-500">
                                                    {filingType === 'Business' ? 'Tax ID (RC/BN)' : 'Tax ID (Your NIN)'}{' '}
                                                    <InfoTooltip text={filingType === 'Business' ? 'Your business registration number issued by CAC (Corporate Affairs Commission).' : 'Your 11-digit National Identification Number issued by NIMC.'} />
                                                </label>
                                                <Input
                                                    type="text"
                                                    placeholder={filingType === 'Business' ? 'e.g., RC 1234567 / BN 123456' : 'Enter your NIN'}
                                                    value={taxId}
                                                    onChange={e => {
                                                        if (filingType === 'Business') {
                                                            const v = e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 15);
                                                            setTaxId(v);
                                                        } else {
                                                            setTaxId(e.target.value.replace(/[^0-9]/g, '').slice(0, 11));
                                                        }
                                                    }}
                                                    className={ninError ? 'border-red-500' : ''}
                                                />
                                                {ninError && (
                                                    <p className="text-1 font-medium text-red-500 mt-1">{ninError}</p>
                                                )}
                                            </div>

                                            {filingType === 'Business' && (
                                                <div className="pt-10">
                                                    <p className="text-1 font-medium mb-2 text-neutral-500">
                                                        What do you need to do?
                                                    </p>
                                                    {[
                                                        { label: 'PAYE', desc: 'File monthly tax for employees and annual reconciliation. Required if you have staff.' },
                                                        { label: 'VAT/WHT', desc: 'File monthly VAT returns and remit WHT deductions. Required if turnover > ₦25M.' },
                                                        { label: 'CIT', desc: 'File your annual corporate income tax return. Required for all registered companies.' },
                                                    ].map(service => (
                                                        <label key={service.label} className="flex items-start gap-3 cursor-pointer py-3.5">
                                                            <Checkbox
                                                                checked={businessServices.includes(service.label)}
                                                                onCheckedChange={() =>
                                                                    setBusinessServices(prev =>
                                                                        prev.includes(service.label)
                                                                            ? prev.filter(s => s !== service.label)
                                                                            : [...prev, service.label]
                                                                    )
                                                                }
                                                                className="mt-0.5"
                                                            />
                                                            <div>
                                                                <p className="text-2 font-medium text-neutral-800">{service.label}</p>
                                                                <p className="text-1 font-medium mt-1 text-neutral-500">{service.desc}</p>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="pt-10">
                                                <p className="text-1 font-medium text-neutral-800 mb-2">Which tax year are you filing for?</p>
                                                <RadioGroup value={taxYear} onValueChange={(v) => setTaxYear(v as '2026' | '2025')} className="flex flex-col sm:flex-row sm:items-center gap-4">
                                                    <label className="flex items-start gap-3 cursor-pointer">
                                                        <RadioGroupItem value="2026" className="mt-0.5" />
                                                        <p className="text-2 font-medium text-neutral-800">2026 (Current year)</p>
                                                    </label>
                                                    <label className="flex items-start gap-3 cursor-pointer">
                                                        <RadioGroupItem value="2025" className="mt-0.5" />
                                                        <p className="text-2 font-medium text-neutral-800">2025</p>
                                                    </label>
                                                </RadioGroup>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* ─── STEP 1: Life questions ─── */}
                            {step === 1 && (
                                <div className="space-y-14">
                                    {LIFE_QUESTIONS.map((q) => (
                                        <div key={q.id}>
                                            <p className="text-1 font-medium text-neutral-800 mb-2">{q.question}</p>
                                            <RadioGroup value={lifeAnswers[q.id] || ''} onValueChange={(v) => setLifeAnswer(q.id, v)} className="flex flex-col sm:flex-row sm:items-center gap-4">
                                                {q.options.map(opt => (
                                                    <label key={opt.value} className="flex items-start gap-3 cursor-pointer">
                                                        <RadioGroupItem value={opt.value} className="mt-0.5" />
                                                        <p className="text-2 font-medium text-neutral-800">{opt.label}</p>
                                                    </label>
                                                ))}
                                            </RadioGroup>
                                            {q.hint && (
                                                <p className="text-1 text-neutral-400 font-medium mt-2 leading-relaxed">
                                                    {q.hint}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Footer buttons — always visible, primary disabled until valid */}
                            <div className="flex gap-3 pt-6 border-t border-neutral-100 mt-8">
                                <button
                                    onClick={step === 0 ? onClose : () => setStep(prev => prev - 1)}
                                    className="flex-1 h-12 border border-neutral-200 text-neutral-800 font-semibold rounded-xl text-2"
                                >
                                    {step === 0 ? 'Cancel' : 'Back'}
                                </button>
                                <button
                                    onClick={step === 0 ? handleGetStarted : handleCreateAndSubmit}
                                    disabled={
                                        step === 0
                                            ? filingIntent === 'paye'
                                                ? loadingStep === 0
                                                : !filingIntent || !filingType || (filingType === 'Individual' && !ninValid) || (filingType === 'Business' && businessServices.length === 0) || loadingStep === 0
                                            : !allLifeQuestionsAnswered || loadingStep === 2
                                    }
                                    className="flex-1 h-12 bg-taxable-blue text-white font-semibold rounded-xl text-2 disabled:bg-neutral-100 disabled:text-neutral-400 flex items-center justify-center gap-2"
                                >
                                    {(loadingStep === 2 || loadingStep === 0) ? <Spinner /> : step === 0 ? (filingType === 'Business' ? 'Get Started' : 'Continue') : 'Get Started'}
                                </button>
                            </div>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}
