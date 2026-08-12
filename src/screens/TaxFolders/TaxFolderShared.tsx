'use client';
import React from 'react';
import Image from 'next/image';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { InfoTooltip } from '@/components/ui/info-tooltip';

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
      <InfoTooltip text={tip} arrow />
    </label>
  );
}

// ── Section Heading ────────────────────────────────────────────────
export function SectionHeading({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-5 font-medium text-neutral-800 mb-1 tracking-[-0.02em] font-[family-name:var(--font-merriweather)] ${className}`}>{children}</h2>;
}

// ── Description Text ───────────────────────────────────────────────
export function DescriptionText({ children }: { children: React.ReactNode }) {
  return <p className="text-3 text-neutral-500 font-medium mb-6">{children}</p>;
}

// ── Form Field Row ─────────────────────────────────────────────────
export function FormFieldRow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex items-center gap-4 mb-4 ${className}`}>{children}</div>;
}

// ── Sidebar Item (shared between PIT and BusinessTax) ──────────────
export interface SidebarItemProps {
    label: string;
    active?: boolean;
    completed?: boolean;
    locked?: boolean;
    onClick: () => void;
}

export const SidebarItem = ({
    label, active = false, completed = false, locked = false, onClick
}: SidebarItemProps) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl mb-1 ${active ? 'bg-neutral-100' : ''}`}
    >
        <div className="flex items-center gap-3 text-left">
            <span className={`flex items-center ${locked ? 'opacity-40' : ''}`}>
                <Image src={locked ? '/icons/folder-inactive.svg' : '/icons/folder.svg'} alt="" width={16} height={15} />
            </span>
            <div className="flex items-center gap-2">
                <span className={`text-2 font-medium ${locked ? 'text-neutral-400' : active ? 'text-neutral-800' : 'text-neutral-500'}`}>
                    {label}
                </span>
                {completed && (
                    <div className="w-4 h-4 bg-green-600 rounded flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
        <svg className="w-3.5 h-3.5 flex-shrink-0 text-neutral-500"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    </button>
);

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
        <div className="max-w-[420px] mx-auto w-full pt-6" data-animate>
          <h2 className="text-5 font-medium text-neutral-800 text-center mb-8 tracking-[-0.02em] font-[family-name:var(--font-merriweather)]">How do you want to file?</h2>

          <RadioGroup value={selectedOption} onValueChange={(v) => setSelectedOption(v as typeof selectedOption)} className="space-y-3 mb-10">
            <label className={`flex items-start gap-3 px-4 py-4 rounded-xl cursor-pointer ${selectedOption === 'taxable_file' ? 'bg-neutral-50 border border-neutral-200' : 'bg-white border border-transparent'}`}>
              <RadioGroupItem value="taxable_file" className="mt-0.5" />
              <div>
                <p className="text-3 font-semibold text-neutral-800">Let Taxable file for you (₦8,000)</p>
                <p className="text-1 text-neutral-500 font-medium mt-0.5">We submit your return directly to FIRS.</p>
              </div>
            </label>
            <label className={`flex items-start gap-3 px-4 py-4 rounded-xl cursor-pointer ${selectedOption === 'accountant_review' ? 'bg-neutral-50 border border-neutral-200' : 'bg-white border border-transparent'}`}>
              <RadioGroupItem value="accountant_review" className="mt-0.5" />
              <div>
                <p className="text-3 font-semibold text-neutral-800">Get accountant review first (₦25,000)</p>
                <p className="text-1 text-neutral-500 font-medium mt-0.5">A licensed accountant reviews before filing.</p>
              </div>
            </label>
          </RadioGroup>

          <div className="flex gap-3">
            <SecondaryButton className="flex-1" onClick={onClose}>
              Back
            </SecondaryButton>
            <button type="button" onClick={handleContinue} className="flex-1 h-12 bg-taxable-blue text-white font-semibold rounded-xl text-2">
              Continue
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
