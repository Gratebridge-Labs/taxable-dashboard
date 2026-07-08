'use client';
import React, { createContext, useContext, useState } from 'react';

interface OnboardingData {
    filingType: string;
    incomeSources: string[];
    lifeAnswers: string[];
    filingPreference: 'monthly' | 'annual';
    year: number;
}

interface OnboardingContextType {
    data: OnboardingData;
    setFilingType: (type: string) => void;
    setIncomeSources: (sources: string[]) => void;
    setLifeAnswers: (answers: string[]) => void;
    setFilingPreference: (pref: 'monthly' | 'annual') => void;
    setYear: (year: number) => void;
    clearData: () => void;
}

const defaultData: OnboardingData = {
    filingType: '',
    incomeSources: [],
    lifeAnswers: [],
    filingPreference: 'monthly',
    year: new Date().getFullYear(),
};

const STORAGE_KEY = 'taxable_onboarding';

const loadFromStorage = (): OnboardingData => {
    if (typeof window === 'undefined') return defaultData;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return { ...defaultData, ...parsed, year: parsed.year || defaultData.year };
        }
    } catch {
        // Corrupt data — clear it
        localStorage.removeItem(STORAGE_KEY);
    }
    return defaultData;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
    const [data, setData] = useState<OnboardingData>(defaultData);

    React.useEffect(() => {
        setData(loadFromStorage());
    }, []);

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
    }, [data]);

    const setFilingType = (type: string) => {
        setData(prev => ({ ...prev, filingType: type }));
    };

    const setIncomeSources = (sources: string[]) => {
        setData(prev => ({ ...prev, incomeSources: sources }));
    };

    const setFilingPreference = (pref: 'monthly' | 'annual') => {
        setData(prev => ({ ...prev, filingPreference: pref }));
    };

    const setLifeAnswers = (answers: string[]) => {
        setData(prev => ({ ...prev, lifeAnswers: answers }));
    };

    const setYear = (year: number) => {
        setData(prev => ({ ...prev, year }));
    };

    const clearData = () => {
        setData(defaultData);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    return (
        <OnboardingContext.Provider
            value={{
                data,
                setFilingType,
                setIncomeSources,
                setLifeAnswers,
                setFilingPreference,
                setYear,
                clearData,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
};

export const useOnboarding = () => {
    const context = useContext(OnboardingContext);
    if (context === undefined) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
};

export default OnboardingContext;