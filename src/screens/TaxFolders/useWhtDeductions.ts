'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

import { useTaxableApi } from '@/hooks/useTaxableApi';
import type {
  WhtDeduction as ApiWhtDeduction,
  WhtCredit as ApiWhtCredit,
  WhtDeductionType,
  WhtCreditType,
} from '@/types/api';

export interface WHTDeduction {
  id: string;
  payee: string;
  tin: string;
  whtType: string;
  gross: string;
  whtRate: string;
  whtDeducted: string;
  netPaid: string;
  date: string;
  receipt?: string;
}

/** UI month index 0–11 → API month 1–12 */
export const toApiMonth = (uiMonth: number) => uiMonth + 1;
/** API month 1–12 → UI month index 0–11 */
export const toUiMonth = (apiMonth: number) => apiMonth - 1;

const DEDUCTION_UI_TO_API: Record<string, WhtDeductionType> = {
  'Consultancy/Professional Fees': 'consultancy',
  'Contracts/Supplies': 'contracts',
  'Transport & Logistics': 'transport',
  Rent: 'rent',
  'Director Fees': 'director_fees',
};

const DEDUCTION_API_TO_UI: Record<string, string> = {
  consultancy: 'Consultancy/Professional Fees',
  contracts: 'Contracts/Supplies',
  transport: 'Transport & Logistics',
  rent: 'Rent',
  director_fees: 'Director Fees',
};

const CREDIT_UI_TO_API: Record<string, WhtCreditType> = {
  'WHT on Services (5%)': 'services',
  'WHT on Rent (10%)': 'rent',
  'WHT on Dividends (10%)': 'dividends',
  'WHT on Interest (10%)': 'interest',
  'WHT on Royalties (10%)': 'royalties',
  'WHT on Construction (2.5%)': 'construction',
  'WHT on Haulage (5%)': 'haulage',
};

const CREDIT_API_TO_UI: Record<string, string> = {
  services: 'WHT on Services (5%)',
  rent: 'WHT on Rent (10%)',
  dividends: 'WHT on Dividends (10%)',
  interest: 'WHT on Interest (10%)',
  royalties: 'WHT on Royalties (10%)',
  construction: 'WHT on Construction (2.5%)',
  haulage: 'WHT on Haulage (5%)',
};

const fmtNum = (n: number) => String(Math.round(n));

const parseGross = (gross: string) => Number(String(gross).replace(/,/g, '')) || 0;

export function mapApiDeductionToUi(d: ApiWhtDeduction): WHTDeduction {
  const gross = d.gross ?? 0;
  const rate = d.whtRate ?? 0;
  const wht = d.whtDeducted ?? Math.round(gross * rate / 100);
  const net = d.netPaid ?? gross - wht;
  return {
    id: d.id,
    payee: d.payee ?? '',
    tin: d.tin ?? '',
    whtType: DEDUCTION_API_TO_UI[d.whtType] ?? d.whtType ?? '',
    gross: fmtNum(gross).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    whtRate: String(rate),
    whtDeducted: fmtNum(wht),
    netPaid: fmtNum(net),
    date: d.date ?? '',
    receipt: d.receiptUrl ?? '',
  };
}

export function mapApiCreditToUi(c: ApiWhtCredit): WHTDeduction {
  const gross = c.gross ?? 0;
  const rate = c.whtRate ?? 0;
  const wht = c.whtDeducted ?? (rate > 0 ? Math.round(gross * rate / 100) : 0);
  const net = gross - wht;
  return {
    id: c.id,
    payee: c.payee ?? '',
    tin: c.tin ?? '',
    whtType: CREDIT_API_TO_UI[c.whtType] ?? c.whtType ?? '',
    gross: fmtNum(gross).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    whtRate: rate ? String(rate) : '',
    whtDeducted: fmtNum(wht),
    netPaid: fmtNum(net),
    date: c.date ?? '',
    receipt: c.receiptUrl ?? '',
  };
}

function deductionTypeToApi(uiType: string): WhtDeductionType {
  return DEDUCTION_UI_TO_API[uiType] ?? (uiType as WhtDeductionType);
}

function creditTypeToApi(uiType: string): WhtCreditType {
  return CREDIT_UI_TO_API[uiType] ?? (uiType as WhtCreditType);
}

function errMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

