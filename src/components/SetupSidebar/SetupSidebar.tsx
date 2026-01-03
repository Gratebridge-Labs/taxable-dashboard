'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import LoadingScreen from '@/screens/Onboarding/LoadingScreen';

interface SetupSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete?: (shouldRedirect: boolean) => void;
}

const SidebarRadio = ({ label, description, isSelected, onClick }: { label: string; description?: string; isSelected: boolean; onClick: () => void }) => (
    <div
        onClick={onClick}
        className="flex items-start gap-2 py-[14px] px-[12px] min-h-[66px] w-full max-w-[428px] rounded-[14px] cursor-pointer transition-all border border-gray-100 bg-[#F9FBFF]"
    >
        <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-taxable-blue' : 'border-gray-200'}`}>
            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-taxable-blue" />}
        </div>
        <div>
            <p className={`text-sm font-semibold ${isSelected ? 'text-taxable-dark' : 'text-gray-600'}`}>{label}</p>
            {description && <p className="text-[12px] text-gray-500 mt-0.5">{description}</p>}
        </div>
    </div>
);

const SidebarCheckbox = ({ label, description, isSelected, onClick }: { label: string; description?: string; isSelected: boolean; onClick: () => void }) => (
    <div
        onClick={onClick}
        className="flex items-start gap-2 py-[14px] px-[12px] min-h-[66px] w-full max-w-[428px] rounded-[14px] cursor-pointer transition-all border border-gray-100 bg-[#F9FBFF]"
    >
        <div className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'border-taxable-blue bg-taxable-blue' : 'border-gray-200 bg-white'}`}>
            {isSelected && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            )}
        </div>
        <div>
            <p className={`text-sm font-semibold ${isSelected ? 'text-taxable-dark' : 'text-gray-600'}`}>{label}</p>
            {description && <p className="text-[12px] text-gray-500 mt-0.5">{description}</p>}
        </div>
    </div>
);

export default function SetupSidebar({ isOpen, onClose, onComplete }: SetupSidebarProps) {
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shouldRedirectAfterLoading, setShouldRedirectAfterLoading] = useState(true);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selections, setSelections] = useState({
        taxYear: '2026',
        category: 'Individual',
        incomeSources: ['Salary / Employment', 'Business/Self-employment'],
        pension: 'Yes',
        health: 'Yes, NHIS',
        life: 'Yes',
        dependents: 'Yes',
        rent: 'Yes, I rent',
        mortgage: 'Yes',
        gratuity: 'Yes'
    });

    // Reset step and status when opening
    useEffect(() => {
        if (isOpen) {
            setStep(0);
            setIsSubmitting(false);
            setShowSuccessModal(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => Math.max(0, prev - 1));

    const handleComplete = (shouldRedirect: boolean = true) => {
        setShouldRedirectAfterLoading(shouldRedirect);
        setIsSubmitting(true);
    };

    const handleLoadingFinished = () => {
        setIsSubmitting(false);
        if (onComplete) {
            onComplete(shouldRedirectAfterLoading);
        } else {
            onClose();
        }
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <div className="flex flex-col gap-6">
                        <section>
                            <h3 className="text-[15px] font-medium text-taxable-dark mb-3 uppercase tracking-wider text-[11px]">Which tax year are you filing for?</h3>
                            <div className="flex flex-col gap-2">
                                <SidebarRadio
                                    label="2026 (Current year)" description="Most people start here"
                                    isSelected={selections.taxYear === '2026'} onClick={() => setSelections({ ...selections, taxYear: '2026' })}
                                />
                                <SidebarRadio
                                    label="2027 (Planning)" description="Planning ahead"
                                    isSelected={selections.taxYear === '2027'} onClick={() => setSelections({ ...selections, taxYear: '2027' })}
                                />
                            </div>
                        </section>

                        <section>
                            <h3 className="text-[15px] font-medium text-taxable-dark mb-3 uppercase tracking-wider text-[11px]">Select Filing Category</h3>
                            <div className="flex flex-col gap-2">
                                <SidebarRadio
                                    label="Individual" description="For salary earners, freelancers, sole proprietors, and self-employed individuals"
                                    isSelected={selections.category === 'Individual'} onClick={() => setSelections({ ...selections, category: 'Individual' })}
                                />
                                <SidebarRadio
                                    label="Businesses & Organizations" description="For registered companies (LTD, NGOs, Partnerships) subject to Corporate Income Tax"
                                    isSelected={selections.category === 'Business'} onClick={() => setSelections({ ...selections, category: 'Business' })}
                                />
                                <SidebarRadio
                                    label="Joint Filing (Spousal)" description="Combined filing for married couples seeking to optimize consolidated reliefs and allowances."
                                    isSelected={selections.category === 'Joint'} onClick={() => setSelections({ ...selections, category: 'Joint' })}
                                />
                            </div>
                        </section>

                        <div className="flex gap-3 mt-4">
                            <button onClick={onClose} className="flex-1 h-12 border border-gray-100 font-bold rounded-xl hover:bg-gray-50">Back</button>
                            <button
                                onClick={() => setShowSuccessModal(true)}
                                className="flex-[2] h-12 bg-[#003787] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                            >
                                Create Tax Folder
                            </button>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="flex flex-col gap-6">
                        <section>
                            <h3 className="text-[15px] font-medium text-taxable-dark mb-3">What's your primary income source?</h3>
                            <div className="flex flex-col gap-2">
                                {['Salary / Employment', 'Business/Self-employment', 'Freelance/Consulting', 'Investment income', 'Rental income', 'Other Income'].map(source => (
                                    <SidebarCheckbox
                                        key={source}
                                        label={source}
                                        description={
                                            source === 'Salary / Employment' ? 'Income from an employer' :
                                                source === 'Business/Self-employment' ? 'Income from your own business' :
                                                    source === 'Freelance/Consulting' ? 'Project-based or contract work' :
                                                        source === 'Investment income' ? 'Dividends, interest, capital gains' :
                                                            source === 'Rental income' ? 'Income from property rentals' :
                                                                source === 'Other Income' ? 'Royalties, gifts, or other sources' :
                                                                    undefined
                                        }
                                        isSelected={selections.incomeSources.includes(source)}
                                        onClick={() => {
                                            const newSources = selections.incomeSources.includes(source)
                                                ? selections.incomeSources.filter(s => s !== source)
                                                : [...selections.incomeSources, source];
                                            setSelections({ ...selections, incomeSources: newSources });
                                        }}
                                    />
                                ))}
                            </div>
                        </section>
                        <div className="flex gap-3 mt-4">
                            <button onClick={prevStep} className="flex-1 h-12 border border-gray-100 font-bold rounded-xl hover:bg-gray-50">Back</button>
                            <button onClick={nextStep} className="flex-[2] h-12 bg-taxable-blue text-white font-bold rounded-xl">Next 2/4</button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="flex flex-col gap-6">
                        <section>
                            <h3 className="text-[15px] font-medium text-taxable-dark mb-3">Do you contribute to a pension plan?</h3>
                            <div className="flex flex-col gap-2">
                                <SidebarRadio label="Yes, I contribute to pension" isSelected={selections.pension === 'Yes'} onClick={() => setSelections({ ...selections, pension: 'Yes' })} />
                                <SidebarRadio label="No, I don't have a pension plan" isSelected={selections.pension === 'No'} onClick={() => setSelections({ ...selections, pension: 'No' })} />
                                <SidebarRadio label="Not sure / I'll check later" isSelected={selections.pension === 'Later'} onClick={() => setSelections({ ...selections, pension: 'Later' })} />
                            </div>
                        </section>
                        <section>
                            <h3 className="text-[15px] font-medium text-taxable-dark mb-3">Do you pay for health insurance?</h3>
                            <div className="flex flex-col gap-2">
                                <SidebarRadio label="Yes, NHIS (National Health Insurance)" isSelected={selections.health === 'Yes, NHIS'} onClick={() => setSelections({ ...selections, health: 'Yes, NHIS' })} />
                                <SidebarRadio label="Yes, private health insurance" isSelected={selections.health === 'Private'} onClick={() => setSelections({ ...selections, health: 'Private' })} />
                                <SidebarRadio label="Yes, both NHIS and private" isSelected={selections.health === 'Both'} onClick={() => setSelections({ ...selections, health: 'Both' })} />
                                <SidebarRadio label="No health insurance" isSelected={selections.health === 'None'} onClick={() => setSelections({ ...selections, health: 'None' })} />
                            </div>
                        </section>
                        <section>
                            <h3 className="text-[15px] font-medium text-taxable-dark mb-3">Do you have life insurance?</h3>
                            <div className="flex flex-col gap-2">
                                <SidebarRadio label="Yes, I pay life insurance premiums" isSelected={selections.life === 'Yes'} onClick={() => setSelections({ ...selections, life: 'Yes' })} />
                                <SidebarRadio label="No, I don't have life insurance" isSelected={selections.life === 'No'} onClick={() => setSelections({ ...selections, life: 'No' })} />
                            </div>
                        </section>
                        <div className="flex gap-3 mt-4">
                            <button onClick={prevStep} className="flex-1 h-12 border border-gray-100 font-bold rounded-xl hover:bg-gray-50">Back</button>
                            <button onClick={nextStep} className="flex-[2] h-12 bg-taxable-blue text-white font-bold rounded-xl">Next 3/4</button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="flex flex-col gap-6">
                        <section>
                            <h3 className="text-[15px] font-medium text-taxable-dark mb-3">Do you have dependents?</h3>
                            <div className="flex flex-col gap-2">
                                <SidebarRadio label="Yes" isSelected={selections.dependents === 'Yes'} onClick={() => setSelections({ ...selections, dependents: 'Yes' })} />
                                <SidebarRadio label="No dependents" isSelected={selections.dependents === 'No'} onClick={() => setSelections({ ...selections, dependents: 'No' })} />
                            </div>
                        </section>
                        <section>
                            <h3 className="text-[15px] font-medium text-taxable-dark mb-3">Do you pay rent?</h3>
                            <div className="flex flex-col gap-2">
                                <SidebarRadio label="Yes, I rent my home" isSelected={selections.rent === 'Yes, I rent'} onClick={() => setSelections({ ...selections, rent: 'Yes, I rent' })} />
                                <SidebarRadio label="No, I own my home or live rent-free" isSelected={selections.rent === 'No'} onClick={() => setSelections({ ...selections, rent: 'No' })} />
                            </div>
                        </section>
                        <section>
                            <h3 className="text-[15px] font-medium text-taxable-dark mb-3">Do you pay a mortgage?</h3>
                            <div className="flex flex-col gap-2">
                                <SidebarRadio label="Yes, I have a mortgage" isSelected={selections.mortgage === 'Yes'} onClick={() => setSelections({ ...selections, mortgage: 'Yes' })} />
                                <SidebarRadio label="No" isSelected={selections.mortgage === 'No'} onClick={() => setSelections({ ...selections, mortgage: 'No' })} />
                            </div>
                        </section>
                        <section>
                            <h3 className="text-[15px] font-medium text-taxable-dark mb-3">Did you receive gratuity or severance pay this year?</h3>
                            <div className="flex flex-col gap-2">
                                <SidebarRadio label="Yes" isSelected={selections.gratuity === 'Yes'} onClick={() => setSelections({ ...selections, gratuity: 'Yes' })} />
                                <SidebarRadio label="No" isSelected={selections.gratuity === 'No'} onClick={() => setSelections({ ...selections, gratuity: 'No' })} />
                            </div>
                        </section>
                        <div className="flex gap-3 mt-4">
                            <button onClick={prevStep} className="flex-1 h-12 border border-gray-100 font-bold rounded-xl hover:bg-gray-50">Back</button>
                            <button onClick={() => handleComplete(true)} className="flex-[2] h-12 bg-taxable-blue text-white font-bold rounded-xl">Complete Setup</button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-[100] flex justify-end">
                <div
                    className="absolute inset-0 bg-taxable-dark/20 backdrop-blur-[2px]"
                    onClick={onClose}
                />

                <div className="relative w-full max-w-[480px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                    {/* Sidebar Header */}
                    <div className="h-20 px-8 flex items-center justify-between border-b border-gray-50">
                        <button onClick={step === 0 ? onClose : prevStep} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-lg transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                            </svg>
                        </button>
                        <h2 className="text-[17px] font-bold text-gray-900">
                            {step === 0 ? "Create a new tax filing" : "Let's get you set up"}
                        </h2>
                        <div className="w-8" /> {/* Placeholder for symmetry */}
                    </div>

                    {/* Sidebar Content */}
                    <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
                        {renderStep()}
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-taxable-dark/40 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)} />
                    <div className="relative bg-white rounded-[24px] w-[440px] h-[324px] p-8 shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col justify-between">
                        <div className="flex gap-4">
                            {/* Logo Icon Container */}
                            <div className="w-12 h-12 rounded-xl bg-[#F5F5F3] flex items-center justify-center flex-shrink-0">
                                <Image src="/logo_black.svg" alt="Taxable" width={24} height={24} />
                            </div>

                            {/* Text Content */}
                            <div className="text-left">
                                <h2 className="text-xl font-semibold text-taxable-dark mb-2.5">Tax folder created</h2>
                                <p className="text-sm text-taxable-dark font-medium leading-[1.5] mb-3">
                                    We've created a dedicated space for your 2026 Individual Tax filing. Think of this as your personal tax workspace - everything you need will be organized here.
                                </p>
                                <p className="text-sm text-taxable-gray font-medium leading-[1.5]">
                                    To get started, answer some setup questions (2 minutes) so we can personalize your workspace. We'll only show fields relevant to your situation
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    handleComplete(false);
                                }}
                                className="flex-1 h-12 text-sm font-semibold text-taxable-dark hover:bg-gray-50 rounded-xl transition-all border border-gray-100 text-center"
                            >
                                I'll do this later
                            </button>
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    setStep(1);
                                }}
                                className="flex-1 h-12 bg-[#003787] text-white text-sm font-semibold rounded-xl hover:opacity-90 shadow-lg shadow-[#003787]/10 transition-all px-4 text-center"
                            >
                                Answer Setup Questions
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isSubmitting && (
                <LoadingScreen
                    onComplete={handleLoadingFinished}
                    title="Creating your 2026 Individual Tax workspace..."
                    steps={[
                        { text: "Analyzing your setup" },
                        { text: "Generating form sections" },
                        { text: "Preparing your workspace" }
                    ]}
                />
            )}
        </>
    );
}
