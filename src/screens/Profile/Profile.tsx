'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';
import { useApi } from '@/hooks/useApi';

const ProfileField = ({ label, placeholder, value, onChange, type = "text", prefix }: { label: string; placeholder: string; value: string; onChange: (val: string) => void; type?: string; prefix?: string }) => (
    <div className="mb-6">
        <label className="block text-[15px] font-bold text-taxable-dark mb-3">{label}</label>
        <div className="relative">
            {prefix && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">{prefix}</div>
            )}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full h-14 bg-white border border-gray-100 rounded-[14px] px-4 text-taxable-dark focus:outline-none focus:ring-1 focus:ring-taxable-blue/20 placeholder:text-gray-300 font-medium ${prefix ? 'pl-14' : ''}`}
            />
        </div>
    </div>
);

const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
        onClick={onChange}
        className={`w-[44px] h-[24px] rounded-full relative transition-colors duration-200 ${enabled ? 'bg-[#003787]' : 'bg-[#E2E8F0]'}`}
    >
        <div className={`absolute top-[2px] w-[20px] h-[20px] bg-white rounded-full transition-transform duration-200 ${enabled ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
    </button>
);

const AvatarSVG = ({ initials = "JB" }: { initials?: string }) => (
    <svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <defs>
            <filter id="filter0_i_661_683" x="0" y="-8" width="64" height="72" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                <feOffset dy="-8" />
                <feGaussianBlur stdDeviation="8" />
                <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                <feColorMatrix type="matrix" values="0 0 0 0 0.7712 0 0 0 0 0.78 0 0 0 0 0.7888 0 0 0 0.48 0" />
                <feBlend mode="normal" in2="shape" result="effect1_innerShadow_661_683" />
            </filter>
        </defs>
        <circle cx="32" cy="32" r="32" fill="#F6F8FA" filter="url(#filter0_i_661_683)" />
        <text
            x="32"
            y="39"
            textAnchor="middle"
            fontSize="18"
            fontWeight="700"
            fill="#0A0D14"
            fontFamily="Inter, system-ui, sans-serif"
            className="select-none"
        >
            {initials}
        </text>
    </svg>
);

