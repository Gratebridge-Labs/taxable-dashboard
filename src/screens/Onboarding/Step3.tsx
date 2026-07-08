'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout/OnboardingLayout';
import ProgressBar from '@/components/Onboarding/ProgressBar';
import OptionCard from '@/components/Onboarding/OptionCard';
import { useOnboarding } from '@/contexts/OnboardingContext';

export default function Step3() {
    const router = useRouter();
    const { data, setLifeAnswers } = useOnboarding();
    const [selections, setSelections] = useState<string[]>(
        data.lifeAnswers.length > 0 ? data.lifeAnswers : ['I contribute to a pension plan', 'I pay for health insurance (NHIS)']
    );

    const toggleSelection = (option: string) => {
        if (option === 'None of these apply') {
            if (selections.includes('None of these apply')) {
                setSelections([]);
            } else {
                setSelections(['None of these apply']);
            }
            return;
        }

        setSelections(prev => {
            const newSelection = prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option];
            return newSelection.filter(item => item !== 'None of these apply');
        });
    };

    const handleNext = () => {
        setLifeAnswers(selections);
        router.push('/onboarding/step4');
    };

    const options = [
        { label: 'I contribute to a pension plan' },
        { label: 'I pay for health insurance (NHIS)' },
        { label: 'I have life insurance' },
        { label: 'I pay rent' },
        { label: 'I have dependents (children, etc.)' },
        { label: 'None of these apply' }
    ];

    return (
        <OnboardingLayout>
            <div className="max-w-xl mx-auto w-full">
                <h2 className="text-7 font-medium text-taxable-dark mb-2">Let's personalize Taxable for you</h2>
                <ProgressBar currentStep={3} />

                <h3 className="text-5 font-medium text-taxable-dark mb-4">Do any of these apply to you?</h3>

                <div className="flex flex-col gap-1 mb-8">
                    {options.map((option) => (
                        <OptionCard
                            key={option.label}
                            label={option.label}
                            isSelected={selections.includes(option.label)}
                            onChange={() => toggleSelection(option.label)}
                        />
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    className="w-full h-12 bg-taxable-blue text-white font-semibold rounded-xl"
                >
                    Next
                </button>
            </div>
        </OnboardingLayout>
    );
}
