'use client';

import React, { useState, useEffect, useCallback, useRef, startTransition } from 'react';
import { toast } from 'sonner';
import { FileTextIcon, XIcon } from 'lucide-react';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Attachment, AttachmentGroup, AttachmentMedia, AttachmentContent,
    AttachmentTitle, AttachmentActions, AttachmentAction,
} from '@/components/ui/attachment';
import {
    Stepper, StepperItem, StepperIndicator, StepperTitle,
    StepperSeparator, StepperTrigger,
} from '@/components/ui/stepper';
import { Spinner } from '@/components/ui/spinner';
import { useTaxableApi } from '@/hooks/useTaxableApi';
import type { UpsertVatRequest, VatFiling, VatFilingResponse, VatListResponse } from '@/types/api';

import {
    PrimaryButton, SecondaryButton,
    FilingSheet, FormFieldRow, FormLabel,
} from './TaxFolderShared';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const VAT_RATE = 0.075;

export type VatStep = 'gatekeeper' | 'output-vat' | 'input-vat' | 'adjustments' | 'review';

// ── VAT Filing Data ─────────────────────────────────────────────────────
export interface VATFilingData {
    standardSales: string;
    exemptSales: string;
    wvatCredit: string;
    allowableInputVAT: string;
    nonAllowableOverheads: string;
    nonAllowableCapEx: string;
    broughtForwardCredit: string;
    salesScheduleUploaded: string;
    purchaseInvoicesUploaded: string;
    salesScheduleUrl: string;
    purchaseInvoicesUrl: string;
    disclaimerAccepted: string;
    filed: boolean;
}

const defaultFilingData = (): VATFilingData => ({
    standardSales: '', exemptSales: '', wvatCredit: '', allowableInputVAT: '',
    nonAllowableOverheads: '', nonAllowableCapEx: '', broughtForwardCredit: '',
    salesScheduleUploaded: '', purchaseInvoicesUploaded: '',
    salesScheduleUrl: '', purchaseInvoicesUrl: '',
    disclaimerAccepted: '',
    filed: false,
});

const fmt = (n: number) => `₦${Math.round(n).toLocaleString()}`;

const parseMoney = (s: string): number => Number(String(s).replace(/,/g, '')) || 0;

const formatMoneyInput = (n: number | undefined | null): string => {
    if (n == null || n === 0) return '';
    const parts = String(n).split('.');
    const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length > 1 ? `${integer}.${parts[1]}` : integer;
};

const fileNameFromUrl = (url: string): string => {
    try {
        const path = new URL(url).pathname;
        const name = path.split('/').pop();
        return name && name.length > 0 ? decodeURIComponent(name) : 'Uploaded file';
    } catch {
        const name = url.split('/').pop();
        return name && name.length > 0 ? name : 'Uploaded file';
    }
};

const vatFilingToUi = (filing: VatFiling): VATFilingData => ({
    standardSales: formatMoneyInput(filing.standardSales),
    exemptSales: formatMoneyInput(filing.exemptSales),
    wvatCredit: formatMoneyInput(filing.wvatCredit),
    allowableInputVAT: formatMoneyInput(filing.allowableInputVAT),
    nonAllowableOverheads: formatMoneyInput(filing.nonAllowableOverheads),
    nonAllowableCapEx: formatMoneyInput(filing.nonAllowableCapEx),
    broughtForwardCredit: formatMoneyInput(filing.broughtForwardCredit),
    salesScheduleUploaded: filing.salesScheduleUrl ? 'true' : '',
    purchaseInvoicesUploaded: filing.purchaseInvoicesUrl ? 'true' : '',
    salesScheduleUrl: filing.salesScheduleUrl ?? '',
    purchaseInvoicesUrl: filing.purchaseInvoicesUrl ?? '',
    disclaimerAccepted: filing.disclaimerAccepted ? 'true' : '',
    filed: filing.filed || filing.status === 'filed',
});

const isVatListResponse = (res: VatListResponse | VatFilingResponse): res is VatListResponse =>
    'months' in res.data;

const isVatFilingResponse = (res: VatListResponse | VatFilingResponse): res is VatFilingResponse =>
    'filing' in res.data;

const STEP_NUM: Record<VatStep, number> = {
    gatekeeper: 1, 'output-vat': 2, 'input-vat': 3, adjustments: 4, review: 5,
};

const ENTRY_OPTIONS = [
    { id: 'manual' as const, label: 'Manual entry' },
    { id: 'csv' as const, label: 'Upload sales & purchase ledgers (CSV/Excel)' },
    { id: 'software' as const, label: 'Connect accounting software (QuickBooks, Xero, Zoho)' },
];

