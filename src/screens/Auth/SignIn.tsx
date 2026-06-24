"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout/OnboardingLayout';
import { useApi } from '@/hooks/useApi';
import { useUser } from '@/contexts/UserContext';
import { useFormEntrance } from '@/hooks/useFormEntrance';
import { PasswordInput } from '@/components/ui/password-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export default function SignIn() {
    const router = useRouter();
    const { login } = useUser();
    const { post, error: apiError } = useApi();
    const formRef = useFormEntrance<HTMLDivElement>({ stagger: 0.04 });

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);

        try {
            const response = await post('/auth/login', { email, password }, { useToken: false });

            if (response?.data?.token) {
                const user = response.data.user;
                if (user?.twoFactorEnabled) {
                    setIsLoading(false);
                    sessionStorage.setItem('taxable_temp_email', email);
                    sessionStorage.setItem('taxable_temp_password', password);
                    router.push(`/verify-2fa?email=${encodeURIComponent(email)}`);
                } else {
                    login(response.data.token, user);
                    router.push('/home');
                }
            } else {
                setIsLoading(false);
            }
        } catch (err: unknown) {
            console.error("Login failed:", err);

            if (err instanceof Error && err.message === "Two-factor authentication code is required") {
                sessionStorage.setItem('taxable_temp_email', email);
                sessionStorage.setItem('taxable_temp_password', password);
                router.push(`/verify-2fa?email=${encodeURIComponent(email)}`);
                return;
            }

            setIsLoading(false);
        }
    };

    return (
        <>
            <OnboardingLayout>
                <div ref={formRef} className="max-w-[420px] mx-auto w-full">
                    <div className="mb-10">
                        <h2 data-animate className="text-7 font-semibold text-taxable-dark mb-1 tracking-[-0.02em]">Sign in to Taxable</h2>
                        <p data-animate className="text-neutral-400 text-2 font-medium tracking-[-0.01em]">Let&apos;s get your tax compliance sorted in minutes</p>
                    </div>

                    <form className="space-y-10" onSubmit={handleLogin}>
                        <div data-animate className="flex flex-col gap-1">
                            <Label htmlFor="email" className="tracking-[-0.01em]">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="hello@alignui.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div data-animate className="space-y-1">
                            <PasswordInput
                                label="Password"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <div className="text-2 text-neutral-400 font-medium pt-1">
                                Forgot your password? <Link href="/forgot-password" className="text-neutral-800 font-semibold">Reset it here</Link>
                            </div>
                        </div>

                        {apiError && (
                            <div data-animate className="text-2 text-red-500 font-medium">
                                {apiError}
                            </div>
                        )}

                        <div data-animate className="flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={!email || !password}
                            className="btn-auth w-full h-12 bg-taxable-blue text-white font-semibold rounded-xl disabled:bg-neutral-100 disabled:text-neutral-400 text-3 flex items-center justify-center"
                        >
                            {isLoading ? <Spinner /> : "Sign In"}
                        </button>

                        <div className="text-center text-2 text-neutral-400 font-medium">
                            Don&apos;t have an account? <Link href="/signup" className="text-neutral-800 font-semibold">Create one</Link>
                        </div>
                        </div>
                    </form>
                </div>

            </OnboardingLayout>
        </>
    );
}
