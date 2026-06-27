'use client';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';

interface SearchableSelectProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SearchableSelect({ options, value, onChange, placeholder }: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [focusedIdx, setFocusedIdx] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const filtered = useMemo(() => {
        if (!search) return options;
        const q = search.toLowerCase();
        return options.filter(o => o.toLowerCase().includes(q));
    }, [options, search]);

    const displayText = value || search;

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectOption = (opt: string) => {
        onChange(opt);
        setOpen(false);
        setSearch('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!open) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                setOpen(true);
                e.preventDefault();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusedIdx(prev => Math.min(prev + 1, filtered.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIdx(prev => Math.max(prev - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (filtered[focusedIdx]) {
                    selectOption(filtered[focusedIdx]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setOpen(false);
                setSearch('');
                break;
        }
    };

    return (
        <div ref={wrapperRef} className="relative">
            <div className="relative">
                <Input
                    value={displayText}
                    onChange={e => { setSearch(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="pr-10"
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none" />
            </div>

            {open && filtered.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-xl border border-neutral-100 shadow-md max-h-40 overflow-y-auto">
                    {filtered.map((opt, i) => (
                        <div
                            key={opt}
                            onMouseDown={() => selectOption(opt)}
                            onMouseEnter={() => setFocusedIdx(i)}
                            className={`px-3 py-2 text-3 font-medium cursor-pointer ${focusedIdx === i ? 'bg-taxable-blue text-white' : 'hover:bg-neutral-100 text-neutral-800'}`}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}

            {open && filtered.length === 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-xl border border-neutral-100 shadow-md p-3 text-3 text-neutral-400 font-medium">
                    No results found
                </div>
            )}
        </div>
    );
}
