'use client';
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout/OnboardingLayout';
import LoadingScreen from '@/screens/Onboarding/LoadingScreen';
import { useApi } from '@/hooks/useApi';
import { useUser } from '@/contexts/UserContext';

export default function Verify2FA() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useUser();
    const { post, error: apiError } = useApi();

    const email = searchParams.get('email') || '';
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
            const storedEmail = sessionStorage.getItem('taxable_temp_email');
            const storedPassword = sessionStorage.getItem('taxable_temp_password');

            const response = await post('/auth/login', {
                email: storedEmail || email,
                password: storedPassword,
                twoFactorCode: code
            }, { useToken: false });

            if (response?.data?.token) {
                // Successful 2FA Login
                login(response.data.token, response.data.user);

                // Cleanup temporary storage
                sessionStorage.removeItem('taxable_temp_email');
                sessionStorage.removeItem('taxable_temp_password');
                sessionStorage.removeItem('taxable_temp_token');
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
                    <div className="max-w-[480px] w-full mx-auto">
                        <div className="mb-10">
                            <h2 className="text-[26px] font-bold text-taxable-dark mb-2.5">Two-Factor Authentication</h2>
                            <p className="text-taxable-gray text-[15px] leading-relaxed font-medium">
                                Please enter the 6-digit code from your authenticator app to secure your account.
                            </p>
                        </div>

                        <form onSubmit={handleVerify} className="flex flex-col gap-10">
                            <div className="flex gap-3 justify-between">
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
                                        className="w-14 h-14 md:w-16 md:h-16 text-center text-2xl font-bold bg-[#F9FBFC] border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-taxable-blue/10 focus:border-taxable-blue transition-all"
                                    />
                                ))}
                            </div>

                            {apiError && (
                                <div className="text-sm text-red-500 font-medium -mt-6">
                                    {apiError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={otp.some(d => !d) || isLoading}
                                className="w-full h-[54px] bg-taxable-blue text-white font-bold rounded-2xl shadow-lg shadow-taxable-blue/10 hover:opacity-95 disabled:opacity-50 transition-all text-[15px] flex items-center justify-center gap-2"
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
                                    "Verify & Sign In"
                                )}
                            </button>

                            <div className="text-center text-[15px]">
                                <Link href="/signin" className="text-taxable-blue font-bold hover:underline">
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </OnboardingLayout>

            {isLoading && (
                <LoadingScreen
                    onComplete={() => router.push('/home')}
                    title="Verifying 2FA..."
                    steps={[
                        { text: "Validating security code" },
                        { text: "Securing your session" },
                        { text: "Preparing your dashboard" }
                    ]}
                />
            )}
        </>
    );
}
