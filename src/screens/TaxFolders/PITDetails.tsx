'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';

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

const FormField = ({ label, placeholder, hint, prefix, type = "text" }: { label: string; placeholder: string; hint?: React.ReactNode; prefix?: string; type?: string }) => (
    <div className="mb-6">
        <label className="block text-sm font-medium text-taxable-dark mb-2">{label}</label>
        <div className="relative">
            {prefix && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">{prefix}</div>
            )}
            <input
                type={type}
                placeholder={placeholder}
                className={`w-full h-14 bg-white border border-gray-100 rounded-2xl text-taxable-dark focus:outline-none focus:ring-1 focus:ring-taxable-blue/20 placeholder:text-gray-300 px-4 ${prefix ? 'pl-9' : ''}`}
            />
        </div>
        {hint && (
            <div className="flex items-center gap-1.5 mt-2">
                <div className="w-3.5 h-3.5 rounded-full bg-gray-400 flex items-center justify-center">
                    <span className="text-[9px] text-white font-bold">!</span>
                </div>
                <div className="text-[12px] text-taxable-gray font-medium">{hint}</div>
            </div>
        )}
    </div>
);

export default function PITDetails() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [activeSection, setActiveSection] = React.useState('Personal Information');
    const [progressIndex, setProgressIndex] = React.useState(0);
    const [isEmployed, setIsEmployed] = React.useState<boolean | null>(true);
    const [employers, setEmployers] = React.useState([{ id: 1, name: '', title: '', startDate: '', endDate: '', stillWorks: true, withheldTax: 'Yes' as 'Yes' | 'No' | 'Not sure', salary: '' }]);
    const [showWelcomeModal, setShowWelcomeModal] = React.useState(false);

    // Effect to show welcome modal only on first navigation from setup
    React.useEffect(() => {
        const isNew = searchParams.get('new');
        if (isNew === 'workspace') {
            setShowWelcomeModal(true);
            // Use Next.js router.replace to clean up the URL without breaking the history stack
            router.replace(pathname);
        }
    }, [searchParams, pathname, router]);
    const [incomePeriod, setIncomePeriod] = React.useState<'Monthly' | 'Annually'>('Monthly');
    const [expandedMonth, setExpandedMonth] = React.useState<string | null>('January');
    const [activeSubSection, setActiveSubSection] = React.useState<string>('Income');
    const [activeMonth, setActiveMonth] = React.useState<string>('January');

    // State to store all tax-related data for each month and category
    const [taxData, setTaxData] = React.useState<Record<string, Record<string, any>>>({});

    const handleInputChange = (month: string, section: string, field: string, value: string) => {
        setTaxData(prev => ({
            ...prev,
            [month]: {
                ...prev[month],
                [section]: {
                    ...prev[month]?.[section],
                    [field]: value
                }
            }
        }));
    };

    const toggleMonth = (month: string) => {
        setExpandedMonth(prev => prev === month ? prev : month);
        setActiveMonth(month);
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const sections = [
        "Personal Information",
        "Employer Information",
        "Healthcare",
        "Other Deductions",
        "Income & Deductions",
        "Review & File"
    ];

    const completedSections = sections.filter((_, index) => index < progressIndex);

    const handleNext = (nextSection: string) => {
        const nextIndex = sections.indexOf(nextSection);
        if (nextIndex > progressIndex) {
            setProgressIndex(nextIndex);
        }
        setActiveSection(nextSection);
    };

    const addEmployer = () => {
        if (employers.length < 6) {
            const newId = employers.length > 0 ? Math.max(...employers.map(e => e.id)) + 1 : 1;
            setEmployers([...employers, { id: newId, name: '', title: '', startDate: '', endDate: '', stillWorks: true, withheldTax: 'Yes', salary: '' }]);
        }
    };

    const removeEmployer = (id: number) => {
        setEmployers(employers.filter(e => e.id !== id));
    };

    const updateEmployer = (id: number, field: string, value: any) => {
        setEmployers(employers.map(e => e.id === id ? { ...e, [field]: value } : e));
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
                    <span>2026 Individual Tax</span>
                    <span>/</span>
                    <span className="text-[#64748B]">{activeSection}</span>
                </div>

                {/* Page Content */}
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h1 className="text-2xl font-medium text-taxable-dark mb-1.5">2026 Individual Tax</h1>
                        <p className="text-base text-taxable-gray font-medium">{completedSections.length + 1} of 7 sections complete</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-medium text-taxable-dark">₦0 (no data yet)</div>
                        <p className="text-base text-taxable-gray font-medium mt-1">Current Tax Due</p>
                    </div>
                </div>

                <div className="flex gap-12">
                    {/* Sidebar */}
                    <div className="w-[340px] flex-shrink-0 flex flex-col gap-6 sticky top-32">
                        {/* Section 1 */}
                        <div className="bg-white rounded-[24px] p-4 border border-gray-100">
                            <h3 className="text-[20px] font-bold text-[#A3A3A3] mb-5 px-3">Select</h3>
                            {sections.slice(0, 4).map((section, index) => (
                                <SidebarItem
                                    key={section}
                                    label={section}
                                    active={activeSection === section}
                                    completed={index < progressIndex}
                                    onClick={() => setActiveSection(section)}
                                />
                            ))}
                        </div>

                        {/* Section 2 */}
                        <div className="bg-white rounded-[24px] p-4 border border-gray-100">
                            <h3 className="text-[20px] font-bold text-[#A3A3A3] mb-5 px-3">Select</h3>
                            {sections.slice(4).map((section, index) => {
                                const isReview = section === "Review & File";
                                const isLocked = isReview && progressIndex < 5;
                                return (
                                    <SidebarItem
                                        key={section}
                                        label={section}
                                        active={activeSection === section}
                                        isOrange
                                        disabled={isLocked}
                                        onClick={() => !isLocked && setActiveSection(section)}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className={`flex-1 ${activeSection === 'Income & Deductions' ? 'max-w-[900px]' : 'max-w-[720px]'}`}>
                        {activeSection === 'Personal Information' && (
                            <div className="max-w-[540px]">
                                <h2 className="text-lg font-bold text-taxable-dark mb-6">Personal Information</h2>

                                <FormField label="First name" placeholder="hello@alignui.com" />
                                <FormField
                                    label="Tax ID (Tax Identification Number)"
                                    placeholder="hello@alignui.com"
                                    hint={<>This should match your TIN registration exactly</>}
                                />
                                <div className="flex items-center gap-1.5 -mt-4 mb-6 ml-5">
                                    <div className="w-3.5 h-3.5 rounded-full bg-gray-400 flex items-center justify-center">
                                        <span className="text-[9px] text-white font-bold">!</span>
                                    </div>
                                    <span className="text-[12px] text-taxable-gray font-medium">Don't have a TIN? <button className="text-taxable-blue font-bold">Apply here</button></span>
                                </div>

                                <FormField label="Date of birth" placeholder="DD / MM / YYYY" />
                                <FormField label="Street Address" placeholder="DD / MM / YYYY" />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label="City" placeholder="hello@alignui.com" />
                                    <FormField label="State" placeholder="hello@alignui.com" />
                                </div>

                                <button
                                    onClick={() => handleNext('Employer Information')}
                                    className="h-14 px-8 bg-[#00388D] text-white font-bold rounded-2xl hover:bg-[#002b6d] transition-colors mt-4"
                                >
                                    Save & Continue
                                </button>
                            </div>
                        )}

                        {activeSection === 'Employer Information' && (
                            <div className="max-w-[540px]">
                                <h2 className="text-lg font-bold text-taxable-dark mb-6">Employer Information</h2>

                                <div className="mb-8">
                                    <p className="text-sm font-medium text-taxable-dark mb-4">Are you currently employed or employed at any point in 2026?</p>
                                    <div className="flex flex-col gap-3">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex items-center justify-center group-hover:border-taxable-blue transition-colors">
                                                <input
                                                    type="radio"
                                                    name="employment_status"
                                                    className="hidden"
                                                    checked={isEmployed === true}
                                                    onChange={() => setIsEmployed(true)}
                                                />
                                                {isEmployed === true && <div className="w-2.5 h-2.5 rounded-full bg-taxable-blue" />}
                                            </div>
                                            <span className="text-sm font-medium text-taxable-gray group-hover:text-taxable-dark transition-colors">Yes, I was employed</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex items-center justify-center group-hover:border-taxable-blue transition-colors">
                                                <input
                                                    type="radio"
                                                    name="employment_status"
                                                    className="hidden"
                                                    checked={isEmployed === false}
                                                    onChange={() => setIsEmployed(false)}
                                                />
                                                {isEmployed === false && <div className="w-2.5 h-2.5 rounded-full bg-taxable-blue" />}
                                            </div>
                                            <span className="text-sm font-medium text-taxable-gray group-hover:text-taxable-dark transition-colors">No, I was not employed in 2026</span>
                                        </label>
                                    </div>
                                </div>

                                {isEmployed === false && (
                                    <div className="bg-[#F8FAFC] rounded-2xl p-6 flex items-start gap-4 mb-8">
                                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-[10px] font-bold">i</span>
                                        </div>
                                        <p className="text-sm text-[#64748B] font-medium leading-relaxed">
                                            You can skip this section. Click Continue to move to the next section.
                                        </p>
                                    </div>
                                )}

                                {isEmployed === true && (
                                    <div className="space-y-10">
                                        {employers.map((emp, index) => (
                                            <div key={emp.id} className="pt-6 first:pt-0">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h3 className="text-sm font-bold text-taxable-dark">Employer {index + 1}</h3>
                                                    {employers.length > 1 && (
                                                        <button
                                                            onClick={() => removeEmployer(emp.id)}
                                                            className="text-sm font-bold text-[#00388D] hover:underline"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>

                                                <FormField
                                                    label="Employer / Company Name"
                                                    placeholder="hello@alignui.com"
                                                    hint="As it appears on your payslip or employment contract"
                                                />
                                                <FormField label="Your Position/Job Title" placeholder="hello@alignui.com" />

                                                <div className="grid grid-cols-2 gap-4 mb-2">
                                                    <FormField label="Employment Start date" placeholder="hello@alignui.com" />
                                                    <FormField label="Employment End date" placeholder="hello@alignui.com" />
                                                </div>
                                                <div className="flex items-center gap-2 mb-8">
                                                    <div
                                                        onClick={() => updateEmployer(emp.id, 'stillWorks', !emp.stillWorks)}
                                                        className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${emp.stillWorks ? 'bg-taxable-blue border-taxable-blue' : 'border-gray-300'}`}
                                                    >
                                                        {emp.stillWorks && (
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium text-[#64748B]">I still work here</span>
                                                </div>

                                                <div className="mb-8">
                                                    <p className="text-sm font-medium text-taxable-dark mb-4">Did this employer withhold tax from your salary?</p>
                                                    <div className="flex items-center gap-6">
                                                        {['Yes', 'No', 'Not sure'].map(opt => (
                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                                                                <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex items-center justify-center group-hover:border-taxable-blue transition-colors">
                                                                    <input
                                                                        type="radio"
                                                                        name={`withhold_${emp.id}`}
                                                                        className="hidden"
                                                                        checked={emp.withheldTax === opt}
                                                                        onChange={() => updateEmployer(emp.id, 'withheldTax', opt)}
                                                                    />
                                                                    {emp.withheldTax === opt && <div className="w-2.5 h-2.5 rounded-full bg-taxable-blue" />}
                                                                </div>
                                                                <span className="text-sm font-medium text-taxable-gray group-hover:text-taxable-dark transition-colors">{opt}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                <FormField
                                                    label="Average monthly gross salary"
                                                    placeholder="DD / MM / YYYY"
                                                    hint="Your gross salary before deductions (tax, pension, etc.). If your salary varied, enter an average"
                                                />
                                            </div>
                                        ))}

                                        <button
                                            onClick={addEmployer}
                                            disabled={employers.length >= 6}
                                            className={`h-14 px-8 border border-gray-100 bg-white text-taxable-dark font-bold rounded-2xl transition-all ${employers.length >= 6 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                        >
                                            {employers.length >= 6 ? 'Employer limit reached' : 'Add Another Employer'}
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={() => handleNext('Healthcare')}
                                    className="h-14 px-10 bg-[#00388D] text-white font-bold rounded-2xl hover:bg-[#002b6d] transition-colors mt-8"
                                >
                                    Save & Continue
                                </button>
                            </div>
                        )}

                        {activeSection === 'Healthcare' && (
                            <div className="max-w-[540px]">
                                <button
                                    onClick={() => handleNext('Other Deductions')}
                                    className="h-14 px-10 bg-[#00388D] text-white font-bold rounded-2xl hover:bg-[#002b6d] transition-colors mt-8"
                                >
                                    Save & Continue
                                </button>
                            </div>
                        )}

                        {activeSection === 'Income & Deductions' && (
                            <div className="flex gap-12 animate-in fade-in duration-500">
                                {/* Left Monthly/Annually Selector */}
                                <div className="w-[303px] flex-shrink-0">
                                    <div className="flex items-center gap-3 mb-6 px-1">
                                        <span className={`text-[13px] font-bold ${incomePeriod === 'Monthly' ? 'text-taxable-dark' : 'text-[#A3A3A3]'}`}>Monthly</span>
                                        <button
                                            onClick={() => setIncomePeriod(prev => prev === 'Monthly' ? 'Annually' : 'Monthly')}
                                            className="w-10 h-[22px] bg-[#00388D] rounded-full relative transition-colors"
                                        >
                                            <div className={`absolute top-0.5 w-[18px] h-[18px] bg-white rounded-full transition-transform ${incomePeriod === 'Annually' ? 'translate-x-[20px]' : 'translate-x-0.5'}`} />
                                        </button>
                                        <span className={`text-[13px] font-bold ${incomePeriod === 'Annually' ? 'text-taxable-dark' : 'text-[#A3A3A3]'}`}>Annually</span>
                                    </div>

                                    <div className="space-y-2">
                                        {incomePeriod === 'Monthly' ? (
                                            <div className="bg-white rounded-[22px] border border-gray-100 overflow-hidden">
                                                {months.map((month, index) => (
                                                    <React.Fragment key={month}>
                                                        <div className="overflow-hidden">
                                                            <button
                                                                onClick={() => toggleMonth(month)}
                                                                className="w-full h-14 px-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-taxable-gray">
                                                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                                                    </svg>
                                                                    <span className="text-[17px] font-bold text-taxable-dark">{month}</span>
                                                                </div>
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-300 transition-transform ${expandedMonth === month ? 'rotate-180' : ''}`}>
                                                                    <polyline points="6 9 12 15 18 9" />
                                                                </svg>
                                                            </button>
                                                            {expandedMonth === month && (
                                                                <div className="relative ml-[30px] pr-2 pb-4">
                                                                    {/* Vertical hierarchy line */}
                                                                    <div className="absolute left-0 top-0 bottom-6 w-[1px] bg-gray-100" />

                                                                    <div className="pl-6 space-y-1">
                                                                        <button
                                                                            onClick={() => { setActiveSubSection('Income'); setActiveMonth(month); }}
                                                                            className={`w-full h-11 px-4 flex items-center rounded-xl text-[15px] font-bold transition-all ${activeSubSection === 'Income' && activeMonth === month ? 'bg-[#F1F5F9] text-taxable-dark' : 'text-taxable-gray hover:text-taxable-dark'}`}
                                                                        >
                                                                            Income
                                                                        </button>
                                                                        <button
                                                                            onClick={() => { setActiveSubSection('Deductibles'); setActiveMonth(month); }}
                                                                            className={`w-full h-11 px-4 flex items-center rounded-xl text-[15px] font-bold transition-all ${activeSubSection === 'Deductibles' && activeMonth === month ? 'bg-[#F1F5F9] text-taxable-dark' : 'text-taxable-gray hover:text-taxable-dark'}`}
                                                                        >
                                                                            Deductibles
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {index < months.length - 1 && <div className="h-[1px] bg-gray-50 mx-5" />}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="w-[303px] h-[118px] bg-white rounded-[16px] border border-gray-100 flex flex-col items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setActiveSubSection('Income')}
                                                    className={`w-[279px] h-[33px] px-4 flex items-center justify-between rounded-[8px] transition-all ${activeSubSection === 'Income' ? 'bg-[#F1F5F9]' : 'hover:bg-gray-50'}`}
                                                >
                                                    <span className={`text-base ${activeSubSection === 'Income' ? 'font-semibold text-taxable-dark' : 'font-medium text-taxable-gray'}`}>Total Income for 2026</span>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><polyline points="9 18 15 12 9 6" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => setActiveSubSection('Deductibles')}
                                                    className={`w-[279px] h-[33px] px-4 flex items-center justify-between rounded-[8px] transition-all ${activeSubSection === 'Deductibles' ? 'bg-[#F1F5F9]' : 'hover:bg-gray-50'}`}
                                                >
                                                    <span className={`text-base ${activeSubSection === 'Deductibles' ? 'font-semibold text-taxable-dark' : 'font-medium text-taxable-gray'}`}>Total deductible for 2026</span>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><polyline points="9 18 15 12 9 6" /></svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Inputs Form */}
                                <div className="flex-1 max-w-[540px]">
                                    {activeSubSection === 'Income' ? (
                                        <>
                                            <p className="text-[17px] text-taxable-gray font-medium mb-8 leading-relaxed">
                                                Enter your income for {incomePeriod === 'Monthly' ? `${activeMonth} 2026` : '2026'}. Skip fields that don't apply to you. You can update amounts anytime.
                                            </p>

                                            {/* Employment Income Section */}
                                            <section className="mb-12">
                                                <h2 className="text-[20px] font-bold text-taxable-dark mb-6">Employment Income</h2>
                                                <div className="grid grid-cols-2 gap-x-10 gap-y-0">
                                                    <FormField label="Salary/wages" placeholder="₦0" />
                                                    <FormField label="Bonuses" placeholder="₦0" />
                                                    <FormField label="Commission" placeholder="₦0" />
                                                    <FormField label="Street Address" placeholder="₦0" />
                                                </div>
                                            </section>

                                            {/* Investment Income Section */}
                                            <section className="mb-12">
                                                <h2 className="text-[20px] font-bold text-taxable-dark mb-6">Investment Income</h2>
                                                <div className="grid grid-cols-2 gap-x-10 gap-y-0">
                                                    <FormField label="Dividends" placeholder="₦0" />
                                                    <FormField label="Interest (bank, bonds, etc.)" placeholder="₦0" />
                                                    <div className="col-span-2">
                                                        <FormField label="Capital gains (stocks, property sales)" placeholder="₦0" />
                                                    </div>
                                                </div>
                                            </section>

                                            {/* Other Income Section */}
                                            <section className="mb-12">
                                                <h2 className="text-[20px] font-bold text-taxable-dark mb-6">Other Income</h2>
                                                <div className="grid grid-cols-2 gap-x-10 gap-y-0">
                                                    <FormField label="Freelance/consulting fees" placeholder="₦0" />
                                                    <FormField label="Royalties" placeholder="₦0" />
                                                    <div className="col-span-2">
                                                        <FormField label="Other" placeholder="₦0" />
                                                    </div>
                                                </div>
                                            </section>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-[17px] text-taxable-gray font-medium mb-8 leading-relaxed">
                                                Enter your deductions for {incomePeriod === 'Monthly' ? `${activeMonth} 2026` : '2026'}. Skip fields that don't apply to you. You can update amounts anytime.
                                            </p>

                                            <section className="mb-12">
                                                <div className="grid grid-cols-2 gap-x-10 gap-y-2">
                                                    <FormField label="Standard contribution" placeholder="₦0" />
                                                    <FormField label="National Housing Fund (NHF)" placeholder="₦0" />
                                                    <FormField label="Life Insurance Premiums" placeholder="₦0" />
                                                    <FormField label="NHIS contributions" placeholder="₦0" />
                                                    <div className="col-span-2">
                                                        <FormField label="Gratuity" placeholder="₦0" />
                                                    </div>
                                                </div>
                                            </section>
                                        </>
                                    )}

                                    <button
                                        onClick={() => handleNext('Review & File')}
                                        className="h-14 px-12 bg-[#00388D] text-white font-bold rounded-2xl hover:bg-[#002b6d] transition-all shadow-lg shadow-[#00388D]/10 mt-4 active:scale-95"
                                    >
                                        Save & Continue
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Help Sidebar */}
                    {activeSection !== 'Income & Deductions' && (
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
                                        Your personal details help us identify you with FIRS and ensure your tax return is filed correctly. All information is encrypted and stored securely. We only share data with FIRS when you choose to file.
                                    </p>
                                </div>

                                <div className="space-y-0">
                                    <div className="py-2.5">
                                        <div className="w-[270px] h-[3px] bg-white rounded-[10px] mb-4 -mx-1" />
                                        <div className="space-y-3.5">
                                            {activeSection === 'Employer Information' && isEmployed === true && employers.length >= 1 ? (
                                                <>
                                                    <button className="flex items-center gap-3.5 text-base font-semibold text-taxable-dark hover:text-taxable-blue transition-colors text-left w-full group">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#64748B] group-hover:text-taxable-blue transition-colors"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                                        <span>I'm self-employed - do I need this section?</span>
                                                    </button>
                                                    <button className="flex items-center gap-3.5 text-base font-semibold text-taxable-dark hover:text-taxable-blue transition-colors text-left w-full group">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#64748B] group-hover:text-taxable-blue transition-colors"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                                        <span>What if my salary changed during the year?</span>
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="flex items-center gap-3.5 text-base font-semibold text-taxable-dark hover:text-taxable-blue transition-colors text-left w-full group">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#64748B] group-hover:text-taxable-blue transition-colors"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                                        <span>How to find your TIN</span>
                                                    </button>
                                                    <button className="flex items-center gap-3.5 text-base font-semibold text-taxable-dark hover:text-taxable-blue transition-colors text-left w-full group">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#64748B] group-hover:text-taxable-blue transition-colors"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                                        <span>Understanding tax filing</span>
                                                    </button>
                                                </>
                                            )}
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
                    )}
                </div>
            </main>
        </div>
    );
}
