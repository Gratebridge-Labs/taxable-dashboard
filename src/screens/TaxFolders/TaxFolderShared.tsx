'use client';

import React from 'react';
import { Drawer, DrawerContent, DrawerTitle, DrawerClose } from '@/components/ui/drawer';

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-7 font-semibold text-neutral-800 mb-1">{children}</h1>
  );
}

export function DescriptionText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-2 font-medium text-neutral-500 mb-6">{children}</p>
  );
}

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export function PrimaryButton({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`h-10 px-5 bg-taxable-blue text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 whitespace-nowrap text-sm ${className}`}
    >
      {children}
    </button>
  );
}

interface SecondaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function SecondaryButton({ children, onClick, className = '' }: SecondaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 px-5 border border-neutral-200 bg-white text-neutral-800 font-semibold rounded-xl hover:bg-neutral-50 transition-all whitespace-nowrap text-sm ${className}`}
    >
      {children}
    </button>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-2 font-semibold text-neutral-800 mb-3 ${className}`}>
      {children}
    </h3>
  );
}

interface CardContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContainer({ children, className = '' }: CardContainerProps) {
  return (
    <div className={`bg-neutral-50 rounded-3xl p-5 ${className}`}>
      {children}
    </div>
  );
}

interface FormFieldRowProps {
  children: React.ReactNode;
  className?: string;
}

export function FormFieldRow({ children, className = '' }: FormFieldRowProps) {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {children}
    </div>
  );
}

interface FormLabelProps {
  children: React.ReactNode;
  tip?: string;
}

export function FormLabel({ children, tip }: FormLabelProps) {
  return (
    <label className="flex items-center gap-1.5 text-2 font-medium text-neutral-500">
      {children}
      {tip && (
        <div className="relative group inline-block">
          <span className="w-3.5 h-3.5 rounded-full bg-neutral-200 text-white flex items-center justify-center text-[10px] cursor-help font-bold">
            i
          </span>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 text-white text-[11px] rounded-lg w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-normal pointer-events-none">
            {tip}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
          </div>
        </div>
      )}
    </label>
  );
}

interface UploadContainerProps {
  label: string;
  allowedFormats: string;
}

export function UploadContainer({ label, allowedFormats }: UploadContainerProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="text-neutral-500"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <div>
          <p className="text-2 font-semibold text-neutral-800">{label}</p>
          <p className="text-1 text-neutral-400 font-medium">{allowedFormats}</p>
        </div>
      </div>
      <button
        type="button"
        className="h-9 px-4 border border-neutral-200 bg-white rounded-xl text-sm font-semibold text-neutral-800 hover:bg-neutral-50 transition-all"
      >
        Upload
      </button>
    </div>
  );
}

interface FilingSheetProps {
  open: boolean;
  onClose: () => void;
  onFile: () => void;
}

export function FilingSheet({ open, onClose, onFile }: FilingSheetProps) {
  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DrawerContent className="bg-white w-full max-w-full px-4 pb-6">
        <DrawerTitle className="sr-only">Confirm Filing</DrawerTitle>
        <div className="max-w-[420px] mx-auto w-full pt-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="text-6 font-bold text-neutral-800 mb-2">Ready to File</h2>
          <p className="text-2 text-neutral-500 mb-6">
            Double-check all your entries &mdash; once filed, this return is linked to your FIRS record.
          </p>
          <div className="flex gap-3">
            <DrawerClose asChild>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-10 border border-neutral-200 bg-white rounded-xl text-sm font-semibold text-neutral-800 hover:bg-neutral-50 transition-all"
              >
                Go Back
              </button>
            </DrawerClose>
            <button
              type="button"
              onClick={onFile}
              className="flex-1 h-10 bg-taxable-blue text-white font-semibold rounded-xl hover:opacity-90 transition-all text-sm"
            >
              File Now
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

interface MonthListProps {
  activeMonth: number;
  setActiveMonth: (month: number) => void;
  filedMonths: Set<number>;
  periodMode: 'monthly' | 'annually';
  setPeriodMode: (mode: 'monthly' | 'annually') => void;
}

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function MonthList({
  activeMonth,
  setActiveMonth,
  filedMonths,
  periodMode,
  setPeriodMode,
}: MonthListProps) {
  return (
    <div className="w-[200px] flex-shrink-0">
      <div className="bg-neutral-100 rounded-xl p-1 flex mb-4">
        <button
          type="button"
          onClick={() => setPeriodMode('monthly')}
          className={`flex-1 h-8 rounded-lg text-sm font-semibold transition-all ${
            periodMode === 'monthly' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500'
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setPeriodMode('annually')}
          className={`flex-1 h-8 rounded-lg text-sm font-semibold transition-all ${
            periodMode === 'annually' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500'
          }`}
        >
          Annual
        </button>
      </div>

      {periodMode === 'monthly' && (
        <div className="flex flex-col gap-1">
          {MONTHS_SHORT.map((month, i) => {
            const isActive = activeMonth === i;
            const isFiled = filedMonths.has(i);
            return (
              <button
                key={month}
                type="button"
                onClick={() => setActiveMonth(i)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left ${
                  isActive
                    ? 'bg-taxable-blue text-white font-semibold'
                    : 'hover:bg-neutral-50 text-neutral-800 font-medium'
                }`}
              >
                <span className="text-sm">{month}</span>
                {isFiled && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isActive ? 'white' : '#16A34A'}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function InfoTooltip({ tip, children }: { tip?: string; children?: React.ReactNode }) {
  if (!tip) return <>{children}</>;
  return (
    <div className="relative group inline-flex items-center gap-1.5">
      {children}
      <span className="w-3.5 h-3.5 rounded-full bg-neutral-200 text-white flex items-center justify-center text-[10px] cursor-help font-bold">
        i
      </span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 text-white text-[11px] rounded-lg w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-normal pointer-events-none">
        {tip}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
      </div>
    </div>
  );
}
