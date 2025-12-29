'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout/OnboardingLayout';
import ProgressBar from '@/components/Onboarding/ProgressBar';
import OptionCard from '@/components/Onboarding/OptionCard';
import LoadingScreen from './LoadingScreen';

export default function Step4() {
    const router = useRouter();
    const [selections, setSelections] = useState<string[]>(['Monthly']);
    const [isLoading, setIsLoading] = useState(false);

    const toggleSelection = (option: string) => {
        setSelections([option]);
    };

    const handleGetStarted = () => {
        setIsLoading(true);
    };

    const options = [
        {
            label: 'Monthly',
            description: 'Keep running totals all year',
            badge: 'Recommended'
        },
        {
            label: 'Annually',
            description: 'Enter everything at once'
        },
        {
            label: 'Not sure yet',
            description: 'Enter everything at once'
        }
    ];

    return (
        <>
            <OnboardingLayout>
                <div className="max-w-xl mx-auto w-full">
                    <h2 className="text-lg font-medium text-taxable-dark mb-2">Let's personalize Taxable for you</h2>
                    <ProgressBar currentStep={4} />

                    <h3 className="text-base font-medium text-taxable-dark mb-4">How do you prefer to track your taxes?</h3>

                    <div className="flex flex-col gap-1 mb-8">
                        {options.map((option) => (
                            <OptionCard
                                key={option.label}
                                label={option.label}
                                description={option.description}
                                badge={option.badge}
                                isSelected={selections.includes(option.label)}
                                onChange={() => toggleSelection(option.label)}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleGetStarted}
                        className="flex items-center justify-center w-full h-11 bg-taxable-blue hover:opacity-90 text-white font-medium rounded-lg shadow-lg shadow-taxable-blue/10 transition-transform active:scale-[0.99]"
                    >
                        Get Started
                    </button>
                </div>
            </OnboardingLayout>

            {isLoading && (
                <LoadingScreen onComplete={() => router.push('/home')} />
            )}
        </>
    );
}
