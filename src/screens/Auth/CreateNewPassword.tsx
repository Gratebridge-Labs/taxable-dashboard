'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout/OnboardingLayout';
import { useApi } from '@/hooks/useApi';
import { useFormEntrance } from '@/hooks/useFormEntrance';
import { PasswordInput } from '@/components/ui/password-input';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

export default function CreateNewPassword() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { post, error: apiError } = useApi();
    const formRef = useFormEntrance<HTMLDivElement>({ stagger: 0.04 });

    const email = searchParams.get('email') || '';
    const resetToken = searchParams.get('token') || '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || password !== confirmPassword || isLoading) return;

        setIsLoading(true);
        try {
            const response = await post('/auth/reset-password', {
                newPassword: password,
                resetToken,
                email
            }, { useToken: false });

            if (response) {
                toast.success('Password reset successfully');
                router.push('/signin');
            } else {
                setIsLoading(false);
            }
        } catch (err: unknown) {
            console.error('Reset password failed:', err instanceof Error ? err.message : 'Unknown error');
            setIsLoading(false);
        }
    };

    return (
        <>
            <OnboardingLayout>
                <div ref={formRef} className="max-w-[420px] mx-auto w-full px-4">
                    <div className="mb-10 text-left">
                        <h2 data-animate className="text-7 font-semibold text-neutral-800 mb-1 tracking-[-0.02em]">Create a new password</h2>
                        <p data-animate className="text-neutral-400 text-2 font-medium tracking-[-0.01em]">Choose a strong password for your account.</p>
                    </div>

                    <form className="space-y-10" onSubmit={handleSubmit}>
                        <div data-animate className="space-y-3">
                            <PasswordInput
                                label="Password"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                hint="At least 8 characters. Make it strong!"
                            />
                        </div>

                        <div data-animate>
                            <PasswordInput
                                label="Confirm new password"
                                placeholder="••••••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        {apiError && (
                            <p data-animate className="text-2 text-destructive font-medium">{apiError}</p>
                        )}

                        <div data-animate>
                            <button
                                type="submit"
                                disabled={!password || password !== confirmPassword}
                                className="w-full h-12 bg-taxable-blue text-white font-semibold rounded-xl disabled:bg-neutral-100 disabled:text-neutral-400 text-3 flex items-center justify-center"
                            >
                                {isLoading ? <Spinner /> : "Reset Password"}
                            </button>
                        </div>
                    </form>
                </div>
            </OnboardingLayout>
        </>
    );
}
