'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import LoadingScreen from '@/screens/Onboarding/LoadingScreen';
import { useTaxableApi } from '@/lib';
import { useProfile } from '@/contexts/ProfileContext';

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
const INCOME_SOURCES = [
    { id: 'salary', label: 'Salary / Employment', desc: 'Income from an employer' },
    { id: 'business', label: 'Business/Self-employment', desc: 'Income from your own business' },
    { id: 'freelance', label: 'Freelance/Consulting', desc: 'Project-based or contract work' },
    { id: 'investment', label: 'Investment income', desc: 'Dividends, interest, capital gains' },
    { id: 'rental', label: 'Rental income', desc: 'Income from property rentals' },
    { id: 'crypto', label: 'Digital Assets/Crypto', desc: 'Royalties, gifts, or other sources' },
];

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

// ── Reusable radio pill ──────────────────────────────────────────────────────
const RadioOption = ({
    label,
    desc,
    selected,
    onClick,
    disabled = false
}: { label: string; desc?: string; selected: boolean; onClick: () => void; disabled?: boolean }) => (
    <button
        type="button"
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={`w-full flex items-start gap-3 py-4 text-left group ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
        {/* Circle */}
        <div className={`mt-0.5 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected ? 'border-[#003787]' : 'border-gray-300'}`}>
            {selected && <div className="w-[9px] h-[9px] rounded-full bg-[#003787]" />}
        </div>
        <div>
            <p className={`text-[15px] font-medium leading-snug ${selected ? 'text-[#0C0C0E]' : 'text-[#0C0C0E]'}`}>{label}</p>
            {desc && <p className="text-[13px] text-gray-400 mt-0.5">{desc}</p>}
        </div>
    </button>
);

// ── Reusable checkbox row ────────────────────────────────────────────────────
const CheckboxOption = ({
    label,
    desc,
    selected,
    onClick
}: { label: string; desc?: string; selected: boolean; onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        className="w-full flex items-start gap-3 py-3.5 text-left"
    >
        <div className={`mt-0.5 w-[18px] h-[18px] rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected ? 'border-[#003787] bg-[#003787]' : 'border-gray-300 bg-white'}`}>
            {selected && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </div>
        <div>
            <p className="text-[15px] font-medium text-[#0C0C0E] leading-snug">{label}</p>
            {desc && <p className="text-[13px] text-gray-400 mt-0.5">{desc}</p>}
        </div>
    </button>
);

// ── Divider ──────────────────────────────────────────────────────────────────
const Divider = () => <div className="w-full h-[1px] bg-gray-100" />;

// ── Main component ────────────────────────────────────────────────────────────
export default function SetupSidebar({ isOpen, onClose, onComplete, resumeProfileId, initialData }: SetupSidebarProps) {
    const router = useRouter();
    const { createProfile, completeProfile } = useTaxableApi();
    const { fetchProfiles } = useProfile();
    
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingStep, setLoadingStep] = useState<0 | 1 | 2 | null>(null);
    const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
    const [shouldRedirectAfterLoading, setShouldRedirectAfterLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Step 0 state
    const [filingType, setFilingType] = useState<'Individual' | 'Business'>('Individual');
    const [taxId, setTaxId] = useState('');
    const [filingIntent, setFilingIntent] = useState<'returns' | 'paye'>('returns');
    const [taxYear, setTaxYear] = useState<'2026' | '2025'>('2026');
    // Business-specific: which services they need
    const [businessServices, setBusinessServices] = useState<string[]>([]);

    // Step 1 state — income sources
    const [selectedSources, setSelectedSources] = useState<string[]>([]);

    // Step 2 state — life questions
    const [lifeAnswers, setLifeAnswers] = useState<Record<string, string>>({});

    // ── Reset when opening ───────────────────────────────────────────────────
    useEffect(() => {
        if (isOpen) {
            if (resumeProfileId) {
                setStep(1);
                setActiveProfileId(resumeProfileId);
                if (initialData?.year) setTaxYear(initialData.year as '2026' | '2025');
                if (initialData?.category) setFilingType(initialData.category as 'Individual' | 'Business');
            } else {
                setStep(0);
                setFilingType('Individual');
                setTaxId('');
                setFilingIntent('returns');
                setTaxYear('2026');
                setSelectedSources([]);
                setLifeAnswers({});
                setBusinessServices([]);
                setActiveProfileId(null);
                setIsSubmitting(false);
            }
        }
    }, [isOpen, resumeProfileId]);

    if (!isOpen) return null;

    // ── Toggle income source ─────────────────────────────────────────────────
    const toggleSource = (id: string) => {
        setSelectedSources(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    // ── Set life answer ──────────────────────────────────────────────────────
    const setLifeAnswer = (id: string, val: string) => {
        setLifeAnswers(prev => ({ ...prev, [id]: val }));
    };

    // ── Handle "Get Started" on step 0 → go to step 1 ───────────────────────
    const handleGetStarted = async () => {
        // Business flow → route to business tax details page
        if (filingType === 'Business') {
            onClose();
            router.push(`/tax-folders/business?year=${taxYear}&new=workspace`);
            return;
        }
        // Individual PAYE flow → go directly to the calculator
        if (filingIntent === 'paye') {
            onClose();
            router.push('/tax-folders/paye');
            return;
        }
        // Individual tax returns flow → continue through income sources + life questions
        
        // Create profile via API
        try {
            setError(null);
            setLoadingStep(0);
            const profile = await createProfile(parseInt(taxYear), 'Individual');
            console.log('[SetupSidebar] Profile created:', profile);
            setActiveProfileId(profile.profileId);
            setStep(1);
        } catch (err: any) {
            console.error('[SetupSidebar] Failed to create profile:', err);
            setError(err.message || 'Failed to create profile');
        } finally {
            setLoadingStep(null);
        }
    };

    // ── Handle "Next" on step 1 → go to step 2 ───────────────────────────────
    const handleNextFromSources = () => {
        setLoadingStep(1);
        setStep(2);
        setTimeout(() => setLoadingStep(null), 300);
    };

    // ── Handle "Proceed" on step 2 → complete profile then redirect ───────────────────
    const handleProceed = async () => {
        if (!activeProfileId) {
            setError('No active profile');
            return;
        }
        
        setShouldRedirectAfterLoading(true);
        setIsSubmitting(true);
        
        try {
            // Map selected income sources to API format
            const incomeSourceMap: Record<string, string> = {
                'salary': 'Salary / Employment',
                'business': 'Business/Self-employment',
                'freelance': 'Freelance/Consulting',
                'investment': 'Investment income',
                'rental': 'Rental income',
                'crypto': 'Digital Assets/Crypto',
            };
            
            const primaryIncomeSources = selectedSources.map(s => incomeSourceMap[s] || s);
            
            // Map life answers to profile fields
            const completeData: any = {
                primaryIncomeSources,
                nin: taxId || undefined,
                residency183Days: lifeAnswers.nigeria_resident === 'yes',
                paysRent: lifeAnswers.pays_rent === 'yes',
                hasHealthInsurance: lifeAnswers.health_insurance === 'yes',
                hasPension: lifeAnswers.pension === 'yes',
                hasMortgage: lifeAnswers.mortgage === 'yes',
                filingPreference: taxYear === '2025' ? 'annual' : 'monthly',
            };
            
            console.log('[SetupSidebar] Completing profile with:', completeData);
            await completeProfile(activeProfileId, completeData);
            console.log('[SetupSidebar] Profile completed successfully');
            
            // Refresh profiles list
            await fetchProfiles();
            
            // Proceed to loading screen then redirect
            setIsSubmitting(true);
        } catch (err: any) {
            console.error('[SetupSidebar] Failed to complete profile:', err);
            setError(err.message || 'Failed to save profile');
            setIsSubmitting(false);
        }
    };

    const handleLoadingFinished = () => {
        setIsSubmitting(false);
        if (activeProfileId) {
            router.push(`/tax-folders/pit?profileId=${activeProfileId}`);
        }
        if (onComplete) {
            onComplete(true, activeProfileId || undefined);
        } else {
            onClose();
        }
    };

    // ── Step titles ──────────────────────────────────────────────────────────
    const getTitle = () => {
        if (step === 0) return 'Create a new tax filing';
        return `Setting up: ${taxYear} ${filingType} Tax Returns`;
    };

    const getSubtitle = () => {
        if (step === 0) return null;
        return 'You can select more than one option';
    };

    // ── Back ─────────────────────────────────────────────────────────────────
    const handleBack = () => {
        if (step === 0) onClose();
        else setStep(prev => prev - 1);
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[100] flex items-center justify-end pr-6">
                <div
                    className="absolute inset-0 bg-black/25 backdrop-blur-[3px]"
                    onClick={onClose}
                />

                {/* Modal card */}
                <div className="relative w-full max-w-[480px] h-[720px] bg-white rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-8 fade-in duration-300 z-10">

                    {/* Header */}
                    <div className="flex items-center gap-4 px-6 pt-4 pb-3 flex-shrink-0">
                        <button
                            onClick={handleBack}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0C0C0E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12" />
                                <polyline points="12 19 5 12 12 5" />
                            </svg>
                        </button>
                        <div className="flex-1 text-center">
                            <h2 className="text-[19px] font-semibold text-[#0C0C0E] leading-tight">{getTitle()}</h2>
                            {getSubtitle() && (
                                <p className="text-[13px] text-gray-400 font-normal mt-0.5">{getSubtitle()}</p>
                            )}
                        </div>
                        {/* Spacer to balance the back button */}
                        <div className="w-8 flex-shrink-0" />
                    </div>



                    {/* Scrollable body */}
                    <div className="flex-1 overflow-y-auto px-6 py-3 no-scrollbar">

                        {/* Error display */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        {/* ─── STEP 0: Create filing ─── */}
                        {step === 0 && (
                            <div className="space-y-1">
                                <p className="text-[15px] font-medium text-[#0C0C0E] mb-2">
                                    What type of tax do you want to file today?
                                </p>

                                <RadioOption
                                    label="Individual"
                                    desc="For salary earners, freelancers, sole proprietors, and self-employed individuals"
                                    selected={filingType === 'Individual'}
                                    onClick={() => setFilingType('Individual')}
                                />
                                <RadioOption
                                    label="Businesses & Organizations"
                                    desc="For registered companies (LTD, NGOs, Partnerships) subject to Corporate Income Tax"
                                    selected={filingType === 'Business'}
                                    onClick={() => {}}
                                    disabled={true}
                                />

                                {/* Tax ID — label changes based on filing type */}
                                <div className="pt-5">
                                    <label className="block text-[15px] font-medium text-[#0C0C0E] mb-1.5">
                                        {filingType === 'Business' ? 'Tax ID (RC/BN)' : 'Tax ID (Your NIN)'}{' '}
                                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-300 text-[10px] text-gray-400 font-bold ml-0.5 cursor-help">?</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={filingType === 'Business' ? 'Enter your business registration number' : 'Enter your NIN'}
                                        value={taxId}
                                        onChange={e => setTaxId(e.target.value)}
                                        className="w-full h-11 border border-gray-200 rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#003787]/20 focus:border-[#003787]/40 transition-all"
                                    />
                                    <p className="text-[13px] text-gray-400 mt-1.5">
                                        {/* NIN/RC/BN help text removed */}
                                    </p>
                                </div>

                                {/* What to do — Individual gets radio buttons, Business gets checkboxes */}
                                {filingType === 'Individual' ? (
                                    <div className="pt-4">
                                        <p className="text-[15px] font-medium text-[#0C0C0E] mb-1">What would you like to do?</p>
                                        <RadioOption
                                            label="File my tax returns"
                                            selected={filingIntent === 'returns'}
                                            onClick={() => setFilingIntent('returns')}
                                        />
                                        <RadioOption
                                            label="Calculate my monthly PAYE"
                                            selected={filingIntent === 'paye'}
                                            onClick={() => {}}
                                            disabled={true}
                                        />
                                    </div>
                                ) : (
                                    <div className="pt-4">
                                        <p className="text-[15px] font-medium text-[#0C0C0E] mb-2">What do you need to do?</p>
                                        {[
                                            { id: 'paye', label: 'PAYE (Pay As You Earn)', desc: 'File monthly tax for employees and annual reconciliation. Required if you have staff.' },
                                            { id: 'vat', label: 'VAT/WHT (Value Added Tax & Withholding Tax)', desc: 'File monthly VAT returns and remit WHT deductions. Required if turnover > ₦25M.' },
                                            { id: 'cit', label: 'CIT (Company Income Tax)', desc: 'File your annual corporate income tax return. Required for all registered companies.' },
                                        ].map(svc => (
                                            <CheckboxOption
                                                key={svc.id}
                                                label={svc.label}
                                                desc={svc.desc}
                                                selected={businessServices.includes(svc.id)}
                                                onClick={() => setBusinessServices(prev =>
                                                    prev.includes(svc.id) ? prev.filter(s => s !== svc.id) : [...prev, svc.id]
                                                )}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Tax year */}
                                <div className="pt-4">
                                    <p className="text-[15px] font-medium text-[#0C0C0E] mb-1">Which tax year are you filing for?</p>
                                    <div className="flex items-center gap-6 pt-2">
                                        <RadioOption
                                            label="2026 (Current year)"
                                            selected={taxYear === '2026'}
                                            onClick={() => setTaxYear('2026')}
                                        />
                                        <RadioOption
                                            label="2025"
                                            selected={taxYear === '2025'}
                                            onClick={() => setTaxYear('2025')}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── STEP 1: Income sources ─── */}
                        {step === 1 && (
                            <div>
                                <p className="text-[15px] font-medium text-[#0C0C0E] mb-3">
                                    What's your primary income source?
                                </p>
                                <div className="space-y-0">
                                    {INCOME_SOURCES.map((src) => (
                                        <CheckboxOption
                                            key={src.id}
                                            label={src.label}
                                            desc={src.desc}
                                            selected={selectedSources.includes(src.id)}
                                            onClick={() => toggleSource(src.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ─── STEP 2: Life questions ─── */}
                        {step === 2 && (
                            <div className="space-y-6">
                                {LIFE_QUESTIONS.map((q) => (
                                    <div key={q.id}>
                                        <p className="text-[15px] font-medium text-[#0C0C0E] mb-2">{q.question}</p>
                                        <div className="flex gap-6">
                                            {q.options.map(opt => (
                                                <RadioOption
                                                    key={opt.value}
                                                    label={opt.label}
                                                    selected={lifeAnswers[q.id] === opt.value}
                                                    onClick={() => setLifeAnswer(q.id, opt.value)}
                                                />
                                            ))}
                                        </div>
                                        {q.hint && (
                                            <p className="text-[13px] text-gray-400 font-normal mt-1 leading-relaxed">
                                                {q.hint}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer buttons */}
                    <div className="px-6 py-4 flex-shrink-0 border-t border-gray-100">
                        {step === 0 && (
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 h-12 border border-gray-200 text-[#0C0C0E] font-bold rounded-xl hover:bg-gray-50 transition-colors text-[15px]"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleGetStarted}
                                    disabled={loadingStep === 0}
                                    className="flex-1 h-12 bg-[#003787] text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-[15px] disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {loadingStep === 0 ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating...
                                        </>
                                    ) : 'Get Started'}
                                </button>
                            </div>
                        )}

                        {step === 1 && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(0)}
                                    disabled={loadingStep === 1}
                                    className="flex-1 h-12 border border-gray-200 text-[#0C0C0E] font-bold rounded-xl hover:bg-gray-50 transition-colors text-[15px] disabled:opacity-50"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleNextFromSources}
                                    disabled={selectedSources.length === 0 || loadingStep === 1}
                                    className="flex-1 h-12 bg-[#003787] text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-[15px] disabled:opacity-40 flex items-center justify-center gap-2"
                                >
                                    {loadingStep === 1 ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Loading...
                                        </>
                                    ) : 'Next'}
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    disabled={isSubmitting}
                                    className="flex-1 h-12 border border-gray-200 text-[#0C0C0E] font-bold rounded-xl hover:bg-gray-50 transition-colors text-[15px] disabled:opacity-50"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleProceed}
                                    disabled={isSubmitting}
                                    className="flex-1 h-12 bg-[#003787] text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-[15px] disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : 'Proceed'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Loading screen after submit */}
            {isSubmitting && (
                <LoadingScreen
                    onComplete={handleLoadingFinished}
                    title={`Creating your ${taxYear} ${filingType} Tax workspace...`}
                    steps={[
                        { text: 'Analyzing your setup' },
                        { text: 'Generating form sections' },
                        { text: 'Preparing your workspace' },
                    ]}
                />
            )}
        </>
    );
}
