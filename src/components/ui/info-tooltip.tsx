'use client';

import { InformationFill } from '@mingcute/react';

interface InfoTooltipProps {
  text: string;
  arrow?: boolean;
  className?: string;
}

export function InfoTooltip({ text, arrow, className }: InfoTooltipProps) {
  return (
    <span className={`relative group inline-flex items-center ml-1 align-middle cursor-default ${className ?? ''}`}>
      <InformationFill className="w-3.5 h-3.5" color="#E5E5E5" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-neutral-800 text-white text-1 leading-snug rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 font-medium whitespace-normal">
        {text}
        {arrow && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800" />
        )}
      </div>
    </span>
  );
}
