'use client';

import React, { useState, useRef, useEffect, useMemo, useId, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search } from 'lucide-react';

import { Input } from '@/components/ui/input';

interface SearchableSelectProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

interface PanelPosition {
    top: number;
    left: number;
    width: number;
    openUpward: boolean;
}

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Select',
    className = '',
    disabled = false
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [focusedIdx, setFocusedIdx] = useState(-1);
    const [position, setPosition] = useState<PanelPosition | null>(null);
    const [mounted, setMounted] = useState(false);

    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const listId = useId();

    const filtered = useMemo(() => {
        if (!search) return options;
        const q = search.toLowerCase();
        return options.filter((o) => o.toLowerCase().includes(q));
    }, [options, search]);

    useEffect(() => {
        setMounted(true);
    }, []);

    const updatePosition = () => {
        const el = triggerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const panelHeight = 280;
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUpward = spaceBelow < panelHeight && rect.top > spaceBelow;

        setPosition({
            top: openUpward ? rect.top - 4 : rect.bottom + 4,
            left: rect.left,
            width: rect.width,
            openUpward
        });
    };

    useLayoutEffect(() => {
        if (!open) return;
        updatePosition();
        // Focus search after panel mounts
        requestAnimationFrame(() => searchRef.current?.focus());
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const onScrollOrResize = () => updatePosition();
        window.addEventListener('resize', onScrollOrResize);
        // Capture scroll on any ancestor (Lenis scrolls the window/root)
        window.addEventListener('scroll', onScrollOrResize, true);

        return () => {
            window.removeEventListener('resize', onScrollOrResize);
            window.removeEventListener('scroll', onScrollOrResize, true);
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (triggerRef.current?.contains(target)) return;
            if (panelRef.current?.contains(target)) return;
            setOpen(false);
            setSearch('');
            setFocusedIdx(-1);
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const selectOption = (opt: string) => {
        onChange(opt);
        setOpen(false);
        setSearch('');
        setFocusedIdx(-1);
    };

    const toggleOpen = () => {
        if (disabled) return;
        setOpen((prev) => {
            if (prev) {
                setSearch('');
                setFocusedIdx(-1);
            }
            return !prev;
        });
    };

    const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(true);
        }
    };

    const handlePanelKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusedIdx((prev) => Math.min(prev + 1, filtered.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIdx((prev) => Math.max(prev - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (focusedIdx >= 0 && filtered[focusedIdx]) {
                    selectOption(filtered[focusedIdx]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setOpen(false);
                setSearch('');
                setFocusedIdx(-1);
                triggerRef.current?.focus();
                break;
        }
    };

    const panel =
        open && mounted && position
            ? createPortal(
                <div
                    ref={panelRef}
                    data-lenis-prevent
                    role="listbox"
                    id={listId}
                    onKeyDown={handlePanelKeyDown}
                    style={{
                        position: 'fixed',
                        top: position.openUpward ? undefined : position.top,
                        bottom: position.openUpward
                            ? window.innerHeight - position.top
                            : undefined,
                        left: position.left,
                        width: position.width,
                        zIndex: 9999
                    }}
                    className="bg-white rounded-xl border border-neutral-100 shadow-md overflow-hidden"
                >
                    <div className="p-2 border-b border-neutral-100">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400 pointer-events-none" />
                            <Input
                                ref={searchRef}
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setFocusedIdx(0);
                                }}
                                placeholder="Search..."
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck={false}
                                data-lpignore="true"
                                data-1p-ignore="true"
                                data-form-type="other"
                                className="h-9 pl-8 text-2"
                            />
                        </div>
                    </div>

                    <div
                        data-lenis-prevent
                        className="max-h-48 overflow-y-auto overscroll-contain"
                        onWheel={(e) => e.stopPropagation()}
                    >
                        {filtered.length === 0 ? (
                            <div className="px-3 py-3 text-2 text-neutral-400 font-medium">
                                No results found
                            </div>
                        ) : (
                            filtered.map((opt, i) => (
                                <div
                                    key={opt}
                                    role="option"
                                    aria-selected={value === opt}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        selectOption(opt);
                                    }}
                                    onMouseEnter={() => setFocusedIdx(i)}
                                    className={`px-3 py-2 text-3 font-medium cursor-pointer ${
                                        focusedIdx === i
                                            ? 'bg-taxable-blue text-white'
                                            : value === opt
                                                ? 'bg-neutral-50 text-neutral-800'
                                                : 'hover:bg-neutral-100 text-neutral-800'
                                    }`}
                                >
                                    {opt}
                                </div>
                            ))
                        )}
                    </div>
                </div>,
                document.body
            )
            : null;

    return (
        <div className={`relative ${className}`}>
            <button
                ref={triggerRef}
                type="button"
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={open ? listId : undefined}
                onClick={toggleOpen}
                onKeyDown={handleTriggerKeyDown}
                className={`flex h-10 w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 text-left text-3 font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-800 focus-visible:border-neutral-800 disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed ${
                    value ? 'text-neutral-800' : 'text-neutral-300'
                }`}
            >
                <span className="truncate">{value || placeholder}</span>
                <ChevronDown className="size-4 shrink-0 text-neutral-400" />
            </button>
            {panel}
        </div>
    );
}
