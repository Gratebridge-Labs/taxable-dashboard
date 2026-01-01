'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const NavItem = ({ iconSrc, label, active = false }: { iconSrc: string; label: string; active?: boolean }) => (
    <Link
        href={label === "Tax folders" ? "/tax-folders" : (label === "Dashboard" ? "/home" : "#")}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all whitespace-nowrap ${active
            ? 'text-taxable-blue bg-taxable-blue/5'
            : 'text-taxable-gray hover:text-taxable-dark hover:bg-gray-50'
            }`}
    >
        <Image src={iconSrc} alt={label} width={18} height={18} className={active ? '' : 'opacity-60'} />
        <span>{label}</span>
    </Link>
);

const SidebarItem = ({ label, active = false, completed = false, disabled = false, onClick }: { label: string; active?: boolean; completed?: boolean; disabled?: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-3.5 rounded-xl transition-all mb-1 ${active ? 'bg-[#F1F5F9]' : 'hover:bg-gray-50'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <div className="flex items-center gap-4 text-left">
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <Image
                    src="/icons/folder.svg"
                    alt="section"
                    width={18}
                    height={18}
                    style={{
                        filter: completed && !active ? 'grayscale(100%) brightness(1.2)' : 'none',
                        opacity: completed && !active ? 0.4 : 1
                    }}
                />
            </div>

            <div className="flex items-center gap-2">
                <span className={`text-base font-medium ${active ? 'text-taxable-dark' : 'text-[#64748B]'}`}>{label}</span>
                {completed && !active && (
                    <Image src="/icons/checkmark.svg" alt="completed" width={18} height={18} />
                )}
            </div>
        </div>
        <svg className={`w-4 h-4 flex-shrink-0 ${active ? 'text-taxable-dark' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
                className={`w-full h-14 bg-white border border-gray-100 rounded-2xl text-taxable-dark focus:outline-none focus:ring-1 focus:ring-taxable-blue/20 placeholder:text-gray-300 shadow-sm px-4 ${prefix ? 'pl-9' : ''}`}
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
    const router = useRouter();
    const [activeSection, setActiveSection] = React.useState('Personal Information');
    const [progressIndex, setProgressIndex] = React.useState(0);
    const [isEmployed, setIsEmployed] = React.useState<boolean | null>(true);
    const [employers, setEmployers] = React.useState([{ id: 1, name: '', title: '', startDate: '', endDate: '', stillWorks: true, withheldTax: 'Yes' as 'Yes' | 'No' | 'Not sure', salary: '' }]);

    const sections = [
        "Personal Information",
        "Employer Information",
        "Healthcare",
        "Other Deductions",
        "Income",
        "Exemptions",
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
            {/* Header */}
            <header className="w-full h-24 bg-white border-b border-gray-100 flex items-center px-12 sticky top-0 z-50">
                <div className="flex-1 flex items-center">
                    <Link href="/home">
                        <Image src="/logo_blue.svg" alt="Taxable" width={100} height={61} priority />
                    </Link>
                </div>

                <nav className="hidden md:flex items-center justify-center gap-2">
                    <NavItem iconSrc="/icons/people.svg" label="Tax folders" active />
                    <NavItem iconSrc="/icons/transaction.svg" label="Transactions" />
                    <NavItem iconSrc="/icons/fees.svg" label="Fees" />
                    <NavItem iconSrc="/icons/notification.svg" label="Push Notifications" />
                </nav>

                <div className="flex-1 flex justify-end items-center">
                    <div className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shadow-sm flex items-center justify-center cursor-pointer hover:border-taxable-blue/30 transition-colors">
                        <Image src="/icons/profile.svg" alt="Profile" width={28} height={28} className="opacity-80" />
                    </div>
                </div>
            </header>

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
                    <div className="w-[303px] flex-shrink-0">
                        <div className="bg-white rounded-2xl p-4 min-h-[380px] border border-gray-100 shadow-xs sticky top-32">
                            <h3 className="text-base font-medium text-taxable-dark mb-4 px-3">Select</h3>
                            {sections.map((section, index) => (
                                <SidebarItem
                                    key={section}
                                    label={section}
                                    active={activeSection === section}
                                    completed={index < progressIndex}
                                    disabled={index > progressIndex}
                                    onClick={() => {
                                        if (index <= progressIndex) setActiveSection(section);
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 max-w-[540px]">
                        {activeSection === 'Personal Information' && (
                            <>
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
                            </>
                        )}

                        {activeSection === 'Employer Information' && (
                            <>
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
                            </>
                        )}
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
                </div>
            </main>
        </div>
    );
}
