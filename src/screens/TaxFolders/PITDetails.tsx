'use client';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Info, ChevronRight } from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';
import ReviewAndFile from './ReviewAndFile';
import { useProfile } from '@/contexts/ProfileContext';
import { useUser } from '@/contexts/UserContext';
import { useTaxableApi } from '@/lib';
import { useToast } from '@/components/Toast/ToastProvider';
import type { Profile, IncomeRecord, Deduction, DeductionType, BatchDeductionItem } from '@/types/api';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const stripNumberFormatting = (input: string) => input.replace(/[^\d.]/g, '');

const formatNumberWithCommas = (raw: string) => {
    const cleaned = stripNumberFormatting(raw);
    if (!cleaned) return '';
    const [intPart, decPart] = cleaned.split('.');
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (decPart === undefined) return formattedInt;
    return `${formattedInt}.${decPart}`;
};

const IncomeField = ({ label, value, onChange, placeholder = "N0" }: { label: string; value: string; onChange: (val: string) => void; placeholder?: string }) => (
    <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#64748B] leading-none uppercase tracking-wide">
            {label}
            <span className="w-3.5 h-3.5 rounded-full bg-gray-100 text-[#94A3B8] flex items-center justify-center text-[10px] cursor-help">i</span>
        </label>
        <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-medium text-[#94A3B8]">₦</span>
            <input 
                type="text" 
                value={formatNumberWithCommas(value)}
                onChange={(e) => onChange(stripNumberFormatting(e.target.value))}
                placeholder={placeholder}
                className="w-full h-12 border border-gray-100 bg-white rounded-2xl pl-8 pr-4 text-[14px] font-bold text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all placeholder:text-[#94A3B8]/40" 
            />
        </div>
    </div>
);

const DeductionItem = ({ 
    label, 
    value, 
    onChange, 
    uploadLabel, 
    onUpload,
    status, 
    statusMessage, 
    fileName,
    onDeleteFile = () => {}
}: { 
    label: string; 
    value: string; 
    onChange: (val: string) => void;
    uploadLabel: string;
    onUpload?: (file: File) => Promise<void>;
    status?: 'pending' | 'completed' | 'verified';
    statusMessage?: string;
    fileName?: string;
    onDeleteFile?: () => void;
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onUpload) return;
        setUploading(true);
        try {
            await onUpload(file);
        } catch (err: any) {
            // handled by parent
            throw err;
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
    <div className="space-y-4">
        <div>
            <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] mb-2 leading-none">
                {label}
                <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
            </label>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-medium text-[#6B7280]">₦</span>
                <input 
                    type="text" 
                    value={formatNumberWithCommas(value)}
                    onChange={(e) => onChange(stripNumberFormatting(e.target.value))}
                    placeholder="NG"
                    className="w-full h-12 border border-gray-100 bg-white rounded-2xl pl-8 pr-4 text-[14px] font-bold text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all placeholder:text-gray-300" 
                />
            </div>
        </div>

        <div className="bg-[#F9FAFB] rounded-2xl p-6 border border-gray-50">
            <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] mb-4 leading-none">
                {uploadLabel}
                <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
            </label>
            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <p className="text-[13px] font-bold text-[#0C0C0E]">{fileName}</p>
                            {status === 'completed' && <div className="w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg></div>}
                            {status === 'verified' && <div className="w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg></div>}
                        </div>
                        <p className="text-[11px] text-[#94A3B8] font-medium">{status === 'completed' || status === 'verified' ? 'Uploaded • Completed' : 'PDF, JPG, or PNG (Max 20MB)'}</p>
                    </div>
                </div>
                {status === 'completed' || status === 'verified' ? (
                    <button onClick={onDeleteFile} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                ) : (
                    <>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf,image/jpeg,image/png,image/gif,image/webp"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="h-10 px-5 border border-gray-100 bg-white rounded-xl text-[13px] font-bold text-[#0C0C0E] hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </>
                )}
            </div>
            {statusMessage && (
                <p className={`mt-3 text-[11px] font-bold leading-relaxed ${status === 'verified' ? 'text-[#16A34A]' : 'text-[#DAA520]'}`}>
                    {statusMessage}
                </p>
            )}
            {!statusMessage && !fileName?.includes('Required') && (
                <div className="mt-3 flex items-start gap-1.5 opacity-60">
                    <Info size={12} className="text-[#94A3B8] flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[#64748B] font-medium leading-relaxed">
                        Once uploaded, our system will verify your document against NRS records to lock in your tax relief
                    </p>
                </div>
            )}
        </div>
    </div>
    );
};

export default function PITDetails() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const profileId = searchParams.get('profileId') || searchParams.get('id') || '';
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : 2026;
    
    const { currentProfile, setCurrentProfile, loading: profileLoading } = useProfile();
    const { user, token, loading: authLoading } = useUser();
    const toast = useToast();
    const { getProfile, getIncomeList, getDeductionList, getTaxSummary, updatePersonalInfo, completeProfile, addIncome, updateIncome, deleteIncome, uploadFile, uploadSimple, batchCreateDeductions, updateDeduction, deleteDeduction, getIncomeData, updateMonthlyIncomeData, updateAnnualIncomeData, calculateTaxByMonth, calculateTaxGet } = useTaxableApi();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>([]);
    const [incomeData, setIncomeData] = useState<any[][]>([[], [], [], [], [], [], [], [], [], [], [], []]);
    const [deductions, setDeductions] = useState<Deduction[]>([]);
    const [taxSummary, setTaxSummary] = useState<any>(null);
    const [calculatedTax, setCalculatedTax] = useState<any>(null);
    const [calculatingTax, setCalculatingTax] = useState(false);
    const [savingPersonalInfo, setSavingPersonalInfo] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    
    const [personalInfo, setPersonalInfo] = useState({
        nin: '',
        fullName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        streetAddress: '',
        city: '',
        state: '',
        residencyStatus: 'resident'
    });

    const [activeSection, setActiveSection] = useState<'personal-info' | 'income-deductions' | 'review'>('personal-info');
    const [periodMode, setPeriodMode] = useState<'monthly' | 'annually'>('monthly');
    const [activeMonth, setActiveMonth] = useState('January');
    const [incomeSubTab, setIncomeSubTab] = useState<'income' | 'deductions'>('income');
    const [expandedMonth, setExpandedMonth] = useState<string | null>('January');
    
    const [currentMonthIncome, setCurrentMonthIncome] = useState({
        salary: '', bonuses: '', commissions: '',
        freelance: '', digitalAssets: ''
    });

    const [annualIncome, setAnnualIncome] = useState({
        salary: '', bonuses: '', commissions: '',
        freelance: '', digitalAssets: ''
    });

    const [savingMonthlyIncome, setSavingMonthlyIncome] = useState(false);
    const [incomeSaved, setIncomeSaved] = useState(false);
    const [deductionsSaved, setDeductionsSaved] = useState(false);
    
    const [incomeModalOpen, setIncomeModalOpen] = useState(false);
    const [editingIncome, setEditingIncome] = useState<IncomeRecord | null>(null);
    const [savingIncome, setSavingIncome] = useState(false);
    
    const [incomeForm, setIncomeForm] = useState({
        type: 'employment' as 'employment' | 'freelance' | 'crypto',
        category: 'salary' as 'salary' | 'freelance_fee' | 'crypto',
        amount: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        employerName: '',
        employerTIN: '',
        bonuses: '',
        commissions: ''
    });

    const [deductionModalOpen, setDeductionModalOpen] = useState(false);
    const [editingDeduction, setEditingDeduction] = useState<Deduction | null>(null);
    const [savingDeduction, setSavingDeduction] = useState(false);

    const [reliefs, setReliefs] = useState({
        rentRelief: '',
        pension: '',
        healthInsurance: '',
        mortgage: ''
    });

    const [documentUrls, setDocumentUrls] = useState({
        rentRelief: '',
        healthInsurance: '',
        pension: '',
        mortgage: ''
    });

    const [uploadedFileNames, setUploadedFileNames] = useState({
        rentRelief: '',
        healthInsurance: '',
        pension: '',
        mortgage: ''
    });

    const [savingReliefs, setSavingReliefs] = useState(false);

    const [deductionForm, setDeductionForm] = useState({
        deductionType: 'pension' as DeductionType,
        amount: '',
        year: new Date().getFullYear()
    });

    const toIsoDate = (input: string) => {
        const trimmed = input.trim();
        if (!trimmed) return undefined;
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
        
        // Handle "DD / MM / YYYY" with spaces and slashes
        const parts = trimmed.split(/[\/\-]/).map(p => p.trim());
        if (parts.length === 3) {
            const dd = parts[0].padStart(2, '0');
            const mm = parts[1].padStart(2, '0');
            const yyyy = parts[2];
            if (dd.length === 2 && mm.length === 2 && yyyy.length === 4) {
                return `${yyyy}-${mm}-${dd}`;
            }
        }
        
        // Fallback for concatenated digits DDMMYYYY
        const digitsOnly = trimmed.replace(/\D/g, '');
        if (digitsOnly.length === 8) {
            const dd = digitsOnly.slice(0, 2);
            const mm = digitsOnly.slice(2, 4);
            const yyyy = digitsOnly.slice(4, 8);
            return `${yyyy}-${mm}-${dd}`;
        }
        
        return undefined;
    };

    const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value.length > 8) value = value.slice(0, 8); // Cap at 8 digits
        
        let formatted = '';
        if (value.length > 0) {
            formatted = value.slice(0, 2);
            if (value.length > 2) {
                formatted += ' / ' + value.slice(2, 4);
                if (value.length > 4) {
                    formatted += ' / ' + value.slice(4, 8);
                }
            }
        }
        setPersonalInfo({ ...personalInfo, dateOfBirth: formatted });
    };

    const loadProfileData = useCallback(async () => {
        if (!profileId) {
            setLoading(false);
            return;
        }

        // Wait for auth state hydration before calling authenticated APIs.
        if (authLoading) {
            return;
        }

        // If there's no token after auth has loaded, redirect to sign-in.
        if (!token) {
            setError('Authentication required');
            setLoading(false);
            router.replace('/signin');
            return;
        }
        
        setLoading(true);
        try {
            const profile = await getProfile(profileId);
            
            if (profile) {
                console.log('[PITDetails] Profile data:', JSON.stringify(profile, null, 2));
                setCurrentProfile(profile);
                
                const defaultFullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
                
                const profileData = profile as any;
                
                console.log('[PITDetails] nin:', profileData.nin);
                console.log('[PITDetails] dob:', profileData.dob);
                console.log('[PITDetails] street:', profileData.street);
                console.log('[PITDetails] city:', profileData.city);
                console.log('[PITDetails] state:', profileData.state);
                
                const formatDob = (dobStr: string) => {
                    if (!dobStr) return '';
                    const date = new Date(dobStr);
                    if (isNaN(date.getTime())) return dobStr;
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    return `${day} / ${month} / ${year}`;
                };
                
                setPersonalInfo({
                    nin: profileData.nin || '',
                    fullName: profileData.fullName || defaultFullName || '',
                    email: profileData.email || user?.email || '',
                    phone: profileData.phone || user?.phone || '',
                    dateOfBirth: profileData.dob ? formatDob(profileData.dob) : '',
                    streetAddress: profileData.streetAddress || profileData.street || '',
                    city: profileData.city || '',
                    state: profileData.state || '',
                    residencyStatus: profileData.residencyStatus || (profileData.residency183Days ? 'resident' : 'non-resident')
                });
                
                console.log('[PITDetails] Set personalInfo with:', {
                    nin: profileData.nin,
                    fullName: profileData.fullName || defaultFullName,
                    streetAddress: profileData.streetAddress || profileData.street,
                    city: profileData.city,
                    state: profileData.state
                });
                
                const [incomeRes, deductionRes, summaryRes] = await Promise.all([
                    getIncomeList(profileId, { year }),
                    getDeductionList(profileId, year),
                    getTaxSummary(profileId, year)
                ]);
                
                if (incomeRes.success) {
                    setIncomeRecords(incomeRes.data.incomeRecords || []);
                }
                if (deductionRes.success) {
                    const loadedDeductions = deductionRes.data?.deductions || [];
                    setDeductions(loadedDeductions);
                }
                if (summaryRes.success) {
                    setTaxSummary(summaryRes.data);
                }

                try {
                    const incomeDataRes = await getIncomeData(profileId);
                    if (incomeDataRes.success && incomeDataRes.data.incomes) {
                        setIncomeData(incomeDataRes.data.incomes);
                    }
                } catch (incomeDataErr) {
                    console.log('[PITDetails] Using legacy income data, income-data API not available');
                }
            } else {
                console.log('[PITDetails] No profile returned');
            }
        } catch (err: any) {
            console.error('[PITDetails] Error loading profile data:', err);
            setError(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    }, [profileId, year, authLoading, token, router, getProfile, setCurrentProfile, getIncomeList, getDeductionList, getTaxSummary, getIncomeData, user]);

    useEffect(() => {
        if (periodMode === 'monthly') {
            const monthNum = MONTHS.indexOf(activeMonth) + 1;
            const monthIndex = monthNum - 1;
            
            const data = {
                salary: '', bonuses: '', commissions: '',
                freelance: '', digitalAssets: ''
            };
            
            if (incomeData && incomeData[monthIndex] && incomeData[monthIndex].length > 0) {
                incomeData[monthIndex].forEach((item: any) => {
                    if (item.type === 'employment') {
                        data.salary = item.grossSalary?.toString() || '';
                        data.bonuses = item.bonuses?.toString() || '';
                        data.commissions = item.commissions?.toString() || '';
                    } else if (item.type === 'freelance') {
                        data.freelance = item.value?.toString() || '';
                    } else if (item.type === 'digital_assets') {
                        data.digitalAssets = item.value?.toString() || '';
                    }
                });
            } else {
                const records = incomeRecords.filter(r => r.period.month === monthNum);
                records.forEach(r => {
                    if (r.category === 'salary') {
                        data.salary = r.totalAmount.toString();
                        data.bonuses = r.employment?.bonuses?.toString() || '';
                        data.commissions = r.employment?.commissions?.toString() || '';
                    } else if (r.category === 'freelance_fee') {
                        data.freelance = r.totalAmount.toString();
                    }
                });
            }
            setCurrentMonthIncome(data);
        } else if (periodMode === 'annually') {
            const data = {
                salary: '', bonuses: '', commissions: '',
                freelance: '', digitalAssets: ''
            };
            
            const annualIncomes = incomeData && incomeData[0] ? incomeData[0] : [];
            if (annualIncomes && annualIncomes.length > 0) {
                annualIncomes.forEach((item: any) => {
                    if (item.type === 'employment') {
                        data.salary = item.grossSalary?.toString() || '';
                        data.bonuses = item.bonuses?.toString() || '';
                        data.commissions = item.commissions?.toString() || '';
                    } else if (item.type === 'freelance') {
                        data.freelance = item.value?.toString() || '';
                    } else if (item.type === 'digital_assets') {
                        data.digitalAssets = item.value?.toString() || '';
                    }
                });
            }
            setAnnualIncome(data);
        }
    }, [activeMonth, incomeRecords, incomeData, periodMode]);

    useEffect(() => {
        loadProfileData();
    }, [loadProfileData]);

    useEffect(() => {
        // If we already have saved data from the API, treat steps as complete.
        const monthNum = MONTHS.indexOf(activeMonth) + 1;
        const monthIndex = monthNum - 1;
        const hasIncomeForMonth =
            (incomeData?.[monthIndex]?.length ?? 0) > 0 ||
            incomeRecords.some(r => r.period.month === monthNum);

        if (hasIncomeForMonth) setIncomeSaved(true);
        if ((deductions?.length ?? 0) > 0) setDeductionsSaved(true);
    }, [activeMonth, incomeData, incomeRecords, deductions]);

    const canCalculateMonthlyTax =
        periodMode === 'monthly'
            ? incomeSaved && deductionsSaved
            : true;

    const activeMonthNum = MONTHS.indexOf(activeMonth) + 1;

    type NormalizedDeduction = {
        type?: string;
        value?: number;
        frequency: string;
        month: number | null;
        documentUrl?: string;
        raw: any;
    };

    const normalizeDeduction = useCallback((d: any): NormalizedDeduction => {
        const type = (d?.type ?? d?.deductionType) as string | undefined;
        const value = (d?.value ?? d?.amount) as number | undefined;
        const frequency = (d?.frequency ?? 'annual') as string;
        const month = (d?.month ?? null) as number | null;
        const documentUrl = d?.documentUrl as string | undefined;
        return { type, value, frequency, month, documentUrl, raw: d };
    }, []);

    const monthScopedDeductions = useMemo(() => {
        const list = (deductions || []).map(normalizeDeduction).filter(d => !!d.type);
        if (periodMode !== 'monthly') return list;
        return list.filter(d => (d.frequency === 'monthly') && (d.month === activeMonthNum));
    }, [deductions, normalizeDeduction, periodMode, activeMonthNum]);

    useEffect(() => {
        // Keep deduction inputs in sync with selected month + fetched deductions.
        const reliefMap = {
            rentRelief: '',
            pension: '',
            healthInsurance: '',
            mortgage: ''
        };
        const docUrlMap = {
            rentRelief: '',
            healthInsurance: '',
            pension: '',
            mortgage: ''
        };

        monthScopedDeductions.forEach((d: NormalizedDeduction) => {
            const type = d.type;
            if (!type) return;
            if (type === 'rent_relief') {
                reliefMap.rentRelief = (d.value ?? '').toString();
                if (d.documentUrl) docUrlMap.rentRelief = d.documentUrl;
            }
            if (type === 'pension') {
                reliefMap.pension = (d.value ?? '').toString();
                if (d.documentUrl) docUrlMap.pension = d.documentUrl;
            }
            if (type === 'insurance' || type === 'nhis' || type === 'health_insurance') {
                reliefMap.healthInsurance = (d.value ?? '').toString();
                if (d.documentUrl) docUrlMap.healthInsurance = d.documentUrl;
            }
            if (type === 'mortgage' || type === 'mortgage_interest') {
                reliefMap.mortgage = (d.value ?? '').toString();
                if (d.documentUrl) docUrlMap.mortgage = d.documentUrl;
            }
        });

        setReliefs(reliefMap);
        setDocumentUrls(docUrlMap);
    }, [monthScopedDeductions]);

    const handleSaveDeductions = useCallback(async () => {
        if (!profileId || !currentProfile) return;
        setSavingReliefs(true);
        try {
            const currentYear = currentProfile.year;
            const monthNum = MONTHS.indexOf(activeMonth) + 1;
            const isMonthly = periodMode === 'monthly';
            const frequency: 'annual' | 'monthly' = isMonthly ? 'monthly' : 'annual';
            const monthToSend = isMonthly ? monthNum : null;

            const batchItems: BatchDeductionItem[] = [
                ...(currentProfile.paysRent && reliefs.rentRelief && parseFloat(reliefs.rentRelief) > 0
                    ? [{ deductionType: 'rent_relief' as DeductionType, amount: parseFloat(reliefs.rentRelief), documentUrl: documentUrls.rentRelief || undefined, frequency, month: monthToSend }]
                    : []),
                ...(currentProfile.hasPension && reliefs.pension && parseFloat(reliefs.pension) > 0
                    ? [{ deductionType: 'pension' as DeductionType, amount: parseFloat(reliefs.pension), documentUrl: documentUrls.pension || undefined, frequency, month: monthToSend }]
                    : []),
                ...(currentProfile.hasHealthInsurance && reliefs.healthInsurance && parseFloat(reliefs.healthInsurance) > 0
                    ? [{ deductionType: 'insurance' as DeductionType, amount: parseFloat(reliefs.healthInsurance), documentUrl: documentUrls.healthInsurance || undefined, frequency, month: monthToSend }]
                    : []),
                ...(currentProfile.hasMortgage && reliefs.mortgage && parseFloat(reliefs.mortgage) > 0
                    ? [{ deductionType: 'mortgage' as DeductionType, amount: parseFloat(reliefs.mortgage), documentUrl: documentUrls.mortgage || undefined, frequency, month: monthToSend }]
                    : []),
            ];

            if (batchItems.length === 0) {
                toast.warning('Please enter at least one deduction amount before saving.');
                return;
            }

            // Upsert per deduction (create if missing, else update)
            for (const item of batchItems) {
                const wantType = item.deductionType as string;
                const existing = (deductions || []).map(normalizeDeduction).find(d =>
                    (d.type === wantType || d.type === (wantType === 'mortgage' ? 'mortgage_interest' : wantType)) &&
                    (isMonthly ? (d.frequency === 'monthly' && d.month === monthNum) : (d.frequency === 'annual' || d.month === null))
                );

                if (existing?.raw?._id) {
                    await updateDeduction(existing.raw._id, {
                        profileId,
                        year: currentYear,
                        type: wantType,
                        value: item.amount,
                        frequency,
                        month: monthToSend,
                        documentUrl: item.documentUrl,
                    });
                } else {
                    await batchCreateDeductions({ profileId, year: currentYear, deductions: [item] });
                }
            }

            const deductionRes = await getDeductionList(profileId, currentYear);
            if (deductionRes.success) {
                setDeductions(deductionRes.data?.deductions || []);
            }

            toast.success('Deductions saved successfully!');
            setDeductionsSaved(true);

            // If income is already saved for this month, move to next month after deductions.
            if (periodMode === 'monthly' && incomeSaved) {
                const currentMonthIdx = MONTHS.indexOf(activeMonth);
                const isLastMonth = currentMonthIdx >= MONTHS.length - 1;
                if (isLastMonth) {
                    setActiveSection('review');
                } else {
                    const nextMonth = MONTHS[currentMonthIdx + 1];
                    setActiveMonth(nextMonth);
                    setExpandedMonth(nextMonth);
                    setIncomeSubTab('income');
                    setIncomeSaved(false);
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to save deductions');
        } finally {
            setSavingReliefs(false);
        }
    }, [profileId, currentProfile, reliefs, documentUrls, deductions, normalizeDeduction, updateDeduction, batchCreateDeductions, getDeductionList, toast, activeMonth, periodMode, incomeSaved]);

    useEffect(() => {
        if (user) {
            setPersonalInfo(prev => {
                const shouldFillName = !prev.fullName || prev.fullName.trim() === '';
                const shouldFillEmail = !prev.email || prev.email.trim() === '';
                const shouldFillPhone = !prev.phone || prev.phone.trim() === '';

                if (shouldFillName || shouldFillEmail || shouldFillPhone) {
                    const fullNameFromUser = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                    return {
                        ...prev,
                        fullName: shouldFillName ? (fullNameFromUser || prev.fullName) : prev.fullName,
                        email: shouldFillEmail ? (user.email || prev.email) : prev.email,
                        phone: shouldFillPhone ? (user.phone || prev.phone) : prev.phone
                    };
                }
                return prev;
            });
        }
    }, [user]);

    const profile = currentProfile;

    const renderSidebar = () => (
        <div className="w-[240px] flex-shrink-0 flex flex-col gap-6 sticky top-24">
            <div>
                <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2 px-1">Select</p>
                <div className="space-y-0.5">
                    {[
                        { key: 'personal-info', label: 'Personal Information' },
                    ].map(sec => (
                        <button
                            key={sec.key}
                            onClick={() => setActiveSection(sec.key as any)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${activeSection === sec.key ? 'bg-[#F1F5F9] text-[#0C0C0E]' : 'hover:bg-gray-50 text-[#374151]'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`text-lg leading-none ${activeSection !== sec.key ? 'opacity-60' : ''}`}>📁</span>
                                <span className="text-[13px] font-semibold">{sec.label}</span>
                            </div>
                            <svg className={`w-3.5 h-3.5 flex-shrink-0 ${activeSection === sec.key ? 'text-[#0C0C0E]' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2 px-1">Select</p>
                <div className="space-y-0.5">
                    {[
                        { key: 'income-deductions', label: 'Income & Deductions' },
                        { key: 'review', label: 'Review & File' },
                    ].map(sec => (
                        <button
                            key={sec.key}
                            onClick={() => setActiveSection(sec.key as any)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${activeSection === sec.key ? 'bg-[#F1F5F9] text-[#0C0C0E]' : 'hover:bg-gray-50 text-[#374151]'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`text-lg leading-none ${activeSection !== sec.key ? 'opacity-60' : ''}`}>{sec.key === 'review' ? '📄' : '📁'}</span>
                                <span className="text-[13px] font-semibold">{sec.label}</span>
                            </div>
                            <svg className={`w-3.5 h-3.5 flex-shrink-0 ${activeSection === sec.key ? 'text-[#0C0C0E]' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ))}
                </div>
            </div>

            {taxSummary?.actions && (
                <div className="mt-4 bg-white border border-gray-100 rounded-[20px] p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-[13px] font-bold text-[#0C0C0E]">Need expert eyes on your return?</h4>
                    </div>
                    <p className="text-[12px] text-[#6B7280] leading-relaxed font-medium mb-4">
                        Get your return reviewed by a certified tax accountant. They'll ensure accuracy, compliance, and file for you.
                    </p>
                    {taxSummary.actions.canPayAccountantReview && (
                        <button className="w-full h-10 border border-gray-200 text-[#0C0C0E] font-bold rounded-xl hover:bg-gray-50 transition-colors text-[12px]">
                            Book Accountant (₦30,000)
                        </button>
                    )}
                </div>
            )}
        </div>
    );

    const activeLabel = {
        'personal-info': 'Personal Information',
        'income-deductions': 'Income & Deductions',
        'review': 'Review & File',
    }[activeSection];

    if (loading || profileLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] font-sans flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003787]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] font-sans flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-taxable-dark mb-2">Failed to Load Profile</h3>
                    <p className="text-taxable-gray mb-4">{error}</p>
                    <div className="space-y-2">
                        <button 
                            onClick={() => { setError(null); loadProfileData(); }}
                            className="block w-full px-4 py-2 bg-[#003787] text-white rounded-xl"
                        >
                            Try Again
                        </button>
                        <button 
                            onClick={() => router.push('/tax-folders')}
                            className="block w-full px-4 py-2 bg-white border border-gray-200 text-taxable-dark rounded-xl"
                        >
                            Back to Tax Folders
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] font-sans flex items-center justify-center">
                <div className="text-center">
                    <p className="text-taxable-gray mb-4">Profile not found</p>
                    <button 
                        onClick={() => router.push('/tax-folders')}
                        className="px-4 py-2 bg-[#003787] text-white rounded-xl"
                    >
                        Back to Tax Folders
                    </button>
                </div>
            </div>
        );
    }

    const taxAmount = taxSummary?.taxSummary?.estimatedAnnualTax 
        ? `₦${taxSummary.taxSummary.estimatedAnnualTax.toLocaleString()}`
        : '₦0 (no data yet)';

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans pb-20">
            <DashboardHeader />

            <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
                <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-5">
                            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[13px] font-bold text-[#0C0C0E] hover:text-[#003787] transition-colors">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                                </svg>
                                Back
                            </button>
                            <div className="flex items-center gap-1.5 text-[12px] text-[#9CA3AF] font-medium">
                                <span>{profile.year} Individual Tax</span><span>/</span>
                                <span className="text-[#6B7280]">{activeLabel}</span>
                                {activeSection === 'income-deductions' && periodMode === 'monthly' && (
                                    <><span>/</span><span className="text-[#6B7280]">{activeMonth}</span><span>/</span><span className="text-[#6B7280] capitalize">{incomeSubTab}</span></>
                                )}
                            </div>
                        </div>

                        <div>
                            <h1 className="text-lg font-bold text-[#0C0C0E] mb-1.5">{personalInfo.fullName || 'User'}, {currentProfile?.year || 2026} Individual Tax</h1>
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-[12px] font-bold text-[#16A34A]">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    Tax Compliant
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <h2 className="text-base font-bold text-[#0C0C0E]">{taxAmount}</h2>
                        <p className="text-[13px] text-[#6B7280] font-medium">Estimated Net Tax Payable</p>
                    </div>
                </div>

                <div className="flex items-start justify-start gap-8 mt-8">
                    {renderSidebar()}

                    <div className="flex-1 min-w-0">
                        {activeSection === 'personal-info' && (
                            <div className="flex items-start justify-between gap-12">
                                <div className="flex-1 space-y-7 max-w-[480px]">
                                    <h2 className="text-base font-bold text-[#0C0C0E]">Personal Information</h2>

                                    <div>
                                        <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] mb-2">
                                            NIN (National Identification Number)
                                            <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                        </label>
                                            <input 
                                                type="text" 
                                                value={personalInfo.nin} 
                                                onChange={(e) => setPersonalInfo({...personalInfo, nin: e.target.value})}
                                                className="w-full h-11 border border-gray-100 bg-[#F9FAFB] rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all" 
                                            />
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                            <span className="text-[12px] font-bold text-[#16A34A]">Verified</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151]">
                                            Residency status
                                            <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[14px] font-semibold text-[#16A34A]">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                                <polyline points="18 8 21 11 18 14" />
                                            </svg>
                                            {personalInfo.residencyStatus === 'resident' ? 'Resident of Nigeria' : 'Non-Resident'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] mb-2">
                                                Email Address
                                                <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                            </label>
                                            <input 
                                                type="email" 
                                                placeholder="Enter your email" 
                                                value={personalInfo.email}
                                                onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                                                className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all placeholder:text-gray-300" 
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
                                                onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                                                className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all placeholder:text-gray-300" 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] mb-2">
                                            Full Legal Name
                                            <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="Enter your full name" 
                                            value={personalInfo.fullName}
                                            onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
                                            className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all placeholder:text-gray-300" 
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] mb-2">
                                            Date of birth
                                            <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="DD / MM / YYYY" 
                                            value={personalInfo.dateOfBirth}
                                            onChange={handleDobChange}
                                            maxLength={14}
                                            className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all placeholder:text-gray-300" 
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151] mb-2">
                                            Street Address
                                            <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-white flex items-center justify-center text-[10px] cursor-help">i</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="Enter" 
                                            value={personalInfo.streetAddress}
                                            onChange={(e) => setPersonalInfo({...personalInfo, streetAddress: e.target.value})}
                                            className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all placeholder:text-gray-300 mb-3" 
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="relative">
                                                <select 
                                                    className="appearance-none w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all"
                                                    value={personalInfo.city}
                                                    onChange={(e) => setPersonalInfo({...personalInfo, city: e.target.value})}
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
                                                    className="appearance-none w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40 transition-all"
                                                    value={personalInfo.state}
                                                    onChange={(e) => setPersonalInfo({...personalInfo, state: e.target.value})}
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
                                        onClick={async () => {
                                            if (!profileId) return;
                                            setSavingPersonalInfo(true);
                                            setSaveSuccess(false);
                                            try {
                                                const normalizedNin = (personalInfo.nin || '').replace(/\D/g, '');
                                                if (normalizedNin && normalizedNin.length !== 11) {
                                                    toast.error('NIN must be exactly 11 digits.');
                                                    return;
                                                }
                                                const isoDateOfBirth = personalInfo.dateOfBirth ? toIsoDate(personalInfo.dateOfBirth) : undefined;
                                                if (personalInfo.dateOfBirth && !isoDateOfBirth) {
                                                    toast.error('Date of birth must be in YYYY-MM-DD or DD/MM/YYYY format.');
                                                    return;
                                                }
                                                await updatePersonalInfo(profileId, {
                                                    nin: normalizedNin || undefined,
                                                    fullName: personalInfo.fullName,
                                                    dateOfBirth: isoDateOfBirth,
                                                    streetAddress: personalInfo.streetAddress,
                                                    city: personalInfo.city,
                                                    state: personalInfo.state,
                                                    residencyStatus: personalInfo.residencyStatus
                                                });
                                                
                                                if (currentProfile) {
                                                    await completeProfile(profileId, {
                                                        nin: normalizedNin || undefined,
                                                        hasMortgage: currentProfile.hasMortgage ?? false,
                                                        filingPreference: currentProfile.filingPreference || 'monthly',
                                                        primaryIncomeSources: currentProfile.primaryIncomeSources,
                                                        residency183Days: currentProfile.residency183Days,
                                                        state: personalInfo.state || currentProfile.state,
                                                        city: personalInfo.city || currentProfile.city,
                                                        street: personalInfo.streetAddress || currentProfile.street,
                                                        dob: personalInfo.dateOfBirth ? toIsoDate(personalInfo.dateOfBirth) : currentProfile.dob,
                                                        paysRent: currentProfile.paysRent,
                                                        hasHealthInsurance: currentProfile.hasHealthInsurance,
                                                        hasPension: currentProfile.hasPension,
                                                    });
                                                }
                                                
                                                setSaveSuccess(true);
                                                // Automatically move to the next section after success
                                                setTimeout(() => {
                                                    setSaveSuccess(false);
                                                    setActiveSection('income-deductions');
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }, 1500);
                                            } catch (err: any) {
                                                console.error('Failed to save personal info:', err);
                                                toast.error(err.message || 'Failed to save personal information');
                                            } finally {
                                                setSavingPersonalInfo(false);
                                            }
                                        }}
                                        disabled={savingPersonalInfo}
                                        className="h-12 px-10 bg-[#003787] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                                    >
                                        {savingPersonalInfo ? 'Saving...' : 'Save & Continue'}
                                    </button>
                                </div>

                                {/* Right Info Sidebar */}
                                <div className="w-[300px] flex-shrink-0 space-y-6">
                                    <div className="bg-[#F8FAFC] rounded-3xl p-6 border border-gray-100">
                                        <div className="flex items-center gap-2 mb-4 text-[#0C0C0E]">
                                            <Info size={18} className="text-[#003787]" />
                                            <h3 className="text-sm font-bold">Why we need this</h3>
                                        </div>
                                        <p className="text-[13px] text-[#64748B] leading-relaxed mb-6 font-medium">
                                            Your personal details help us identify you with FIRS and ensure your tax return is filed correctly. All information is encrypted and stored securely. We only share data with FIRS when you choose to file.
                                        </p>
                                        <div className="space-y-4 pt-4 border-t border-gray-100">
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
                        )}

                        {activeSection === 'income-deductions' && (
                            <div className="flex items-start justify-between gap-12">
                                {/* Sub-navigation Sidebar */}
                                <div className="w-[240px] flex-shrink-0 space-y-6">
                                    <div className="flex items-center gap-4 px-1">
                                        <span className={`text-[13px] font-bold transition-colors ${periodMode === 'monthly' ? 'text-[#0C0C0E]' : 'text-[#94A3B8]'}`}>Monthly</span>
                                        <button 
                                            onClick={() => setPeriodMode(periodMode === 'monthly' ? 'annually' : 'monthly')}
                                            className="w-10 h-5 bg-[#003787] rounded-full relative p-0.5 transition-all"
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full transition-all ${periodMode === 'annually' ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                        <span className={`text-[13px] font-bold transition-colors ${periodMode === 'annually' ? 'text-[#0C0C0E]' : 'text-[#94A3B8]'}`}>Annually</span>
                                    </div>

                                    <div className="bg-[#F8FAFC]/50 rounded-3xl p-1 space-y-1">
                                        {periodMode === 'monthly' ? (
                                            MONTHS.map(month => (
                                                <div key={month} className="space-y-1">
                                                    <button 
                                                        onClick={() => {
                                                            setExpandedMonth(expandedMonth === month ? null : month);
                                                            setActiveMonth(month);
                                                        }}
                                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${activeMonth === month ? 'bg-white' : 'hover:bg-gray-50'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={activeMonth === month ? "#0C0C0E" : "#94A3B8"} strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                                            <span className={`text-[13px] font-bold ${activeMonth === month ? 'text-[#0C0C0E]' : 'text-[#94A3B8]'}`}>{month}</span>
                                                        </div>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={activeMonth === month ? "#0C0C0E" : "#94A3B8"} strokeWidth="3" className={`transition-transform ${expandedMonth === month ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
                                                    </button>
                                                    
                                                    {expandedMonth === month && periodMode === 'monthly' && (
                                                        <div className="px-4 pb-2 space-y-1 ml-7">
                                                            <button 
                                                                onClick={() => setIncomeSubTab('income')}
                                                                className={`w-full text-left px-4 py-2 rounded-xl text-[13px] font-bold transition-colors ${incomeSubTab === 'income' ? 'bg-[#F1F5F9] text-[#0C0C0E]' : 'text-[#64748B] hover:text-[#0C0C0E]'}`}
                                                            >
                                                                Income
                                                            </button>
                                                            <button 
                                                                onClick={() => setIncomeSubTab('deductions')}
                                                                className={`w-full text-left px-4 py-2 rounded-xl text-[13px] font-bold transition-colors ${incomeSubTab === 'deductions' ? 'bg-[#F1F5F9] text-[#0C0C0E]' : 'text-[#64748B] hover:text-[#0C0C0E]'}`}
                                                            >
                                                                Deductions
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <>
                                                <button className="w-full flex items-center justify-between px-4 py-4 rounded-2xl bg-white">
                                                    <span className="text-[13px] font-bold text-[#0C0C0E]">Total Income for {currentProfile?.year || 2026}</span>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0C0C0E" strokeWidth="3"><polyline points="9 18 15 12 9 6"/></svg>
                                                </button>
                                                <button className="w-full flex items-center justify-between px-4 py-4 rounded-2xl hover:bg-gray-50 transition-all">
                                                    <span className="text-[13px] font-bold text-[#94A3B8]">Total deductible for {currentProfile?.year || 2026}</span>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="3"><polyline points="9 18 15 12 9 6"/></svg>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Main Form Area */}
                                <div className="flex-1 max-w-[700px] space-y-10">
                                        <div className="flex items-center gap-4">
                                            <p className="text-[14px] text-[#64748B] font-medium leading-relaxed">
                                                {periodMode === 'annually' 
                                                    ? `Enter your total annual income for ${currentProfile?.year || 2026}. Skip fields that don't apply to you.`
                                                    : `Enter your income for ${activeMonth} ${currentProfile?.year || 2026}. Skip fields that don't apply to you. You can update amounts anytime.`
                                                }
                                            </p>
                                        </div>

                                    {incomeSubTab === 'income' ? (
                                        <div className="space-y-8">
                                            <div>
                                                <h3 className="text-[17px] font-extrabold text-[#0C0C0E] mb-6">Employment Income</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {periodMode === 'annually' ? (
                                                        <>
                                                            <IncomeField label="Annual Gross Salary" value={annualIncome.salary} onChange={(val) => setAnnualIncome({...annualIncome, salary: val})} />
                                                            <IncomeField label="Annual Bonuses" value={annualIncome.bonuses} onChange={(val) => setAnnualIncome({...annualIncome, bonuses: val})} />
                                                            <IncomeField label="Annual Commissions" value={annualIncome.commissions} onChange={(val) => setAnnualIncome({...annualIncome, commissions: val})} />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <IncomeField label="Gross Salary/wages" value={currentMonthIncome.salary} onChange={(val) => setCurrentMonthIncome({...currentMonthIncome, salary: val})} />
                                                            <IncomeField label="Bonuses" value={currentMonthIncome.bonuses} onChange={(val) => setCurrentMonthIncome({...currentMonthIncome, bonuses: val})} />
                                                            <IncomeField label="Commissions" value={currentMonthIncome.commissions} onChange={(val) => setCurrentMonthIncome({...currentMonthIncome, commissions: val})} />
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pt-8 border-t border-gray-100">
                                                <h3 className="text-[17px] font-extrabold text-[#0C0C0E] mb-6">Other Income</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {periodMode === 'annually' ? (
                                                        <>
                                                            <IncomeField label="Freelance/consulting fees" value={annualIncome.freelance} onChange={(val) => setAnnualIncome({...annualIncome, freelance: val})} />
                                                            <IncomeField label="Digital Assets/Crypto" value={annualIncome.digitalAssets} onChange={(val) => setAnnualIncome({...annualIncome, digitalAssets: val})} />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <IncomeField label="Freelance/consulting fees" value={currentMonthIncome.freelance} onChange={(val) => setCurrentMonthIncome({...currentMonthIncome, freelance: val})} />
                                                            <IncomeField label="Digital Assets/Crypto" value={(currentMonthIncome as any).digitalAssets || ''} onChange={(val) => setCurrentMonthIncome({...currentMonthIncome, digitalAssets: val} as any)} />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-10">
                                            {/* Rent Relief — only shown if user pays rent */}
                                            {currentProfile?.paysRent && (
                                                <div className="space-y-6">
                                                    <h3 className="text-[17px] font-extrabold text-[#0C0C0E]">Rent Relief</h3>
                                                    {(() => {
                                                        const rentDeduction = (deductions || []).find(d => (d.deductionType as string) === 'rent_relief');
                                                        const rentStatus = rentDeduction?.verificationStatus;
                                                        const hasUpload = !!uploadedFileNames.rentRelief || !!rentDeduction?.documentUrl;
                                                        return (
                                                            <DeductionItem 
                                                                label="Annual Rent Commitment" 
                                                                value={reliefs.rentRelief}
                                                                onChange={(val) => setReliefs({...reliefs, rentRelief: val})}
                                                                uploadLabel="Upload Tenancy Agreements or Receipt"
                                                                fileName={uploadedFileNames.rentRelief || (rentDeduction ? `Rent Receipt (₦${rentDeduction.amount.toLocaleString()})` : 'Proof of Rent Required')}
                                                                status={uploadedFileNames.rentRelief ? 'completed' : rentStatus === 'verified' ? 'verified' : rentStatus === 'pending' ? 'pending' : undefined}
                                                                statusMessage={rentStatus === 'verified' ? 'Verified. Your rent relief has been approved.' : rentStatus === 'pending' ? 'Verification in Progress — Our system is matching your document with NRS records' : undefined}
                                                                onUpload={async (file) => {
                                                                    const res = await uploadSimple(file);
                                                                    setDocumentUrls(p => ({ ...p, rentRelief: res.data.url }));
                                                                    setUploadedFileNames(p => ({ ...p, rentRelief: file.name }));
                                                                }}
                                                                onDeleteFile={() => {
                                                                    setDocumentUrls(p => ({ ...p, rentRelief: '' }));
                                                                    setUploadedFileNames(p => ({ ...p, rentRelief: '' }));
                                                                }}
                                                            />
                                                        );
                                                    })()}
                                                </div>
                                            )}

                                            {/* Health Insurance — only shown if user has health insurance */}
                                            {currentProfile?.hasHealthInsurance && (
                                                <div className={`space-y-6 ${currentProfile?.paysRent ? 'pt-6 border-t border-gray-100' : ''}`}>
                                                    <h3 className="text-[17px] font-extrabold text-[#0C0C0E]">Health Insurance (NHIS)</h3>
                                                    {(() => {
                                                        const nhisDeduction = (monthScopedDeductions || []).find(d => d.type === 'insurance' || d.type === 'nhis' || d.type === 'health_insurance')?.raw;
                                                        const nhisStatus = nhisDeduction?.verificationStatus;
                                                        return (
                                                            <DeductionItem 
                                                                label="Health Insurance Premium" 
                                                                value={reliefs.healthInsurance}
                                                                onChange={(val) => setReliefs({...reliefs, healthInsurance: val})}
                                                                uploadLabel="Upload Health Insurance Statement"
                                                                fileName={uploadedFileNames.healthInsurance || (nhisDeduction ? `NHIS Receipt (₦${nhisDeduction.amount.toLocaleString()})` : 'Upload NHIS Statement')}
                                                                status={uploadedFileNames.healthInsurance ? 'completed' : nhisStatus === 'verified' ? 'verified' : nhisStatus === 'pending' ? 'pending' : undefined}
                                                                statusMessage={nhisStatus === 'verified' ? 'Verified. Your health insurance relief has been applied.' : nhisStatus === 'pending' ? 'Verification in Progress — Our system is matching your document with NRS records' : undefined}
                                                                onUpload={async (file) => {
                                                                    const res = await uploadSimple(file);
                                                                    setDocumentUrls(p => ({ ...p, healthInsurance: res.data.url }));
                                                                    setUploadedFileNames(p => ({ ...p, healthInsurance: file.name }));
                                                                }}
                                                                onDeleteFile={() => {
                                                                    setDocumentUrls(p => ({ ...p, healthInsurance: '' }));
                                                                    setUploadedFileNames(p => ({ ...p, healthInsurance: '' }));
                                                                }}
                                                            />
                                                        );
                                                    })()}
                                                </div>
                                            )}

                                            {/* Pension — only shown if user has pension */}
                                            {currentProfile?.hasPension && (
                                                <div className={`space-y-6 ${(currentProfile?.paysRent || currentProfile?.hasHealthInsurance) ? 'pt-6 border-t border-gray-100' : ''}`}>
                                                    <h3 className="text-[17px] font-extrabold text-[#0C0C0E]">Statutory Deductions</h3>
                                                    {(() => {
                                                        const pensionDeduction = (deductions || []).find(d => (d.deductionType as string) === 'pension');
                                                        const pensionStatus = pensionDeduction?.verificationStatus;
                                                        return (
                                                            <DeductionItem 
                                                                label="Pension" 
                                                                value={reliefs.pension}
                                                                onChange={(val) => setReliefs({...reliefs, pension: val})}
                                                                uploadLabel="Upload your Pension Statement"
                                                                fileName={uploadedFileNames.pension || (pensionDeduction ? `Pension Receipt (₦${pensionDeduction.amount.toLocaleString()})` : 'Upload Pension Statement')}
                                                                status={uploadedFileNames.pension ? 'completed' : pensionStatus === 'verified' ? 'verified' : pensionStatus === 'pending' ? 'pending' : undefined}
                                                                statusMessage={pensionStatus === 'verified' ? 'Verified. A 5% pension deduction has been applied to your taxable income.' : pensionStatus === 'pending' ? 'Verification in Progress — Our system is matching your document with NRS records' : undefined}
                                                                onUpload={async (file) => {
                                                                    const res = await uploadSimple(file);
                                                                    setDocumentUrls(p => ({ ...p, pension: res.data.url }));
                                                                    setUploadedFileNames(p => ({ ...p, pension: file.name }));
                                                                }}
                                                                onDeleteFile={() => {
                                                                    setDocumentUrls(p => ({ ...p, pension: '' }));
                                                                    setUploadedFileNames(p => ({ ...p, pension: '' }));
                                                                }}
                                                            />
                                                        );
                                                    })()}
                                                </div>
                                            )}

                                            {/* Mortgage — only shown if user pays mortgage */}
                                            {currentProfile?.hasMortgage && (
                                                <div className={`space-y-6 ${(currentProfile?.paysRent || currentProfile?.hasHealthInsurance || currentProfile?.hasPension) ? 'pt-6 border-t border-gray-100' : ''}`}>
                                                    <h3 className="text-[17px] font-extrabold text-[#0C0C0E]">Mortgage Interest Relief</h3>
                                                    {(() => {
                                                        const mortgageDeduction = (monthScopedDeductions || []).find(d => d.type === 'mortgage' || d.type === 'mortgage_interest')?.raw;
                                                        const mortgageStatus = mortgageDeduction?.verificationStatus;
                                                        return (
                                                            <DeductionItem 
                                                                label="Mortgage Interest Paid" 
                                                                value={reliefs.mortgage}
                                                                onChange={(val) => setReliefs({...reliefs, mortgage: val})}
                                                                uploadLabel="Upload Mortgage Statement"
                                                                fileName={uploadedFileNames.mortgage || (mortgageDeduction ? `Mortgage Statement (₦${mortgageDeduction.amount.toLocaleString()})` : 'Upload Mortgage Statement')}
                                                                status={uploadedFileNames.mortgage ? 'completed' : mortgageStatus === 'verified' ? 'verified' : mortgageStatus === 'pending' ? 'pending' : undefined}
                                                                statusMessage={mortgageStatus === 'verified' ? 'Verified. Your mortgage interest relief has been applied.' : mortgageStatus === 'pending' ? 'Verification in Progress — Our system is matching your document with NRS records' : undefined}
                                                                onUpload={async (file) => {
                                                                    const res = await uploadSimple(file);
                                                                    setDocumentUrls(p => ({ ...p, mortgage: res.data.url }));
                                                                    setUploadedFileNames(p => ({ ...p, mortgage: file.name }));
                                                                }}
                                                                onDeleteFile={() => {
                                                                    setDocumentUrls(p => ({ ...p, mortgage: '' }));
                                                                    setUploadedFileNames(p => ({ ...p, mortgage: '' }));
                                                                }}
                                                            />
                                                        );
                                                    })()}
                                                </div>
                                            )}

                                            {/* Fallback: if none of the flags are set */}
                                            {!currentProfile?.paysRent && !currentProfile?.hasHealthInsurance && !currentProfile?.hasPension && !currentProfile?.hasMortgage && (
                                                <div className="py-12 text-center">
                                                    <p className="text-[14px] text-[#94A3B8] font-medium">No deductions applicable based on your profile.</p>
                                                    <p className="text-[12px] text-[#94A3B8] mt-1">If this seems incorrect, please update your profile settings.</p>
                                                </div>
                                            )}

                                            {/* Save action is now in the sticky footer for this step */}
                                        </div>
                                    )}

                                    <div className="mt-8 sticky bottom-6 z-10 pt-4">
                                        <div className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur px-4 py-4 shadow-sm">
                                            {periodMode === 'monthly' && (!incomeSaved || !deductionsSaved) && (
                                                <div className="mb-3 rounded-xl bg-[#FAFAFA] border border-gray-100 px-3 py-2">
                                                    <p className="text-[12px] font-semibold text-[#0C0C0E]">
                                                        Complete steps to calculate
                                                    </p>
                                                    <div className="mt-1 flex flex-wrap gap-2 text-[12px] font-medium">
                                                        <span className={`px-2 py-0.5 rounded-full border ${incomeSaved ? 'bg-[#E6F9F3] text-[#047857] border-[#A7F3D0]' : 'bg-[#FFF7ED] text-[#C05621] border-[#FED7AA]'}`}>
                                                            {incomeSaved ? 'Income saved' : 'Save income'}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setIncomeSubTab('deductions')}
                                                            className={`px-2 py-0.5 rounded-full border transition-colors ${deductionsSaved ? 'bg-[#E6F9F3] text-[#047857] border-[#A7F3D0] cursor-default' : 'bg-[#FFF7ED] text-[#C05621] border-[#FED7AA] hover:bg-[#FFEDD5]'}`}
                                                            disabled={deductionsSaved}
                                                        >
                                                            {deductionsSaved ? 'Deductions saved' : 'Save deductions'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                                                {incomeSubTab === 'deductions' && (
                                                    <button
                                                        type="button"
                                                        onClick={handleSaveDeductions}
                                                        disabled={savingReliefs}
                                                        className="h-11 w-full sm:w-auto px-5 rounded-xl bg-[#003787] text-white text-[13px] font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {savingReliefs ? 'Saving...' : 'Save deductions'}
                                                    </button>
                                                )}
                                        {incomeSubTab !== 'deductions' && (
                                        <button
                                            onClick={async () => {
                                                if (!profileId || !currentProfile) return;
                                                setSavingMonthlyIncome(true);
                                                try {
                                                    const year = currentProfile.year;
                                                    const monthNum = MONTHS.indexOf(activeMonth) + 1;
                                                    
                                                    const newIncomes: Array<{type: 'employment'; grossSalary: number; bonuses: number; commissions: number; documentUrl?: string} | {type: 'freelance'; value: number; documentUrl?: string} | {type: 'digital_assets'; value: number; documentUrl?: string}> = [];
                                                    
                                                    const incomeDataToUse = periodMode === 'annually' ? annualIncome : currentMonthIncome;
                                                    
                                                    const salaryAmount = parseFloat(incomeDataToUse.salary) || 0;
                                                    const bonusAmount = parseFloat(incomeDataToUse.bonuses) || 0;
                                                    const commissionAmount = parseFloat(incomeDataToUse.commissions) || 0;
                                                    const freelanceAmount = parseFloat(incomeDataToUse.freelance) || 0;
                                                    const digitalAssetsAmount = parseFloat((incomeDataToUse as any).digitalAssets) || 0;
                                                    
                                                    if (salaryAmount > 0 || bonusAmount > 0 || commissionAmount > 0) {
                                                        newIncomes.push({
                                                            type: 'employment' as const,
                                                            grossSalary: salaryAmount,
                                                            bonuses: bonusAmount,
                                                            commissions: commissionAmount,
                                                            documentUrl: undefined
                                                        });
                                                    }
                                                    
                                                    if (freelanceAmount > 0) {
                                                        newIncomes.push({
                                                            type: 'freelance' as const,
                                                            value: freelanceAmount,
                                                            documentUrl: undefined
                                                        });
                                                    }
                                                    
                                                    if (digitalAssetsAmount > 0) {
                                                        newIncomes.push({
                                                            type: 'digital_assets' as const,
                                                            value: digitalAssetsAmount,
                                                            documentUrl: undefined
                                                        });
                                                    }
                                                    
                                                    try {
                                                        const useNewApi = true;
                                                        if (useNewApi) {
                                                            if (periodMode === 'annually') {
                                                                await updateAnnualIncomeData(profileId, { incomes: newIncomes });
                                                                
                                                                const incomeDataRes = await getIncomeData(profileId);
                                                                if (incomeDataRes.success && incomeDataRes.data.incomes) {
                                                                    setIncomeData(incomeDataRes.data.incomes);
                                                                }
                                                            } else {
                                                                await updateMonthlyIncomeData(profileId, monthNum, { incomes: newIncomes });
                                                                
                                                                const incomeDataRes = await getIncomeData(profileId);
                                                                if (incomeDataRes.success && incomeDataRes.data.incomes) {
                                                                    setIncomeData(incomeDataRes.data.incomes);
                                                                }
                                                            }
                                                        } else {
                                                            const incomeTypes = [
                                                                { category: 'salary', amount: currentMonthIncome.salary, type: 'employment' as const, extra: { employerName: '', employerTIN: '', bonuses: currentMonthIncome.bonuses, commissions: currentMonthIncome.commissions } },
                                                                { category: 'freelance_fee', amount: currentMonthIncome.freelance, type: 'freelance' as const }
                                                            ];
                                                            
                                                            const monthRecords = incomeRecords.filter(r => r.period.month === monthNum);
                                                            
                                                            for (const incomeType of incomeTypes) {
                                                                const amount = parseFloat(incomeType.amount) || 0;
                                                                const extra = incomeType.extra;
                                                                
                                                                const hasData = amount > 0 || 
                                                                    (extra?.bonuses && parseFloat(extra.bonuses) > 0) || 
                                                                    (extra?.commissions && parseFloat(extra.commissions) > 0);
                                                                
                                                                if (!hasData) continue;
                                                                
                                                                const existingRecord = monthRecords.find(r => r.category === incomeType.category);
                                                                
                                                                if (existingRecord) {
                                                                    await updateIncome(profileId, existingRecord._id, { 
                                                                        amount,
                                                                        ...(extra ? {
                                                                            employerName: extra.employerName || undefined,
                                                                            employerTIN: extra.employerTIN || undefined,
                                                                            bonuses: extra.bonuses ? parseFloat(extra.bonuses) : undefined,
                                                                            commissions: extra.commissions ? parseFloat(extra.commissions) : undefined
                                                                        } : {})
                                                                    });
                                                                } else {
                                                                    await addIncome(profileId, {
                                                                        type: incomeType.type,
                                                                        category: incomeType.category as any,
                                                                        amount,
                                                                        month: monthNum,
                                                                        year,
                                                                        ...(extra ? {
                                                                            employerName: extra.employerName || undefined,
                                                                            employerTIN: extra.employerTIN || undefined,
                                                                            bonuses: extra.bonuses ? parseFloat(extra.bonuses) : undefined,
                                                                            commissions: extra.commissions ? parseFloat(extra.commissions) : undefined
                                                                        } : {})
                                                                    });
                                                                }
                                                            }
                                                            
                                                            const incomeRes = await getIncomeList(profileId);
                                                            if (incomeRes.success) {
                                                                setIncomeRecords(incomeRes.data.incomeRecords);
                                                            }
                                                        }
                                                    } catch (apiErr) {
                                                        console.log('[PITDetails] New API failed, using legacy:', apiErr);
                                                        
                                                        const legacyIncomeData = periodMode === 'annually' ? annualIncome : currentMonthIncome;
                                                        
                                                        const incomeTypes = [
                                                            { category: 'salary', amount: legacyIncomeData.salary, type: 'employment' as const, extra: { employerName: '', employerTIN: '', bonuses: legacyIncomeData.bonuses, commissions: legacyIncomeData.commissions } },
                                                            { category: 'freelance_fee', amount: legacyIncomeData.freelance, type: 'freelance' as const }
                                                        ];
                                                        
                                                        const monthRecords = incomeRecords.filter(r => r.period.month === monthNum);
                                                        
                                                        for (const incomeType of incomeTypes) {
                                                            const amount = parseFloat(incomeType.amount) || 0;
                                                            const extra = incomeType.extra;
                                                            
                                                            const hasData = amount > 0 || 
                                                                (extra?.bonuses && parseFloat(extra.bonuses) > 0) || 
                                                                (extra?.commissions && parseFloat(extra.commissions) > 0);
                                                            
                                                            if (!hasData) continue;
                                                            
                                                            const existingRecord = monthRecords.find(r => r.category === incomeType.category);
                                                            
                                                            if (existingRecord) {
                                                                await updateIncome(profileId, existingRecord._id, { 
                                                                    amount,
                                                                    ...(extra ? {
                                                                        employerName: extra.employerName || undefined,
                                                                        employerTIN: extra.employerTIN || undefined,
                                                                        bonuses: extra.bonuses ? parseFloat(extra.bonuses) : undefined,
                                                                        commissions: extra.commissions ? parseFloat(extra.commissions) : undefined
                                                                    } : {})
                                                                });
                                                            } else {
                                                                await addIncome(profileId, {
                                                                    type: incomeType.type,
                                                                    category: incomeType.category as any,
                                                                    amount,
                                                                    month: monthNum,
                                                                    year,
                                                                    ...(extra ? {
                                                                        employerName: extra.employerName || undefined,
                                                                        employerTIN: extra.employerTIN || undefined,
                                                                        bonuses: extra.bonuses ? parseFloat(extra.bonuses) : undefined,
                                                                        commissions: extra.commissions ? parseFloat(extra.commissions) : undefined
                                                                    } : {})
                                                                });
                                                            }
                                                        }
                                                        
                                                        const incomeRes = await getIncomeList(profileId);
                                                        if (incomeRes.success) {
                                                            setIncomeRecords(incomeRes.data.incomeRecords);
                                                        }
                                                    }
                                                    
                                                    toast.success(periodMode === 'annually' ? `Annual income saved successfully!` : `${activeMonth} income saved successfully!`);
                                                    setIncomeSaved(true);

                                                    // Progress the flow after saving:
                                                    // - Monthly: go to Deductions if not completed, otherwise next month (or Review on December)
                                                    // - Annual: go to Deductions
                                                    if (periodMode === 'monthly') {
                                                        if (!deductionsSaved) {
                                                            setIncomeSubTab('deductions');
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        } else {
                                                            const currentMonthIdx = MONTHS.indexOf(activeMonth);
                                                            const isLastMonth = currentMonthIdx >= MONTHS.length - 1;
                                                            if (isLastMonth) {
                                                                setActiveSection('review');
                                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                            } else {
                                                                const nextMonth = MONTHS[currentMonthIdx + 1];
                                                                setActiveMonth(nextMonth);
                                                                setExpandedMonth(nextMonth);
                                                                setIncomeSubTab('income');
                                                                setIncomeSaved(false);
                                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                            }
                                                        }
                                                    } else {
                                                        setIncomeSubTab('deductions');
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }
                                                } catch (err: any) {
                                                    toast.error(err.message || 'Failed to save income');
                                                } finally {
                                                    setSavingMonthlyIncome(false);
                                                }
                                            }}
                                            disabled={savingMonthlyIncome}
                                            className="h-11 w-full sm:w-auto px-5 rounded-xl bg-[#003787] text-white text-[13px] font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {periodMode === 'annually' ? 'File annual tax returns' : (savingMonthlyIncome ? 'Saving...' : 'Save & Continue')}
                                        </button>
                                        )}
                                        {incomeSubTab !== 'deductions' && periodMode === 'monthly' && MONTHS.indexOf(activeMonth) > 0 && (
                                            <button
                                                onClick={() => {
                                                    const currentMonthIdx = MONTHS.indexOf(activeMonth);
                                                    if (currentMonthIdx === 0) {
                                                        toast.info('No previous month data available for January.');
                                                        return;
                                                    }
                                                    
                                                    const prevMonthIndex = currentMonthIdx - 1;
                                                    const prevMonthData = incomeData && incomeData[prevMonthIndex] ? incomeData[prevMonthIndex] : [];
                                                    
                                                    if (!prevMonthData || prevMonthData.length === 0) {
                                                        toast.info(`No records found for ${MONTHS[currentMonthIdx - 1]}.`);
                                                        return;
                                                    }
                                                    
                                                    const data = {
                                                        salary: '', bonuses: '', commissions: '',
                                                        freelance: '', digitalAssets: ''
                                                    };
                                                    
                                                    prevMonthData.forEach((item: any) => {
                                                        if (item.type === 'employment') {
                                                            data.salary = item.grossSalary?.toString() || '';
                                                            data.bonuses = item.bonuses?.toString() || '';
                                                            data.commissions = item.commissions?.toString() || '';
                                                        } else if (item.type === 'freelance') {
                                                            data.freelance = item.value?.toString() || '';
                                                        } else if (item.type === 'digital_assets') {
                                                            data.digitalAssets = item.value?.toString() || '';
                                                        }
                                                    });
                                                    setCurrentMonthIncome(prevData => ({ ...prevData, ...data }));
                                                }}
                                                className="h-11 w-full sm:w-auto px-5 rounded-xl border border-gray-200 bg-white text-[#0C0C0E] text-[13px] font-semibold hover:bg-gray-50 transition-colors"
                                            >
                                                Copy from last month
                                            </button>
                                        )}
                                        
                                        <button
                                            onClick={async () => {
                                                if (!profileId) return;
                                                setCalculatingTax(true);
                                                try {
                                                    if (periodMode === 'annually') {
                                                        const result = await calculateTaxGet(profileId);
                                                        if (result.success) {
                                                            setCalculatedTax(result.data);
                                                            toast.success(
                                                                `Annual tax calculated. Tax payable: ₦${(result.data.calculation?.netTaxPayable ?? 0).toLocaleString()}`,
                                                                { title: 'Calculated' },
                                                            );
                                                        }
                                                    } else {
                                                        if (!canCalculateMonthlyTax) {
                                                            toast.warning('Complete your income and deductions first, then calculate your monthly tax.');
                                                            return;
                                                        }
                                                        const monthNum = MONTHS.indexOf(activeMonth) + 1;
                                                        const result = await calculateTaxByMonth(profileId, monthNum);
                                                        if (result.success) {
                                                            setCalculatedTax(result.data);
                                                            toast.success(
                                                                `${activeMonth} tax calculated. Tax payable: ₦${(result.data.calculation?.netTaxPayable ?? 0).toLocaleString()}`,
                                                                { title: 'Calculated' },
                                                            );
                                                        }
                                                    }
                                                } catch (err: any) {
                                                    toast.error(err.message || 'Failed to calculate tax');
                                                } finally {
                                                    setCalculatingTax(false);
                                                }
                                            }}
                                            disabled={
                                                calculatingTax ||
                                                (periodMode === 'monthly' && !canCalculateMonthlyTax)
                                            }
                                            className="h-11 w-full sm:w-auto px-5 rounded-xl bg-[#0C0C0E] text-white text-[13px] font-semibold shadow-sm hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            {calculatingTax ? 'Calculating...' : (periodMode === 'annually' ? 'Calculate Annual Tax' : 'Calculate Monthly Tax')}
                                        </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'review' && (
                            <ReviewAndFile 
                                profileId={profileId}
                                filingPreference={periodMode === 'annually' ? 'annual' : 'monthly'}
                                year={currentProfile?.year || 2026}
                            />
                        )}
                    </div>
                </div>
            </main>

            {/* Income Modal */}
            {incomeModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-[#0C0C0E]">
                            {editingIncome ? 'Edit Income' : 'Add Income'}
                        </h3>
                        <button 
                            onClick={() => setIncomeModalOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[13px] font-semibold text-[#374151] mb-2 block">Income Type</label>
                            <select 
                                value={incomeForm.type}
                                onChange={(e) => setIncomeForm({...incomeForm, type: e.target.value as any})}
                                className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40"
                            >
                                <option value="employment">Employment</option>
                                <option value="freelance">Freelance</option>
                                <option value="crypto">Crypto</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[13px] font-semibold text-[#374151] mb-2 block">Category</label>
                            <select 
                                value={incomeForm.category}
                                onChange={(e) => setIncomeForm({...incomeForm, category: e.target.value as any})}
                                className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40"
                            >
                                <option value="salary">Salary</option>
                                <option value="freelance_fee">Freelance Fee</option>
                                <option value="crypto">Crypto</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[13px] font-semibold text-[#374151] mb-2 block">Amount (₦)</label>
                            <input 
                                type="number"
                                value={incomeForm.amount}
                                onChange={(e) => setIncomeForm({...incomeForm, amount: e.target.value})}
                                placeholder="Enter amount"
                                className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[13px] font-semibold text-[#374151] mb-2 block">Month</label>
                                <select 
                                    value={incomeForm.month}
                                    onChange={(e) => setIncomeForm({...incomeForm, month: parseInt(e.target.value)})}
                                    className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40"
                                >
                                    {MONTHS.map((month, idx) => (
                                        <option key={month} value={idx + 1}>{month}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[13px] font-semibold text-[#374151] mb-2 block">Year</label>
                                <select 
                                    value={incomeForm.year}
                                    onChange={(e) => setIncomeForm({...incomeForm, year: parseInt(e.target.value)})}
                                    className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40"
                                >
                                    <option value={2026}>2026</option>
                                    <option value={2025}>2025</option>
                                    <option value={2024}>2024</option>
                                </select>
                            </div>
                        </div>

                        {incomeForm.type === 'employment' && (
                            <>
                                <div>
                                    <label className="text-[13px] font-semibold text-[#374151] mb-2 block">Employer Name</label>
                                    <input 
                                        type="text"
                                        value={incomeForm.employerName}
                                        onChange={(e) => setIncomeForm({...incomeForm, employerName: e.target.value})}
                                        placeholder="Company name"
                                        className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40"
                                    />
                                </div>
                                <div>
                                    <label className="text-[13px] font-semibold text-[#374151] mb-2 block">Employer TIN</label>
                                    <input 
                                        type="text"
                                        value={incomeForm.employerTIN}
                                        onChange={(e) => setIncomeForm({...incomeForm, employerTIN: e.target.value})}
                                        placeholder="Employer TIN"
                                        className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[13px] font-semibold text-[#374151] mb-2 block">Bonuses (₦)</label>
                                        <input 
                                            type="number"
                                            value={incomeForm.bonuses}
                                            onChange={(e) => setIncomeForm({...incomeForm, bonuses: e.target.value})}
                                            placeholder="0"
                                            className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[13px] font-semibold text-[#374151] mb-2 block">Commissions (₦)</label>
                                        <input 
                                            type="number"
                                            value={incomeForm.commissions}
                                            onChange={(e) => setIncomeForm({...incomeForm, commissions: e.target.value})}
                                            placeholder="0"
                                            className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <button 
                            onClick={async () => {
                                if (!profileId || !incomeForm.amount) {
                                    toast.warning('Please enter an amount');
                                    return;
                                }
                                setSavingIncome(true);
                                try {
                                    const data = {
                                        type: incomeForm.type,
                                        category: incomeForm.category,
                                        amount: parseFloat(incomeForm.amount),
                                        month: incomeForm.month,
                                        year: incomeForm.year,
                                        ...(incomeForm.type === 'employment' && {
                                            employerName: incomeForm.employerName,
                                            employerTIN: incomeForm.employerTIN,
                                            bonuses: incomeForm.bonuses ? parseFloat(incomeForm.bonuses) : undefined,
                                            commissions: incomeForm.commissions ? parseFloat(incomeForm.commissions) : undefined
                                        })
                                    };
                                    
                                    if (editingIncome) {
                                        await updateIncome(profileId, editingIncome._id, data);
                                    } else {
                                        await addIncome(profileId, data);
                                    }
                                    setIncomeModalOpen(false);
                                    toast.success(editingIncome ? 'Income updated' : 'Income added');
                                    loadProfileData();
                                } catch (err: any) {
                                    toast.error(err.message || 'Failed to save income');
                                } finally {
                                    setSavingIncome(false);
                                }
                            }}
                            disabled={savingIncome}
                            className="w-full h-12 bg-[#003787] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 mt-4"
                        >
                            {savingIncome ? 'Saving...' : editingIncome ? 'Update Income' : 'Add Income'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {deductionModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-[#0C0C0E]">
                            {editingDeduction ? 'Edit Deduction' : 'Add Deduction'}
                        </h3>
                        <button 
                            onClick={() => setDeductionModalOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[13px] font-semibold text-[#374151] mb-2 block">Deduction Type</label>
                            <select 
                                value={deductionForm.deductionType}
                                onChange={(e) => setDeductionForm({...deductionForm, deductionType: e.target.value as any})}
                                className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40"
                            >
                                <option value="pension">Pension Contributions</option>
                                <option value="nhis">Health Insurance (NHIS)</option>
                                <option value="rent_relief">Rent Relief</option>
                                <option value="mortgage_interest">Mortgage Interest</option>
                                <option value="life_insurance">Life Insurance</option>
                                <option value="nhf">National Housing Fund (NHF)</option>
                                <option value="other">Other Reliefs</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[13px] font-semibold text-[#374151] mb-2 block">Amount (₦)</label>
                            <input 
                                type="number"
                                value={deductionForm.amount}
                                onChange={(e) => setDeductionForm({...deductionForm, amount: e.target.value})}
                                placeholder="Enter amount"
                                className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40"
                            />
                        </div>

                        <div>
                            <label className="text-[13px] font-semibold text-[#374151] mb-2 block">Year</label>
                            <select 
                                value={deductionForm.year}
                                onChange={(e) => setDeductionForm({...deductionForm, year: parseInt(e.target.value)})}
                                className="w-full h-11 border border-gray-200 bg-white rounded-xl px-4 text-[14px] font-medium text-[#0C0C0E] focus:outline-none focus:border-[#003787]/40"
                            >
                                <option value={2026}>2026</option>
                                <option value={2025}>2025</option>
                                <option value={2024}>2024</option>
                            </select>
                        </div>

                        <button 
                            onClick={async () => {
                                if (!profileId || !deductionForm.amount) {
                                    toast.warning('Please enter an amount');
                                    return;
                                }
                                setSavingDeduction(true);
                                try {
                                    const data = {
                                        profileId,
                                        year: deductionForm.year,
                                        deductionType: deductionForm.deductionType,
                                        amount: parseFloat(deductionForm.amount)
                                    };
                                    
                                    if (editingDeduction) {
                                        await updateDeduction(editingDeduction._id, {
                                            amount: parseFloat(deductionForm.amount),
                                            deductionType: deductionForm.deductionType
                                        });
                                    } else {
                                        await batchCreateDeductions({
                                            profileId,
                                            year: deductionForm.year,
                                            deductions: [{
                                                deductionType: deductionForm.deductionType,
                                                amount: parseFloat(deductionForm.amount)
                                            }]
                                        });
                                    }
                                    setDeductionModalOpen(false);
                                    toast.success(editingDeduction ? 'Deduction updated' : 'Deduction added');
                                    loadProfileData();
                                } catch (err: any) {
                                    toast.error(err.message || 'Failed to save deduction');
                                } finally {
                                    setSavingDeduction(false);
                                }
                            }}
                            disabled={savingDeduction}
                            className="w-full h-12 bg-[#003787] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 mt-4"
                        >
                            {savingDeduction ? 'Saving...' : editingDeduction ? 'Update Deduction' : 'Add Deduction'}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
    );
}
