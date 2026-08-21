'use client';

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { FileTextIcon } from 'lucide-react';

import { Spinner } from '@/components/ui/spinner';
import { useTaxableApi } from '@/hooks/useTaxableApi';
import { validateFileSize, MAX_UPLOAD_BYTES } from '@/lib/file-upload';
import type { CsvImportData, CsvImportType } from '@/types/api';

export const CSV_SAMPLES: Record<CsvImportType, { href: string; fileName: string }> = {
    vat: { href: '/samples/vat_ledger_sample.csv', fileName: 'taxable-vat-ledger-sample.csv' },
    wht: { href: '/samples/wht_deductions_sample.csv', fileName: 'taxable-wht-deductions-sample.csv' },
    paye: { href: '/samples/paye_employees_sample.csv', fileName: 'taxable-paye-employees-sample.csv' },
    cit_wht_credits: {
        href: '/samples/cit_wht_credits_sample.csv',
        fileName: 'taxable-cit-wht-credits-sample.csv',
    },
};

interface CsvImportPanelProps {
    profileId?: string;
    importType: CsvImportType;
    hint: string;
    disabled?: boolean;
    onImported: (data: CsvImportData, file: File) => void | Promise<void>;
}

export function CsvImportPanel({
    profileId,
    importType,
    hint,
    disabled,
    onImported,
}: CsvImportPanelProps) {
    const { parseCsvImport } = useTaxableApi();
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const sample = CSV_SAMPLES[importType];
    const canUpload = Boolean(profileId) && profileId !== 'default' && !disabled;

    const handleFile = async (file: File) => {
        if (!profileId || profileId === 'default') {
            toast.error('Profile required to import a CSV');
            return;
        }
        if (!validateFileSize(file)) {
            toast.error(`File too large — max ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB`);
            return;
        }
        setUploading(true);
        try {
            const res = await parseCsvImport(profileId, file, importType);
            setFileName(file.name);
            const skipped = res.data.errors.length;
            if (skipped > 0) {
                toast.success(`Imported ${res.data.acceptedCount} row(s). ${skipped} row(s) skipped.`);
            } else {
                toast.success(`Imported ${res.data.acceptedCount} row(s) from ${file.name}`);
            }
            await onImported(res.data, file);
        } catch (err: unknown) {
            console.error(
                '[CsvImportPanel] Failed to parse CSV:',
                err instanceof Error ? err.message : 'Unknown error'
            );
            toast.error(err instanceof Error ? err.message : 'Failed to parse CSV. Check the sample format and try again.');
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        const input = inputRef.current;
        if (!input) return;
        const onChange = (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) void handleFile(file);
            (e.target as HTMLInputElement).value = '';
        };
        input.addEventListener('change', onChange);
        return () => input.removeEventListener('change', onChange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileId, importType, parseCsvImport, inputRef.current]);

    return (
        <div className="mb-6 space-y-3">
            <p className="text-1 text-neutral-500 font-medium">{hint}</p>
            <a
                href={sample.href}
                download={sample.fileName}
                className="inline-flex items-center gap-2 text-2 font-semibold text-taxable-blue"
            >
                <FileTextIcon className="w-3.5 h-3.5" />
                Download sample CSV
            </a>
            <div className="flex items-center justify-between gap-4 p-3 border border-dashed border-neutral-200 rounded-xl">
                <div className="flex items-center gap-2.5 min-w-0">
                    <FileTextIcon className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <span className="text-1 text-neutral-400 font-medium truncate">
                        {fileName || 'Upload CSV or Excel (.csv, .xlsx)'}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={!canUpload || uploading}
                    className="cursor-pointer text-2 font-semibold text-taxable-blue bg-transparent border-none p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? <Spinner className="size-4" /> : 'Upload'}
                </button>
                <input ref={inputRef} type="file" hidden accept=".csv,.xlsx,.xls" />
            </div>
            {!canUpload && !disabled && (
                <p className="text-1 text-neutral-400 font-medium">Open a business tax folder to upload.</p>
            )}
        </div>
    );
}
