import React from 'react';

interface OptionCardProps {
    label: string;
    description?: string;
    isSelected: boolean;
    onChange: () => void;
    badge?: string;
}

export default function OptionCard({ label, description, isSelected, onChange, badge }: OptionCardProps) {
    return (
        <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-taxable-light border-blue-100' : 'bg-transparent border-transparent hover:bg-gray-50'
            }`}>
            <div className="relative flex-shrink-0 mt-1">
                <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={isSelected}
                    onChange={onChange}
                />
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-taxable-blue border-taxable-blue' : 'bg-white border-gray-200'
                    }`}>
                    {isSelected && (
                        <svg width="12" height="9" viewBox="0 0 12 9" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1 5 4 8 11 1" />
                        </svg>
                    )}
                </div>
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-taxable-dark">{label}</span>
                    {badge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-200 text-taxable-dark">
                            {badge}
                        </span>
                    )}
                </div>
                {description && (
                    <p className="text-xs text-taxable-gray mt-0.5 leading-relaxed">
                        {description}
                    </p>
                )}
            </div>
        </label>
    );
}
