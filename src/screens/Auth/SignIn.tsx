"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout/OnboardingLayout';
import LoadingScreen from '@/screens/Onboarding/LoadingScreen';

const InputField = ({ label, placeholder, type = "text", value, onChange }: { label: string; placeholder: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
        <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-taxable-dark">
                {label}
            </label>
            <div className="relative">
                <input
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-taxable-blue/20 focus:border-taxable-blue transition-all"
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                        {showPassword ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

const ResetPasswordModal = ({ email, onClose, onResend }: { email: string; onClose: () => void; onResend: () => void }) => (
    <div className="fixed inset-0 z-[60] flex items-end justify-end p-8 pointer-events-none">
        <div className="fixed inset-0 bg-taxable-dark/20 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
        <div
            className="relative w-[440px] h-[237px] bg-white rounded-[24px] shadow-2xl p-8 flex flex-col justify-between pointer-events-auto animate-in slide-in-from-bottom-4 duration-300"
        >
            <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF1EB] flex items-center justify-center flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                </div>
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold text-taxable-dark">Check your email</h3>
                    <p className="text-sm text-taxable-gray leading-relaxed">
                        We've sent a password reset link to <span className="text-taxable-dark font-medium underline">[{email || 'email@example.com'}]</span>
                    </p>
                    <p className="text-sm text-taxable-gray mt-1">
                        Didn't receive it? <button onClick={onResend} className="text-taxable-blue font-semibold hover:underline">Resend</button>
                    </p>
                </div>
            </div>

            <button
                onClick={onClose}
                className="w-full h-12 border border-gray-200 rounded-xl font-semibold text-taxable-dark hover:bg-gray-50 transition-colors"
            >
                Close
            </button>
        </div>
    </div>
);

import { useApi } from '@/hooks/useApi';
import { useUser } from '@/contexts/UserContext';

export default function SignIn() {
    const router = useRouter();
    const { login } = useUser();
    const { post, error: apiError } = useApi();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showResetModal, setShowResetModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Login user via API using the established pattern
            const response = await post('/auth/login', { email, password }, { useToken: false });

            if (response?.data?.token) {
                // Initialize session
                login(response.data.token, response.data.user);
            }
        } catch (err) {
            console.error("Login failed:", err);
            setIsLoading(false);
        }
    };

    return (
        <>
            <OnboardingLayout>
                <div className="max-w-[480px] mx-auto w-full">
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-taxable-dark mb-2">Sign in to Taxable</h2>
                        <p className="text-taxable-gray text-base font-medium">Let's get your tax compliance sorted in minutes</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <InputField
                            label="Email Address"
                            placeholder="hello@alignui.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <div className="space-y-1">
                            <InputField
                                label="Password"
                                placeholder="••••••••••••"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <div className="text-[13px] text-taxable-gray font-medium">
                                Forgot your password? <button type="button" onClick={() => setShowResetModal(true)} className="text-taxable-blue font-semibold hover:underline">Reset it here</button>
                            </div>
                        </div>

                        {apiError && (
                            <div className="text-sm text-red-500 font-medium">
                                {apiError}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full h-12 bg-taxable-blue text-white font-semibold rounded-xl shadow-lg shadow-taxable-blue/20 hover:opacity-95 transition-all mt-4"
                        >
                            Sign In
                        </button>

                        <div className="text-center text-[14px] text-taxable-gray font-medium mt-6">
                            Don't have an account? <Link href="/signup" className="text-taxable-blue font-semibold hover:underline">Create one</Link>
                        </div>
                    </form>
                </div>

            </OnboardingLayout>

            {isLoading && (
                <LoadingScreen
                    onComplete={() => router.push('/home')}
                    title="Signing you in..."
                    subtitle=""
                />
            )}

            {showResetModal && (
                <ResetPasswordModal
                    email={email}
                    onClose={() => setShowResetModal(false)}
                    onResend={() => console.log('Resending email...')}
                />
            )}
        </>
    );
}
