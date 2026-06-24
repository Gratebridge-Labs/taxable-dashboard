'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout/OnboardingLayout';
import { useApi } from '@/hooks/useApi';
import { useUser } from '@/contexts/UserContext';
import { useFormEntrance } from '@/hooks/useFormEntrance';
import { OtpInput } from '@/components/ui/otp-input';
import { Spinner } from '@/components/ui/spinner';

export default function Verify2FA() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useUser();
    const { post, error: apiError } = useApi();
    const formRef = useFormEntrance<HTMLDivElement>({ stagger: 0.04 });

    const email = searchParams.get('email') || '';
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async (code?: string) => {
        const otpCode = code || otp.join('');
        if (otpCode.length < 6 || isLoading) return;

        setIsLoading(true);
        try {
            const storedEmail = sessionStorage.getItem('taxable_temp_email');
            const storedPassword = sessionStorage.getItem('taxable_temp_password');

            const response = await post('/auth/login', {
                email: storedEmail || email,
                password: storedPassword,
                twoFactorCode: otpCode
            }, { useToken: false });

            if (response?.data?.token) {
                login(response.data.token, response.data.user);
                router.push('/home');

                sessionStorage.removeItem('taxable_temp_email');
                sessionStorage.removeItem('taxable_temp_password');
            } else {
                setIsLoading(false);
            }
        } catch (err) {
            console.error("2FA Verification failed:", err);
            setIsLoading(false);
        }
    };

    return (
        <>
            <OnboardingLayout>
                <div className="flex-1 flex flex-col justify-center relative">
                    <div ref={formRef} className="max-w-[420px] w-full mx-auto">
                        <div className="mb-10">
                            <h2 data-animate className="text-7 font-bold text-taxable-dark mb-1 tracking-[-0.02em]">Two-Factor Authentication</h2>
                            <p data-animate className="text-neutral-400 text-2 leading-relaxed font-medium tracking-[-0.01em]">
                                Please enter the 6-digit code from your authenticator app to secure your account.
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
                                className="btn-auth w-full h-12 bg-taxable-blue text-white font-semibold rounded-xl disabled:bg-neutral-100 disabled:text-neutral-400 text-3 flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Spinner /> : "Verify & Sign In"}
                            </button>

                            <div className="text-center text-2">
                                <Link href="/signin" className="text-neutral-800 font-bold">
                                    Back to Login
                                </Link>
                            </div>
                            </div>
                        </form>
                    </div>
                </div>
            </OnboardingLayout>
        </>
    );
}
