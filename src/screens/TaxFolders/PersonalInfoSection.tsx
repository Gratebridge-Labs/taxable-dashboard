'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Dispatch, SetStateAction } from 'react';
import { ChevronRight } from 'lucide-react';
import { FolderIcon } from './PITComponents';

export interface PersonalInfo {
    nin: string;
    fullName: string;
    email: string;
    phone: string;
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
            <h2 className="text-base font-bold text-[#0C0C0E]">Personal Information</h2>

            {/* NIN */}
            <div>
                <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] mb-2">
                    NIN (National Identification Number)
                    <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                </label>
                <input
                    type="text"
                    value={personalInfo.nin}
                    readOnly
                    className="w-full h-11 border border-[#F5F5F5] bg-gray-50 rounded-xl px-4 text-[14px] font-medium text-[#6B7280] cursor-not-allowed focus:outline-none"
                />
            </div>

            {/* Residency status */}
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151]">
                    Residency status
                    <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
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
                    <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] mb-2">
                        Email Address
                        <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                    </label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                        className="w-full h-11 border border-[#F5F5F5] bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:ring-1 focus:ring-[#003787]/10 transition-all placeholder:text-gray-300"
                    />
                </div>
                <div>
                    <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] mb-2">
                        Phone Number
                        <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                    </label>
                    <input
                        type="tel"
                        placeholder="Enter your phone"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                        className="w-full h-11 border border-[#F5F5F5] bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:ring-1 focus:ring-[#003787]/10 transition-all placeholder:text-gray-300"
                    />
                </div>
            </div>

            {/* Full Legal Name */}
            <div>
                <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] mb-2">
                    Full Legal Name
                    <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                </label>
                <input
                    type="text"
                    placeholder="Enter your full name"
                    value={personalInfo.fullName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                    className="w-full h-11 border border-[#F5F5F5] bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:ring-1 focus:ring-[#003787]/10 transition-all placeholder:text-gray-300"
                />
            </div>


            {/* Address */}
            <div>
                <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] mb-2">
                    Street Address
                    <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                </label>
                <input
                    type="text"
                    placeholder="Enter"
                    value={personalInfo.streetAddress}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, streetAddress: e.target.value })}
                    className="w-full h-11 border border-[#F5F5F5] bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:ring-1 focus:ring-[#003787]/10 transition-all placeholder:text-gray-300 mb-3"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative">
                        <select
                            className="appearance-none w-full h-11 border border-[#F5F5F5] bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:ring-1 focus:ring-[#003787]/10 transition-all"
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
                        <select
                            className="appearance-none w-full h-11 border border-[#F5F5F5] bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:ring-1 focus:ring-[#003787]/10 transition-all"
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
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
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
        <div className="hidden md:block w-[320px] flex-shrink-0 space-y-6 sticky top-8 self-start">
            <div className="bg-[#F5F5F5] rounded-[32px] p-6 border border-[#F5F5F5]">
                <div className="pt-6 mt-6 border-t border-white">
                    <p className="text-[13px] text-[#64748B] leading-relaxed mb-6 font-medium">
                        Your personal details help us identify you with FIRS and ensure your tax return is filed correctly. All information is encrypted and stored securely. We only share data with FIRS when you choose to file.
                    </p>
                    <div className="space-y-4 pt-4 border-t border-white">
                        <button className="w-full flex items-center justify-between text-[13px] font-bold text-[#003787] hover:underline">
                            How to find your NIN
                            <ChevronRight size={14} />
                        </button>
                        <button className="w-full flex items-center justify-between text-[13px] font-bold text-[#003787] hover:underline">
                            Understanding tax filing
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
