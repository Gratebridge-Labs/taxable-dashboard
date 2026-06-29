'use client';
import { useState, useEffect, useCallback } from 'react';

export interface WHTDeduction {
    id: number;
    payee: string; tin: string; whtType: string;
    gross: string; whtRate: string; whtDeducted: string; netPaid: string; date: string;
}

export function useWhtDeductions(storageKey: string, activeMonthKey?: string) {
    const [dataByMonth, setDataByMonth] = useState<Record<number, WHTDeduction[]>>(() => {
        try {
            const raw = JSON.parse(localStorage.getItem(storageKey)!);
            if (raw && !Array.isArray(raw)) return raw;
            const migrated: Record<number, WHTDeduction[]> = raw ? { 0: raw } : {};
            localStorage.setItem(storageKey, JSON.stringify(migrated));
            return migrated;
        } catch { return {}; }
    });

    const [activeMonth, setActiveMonth] = useState(() => {
        if (!activeMonthKey) return 0;
        try { const v = parseInt(localStorage.getItem(activeMonthKey)!, 10); return v >= 0 && v <= 11 ? v : 0; } catch { return 0; }
    });

    const [periodMode, setPeriodMode] = useState<'monthly' | 'annually'>('monthly');
    const [pendingRemove, setPendingRemove] = useState<{ monthKey: number; id: number } | null>(null);

    const currentData = dataByMonth[activeMonth] || [];
    const total = currentData.reduce((s, d) => s + (Number(d.whtDeducted) || 0), 0);
    const annualTotal = Object.values(dataByMonth).reduce((s, arr) => s + arr.reduce((s2, d) => s2 + (Number(d.whtDeducted) || 0), 0), 0);
    const hasData = Object.values(dataByMonth).some(arr => arr.length > 0);
    const pendingPayee = pendingRemove
        ? (dataByMonth[pendingRemove.monthKey] || []).find(d => d.id === pendingRemove.id)?.payee ?? null
        : null;

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(dataByMonth));
    }, [dataByMonth, storageKey]);

    useEffect(() => {
        if (activeMonthKey) localStorage.setItem(activeMonthKey, String(activeMonth));
    }, [activeMonth, activeMonthKey]);

    const saveItem = useCallback((item: Omit<WHTDeduction, 'id'>, existingId: number | null, sourceMonth?: number) => {
        const targetMonth = sourceMonth ?? activeMonth;
        setDataByMonth(prev => {
            const current = prev[targetMonth] || [];
            if (existingId !== null) {
                return { ...prev, [targetMonth]: current.map(x => x.id === existingId ? { ...item, id: existingId } : x) };
            }
            return { ...prev, [targetMonth]: [...current, { ...item, id: Date.now() }] };
        });
    }, [activeMonth]);

    const handleConfirmRemove = useCallback(() => {
        if (!pendingRemove) return;
        setDataByMonth(prev => ({
            ...prev,
            [pendingRemove.monthKey]: (prev[pendingRemove.monthKey] || []).filter(x => x.id !== pendingRemove.id),
        }));
        setPendingRemove(null);
    }, [pendingRemove]);

    return {
        dataByMonth, setDataByMonth,
        activeMonth, setActiveMonth,
        periodMode, setPeriodMode,
        pendingRemove, setPendingRemove,
        currentData, total, annualTotal, hasData, pendingPayee,
        saveItem, handleConfirmRemove,
    };
}
