'use client';

import React from 'react';
import Image from 'next/image';

export interface PITSidebarProps {
    activeSection: 'personal-info' | 'income-deductions' | 'review';
    setActiveSection: (s: 'personal-info' | 'income-deductions' | 'review') => void;
    personalInfoComplete: boolean;
}

const SECTIONS: { key: 'personal-info' | 'income-deductions' | 'review'; label: string }[] = [
    { key: 'personal-info', label: 'Personal Information' },
    { key: 'income-deductions', label: 'Income & Deductions' },
    { key: 'review', label: 'Annual Filing' },
];

const SidebarItem = ({
    label, active = false, completed = false, locked = false, onClick
}: {
    label: string; active?: boolean; completed?: boolean; locked?: boolean; onClick: () => void
}) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl mb-1 ${active ? 'bg-neutral-100' : ''}`}
    >
        <div className="flex items-center gap-3 text-left">
            <span className={`flex items-center ${locked ? 'opacity-40' : ''}`}>
                <Image src={locked ? '/icons/folder-inactive.svg' : '/icons/folder.svg'} alt="" width={16} height={15} />
            </span>
            <div className="flex items-center gap-2">
                <span className={`text-2 font-medium ${locked ? 'text-neutral-400' : active ? 'text-neutral-800' : 'text-neutral-500'}`}>
                    {label}
                </span>
                {completed && (
                    <div className="w-4 h-4 bg-green-600 rounded flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
        <svg className="w-3.5 h-3.5 flex-shrink-0 text-neutral-500"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    </button>
);

export const PITSidebar = ({ activeSection, setActiveSection, personalInfoComplete }: PITSidebarProps) => (
    <div className="w-[250px] flex-shrink-0 flex flex-col gap-4 sticky top-24 border border-neutral-50 rounded-xl p-3">
        <div>
            <p className="text-1 font-semibold text-neutral-400 uppercase tracking-wider mb-2">Tax Sections</p>
            <div>
                {SECTIONS.map(sec => (
                    <SidebarItem
                        key={sec.key}
                        label={sec.label}
                        active={activeSection === sec.key}
                        completed={false}
                        locked={sec.key !== 'personal-info' && !personalInfoComplete}
                        onClick={() => {
                            if (sec.key === 'personal-info' || personalInfoComplete) {
                                setActiveSection(sec.key);
                            }
                        }}
                    />
                ))}
            </div>
        </div>
    </div>
);
