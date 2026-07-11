'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout/OnboardingLayout';
import { useApi } from '@/hooks/useApi';
import { useUser } from '@/contexts/UserContext';
import { useFormEntrance } from '@/hooks/useFormEntrance';
import { OtpInput } from '@/components/ui/otp-input';
import { Spinner } from '@/components/ui/spinner';

export default function VerifyOTP() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useUser();
    const { post, error: apiError } = useApi();
    const formRef = useFormEntrance<HTMLDivElement>({ stagger: 0.04 });

    const email = searchParams.get('email') || '';
    const type = searchParams.get('type') || 'signup';
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [isLoading, setIsLoading] = useState(false);

    const canResend = timer === 0;

    useEffect(() => {
        if (timer === 0) return;
        const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const handleVerify = async (code?: string) => {
        const otpCode = code || otp.join('');
        if (otpCode.length < 6 || isLoading) return;

        setIsLoading(true);
        try {
            if (type === 'reset') {
                const response = await post('/auth/verify-reset-otp', { email, code: otpCode }, { useToken: false });
                if (response?.data?.resetToken) {
                    router.push(`/create-new-password?email=${encodeURIComponent(email)}&token=${response.data.resetToken}`);
                } else {
                    setIsLoading(false);
                }
            } else {
                const response = await post('/auth/verify-otp', { email, code: otpCode }, { useToken: false });
                if (response?.data?.token) {
                    login(response.data.token, response.data.user);
                    router.push('/home');
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
                        <Link href="/signin" className="px-4 md:px-5 py-2 md:py-2.5 rounded-xl border border-neutral-200 text-neutral-800 font-semibold bg-white text-1 md:text-2 whitespace-nowrap">
                            Log in
                        </Link>
                    </div>

                    <div ref={formRef} className="max-w-[420px] w-full mx-auto px-4 md:px-0">
                        <div className="mb-10">
                            <h2 data-animate className="text-6 md:text-7 font-semibold text-neutral-800 mb-1 tracking-[-0.02em]">Enter Verification Code</h2>
                            <p data-animate className="text-neutral-400 text-2 leading-relaxed font-medium tracking-[-0.01em]">
                                We&apos;ve sent a verification code to your mail<br />
                                <span className="text-neutral-800 font-semibold">{email}</span>
                            </p>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} className="flex flex-col gap-10">
                            <div data-animate>
                                <OtpInput
                                    value={otp}
                                    onChange={setOtp}
                                    onComplete={handleVerify}
                                    error={apiError}
                                />
                            </div>

                            <div data-animate className="flex flex-col gap-3 items-center">
                            <button
                                type="submit"
                                disabled={otp.some(d => !d)}
                                className="w-full h-12 bg-taxable-blue text-white font-semibold rounded-xl disabled:bg-neutral-100 disabled:text-neutral-400 text-3 flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Spinner /> : "Verify"}
                            </button>

                            <div className="text-center text-2">
                                <span className="text-neutral-400 font-medium">Did not receive mail? </span>
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    className={`font-semibold transition-colors ${canResend ? 'text-neutral-800' : 'text-neutral-400 opacity-50 cursor-not-allowed'}`}
                                >
                                    Resend {!canResend && `(${timer}s)`}
                                </button>
                            </div>
                            </div>
                        </form>
                    </div>
                </div>
            </OnboardingLayout>
        </>
    );
}
