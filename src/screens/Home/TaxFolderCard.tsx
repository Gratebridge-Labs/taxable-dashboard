import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

interface TaxFolderCardProps {
    title: string;
    description: string;
    statusText: string;
    isInactive?: boolean;
    onClick?: () => void;
    onDelete?: () => void;
}

export function TaxFolderCard({ title, description, statusText, isInactive = false, onClick, onDelete }: TaxFolderCardProps) {
    return (
        <div
            onClick={onClick}
            className={`group relative ${isInactive ? 'pointer-events-none opacity-80' : 'cursor-pointer'}`}
        >
            <div className="rounded-2xl border border-neutral-100 bg-white p-4 flex flex-col gap-4">
                <Image
                    src="/icons/folder.svg"
                    alt="folder"
                    width={32}
                    height={31}
                />

                <div className="flex flex-col gap-1">
                    <h3 className="text-5 font-semibold text-neutral-800">{title}</h3>
                    <p className="text-2 text-neutral-500 font-medium line-clamp-2">
                        {description}
                    </p>
                </div>

                <Badge variant="secondary" className="w-fit">
                    {statusText}
                </Badge>
            </div>

            {onDelete && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-neutral-400"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                </button>
            )}
        </div>
    );
}
