'use client';
import React from 'react';
import { Drawer, DrawerContent, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// ── Primary Button ─────────────────────────────────────────────────
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
      className={`h-12 px-5 bg-taxable-blue text-white font-semibold rounded-xl disabled:bg-neutral-100 disabled:text-neutral-400 whitespace-nowrap text-3 ${className}`}
    >
      {children}
    </button>
  );
}

// ── Secondary Button ───────────────────────────────────────────────
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
      className={`h-12 px-5 border border-neutral-200 bg-white text-neutral-800 font-semibold rounded-xl whitespace-nowrap text-3 ${className}`}
    >
      {children}
    </button>
  );
}

// ── Form Label with tooltip ─────────────────────────────────────────
export function FormLabel({ children, tip }: { children: React.ReactNode; tip: string }) {
  return (
    <label className="block text-2 font-medium text-neutral-700 mb-1">
      {children}
      <div className="relative group inline-flex items-center ml-1">
        <span className="w-3.5 h-3.5 rounded-full bg-neutral-200 text-white flex items-center justify-center text-1 cursor-help font-bold">
          i
        </span>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 text-white text-2 rounded-lg w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-normal pointer-events-none">
          {tip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
        </div>
      </div>
    </label>
  );
}

// ── Upload Container ───────────────────────────────────────────────
interface UploadContainerProps {
  label: string;
  sublabel: string;
  icon?: React.ReactNode;
  onUpload?: () => void;
}

export function UploadContainer({ label, sublabel, icon }: UploadContainerProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-dashed border-neutral-200 bg-neutral-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
          {icon || (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-neutral-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          )}
        </div>
        <div>
          <p className="text-3 font-semibold text-neutral-800">{label}</p>
          <p className="text-2 text-neutral-500 font-medium">{sublabel}</p>
        </div>
      </div>
      <button
        type="button"
        className="h-12 px-4 border border-neutral-200 bg-white rounded-xl text-3 font-semibold text-neutral-800"
      >
        Upload
      </button>
    </div>
  );
}

// ── Filing Sheet (Drawer) ──────────────────────────────────────────
interface FilingSheetProps {
  open: boolean;
  onClose: () => void;
  onFile: () => void;
}

export function FilingSheet({ open, onClose, onFile }: FilingSheetProps) {
  const [selectedOption, setSelectedOption] = React.useState<'taxable_file' | 'accountant_review'>('taxable_file');

  const handleContinue = () => {
    onFile();
    onClose();
  };

  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DrawerContent className="bg-white w-full max-w-full px-4 pb-6">
        <DrawerTitle className="sr-only">Filing Options</DrawerTitle>
        <div className="max-w-[420px] mx-auto w-full pt-6">
          <h2 className="text-7 font-semibold text-taxable-dark text-center mb-8">How do you want to file?</h2>

          <RadioGroup value={selectedOption} onValueChange={(v) => setSelectedOption(v as typeof selectedOption)} className="space-y-3 mb-10">
            <label className="flex items-start gap-3 px-4 py-4 rounded-xl bg-white cursor-pointer">
              <RadioGroupItem value="taxable_file" className="mt-0.5" />
              <div>
                <p className="text-3 font-semibold text-neutral-800">Let Taxable file for you (₦8,000)</p>
                <p className="text-2 text-neutral-500 font-medium mt-0.5">We submit your return directly to FIRS.</p>
              </div>
            </label>
            <label className="flex items-start gap-3 px-4 py-4 rounded-xl bg-white cursor-pointer">
              <RadioGroupItem value="accountant_review" className="mt-0.5" />
              <div>
                <p className="text-3 font-semibold text-neutral-800">Get accountant review first (₦25,000)</p>
                <p className="text-2 text-neutral-500 font-medium mt-0.5">A licensed accountant reviews before filing.</p>
              </div>
            </label>
          </RadioGroup>

          <div className="flex gap-3">
            <DrawerClose asChild>
              <button type="button" onClick={onClose} className="flex-1 h-12 border border-neutral-200 bg-white rounded-xl text-3 font-semibold text-neutral-800">
                Back
              </button>
            </DrawerClose>
            <button type="button" onClick={handleContinue} className="flex-1 h-12 bg-taxable-blue text-white font-semibold rounded-xl text-3">
              Continue
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// ── Month List ─────────────────────────────────────────────────────
interface MonthListProps {
  activeMonth: number;
  setActiveMonth: (month: number) => void;
  filedMonths: Set<number>;
  periodMode: 'monthly' | 'annually';
  setPeriodMode: (mode: 'monthly' | 'annually') => void;
}

export function MonthList({ activeMonth, setActiveMonth, filedMonths, periodMode, setPeriodMode }: MonthListProps) {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="border border-neutral-50 rounded-2xl p-1.5">
      <div className="flex items-center gap-1 mb-4 px-2 pt-1.5">
        <button
          onClick={() => setPeriodMode('monthly')}
          className={`flex-1 h-12 rounded-xl text-3 font-semibold transition-all ${periodMode === 'monthly' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500'}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setPeriodMode('annually')}
          className={`flex-1 h-12 rounded-xl text-3 font-semibold transition-all ${periodMode === 'annually' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500'}`}
        >
          Annually
        </button>
      </div>

      <div className="space-y-0.5 px-1 pb-1.5">
        {MONTHS.map((month, idx) => {
          const isActive = idx === activeMonth;
          const filed = filedMonths.has(idx);
          return (
            <button key={month}
              onClick={() => setActiveMonth(idx)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-left ${isActive ? 'bg-taxable-blue text-white font-semibold' : 'text-neutral-800 font-medium'}`}
            >
              <span className="text-3">{month}</span>
              {filed && (
                <div className="w-4 h-4 rounded bg-green-600 flex items-center justify-center">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* InfoTooltip */}
      <div className="border-t border-neutral-50 px-2 pt-3 pb-2">
        <div className="relative group inline-flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span className="text-2 font-medium text-neutral-400 cursor-default">Filed months show a checkmark</span>
        </div>
      </div>
    </div>
  );
}
