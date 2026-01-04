'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout/OnboardingLayout';
import { useApi } from '@/hooks/useApi';

const Modal = ({ isOpen, onClose, email, onResend }: { isOpen: boolean; onClose: () => void; email: string; onResend: () => void }) => {
    if (!isOpen) return null;

    return (
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
                        <h3 className="text-[17px] font-bold text-taxable-dark">Check your email</h3>
                        <p className="text-[13px] text-taxable-gray leading-relaxed font-medium">
                            We've sent a password reset link to <span className="text-taxable-dark font-bold underline">[{email}]</span>
                        </p>
                        <p className="text-[13px] text-taxable-gray mt-1 font-medium">
                            Didn't receive it? <button onClick={onResend} className="text-taxable-blue font-bold hover:underline">Resend</button>
                        </p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full h-12 border border-gray-200 rounded-xl font-bold text-taxable-dark hover:bg-gray-50 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default function ForgotPassword() {
    const router = useRouter();
    const { post, loading, error: apiError } = useApi();
    const [email, setEmail] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        const response = await post('/auth/forgot-password', { email }, { useToken: false });
        if (response) {
            setIsModalOpen(true);
        }
    };

    const handleResend = async () => {
        await post('/auth/forgot-password', { email }, { useToken: false });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        router.push(`/verify-otp?email=${encodeURIComponent(email)}&type=reset`);
    };

    return (
        <>
            <OnboardingLayout>
                <div className="flex-1 flex flex-col justify-center relative">
                    <div className="absolute top-0 right-0">
                        <Link href="/signin" className="px-5 py-2.5 rounded-xl border border-gray-200 text-taxable-dark font-bold hover:bg-gray-50 transition-colors bg-white text-[13px] whitespace-nowrap shadow-xs">
                            Log in
                        </Link>
                    </div>

                    <div className="max-w-[440px] w-full mx-auto px-4">
                        <div className="mb-10 text-left">
                            <h2 className="text-2xl font-medium text-taxable-dark mb-3">Forgot Password</h2>
                            <p className="text-taxable-gray text-[15px] font-medium leading-relaxed">
                                Enter your registered email address to receive instructions on how to reset your password.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="flex flex-col gap-3">
                                <label className="text-[15px] font-bold text-taxable-dark">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="e.g. hello@taxable.ng"
                                    className="w-full h-14 px-4 rounded-[12px] border border-gray-100 bg-white placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-taxable-blue/20 focus:border-taxable-blue/20 transition-all font-medium"
                                    required
                                />
                            </div>

                            {apiError && (
                                <p className="text-sm text-red-500 font-medium">{apiError}</p>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full h-14 bg-[#003787] text-white font-bold rounded-2xl shadow-lg shadow-[#003787]/10 hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    "Continue"
                                )}
                            </button>

                            <div className="text-center pt-2">
                                <Link href="/signin" className="text-[15px] text-taxable-blue font-bold hover:underline">
                                    Back to login
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </OnboardingLayout>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                email={email}
                onResend={handleResend}
            />
        </>
    );
}
