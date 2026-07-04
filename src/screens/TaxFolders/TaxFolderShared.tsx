'use client';
import React from 'react';
import { Drawer, DrawerContent, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { InformationFill } from '@mingcute/react';

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
      className={`h-12 px-5 bg-taxable-blue text-white font-semibold rounded-xl disabled:bg-neutral-100 disabled:text-neutral-400 whitespace-nowrap text-2 ${className}`}
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
      className={`h-12 px-5 border border-neutral-200 bg-white text-neutral-800 font-semibold rounded-xl whitespace-nowrap text-2 ${className}`}
    >
      {children}
    </button>
  );
}

// ── Primary Button Sm ────────────────────────────────────────────────
export function PrimaryButtonSm({ children, onClick, className = '', disabled = false, type = 'button' }: {
  children: React.ReactNode; onClick?: () => void; className?: string; disabled?: boolean; type?: 'button' | 'submit';
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`h-9 px-3.5 bg-taxable-blue text-white font-semibold rounded-lg whitespace-nowrap text-2 disabled:bg-neutral-100 disabled:text-neutral-400 ${className}`}>
      {children}
    </button>
  );
}

// ── Secondary Button Sm ──────────────────────────────────────────────
export function SecondaryButtonSm({ children, onClick, className = '' }: {
  children: React.ReactNode; onClick?: () => void; className?: string;
}) {
  return (
    <button type="button" onClick={onClick}
      className={`h-9 px-3.5 border border-neutral-200 bg-white text-neutral-800 font-semibold rounded-lg whitespace-nowrap text-2 ${className}`}>
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
        <InformationFill className="w-3.5 h-3.5" color="#E5E5E5" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 text-white text-2 rounded-lg w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-normal pointer-events-none">
          {tip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
        </div>
      </div>
    </label>
  );
}

// ── Section Heading ────────────────────────────────────────────────
export function SectionHeading({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-6 font-semibold text-neutral-800 mb-1 ${className}`}>{children}</h2>;
}

// ── Description Text ───────────────────────────────────────────────
export function DescriptionText({ children }: { children: React.ReactNode }) {
  return <p className="text-3 text-neutral-500 font-medium mb-6">{children}</p>;
}

// ── Form Field Row ─────────────────────────────────────────────────
export function FormFieldRow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex items-center gap-4 mb-4 ${className}`}>{children}</div>;
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
          <h2 className="text-5 font-semibold text-neutral-800 text-center mb-8">How do you want to file?</h2>

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
              <button type="button" onClick={onClose} className="flex-1 h-12 border border-neutral-200 bg-white rounded-xl text-2 font-semibold text-neutral-800">
                Back
              </button>
            </DrawerClose>
            <button type="button" onClick={handleContinue} className="flex-1 h-12 bg-taxable-blue text-white font-semibold rounded-xl text-2">
              Continue
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
