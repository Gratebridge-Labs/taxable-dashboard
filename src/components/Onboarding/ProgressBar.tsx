import React from 'react';

interface ProgressBarProps {
    currentStep: number;
    totalSteps?: number;
}

export default function ProgressBar({ currentStep, totalSteps = 4 }: ProgressBarProps) {
    return (
        <div className="flex gap-2 mb-8 md:mb-12">
            {Array.from({ length: totalSteps }).map((_, index) => {
                const stepNum = index + 1;
                const isActive = stepNum <= currentStep;
                return (
                    <div
                        key={index}
                        className={`h-1.5 w-12 rounded-full transition-colors ${isActive ? 'bg-taxable-alert' : 'bg-neutral-100'
                            }`}
                    />
                );
            })}
        </div>
    );
}
