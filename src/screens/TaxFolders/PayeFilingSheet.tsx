'use client';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTaxableApi } from '@/hooks/useTaxableApi';
import { FormLabel, PrimaryButton, SecondaryButton } from '@/screens/TaxFolders/TaxFolderShared';
import { MONTHS } from '@/screens/TaxFolders/PITShared';

interface PayeFilingSheetProps {
    open: boolean;
    defaultMonth?: string;
    onClose: () => void;
    onFile: () => void;
}

export function PayeFilingSheet({ open, defaultMonth, onClose, onFile }: PayeFilingSheetProps) {
    const { createProfile, updatePersonalInfo } = useTaxableApi();
    const initialMonth = defaultMonth || MONTHS[new Date().getMonth()];

    const [step, setStep] = useState<1 | 2>(1);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [jtbTaxId, setJtbTaxId] = useState('');
    const [month, setMonth] = useState(initialMonth);
    const [selectedOption, setSelectedOption] = useState<'taxable_file' | 'accountant_review'>('taxable_file');
    const [saving, setSaving] = useState(false);

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const tinDigits = jtbTaxId.replace(/\D/g, '');
    const tinValid = tinDigits.length >= 10 && tinDigits.length <= 12;
    const detailsValid = firstName.trim().length > 0 && lastName.trim().length > 0 && tinValid;

    const reset = () => {
        setStep(1);
        setFirstName('');
        setLastName('');
        setJtbTaxId('');
        setMonth(initialMonth);
        setSelectedOption('taxable_file');
        setSaving(false);
    };

    const handleDetailsContinue = async () => {
        if (!detailsValid || saving) return;
        setSaving(true);
        try {
            // PAYE lives as an Individual profile with a calculate_paye intent.
            const profile = await createProfile(new Date().getFullYear(), 'Individual', {
                intent: 'calculate_paye',
            });
            await updatePersonalInfo(profile.profileId, {
                fullName,
                tin: tinDigits,
            });
            toast.success('Your PAYE profile has been created');
            setStep(2);
        } catch (err: unknown) {
            console.error('[PayeFilingSheet] Failed to create profile:', err instanceof Error ? err.message : 'Unknown error');
            toast.error(err instanceof Error ? err.message : 'Failed to create your profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleOptionContinue = () => {
        onFile();
        onClose();
        reset();
    };

    const handleClose = () => {
        onClose();
        reset();
    };

    return (
        <Drawer open={open} shouldScaleBackground={false} onOpenChange={(o) => { if (!o) handleClose(); }}>
            <DrawerContent className="bg-white w-full max-w-full px-4 pb-6">
                <DrawerTitle className="sr-only">File Monthly PAYE</DrawerTitle>
                <div className="max-w-[420px] mx-auto w-full pt-6" data-animate>
                    <div className="grid grid-cols-1 overflow-hidden">
                        {/* Step 1: details */}
                        <div className={`col-start-1 row-start-1 transition-transform duration-300 ease-in-out ${step === 2 ? '-translate-x-full' : 'translate-x-0'}`}>
                            <h2 className="text-5 font-medium text-neutral-800 text-center mb-8 tracking-[-0.02em] font-[family-name:var(--font-merriweather)]">File your monthly PAYE</h2>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <FormLabel tip="Your first name as it appears on your tax records.">First Name</FormLabel>
                                    <Input type="text" placeholder="Enter your first name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                                </div>
                                <div>
                                    <FormLabel tip="Your last name as it appears on your tax records.">Last Name</FormLabel>
                                    <Input type="text" placeholder="Enter your last name" value={lastName} onChange={e => setLastName(e.target.value)} />
                                </div>
                                <div>
                                    <FormLabel tip="Your 10-12 digit JTB Taxpayer Identification Number (TIN).">JTB Tax ID</FormLabel>
                                    <Input type="text" placeholder="Enter your TIN" value={jtbTaxId} onChange={e => setJtbTaxId(e.target.value.replace(/[^0-9]/g, ''))} />
                                    {jtbTaxId.length > 0 && !tinValid && (
                                        <p className="text-1 text-destructive font-medium mt-1">TIN must be 10-12 digits.</p>
                                    )}
                                </div>
                                <div>
                                    <FormLabel tip="Select the month you're filing PAYE for.">Month</FormLabel>
                                    <select
                                        value={month}
                                        onChange={e => setMonth(e.target.value)}
                                        className="w-full h-10 rounded-xl bg-white border border-neutral-100 px-3 text-sm font-medium text-neutral-800 outline-none"
                                    >
                                        {MONTHS.map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <SecondaryButton className="flex-1" onClick={handleClose}>
                                    Back
                                </SecondaryButton>
                                <PrimaryButton className="flex-[2]" onClick={handleDetailsContinue} disabled={!detailsValid || saving}>
                                    {saving ? 'Saving…' : 'Continue'}
                                </PrimaryButton>
                            </div>
                        </div>

                        {/* Step 2: how do you want to file */}
                        <div className={`col-start-1 row-start-1 transition-transform duration-300 ease-in-out ${step === 2 ? 'translate-x-0' : 'translate-x-full'}`}>
                            <h2 className="text-5 font-medium text-neutral-800 text-center mb-8 tracking-[-0.02em] font-[family-name:var(--font-merriweather)]">How do you want to file?</h2>

                            <RadioGroup value={selectedOption} onValueChange={(v) => setSelectedOption(v as typeof selectedOption)} className="space-y-3 mb-10">
                                <label className={`flex items-start gap-3 px-4 py-4 rounded-xl cursor-pointer ${selectedOption === 'taxable_file' ? 'bg-neutral-50 border border-neutral-200' : 'bg-white border border-transparent'}`}>
                                    <RadioGroupItem value="taxable_file" className="mt-0.5" />
                                    <div>
                                        <p className="text-3 font-semibold text-neutral-800">Let Taxable file for you (₦8,000)</p>
                                        <p className="text-1 text-neutral-500 font-medium mt-0.5">We submit your return directly to FIRS.</p>
                                    </div>
                                </label>
                                <label className={`flex items-start gap-3 px-4 py-4 rounded-xl cursor-pointer ${selectedOption === 'accountant_review' ? 'bg-neutral-50 border border-neutral-200' : 'bg-white border border-transparent'}`}>
                                    <RadioGroupItem value="accountant_review" className="mt-0.5" />
                                    <div>
                                        <p className="text-3 font-semibold text-neutral-800">Get accountant review first (₦25,000)</p>
                                        <p className="text-1 text-neutral-500 font-medium mt-0.5">A licensed accountant reviews before filing.</p>
                                    </div>
                                </label>
                            </RadioGroup>

                            <div className="flex gap-3">
                                <SecondaryButton className="flex-1" onClick={() => setStep(1)}>
                                    Back
                                </SecondaryButton>
                                <PrimaryButton className="flex-[2]" onClick={handleOptionContinue}>
                                    Continue
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
