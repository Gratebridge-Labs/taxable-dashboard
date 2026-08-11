import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-800 placeholder:text-neutral-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-800 focus-visible:border-neutral-800 transition-colors aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/20 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400 disabled:placeholder:text-neutral-300",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
