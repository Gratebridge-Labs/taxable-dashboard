'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout/OnboardingLayout';
import { useApi } from '@/hooks/useApi';
import { useFormEntrance } from '@/hooks/useFormEntrance';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { toast } from "sonner";

export default function ForgotPassword() {
    const router = useRouter();
    const { post, loading, error: apiError } = useApi();
    const formRef = useFormEntrance<HTMLDivElement>({ stagger: 0.04 });
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || loading) return;

        try {
            const response = await post('/auth/forgot-password', { email }, { useToken: false });
            if (response) {
                toast.success("Check your email", {
                    description: `We've sent a password reset link to ${email}`,
                });
                setTimeout(() => {
                    router.push(`/verify-otp?email=${encodeURIComponent(email)}&type=reset`);
                }, 1500);
            }
        } catch (err: unknown) {
            console.error('Forgot password request failed:', err instanceof Error ? err.message : 'Unknown error');
        }
    };

    return (
        <>
            <OnboardingLayout>
                <div className="flex-1 flex flex-col justify-center relative">
                    <div className="absolute top-0 right-0">
                        <Link href="/signin" className="px-5 py-2.5 rounded-xl border border-neutral-200 text-taxable-dark font-bold bg-white text-2 whitespace-nowrap">
                            Log in
                        </Link>
                    </div>

                    <div ref={formRef} className="max-w-[420px] w-full mx-auto px-4">
                        <div className="mb-10 text-left">
                            <h2 data-animate className="text-7 font-medium text-taxable-dark mb-1 tracking-[-0.02em]">Forgot Password</h2>
                            <p data-animate className="text-neutral-400 text-2 font-medium leading-relaxed tracking-[-0.01em]">
                                Enter your registered email address to receive instructions on how to reset your password.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div data-animate className="flex flex-col gap-1">
                                <Label htmlFor="email" className="tracking-[-0.01em]">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="e.g. hello@taxable.ng"
                                    required
                                />
                            </div>

                            {apiError && (
                                <p data-animate className="text-2 text-red-500 font-medium">{apiError}</p>
                            )}

                            <div data-animate className="flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={!email}
                                className="btn-auth w-full h-12 bg-taxable-blue text-white font-semibold rounded-xl disabled:bg-neutral-100 disabled:text-neutral-400 text-3 flex items-center justify-center gap-2"
                            >
                                {loading ? <Spinner /> : "Continue"}
                            </button>

                            <div className="text-center pt-2">
                                <Link href="/signin" className="text-2 text-neutral-800 font-bold">
                                    Back to login
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
