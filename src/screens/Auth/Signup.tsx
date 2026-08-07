'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout/OnboardingLayout';
import { useApi } from '@/hooks/useApi';
import { useUser } from '@/contexts/UserContext';
import { useFormEntrance } from '@/hooks/useFormEntrance';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

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
            const { whatsappReminders: _wr, ...payload } = formData;
            const response = await post('/auth/register', payload, { useToken: false });

            if (response?.data?.token) {
                login(response.data.token, response.data.user);
                router.push('/home');
            } else {
                toast.success('Verify your email', {
                    description: `We've sent a verification code to ${formData.email}`,
                });
                setIsLoading(false);
                setTimeout(() => {
                    router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}&type=signup`);
                }, 1500);
            }
        } catch (err: unknown) {
            console.error("Signup failed:", err);
            toast.error(err instanceof Error ? err.message : 'Signup failed. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <>
            <OnboardingLayout>
                <div ref={formRef} className="max-w-[420px] mx-auto w-full">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h2 data-animate className="text-5 font-medium text-neutral-800 mb-1 leading-[1.1] tracking-[-0.02em] font-[family-name:var(--font-merriweather)]">Welcome to Taxable</h2>
                            <p data-animate className="text-1 font-medium text-neutral-400 tracking-[-0.01em]">Let&apos;s get your tax compliance sorted in minutes</p>
                        </div>
                        <Link href="/signin" className="px-5 py-2.5 rounded-xl border border-neutral-200 text-neutral-800 font-semibold bg-white text-1 whitespace-nowrap shrink-0">
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
                            <div className="flex items-center gap-3 pt-1">
                                <Checkbox id="whatsapp" checked={formData.whatsappReminders} onCheckedChange={(c) => setFormData({ ...formData, whatsappReminders: c === true })} />
                                <label htmlFor="whatsapp" className="text-1 font-medium text-neutral-400 cursor-pointer">Receive tax deadline reminders via WhatsApp</label>
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
                            <p data-animate className="text-1 text-destructive font-medium">{apiError}</p>
                        )}

                        <div data-animate className="flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password}
                                className="w-full h-12 bg-taxable-blue text-white font-semibold rounded-xl disabled:bg-neutral-100 disabled:text-neutral-400 text-2 flex items-center justify-center"
                            >
                                {isLoading ? <Spinner /> : "Create Account"}
                            </button>

                            <p className="text-1 text-center text-neutral-400 font-medium px-2">
                                By continuing, you agree to our <Link href="#" className="font-semibold text-neutral-800">Terms of Service</Link> and <Link href="#" className="font-semibold text-neutral-800">Privacy Policy</Link>.
                            </p>
                        </div>
                    </form>
                </div>
            </OnboardingLayout>
        </>
    );
}