export default function Profile() {
    const [activeSection, setActiveSection] = useState('Personal Information');
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const { post, loading: apiLoading, error: apiError } = useApi();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        firstName: 'Sophia',
        lastName: 'Williams',
        tin: '',
        phone: '',
        email: 'hello@alignui.com',
        whatsappReminders: false
    });

    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        tfaType: 'authenticator' as 'authenticator' | 'sms',
        tfaCode: '',
        isEnabling: false
    });

    const [preferences, setPreferences] = useState({
        filingReminders: false,
        accountUpdates: false,
        productUpdates: false,
        tipsContent: false,
        deadlineReminders: false
    });

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
        }
    };

    const handlePasswordChange = async () => {
        setSuccessMessage(null);
        if (!securityData.currentPassword || !securityData.newPassword) return;

        const response = await post('/auth/change-password', {
            oldPassword: securityData.currentPassword,
            newPassword: securityData.newPassword
        });

        if (response) {
            setSuccessMessage("Password successfully updated. You'll need to use your new password next time you sign in.");
            setSecurityData({
                ...securityData,
                currentPassword: '',
                newPassword: ''
            });
        }
    };

    const handleEnable2FA = async () => {
        setSuccessMessage(null);
        if (!securityData.tfaCode) return;

        const response = await post('/auth/enable-2fa', {
            code: securityData.tfaCode
        });

        if (response) {
            setSuccessMessage("Two-factor authentication has been successfully enabled for your account.");
            setSecurityData({
                ...securityData,
                tfaCode: '',
                isEnabling: false
            });
        }
    };

    const categories = [
        'Personal Information',
        'Security',
        'Preferences',
        'Support & About'
    ];

    return (
        <div className="min-h-screen bg-[#FBFBFB]">
            <DashboardHeader />

            <main className="max-w-[1240px] mx-auto pt-12 pb-20 px-8">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-12">
                    <div>
                        <h1 className="text-2xl font-medium text-taxable-dark mb-3">Profile & Settings</h1>
                        <p className="text-lg text-taxable-gray font-medium max-w-[500px] leading-relaxed">
                            Everything you need to understand Nigerian taxes and make the most of Taxable
                        </p>
                    </div>
                    <button className="h-[52px] px-7 bg-white border border-gray-100 rounded-[18px] text-[15px] font-bold text-taxable-dark shadow-xs hover:shadow-md transition-all">
                        Contact support
                    </button>
                </div>

                <div className="flex gap-16">
                    {/* Sidebar */}
                    <div className="w-[303px] h-[218px] bg-white rounded-[20px] border border-gray-100 p-3 shadow-sm flex flex-col shrink-0">
                        <h4 className="text-base font-medium text-taxable-dark mb-3 px-2">Select</h4>
                        <div className="flex flex-col gap-1 items-center">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setActiveSection(category)}
                                    className={`w-[279px] h-[37px] flex items-center justify-between px-3 transition-all rounded-[8px] ${activeSection === category ? 'bg-[#F1F5F9] text-taxable-dark' : 'hover:bg-gray-50 text-taxable-gray'
                                        }`}
                                >
                                    <span className={`text-sm ${activeSection === category ? 'font-semibold' : 'font-medium'}`}>{category}</span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={activeSection === category ? 'text-taxable-dark' : 'text-gray-300'}>
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Settings Content */}
                    <div className="flex-1 max-w-[480px]">
                        {activeSection === 'Personal Information' && (
                            <div className="animate-in fade-in duration-500">
                                {/* Profile Image Upload */}
                                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-50">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                    <div className="w-20 h-20 rounded-[24px] bg-[#F5F5F3] flex items-center justify-center shrink-0 overflow-hidden border border-gray-50">
                                        {profileImage ? (
                                            <Image src={profileImage} alt="Profile" fill className="object-cover" />
                                        ) : (
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#D1D5DB" />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-[17px] font-bold text-taxable-dark mb-1">Upload Image</h3>
                                        <p className="text-[13px] text-taxable-gray font-medium mb-3">Min 400x400px, PNG or JPEG</p>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="h-10 px-6 border border-gray-100 rounded-xl text-[14px] font-bold text-taxable-dark hover:bg-gray-50 transition-colors"
                                        >
                                            Upload
                                        </button>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-2">
                                    <ProfileField
                                        label="First name"
                                        placeholder="hello@alignui.com"
                                        value={formData.firstName}
                                        onChange={(val) => setFormData({ ...formData, firstName: val })}
                                    />
                                    <ProfileField
                                        label="Last name"
                                        placeholder="hello@alignui.com"
                                        value={formData.lastName}
                                        onChange={(val) => setFormData({ ...formData, lastName: val })}
                                    />
                                    <ProfileField
                                        label="Tax Identification Number"
                                        placeholder="hello@alignui.com"
                                        value={formData.tin}
                                        onChange={(val) => setFormData({ ...formData, tin: val })}
                                    />
                                    <ProfileField
                                        label="Email Address"
                                        placeholder="hello@alignui.com"
                                        value={formData.email}
                                        onChange={(val) => setFormData({ ...formData, email: val })}
                                        type="email"
                                    />
                                    <ProfileField
                                        label="Phone number"
                                        placeholder="Enter"
                                        value={formData.phone}
                                        onChange={(val) => setFormData({ ...formData, phone: val })}
                                        prefix="+234"
                                    />
                                </div>

                                <div className="flex items-center gap-3 mt-8">
                                    <button
                                        onClick={() => setFormData({ ...formData, whatsappReminders: !formData.whatsappReminders })}
                                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.whatsappReminders ? 'bg-taxable-blue border-taxable-blue' : 'border-gray-200 bg-white'}`}
                                    >
                                        {formData.whatsappReminders && (
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </button>
                                    <span className="text-[13px] font-medium text-taxable-gray">Receive tax deadline reminders via WhatsApp</span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3 mt-10">
                                    <button className="h-[52px] px-8 border border-gray-100 text-taxable-dark font-bold rounded-xl hover:bg-gray-50 transition-colors">
                                        Reset
                                    </button>
                                    <button className="h-[52px] px-10 bg-[#00388D] text-white font-bold rounded-xl hover:opacity-95 transition-opacity shadow-sm">
                                        Save
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'Security' && (
                            <div className="animate-in fade-in duration-500 space-y-10">
                                <div className="space-y-4">
                                    <ProfileField
                                        label="Current password"
                                        placeholder="hello@alignui.com"
                                        type="password"
                                        value={securityData.currentPassword}
                                        onChange={(val) => setSecurityData({ ...securityData, currentPassword: val })}
                                    />
                                    <div className="relative">
                                        <ProfileField
                                            label="New Password"
                                            placeholder="••••••••••••"
                                            type="password"
                                            value={securityData.newPassword}
                                            onChange={(val) => setSecurityData({ ...securityData, newPassword: val })}
                                        />
                                        <button className="absolute right-4 top-[50px] text-[#A3A3A3]">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 -mt-2">
                                        <div className="w-3.5 h-3.5 rounded-full bg-taxable-blue flex items-center justify-center">
                                            <span className="text-[10px] text-white font-bold">!</span>
                                        </div>
                                        <p className="text-[12px] text-taxable-gray font-medium">At least 8 characters. Make it strong!</p>
                                    </div>
                                </div>

                                {apiError && (
                                    <div className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-xl">
                                        {apiError}
                                    </div>
                                )}

                                {successMessage && (
                                    <div className="text-sm text-green-600 font-medium bg-green-50 p-3 rounded-xl">
                                        {successMessage}
                                    </div>
                                )}

                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setSecurityData({ ...securityData, currentPassword: '', newPassword: '' });
                                            setSuccessMessage(null);
                                        }}
                                        className="h-[52px] px-8 border border-gray-100 text-taxable-dark font-bold rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handlePasswordChange}
                                        disabled={apiLoading || !securityData.currentPassword || !securityData.newPassword}
                                        className="h-[52px] px-10 bg-[#00388D] text-white font-bold rounded-xl hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {apiLoading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Updating...</span>
                                            </>
                                        ) : (
                                            "Change password"
                                        )}
                                    </button>
                                </div>

                                <div className="pt-8 border-t border-gray-50">
                                    <h2 className="text-[19px] font-bold text-taxable-dark mb-4">Two-Factor Authentication (2FA)</h2>

                                    <div className="bg-[#F8FAFC] rounded-[24px] p-6 flex gap-4 mb-8">
                                        <div className="w-6 h-6 rounded-full border-2 border-taxable-dark flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-[14px] font-bold text-taxable-dark">i</span>
                                        </div>
                                        <div>
                                            <h4 className="text-[15px] font-bold text-taxable-dark mb-1">Why you need this</h4>
                                            <p className="text-[13px] text-taxable-gray font-medium leading-relaxed">
                                                Add an extra layer of security to your account. You'll need to enter a code from your phone in addition to your password when signing in.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6 mb-10">
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <div onClick={() => setSecurityData({ ...securityData, tfaType: 'authenticator' })} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 transition-colors ${securityData.tfaType === 'authenticator' ? 'border-[#00388D]' : 'border-gray-200'}`}>
                                                {securityData.tfaType === 'authenticator' && <div className="w-[10px] h-[10px] bg-[#00388D] rounded-full" />}
                                            </div>
                                            <div>
                                                <h4 className="text-[15px] font-bold text-taxable-dark leading-none mb-2">Authenticator App (Recommended)</h4>
                                                <p className="text-[13px] text-taxable-gray font-medium">Use an app like Google Authenticator, Authy, or Microsoft Authenticator</p>
                                            </div>
                                        </label>

                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <div onClick={() => setSecurityData({ ...securityData, tfaType: 'sms' })} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 transition-colors ${securityData.tfaType === 'sms' ? 'border-[#00388D]' : 'border-gray-200'}`}>
                                                {securityData.tfaType === 'sms' && <div className="w-[10px] h-[10px] bg-[#00388D] rounded-full" />}
                                            </div>
                                            <div>
                                                <h4 className="text-[15px] font-bold text-taxable-dark leading-none mb-2">SMS Text Message</h4>
                                                <p className="text-[13px] text-taxable-gray font-medium">Receive codes via SMS (requires verified phone)</p>
                                            </div>
                                        </label>
                                    </div>

                                    {securityData.isEnabling ? (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                            <div className="max-w-[200px]">
                                                <ProfileField
                                                    label="Enter Verification Code"
                                                    placeholder="000000"
                                                    value={securityData.tfaCode}
                                                    onChange={(val) => setSecurityData({ ...securityData, tfaCode: val })}
                                                />
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setSecurityData({ ...securityData, isEnabling: false, tfaCode: '' })}
                                                    className="h-[52px] px-8 border border-gray-100 text-taxable-dark font-bold rounded-xl hover:bg-gray-50 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleEnable2FA}
                                                    disabled={apiLoading || (securityData.tfaCode?.length || 0) < 6}
                                                    className="h-[52px] px-10 bg-[#00388D] text-white font-bold rounded-xl hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {apiLoading ? "Verifying..." : "Verify & Enable"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setSecurityData({ ...securityData, isEnabling: true })}
                                            className="h-[52px] px-8 bg-white border border-gray-100 text-taxable-dark font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                                        >
                                            Enable 2FA
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeSection === 'Preferences' && (
                            <div className="animate-in fade-in duration-500 max-w-[540px]">
                                <h2 className="text-[20px] font-bold text-taxable-dark mb-8">Email Notifications</h2>

                                <div className="space-y-6">
                                    {[
                                        { key: 'filingReminders', label: 'Tax filing reminders' },
                                        { key: 'accountUpdates', label: 'Important account updates' },
                                        { key: 'productUpdates', label: 'Product updates and new features' },
                                        { key: 'tipsContent', label: 'Tips and educational content' },
                                        { key: 'deadlineReminders', label: 'Filing deadline reminders' }
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center justify-between pb-4 border-b border-gray-50 last:border-0">
                                            <span className="text-[15px] font-medium text-taxable-dark">{item.label}</span>
                                            <Toggle
                                                enabled={preferences[item.key as keyof typeof preferences]}
                                                onChange={() => setPreferences({ ...preferences, [item.key]: !preferences[item.key as keyof typeof preferences] })}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeSection === 'Support & About' && (
                            <div className="py-20 text-center animate-in fade-in duration-500">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Image src="/icons/docs.svg" alt="settings" width={28} height={28} />
                                </div>
                                <h3 className="text-lg font-bold text-taxable-dark mb-2">{activeSection}</h3>
                                <p className="text-taxable-gray font-medium">Coming soon.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
