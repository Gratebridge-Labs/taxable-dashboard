'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import OnboardingLayout from '@/components/OnboardingLayout/OnboardingLayout';
import ProgressBar from '@/components/Onboarding/ProgressBar';
import OptionCard from '@/components/Onboarding/OptionCard';

export default function Step3() {
    const [selections, setSelections] = useState<string[]>(['I contribute to a pension plan', 'I pay for health insurance (NHIS)']);

    const toggleSelection = (option: string) => {
        // Logic: If 'None of these apply' is selected, clear others. If other is selected, clear 'None'.
        if (option === 'None of these apply') {
            if (selections.includes('None of these apply')) {
                setSelections([]); // deselecting none
            } else {
                setSelections(['None of these apply']); // selecting none clears others
            }
            return;
        }

        // Selecting a normal option
        setSelections(prev => {
            const newSelection = prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option];
            // Ensure 'None' is removed if we select something else
            return newSelection.filter(item => item !== 'None of these apply');
        });
    };

    const options = [
        {
            label: 'I contribute to a pension plan'
        },
        {
            label: 'I pay for health insurance (NHIS)'
        },
        {
            label: 'I have life insurance'
        },
        {
            label: 'I pay rent'
        },
        {
            label: 'I have dependents (children, etc.)'
        },
        {
            label: 'None of these apply'
        }
    ];

    return (
        <OnboardingLayout>
            <div className="max-w-xl mx-auto w-full">
                <h2 className="text-lg font-medium text-taxable-dark mb-2">Let's personalize Taxable for you</h2>
                <ProgressBar currentStep={3} />

                <h3 className="text-base font-medium text-taxable-dark mb-4">Do any of these apply to you?</h3>

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

                <Link href="/onboarding/step4" className="flex items-center justify-center w-full h-11 bg-taxable-blue hover:opacity-90 text-white font-medium rounded-lg shadow-lg shadow-taxable-blue/10 transition-transform active:scale-[0.99]">
                    Next
                </Link>
            </div>
        </OnboardingLayout>
    );
}
