'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout/OnboardingLayout';
import ProgressBar from '@/components/Onboarding/ProgressBar';
import OptionCard from '@/components/Onboarding/OptionCard';
import LoadingScreen from './LoadingScreen';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useTaxableApi } from '@/lib';

const FILING_TYPES: Record<string, 'Individual' | 'Business'> = {
    'Individual / Freelancer': 'Individual',
    'Joint Filing (Spousal)': 'Individual',
    'Corporate Entity (LLC/Ltd)': 'Business',
    'Registered Enterprise': 'Business',
    'Tax Practitioner / Accountant': 'Business',
    'Trust or Estate': 'Business',
};

export default function Step4() {
    const router = useRouter();
    const { data, setFilingPreference, clearData } = useOnboarding();
    const { fetchProfiles } = useProfile();
    const { createProfile, completeProfile } = useTaxableApi();
    
    const [selections, setSelections] = useState<string[]>(
        data.year === 2025 ? ['Annually'] : (data.filingPreference ? [data.filingPreference.charAt(0).toUpperCase() + data.filingPreference.slice(1)] : ['Monthly'])
    );
    const [yearToUse] = useState(data.year || new Date().getFullYear());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleSelection = (option: string) => {
        setSelections([option]);
        setFilingPreference(option.toLowerCase() as 'monthly' | 'annual');
    };

    const handleGetStarted = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const profileType = FILING_TYPES[data.filingType] || 'Individual';
            
            const createdProfile = await createProfile(yearToUse, profileType);
            
            if (createdProfile && createdProfile.profileId) {
                await completeProfile(createdProfile.profileId, {
                    primaryIncomeSources: data.incomeSources,
                    filingPreference: yearToUse === 2025 ? 'annual' : data.filingPreference,
                });
                
                await fetchProfiles();
                clearData();
                
                setTimeout(() => {
                    router.push('/tax-folders');
                }, 100);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to create profile');
            setIsLoading(false);
        }
    };

    const options = [
        {
            label: 'Monthly',
            description: 'Keep running totals all year',
            badge: 'Recommended',
            disabled: yearToUse === 2025
        },
        {
            label: 'Annually',
            description: 'Enter everything at once'
        },
        {
            label: 'Not sure yet',
            description: 'Enter everything at once',
            disabled: yearToUse === 2025
        }
    ].filter(opt => !opt.disabled);

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

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleGetStarted}
                        disabled={isLoading}
                        className="flex items-center justify-center w-full h-11 bg-taxable-blue hover:opacity-90 text-white font-medium rounded-lg shadow-lg shadow-taxable-blue/10 transition-transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Creating Profile...' : 'Get Started'}
                    </button>
                </div>
            </OnboardingLayout>

            {isLoading && (
                <LoadingScreen onComplete={() => router.push('/tax-folders')} />
            )}
        </>
    );
}