'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout/OnboardingLayout';
import LoadingScreen from '@/screens/Onboarding/LoadingScreen';
import { useApi } from '@/hooks/useApi';
import { useUser } from '@/contexts/UserContext';

const InputField = ({ label, placeholder, value, onChange, type = "text" }: { label: string; placeholder: string; value: string; onChange: (val: string) => void; type?: string }) => {
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
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full h-10 px-4 rounded-2xl border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-taxable-blue/20 focus:border-taxable-blue transition-all"
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                        {showPassword ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

export default function Signup() {
    const router = useRouter();
    const { login } = useUser();
    const { post, error: apiError } = useApi();

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: ''
    });

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Register user via API using the YodoPay pattern
            const response = await post('/auth/register', formData, { useToken: false });

            if (response?.data?.token) {
                // Initialize session if the API returns a token immediately
                login(response.data.token, response.data.user);
            }
        } catch (err) {
            console.error("Signup failed:", err);
            setIsLoading(false);
        }
    };

    return (
        <>
            <OnboardingLayout>
                <div className="max-w-lg mx-auto w-full mt-12 md:mt-0">
                    <div className="mb-6 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-medium text-taxable-dark mb-1">Welcome to Taxable</h2>
                            <p className="text-taxable-gray text-base">Let's get your tax compliance sorted in minutes</p>
                        </div>
                        <Link href="/signin" className="px-5 py-2 rounded-lg border border-gray-200 text-taxable-dark font-medium hover:bg-gray-50 transition-colors bg-white text-sm whitespace-nowrap">
                            Log in
                        </Link>
                    </div>

                    <form onSubmit={handleSignup} className="flex flex-col gap-3">
                        <div className="flex gap-3">
                            <InputField
                                label="First name"
                                placeholder="Enter first name"
                                value={formData.firstName}
                                onChange={(val) => setFormData({ ...formData, firstName: val })}
                            />
                            <InputField
                                label="Last name"
                                placeholder="Enter last name"
                                value={formData.lastName}
                                onChange={(val) => setFormData({ ...formData, lastName: val })}
                            />
                        </div>

                        <InputField
                            label="Email Address"
                            placeholder="hello@example.com"
                            type="email"
                            value={formData.email}
                            onChange={(val) => setFormData({ ...formData, email: val })}
                        />

                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-sm font-medium text-taxable-dark">
                                Phone number
                            </label>
                            <input
                                type="tel"
                                placeholder="+234"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full h-10 px-4 rounded-lg border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-taxable-blue/20 focus:border-taxable-blue transition-all"
                            />
                        </div>

                        <InputField
                            label="Password"
                            placeholder="••••••••••••"
                            type="password"
                            value={formData.password}
                            onChange={(val) => setFormData({ ...formData, password: val })}
                        />

                        {apiError && (
                            <div className="text-sm text-red-500 font-medium">
                                {apiError}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="flex items-center justify-center w-full h-11 bg-taxable-blue hover:opacity-90 text-taxable-light font-medium rounded-2xl shadow-lg shadow-taxable-blue/10 transition-transform active:scale-[0.99] mt-1"
                        >
                            Create Account
                        </button>

                        <p className="text-[14px] text-center text-taxable-gray mt-2">
                            By continuing, you agree to our <Link href="#" className="font-medium text-taxable-blue">Terms of Service</Link> and <Link href="#" className="font-medium text-taxable-blue">Privacy Policy</Link>.
                        </p>
                    </form>
                </div>
            </OnboardingLayout>

            {isLoading && (
                <LoadingScreen
                    onComplete={() => router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`)}
                    title="Setting up your account..."
                    steps={[
                        { text: "Creating your account" },
                        { text: "Setting up your tax workspace" },
                        { text: "Preparing your dashboard" }
                    ]}
                />
            )}
        </>
    );
}
