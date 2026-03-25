'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout/OnboardingLayout';
import LoadingScreen from '@/screens/Onboarding/LoadingScreen';
import { useApi } from '@/hooks/useApi';
import { useUser } from '@/contexts/UserContext';

export default function VerifyOTP() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useUser();
    const { post, error: apiError } = useApi();

    const email = searchParams.get('email') || '';
    const type = searchParams.get('type') || 'signup';
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const canResend = timer === 0;

    useEffect(() => {
        if (timer === 0) return;
        const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value[value.length - 1];

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const code = otp.join('');
        if (code.length < 6) return;

        setIsLoading(true);
        try {
            if (type === 'reset') {
                const response = await post('/auth/verify-reset-otp', { email, code }, { useToken: false });
                if (response?.data?.resetToken) {
                    router.push(`/create-new-password?email=${encodeURIComponent(email)}&token=${response.data.resetToken}`);
                } else {
                    setIsLoading(false);
                }
            } else {
                const response = await post('/auth/verify-otp', { email, code }, { useToken: false });
                if (response?.data?.token) {
                    login(response.data.token, response.data.user);
                } else {
                    setIsLoading(false);
                }
            }
        } catch (err) {
            console.error("Verification failed:", err);
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        try {
            await post('/auth/resend-otp', { email }, { useToken: false });
            setTimer(60);
        } catch (err) {
            console.error("Resend failed:", err);
        }
    };

    return (
        <>
            <OnboardingLayout>
                <div className="flex-1 flex flex-col justify-center relative">
                    <div className="absolute top-0 right-0 -top-2 md:top-0">
                        <Link href="/signin" className="px-4 md:px-5 py-2 md:py-2.5 rounded-xl border border-gray-200 text-taxable-dark font-bold hover:bg-gray-50 transition-colors bg-white text-[12px] md:text-[13px] whitespace-nowrap shadow-xs">
                            Log in
                        </Link>
                    </div>

                    <div className="max-w-[480px] w-full mx-auto px-4 md:px-0">
                        <div className="mb-8 md:mb-10">
                            <h2 className="text-[22px] md:text-[26px] font-bold text-taxable-dark mb-2 md:mb-2.5">Enter Verification Code</h2>
                            <p className="text-taxable-gray text-[14px] md:text-[15px] leading-relaxed font-medium">
                                We&apos;ve sent a verification code to your mail<br />
                                <span className="text-taxable-dark font-bold">{email}</span>
                            </p>
                        </div>

                        <form onSubmit={handleVerify} className="flex flex-col gap-8 md:gap-10">
                            <div className="flex gap-2 md:gap-3 justify-between">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="\d*"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-12 h-12 md:w-16 md:h-16 text-center text-xl md:text-2xl font-bold bg-[#F9FBFC] border border-gray-100 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-taxable-blue/10 focus:border-taxable-blue transition-all"
                                    />
                                ))}
                            </div>

                            {apiError && (
                                <div className="text-sm text-red-500 font-medium -mt-4 md:-mt-6">
                                    {apiError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={otp.some(d => !d) || isLoading}
                                className="w-full h-[48px] md:h-[54px] bg-taxable-blue text-white font-bold rounded-xl md:rounded-2xl shadow-lg shadow-taxable-blue/10 hover:opacity-95 disabled:opacity-50 transition-all text-[14px] md:text-[15px] flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    "Verify"
                                )}
                            </button>

                            <div className="text-center text-[14px] md:text-[15px]">
                                <span className="text-taxable-gray font-medium">Did not receive mail? </span>
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    className={`font-bold transition-colors ${canResend ? 'text-taxable-blue hover:underline' : 'text-taxable-gray opacity-50 cursor-not-allowed'}`}
                                >
                                    Resend {!canResend && `(${timer}s)`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </OnboardingLayout>

            {isLoading && (
                <LoadingScreen
                    onComplete={() => type === 'signup' ? router.push('/home') : null}
                    title={type === 'reset' ? "Verifying code..." : "Verifying your account..."}
                    steps={type === 'reset' ? [
                        { text: "Validating reset code" },
                        { text: "Preparing password reset" }
                    ] : [
                        { text: "Validating security code" },
                        { text: "Securing your workspace" },
                        { text: "Preparing your dashboard" }
                    ]}
                />
            )}
        </>
    );
}
