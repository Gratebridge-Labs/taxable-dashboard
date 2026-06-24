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
            <span className={`text-5 font-medium transition-colors duration-500 ${status === 'completed' ? 'text-white' : status === 'loading' ? 'text-white' : 'text-white/40'}`}>
                {text} {status === 'completed' && text === 'Deductions schedule' ? 'ready' : ''}
            </span>
        </div>
    );
};

interface LoadingStep {
    text: string;
}

interface LoadingScreenProps {
    onComplete?: () => void;
    title?: string;
    subtitle?: string;
    steps?: LoadingStep[];
}

export default function LoadingScreen({ onComplete, title, subtitle, steps }: LoadingScreenProps) {
    const defaultSteps = [
        { text: "Persona categorized" },
        { text: "Exemption logic applied" },
        { text: "Deductions schedule" }
    ];

    const activeSteps = steps || defaultSteps;
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setStep((prev) => {
                if (prev >= activeSteps.length) {
                    clearInterval(timer);
                    return prev;
                }
                return prev + 1;
            });
        }, 3000);

        return () => clearInterval(timer);
    }, [activeSteps.length]);

    useEffect(() => {
        if (step === activeSteps.length && onComplete) {
            const finalRedirect = setTimeout(() => {
                onComplete();
            }, 1000);
            return () => clearTimeout(finalRedirect);
        }
    }, [step, onComplete, activeSteps.length]);

    const isCustomMode = !!title;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
            {/* Blurred Background Mockup */}
            <div className="absolute inset-0 bg-taxable-dark/40 backdrop-blur-[28px]" />

            <div className="relative z-10 flex flex-col items-center text-center">
                {/* Logo Container */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="relative w-24 h-24">
                        <Image
                            src="/logo.svg"
                            alt="Taxable"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                <div className="w-full max-w-sm px-8">
                    <h2 className="text-2xl font-semibold text-white mb-4">
                        {title || "Building your tax profile..."}
                    </h2>

                    {isCustomMode && !steps ? (
                        subtitle ? (
                            <p className="text-white/80 font-medium">
                                {subtitle}
                            </p>
                        ) : null
                    ) : (
                        <div className="space-y-1 text-left">
                            {activeSteps.map((s, i) => (
                                <LoadingItem
                                    key={i}
                                    text={s.text}
                                    status={step > i ? 'completed' : step === i ? 'loading' : 'pending'}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
