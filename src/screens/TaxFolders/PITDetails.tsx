'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';
import { useApi } from '@/hooks/useApi';

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

const SidebarItem = ({ label, active = false, completed = false, isOrange = false, disabled = false, onClick }: { label: string; active?: boolean; completed?: boolean; isOrange?: boolean; disabled?: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-3.5 rounded-xl transition-all mb-1 ${active ? 'bg-[#F1F5F9]' : 'hover:bg-gray-50'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <div className="flex items-center gap-4 text-left">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isOrange ? 'bg-[#FFF7ED]' : 'bg-[#F5F5F3]'}`}>
                <Image
                    src={isOrange ? "/icons/folder.svg" : "/icons/inactive_folder.svg"}
                    alt="section"
                    width={22}
                    height={22}
                />
            </div>

            <div className="flex items-center gap-2">
                <span className={`text-base font-medium ${active ? 'text-taxable-dark' : 'text-[#64748B]'}`}>{label}</span>
                {completed && (
                    <div className="w-5 h-5 bg-[#10B981] rounded-[4px] flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
        <svg className={`w-4 h-4 flex-shrink-0 ${active ? 'text-taxable-dark' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    </button>
);



export default function PITDetails() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { get, post } = useApi();

    const profileId = searchParams.get('id');
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [activeSectionKey, setActiveSectionKey] = React.useState<string>('');
    const [loading, setLoading] = React.useState(true);
    const [responses, setResponses] = React.useState<Record<string, any>>({});
    const [showWelcomeModal, setShowWelcomeModal] = React.useState(false);
    const [profileInfo, setProfileInfo] = React.useState<any>(null);
    const [isMonthly, setIsMonthly] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);

    React.useEffect(() => {
        const isNew = searchParams.get('new');
        if (isNew === 'workspace') {
            setShowWelcomeModal(true);
            router.replace(pathname + (profileId ? `?id=${profileId}` : ''));
        }

        if (profileId) {
            fetchDetailedQuestions();
        }
    }, [profileId]);

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
                const processQuestion = (q: Question) => {
                    if (q.existingResponse !== undefined && q.existingResponse !== null) {
                        initialResponses[q.questionId] = q.existingResponse;
                    }
                };

                response.data.categories.forEach((cat: Category) => {
                    cat.questions.forEach(processQuestion);
                });
                setResponses(initialResponses);
            }
        } catch (err) {
            console.error("Failed to fetch detailed questions:", err);
        } finally {
            setLoading(false);
        }
    };

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
        setResponses(prev => ({ ...prev, [questionId]: value }));
    };

    const handleAddRow = (questionId: string, columns: any[]) => {
        const current = responses[questionId] || [];
        const newRow = columns.reduce((acc, col) => ({ ...acc, [col.field || col.key]: '' }), {});
        handleAnswerChange(questionId, [...current, newRow]);
    };

    const handleTableRowChange = (questionId: string, rowIndex: number, field: string, value: any) => {
        const current = [...(responses[questionId] || [])];
        current[rowIndex] = { ...current[rowIndex], [field]: value };
        handleAnswerChange(questionId, current);
    };

    const handleRemoveRow = (questionId: string, rowIndex: number) => {
        const current = responses[questionId] || [];
        handleAnswerChange(questionId, current.filter((_: any, idx: number) => idx !== rowIndex));
    };

    const activeCategory = categories.find(c => c.categoryKey === activeSectionKey);
    const currentIndex = categories.findIndex(c => c.categoryKey === activeSectionKey);
    const supportsPeriodToggle = activeCategory?.questions.some(q => q.supportsMonthly && q.supportsAnnually);

    const handleNext = async () => {
        if (!activeCategory || !profileId) return;

        setSubmitting(true);
        try {
            const isIncomeCategory = 
                activeCategory.categoryKey.includes('EMPLOYMENT') || 
                activeCategory.categoryKey.includes('BUSINESS') || 
                activeCategory.categoryKey.includes('DEDUCTION') ||
                activeCategory.categoryName.toLowerCase().includes('income') ||
                activeCategory.categoryName.toLowerCase().includes('deduction');

            const visibleQuestions = activeCategory.questions.filter(q => isQuestionVisible(q));
            
            const submissionTasks = visibleQuestions
                .filter(q => responses[q.questionId] !== undefined)
                .map(async (q) => {
                    let responseValue = responses[q.questionId];
                    
                    if (q.questionType === 'number' && typeof responseValue === 'string') {
                        responseValue = Number(parseAmount(responseValue)) || 0;
                    }

                    if (isIncomeCategory) {
                        return post(`/questions/${profileId}/income`, {
                            questionId: q.questionId,
                            response: responseValue,
                            period: isMonthly ? 'monthly' : 'annually',
                            month: 1, // Defaulting to 1 as per snippet
                            year: Number(profileInfo?.year) || 2025,
                            autoSave: true
                        });
                    } else {
                        return post(`/questions/${profileId}/answer`, {
                            questionId: q.questionId,
                            response: responseValue
                        });
                    }
                });

            if (submissionTasks.length > 0) {
                await Promise.all(submissionTasks);
            }

            if (currentIndex < categories.length - 1) {
                setActiveSectionKey(categories[currentIndex + 1].categoryKey);
                window.scrollTo({ top: 0, behavior: 'smooth' });
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
            const parentResponse = responses[q.dependsOn.questionId];
            if (Array.isArray(parentResponse)) {
                return parentResponse.includes(q.dependsOn.value);
            }
            return parentResponse === q.dependsOn.value;
        }

        return true;
    };

    const renderQuestion = (q: Question) => {
        if (!isQuestionVisible(q)) return null;

        return (
            <div key={q.questionId} className="mb-8">
                <label className="block text-sm font-bold text-taxable-dark mb-3">
                    {isMonthly && q.supportsMonthly ? q.questionText.replace(/tax year|annual|annually/gi, 'month') : q.questionText} {q.required && <span className="text-red-500">*</span>}
                </label>

                {q.questionType === 'yes_no' ? (
                    <div className="flex gap-6">
                        {['yes', 'no'].map(opt => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                                <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex items-center justify-center group-hover:border-taxable-blue transition-colors">
                                    <input
                                        type="radio"
                                        name={q.questionId}
                                        className="hidden"
                                        checked={responses[q.questionId] === opt}
                                        onChange={() => handleAnswerChange(q.questionId, opt)}
                                    />
                                    {responses[q.questionId] === opt && <div className="w-2.5 h-2.5 rounded-full bg-taxable-blue" />}
                                </div>
                                <span className="text-sm font-medium text-taxable-gray group-hover:text-taxable-dark capitalize">{opt}</span>
                            </label>
                        ))}
                    </div>
                ) : q.questionType === 'select' ? (
                    <select
                        className="w-full h-14 bg-white border border-gray-100 rounded-2xl px-4 focus:outline-none focus:ring-1 focus:ring-taxable-blue/20 appearance-none cursor-pointer"
                        value={responses[q.questionId] || ''}
                        onChange={(e) => handleAnswerChange(q.questionId, e.target.value)}
                    >
                        <option value="" disabled>Select an option</option>
                        {q.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                ) : q.questionType === 'multiple_choice' ? (
                    <div className="grid grid-cols-2 gap-3">
                        {q.options?.map(opt => {
                            const isSelected = q.allowMultiple
                                ? (responses[q.questionId] || []).includes(opt)
                                : responses[q.questionId] === opt;

                            return (
                                <div
                                    key={opt}
                                    onClick={() => {
                                        if (q.allowMultiple) {
                                            const current = responses[q.questionId] || [];
                                            const next = current.includes(opt)
                                                ? current.filter((i: string) => i !== opt)
                                                : [...current, opt];
                                            handleAnswerChange(q.questionId, next);
                                        } else {
                                            handleAnswerChange(q.questionId, opt);
                                        }
                                    }}
                                    className={`px-4 py-3 rounded-xl border text-sm font-medium cursor-pointer transition-all ${isSelected ? 'border-taxable-blue bg-blue-50 text-taxable-blue' : 'border-gray-100 hover:bg-gray-50 text-gray-600'}`}
                                >
                                    {opt}
                                </div>
                            );
                        })}
                    </div>
                ) : q.questionType === 'date' ? (
                    <input
                        type="date"
                        className="w-full h-14 bg-white border border-gray-100 rounded-2xl px-4 focus:outline-none focus:ring-1 focus:ring-taxable-blue/20"
                        value={responses[q.questionId] || ''}
                        onChange={(e) => handleAnswerChange(q.questionId, e.target.value)}
                    />
                ) : q.questionType === 'table' ? (
                    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead className="bg-[#F8FAFC] border-b border-gray-100">
                                    <tr>
                                        {q.columns?.map((col: any) => (
                                            <th key={col.field} className="px-5 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">{col.label}</th>
                                        ))}
                                        <th className="w-16 px-5 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(!responses[q.questionId] || responses[q.questionId].length === 0) ? (
                                        <tr>
                                            <td colSpan={(q.columns?.length || 0) + 1} className="px-5 py-12 text-center text-sm text-[#94A3B8] font-medium">
                                                No data added yet. Click "+ Add row" to start.
                                            </td>
                                        </tr>
                                    ) : (
                                        responses[q.questionId].map((row: any, rowIndex: number) => (
                                            <tr key={rowIndex} className="group hover:bg-gray-50/50 transition-colors">
                                                {q.columns?.map((col: any) => (
                                                    <td key={col.field} className="px-5 py-3">
                                                        {col.type === 'select' ? (
                                                            <select
                                                                className="w-full h-10 bg-transparent border-none focus:ring-0 text-sm font-medium text-taxable-dark p-0 cursor-pointer"
                                                                value={row[col.field] || ''}
                                                                onChange={(e) => handleTableRowChange(q.questionId, rowIndex, col.field, e.target.value)}
                                                            >
                                                                <option value="" disabled>Select</option>
                                                                {col.options?.map((opt: string) => (
                                                                    <option key={opt} value={opt}>{opt}</option>
                                                                ))}
                                                            </select>
                                                        ) : col.type === 'yes_no' ? (
                                                            <select
                                                                className="w-full h-10 bg-transparent border-none focus:ring-0 text-sm font-medium text-taxable-dark p-0 cursor-pointer"
                                                                value={row[col.field] || ''}
                                                                onChange={(e) => handleTableRowChange(q.questionId, rowIndex, col.field, e.target.value)}
                                                            >
                                                                <option value="" disabled>Select</option>
                                                                <option value="yes">Yes</option>
                                                                <option value="no">No</option>
                                                            </select>
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                className="w-full h-10 bg-transparent border-none focus:ring-0 text-sm font-medium text-taxable-dark p-0 placeholder-[#CBD5E1]"
                                                                placeholder={col.type === 'number' ? '0.00' : 'Type here...'}
                                                                value={col.type === 'number' ? formatAmount(row[col.field]) : (row[col.field] || '')}
                                                                onChange={(e) => {
                                                                    let val = e.target.value;
                                                                    if (col.type === 'number') {
                                                                        val = parseAmount(val);
                                                                        // Allow only numbers and one decimal point
                                                                        if (val !== '' && !/^\d*\.?\d*$/.test(val)) return;
                                                                    }
                                                                    handleTableRowChange(q.questionId, rowIndex, col.field, val);
                                                                }}
                                                            />
                                                        )}
                                                    </td>
                                                ))}
                                                <td className="px-5 py-3 text-right">
                                                    <button
                                                        onClick={() => handleRemoveRow(q.questionId, rowIndex)}
                                                        className="p-2 text-[#94A3B8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <button
                            onClick={() => handleAddRow(q.questionId, q.columns || [])}
                            className="w-full py-4 text-sm font-bold text-taxable-blue hover:bg-blue-50/50 transition-colors border-t border-gray-100 flex items-center justify-center gap-2"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Add row
                        </button>
                    </div>
                ) : q.questionType === 'address' ? (
                    <textarea
                        placeholder="Type address here..."
                        className="w-full min-h-[100px] bg-white border border-gray-100 rounded-2xl p-4 focus:outline-none focus:ring-1 focus:ring-taxable-blue/20 resize-none"
                        value={responses[q.questionId] || ''}
                        onChange={(e) => handleAnswerChange(q.questionId, e.target.value)}
                    />
                ) : (
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={q.validation?.currency === 'NGN' ? (isMonthly ? '₦0 / month' : '₦0 / year') : 'Type here...'}
                            className="w-full h-14 bg-white border border-gray-100 rounded-2xl px-4 focus:outline-none focus:ring-1 focus:ring-taxable-blue/20"
                            value={q.questionType === 'number' ? formatAmount(responses[q.questionId]) : (responses[q.questionId] || '')}
                            onChange={(e) => {
                                let val = e.target.value;
                                if (q.questionType === 'number') {
                                    val = parseAmount(val);
                                    if (val !== '' && !/^\d*\.?\d*$/.test(val)) return;
                                }
                                handleAnswerChange(q.questionId, val);
                            }}
                        />
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

            <main className="max-w-[1280px] mx-auto px-12 py-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm font-medium text-taxable-dark hover:text-taxable-blue transition-colors mb-4"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back
                </button>

                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[13px] text-[#94A3B8] font-medium mb-6">
                    <span>{profileInfo?.year} {profileInfo?.type} Tax</span>
                    <span>/</span>
                    <span className="text-[#64748B]">{activeCategory?.categoryName}</span>
                </div>

                {/* Page Content */}
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h1 className="text-2xl font-medium text-taxable-dark mb-1.5">{profileInfo?.year} {profileInfo?.type} Tax</h1>
                        <p className="text-base text-taxable-gray font-medium">{currentIndex + 1} of {categories.length} sections</p>
                    </div>
                </div>

                <div className="flex gap-12">
                    {/* Sidebar */}
                    <div className="w-[340px] flex-shrink-0 flex flex-col gap-6 sticky top-32">
                        <div className="bg-white rounded-[24px] p-4 border border-gray-100">
                            <h3 className="text-[20px] font-bold text-[#A3A3A3] mb-5 px-3">Sections</h3>
                            {categories.map((cat, idx) => (
                                <SidebarItem
                                    key={cat.categoryKey}
                                    label={cat.categoryName}
                                    active={activeSectionKey === cat.categoryKey}
                                    completed={idx < currentIndex}
                                    onClick={() => setActiveSectionKey(cat.categoryKey)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 max-w-[720px]">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <span className="text-taxable-gray font-medium">Loading questions...</span>
                            </div>
                        ) : activeCategory ? (
                            <div className="animate-in fade-in duration-500">
                                <h2 className="text-lg font-bold text-taxable-dark mb-6">{activeCategory.categoryName}</h2>

                                {supportsPeriodToggle && (
                                    <div className="flex items-center gap-6 mb-10">
                                        <span className={`text-[15px] font-bold transition-colors ${isMonthly ? 'text-taxable-dark' : 'text-[#A3A3A3]'}`}>Monthly</span>
                                        <button
                                            onClick={() => setIsMonthly(!isMonthly)}
                                            className="w-[52px] h-[26px] bg-[#00388D] rounded-full relative transition-all"
                                        >
                                            <div className={`absolute top-1 w-[18px] h-[18px] bg-white rounded-full transition-all ${isMonthly ? 'left-1' : 'left-[32px]'}`} />
                                        </button>
                                        <span className={`text-[15px] font-bold transition-colors ${!isMonthly ? 'text-taxable-dark' : 'text-[#A3A3A3]'}`}>Annually</span>
                                    </div>
                                )}

                                {activeCategory.questions.map((q) => renderQuestion(q))}


                                <button
                                    onClick={handleNext}
                                    disabled={submitting}
                                    className="h-14 px-10 bg-[#00388D] text-white font-bold rounded-2xl hover:bg-[#002b6d] transition-colors mt-8 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? 'Saving...' : (currentIndex === categories.length - 1 ? 'Finish' : 'Save & Continue')}
                                </button>
                            </div>
                        ) : null}
                    </div>

                    {/* Right Help Sidebar */}
                    <div className="w-[302px] flex-shrink-0">
                        <div className="bg-taxable-lightgray2 rounded-[24px] p-7 min-h-[367px] sticky top-32 border border-gray-100/50">
                            <div className="mb-4">
                                <div className="flex items-center gap-2.5 mb-2.5">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-taxable-dark">
                                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                                    </svg>
                                    <h4 className="text-base font-semibold text-taxable-dark">Why we need this</h4>
                                </div>
                                <p className="text-sm text-[#64748B] leading-[1.5] font-medium">
                                    Your details help us identify you with relevant tax authorities and ensure your tax return is filed correctly. All information is encrypted and stored securely.
                                </p>
                            </div>

                            <div className="space-y-0">
                                <div className="py-2.5">
                                    <div className="w-[270px] h-[3px] bg-white rounded-[10px] mb-4 -mx-1" />
                                    <div className="space-y-3.5">
                                        <button className="flex items-center gap-3.5 text-base font-semibold text-taxable-dark hover:text-taxable-blue transition-colors text-left w-full group">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#64748B] group-hover:text-taxable-blue transition-colors">
                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                                            </svg>
                                            <span>Tax filing guide</span>
                                        </button>
                                        <button className="flex items-center gap-3.5 text-base font-semibold text-taxable-dark hover:text-taxable-blue transition-colors text-left w-full group">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#64748B] group-hover:text-taxable-blue transition-colors"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                            <span>Understanding taxes</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="py-2.5">
                                    <div className="w-[270px] h-[3px] bg-white rounded-[10px] mb-4 -mx-1" />
                                    <div className="space-y-3.5">
                                        <button className="flex items-center gap-3.5 text-base font-semibold text-taxable-dark hover:text-taxable-blue transition-colors text-left w-full group">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#64748B] group-hover:text-taxable-blue transition-colors">
                                                <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                                            </svg>
                                            <span>Chat with support</span>
                                        </button>
                                        <button className="flex items-center gap-3.5 text-base font-semibold text-taxable-dark hover:text-taxable-blue transition-colors text-left w-full group">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#64748B] group-hover:text-taxable-blue transition-colors">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                                            </svg>
                                            <span>Email us</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main >
        </div >
    );
}
