"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout/OnboardingLayout';
import LoadingScreen from '@/screens/Onboarding/LoadingScreen';

const InputField = ({ label, placeholder, type = "password", value, onChange }: { label: string; placeholder: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div className="flex flex-col gap-1 w-full">
        <label className="text-sm font-medium text-taxable-dark">
            {label}
        </label>
        <div className="relative">
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full h-12 px-4 pr-10 rounded-2xl border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-taxable-blue/20 focus:border-taxable-blue transition-all"
            />
            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            </button>
        </div>
    </div>
);

export default function CreateNewPassword() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
    };

    return (
        <>
            <OnboardingLayout>
                <div className="max-w-[480px] mx-auto w-full">
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-taxable-dark mb-2">Create a new password</h2>
                        <p className="text-taxable-gray text-base font-medium">Choose a strong password for your account.</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-1">
                            <InputField
                                label="Password"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <div className="flex items-center gap-2 text-[13px] text-taxable-gray font-medium">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <span>At least 8 characters. Make it strong!</span>
                            </div>
                        </div>

                        <InputField
                            label="Confirm new password"
                            placeholder="••••••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        <button
                            type="submit"
                            className="w-full h-12 bg-taxable-blue text-white font-semibold rounded-xl shadow-lg shadow-taxable-blue/20 hover:opacity-95 transition-all mt-4"
                        >
                            Reset Password
                        </button>
                    </form>
                </div>
            </OnboardingLayout>

            {isLoading && (
                <LoadingScreen
                    onComplete={() => router.push('/home')}
                    title="Resetting your password..."
                    steps={[
                        { text: "Updating your security credentials" },
                        { text: "Securing your account" },
                        { text: "Redirecting to your workspace" }
                    ]}
                />
            )}
        </>
    );
}