export function useWhtRemittance(profileId: string, taxYear: string) {
  const {
    listWhtDeductions,
    createWhtDeduction,
    updateWhtDeduction,
    deleteWhtDeduction,
    fileWhtMonth,
  } = useTaxableApi();
  const year = Number(taxYear) || new Date().getFullYear();

  const [dataByMonth, setDataByMonth] = useState<Record<number, WHTDeduction[]>>({});
  const [filedMonths, setFiledMonths] = useState<Set<number>>(new Set());
  const [activeMonth, setActiveMonth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pendingRemove, setPendingRemove] = useState<{ monthKey: number; id: string } | null>(null);
  const loadGen = useRef(0);

  const currentData = dataByMonth[activeMonth] || [];
  const total = currentData.reduce((s, d) => s + (Number(d.whtDeducted) || 0), 0);
  const hasData = Object.values(dataByMonth).some((arr) => arr.length > 0);
  const pendingPayee = pendingRemove
    ? (dataByMonth[pendingRemove.monthKey] || []).find((d) => d.id === pendingRemove.id)?.payee ?? null
    : null;

  const loadMonth = useCallback(async (monthIdx: number) => {
    const gen = ++loadGen.current;
    setLoading(true);
    try {
      const res = await listWhtDeductions(profileId, year, toApiMonth(monthIdx));
      if (gen !== loadGen.current) return;
      const items = (res.data?.deductions ?? []).map(mapApiDeductionToUi);
      setDataByMonth((prev) => ({ ...prev, [monthIdx]: items }));
      setFiledMonths((prev) => {
        const next = new Set(prev);
        if (res.data?.status === 'filed') next.add(monthIdx);
        else next.delete(monthIdx);
        return next;
      });
    } catch (err: unknown) {
      if (gen !== loadGen.current) return;
      console.error('Failed to load WHT deductions:', err instanceof Error ? err.message : 'Unknown error');
      toast.error(errMessage(err, 'Failed to load WHT deductions'));
      setDataByMonth((prev) => ({ ...prev, [monthIdx]: prev[monthIdx] ?? [] }));
    } finally {
      if (gen === loadGen.current) setLoading(false);
    }
  }, [listWhtDeductions, profileId, year]);

  useEffect(() => {
    void loadMonth(activeMonth);
  }, [activeMonth, loadMonth]);

  const saveItem = useCallback(async (
    item: Omit<WHTDeduction, 'id'>,
    existingId: string | null,
    sourceMonth?: number
  ) => {
    const targetMonth = sourceMonth ?? activeMonth;
    const gross = parseGross(item.gross);
    const whtRate = Number(item.whtRate) || 0;
    const receiptUrl = item.receipt?.trim() || undefined;
    const date = item.date?.trim() || new Date().toISOString().slice(0, 10);

    try {
      if (existingId) {
        await updateWhtDeduction(profileId, existingId, {
          payee: item.payee,
          tin: item.tin,
          whtType: deductionTypeToApi(item.whtType),
          gross,
          whtRate,
          date,
          receiptUrl,
        });
      } else {
        await createWhtDeduction(profileId, {
          year,
          month: toApiMonth(targetMonth),
          payee: item.payee,
          tin: item.tin,
          whtType: deductionTypeToApi(item.whtType),
          gross,
          whtRate,
          date,
          receiptUrl,
        });
      }
      await loadMonth(targetMonth);
    } catch (err: unknown) {
      console.error('Failed to save WHT deduction:', err instanceof Error ? err.message : 'Unknown error');
      toast.error(errMessage(err, 'Failed to save WHT deduction'));
      throw err;
    }
  }, [createWhtDeduction, updateWhtDeduction, profileId, year, activeMonth, loadMonth]);

  const removeItem = useCallback(async (id: string, monthKey: number) => {
    try {
      await deleteWhtDeduction(profileId, id);
      await loadMonth(monthKey);
    } catch (err: unknown) {
      console.error('Failed to remove WHT deduction:', err instanceof Error ? err.message : 'Unknown error');
      toast.error(errMessage(err, 'Failed to remove WHT deduction'));
      throw err;
    }
  }, [deleteWhtDeduction, profileId, loadMonth]);

  const handleConfirmRemove = useCallback(async () => {
    if (!pendingRemove) return;
    try {
      await removeItem(pendingRemove.id, pendingRemove.monthKey);
      setPendingRemove(null);
    } catch {
      /* toast already shown */
    }
  }, [pendingRemove, removeItem]);

  const fileMonth = useCallback(async () => {
    try {
      await fileWhtMonth(profileId, { year, month: toApiMonth(activeMonth) });
      setFiledMonths((prev) => new Set([...prev, activeMonth]));
      await loadMonth(activeMonth);
    } catch (err: unknown) {
      console.error('Failed to file WHT month:', err instanceof Error ? err.message : 'Unknown error');
      toast.error(errMessage(err, 'Failed to file WHT month'));
      throw err;
    }
  }, [fileWhtMonth, profileId, year, activeMonth, loadMonth]);
  return {
    loading,
    dataByMonth,
    filedMonths,
    activeMonth,
    setActiveMonth,
    currentData,
    total,
    hasData,
    pendingRemove,
    setPendingRemove,
    pendingPayee,
    saveItem,
    removeItem,
    handleConfirmRemove,
    fileMonth,
  };
}

