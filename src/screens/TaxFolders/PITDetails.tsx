'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';
import { useApi } from '@/hooks/useApi';
import { useUser } from '@/contexts/UserContext';

interface QuestionValidation {
    pattern?: string;
    min?: number;
    max?: number;
    currency?: string;
}

interface Question {
    questionId: string;
    category: string;
    categoryKey: string;
    questionText: string;
    questionType: 'text' | 'number' | 'date' | 'yes_no' | 'multiple_choice' | 'email' | 'url' | 'address' | 'table' | 'select';
    required: boolean;
    options?: string[];
    explanation?: string;
    validation?: QuestionValidation;
    allowMultiple?: boolean;
    existingResponse?: any;
    columns?: any[];
    supportsMonthly?: boolean;
    supportsAnnually?: boolean;
    conditionalQuestions?: Record<string, string[]>;
    dependsOn?: string | string[] | {
        questionId: string;
        value: any;
    };
}

interface Category {
    categoryKey: string;
    categoryName: string;
    questions: Question[];
}

const MONTHS = [
    { id: 1, name: 'January' }, { id: 2, name: 'February' }, { id: 3, name: 'March' },
    { id: 4, name: 'April' }, { id: 5, name: 'May' }, { id: 6, name: 'June' },
    { id: 7, name: 'July' }, { id: 8, name: 'August' }, { id: 9, name: 'September' },
    { id: 10, name: 'October' }, { id: 11, name: 'November' }, { id: 12, name: 'December' }
];

