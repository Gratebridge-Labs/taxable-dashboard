'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import LoadingScreen from '@/screens/Onboarding/LoadingScreen';

import { useApi } from '@/hooks/useApi';

interface Question {
    questionId: string;
    order: number;
    category: string;
    questionText: string;
    questionType: 'multiple_choice' | 'yes_no';
    required: boolean;
    options?: string[];
    explanation: string;
    helpText: string;
    dependsOn: string[];
    allowMultiple?: boolean;
    answered: boolean;
    existingResponse: any;
}

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

export default function SetupSidebar({ isOpen, onClose, onComplete, resumeProfileId, initialData }: SetupSidebarProps) {
    const { post, get } = useApi();
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [shouldRedirectAfterLoading, setShouldRedirectAfterLoading] = useState(true);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Dynamic Question State
    const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    const [selections, setSelections] = useState({
        taxYear: '2026',
        category: 'Individual'
    });
    const [createError, setCreateError] = useState<string | null>(null);

    const handleCreateTaxFolder = async () => {
        setIsCreatingFolder(true);
        setCreateError(null);
        try {
            const response = await post('/taxableprofile/create', {
                year: selections.taxYear,
                profileType: selections.category
            });

            if (response?.success && response?.data?.profileId) {
                setActiveProfileId(response.data.profileId);
                setShowSuccessModal(true);
            } else {
                throw new Error("Failed to get profile ID from response");
            }
        } catch (err: any) {
            console.error("Failed to create tax folder:", err);
            setCreateError(err.message || "Failed to create tax folder. Please try again.");
        } finally {
            setIsCreatingFolder(false);
        }
    };

    const fetchBaseQuestions = async () => {
        if (!activeProfileId) return;

        setLoadingQuestions(true);
        try {
            const response = await get(`/questions/${activeProfileId}/base-questions`);
            if (response?.success && response?.data?.questions) {
                setQuestions(response.data.questions);
                setStep(1); // Move to dynamic questions step
                setCurrentQuestionIndex(0);
            }
        } catch (err) {
            console.error("Failed to fetch base questions:", err);
        } finally {
            setLoadingQuestions(false);
        }
    };

    // Reset step and status when opening
    useEffect(() => {
        if (isOpen) {
            if (resumeProfileId) {
                setStep(1);
                setActiveProfileId(resumeProfileId);
                setShowSuccessModal(false);
                setQuestions([]);
                setCurrentQuestionIndex(0);
                setResponses({});

                // If initialData is provided, sync it to selections
                if (initialData?.year || initialData?.category) {
                    setSelections(prev => ({
                        ...prev,
                        taxYear: initialData.year || prev.taxYear,
                        category: initialData.category || prev.category
                    }));
                }

                // Automatically fetch questions for resume
                const fetchOnOpen = async () => {
                    setLoadingQuestions(true);
                    try {
                        const response = await get(`/questions/${resumeProfileId}/base-questions`);
                        if (response?.success && response?.data?.questions) {
                            setQuestions(response.data.questions);
                            setCurrentQuestionIndex(0);
                        }
                    } catch (err) {
                        console.error("Failed to fetch base questions:", err);
                    } finally {
                        setLoadingQuestions(false);
                    }
                };
                fetchOnOpen();
            } else {
                setStep(0);
                setIsSubmitting(false);
                setShowSuccessModal(false);
                setActiveProfileId(null);
                setQuestions([]);
                setCurrentQuestionIndex(0);
                setResponses({});
            }
        }
    }, [isOpen, resumeProfileId, get]);

    if (!isOpen) return null;

    const handleAnswer = (questionId: string, answer: any) => {
        setResponses(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleNext = async () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Final submission
            setIsSubmitting(true);
            try {
                // Formatting responses as an array of { questionId, response }
                const formattedAnswers = Object.entries(responses).map(([questionId, response]) => ({
                    questionId,
                    response
                }));

                await post(`/questions/${activeProfileId}/answer-base-questions`, {
                    answers: formattedAnswers
                });
                handleComplete(true);
            } catch (err) {
                console.error("Failed to submit answers:", err);
                setIsSubmitting(false);
            }
        }
    };

    const prevStep = () => {
        if (step === 1 && currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        } else {
            setStep(prev => Math.max(0, prev - 1));
        }
    };

    const handleComplete = (shouldRedirect: boolean = true) => {
        setShouldRedirectAfterLoading(shouldRedirect);
        setIsSubmitting(true);
    };

    const handleLoadingFinished = () => {
        setIsSubmitting(false);
        if (onComplete) {
            onComplete(shouldRedirectAfterLoading, activeProfileId || undefined);
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

                        {createError && (
                            <div className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-lg">
                                {createError}
                            </div>
                        )}

                        <div className="flex gap-3 mt-4">
                            <button onClick={onClose} className="flex-1 h-12 border border-gray-100 font-bold rounded-xl hover:bg-gray-50">Back</button>
                            <button
                                onClick={handleCreateTaxFolder}
                                disabled={isCreatingFolder}
                                className="flex-[2] h-12 bg-[#003787] text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isCreatingFolder ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    "Next"
                                )}
                            </button>
                        </div>
                    </div>
                );
            case 1:
                const question = questions[currentQuestionIndex];
                if (!question) return null;

                const currentResponse = responses[question.questionId];

                return (
                    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <section>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[12px] font-bold text-taxable-blue/60 uppercase tracking-widest bg-taxable-blue/5 px-3 py-1 rounded-full">
                                    Step {currentQuestionIndex + 1} of {questions.length}
                                </span>
                            </div>

                            <h3 className="text-[17px] font-bold text-taxable-dark mb-2 leading-snug">
                                {question.questionText}
                            </h3>
                            {question.helpText && (
                                <p className="text-[13px] text-taxable-gray font-medium mb-6 leading-relaxed">
                                    {question.helpText}
                                </p>
                            )}

                            <div className="flex flex-col gap-3">
                                {question.questionType === 'yes_no' ? (
                                    <>
                                        <SidebarRadio
                                            label="Yes"
                                            isSelected={currentResponse === 'yes'}
                                            onClick={() => handleAnswer(question.questionId, 'yes')}
                                        />
                                        <SidebarRadio
                                            label="No"
                                            isSelected={currentResponse === 'no'}
                                            onClick={() => handleAnswer(question.questionId, 'no')}
                                        />
                                    </>
                                ) : question.questionType === 'multiple_choice' ? (
                                    question.options?.map(option => (
                                        question.allowMultiple ? (
                                            <SidebarCheckbox
                                                key={option}
                                                label={option}
                                                isSelected={(currentResponse as string[] || []).includes(option)}
                                                onClick={() => {
                                                    const current = (currentResponse as string[] || []);
                                                    const next = current.includes(option)
                                                        ? current.filter(o => o !== option)
                                                        : [...current, option];
                                                    handleAnswer(question.questionId, next);
                                                }}
                                            />
                                        ) : (
                                            <SidebarRadio
                                                key={option}
                                                label={option}
                                                isSelected={currentResponse === option}
                                                onClick={() => handleAnswer(question.questionId, option)}
                                            />
                                        )
                                    ))
                                ) : null}
                            </div>

                            {question.explanation && (
                                <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                    <div className="flex gap-3">
                                        <div className="w-5 h-5 rounded-full bg-taxable-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-[10px] text-white font-bold italic">i</span>
                                        </div>
                                        <p className="text-[12px] text-taxable-gray font-medium leading-relaxed">
                                            {question.explanation}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </section>

                        <div className="flex gap-3 mt-4">
                            <button onClick={prevStep} className="flex-1 h-12 border border-gray-100 font-bold rounded-xl hover:bg-gray-50">Back</button>
                            <button
                                onClick={handleNext}
                                disabled={!currentResponse || (Array.isArray(currentResponse) && currentResponse.length === 0)}
                                className="flex-[2] h-12 bg-[#003787] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
                            >
                                {currentQuestionIndex === questions.length - 1 ? "Complete Setup" : "Next"}
                            </button>
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

                <div className="relative w-full md:max-w-[480px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                    {/* Sidebar Header */}
                    <div className="h-20 px-6 md:px-8 flex items-center justify-between border-b border-gray-50">
                        <button onClick={step === 0 ? onClose : prevStep} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-lg transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                            </svg>
                        </button>
                        <h2 className="text-[17px] font-bold text-gray-900">
                            {step === 0 ? "Create a new tax filing" : "Let's get you set up"}
                        </h2>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-lg transition-colors md:invisible">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>

                    {/* Sidebar Content */}
                    <div className="flex-1 overflow-y-auto px-6 md:px-8 py-8 custom-scrollbar">
                        {renderStep()}
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-taxable-dark/40 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)} />
                    <div className="relative bg-white rounded-[24px] w-full max-w-[440px] h-auto min-h-[324px] p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            {/* Logo Icon Container */}
                            <div className="w-12 h-12 rounded-xl bg-[#F5F5F3] flex items-center justify-center flex-shrink-0">
                                <Image src="/logo_black.svg" alt="Taxable" width={24} height={24} />
                            </div>

                            {/* Text Content */}
                            <div className="text-left">
                                <h2 className="text-xl font-semibold text-taxable-dark mb-2.5">Tax folder created</h2>
                                <p className="text-sm text-taxable-dark font-medium leading-[1.5] mb-3">
                                    We've created a dedicated space for your {selections.taxYear} {selections.category} Tax filing. Think of this as your personal tax workspace - everything you need will be organized here.
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
                                    fetchBaseQuestions();
                                }}
                                disabled={loadingQuestions}
                                className="flex-1 h-12 bg-[#003787] text-white text-sm font-semibold rounded-xl hover:opacity-90 shadow-lg shadow-[#003787]/10 transition-all px-4 text-center disabled:opacity-50"
                            >
                                {loadingQuestions ? "Loading..." : "Answer Setup Questions"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isSubmitting && (
                <LoadingScreen
                    onComplete={handleLoadingFinished}
                    title={`Creating your ${selections.taxYear} ${selections.category} Tax workspace...`}
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
