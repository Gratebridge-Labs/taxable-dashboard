'use client';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Home2Fill } from '@mingcute/react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PrimaryButton, SecondaryButton } from '@/screens/TaxFolders/TaxFolderShared';
import { useApi } from '@/hooks/useApi';
import { useUser } from '@/contexts/UserContext';
import { useProfile } from '@/contexts/ProfileContext';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DEDUCTION_LABELS: Record<string, string> = {
    health: 'Health Insurance',
    pension: 'Pension',
    mortgage: 'Mortgage Interest',
    rent: 'Rent Receipt',
};

const INCOME_LABELS: Record<string, string> = {
    salary: 'Salary / Employment',
    business: 'Business / Self-employment',
    freelance: 'Freelance / Consulting',
    investment: 'Investment',
    rental: 'Rental Income',
    crypto: 'Digital Assets / Crypto',
};


export default function Profile() {
    const router = useRouter();
    const { user, setUser } = useUser();
    const { profiles } = useProfile();
    const [activeSection, setActiveSection] = useState('Personal Information');
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const { post, patch, loading: apiLoading, error: apiError } = useApi();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
        newPassword: ''
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const el = fileInputRef.current;
        if (!el) return;
        const handler = (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const imageUrl = URL.createObjectURL(file);
                setProfileImage(imageUrl);
            }
            (e.target as HTMLInputElement).value = '';
        };
        el.addEventListener('change', handler);
        return () => el.removeEventListener('change', handler);
    }, []);

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
                setSuccessMessage('Profile successfully updated.');
            }
        } catch (err) {
            console.error('Failed to update profile:', err);
        }
    };

    interface DocEntry {
        taxType: string;
        year: string;
        category: string;
        fileName: string;
        profileId: string;
        link: string;
    }

    const documents = useMemo(() => {
        const docs: DocEntry[] = [];
        for (const p of profiles) {
            const pid = p.profileId;
            const year = String(p.year || '2026');
            if (!pid) continue;

            if (p.profileType === 'Individual') {
                try {
                    const raw = localStorage.getItem(`taxable_pit_income_${pid}`);
                    if (!raw) continue;
                    const data = JSON.parse(raw);
                    if (data.deductionFiles) {
                        for (const [key, files] of Object.entries(data.deductionFiles)) {
                            const sepIdx = key.lastIndexOf('_');
                            const type = key.slice(0, sepIdx);
                            const monthIdx = parseInt(key.slice(sepIdx + 1));
                            const monthName = MONTHS[monthIdx] || `Month ${monthIdx}`;
                            const cat = `${DEDUCTION_LABELS[type] || type} (${monthName})`;
                            for (const f of files as { name: string }[]) {
                                docs.push({
                                    taxType: 'Personal Income Tax',
                                    year,
                                    category: cat,
                                    fileName: f.name,
                                    profileId: pid,
                                    link: `/tax-folders/pit?id=${pid}&section=income-deductions`,
                                });
                            }
                        }
                    }
                    if (data.incomeFiles) {
                        for (const [key, files] of Object.entries(data.incomeFiles)) {
                            const sepIdx = key.lastIndexOf('_');
                            const type = key.slice(0, sepIdx);
                            const monthIdx = parseInt(key.slice(sepIdx + 1));
                            const monthName = MONTHS[monthIdx] || `Month ${monthIdx}`;
                            const cat = `${INCOME_LABELS[type] || type} (${monthName})`;
                            for (const f of files as { name: string }[]) {
                                docs.push({
                                    taxType: 'Personal Income Tax',
                                    year,
                                    category: cat,
                                    fileName: f.name,
                                    profileId: pid,
                                    link: `/tax-folders/pit?id=${pid}&section=income-deductions`,
                                });
                            }
                        }
                    }
                } catch { /* ignore */ }
            }

            if (p.profileType === 'Business') {
                try {
                    const raw = localStorage.getItem(`taxable_wht_deductions_${pid}_${year}`);
                    if (!raw) continue;
                    const deductions = JSON.parse(raw);
                    if (!Array.isArray(deductions)) continue;
                    for (const d of deductions) {
                        if (!d.receipt) continue;
                        const files = d.receipt.split(',').map((s: string) => s.trim()).filter(Boolean);
                        for (const fname of files) {
                            docs.push({
                                taxType: 'WHT Deductions',
                                year,
                                category: d.payee || 'Unknown Payee',
                                fileName: fname,
                                profileId: pid,
                                link: `/tax-folders/business?profileId=${pid}`,
                            });
                        }
                    }
                } catch { /* ignore */ }
            }
        }
        return docs;
    }, [profiles]);

    const groupedDocs = useMemo(() => {
        const groups: Record<string, Record<string, DocEntry[]>> = {};
        for (const doc of documents) {
            const groupKey = `${doc.taxType} — ${doc.year}`;
            if (!groups[groupKey]) groups[groupKey] = {};
            if (!groups[groupKey][doc.category]) groups[groupKey][doc.category] = [];
            groups[groupKey][doc.category].push(doc);
        }
        return groups;
    }, [documents]);

    const categories = [
        'Personal Information',
        'Security',
        'Documents',
        'Support & About'
    ];

    const fileIcon = (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 shrink-0">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
        </svg>
    );

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Nav bar */}
            <div className="w-full bg-white border-b border-neutral-100 px-4 md:px-8 py-3">
                <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-1">
                    <button onClick={() => router.push('/home')} className="flex items-center gap-2 text-3 font-semibold text-neutral-800 w-fit shrink-0">
                        <Home2Fill className="w-5 h-5" color="#E5E5E5" />
                        Home
                    </button>
                    <div className="flex items-center gap-2 text-1 text-neutral-300 font-medium">
                        <span>Profile & Settings</span>
                        <span>/</span>
                        <span className="text-neutral-300">{activeSection}</span>
                    </div>
                </div>
            </div>

            <main className="max-w-[1200px] mx-auto px-4 md:px-8 pt-14 pb-8">
                <div className="flex items-start gap-10">
                    {/* Sidebar */}
                    <div className="w-[250px] flex-shrink-0 bg-white rounded-2xl border border-neutral-100 p-3 flex flex-col sticky top-24">
                        <h4 className="text-1 font-semibold text-neutral-400 uppercase tracking-wider mb-3 px-2">Settings</h4>
                        <div className="flex flex-col gap-1">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setActiveSection(category)}
                                    className={`w-full h-9 flex items-center justify-between px-3 rounded-lg ${activeSection === category ? 'bg-neutral-100 text-neutral-800 font-semibold' : 'text-neutral-500'
                                        }`}
                                >
                                    <span className={`text-2 ${activeSection === category ? 'font-semibold' : 'font-medium'}`}>{category}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {activeSection === 'Personal Information' && (
                            <div className="flex flex-col items-center" data-animate>
                                <h2 className="text-6 font-semibold text-neutral-800 tracking-[-0.02em] mb-8 w-full max-w-[400px]">Personal Information</h2>

                                <div className="space-y-10 w-full max-w-[400px]">
                                    {/* Profile Image */}
                                    <div className="flex items-start gap-5 pb-6 border-b border-neutral-100">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                        <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 overflow-hidden relative">
                                            {profileImage ? (
                                                <Image src={profileImage} alt="Profile" fill className="object-cover" />
                                            ) : (
                                                <Image src="/Avatar.svg" alt="Profile" width={60} height={60} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-3 font-semibold text-neutral-800 mb-0.5">{user?.firstName} {user?.lastName}</p>
                                            <p className="text-2 text-neutral-400 font-medium mb-3">{user?.email}</p>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="h-9 px-4 border border-neutral-200 bg-white text-neutral-800 font-semibold rounded-lg text-2"
                                            >
                                                Change photo
                                            </button>
                                        </div>
                                    </div>

                                    {/* First Name + Last Name */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-2 font-medium text-neutral-500 mb-1 block">First Name</label>
                                            <Input
                                                type="text"
                                                placeholder="First name"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-2 font-medium text-neutral-500 mb-1 block">Last Name</label>
                                            <Input
                                                type="text"
                                                placeholder="Last name"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* TIN */}
                                    <div>
                                        <label className="text-2 font-medium text-neutral-500 mb-1 block">Tax Identification Number</label>
                                        <Input
                                            type="text"
                                            placeholder="Enter TIN"
                                            value={formData.tin}
                                            onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
                                        />
                                    </div>

                                    {/* Email + Phone */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-2 font-medium text-neutral-500 mb-1 block">Email Address</label>
                                            <Input
                                                type="email"
                                                placeholder="Enter email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-2 font-medium text-neutral-500 mb-1 block">Phone Number</label>
                                            <Input
                                                type="tel"
                                                placeholder="Enter phone"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* WhatsApp */}
                                    <div className="pt-2">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <Checkbox
                                                checked={formData.whatsappReminders}
                                                onCheckedChange={(c) => setFormData({ ...formData, whatsappReminders: c === true })}
                                            />
                                            <span className="text-3 font-medium text-neutral-800">Receive tax deadline reminders via WhatsApp</span>
                                        </label>
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex items-center gap-3 pt-2">
                                        <SecondaryButton onClick={() => user && setFormData({
                                            firstName: user.firstName || '',
                                            lastName: user.lastName || '',
                                            tin: user.tin || '',
                                            phone: user.phone || '',
                                            email: user.email || '',
                                            whatsappReminders: user.whatsappReminders || false
                                        })}>Reset</SecondaryButton>
                                        <PrimaryButton onClick={handleSaveProfile} disabled={apiLoading}>
                                            {apiLoading ? 'Saving...' : 'Save'}
                                        </PrimaryButton>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'Security' && (
                            <div className="flex flex-col items-center" data-animate>
                                <h2 className="text-6 font-semibold text-neutral-800 tracking-[-0.02em] mb-8 w-full max-w-[400px]">Security</h2>

                                <div className="space-y-10 w-full max-w-[400px]">
                                    {/* Current password */}
                                    <div>
                                        <label className="text-2 font-medium text-neutral-500 mb-1 block">Current password</label>
                                        <Input
                                            type="password"
                                            placeholder="Enter current password"
                                            value={securityData.currentPassword}
                                            onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                                        />
                                    </div>

                                    {/* New password */}
                                    <div>
                                        <label className="text-2 font-medium text-neutral-500 mb-1 block">New Password</label>
                                        <Input
                                            type="password"
                                            placeholder="Enter new password"
                                            value={securityData.newPassword}
                                            onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                                        />
                                        <p className="text-1 text-neutral-400 font-medium mt-1.5">At least 8 characters. Make it strong!</p>
                                    </div>

                                    {apiError && (
                                        <div className="text-2 text-destructive font-medium bg-red-50 p-3 rounded-xl">{apiError}</div>
                                    )}

                                    {successMessage && (
                                        <div className="text-2 text-green-600 font-medium bg-green-50 p-3 rounded-xl">{successMessage}</div>
                                    )}

                                    {/* Password buttons */}
                                    <div className="flex items-center gap-3">
                                        <SecondaryButton onClick={() => {
                                            setSecurityData({ ...securityData, currentPassword: '', newPassword: '' });
                                            setSuccessMessage(null);
                                        }}>Cancel</SecondaryButton>
                                        <PrimaryButton onClick={handlePasswordChange} disabled={apiLoading || !securityData.currentPassword || !securityData.newPassword}>
                                            {apiLoading ? 'Updating...' : 'Change password'}
                                        </PrimaryButton>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'Documents' && (
                            <div className="flex flex-col" data-animate>
                                <h2 className="text-6 font-semibold text-neutral-800 tracking-[-0.02em] mb-8 w-full max-w-[500px]">Documents</h2>

                                {Object.keys(groupedDocs).length === 0 ? (
                                    <div className="py-16 text-center">
                                        <div className="w-14 h-14 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                                <line x1="16" y1="13" x2="8" y2="13" />
                                                <line x1="16" y1="17" x2="8" y2="17" />
                                            </svg>
                                        </div>
                                        <p className="text-3 text-neutral-500 font-medium">No documents uploaded yet.</p>
                                        <p className="text-2 text-neutral-400 mt-1">Documents you upload in your tax folders will appear here.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-8 max-w-[500px]">
                                        {Object.entries(groupedDocs).map(([groupKey, categories]) => (
                                            <div key={groupKey}>
                                                <h3 className="text-4 font-semibold text-neutral-800 mb-4">{groupKey}</h3>
                                                <div className="space-y-0 border border-neutral-100 rounded-2xl overflow-hidden">
                                                    {Object.entries(categories).map(([category, entries], ci) => (
                                                        <div key={category}>
                                                            <div className={`${ci > 0 ? 'border-t border-neutral-50' : ''}`}>
                                                                <div className="px-5 py-3 bg-neutral-50">
                                                                    <p className="text-2 font-medium text-neutral-500">{category}</p>
                                                                </div>
                                                                {entries.map((doc, fi) => (
                                                                    <div key={fi} className={`flex items-center justify-between px-5 py-3 ${fi < entries.length - 1 ? 'border-b border-neutral-50' : ''}`}>
                                                                        <div className="flex items-center gap-3 min-w-0">
                                                                            {fileIcon}
                                                                            <span className="text-2 text-neutral-700 font-medium truncate">{doc.fileName}</span>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => router.push(doc.link)}
                                                                            className="text-2 text-taxable-blue font-semibold shrink-0 ml-4"
                                                                        >
                                                                            View in folder
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeSection === 'Support & About' && (
                            <div className="flex flex-col items-center py-20" data-animate>
                                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Image src="/icons/docs.svg" alt="settings" width={28} height={28} />
                                </div>
                                <h3 className="text-5 font-semibold text-neutral-800 mb-2">Support & About</h3>
                                <p className="text-neutral-500 font-medium">Coming soon.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
