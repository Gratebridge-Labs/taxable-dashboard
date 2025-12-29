import React from 'react';
import Link from 'next/link';
import OnboardingLayout from '@/components/OnboardingLayout/OnboardingLayout';

const InputField = ({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) => (
    <div className="flex flex-col gap-1 w-full">
        <label className="text-sm font-medium text-taxable-dark">
            {label}
        </label>
        <input
            type={type}
            placeholder={placeholder}
            className="w-full h-10 px-4 rounded-2xl border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-taxable-blue/20 focus:border-taxable-blue transition-all"
        />
    </div>
);

export default function Signup() {
    return (
        <OnboardingLayout>
            <div className="max-w-lg mx-auto w-full mt-12 md:mt-0">
                <div className="mb-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-medium text-taxable-dark mb-1">Welcome to Taxable</h2>
                        <p className="text-taxable-gray text-base">Let's get your tax compliance sorted in minutes</p>
                    </div>
                    <Link href="/login" className="px-5 py-2 rounded-lg border border-gray-200 text-taxable-dark font-medium hover:bg-gray-50 transition-colors bg-white text-sm whitespace-nowrap">
                        Log in
                    </Link>
                </div>

                <form className="flex flex-col gap-3">
                    <InputField label="First name" placeholder="hello@alignui.com" />
                    <InputField label="Last name" placeholder="hello@alignui.com" />
                    <InputField label="Email Address" placeholder="hello@alignui.com" type="email" />

                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm font-medium text-taxable-dark">
                            Phone number
                        </label>
                        <input
                            type="tel"
                            placeholder="+234"
                            className="w-full h-10 px-4 rounded-lg border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-taxable-blue/20 focus:border-taxable-blue transition-all"
                        />
                    </div>

                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="whatsapp"
                            className="w-4 h-4 rounded border-gray-300 text-taxable-blue focus:ring-taxable-blue"
                        />
                        <label htmlFor="whatsapp" className="text-sm text-taxable-gray">
                            Receive tax deadline reminders via WhatsApp
                        </label>
                    </div>

                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm font-medium text-taxable-dark">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="••••••••••••"
                                className="w-full h-10 px-4 pr-10 rounded-2xl border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-taxable-blue/20 focus:border-taxable-blue transition-all"
                            />
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-taxable-gray">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>At least 8 characters. Make it strong!</span>
                    </div>

                    <Link href="/onboarding/step1" className="flex items-center justify-center w-full h-11 bg-taxable-blue hover:opacity-90 text-taxable-light font-medium rounded-2xl shadow-lg shadow-taxable-blue/10 transition-transform active:scale-[0.99] mt-1">
                        Create Account
                    </Link>

                    <p className="text-[14px] text-center text-taxable-gray mt-2">
                        By continuing, you agree to our <Link href="#" className="font-medium text-taxable-blue">Terms of Service</Link> and <Link href="#" className="font-medium text-taxable-blue">Privacy Policy</Link>.
                    </p>
                </form>
            </div>
        </OnboardingLayout>
    );
}
