'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout/OnboardingLayout';
import { useApi } from '@/hooks/useApi';
import { useUser } from '@/contexts/UserContext';
import { useFormEntrance } from '@/hooks/useFormEntrance';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Spinner } from '@/components/ui/spinner';

export default function Signup() {
    const router = useRouter();
    const { login } = useUser();
    const { post, error: apiError } = useApi();
    const formRef = useFormEntrance<HTMLDivElement>({ stagger: 0.04 });

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
        if (isLoading) return;
        setIsLoading(true);

        try {
            const response = await post('/auth/register', formData, { useToken: false });

            if (response?.data?.token) {
                login(response.data.token, response.data.user);
                router.push('/home');
            }
        } catch (err) {
            console.error("Signup failed:", err);
            setIsLoading(false);
        }
    };

    return (
        <>
            <OnboardingLayout>
                <div ref={formRef} className="max-w-[420px] mx-auto w-full">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h2 data-animate className="text-7 font-medium text-taxable-dark mb-1 leading-[1.1] tracking-[-0.02em]">Welcome to Taxable</h2>
                            <p data-animate className="text-2 font-medium text-neutral-400 tracking-[-0.01em]">Let&apos;s get your tax compliance sorted in minutes</p>
                        </div>
                        <Link href="/signin" className="px-5 py-2.5 rounded-xl border border-neutral-200 text-taxable-dark font-bold bg-white text-2 whitespace-nowrap shrink-0">
                            Log in
                        </Link>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-10">
                        <div data-animate className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="firstName" className="tracking-[-0.01em]">First name</Label>
                                <Input
                                    id="firstName"
                                    placeholder="Enter your first name"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="lastName" className="tracking-[-0.01em]">Last name</Label>
                                <Input
                                    id="lastName"
                                    placeholder="Enter your last name"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div data-animate className="flex flex-col gap-1">
                            <Label htmlFor="signup-email" className="tracking-[-0.01em]">Email Address</Label>
                            <Input
                                id="signup-email"
                                type="email"
                                placeholder="Enter your email address"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div data-animate className="flex flex-col gap-1">
                            <Label htmlFor="phone" className="tracking-[-0.01em]">Phone number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+234"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <div className="flex items-center gap-3 pt-1 cursor-pointer" onClick={() => setFormData({ ...formData, whatsappReminders: !formData.whatsappReminders })}>
                                <div className={`w-[18px] h-[18px] rounded border flex items-center justify-center transition-colors ${formData.whatsappReminders ? 'bg-taxable-blue border-taxable-blue' : 'border-neutral-300'}`}>
                                    {formData.whatsappReminders && (
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-2 font-medium text-neutral-400">Receive tax deadline reminders via WhatsApp</span>
                            </div>
                        </div>

                        <div data-animate>
                            <PasswordInput
                                label="Password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                hint="At least 8 characters. Make it strong!"
                            />
                        </div>

                        {apiError && (
                            <p data-animate className="text-2 text-red-500 font-medium">{apiError}</p>
                        )}

                        <div data-animate className="flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password}
                                className="btn-auth w-full h-12 bg-taxable-blue text-white font-semibold rounded-xl disabled:bg-neutral-100 disabled:text-neutral-400 text-3 flex items-center justify-center"
                            >
                                {isLoading ? <Spinner /> : "Create Account"}
                            </button>

                            <p className="text-2 text-center text-neutral-400 font-medium px-2">
                                By continuing, you agree to our <Link href="#" className="font-semibold text-neutral-800">Terms of Service</Link> and <Link href="#" className="font-semibold text-neutral-800">Privacy Policy</Link>.
                            </p>
                        </div>
                    </form>
                </div>
            </OnboardingLayout>
        </>
    );
}