const SidebarItem = ({ label, active = false, completed = false, onClick }: { label: string; active?: boolean; completed?: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all mb-1 ${active ? 'bg-[#F1F5F9]' : 'hover:bg-gray-50'}`}
    >
        <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-lg bg-[#F5F5F3] flex items-center justify-center flex-shrink-0">
                <Image
                    src="/icons/inactive_folder.svg"
                    alt="section"
                    width={18}
                    height={18}
                />
            </div>

            <div className="flex items-center gap-2">
                <span className={`text-[14px] font-semibold ${active ? 'text-taxable-dark' : 'text-[#64748B]'}`}>{label}</span>
                {completed && (
                    <div className="w-4 h-4 bg-[#10B981] rounded-[3px] flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
        <svg className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-taxable-dark' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    </button>
);





export default function PITDetails() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { get, post } = useApi();
    const { loading: authLoading } = useUser();

    const profileId = searchParams.get('id');
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [activeSectionKey, setActiveSectionKey] = React.useState<string>('');
    const [loading, setLoading] = React.useState(true);
    const [responses, setResponses] = React.useState<Record<string, any>>({});
    const [showWelcomeModal, setShowWelcomeModal] = React.useState(false);
    const [profileInfo, setProfileInfo] = React.useState<any>(null);
    const [isMonthly, setIsMonthly] = React.useState(false);
    const [activeMonth, setActiveMonth] = React.useState(1);
    const [submitting, setSubmitting] = React.useState(false);
    const [annualSubSection, setAnnualSubSection] = React.useState<'income' | 'deduction'>('income');

    React.useEffect(() => {
        if (authLoading) return;

        const isNew = searchParams.get('new');
        if (isNew === 'workspace') {
            setShowWelcomeModal(true);
            router.replace(pathname + (profileId ? `?id=${profileId}` : ''));
        }

        if (profileId) {
            fetchDetailedQuestions();
        }
    }, [profileId, authLoading]);

    const fetchDetailedQuestions = async () => {
        setLoading(true);
        try {
            const response = await get(`/questions/${profileId}/detailed-questions`);
            if (response?.success && response.data) {
                setCategories(response.data.categories);
                setProfileInfo({
                    type: response.data.profileType,
                    year: response.data.year,
                    period: response.data.period
                });
                if (response.data.categories.length > 0) {
                    setActiveSectionKey(response.data.categories[0].categoryKey);
                }

                // Initialize responses with existing ones
                const initialResponses: any = {};

                response.data.categories.forEach((cat: Category) => {
                    const isIncome = checkIfIncomeCategory(cat);

                    cat.questions.forEach((q: Question) => {
                        if (q.existingResponse !== undefined && q.existingResponse !== null) {
                            if (isIncome && typeof q.existingResponse === 'object' && !Array.isArray(q.existingResponse) && q.questionType !== 'table') {
                                // If it's already an object of monthly data, use it
                                initialResponses[q.questionId] = q.existingResponse;
                            } else if (isIncome && Array.isArray(q.existingResponse) && q.questionType !== 'table') {
                                // If it's an array, map it to our 1-12 object
                                const monthlyData: any = {};
                                q.existingResponse.forEach((res: any) => {
                                    if (res.month) monthlyData[res.month] = res.response;
                                });
                                initialResponses[q.questionId] = monthlyData;
                            } else {
                                initialResponses[q.questionId] = q.existingResponse;
                            }
                        }
                    });
                });
                setResponses(initialResponses);
            }
        } catch (err) {
            console.error("Failed to fetch detailed questions:", err);
        } finally {
            setLoading(false);
        }
    };

    const checkIfIncomeCategory = (category: Category | undefined) => {
        if (!category) return false;
        return (
            category.categoryKey.includes('EMPLOYMENT') ||
            category.categoryKey.includes('BUSINESS') ||
            category.categoryKey.includes('DEDUCTION') ||
            category.categoryName.toLowerCase().includes('income') ||
            category.categoryName.toLowerCase().includes('deduction')
        );
    };

    const PITSkeleton = () => (
        <div className="animate-pulse">
            {/* Breadcrumbs Skeleton */}
            <div className="flex items-center gap-2 mb-6">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <span className="text-gray-200">/</span>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>

            {/* Title Skeleton */}
            <div className="flex justify-between items-start mb-10">
                <div>
                    <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
            </div>

            <div className="flex items-start gap-8">
                {/* Sidebar Skeleton */}
                <div className="w-[320px] flex-shrink-0">
                    <div className="bg-white rounded-[24px] p-6 border border-gray-100">
                        <div className="h-6 bg-gray-200 rounded w-24 mb-6"></div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0"></div>
                                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Skeleton */}
                <div className="flex-1 min-w-0 max-w-[840px]">
                    <div className="bg-white rounded-[24px] p-8 border border-gray-100">
                        <div className="h-7 bg-gray-200 rounded-lg w-1/3 mb-8"></div>
                        <div className="space-y-10">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="space-y-4">
                                    <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-14 bg-gray-50 rounded-2xl w-full"></div>
                                </div>
                            ))}
                        </div>
                        <div className="h-14 bg-gray-200 rounded-2xl w-40 mt-10"></div>
                    </div>
                </div>

                {/* Right Sidebar Skeleton */}
                <div className="w-[280px] flex-shrink-0">
                    <div className="bg-gray-50 rounded-[24px] p-7 h-[367px]">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div className="space-y-3 mb-8">
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const formatAmount = (val: any) => {
        if (!val && val !== 0) return '';
        const parts = val.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    };

    const parseAmount = (val: string) => {
        return val.replace(/,/g, '');
    };

    const handleAnswerChange = (questionId: string, value: any) => {
        if (isMonthly && checkIfIncomeCategory(activeCategory)) {
            setResponses(prev => ({
                ...prev,
                [questionId]: {
                    ...(typeof prev[questionId] === 'object' ? prev[questionId] : {}),
                    [activeMonth]: value
                }
            }));
        } else {
            setResponses(prev => ({ ...prev, [questionId]: value }));
        }
    };

    const handleAddRow = (questionId: string, columns: any[]) => {
        const currentRes = responses[questionId];
        const currentData = (isMonthly && checkIfIncomeCategory(activeCategory))
            ? (currentRes?.[activeMonth] || [])
            : (currentRes || []);

        const newRow = columns.reduce((acc, col) => ({ ...acc, [col.field || col.key]: '' }), {});
        handleAnswerChange(questionId, [...currentData, newRow]);
    };

    const handleTableRowChange = (questionId: string, rowIndex: number, field: string, value: any) => {
        const currentRes = responses[questionId];
        const currentData = (isMonthly && checkIfIncomeCategory(activeCategory))
            ? [...(currentRes?.[activeMonth] || [])]
            : [...(currentRes || [])];

        currentData[rowIndex] = { ...currentData[rowIndex], [field]: value };
        handleAnswerChange(questionId, currentData);
    };

    const handleRemoveRow = (questionId: string, rowIndex: number) => {
        const currentRes = responses[questionId];
        const currentData = (isMonthly && checkIfIncomeCategory(activeCategory))
            ? (currentRes?.[activeMonth] || [])
            : (currentRes || []);

        handleAnswerChange(questionId, currentData.filter((_: any, idx: number) => idx !== rowIndex));
    };

    const activeCategory = categories.find(c => c.categoryKey === activeSectionKey);
    const currentIndex = categories.findIndex(c => c.categoryKey === activeSectionKey);
    const supportsPeriodToggle = activeCategory?.questions.some(q => q.supportsMonthly && q.supportsAnnually);

    const handleNext = async () => {
        if (!activeCategory || !profileId) return;

        if (!isCategoryComplete(activeCategory)) {
            alert("Please fill in all required questions before proceeding.");
            return;
        }

        setSubmitting(true);
        try {
            const isIncomeCategory = checkIfIncomeCategory(activeCategory);
            const visibleQuestions = activeCategory.questions.filter(q => isQuestionVisible(q));

            for (const q of visibleQuestions) {
                const responseData = responses[q.questionId];
                if (responseData === undefined) continue;

                if (isIncomeCategory) {
                    if (isMonthly) {
                        // Save each month's data
                        for (let m = 1; m <= 12; m++) {
                            let val = responseData?.[m];
                            if (val === undefined) val = (q.questionType === 'number' ? 0 : (q.questionType === 'table' ? [] : ''));

                            if (q.questionType === 'number' && typeof val === 'string') {
                                val = Number(parseAmount(val)) || 0;
                            }

                            await post(`/questions/${profileId}/income`, {
                                questionId: q.questionId,
                                response: val,
                                period: 'monthly',
                                month: m,
                                year: Number(profileInfo?.year) || 2025,
                                autoSave: true
                            });
                        }
                    } else {
                        // Save annual data
                        let val = responseData;
                        if (q.questionType === 'number' && typeof val === 'string') {
                            val = Number(parseAmount(val)) || 0;
                        }

                        await post(`/questions/${profileId}/income`, {
                            questionId: q.questionId,
                            response: val,
                            period: 'annually',
                            month: 1,
                            year: Number(profileInfo?.year) || 2025,
                            autoSave: true
                        });
                    }
                } else {
                    await post(`/questions/${profileId}/answer`, {
                        questionId: q.questionId,
                        response: responseData
                    });
                }
            }

            if (currentIndex < categories.length - 1) {
                setActiveSectionKey(categories[currentIndex + 1].categoryKey);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setActiveMonth(1); // Reset month for next category
            } else {
                router.push('/home');
            }
        } catch (err: any) {
            console.error("Failed to save progress:", err);
            // Optionally show error to user
        } finally {
            setSubmitting(false);
        }
    };

    const isQuestionVisible = (q: Question) => {
        if (!q.dependsOn) return true;

        if (typeof q.dependsOn === 'string') {
            return responses[q.dependsOn] === 'yes';
        }

        if (Array.isArray(q.dependsOn)) {
            return q.dependsOn.every(id => responses[id] === 'yes');
        }

        if (typeof q.dependsOn === 'object' && q.dependsOn !== null) {
            const res = responses[q.dependsOn.questionId];
            const parentResponse = (isMonthly && checkIfIncomeCategory(activeCategory))
                ? res?.[activeMonth]
                : res;

            if (Array.isArray(parentResponse)) {
                return parentResponse.includes(q.dependsOn.value);
            }
            return parentResponse === q.dependsOn.value;
        }

        return true;
    };

    const isCategoryComplete = (category: Category) => {
        return category.questions.every(q => {
            if (!isQuestionVisible(q)) return true;
            if (!q.required) return true;

            const res = responses[q.questionId];
            const response = (isMonthly && checkIfIncomeCategory(category))
                ? res?.[activeMonth]
                : res;

            if (response === undefined || response === null || response === '') return false;
            if (Array.isArray(response) && response.length === 0) return false;

            return true;
        });
    };

    const renderQuestion = (q: Question) => {
        if (!isQuestionVisible(q)) return null;
        const res = responses[q.questionId];
        const value = (isMonthly && checkIfIncomeCategory(activeCategory))
            ? (res?.[activeMonth] ?? '')
            : (res ?? '');

        return (
            <div key={q.questionId} className="mb-8">
                <label className="block text-sm font-bold text-taxable-dark mb-3">
                    {isMonthly && q.supportsMonthly ? q.questionText.replace(/tax year|annual|annually/gi, 'month') : q.questionText} {q.required && <span className="text-red-500">*</span>}
                </label>

                {q.questionType === 'yes_no' ? (
                    <div className="flex gap-6 mb-8">
                        {['yes', 'no'].map(opt => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                                <div className="w-5 h-5 rounded-full border-2 border-gray-100 flex items-center justify-center group-hover:border-taxable-blue/40 transition-colors">
                                    <input
                                        type="radio"
                                        name={`${activeMonth}-${q.questionId}`}
                                        className="hidden"
                                        checked={value === opt}
                                        onChange={() => handleAnswerChange(q.questionId, opt)}
                                    />
                                    {value === opt && <div className="w-2.5 h-2.5 rounded-full bg-taxable-blue" />}
                                </div>
                                <span className="text-sm font-semibold text-taxable-gray group-hover:text-taxable-dark capitalize">{opt}</span>
                            </label>
                        ))}
                    </div>
                ) : q.questionType === 'select' ? (
                <div className="mb-8 relative group">
                    <select
                        className="w-full h-12 bg-[#F9FBFC] border border-gray-100 rounded-xl px-4 text-sm font-medium text-taxable-dark focus:outline-none focus:border-taxable-blue/40 appearance-none cursor-pointer pr-10"
                        value={value}
                        onChange={(e) => handleAnswerChange(q.questionId, e.target.value)}
                    >
                        <option value="" disabled>Select an option</option>
                        {q.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-taxable-dark transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                    </div>
                </div>
            ) : q.questionType === 'multiple_choice' ? (
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        {q.options?.map(opt => {
                            const isSelected = q.allowMultiple
                                ? (value || []).includes(opt)
                                : value === opt;

                            return (
                                <div
                                    key={opt}
                                    onClick={() => {
                                        if (q.allowMultiple) {
                                            const current = value || [];
                                            const next = current.includes(opt)
                                                ? current.filter((i: string) => i !== opt)
                                                : [...current, opt];
                                            handleAnswerChange(q.questionId, next);
                                        } else {
                                            handleAnswerChange(q.questionId, opt);
                                        }
                                    }}
                                    className={`px-4 py-2.5 rounded-xl border text-[13px] font-bold cursor-pointer transition-all text-center ${isSelected ? 'border-taxable-blue bg-blue-50 text-taxable-blue' : 'border-gray-100 hover:bg-[#F9FBFC] text-taxable-gray'}`}
                                >
                                    {opt}
                                </div>
                            );
                        })}
                    </div>
                ) : q.questionType === 'date' ? (
                    <div className="mb-8">
                        <input
                            type="date"
                            className="w-full h-12 bg-[#F9FBFC] border border-gray-100 rounded-xl px-4 text-sm font-medium text-taxable-dark focus:outline-none focus:border-taxable-blue/40"
                            value={value}
                            onChange={(e) => handleAnswerChange(q.questionId, e.target.value)}
                        />
                    </div>
                ) : q.questionType === 'table' ? (
                    <div className="col-span-2 mb-8 bg-white border border-gray-100 rounded-2xl overflow-hidden">
                        {/* Table implementation simplified for new design grid compatibility */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#F9FBFC] border-b border-gray-100">
                                    <tr>
                                        {q.columns?.map((col: any) => (
                                            <th key={col.field} className="px-5 py-3 text-[11px] font-bold text-[#A3A3A3] uppercase tracking-wider">{col.label}</th>
                                        ))}
                                        <th className="w-12 px-5 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(!value || value.length === 0) ? (
                                        <tr>
                                            <td colSpan={(q.columns?.length || 0) + 1} className="px-5 py-8 text-center text-[13px] text-[#94A3B8] font-medium">
                                                No details added yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        value.map((row: any, rowIndex: number) => (
                                            <tr key={rowIndex} className="group hover:bg-[#FBFCFD] transition-colors">
                                                {q.columns?.map((col: any) => (
                                                    <td key={col.field} className="px-5 py-2">
                                                        <input
                                                            type="text"
                                                            className="w-full h-8 bg-transparent border-none focus:ring-0 text-[13px] font-semibold text-taxable-dark p-0 placeholder-[#CBD5E1]"
                                                            placeholder={col.type === 'number' ? '0.00' : '...'}
                                                            value={col.type === 'number' ? formatAmount(row[col.field]) : (row[col.field] || '')}
                                                            onChange={(e) => {
                                                                let val = e.target.value;
                                                                if (col.type === 'number') {
                                                                    val = parseAmount(val);
                                                                    if (val !== '' && !/^\d*\.?\d*$/.test(val)) return;
                                                                }
                                                                handleTableRowChange(q.questionId, rowIndex, col.field, val);
                                                            }}
                                                        />
                                                    </td>
                                                ))}
                                                <td className="px-5 py-2 text-right">
                                                    <button onClick={() => handleRemoveRow(q.questionId, rowIndex)} className="text-[#94A3B8] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={() => handleAddRow(q.questionId, q.columns || [])} className="w-full py-3 text-[13px] font-bold text-taxable-blue hover:bg-blue-50/50 transition-all border-t border-gray-50 flex items-center justify-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Add Details
                        </button>
                    </div>
                ) : (
                    <div className="relative mb-8 group">
                        <input
                            type="text"
                            placeholder={q.validation?.currency === 'NGN' ? '₦0' : 'Type here...'}
                            className="w-full h-12 bg-[#F9FBFC] border border-gray-100 rounded-xl px-4 text-sm font-bold text-taxable-dark placeholder:text-[#CBD5E1] focus:outline-none focus:border-taxable-blue/40 transition-all"
                            value={q.questionType === 'number' ? formatAmount(value) : (value || '')}
                            onChange={(e) => {
                                let val = e.target.value;
                                if (q.questionType === 'number') {
                                    val = parseAmount(val);
                                    if (val !== '' && !/^\d*\.?\d*$/.test(val)) return;
                                }
                                handleAnswerChange(q.questionId, val);
                            }}
                        />
                        {q.explanation && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 group-hover:opacity-100 transition-opacity cursor-help">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                                </svg>
                                <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-taxable-dark text-white text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-xl">
                                    {q.explanation}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {q.explanation && (
                    <p className="text-[12px] text-taxable-gray mt-2 font-medium">{q.explanation}</p>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans pb-20">
            <DashboardHeader />

            {/* Welcome Modal */}
            {showWelcomeModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#001D48]/40 backdrop-blur-[4px]" onClick={() => setShowWelcomeModal(false)} />
                    <div className="relative bg-white rounded-[24px] w-[440px] p-8 shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col">
                        <div className="flex gap-4 mb-6">
                            {/* Logo Icon Container */}
                            <div className="w-12 h-12 rounded-xl bg-[#F5F5F3] flex items-center justify-center flex-shrink-0">
                                <Image src="/logo_black.svg" alt="Taxable" width={24} height={24} />
                            </div>

                            {/* Text Content */}
                            <div className="text-left">
                                <h2 className="text-xl font-semibold text-taxable-dark mb-2.5">Welcome to your tax workspace!</h2>
                                <p className="text-sm text-taxable-gray font-medium leading-[1.6]">
                                    Everything you need is organized in sections on the left. Start with <span className="text-taxable-dark font-bold">Personal Information</span> and work your way down.
                                </p>
                                <p className="text-sm text-taxable-gray font-medium mt-4 leading-[1.6]">
                                    Your progress is saved automatically.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowWelcomeModal(false)}
                            className="w-full h-12 bg-[#003787] text-white text-[15px] font-semibold rounded-xl hover:opacity-90 shadow-lg shadow-[#003787]/10 transition-all text-center"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}

            <main className="max-w-[1440px] mx-auto px-8 py-8">
                {loading ? (
                    <PITSkeleton />
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => router.back()}
                                    className="flex items-center gap-2 text-sm font-semibold text-taxable-dark hover:text-taxable-blue transition-colors"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                                    </svg>
                                    Back
                                </button>
                                <div className="flex items-center gap-2 text-[13px] text-[#94A3B8] font-medium">
                                    <span>{profileInfo?.year} {profileInfo?.type} Tax</span>
                                    <span>/</span>
                                    <span className="text-[#64748B]">{activeCategory?.categoryName}</span>
                                </div>
                            </div>
                        </div>

                        {/* Summary Header */}
                        <div className="flex justify-between items-end mb-10">
                            <div>
                                <h1 className="text-2xl font-bold text-taxable-dark mb-1">{profileInfo?.year} {profileInfo?.type} Tax</h1>
                                <p className="text-[14px] text-taxable-gray font-semibold">
                                    {categories.filter(c => isCategoryComplete(c)).length} of {categories.length} sections complete
                                </p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-xl font-bold text-taxable-dark mb-1">₦0 (no data yet)</h2>
                                <p className="text-[13px] text-taxable-gray font-semibold">Current Tax Due</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-8">
                            {/* Sidebar */}
                            <div className="w-[260px] flex-shrink-0 flex flex-col gap-6">
                                <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100">
                                    <h3 className="text-[12px] font-bold text-[#A3A3A3] mb-4 uppercase tracking-wider">Select</h3>
                                    <div className="space-y-1">
                                        {categories.map((cat) => (
                                            <SidebarItem
                                                key={cat.categoryKey}
                                                label={cat.categoryName}
                                                active={activeSectionKey === cat.categoryKey}
                                                completed={isCategoryComplete(cat)}
                                                onClick={() => {
                                                    setActiveSectionKey(cat.categoryKey);
                                                    setActiveMonth(1);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-[20px] p-6 border border-gray-100/60 shadow-sm relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-3">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                                            </svg>
                                            <h4 className="text-[14px] font-bold text-taxable-dark">Need expert eyes?</h4>
                                        </div>
                                        <p className="text-[12px] text-taxable-gray font-medium leading-relaxed mb-5">
                                            Get your return reviewed by a certified tax accountant. They'll ensure accuracy and compliance.
                                        </p>
                                        <button className="w-full py-3 bg-white border border-gray-100 rounded-xl text-[13px] font-bold text-taxable-dark hover:bg-gray-50 transition-all shadow-sm">
                                            Book Accountant (₦15,000)
                                        </button>
                                    </div>
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50/50 rounded-full -mr-10 -mt-10 blur-2xl" />
                                </div>
                            </div>

                            {/* Middle Column: Selection (Month or Sub-section) */}
                            {checkIfIncomeCategory(activeCategory) ? (
                                <div className="w-[220px] flex-shrink-0 flex flex-col gap-6">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[13px] font-bold transition-colors ${isMonthly ? 'text-taxable-dark' : 'text-[#A3A3A3]'}`}>Monthly</span>
                                        <button
                                            onClick={() => {
                                                setIsMonthly(!isMonthly);
                                                setActiveMonth(1);
                                            }}
                                            className={`w-[38px] h-[20px] rounded-full relative transition-all ${isMonthly ? 'bg-[#00388D]' : 'bg-gray-300'}`}
                                        >
                                            <div className={`absolute top-0.5 w-[16px] h-[16px] bg-white rounded-full transition-all ${isMonthly ? 'left-0.5' : 'left-[21.5px]'}`} />
                                        </button>
                                        <span className={`text-[13px] font-bold transition-colors ${!isMonthly ? 'text-taxable-dark' : 'text-[#A3A3A3]'}`}>Annually</span>
                                    </div>

                                    {isMonthly ? (
                                        <div className="bg-white rounded-[24px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 overflow-hidden">
                                            {MONTHS.map((m) => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => setActiveMonth(m.id)}
                                                    className={`w-full px-5 py-4 flex items-center justify-between border-b border-gray-50 last:border-b-0 transition-colors ${activeMonth === m.id ? 'bg-[#F8FAFC]' : 'hover:bg-gray-50'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={activeMonth === m.id ? "#00388D" : "#94A3B8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                                        </svg>
                                                        <span className={`text-[14px] font-semibold ${activeMonth === m.id ? 'text-taxable-dark' : 'text-[#64748B]'}`}>{m.name}</span> 
                                                    </div>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${activeMonth === m.id ? 'rotate-180' : ''}`}>
                                                        <polyline points="6 9 12 15 18 9" />
                                                    </svg>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-[24px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 overflow-hidden">
                                            <button
                                                onClick={() => setAnnualSubSection('income')}
                                                className={`w-full px-5 py-5 flex items-center justify-between border-b border-gray-50 transition-colors ${annualSubSection === 'income' ? 'bg-[#F8FAFC]' : 'hover:bg-gray-50'}`}
                                            >
                                                <span className={`text-[13px] font-bold ${annualSubSection === 'income' ? 'text-taxable-dark' : 'text-[#64748B]'}`}>Total Income for {profileInfo?.year}</span>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                                            </button>
                                            <button
                                                onClick={() => setAnnualSubSection('deduction')}
                                                className={`w-full px-5 py-5 flex items-center justify-between transition-colors ${annualSubSection === 'deduction' ? 'bg-[#F8FAFC]' : 'hover:bg-gray-50'}`}
                                            >
                                                <span className={`text-[13px] font-bold ${annualSubSection === 'deduction' ? 'text-taxable-dark' : 'text-[#64748B]'}`}>Total deductible for {profileInfo?.year}</span>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : null}

                            {/* Right Content Area */}
                            <div className={`${checkIfIncomeCategory(activeCategory) ? 'flex-1' : 'max-w-[840px] flex-1'} min-w-0`}>
                                {activeCategory ? (
                                    <div className="animate-in fade-in duration-500">
                                        <div className="mb-6">
                                            {!isMonthly || !checkIfIncomeCategory(activeCategory) ? (
                                                <h2 className="text-xl font-bold text-taxable-dark">{activeCategory.categoryName}</h2>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-[13px] text-taxable-gray font-semibold mb-1 uppercase tracking-wide">
                                                        {isMonthly ? `Editing ${MONTHS.find(m => m.id === activeMonth)?.name}` : `Annual ${annualSubSection === 'income' ? 'Income' : 'Deductions'}`} {profileInfo?.year}
                                                    </p>
                                                    <h2 className="text-xl font-bold text-taxable-dark">{activeCategory.categoryName}</h2>
                                                </div>
                                            )}
                                        </div>

                                        {!isMonthly && supportsPeriodToggle && !checkIfIncomeCategory(activeCategory) && (
                                            <div className="flex items-center gap-3 mb-8">
                                                <span className={`text-[13px] font-bold transition-colors ${isMonthly ? 'text-taxable-dark' : 'text-[#A3A3A3]'}`}>Monthly</span>
                                                <button
                                                    onClick={() => setIsMonthly(!isMonthly)}
                                                    className={`w-[38px] h-[20px] rounded-full relative transition-all ${isMonthly ? 'bg-[#00388D]' : 'bg-gray-200'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-[16px] h-[16px] bg-white rounded-full transition-all ${isMonthly ? 'left-0.5' : 'left-[21.5px]'}`} />
                                                </button>
                                                <span className={`text-[13px] font-bold transition-colors ${!isMonthly ? 'text-taxable-dark' : 'text-[#A3A3A3]'}`}>Annually</span>
                                            </div>
                                        )}

                                        <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100">
                                            {checkIfIncomeCategory(activeCategory) && (
                                                <p className="text-[14px] text-taxable-gray font-medium mb-10">
                                                    Enter your {annualSubSection === 'income' ? 'income' : 'deductions'} for {isMonthly ? `${MONTHS.find(m => m.id === activeMonth)?.name} ` : ''}{profileInfo?.year}. Skip fields that don't apply to you. You can update amounts anytime.
                                                </p>
                                            )}

                                            <div className="space-y-12">
                                                {(() => {
                                                    const filteredQuestions = activeCategory.questions.filter(q => {
                                                        if (!isMonthly && checkIfIncomeCategory(activeCategory)) {
                                                            const isIncome = q.categoryKey.toLowerCase().includes('income') || q.categoryKey.toLowerCase().includes('employment') || q.categoryKey.toLowerCase().includes('business');
                                                            const isDeduction = q.categoryKey.toLowerCase().includes('deduction');
                                                            if (annualSubSection === 'income') return isIncome;
                                                            return isDeduction;
                                                        }
                                                        return true;
                                                    });

                                                    const grouped = filteredQuestions.reduce((acc, q) => {
                                                        const groupName = q.category || 'Information';
                                                        if (!acc[groupName]) acc[groupName] = [];
                                                        acc[groupName].push(q);
                                                        return acc;
                                                    }, {} as Record<string, Question[]>);

                                                    return Object.entries(grouped).map(([groupName, groupQuestions]) => (
                                                        <div key={groupName} className="col-span-full">
                                                            <h3 className="text-[17px] font-bold text-taxable-dark mb-6">{groupName}</h3>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
                                                                {groupQuestions.map(q => renderQuestion(q))}
                                                            </div>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>

                                            <button
                                                onClick={handleNext}
                                                disabled={submitting}
                                                className="w-full h-14 bg-[#00388D] text-white font-bold rounded-2xl hover:bg-[#002b6d] transition-colors mt-12 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-blue-900/10"
                                            >
                                                {submitting ? 'Saving Progress...' : (currentIndex === categories.length - 1 ? 'Review & File Tax Return' : 'Save & Continue')}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center py-20 bg-white rounded-[24px] border border-gray-100">
                                        <span className="text-taxable-gray font-medium italic">Select a section to begin.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
