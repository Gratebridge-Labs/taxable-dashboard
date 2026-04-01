'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Dispatch, SetStateAction } from 'react';
import { ChevronRight } from 'lucide-react';
import { FolderIcon } from './PITComponents';

const InfoTooltip = ({ text }: { text: string }) => (
    <div className="relative group inline-flex">
        <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#0C0C0E] text-white text-[11px] rounded-lg w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-normal">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0C0C0E]"></div>
        </div>
    </div>
);

export interface PersonalInfo {
    nin: string;
    fullName: string;
    email: string;
    phone: string;
    dob: string;
    streetAddress: string;
    city: string;
    state: string;
    residencyStatus: string;
}

export interface PersonalInfoSectionProps {
    personalInfo: PersonalInfo;
    setPersonalInfo: Dispatch<SetStateAction<PersonalInfo>>;
    saveSuccess: boolean;
    savingPersonalInfo: boolean;
    onSave: () => Promise<void>;
    currentProfile: any;
    onUpdateProfileProp: (prop: string, val: any) => Promise<void>;
}

export const PersonalInfoSection = ({
    personalInfo,
    setPersonalInfo,
    saveSuccess,
    savingPersonalInfo,
    onSave,
    currentProfile,
    onUpdateProfileProp,
}: PersonalInfoSectionProps) => (
    <div className="flex flex-col md:flex-row items-start justify-between gap-6 md:gap-12 font-sans">
        {/* Left — Form */}
        <div className="flex-1 space-y-5 md:space-y-7 w-full max-w-[480px]">
            <h2 className="text-[14px] font-medium text-[#737373]" style={{ fontFamily: 'Archivo', lineHeight: '20px', letterSpacing: '-0.6%' }}>Personal Information</h2>

            {/* NIN */}
            <div>
                <label className="flex items-center gap-1.5 text-[14px] font-medium text-[#737373] mb-2" style={{ fontFamily: 'Archivo', lineHeight: '20px', letterSpacing: '-0.6%' }}>
                    NIN (National Identification Number)
                    <InfoTooltip text="Your 11-digit National Identification Number issued by NIMC. This is required by FIRS to link your tax records to your identity." />
                </label>
                <input
                    type="text"
                    value={personalInfo.nin}
                    readOnly
                    className="w-full h-11 bg-gray-50 rounded-xl px-4 text-[14px] font-medium text-[#6B7280] cursor-not-allowed focus:outline-none"
                />
            </div>

            {/* Residency status */}
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center gap-1.5 text-[14px] font-medium text-[#737373]" style={{ fontFamily: 'Archivo', lineHeight: '20px', letterSpacing: '-0.6%' }}>
                    Residency status
                    <InfoTooltip text="Determines your tax obligations. Residents are taxed on worldwide income; non-residents only on Nigeria-sourced income." />
                </div>
                <div className="flex items-center gap-1.5 text-[14px] font-semibold text-[#16A34A]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                        <polyline points="18 8 21 11 18 14" />
                    </svg>
                    {personalInfo.residencyStatus === 'resident' ? 'Resident of Nigeria' : 'Non-Resident'}
                </div>
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="flex items-center gap-1.5 text-[14px] font-medium text-[#737373] mb-2" style={{ fontFamily: 'Archivo', lineHeight: '20px', letterSpacing: '-0.6%' }}>
                        Email Address
                        <InfoTooltip text="Your email address for receiving tax notifications and updates from FIRS regarding your tax filings." />
                    </label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                        className="w-full h-11 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none transition-all placeholder:text-gray-300"
                    />
                </div>
                <div>
                    <label className="flex items-center gap-1.5 text-[14px] font-medium text-[#737373] mb-2" style={{ fontFamily: 'Archivo', lineHeight: '20px', letterSpacing: '-0.6%' }}>
                        Phone Number
                        <InfoTooltip text="Your phone number for SMS notifications about your tax filing status and payment reminders." />
                    </label>
                    <input
                        type="tel"
                        placeholder="Enter your phone"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                        className="w-full h-11 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none transition-all placeholder:text-gray-300"
                    />
                </div>
            </div>

            {/* Full Legal Name */}
            <div>
                <label className="flex items-center gap-1.5 text-[14px] font-medium text-[#737373] mb-2" style={{ fontFamily: 'Archivo', lineHeight: '20px', letterSpacing: '-0.6%' }}>
                    Full Legal Name
                    <InfoTooltip text="Your full legal name as it appears on your NIN. This must match your official identity documents." />
                </label>
                <input
                    type="text"
                    placeholder="Enter your full name"
                    value={personalInfo.fullName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                    className="w-full h-11 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none transition-all placeholder:text-gray-300"
                />
            </div>

            {/* Date of Birth */}
            <div>
                <label className="flex items-center gap-1.5 text-[14px] font-medium text-[#737373] mb-2" style={{ fontFamily: 'Archivo', lineHeight: '20px', letterSpacing: '-0.6%' }}>
                    Date of Birth
                    <InfoTooltip text="Your date of birth as recorded on your NIN. This information is required by FIRS for identity verification." />
                </label>
                <input
                    type="date"
                    value={personalInfo.dob}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, dob: e.target.value })}
                    className="w-full h-11 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none transition-all"
                />
            </div>


            {/* Address */}
            <div>
                <label className="flex items-center gap-1.5 text-[14px] font-medium text-[#737373] mb-2" style={{ fontFamily: 'Archivo', lineHeight: '20px', letterSpacing: '-0.6%' }}>
                    Street Address
                    <InfoTooltip text="Your residential street address in Nigeria. This is used to determine your tax jurisdiction and state of residence." />
                </label>
                <input
                    type="text"
                    placeholder="Enter"
                    value={personalInfo.streetAddress}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, streetAddress: e.target.value })}
                    className="w-full h-11 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none transition-all placeholder:text-gray-300 mb-3"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative">
                        <label className="flex items-center gap-1 text-[12px] font-medium text-[#737373] mb-1">
                            City
                            <InfoTooltip text="The city where your residential address is located." />
                        </label>
                        <select
                            className="appearance-none w-full h-11 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none transition-all"
                            value={personalInfo.city}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                        >
                            <option value="">City</option>
                            <option value="Lagos">Lagos</option>
                            <option value="Abuja">Abuja</option>
                            <option value="Port Harcourt">Port Harcourt</option>
                            <option value="Ibadan">Ibadan</option>
                            <option value="Kano">Kano</option>
                        </select>
                    </div>
                    <div className="relative">
                        <label className="flex items-center gap-1 text-[12px] font-medium text-[#737373] mb-1">
                            State
                            <InfoTooltip text="The state where your residential address is located. This determines your state tax obligations." />
                        </label>
                        <select
                            className="appearance-none w-full h-11 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none transition-all"
                            value={personalInfo.state}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, state: e.target.value })}
                        >
                            <option value="">State</option>
                            <option value="Lagos">Lagos</option>
                            <option value="FCT">FCT (Abuja)</option>
                            <option value="Rivers">Rivers</option>
                            <option value="Oyo">Oyo</option>
                            <option value="Kano">Kano</option>
                        </select>
                    </div>
                </div>
            </div>

            {saveSuccess && (
                <div className="p-3 bg-green-50 rounded-xl text-green-700 text-sm font-medium">
                    Personal information saved successfully!
                </div>
            )}

            <button
                onClick={onSave}
                disabled={savingPersonalInfo}
                className="h-12 px-10 bg-[#003787] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
            >
                {savingPersonalInfo ? 'Saving...' : 'Save & Continue'}
            </button>
        </div>

        {/* Right Info Sidebar - Hidden on Mobile */}
        <div className="hidden md:block w-[300px] flex-shrink-0 sticky top-8 self-start">
            <div className="bg-[#F5F5F5] rounded-[24px] p-6">
                {/* Header */}
                <div className="flex items-center gap-2.5 mb-4">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0C0C0E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="8" strokeWidth="3" strokeLinecap="round" />
                        <line x1="12" y1="12" x2="12" y2="16" />
                    </svg>
                    <h3 className="text-[16px] font-bold text-[#0C0C0E]">Why we need this</h3>
                </div>

                {/* Body */}
                <p className="text-[14px] text-[#6B7280] leading-relaxed font-normal mb-8">
                    Your personal details help us identify you with FIRS and ensure your tax return is filed correctly. All information is encrypted and stored securely. We only share data with FIRS when you choose to file.
                </p>

                {/* Links */}
                <div className="space-y-4">
                    <a
                        href="https://tin.firs.gov.ng"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-[15px] font-bold text-[#0C0C0E] hover:opacity-70 transition-opacity"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        How to find your TIN
                    </a>
                    <a
                        href="https://www.firs.gov.ng"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-[15px] font-bold text-[#0C0C0E] hover:opacity-70 transition-opacity"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        Understanding tax filing
                    </a>
                </div>
            </div>
        </div>
    </div>
);
