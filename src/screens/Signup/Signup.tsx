'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout/OnboardingLayout';
import LoadingScreen from '@/screens/Onboarding/LoadingScreen';
import { useApi } from '@/hooks/useApi';
import { useUser } from '@/contexts/UserContext';

const InputField = ({ label, placeholder, value, onChange, type = "text" }: { label: string; placeholder: string; value: string; onChange: (val: string) => void; type?: string }) => (
    <div className="flex flex-col gap-1 w-full">
        <label className="text-sm font-medium text-taxable-dark">
            {label}
        </label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-10 px-4 rounded-2xl border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-taxable-blue/20 focus:border-taxable-blue transition-all"
        />
    </div>
);

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

        try {
            // Register user via API using the YodoPay pattern
            const response = await post('/auth/register', formData, { useToken: false });

            if (response?.data?.token) {
                // Initialize session if the API returns a token immediately
                login(response.data.token, response.data.user);
            }

            // Show loading screen before redirecting as per requirements
            setIsLoading(true);
        } catch (err) {
            console.error("Signup failed:", err);
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

                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-sm font-medium text-taxable-dark">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="••••••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full h-10 px-4 pr-10 rounded-2xl border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-taxable-blue/20 focus:border-taxable-blue transition-all"
                                />
                            </div>
                        </div>

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
                    onComplete={() => router.push('/home')}
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
