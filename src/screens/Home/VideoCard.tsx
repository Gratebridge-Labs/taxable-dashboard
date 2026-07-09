import Image from 'next/image';

interface VideoCardProps {
    thumbnail: string;
    title: string;
    duration: string;
}

export function VideoCard({ thumbnail, title, duration }: VideoCardProps) {
    return (
        <div>
            <div className="relative h-[265px] w-full rounded-2xl overflow-hidden mb-4 shadow-xs">
                <Image
                    src={thumbnail}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 text-neutral-800">
                            <path d="M5 3L19 12L5 21V3Z" />
                        </svg>
                    </div>
                </div>
            </div>
            <div className="text-left px-0.5">
                <h3 className="text-4 font-semibold text-neutral-800 mb-1 leading-tight">{title}</h3>
                <p className="text-1 text-neutral-500 font-medium">{duration}</p>
            </div>
        </div>
    );
}
