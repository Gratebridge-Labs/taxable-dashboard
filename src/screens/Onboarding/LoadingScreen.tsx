'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const CheckIcon = () => (
    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
        <svg width="12" height="9" viewBox="0 0 12 9" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 5 4 8 11 1" />
        </svg>
    </div>
);

const SpinnerIcon = () => (
    <div className="w-5 h-5 flex-shrink-0 animate-spin">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white/60">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 30" />
        </svg>
    </div>
);

const LoadingItem = ({ text, status }: { text: string; status: 'pending' | 'loading' | 'completed' }) => {
    return (
        <div className="flex items-center gap-3 py-2 transition-all duration-500">
            {status === 'completed' ? (
                <CheckIcon />
            ) : status === 'loading' ? (
                <SpinnerIcon />
            ) : (
                <div className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0" />
            )}
            <span className={`text-lg font-medium transition-colors duration-500 ${status === 'completed' ? 'text-white' : status === 'loading' ? 'text-white' : 'text-white/40'}`}>
                {text} {status === 'completed' && text === 'Deductions schedule' ? 'ready' : ''}
            </span>
        </div>
    );
};

interface LoadingScreenProps {
    onComplete?: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setStep((prev) => {
                if (prev >= 3) {
                    clearInterval(timer);
                    return prev;
                }
                return prev + 1;
            });
        }, 3000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (step === 3 && onComplete) {
            const finalRedirect = setTimeout(() => {
                onComplete();
            }, 1000);
            return () => clearTimeout(finalRedirect);
        }
    }, [step, onComplete]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
            {/* Blurred Background Mockup */}
            <div className="absolute inset-0 bg-[#0D1B2A80] backdrop-blur-[28px]" />

            <div className="relative z-10 flex flex-col items-center">
                {/* Logo Container */}
                <div className="mb-12 flex flex-col items-center">
                    <div className="relative w-24 h-24">
                        <Image
                            src="/logo.svg"
                            alt="Taxable"
                            fill
                            className="object-contain brightness-0 invert opacity-80"
                        />
                    </div>
                </div>

                <div className="w-full max-w-sm px-8">
                    <h2 className="text-2xl font-semibold text-white mb-6">Building your tax profile...</h2>

                    <div className="space-y-1">
                        <LoadingItem
                            text="Persona categorized"
                            status={step > 0 ? 'completed' : step === 0 ? 'loading' : 'pending'}
                        />
                        <LoadingItem
                            text="Exemption logic applied"
                            status={step > 1 ? 'completed' : step === 1 ? 'loading' : 'pending'}
                        />
                        <LoadingItem
                            text="Deductions schedule"
                            status={step > 2 ? 'completed' : step === 2 ? 'loading' : 'pending'}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
