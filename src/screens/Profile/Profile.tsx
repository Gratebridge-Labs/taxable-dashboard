'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';
import { useApi } from '@/hooks/useApi';
import { useUser } from '@/contexts/UserContext';
import { useEffect } from 'react';
import QRCode from "react-qr-code";

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


export default function Profile() {
    const { user, setUser, refreshUser } = useUser();
    const [activeSection, setActiveSection] = useState('Personal Information');
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const { get, post, patch, loading: apiLoading, error: apiError } = useApi();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showSupport, setShowSupport] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        tin: '',
        phone: '',
        email: '',
        whatsappReminders: false
    });

    useEffect(() => {
        if (user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                tin: user.tin || '',
                phone: user.phone || '',
                email: user.email || '',
                whatsappReminders: user.whatsappReminders || false
            });
        }
    }, [user]);

    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        tfaType: 'authenticator' as 'authenticator' | 'sms',
        tfaCode: '',
        isEnabling: false
    });

    const [tfaSetupData, setTfaSetupData] = useState<{
        secret: string;
        qrCode: string;
        manualEntryKey: string;
    } | null>(null);

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

    const handleInitiate2FA = async () => {
        setSuccessMessage(null);
        try {
            const response = await get('/auth/setup-2fa');
            if (response?.success && response?.data) {
                setTfaSetupData(response.data);
                setSecurityData({ ...securityData, isEnabling: true });
            }
        } catch (err) {
            console.error("Failed to initiate 2FA setup:", err);
        }
    };

    const handleVerify2FA = async () => {
        setSuccessMessage(null);
        if (!securityData.tfaCode) return;

        try {
            const response = await post('/auth/enable-2fa', {
                code: securityData.tfaCode
            });

            if (response?.success) {
                setSuccessMessage("Two-factor authentication has been successfully enabled for your account.");
                setSecurityData({
                    ...securityData,
                    tfaCode: '',
                    isEnabling: false
                });
                setTfaSetupData(null);
                refreshUser();
            }
        } catch (err) {
            console.error("Failed to verify 2FA:", err);
        }
    };

    const handleDisable2FA = async () => {
        setSuccessMessage(null);
        try {
            const response = await post('/auth/disable-2fa', {});
            if (response?.success) {
                setSuccessMessage("Two-factor authentication has been disabled from your account.");
                refreshUser();
            }
        } catch (err) {
            console.error("Failed to disable 2FA:", err);
        }
    };

    const handleSaveProfile = async () => {
        setSuccessMessage(null);
        try {
            const response = await patch('/auth/update-profile', {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                tin: formData.tin,
                whatsappReminders: formData.whatsappReminders
            });

            if (response?.success && response?.data?.user) {
                setUser(response.data.user);
                setSuccessMessage("Profile successfully updated.");
            }
        } catch (err) {
            console.error("Failed to update profile:", err);
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

            <main className="max-w-[1240px] mx-auto pt-8 md:pt-12 pb-20 px-4 md:px-8">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-12">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-taxable-dark mb-2 tracking-tight">Profile & Settings</h1>
                        <p className="text-[15px] md:text-lg text-taxable-gray font-medium max-w-[500px] leading-relaxed">
                            Everything you need to understand Nigerian taxes and make the most of Taxable
                        </p>
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowSupport(!showSupport)}
                            className="h-[48px] md:h-[52px] px-5 md:px-7 bg-white border border-gray-100 rounded-[18px] text-[14px] md:text-[15px] font-bold text-taxable-dark shadow-xs hover:shadow-md transition-all flex items-center gap-2"
                        >
                            Contact support
                        </button>

                        {showSupport && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowSupport(false)} />
                                <div className="absolute top-full mt-2 right-0 w-[280px] bg-white border border-gray-100 rounded-[32px] shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="flex flex-col gap-1">
                                        <button className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-gray-50 transition-colors text-taxable-dark text-[16px] font-bold text-left">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg>
                                            Chat with support
                                        </button>
                                        <a href="mailto:support@taxable.ng" className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-gray-50 transition-colors text-taxable-dark text-[16px] font-bold">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                            support@taxable.ng
                                        </a>
                                        <button className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-gray-50 transition-colors text-taxable-dark text-[16px] font-bold text-left">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19c0-1.657 2.239-3 5-3s5 1.343 5 3v1.662" /></svg>
                                            Consult an Accountant
                                        </button>
                                        <button className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-gray-50 transition-colors text-taxable-dark text-[16px] font-bold text-left">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><path d="M8 6h10" /><path d="M8 10h10" /><path d="M8 14h10" /></svg>
                                            Visit FIRS Resources
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:justify-center gap-10 lg:gap-16">
                    {/* Sidebar */}
                    <div className="w-full lg:w-[303px] h-auto lg:h-[218px] bg-white rounded-[20px] border border-gray-100 p-3 shadow-sm flex flex-col shrink-0 lg:sticky lg:top-24">
                        <h4 className="text-base font-medium text-taxable-dark mb-3 px-2">Select</h4>
                        <div className="flex flex-col gap-1 items-center">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setActiveSection(category)}
                                    className={`w-full lg:w-[279px] h-[44px] lg:h-[37px] flex items-center justify-between px-3 transition-all rounded-[8px] ${activeSection === category ? 'bg-[#F1F5F9] text-taxable-dark font-bold' : 'hover:bg-gray-50 text-taxable-gray'
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
                    <div className="flex-1 w-full max-w-full lg:max-w-[480px] lg:mx-auto">
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
                                    <div className="w-20 h-20 rounded-[24px] bg-[#F5F5F3] flex items-center justify-center shrink-0 overflow-hidden border border-gray-50 relative">
                                        <Image
                                            src={profileImage || "/icons/profile.svg"}
                                            alt="Profile"
                                            fill
                                            className={profileImage ? "object-cover" : "p-4 opacity-40"}
                                        />
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
                                    <button
                                        onClick={() => user && setFormData({
                                            firstName: user.firstName || '',
                                            lastName: user.lastName || '',
                                            tin: user.tin || '',
                                            phone: user.phone || '',
                                            email: user.email || '',
                                            whatsappReminders: user.whatsappReminders || false
                                        })}
                                        className="h-[52px] px-8 border border-gray-100 text-taxable-dark font-bold rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={apiLoading}
                                        className="h-[52px] px-10 bg-[#00388D] text-white font-bold rounded-xl hover:opacity-95 transition-opacity shadow-sm disabled:opacity-50"
                                    >
                                        {apiLoading ? 'Saving...' : 'Save'}
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

                                    {securityData.isEnabling && !user?.twoFactorEnabled ? (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                            {tfaSetupData && (
                                                <div className="bg-white border border-gray-100 rounded-[32px] p-8 flex flex-col items-center shadow-sm">
                                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#003787" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
                                                        </svg>
                                                    </div>

                                                    <h3 className="text-lg font-bold text-taxable-dark mb-2 text-center">Set up Authenticator App</h3>
                                                    <p className="text-[14px] text-taxable-gray font-medium mb-8 text-center leading-relaxed">
                                                        Open your authenticator app (like Google Authenticator or Authy) and scan the QR code below.
                                                    </p>

                                                    <div className="bg-white p-4 rounded-3xl border-4 border-gray-50 mb-8">
                                                        <QRCode
                                                            value={`otpauth://totp/Taxable:${user?.email || 'User'}?secret=${tfaSetupData.secret}&issuer=Taxable`}
                                                            size={200}
                                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                                            viewBox={`0 0 256 256`}
                                                        />
                                                    </div>

                                                    <div className="w-full space-y-4">
                                                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                                            <p className="text-[11px] text-taxable-blue font-bold uppercase tracking-wider mb-2">Can't scan? Enter manually</p>
                                                            <div className="flex items-center justify-between">
                                                                <code className="text-[13px] font-mono font-bold text-taxable-dark">{tfaSetupData.manualEntryKey}</code>
                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(tfaSetupData.manualEntryKey);
                                                                        setSuccessMessage("Key copied to clipboard!");
                                                                        setTimeout(() => setSuccessMessage(null), 3000);
                                                                    }}
                                                                    className="text-taxable-blue text-[12px] font-bold hover:underline"
                                                                >
                                                                    Copy
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="pt-4">
                                                <div className="mb-6">
                                                    <label className="block text-[14px] font-bold text-taxable-dark mb-3 text-center">Enter the 6-digit code from your app</label>
                                                    <div className="flex justify-center">
                                                        <input
                                                            type="text"
                                                            maxLength={6}
                                                            placeholder="000000"
                                                            className="w-48 h-14 bg-white border border-gray-100 rounded-[18px] text-center text-2xl font-bold tracking-[0.5em] text-taxable-dark focus:outline-none focus:ring-2 focus:ring-taxable-blue/20 placeholder:text-gray-200"
                                                            value={securityData.tfaCode}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/\D/g, '');
                                                                setSecurityData({ ...securityData, tfaCode: val });
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => {
                                                            setSecurityData({ ...securityData, isEnabling: false, tfaCode: '' });
                                                            setTfaSetupData(null);
                                                        }}
                                                        className="flex-1 h-14 bg-white border border-gray-100 text-taxable-dark font-bold rounded-2xl hover:bg-gray-50 transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleVerify2FA}
                                                        disabled={apiLoading || securityData.tfaCode.length !== 6}
                                                        className="flex-[1.5] h-14 bg-[#00388D] text-white font-bold rounded-2xl hover:opacity-95 transition-all shadow-lg shadow-blue-900/10 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                                                    >
                                                        {apiLoading ? (
                                                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                        ) : "Enable 2FA"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4">
                                            {user?.twoFactorEnabled ? (
                                                <div className="bg-white border border-gray-100 rounded-[24px] p-6 flex flex-col items-center">
                                                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 11 11 13 15 9" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-[14px] text-taxable-gray font-medium mb-6 text-center">
                                                        2FA is currently <span className="text-green-600 font-bold">Enabled</span>. Your account is protected with an extra layer of security.
                                                    </p>
                                                    <button
                                                        onClick={handleDisable2FA}
                                                        className="h-[52px] px-8 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors w-full flex items-center justify-center gap-2"
                                                    >
                                                        {apiLoading ? "Disabling..." : "Disable 2FA"}
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={handleInitiate2FA}
                                                    className="h-[52px] px-8 bg-white border border-gray-100 text-taxable-dark font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                                                >
                                                    Enable 2FA
                                                </button>
                                            )}
                                        </div>
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
