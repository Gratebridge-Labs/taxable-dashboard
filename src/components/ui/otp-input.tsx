'use client';
import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface OtpInputProps {
  length?: number;
  value?: string[];
  onChange?: (otp: string[]) => void;
  onComplete?: (otp: string) => void;
  error?: string | null;
  containerClassName?: string;
  inputClassName?: string;
}

export function OtpInput({ length = 6, value: externalValue, onChange, onComplete, error, containerClassName, inputClassName }: OtpInputProps) {
    const [internalOtp, setInternalOtp] = useState<string[]>(Array(length).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const otp = externalValue ?? internalOtp;

    const setOtp = useCallback(
      (val: string[]) => {
        if (!externalValue) setInternalOtp(val);
        onChange?.(val);
        if (val.every((d) => d) && onComplete) {
          onComplete(val.join(''));
        }
      },
      [externalValue, onChange, onComplete]
    );

    const handleChange = (index: number, value: string) => {
      if (value.length > 1) value = value[value.length - 1];
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };

    return (
      <div className="flex flex-col gap-3">
        <div className={cn('flex gap-2 md:gap-3 justify-between', containerClassName)}>
          {Array.from({ length }).map((_, index) => (
            <Input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={1}
              value={otp[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={cn(
                'w-12 h-12 md:w-14 md:h-14 text-center text-5 md:text-7 font-bold bg-white px-0',
                inputClassName
              )}
              aria-invalid={!!error || undefined}
            />
          ))}
        </div>
        {error && <p className="text-2 text-red-500 font-medium">{error}</p>}
      </div>
  );
}