const VAT_STEPS = [
    { key: 'gatekeeper', step: 1, title: 'Data Source' },
    { key: 'output-vat', step: 2, title: 'Output VAT' },
    { key: 'input-vat', step: 3, title: 'Input VAT' },
    { key: 'adjustments', step: 4, title: 'Adjustments' },
    { key: 'review', step: 5, title: 'Review' },
];

// ── VAT Content ─────────────────────────────────────────────────────────
export interface BusinessVATContentProps {
    profileId?: string;
    taxYear?: string;
    vatStep?: VatStep;
    setVatStep?: React.Dispatch<React.SetStateAction<VatStep>>;
    activeMonth?: number;
    setActiveMonth?: React.Dispatch<React.SetStateAction<number>>;
    completedSteps?: Set<number>;
    setCompletedSteps?: React.Dispatch<React.SetStateAction<Set<number>>>;
}

export function BusinessVATContent({
    profileId, taxYear, vatStep: vatStepProp, setVatStep: setVatStepProp,
    activeMonth: activeMonthProp, setActiveMonth: setActiveMonthProp,
    completedSteps: completedStepsProp, setCompletedSteps: setCompletedStepsProp,
}: BusinessVATContentProps = {}) {
    const { getVat, upsertVat, fileVat, uploadFile } = useTaxableApi();
    const yearNum = Number(taxYear) || new Date().getFullYear();

    // Fall back to internal state when used standalone (e.g. /tax-folders/business-vat)
    const [internalVatStep, setInternalVatStep] = useState<VatStep>('gatekeeper');
    const [internalActiveMonth, setInternalActiveMonth] = useState(0);
    const [internalCompletedSteps, setInternalCompletedSteps] = useState<Set<number>>(new Set());

    const vatStep = vatStepProp ?? internalVatStep;
    const setVatStep = setVatStepProp ?? setInternalVatStep;
    const activeMonth = activeMonthProp ?? internalActiveMonth;
    const setActiveMonth = setActiveMonthProp ?? setInternalActiveMonth;
    const completedSteps = completedStepsProp ?? internalCompletedSteps;
    const setCompletedSteps = setCompletedStepsProp ?? setInternalCompletedSteps;

    const [entryMethod, setEntryMethod] = useState<'manual' | 'csv' | 'software'>('manual');
    const [filedMonths, setFiledMonths] = useState<Set<number>>(new Set());
    const [draftMonths, setDraftMonths] = useState<Set<number>>(new Set());
    const [monthData, setMonthData] = useState<Record<number, VATFilingData>>({});
    const [showFilingModal, setShowFilingModal] = useState(false);
    const [salesScheduleFiles, setSalesScheduleFiles] = useState<{ name: string }[]>([]);
    const [purchaseInvoiceFiles, setPurchaseInvoiceFiles] = useState<{ name: string }[]>([]);
    const [dismissCashBanner, setDismissCashBanner] = useState(false);
    const [dismissInputBanner, setDismissInputBanner] = useState(false);
    const [monthLoading, setMonthLoading] = useState(Boolean(profileId));
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<'sales' | 'purchases' | null>(null);
    const salesInputRef = useRef<HTMLInputElement>(null);
    const purchaseInputRef = useRef<HTMLInputElement>(null);

    const data = monthData[activeMonth] ?? defaultFilingData();

    const setField = (field: keyof VATFilingData) => (val: string) =>
        setMonthData(prev => ({
            ...prev,
            [activeMonth]: { ...(prev[activeMonth] ?? defaultFilingData()), [field]: val },
        }));

    const standardSalesNum = parseMoney(data.standardSales);
    const outputVAT = standardSalesNum * VAT_RATE;
    const allowableNum = parseMoney(data.allowableInputVAT);
    const wvatNum = parseMoney(data.wvatCredit);
    const bfNum = parseMoney(data.broughtForwardCredit);
    const netPosition = outputVAT - allowableNum - wvatNum - bfNum;
    const isCredit = netPosition < 0;

    const fmtInput = (set: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9.]/g, '');
        const parts = raw.split('.');
        const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        set(parts.length > 1 ? integer + '.' + parts.slice(1).join('') : integer);
    };

    const buildUpsertPayload = useCallback((filing: VATFilingData, month0: number): UpsertVatRequest => {
        const payload: UpsertVatRequest = {
            year: yearNum,
            month: month0 + 1,
            standardSales: parseMoney(filing.standardSales),
            exemptSales: parseMoney(filing.exemptSales),
            wvatCredit: parseMoney(filing.wvatCredit),
            allowableInputVAT: parseMoney(filing.allowableInputVAT),
            nonAllowableOverheads: parseMoney(filing.nonAllowableOverheads),
            nonAllowableCapEx: parseMoney(filing.nonAllowableCapEx),
            broughtForwardCredit: parseMoney(filing.broughtForwardCredit),
            disclaimerAccepted: filing.disclaimerAccepted === 'true',
        };
        if (filing.salesScheduleUrl) payload.salesScheduleUrl = filing.salesScheduleUrl;
        if (filing.purchaseInvoicesUrl) payload.purchaseInvoicesUrl = filing.purchaseInvoicesUrl;
        return payload;
    }, [yearNum]);

    const applyFilingToState = useCallback((month0: number, filing: VatFiling) => {
        const ui = vatFilingToUi(filing);
        startTransition(() => {
            setMonthData(prev => ({ ...prev, [month0]: ui }));
            if (ui.filed) {
                setFiledMonths(prev => new Set([...prev, month0]));
                setDraftMonths(prev => {
                    const next = new Set(prev);
                    next.delete(month0);
                    return next;
                });
            } else {
                setDraftMonths(prev => new Set([...prev, month0]));
            }
            setSalesScheduleFiles(
                filing.salesScheduleUrl ? [{ name: fileNameFromUrl(filing.salesScheduleUrl) }] : []
            );
            setPurchaseInvoiceFiles(
                filing.purchaseInvoicesUrl ? [{ name: fileNameFromUrl(filing.purchaseInvoicesUrl) }] : []
            );
        });
    }, []);

    const saveCurrentMonth = useCallback(async (): Promise<boolean> => {
        if (!profileId) {
            toast.error('Profile required to save VAT data');
            return false;
        }
        const filing = monthData[activeMonth] ?? defaultFilingData();
        setSaving(true);
        try {
            const res = await upsertVat(profileId, buildUpsertPayload(filing, activeMonth));
            if (res?.data?.filing) {
                applyFilingToState(activeMonth, res.data.filing);
            }
            return true;
        } catch (err: unknown) {
            console.error(
                '[BusinessVAT] Failed to save VAT:',
                err instanceof Error ? err.message : 'Unknown error'
            );
            toast.error(err instanceof Error ? err.message : 'Failed to save VAT. Please try again.');
            return false;
        } finally {
            setSaving(false);
        }
    }, [profileId, monthData, activeMonth, upsertVat, buildUpsertPayload, applyFilingToState]);

    const goForward = (target: VatStep) => {
        const currentStepNum = STEP_NUM[vatStep];
        setCompletedSteps(prev => new Set([...prev, currentStepNum]));
        setVatStep(target);
    };

    const goBack = (target: VatStep) => {
        setVatStep(target);
    };

    const continueWithSave = async (target: VatStep) => {
        const ok = await saveCurrentMonth();
        if (!ok) return;
        goForward(target);
    };

    // Clear cached months when profile / year changes, then load year overview
    useEffect(() => {
        startTransition(() => {
            setMonthData({});
            setFiledMonths(new Set());
            setDraftMonths(new Set());
        });

        if (!profileId) return;
        let cancelled = false;

        (async () => {
            try {
                const res = await getVat(profileId, yearNum);
                if (cancelled) return;
                if (!isVatListResponse(res)) return;

                const filed = new Set<number>();
                const drafts = new Set<number>();
                for (const m of res.data.months) {
                    const idx = m.month - 1;
                    if (idx < 0 || idx > 11) continue;
                    if (m.filed || m.status === 'filed') filed.add(idx);
                    else if (m.status === 'draft') drafts.add(idx);
                }
                startTransition(() => {
                    setFiledMonths(filed);
                    setDraftMonths(drafts);
                });
            } catch (err: unknown) {
                console.error(
                    '[BusinessVAT] Failed to load VAT year overview:',
                    err instanceof Error ? err.message : 'Unknown error'
                );
                if (!cancelled) {
                    toast.error(
                        err instanceof Error ? err.message : 'Failed to load VAT filings'
                    );
                }
            }
        })();

        return () => { cancelled = true; };
    }, [profileId, yearNum, getVat]);

    // Active month detail
    useEffect(() => {
        if (!profileId) {
            startTransition(() => setMonthLoading(false));
            return;
        }

        let cancelled = false;
        startTransition(() => setMonthLoading(true));

        (async () => {
            const month1Based = activeMonth + 1;
            try {
                const res = await getVat(profileId, yearNum, month1Based);
                if (cancelled) return;

                if (isVatFilingResponse(res) && res.data.filing) {
                    applyFilingToState(activeMonth, res.data.filing);
                } else {
                    startTransition(() => {
                        setMonthData(prev => ({
                            ...prev,
                            [activeMonth]: prev[activeMonth] ?? defaultFilingData(),
                        }));
                        setSalesScheduleFiles([]);
                        setPurchaseInvoiceFiles([]);
                    });
                }
            } catch (err: unknown) {
                console.error(
                    '[BusinessVAT] Failed to load VAT month:',
                    err instanceof Error ? err.message : 'Unknown error'
                );
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : 'Failed to load VAT month';
                    const notFound = /not found|404|no filing/i.test(message);
                    if (notFound) {
                        startTransition(() => {
                            setMonthData(prev => ({
                                ...prev,
                                [activeMonth]: defaultFilingData(),
                            }));
                            setSalesScheduleFiles([]);
                            setPurchaseInvoiceFiles([]);
                        });
                    } else {
                        toast.error(message);
                    }
                }
            } finally {
                if (!cancelled) {
                    startTransition(() => setMonthLoading(false));
                }
            }
        })();

        return () => { cancelled = true; };
    }, [profileId, yearNum, activeMonth, getVat, applyFilingToState]);

    // Auto-populate brought-forward credit from previous month's net position
    useEffect(() => {
        if (activeMonth <= 0) return;
        const current = monthData[activeMonth];
        if (!current || current.broughtForwardCredit) return;
        const prev = monthData[activeMonth - 1];
        if (!prev?.filed) return;

        const prevOutput = parseMoney(prev.standardSales) * VAT_RATE;
        const prevNet = prevOutput
            - parseMoney(prev.allowableInputVAT)
            - parseMoney(prev.wvatCredit)
            - parseMoney(prev.broughtForwardCredit);
        if (prevNet >= 0) return;

        startTransition(() => {
            setMonthData(prevMap => ({
                ...prevMap,
                [activeMonth]: {
                    ...(prevMap[activeMonth] ?? defaultFilingData()),
                    broughtForwardCredit: String(Math.abs(Math.round(prevNet))),
                },
            }));
        });
    }, [activeMonth, monthData]);

    useEffect(() => {
        startTransition(() => {
            setDismissCashBanner(false);
            setDismissInputBanner(false);
        });
    }, [vatStep]);

    useEffect(() => {
        startTransition(() => {
            setCompletedSteps(new Set());
            setSalesScheduleFiles([]);
            setPurchaseInvoiceFiles([]);
            setVatStep('gatekeeper');
        });
    }, [activeMonth]);

    const handleFile = async () => {
        if (!profileId) {
            toast.error('Profile required to file VAT');
            return;
        }
        setSaving(true);
        try {
            const filing = monthData[activeMonth] ?? defaultFilingData();
            await upsertVat(profileId, buildUpsertPayload(filing, activeMonth));
            const res = await fileVat(profileId, { year: yearNum, month: activeMonth + 1 });
            if (res?.data?.filing) {
                applyFilingToState(activeMonth, res.data.filing);
            } else {
                startTransition(() => {
                    setFiledMonths(prev => new Set([...prev, activeMonth]));
                    setDraftMonths(prev => {
                        const next = new Set(prev);
                        next.delete(activeMonth);
                        return next;
                    });
                    setMonthData(prev => ({
                        ...prev,
                        [activeMonth]: {
                            ...(prev[activeMonth] ?? defaultFilingData()),
                            filed: true,
                        },
                    }));
                });
            }
            toast.success(`${MONTHS[activeMonth]} VAT return filed`);
            setShowFilingModal(false);
            if (activeMonth < 11) {
                setActiveMonth(m => m + 1);
            } else {
                goBack('gatekeeper');
            }
        } catch (err: unknown) {
            console.error(
                '[BusinessVAT] Failed to file VAT:',
                err instanceof Error ? err.message : 'Unknown error'
            );
            toast.error(err instanceof Error ? err.message : 'Failed to file VAT. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleAttachmentUpload = async (file: File, target: 'sales' | 'purchases') => {
        if (!profileId) {
            toast.error('Profile required to upload files');
            return;
        }
        setUploading(target);
        try {
            const res = await uploadFile(
                profileId,
                file,
                target === 'sales' ? 'sales-schedule' : 'purchase-invoices',
                `${MONTHS[activeMonth]} ${yearNum} ${target === 'sales' ? 'sales schedule' : 'purchase invoices'}`
            );
            const url = res?.data?.url;
            if (!url) {
                toast.error('Upload failed — no file URL returned.');
                return;
            }
            if (target === 'sales') {
                setSalesScheduleFiles(prev => [...prev, { name: file.name }]);
                setField('salesScheduleUrl')(url);
                setField('salesScheduleUploaded')('true');
            } else {
                setPurchaseInvoiceFiles(prev => [...prev, { name: file.name }]);
                setField('purchaseInvoicesUrl')(url);
                setField('purchaseInvoicesUploaded')('true');
            }
            toast.success(target === 'sales' ? 'Sales schedule uploaded' : 'Purchase invoices uploaded');
        } catch (err: unknown) {
            console.error(
                `[BusinessVAT] Failed to upload ${target}:`,
                err instanceof Error ? err.message : 'Unknown error'
            );
            toast.error(err instanceof Error ? err.message : 'Failed to upload file. Please try again.');
        } finally {
            setUploading(null);
        }
    };

    // React-Compiler-safe file input wiring (button + ref + native addEventListener)
    useEffect(() => {
        const input = salesInputRef.current;
        if (!input) return;
        const onChange = (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) handleAttachmentUpload(file, 'sales');
            (e.target as HTMLInputElement).value = '';
        };
        input.addEventListener('change', onChange);
        return () => input.removeEventListener('change', onChange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileId, activeMonth, yearNum, uploadFile, salesInputRef.current]);

    useEffect(() => {
        const input = purchaseInputRef.current;
        if (!input) return;
        const onChange = (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) handleAttachmentUpload(file, 'purchases');
            (e.target as HTMLInputElement).value = '';
        };
        input.addEventListener('change', onChange);
        return () => input.removeEventListener('change', onChange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileId, activeMonth, yearNum, uploadFile, purchaseInputRef.current]);

    const stepIndex = STEP_NUM[vatStep];

    const isDraftMonth = (i: number) =>
        draftMonths.has(i)
        || (
            !filedMonths.has(i)
            && !!monthData[i]
            && !!(monthData[i].standardSales || monthData[i].allowableInputVAT)
        );

    const monthSelector = (
        <Select value={MONTHS[activeMonth]} onValueChange={(v) => { if (v) setActiveMonth(MONTHS.indexOf(v)); }}>
            <SelectTrigger className="w-fit min-w-[180px] h-10 rounded-xl bg-white border-neutral-50 text-3">
                <div className="flex items-center gap-2 mr-6">
                    <span>{MONTHS[activeMonth]}</span>
                    {filedMonths.has(activeMonth) &&
                        <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-200 text-2 font-semibold px-2 py-0 h-5">Filed</Badge>
                    }
                    {!filedMonths.has(activeMonth) && isDraftMonth(activeMonth) &&
                        <Badge variant="secondary" className="bg-neutral-100 text-neutral-500 border-neutral-200 text-2 font-semibold px-2 py-0 h-5">Draft</Badge>
                    }
                </div>
            </SelectTrigger>
            <SelectContent>
                {MONTHS.map((m, i) => (
                    <SelectItem key={m} value={m}>
                        <div className="flex items-center gap-2">
                            <span>{m}</span>
                            {filedMonths.has(i) &&
                                <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-200 text-2 font-semibold px-2 py-0 h-5">Filed</Badge>
                            }
                            {!filedMonths.has(i) && isDraftMonth(i) &&
                                <Badge variant="secondary" className="bg-neutral-100 text-neutral-500 border-neutral-200 text-2 font-semibold px-2 py-0 h-5">Draft</Badge>
                            }
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );

    return (
        <div className="w-full">
            {/* ── Header + Stepper ── */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <h1 className="text-5 font-medium text-neutral-800 tracking-[-0.02em] font-[family-name:var(--font-merriweather)]">
                            File {MONTHS[activeMonth]} VAT Return
                        </h1>
                        {monthSelector}
                    </div>
                </div>

                <Stepper value={stepIndex} onValueChange={(step) => {
                    const map: Record<number, VatStep> = {
                        1: 'gatekeeper', 2: 'output-vat', 3: 'input-vat', 4: 'adjustments', 5: 'review'
                    };
                    if (step <= stepIndex) goBack(map[step]);
                }}>
                    {VAT_STEPS.map((s, idx) => (
                        <StepperItem key={s.key} step={s.step} completed={completedSteps.has(s.step)} disabled={s.step > stepIndex} className="[&:not(:last-child)]:flex-1 data-[state=inactive]:[&_h3]:text-neutral-400 [&_h3]:text-neutral-800">
                            <StepperTrigger className="flex items-center gap-3 max-md:flex-col">
                                <StepperIndicator />
                                <div className="text-center md:text-left">
                                    <StepperTitle className="text-2 font-medium">{s.title}</StepperTitle>
                                </div>
                            </StepperTrigger>
                            {idx < VAT_STEPS.length - 1 && <StepperSeparator className="md:mx-4" />}
                        </StepperItem>
                    ))}
                </Stepper>
            </div>

            {monthLoading ? (
                <div className="flex items-center justify-center py-24">
                    <Spinner className="size-6 text-neutral-400" />
                </div>
            ) : (
                <>
                    {/* ── Step 1: Gatekeeper ── */}
                    {vatStep === 'gatekeeper' && (
                        <div className="max-w-[480px] mx-auto" data-animate>
                            <h2 className="text-3 font-medium text-neutral-800 tracking-[-0.02em] font-[family-name:var(--font-merriweather)] mb-4">How do you want to enter your VAT data?</h2>

                            <RadioGroup value={entryMethod} onValueChange={(v) => setEntryMethod(v as 'manual' | 'csv' | 'software')} className="space-y-0 mb-6">
                                {ENTRY_OPTIONS.map(opt => {
                                    const disabled = opt.id !== 'manual';
                                    return (
                                        <label key={opt.id} className={`flex items-center gap-3 py-3.5 cursor-pointer ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                            <RadioGroupItem value={opt.id} disabled={disabled} />
                                            <span className="text-3 font-medium text-neutral-800">{opt.label}</span>
                                        </label>
                                    );
                                })}
                            </RadioGroup>

                            <PrimaryButton onClick={() => goForward('output-vat')}>
                                Continue
                            </PrimaryButton>
                        </div>
                    )}

                    {/* ── Step 2: Output VAT (Sales) ── */}
                    {vatStep === 'output-vat' && (
                        <div className="max-w-[500px] mx-auto" data-animate>
                            <h2 className="text-3 font-medium text-neutral-800 tracking-[-0.02em] font-[family-name:var(--font-merriweather)] mb-4">Output VAT (Sales)</h2>
                            {!dismissCashBanner && (
                            <div className="relative flex items-start gap-2 mb-6 p-3 bg-amber-50 rounded-xl">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 mt-0.5 text-amber-600"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                <p className="text-2 text-amber-700 font-medium leading-relaxed flex-1">Only include cash actually received this month. Do not include unpaid invoices.</p>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" onClick={() => setDismissCashBanner(true)} className="flex-shrink-0 mt-0.5 text-amber-600 cursor-pointer"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </div>
                            )}

                            <div className="bg-neutral-50 rounded-3xl p-5 mb-6">
                                <div className="space-y-3">
                                    <FormFieldRow className="justify-between">
                                        <FormLabel tip="Total standard sales before VAT — cash actually received this month.">Standard Sales (7.5%)</FormLabel>
                                        <Input type="text" value={data.standardSales} onChange={fmtInput(setField('standardSales'))} placeholder="₦ 0.00" className="w-[150px] text-left" />
                                    </FormFieldRow>
                                    <FormFieldRow className="justify-between">
                                        <FormLabel tip="Automatically calculated: Standard Sales × 7.5%">Output VAT @ 7.5%</FormLabel>
                                        <Input type="text" value={outputVAT > 0 ? fmt(outputVAT) : '₦ 0.00'} disabled className="w-[150px] text-left" />
                                    </FormFieldRow>
                                    <FormFieldRow className="justify-between">
                                        <FormLabel tip="Sales where VAT is 0% — exports, certain goods.">Exempt / Zero-Rated Sales</FormLabel>
                                        <Input type="text" value={data.exemptSales} onChange={fmtInput(setField('exemptSales'))} placeholder="₦ 0.00" className="w-[150px] text-left" />
                                    </FormFieldRow>
                                    <FormFieldRow className="justify-between">
                                        <FormLabel tip="VAT deducted at source by government or corporate clients.">Withholding VAT (WVAT) Credit</FormLabel>
                                        <Input type="text" value={data.wvatCredit} onChange={fmtInput(setField('wvatCredit'))} placeholder="₦ 0.00" className="w-[150px] text-left" />
                                    </FormFieldRow>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-2 font-semibold text-neutral-700 mb-2">Upload Sales Schedule</p>
                                    <div className="flex items-center justify-between gap-4 p-3 border border-dashed border-neutral-200 rounded-xl">
                                        <div className="flex items-center gap-2.5">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                            <span className="text-1 text-neutral-400 font-medium">Upload CSV or PDF of sales transactions</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => salesInputRef.current?.click()}
                                            disabled={uploading !== null || !profileId}
                                            className="cursor-pointer text-2 font-semibold text-taxable-blue bg-transparent border-none p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {uploading === 'sales' ? <Spinner className="size-4" /> : 'Upload'}
                                        </button>
                                        <input ref={salesInputRef} type="file" hidden accept=".csv,.pdf,.xlsx" />
                                    </div>
                                {salesScheduleFiles.length > 0 && (
                                    <div className="mt-3">
                                        <AttachmentGroup>
                                            {salesScheduleFiles.map((f, i) => (
                                                <Attachment key={i} size="xs" className="bg-white">
                                                    <AttachmentMedia><FileTextIcon className="text-neutral-400 w-3.5 h-3.5" /></AttachmentMedia>
                                                    <AttachmentContent>
                                                        <AttachmentTitle className="text-1">{f.name}</AttachmentTitle>
                                                    </AttachmentContent>
                                                    <AttachmentActions>
                                                        <AttachmentAction onClick={() => setSalesScheduleFiles(prev => prev.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`}>
                                                            <XIcon />
                                                        </AttachmentAction>
                                                    </AttachmentActions>
                                                </Attachment>
                                            ))}
                                        </AttachmentGroup>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <SecondaryButton onClick={() => goBack('gatekeeper')}>Back</SecondaryButton>
                                <PrimaryButton
                                    onClick={() => continueWithSave('input-vat')}
                                    disabled={!data.standardSales || saving}
                                >
                                    {saving ? <Spinner /> : 'Next: Input VAT'}
                                </PrimaryButton>
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: Input VAT (Purchases) ── */}
                    {vatStep === 'input-vat' && (
                        <div className="max-w-[500px] mx-auto" data-animate>
                            <h2 className="text-3 font-medium text-neutral-800 tracking-[-0.02em] font-[family-name:var(--font-merriweather)] mb-4">Input VAT (Purchases)</h2>
                            {!dismissInputBanner && (
                            <div className="relative flex items-start gap-2 mb-6 p-3 bg-amber-50 rounded-xl">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 mt-0.5 text-amber-600"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                <p className="text-2 text-amber-700 font-medium leading-relaxed flex-1">Only claim VAT back on raw materials or inventory for direct resale. VAT on overheads (rent, fuel) and assets is non-allowable.</p>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" onClick={() => setDismissInputBanner(true)} className="flex-shrink-0 mt-0.5 text-amber-600 cursor-pointer"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </div>
                            )}

                            <div className="bg-neutral-50 rounded-3xl p-5 mb-6">
                                <div className="space-y-3">
                                    <FormFieldRow className="justify-between">
                                        <FormLabel tip="VAT paid on raw materials or inventory purchased for direct resale. This reduces your VAT liability.">VAT on Inventory / Raw Materials (Allowable)</FormLabel>
                                        <Input type="text" value={data.allowableInputVAT} onChange={fmtInput(setField('allowableInputVAT'))} placeholder="₦ 0.00" className="w-[150px] text-left" />
                                    </FormFieldRow>
                                    <FormFieldRow className="justify-between">
                                        <FormLabel tip="VAT on rent, diesel, internet, utilities — logged for records but cannot be deducted.">VAT on Operational Overheads (Non-Allowable)</FormLabel>
                                        <Input type="text" value={data.nonAllowableOverheads} onChange={fmtInput(setField('nonAllowableOverheads'))} placeholder="₦ 0.00" className="w-[150px] text-left" />
                                    </FormFieldRow>
                                    <FormFieldRow className="justify-between">
                                        <FormLabel tip="VAT on machinery, laptops, equipment — logged for records but cannot be deducted.">VAT on Capital Expenditure (Non-Allowable)</FormLabel>
                                        <Input type="text" value={data.nonAllowableCapEx} onChange={fmtInput(setField('nonAllowableCapEx'))} placeholder="₦ 0.00" className="w-[150px] text-left" />
                                    </FormFieldRow>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-2 font-semibold text-neutral-700 mb-2">Upload Purchase Invoices & Receipts</p>
                                    <div className="flex items-center justify-between gap-4 p-3 border border-dashed border-neutral-200 rounded-xl">
                                        <div className="flex items-center gap-2.5">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                            <span className="text-1 text-neutral-400 font-medium">Upload invoices supporting Allowable Input VAT</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => purchaseInputRef.current?.click()}
                                            disabled={uploading !== null || !profileId}
                                            className="cursor-pointer text-2 font-semibold text-taxable-blue bg-transparent border-none p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {uploading === 'purchases' ? <Spinner className="size-4" /> : 'Upload'}
                                        </button>
                                        <input ref={purchaseInputRef} type="file" hidden accept=".csv,.pdf,.xlsx,.jpg,.png" />
                                    </div>
                                {purchaseInvoiceFiles.length > 0 && (
                                    <div className="mt-3">
                                        <AttachmentGroup>
                                            {purchaseInvoiceFiles.map((f, i) => (
                                                <Attachment key={i} size="xs" className="bg-white">
                                                    <AttachmentMedia><FileTextIcon className="text-neutral-400 w-3.5 h-3.5" /></AttachmentMedia>
                                                    <AttachmentContent>
                                                        <AttachmentTitle className="text-1">{f.name}</AttachmentTitle>
                                                    </AttachmentContent>
                                                    <AttachmentActions>
                                                        <AttachmentAction onClick={() => setPurchaseInvoiceFiles(prev => prev.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`}>
                                                            <XIcon />
                                                        </AttachmentAction>
                                                    </AttachmentActions>
                                                </Attachment>
                                            ))}
                                        </AttachmentGroup>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <SecondaryButton onClick={() => goBack('output-vat')}>Back</SecondaryButton>
                                <PrimaryButton
                                    onClick={() => continueWithSave('adjustments')}
                                    disabled={!data.allowableInputVAT || saving}
                                >
                                    {saving ? <Spinner /> : 'Next: Adjustments'}
                                </PrimaryButton>
                            </div>
                        </div>
                    )}

                    {/* ── Step 4: Adjustments ── */}
                    {vatStep === 'adjustments' && (
                        <div className="max-w-[500px] mx-auto" data-animate>
                            <h2 className="text-3 font-medium text-neutral-800 tracking-[-0.02em] font-[family-name:var(--font-merriweather)] mb-4">Adjustments</h2>

                            <div className="bg-neutral-50 rounded-3xl p-5 mb-6">
                                <FormFieldRow className="justify-between mb-0">
                                    <FormLabel tip="VAT credit carried forward from the previous month. Auto-populated if available.">Brought-Forward VAT Credit</FormLabel>
                                    <Input type="text" value={data.broughtForwardCredit} onChange={fmtInput(setField('broughtForwardCredit'))} placeholder="₦ 0.00" className="w-[150px] text-left" />
                                </FormFieldRow>
                            </div>

                            <div className="flex gap-3">
                                <SecondaryButton onClick={() => goBack('input-vat')}>Back</SecondaryButton>
                                <PrimaryButton
                                    onClick={() => continueWithSave('review')}
                                    disabled={saving}
                                >
                                    {saving ? <Spinner /> : 'Review Tax Return'}
                                </PrimaryButton>
                            </div>
                        </div>
                    )}

                    {/* ── Step 5: Review ── */}
                    {vatStep === 'review' && (
                        <div className="max-w-[500px] mx-auto" data-animate>
                            <h2 className="text-3 font-medium text-neutral-800 tracking-[-0.02em] font-[family-name:var(--font-merriweather)] mb-4">Review & Submit</h2>

                            <div className="bg-neutral-50 rounded-3xl p-5 mb-6">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between text-2">
                                        <span className="text-neutral-500 font-medium">Output VAT Collected</span>
                                        <span className="font-semibold text-neutral-800">{fmt(outputVAT)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-2">
                                        <span className="text-neutral-500 font-medium">Less Allowable Input VAT</span>
                                        <span className="font-semibold text-neutral-800">-{fmt(allowableNum)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-2">
                                        <span className="text-neutral-500 font-medium">Less WVAT Credit</span>
                                        <span className="font-semibold text-neutral-800">-{fmt(wvatNum)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-2">
                                        <span className="text-neutral-500 font-medium">Less Brought-Forward Credit</span>
                                        <span className="font-semibold text-neutral-800">-{fmt(bfNum)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-2 pt-2 border-t border-neutral-100">
                                        <span className="font-semibold text-neutral-800">Net VAT {isCredit ? 'Credit' : 'Liability'}</span>
                                        <span className={`font-semibold text-3 ${isCredit ? 'text-blue-600' : 'text-neutral-900'}`}>{isCredit ? fmt(Math.abs(netPosition)) : fmt(netPosition)}</span>
                                    </div>
                                </div>
                            </div>

                            {isCredit ? (
                                <div className="flex items-start gap-2 mb-6 p-3 bg-blue-50 rounded-xl">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 mt-0.5 text-blue-600"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                    <p className="text-2 text-blue-700 font-medium leading-relaxed">VAT Credit of {fmt(Math.abs(netPosition))} accumulated. This will roll over to offset next month&apos;s tax.</p>
                                </div>
                            ) : (
                                <div className="flex items-start gap-2 mb-6 p-3 bg-green-50 rounded-xl">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 mt-0.5 text-green-600"><polyline points="20 6 9 17 4 12" /></svg>
                                    <p className="text-2 text-green-700 font-medium leading-relaxed">Net VAT Liability of {fmt(netPosition)} due by the 21st of next month.</p>
                                </div>
                            )}

                            <label className="flex items-start gap-3 mb-8 cursor-pointer">
                                <Checkbox checked={data.disclaimerAccepted === 'true'} onCheckedChange={() => setField('disclaimerAccepted')(data.disclaimerAccepted ? '' : 'true')} className="mt-0.5" />
                                <span className="text-2 font-medium text-neutral-600 leading-relaxed">I confirm these records are accurate under the Nigeria Tax Act.</span>
                            </label>

                            <div className="flex gap-3">
                                <SecondaryButton onClick={() => goBack('adjustments')}>Back</SecondaryButton>
                                <PrimaryButton
                                    onClick={() => setShowFilingModal(true)}
                                    disabled={!data.disclaimerAccepted || saving}
                                >
                                    Submit VAT Return
                                </PrimaryButton>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Filing Sheet */}
            <FilingSheet open={showFilingModal} onClose={() => setShowFilingModal(false)} onFile={handleFile} />
        </div>
    );
}
