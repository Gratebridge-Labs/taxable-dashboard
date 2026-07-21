'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react';
import { Info } from 'lucide-react';
import { formatNumberWithCommas, stripNumberFormatting } from './PITShared';

// ─── FolderIcon ───────────────────────────────────────────────────────────────
export const FolderIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size * (15 / 17)} viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 1.66667C0 1.22464 0.175595 0.800716 0.488155 0.488155C0.800716 0.175595 1.22464 0 1.66667 0H6.26667C6.51647 3.11647e-05 6.76307 0.0562156 6.98824 0.164399C7.2134 0.272582 7.41137 0.429996 7.5675 0.625L8.73417 2.08333H15C15.442 2.08333 15.8659 2.25893 16.1785 2.57149C16.4911 2.88405 16.6667 3.30797 16.6667 3.75V13.3333C16.6667 13.7754 16.4911 14.1993 16.1785 14.5118C15.8659 14.8244 15.442 15 15 15H1.66667C1.22464 15 0.800716 14.8244 0.488155 14.5118C0.175595 14.1993 0 13.7754 0 13.3333V1.66667Z" fill="url(#paint0_linear_575_957)" />
        <defs>
            <linearGradient id="paint0_linear_575_957" x1="8.33333" y1="0" x2="8.33333" y2="15" gradientUnits="userSpaceOnUse">
                <stop offset="0.341346" stopColor="#FFBE2C" />
                <stop offset="1" stopColor="#DD9900" />
            </linearGradient>
        </defs>
    </svg>
);

// ─── IncomeField ──────────────────────────────────────────────────────────────
export const IncomeField = ({
    label,
    value,
    onChange,
    placeholder = 'N0',
    helpText,
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    helpText?: string;
}) => (
    <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-3 font-medium text-taxable-gray mb-1" style={{ fontFamily: 'Archivo', lineHeight: '20px', letterSpacing: '-0.6%' }}>
            {label}
            {helpText && (
                <div className="relative group">
                    <span className="w-3.5 h-3.5 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center text-1 cursor-help">i</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-800 text-white text-1 rounded-lg w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-normal">
                        {helpText}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800"></div>
                    </div>
                </div>
            )}
        </label>
        <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3 font-medium text-neutral-400">₦</span>
            <input
                type="text"
                value={formatNumberWithCommas(value)}
                onChange={(e) => onChange(stripNumberFormatting(e.target.value))}
                placeholder={placeholder}
                className="w-full h-12 border border-neutral-100 bg-white rounded-2xl pl-8 pr-4 text-3 font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-taxable-blue/10 transition-all placeholder:text-neutral-400/40"
            />
        </div>
    </div>
);

// ─── DeductionItem ────────────────────────────────────────────────────────────
export interface DeductionItemProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    uploadLabel: string;
    onUpload?: (file: File) => Promise<void>;
    status?: 'pending' | 'completed' | 'verified';
    statusMessage?: string;
    fileName?: string;
    onDeleteFile?: () => void;
    helpText?: string;
    uploadHelpText?: string;
}

const InfoTooltip = ({ text }: { text: string }) => (
    <div className="relative group inline-block">
        <span className="w-3.5 h-3.5 rounded-full bg-neutral-200 text-white flex items-center justify-center text-1 cursor-help">i</span>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-800 text-white text-1 rounded-lg w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-normal">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800"></div>
        </div>
    </div>
);

export const DeductionItem = ({
    label,
    value,
    onChange,
    uploadLabel,
    onUpload,
    status,
    statusMessage,
    fileName,
    onDeleteFile = () => {},
    helpText,
    uploadHelpText,
}: DeductionItemProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onUpload) return;
        setUploading(true);
        try {
            await onUpload(file);
        } catch (err: any) {
            throw err;
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="flex items-center gap-1.5 text-3 font-medium text-taxable-gray mb-2" style={{ fontFamily: 'Archivo', lineHeight: '20px', letterSpacing: '-0.6%' }}>
                    {label}
                    {helpText && <InfoTooltip text={helpText} />}
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3 font-medium text-neutral-500">₦</span>
                    <input
                        type="text"
                        value={formatNumberWithCommas(value)}
                        onChange={(e) => onChange(stripNumberFormatting(e.target.value))}
                        placeholder="NG"
                        className="w-full h-12 border border-neutral-100 bg-white rounded-2xl pl-8 pr-4 text-3 font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-taxable-blue/10 transition-all placeholder:text-neutral-300"
                    />
                </div>
            </div>

            <div className="bg-taxable-light rounded-2xl p-4 border border-neutral-100">
                <label className="flex items-center gap-1.5 text-3 font-medium text-taxable-gray mb-4" style={{ fontFamily: 'Archivo', lineHeight: '20px', letterSpacing: '-0.6%' }}>
                    {uploadLabel}
                    {uploadHelpText && <InfoTooltip text={uploadHelpText} />}
                </label>
                <div className="bg-taxable-light border border-neutral-100 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-neutral-400" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <p className="text-2 font-semibold text-neutral-800">{fileName}</p>
                                {status === 'completed' && (
                                    <div className="w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center">
                                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>
                                    </div>
                                )}
                                {status === 'verified' && (
                                    <div className="w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center">
                                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>
                                    </div>
                                )}
                            </div>
                            <p className="text-1 text-neutral-400 font-medium">
                                {status === 'completed' || status === 'verified' ? 'Uploaded • Completed' : 'PDF, JPG, or PNG (Max 20MB)'}
                            </p>
                        </div>
                    </div>
                    {status === 'completed' || status === 'verified' ? (
                        <button onClick={onDeleteFile} className="text-neutral-300 hover:text-destructive transition-colors p-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                        </button>
                    ) : (
                        <>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/pdf,image/jpeg,image/png,image/gif,image/webp"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="h-10 px-5 border border-neutral-100 bg-white rounded-xl text-2 font-semibold text-neutral-800 hover:bg-neutral-50 transition-all disabled:opacity-50"
                            >
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </>
                    )}
                </div>
                {statusMessage && (
                    <p className={`mt-3 text-1 font-semibold leading-relaxed ${status === 'verified' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {statusMessage}
                    </p>
                )}
                {!statusMessage && !fileName?.includes('Required') && (
                    <div className="mt-3 flex items-start gap-1.5 opacity-60">
                        <Info size={12} className="text-neutral-400 flex-shrink-0 mt-0.5" />
                        <p className="text-1 text-neutral-500 font-medium leading-relaxed">
                            Once uploaded, our system will verify your document against NRS records to lock in your tax relief
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
