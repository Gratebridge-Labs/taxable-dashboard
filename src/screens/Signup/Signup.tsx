'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import OnboardingLayout from '@/components/OnboardingLayout/OnboardingLayout';
import LoadingScreen from '@/screens/Onboarding/LoadingScreen';
import { useApi } from '@/hooks/useApi';
import { useUser } from '@/contexts/UserContext';

const PasswordInput = ({ label, placeholder, value, onChange, hint }: { label: string; placeholder: string; value: string; onChange: (val: string) => void; hint?: string }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-2">
            <Label htmlFor={label}>{label}</Label>
            <InputGroup>
                <InputGroupInput
                    id={label}
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                />
                <InputGroupAddon align="inline-end">
                    <InputGroupButton
                        size="icon-xs"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
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
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>
            {hint && (
                <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-neutral-400 flex items-center justify-center">
                        <span className="text-[10px] text-white font-bold italic">i</span>
                    </div>
                    <p className="text-2 text-neutral-500 font-medium">{hint}</p>
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
                <div className="max-w-[420px] mx-auto w-full">
                    <div className="flex justify-between items-start mb-[40px]">
                        <div>
                            <h2 className="text-7 font-medium text-taxable-dark mb-2 leading-[1.1] tracking-[-0.01em]">Welcome to Taxable</h2>
                            <p className="text-3 font-medium text-neutral-500">Let&apos;s get your tax compliance sorted in minutes</p>
                        </div>
                        <Link href="/signin" className="h-10 px-4 flex items-center justify-center rounded-xl border border-neutral-200 text-taxable-dark font-medium text-2 hover:bg-neutral-50 transition-colors bg-white shrink-0">
                            Log in
                        </Link>
                    </div>

                    <form onSubmit={handleSignup} className="flex flex-col gap-[24px]">
                        <div className="space-y-[30px]">
                            <div className="grid grid-cols-2 gap-[24px]">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First name</Label>
                                    <Input
                                        id="firstName"
                                        placeholder="Enter your first name"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last name</Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Enter your last name"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="signup-email">Email Address</Label>
                                <Input
                                    id="signup-email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone number</Label>
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
                                    <span className="text-2 font-medium text-neutral-500">Receive tax deadline reminders via WhatsApp</span>
                                </div>
                            </div>

                            <PasswordInput
                                label="Password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={(val) => setFormData({ ...formData, password: val })}
                                hint="At least 8 characters. Make it strong!"
                            />
                        </div>

                        {apiError && (
                            <div className="text-2 font-medium text-destructive">
                                {apiError}
                            </div>
                        )}

                        <div className="space-y-4">
                            <Button
                                type="submit"
                                className="w-full bg-taxable-blue hover:bg-taxable-blue/95 text-white font-medium h-12 px-4 rounded-xl text-4 transition-all active:scale-95 whitespace-nowrap"
                            >
                                Create Account
                            </Button>

                            <p className="text-2 text-center text-neutral-500 font-medium px-2">
                                By continuing, you agree to our <Link href="#" className="font-semibold text-taxable-blue hover:underline">Terms of Service</Link> and <Link href="#" className="font-semibold text-taxable-blue hover:underline">Privacy Policy</Link>.
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