export function useWhtCredits(profileId: string, taxYear: string) {
  const {
    listWhtCredits,
    createWhtCredit,
    updateWhtCredit,
    deleteWhtCredit,
  } = useTaxableApi();
  const year = Number(taxYear) || new Date().getFullYear();

  const [dataByMonth, setDataByMonth] = useState<Record<number, WHTDeduction[]>>({});
  const [activeMonth, setActiveMonth] = useState(0);
  const [periodMode, setPeriodMode] = useState<'monthly' | 'annually'>('monthly');
  const [loading, setLoading] = useState(true);
  const [pendingRemove, setPendingRemove] = useState<{ monthKey: number; id: string } | null>(null);
  const loadGen = useRef(0);

  const currentData = dataByMonth[activeMonth] || [];
  const total = currentData.reduce((s, d) => s + (Number(d.whtDeducted) || 0), 0);
  const annualTotal = Object.values(dataByMonth).reduce(
    (s, arr) => s + arr.reduce((s2, d) => s2 + (Number(d.whtDeducted) || 0), 0),
    0
  );
  const pendingPayee = pendingRemove
    ? (dataByMonth[pendingRemove.monthKey] || []).find((d) => d.id === pendingRemove.id)?.payee ?? null
    : null;

  const groupCreditsByMonth = useCallback((credits: ApiWhtCredit[], fallbackMonth: number) => {
    const byMonth: Record<number, WHTDeduction[]> = {};
    for (const c of credits) {
      const idx = c.month != null ? toUiMonth(c.month) : fallbackMonth;
      const safeIdx = idx >= 0 && idx <= 11 ? idx : 0;
      if (!byMonth[safeIdx]) byMonth[safeIdx] = [];
      byMonth[safeIdx].push(mapApiCreditToUi(c));
    }
    return byMonth;
  }, []);

  const loadCredits = useCallback(async () => {
    const gen = ++loadGen.current;
    setLoading(true);
    try {
      const month = periodMode === 'monthly' ? toApiMonth(activeMonth) : undefined;
      const res = await listWhtCredits(profileId, year, month);
      if (gen !== loadGen.current) return;
      const credits = res.data?.credits ?? [];
      if (periodMode === 'monthly') {
        const items = credits.map(mapApiCreditToUi);
        setDataByMonth((prev) => ({ ...prev, [activeMonth]: items }));
      } else {
        setDataByMonth(groupCreditsByMonth(credits, activeMonth));
      }
    } catch (err: unknown) {
      if (gen !== loadGen.current) return;
      console.error('Failed to load WHT credits:', err instanceof Error ? err.message : 'Unknown error');
      toast.error(errMessage(err, 'Failed to load WHT credits'));
      if (periodMode === 'monthly') {
        setDataByMonth((prev) => ({ ...prev, [activeMonth]: [] }));
      } else {
        setDataByMonth({});
      }
    } finally {
      if (gen === loadGen.current) setLoading(false);
    }
  }, [listWhtCredits, profileId, year, periodMode, activeMonth, groupCreditsByMonth]);
  useEffect(() => {
    void loadCredits();
  }, [loadCredits]);

  const saveItem = useCallback(async (
    item: Omit<WHTDeduction, 'id'>,
    existingId: string | null,
    sourceMonth?: number
  ) => {
    const targetMonth = sourceMonth ?? activeMonth;
    const gross = parseGross(item.gross);
    const date = item.date?.trim() || new Date().toISOString().slice(0, 10);
    const receiptUrl = item.receipt?.trim() || undefined;

    try {
      if (existingId) {
        await updateWhtCredit(profileId, existingId, {
          payee: item.payee,
          tin: item.tin,
          whtType: creditTypeToApi(item.whtType),
          gross,
          date,
          receiptUrl,
          month: toApiMonth(targetMonth),
        });
      } else {
        await createWhtCredit(profileId, {
          year,
          month: toApiMonth(targetMonth),
          payee: item.payee,
          tin: item.tin,
          whtType: creditTypeToApi(item.whtType),
          gross,
          date,
          receiptUrl,
        });
      }
      await loadCredits();
    } catch (err: unknown) {
      console.error('Failed to save WHT credit:', err instanceof Error ? err.message : 'Unknown error');
      toast.error(errMessage(err, 'Failed to save WHT credit'));
      throw err;
    }
  }, [createWhtCredit, updateWhtCredit, profileId, year, activeMonth, loadCredits]);

  const handleConfirmRemove = useCallback(async () => {
    if (!pendingRemove) return;
    try {
      await deleteWhtCredit(profileId, pendingRemove.id);
      setPendingRemove(null);
      await loadCredits();
    } catch (err: unknown) {
      console.error('Failed to remove WHT credit:', err instanceof Error ? err.message : 'Unknown error');
      toast.error(errMessage(err, 'Failed to remove WHT credit'));
    }
  }, [deleteWhtCredit, profileId, pendingRemove, loadCredits]);
  return {
    loading,
    dataByMonth,
    activeMonth,
    setActiveMonth,
    periodMode,
    setPeriodMode,
    currentData,
    total,
    annualTotal,
    pendingRemove,
    setPendingRemove,
    pendingPayee,
    saveItem,
    handleConfirmRemove,
  };
}
