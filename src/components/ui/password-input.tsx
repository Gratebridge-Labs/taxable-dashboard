'use client';
import React, { useState } from 'react';
import { Eye, EyeOff, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, hint, error, className, containerClassName, ...props }, ref) => {
    const [show, setShow] = useState(false);

    return (
      <div className={cn('flex flex-col gap-1 w-full', containerClassName)}>
        {label && <Label htmlFor={props.id} className="tracking-[-0.01em]">{label}</Label>}
        <InputGroup data-invalid={!!error || undefined}>
          <InputGroupInput
            ref={ref}
            type={show ? 'text' : 'password'}
            aria-invalid={!!error || undefined}
            className={className}
            {...props}
          />
          <InputGroupAddon>
            <InputGroupButton
              size="icon-xs"
              type="button"
              onClick={() => setShow(!show)}
              tabIndex={-1}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        {hint && (
          <div className="flex items-center gap-1.5 mt-1">
            <Info size={14} className="text-neutral-400 shrink-0" />
            <span className="text-2 text-neutral-400 font-medium">{hint}</span>
          </div>
        )}
        {error && (
          <p className="text-2 text-red-500 font-medium">{error}</p>
        )}
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
