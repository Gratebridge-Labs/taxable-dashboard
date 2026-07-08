'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout/OnboardingLayout';
import ProgressBar from '@/components/Onboarding/ProgressBar';
import OptionCard from '@/components/Onboarding/OptionCard';
import { useOnboarding } from '@/contexts/OnboardingContext';

export default function Step2() {
    const router = useRouter();
    const { data, setIncomeSources } = useOnboarding();
    const [selections, setSelections] = useState<string[]>(data.incomeSources);

    const toggleSelection = (option: string) => {
        setSelections(prev =>
            prev.includes(option)
                ? prev.filter(item => item !== option)
                : [...prev, option]
        );
    };

    const handleNext = () => {
        setIncomeSources(selections);
        router.push('/onboarding/step3');
    };

    const options = [
        {
            label: 'Salary / Employment',
            description: 'Income from a formal employer where PAYE (Pay As You Earn) is deducted at source.'
        },
        {
            label: 'Business/Self-employment',
            description: 'Revenue from a registered or unregistered enterprise, including retail, manufacturing, or trade.'
        },
        {
            label: 'Freelance/Consulting',
            description: 'Professional fees or contract payments, typically subject to Withholding Tax (WHT) deductions.'
        },
        {
            label: 'Investment income',
            description: 'Earnings from dividends, interest from fixed deposits, or capital gains from asset disposals.'
        },
        {
            label: 'Rental income',
            description: 'Revenue generated from the lease of residential, commercial, or industrial properties.'
        },
        {
            label: 'Digital Assets/Crypto',
            description: 'Income from trading or investing in cryptocurrencies and other digital assets.'
        }
    ];

    const isValid = selections.length > 0;

    return (
        <OnboardingLayout>
            <div className="max-w-xl mx-auto w-full">
                <h2 className="text-7 font-medium text-taxable-dark mb-2">Let's personalize Taxable for you</h2>
                <ProgressBar currentStep={2} />

                <h3 className="text-5 font-medium text-taxable-dark mb-4">What's your primary income source?</h3>

                <div className="flex flex-col gap-1 mb-8">
                    {options.map((option) => (
                        <OptionCard
                            key={option.label}
                            label={option.label}
                            description={option.description}
                            isSelected={selections.includes(option.label)}
                            onChange={() => toggleSelection(option.label)}
                        />
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    disabled={!isValid}
                    className="w-full h-12 bg-taxable-blue text-white font-semibold rounded-xl disabled:bg-neutral-100 disabled:text-neutral-400"
                >
                    Next
                </button>
            </div>
        </OnboardingLayout>
    );
}