'use client';

import React from 'react';
import { SidebarItem } from '@/screens/TaxFolders/TaxFolderShared';

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

export const PITSidebar = ({ activeSection, setActiveSection, personalInfoComplete }: PITSidebarProps) => (
    <div className="w-[250px] flex-shrink-0 flex flex-col gap-4 sticky top-24 border border-neutral-50 rounded-xl p-3">
        <div>
            <p className="text-0 font-semibold text-neutral-400 uppercase tracking-wider mb-2">Tax Sections</p>
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
