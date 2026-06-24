import * as React from "react";
import { cn } from "@/lib/utils";

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-xl border border-neutral-200 bg-white overflow-hidden focus-within:ring-1 focus-within:ring-neutral-800 focus-within:border-neutral-800 transition-colors data-[invalid=true]:border-destructive data-[invalid=true]:focus-within:ring-destructive/20",
      className
    )}
    {...props}
  />
));
InputGroup.displayName = "InputGroup";

const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex-1 h-full min-w-0 bg-transparent px-3 text-sm font-medium text-neutral-800 placeholder:text-neutral-300 focus-visible:outline-none",
      className
    )}
    ref={ref}
    {...props}
  />
));
InputGroupInput.displayName = "InputGroupInput";

type InputGroupTextProps = React.HTMLAttributes<HTMLDivElement>;

const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupTextProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center px-3 text-sm text-neutral-500 bg-white",
        className
      )}
      {...props}
    />
  )
);
InputGroupAddon.displayName = "InputGroupAddon";

const InputGroupButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: "icon-xs" | "icon-sm" | "default" }
>(({ className, size = "default", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-600 transition-colors",
      size === "icon-xs" && "h-7 w-7",
      size === "icon-sm" && "h-8 w-8",
      size === "default" && "h-9 w-9",
      className
    )}
    {...props}
  />
));
InputGroupButton.displayName = "InputGroupButton";

export { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton };
