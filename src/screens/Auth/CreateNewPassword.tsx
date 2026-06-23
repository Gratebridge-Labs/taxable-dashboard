"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout/OnboardingLayout';
import LoadingScreen from '@/screens/Onboarding/LoadingScreen';
import { useApi } from '@/hooks/useApi';

const InputField = ({ label, placeholder, type: _type = "password", value, onChange }: { label: string; placeholder: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="flex flex-col gap-3 w-full">
            <label className="text-3 font-bold text-taxable-dark">
                {label}
            </label>
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full h-14 px-4 pr-12 rounded-[12px] border border-neutral-100 bg-white placeholder:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-taxable-blue/20 focus:border-taxable-blue/20 transition-all font-medium"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {showPassword ? (
                            <>
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                            </>
                        ) : (
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        )}
                        {!showPassword && <circle cx="12" cy="12" r="3" />}
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default function CreateNewPassword() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { post, error: apiError } = useApi();

    const email = searchParams.get('email') || '';
    const resetToken = searchParams.get('token') || '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || password !== confirmPassword) return;

        setIsLoading(true);
        const response = await post('/auth/reset-password', {
            newPassword: password,
            resetToken,
            email
        }, { useToken: false });

        if (!response) {
            setIsLoading(false);
        }
    };

    return (
        <>
            <OnboardingLayout>
                <div className="max-w-[440px] mx-auto w-full px-4">
                    <div className="mb-10 text-left">
                        <h2 className="text-2xl font-medium text-taxable-dark mb-3">Create a new password</h2>
                        <p className="text-taxable-gray text-3 font-medium">Choose a strong password for your account.</p>
                    </div>

                    <form className="space-y-8" onSubmit={handleSubmit}>
                        <div className="space-y-3">
                            <InputField
                                label="Password"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <div className="flex items-center gap-2 text-2 text-taxable-gray font-medium">
                                <div className="w-4 h-4 rounded-full bg-neutral-400 flex items-center justify-center">
                                    <span className="text-[10px] text-white font-bold italic">i</span>
                                </div>
                                <span>At least 8 characters. Make it strong!</span>
                            </div>
                        </div>

                        <InputField
                            label="Confirm new password"
                            placeholder="••••••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        {apiError && (
                            <p className="text-sm text-red-500 font-medium -mt-4">{apiError}</p>
                        )}

                        <button
                            type="submit"
                            disabled={!password || password !== confirmPassword || isLoading}
                            className="w-full h-14 bg-taxable-blue text-white font-bold rounded-xl shadow-lg shadow-taxable-blue/10 hover:opacity-95 disabled:opacity-50 transition-all mt-6"
                        >
                            Reset Password
                        </button>
                    </form>
                </div>
            </OnboardingLayout>

            {isLoading && (
                <LoadingScreen
                    onComplete={() => router.push('/signin')}
                    title="Resetting your password..."
                    steps={[
                        { text: "Updating your security credentials" },
                        { text: "Securing your account" },
                        { text: "Redirecting to login" }
                    ]}
                />
            )}
        </>
    );
}
