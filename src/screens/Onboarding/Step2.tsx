'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import OnboardingLayout from '@/components/OnboardingLayout/OnboardingLayout';
import ProgressBar from '@/components/Onboarding/ProgressBar';
import OptionCard from '@/components/Onboarding/OptionCard';
import { useOnboarding } from '@/contexts/OnboardingContext';

export default function Step2() {
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
                <h2 className="text-lg font-medium text-taxable-dark mb-2">Let's personalize Taxable for you</h2>
                <ProgressBar currentStep={2} />

                <h3 className="text-base font-medium text-taxable-dark mb-4">What's your primary income source?</h3>

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

                <Link 
                    href="/onboarding/step3" 
                    className={`flex items-center justify-center w-full h-11 font-medium rounded-lg shadow-lg transition-transform active:scale-[0.99] ${
                        isValid 
                            ? 'bg-taxable-blue hover:opacity-90 text-white shadow-taxable-blue/10' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    onClick={(e) => {
                        if (!isValid) e.preventDefault();
                        else handleNext();
                    }}
                >
                    Next
                </Link>
            </div>
        </OnboardingLayout>
    );
}