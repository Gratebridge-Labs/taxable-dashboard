'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Dispatch, SetStateAction, useState } from 'react';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Spinner } from '@/components/ui/spinner';
import { format } from 'date-fns';

const NIGERIA_CITIES = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Enugu', 'Abeokuta', 'Warri', 'Jos', 'Kaduna'];
const NIGERIA_STATES = ['Lagos', 'FCT (Abuja)', 'Rivers', 'Oyo', 'Kano', 'Enugu', 'Ogun', 'Delta', 'Plateau', 'Kaduna'];
const NIGERIA_LGAS = ['Alimosho', 'Ajeromi-Ifelodun', 'Kosofe', 'Mushin', 'Oshodi-Isolo', 'Ojo', 'Ikorodu', 'Surulere', 'Agege', 'Ifako-Ijaiye', 'Somolu', 'Amuwo-Odofin', 'Lagos Mainland', 'Ikeja', 'Eti-Osa', 'Badagry', 'Apapa', 'Epe', 'Ibeju-Lekki'];

export interface PersonalInfo {
    nin: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dob: string;
    streetAddress: string;
    city: string;
    state: string;
    lga: string;
    isResident: boolean;
}

export interface PersonalInfoSectionProps {
    personalInfo: PersonalInfo;
    setPersonalInfo: Dispatch<SetStateAction<PersonalInfo>>;
    savingPersonalInfo: boolean;
    onSave: () => Promise<void>;
}

const update = (set: Dispatch<SetStateAction<PersonalInfo>>, personalInfo: PersonalInfo) =>
    (k: keyof PersonalInfo, v: any) => set({ ...personalInfo, [k]: v });

export const PersonalInfoSection = ({
    personalInfo,
    setPersonalInfo,
    savingPersonalInfo,
    onSave,
}: PersonalInfoSectionProps) => {
    const set = update(setPersonalInfo, personalInfo);
    const [dobOpen, setDobOpen] = useState(false);
    const dobDate = personalInfo.dob ? new Date(personalInfo.dob) : undefined;

    const allRequiredFilled = !!(
        personalInfo.nin &&
        personalInfo.firstName &&
        personalInfo.lastName &&
        personalInfo.email &&
        personalInfo.phone &&
        personalInfo.dob &&
        personalInfo.streetAddress &&
        personalInfo.city &&
        personalInfo.state &&
        personalInfo.lga
    );

    return (
        <div className="flex flex-col items-center" data-animate>
            <div className="space-y-10 w-full max-w-[400px]">
                <h2 className="text-7 font-semibold text-neutral-800 tracking-[-0.02em]">Personal Information</h2>

                {/* NIN */}
                <div>
                    <label className="flex items-center gap-1.5 text-2 font-medium text-neutral-500 mb-2">
                        NIN (National Identification Number)
                        <InfoTooltip text="Your 11-digit National Identification Number issued by NIMC. This is required by FIRS to link your tax records to your identity." />
                    </label>
                    <Input
                        type="text"
                        value={personalInfo.nin}
                        readOnly
                        className="w-full h-11 bg-neutral-50 text-neutral-500 cursor-not-allowed"
                    />
                </div>

                {/* First Name + Last Name */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="flex items-center gap-1.5 text-2 font-medium text-neutral-500 mb-2">
                            First Name
                            <InfoTooltip text="Your legal first name as it appears on your NIN." />
                        </label>
                        <Input
                            type="text"
                            placeholder="First name"
                            value={personalInfo.firstName}
                            onChange={(e) => set('firstName', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="flex items-center gap-1.5 text-2 font-medium text-neutral-500 mb-2">
                            Last Name
                            <InfoTooltip text="Your legal last name as it appears on your NIN." />
                        </label>
                        <Input
                            type="text"
                            placeholder="Last name"
                            value={personalInfo.lastName}
                            onChange={(e) => set('lastName', e.target.value)}
                        />
                    </div>
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="flex items-center gap-1.5 text-2 font-medium text-neutral-500 mb-2">
                            Email Address
                            <InfoTooltip text="Your email address for receiving tax notifications from FIRS." />
                        </label>
                        <Input
                            type="email"
                            placeholder="Enter email"
                            value={personalInfo.email}
                            onChange={(e) => set('email', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="flex items-center gap-1.5 text-2 font-medium text-neutral-500 mb-2">
                            Phone Number
                            <InfoTooltip text="Your phone number for SMS tax notifications." />
                        </label>
                        <Input
                            type="tel"
                            placeholder="Enter phone"
                            value={personalInfo.phone}
                            onChange={(e) => set('phone', e.target.value)}
                        />
                    </div>
                </div>

                {/* Date of Birth */}
                <div>
                    <label className="flex items-center gap-1.5 text-2 font-medium text-neutral-500 mb-2">
                        Date of Birth
                        <InfoTooltip text="Your date of birth as recorded on your NIN." />
                    </label>
                    <Popover open={dobOpen} onOpenChange={setDobOpen}>
                        <PopoverTrigger className="w-full h-10 flex items-center justify-start px-3 text-left font-normal text-3 text-neutral-800 border border-neutral-200 bg-white rounded-xl">
                            {dobDate ? format(dobDate, 'dd / MM / yyyy') : <span className="text-neutral-400">DD / MM / YYYY</span>}
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={dobDate}
                                onSelect={(date) => {
                                    if (date) {
                                        set('dob', format(date, 'yyyy-MM-dd'));
                                        setDobOpen(false);
                                    }
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Address */}
                <div>
                    <label className="flex items-center gap-1.5 text-2 font-medium text-neutral-500 mb-2">
                        Address (building number, street)
                        <InfoTooltip text="Your residential street address in Nigeria." />
                    </label>
                    <Input
                        type="text"
                        placeholder="e.g. 27, Marina Street"
                        value={personalInfo.streetAddress}
                        onChange={(e) => set('streetAddress', e.target.value)}
                    />
                    <div className="grid grid-cols-3 gap-3 mt-3">
                        <SearchableSelect options={NIGERIA_CITIES} value={personalInfo.city} onChange={(v) => set('city', v)} placeholder="City" />
                        <SearchableSelect options={NIGERIA_STATES} value={personalInfo.state} onChange={(v) => set('state', v)} placeholder="State" />
                        <SearchableSelect options={NIGERIA_LGAS} value={personalInfo.lga} onChange={(v) => set('lga', v)} placeholder="LGA" />
                    </div>
                </div>

                {/* Residency */}
                <div className="pt-4 border-t border-neutral-100">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                            checked={personalInfo.isResident}
                            onCheckedChange={(c) => set('isResident', c === true)}
                        />
                        <div>
                            <span className="text-3 font-medium text-neutral-800">Resident of Nigeria</span>
                            <p className="text-2 text-neutral-400 font-medium">I confirm I live in Nigeria and declare my worldwide income.</p>
                        </div>
                    </label>
                </div>

                <button
                    onClick={onSave}
                    disabled={!allRequiredFilled || savingPersonalInfo}
                    className="h-12 w-full bg-taxable-blue text-white font-semibold rounded-xl disabled:bg-neutral-100 disabled:text-neutral-400 flex items-center justify-center gap-2"
                >
                    {savingPersonalInfo ? <Spinner /> : 'Save & Continue'}
                </button>
            </div>
        </div>
    );
};
