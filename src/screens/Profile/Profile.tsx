'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';

const ProfileField = ({ label, placeholder, value, onChange, type = "text" }: { label: string; placeholder: string; value: string; onChange: (val: string) => void; type?: string }) => (
    <div className="mb-6">
        <label className="block text-sm font-medium text-taxable-dark mb-2">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-[52px] bg-white border border-gray-100 rounded-[12px] px-4 text-taxable-dark focus:outline-none focus:ring-1 focus:ring-taxable-blue/20 placeholder:text-gray-300"
        />
    </div>
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
    const [formData, setFormData] = useState({
        fullName: 'Sophia Williams',
        phone: '+234',
        email: ''
    });

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
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
                                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                    {profileImage ? (
                                        <div className="w-20 h-20 rounded-full overflow-hidden relative border border-gray-100 shrink-0">
                                            <Image
                                                src={profileImage}
                                                alt="Profile"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <AvatarSVG initials="OB" />
                                    )}
                                    <div>
                                        <h3 className="text-base font-semibold text-taxable-dark mb-0.5">Upload Image</h3>
                                        <p className="text-sm text-taxable-gray font-medium mb-3">Min 400x400px, PNG or JPEG</p>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="h-9 px-4 border border-gray-100 rounded-lg text-sm font-bold text-taxable-dark hover:bg-gray-50 transition-colors"
                                        >
                                            Upload
                                        </button>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <ProfileField
                                    label="Full Name"
                                    placeholder="Sophia Williams"
                                    value={formData.fullName}
                                    onChange={(val) => setFormData({ ...formData, fullName: val })}
                                />
                                <ProfileField
                                    label="Phone number"
                                    placeholder="+234"
                                    value={formData.phone}
                                    onChange={(val) => setFormData({ ...formData, phone: val })}
                                />
                                <ProfileField
                                    label="Email address"
                                    placeholder="Enter"
                                    value={formData.email}
                                    onChange={(val) => setFormData({ ...formData, email: val })}
                                    type="email"
                                />

                                {/* Action Buttons */}
                                <div className="flex items-center gap-4 mt-10">
                                    <button className="h-[46px] px-8 bg-[#00513D] text-white font-bold rounded-2xl hover:opacity-95 transition-opacity shadow-sm">
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setFormData({ fullName: 'Sophia Williams', phone: '+234', email: '' })}
                                        className="h-[46px] px-8 bg-[#F5F5F3] text-taxable-dark font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeSection !== 'Personal Information' && (
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
