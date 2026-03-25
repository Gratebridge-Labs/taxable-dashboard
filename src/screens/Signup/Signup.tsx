'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout/OnboardingLayout';
import LoadingScreen from '@/screens/Onboarding/LoadingScreen';
import { useApi } from '@/hooks/useApi';
import { useUser } from '@/contexts/UserContext';

const InputField = ({ label, placeholder, value, onChange, type = "text", hint }: { label: string; placeholder: string; value: string; onChange: (val: string) => void; type?: string; hint?: string }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
        <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-bold text-taxable-dark">
                {label}
            </label>
            <div className="relative">
                <input
                    type={inputType}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full h-12 px-4 rounded-2xl border border-[#f5f5f5] bg-white placeholder:text-gray-200 focus:outline-none focus:ring-1 focus:ring-taxable-blue/10 focus:border-taxable-blue transition-all font-medium text-taxable-dark"
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 focus:outline-none"
                    >
                        {showPassword ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
            {hint && (
                <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-gray-400 flex items-center justify-center">
                        <span className="text-[10px] text-white font-bold">!</span>
                    </div>
                    <p className="text-[12px] text-taxable-gray font-medium">{hint}</p>
                </div>
            )}
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
        password: '',
        whatsappReminders: false
    });

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await post('/auth/register', formData, { useToken: false });

            if (response?.data?.token) {
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
                <div className="max-w-[480px] mx-auto w-full relative">
                    <div className="flex justify-end mb-6 md:absolute md:top-0 md:right-0 md:-right-4 md:mb-0">
                        <Link href="/signin" className="h-[44px] px-6 flex items-center justify-center rounded-xl border border-[#f5f5f5] text-taxable-dark font-bold hover:bg-gray-50 transition-colors bg-white text-[13px] whitespace-nowrap shadow-sm">
                            Log in
                        </Link>
                    </div>

                    <div className="mb-10 pt-4">
                        <h2 className="text-[22px] md:text-[26px] font-bold text-taxable-dark mb-2">Welcome to Taxable</h2>
                        <p className="text-taxable-gray text-sm md:text-[15px] font-medium leading-relaxed">Let's get your tax compliance sorted in minutes</p>
                    </div>

                    <form onSubmit={handleSignup} className="flex flex-col gap-6">
                        <div className="space-y-6">
                            <InputField
                                label="First name"
                                placeholder="Enter your first name"
                                value={formData.firstName}
                                onChange={(val) => setFormData({ ...formData, firstName: val })}
                            />
                            <InputField
                                label="Last name"
                                placeholder="Enter your last name"
                                value={formData.lastName}
                                onChange={(val) => setFormData({ ...formData, lastName: val })}
                            />

                            <InputField
                                label="Email Address"
                                placeholder="Enter your email address"
                                type="email"
                                value={formData.email}
                                onChange={(val) => setFormData({ ...formData, email: val })}
                            />

                            <div className="flex flex-col gap-2 w-full">
                                <label className="text-sm font-bold text-taxable-dark">
                                    Phone number
                                </label>
                                <input
                                    type="tel"
                                    placeholder="+234"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full h-12 px-4 rounded-2xl border border-[#f5f5f5] bg-white placeholder:text-gray-200 focus:outline-none focus:ring-1 focus:ring-taxable-blue/10 focus:border-taxable-blue transition-all font-medium text-taxable-dark"
                                />
                                <div className="flex items-center gap-3 mt-1 cursor-pointer" onClick={() => setFormData({ ...formData, whatsappReminders: !formData.whatsappReminders })}>
                                    <div className={`w-[18px] h-[18px] rounded border flex items-center justify-center transition-colors ${formData.whatsappReminders ? 'bg-[#00388D] border-[#00388D]' : 'border-gray-200'}`}>
                                        {formData.whatsappReminders && (
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-[13px] font-medium text-taxable-gray">Receive tax deadline reminders via WhatsApp</span>
                                </div>
                            </div>

                            <InputField
                                label="Password"
                                placeholder="••••••••••••"
                                type="password"
                                value={formData.password}
                                onChange={(val) => setFormData({ ...formData, password: val })}
                                hint="At least 8 characters. Make it strong!"
                            />
                        </div>

                        {apiError && (
                            <div className="text-sm text-red-500 font-medium -mt-2">
                                {apiError}
                            </div>
                        )}

                        <div className="mt-2 space-y-5">
                            <button
                                type="submit"
                                className="w-full h-[52px] bg-[#00388D] hover:bg-[#002d70] text-white font-bold rounded-2xl shadow-lg shadow-blue-900/10 transition-all active:scale-[0.98] text-[15px]"
                            >
                                Create Account
                            </button>

                            <p className="text-[13px] text-center text-taxable-gray font-medium px-4">
                                By continuing, you agree to our <Link href="#" className="font-bold text-taxable-dark hover:underline">Terms of Service</Link> and <Link href="#" className="font-bold text-taxable-dark hover:underline">Privacy Policy</Link>.
                            </p>
                        </div>
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
