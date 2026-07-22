'use client';
import { ReactLenis } from 'lenis/react';
import { useState, useEffect, startTransition } from 'react';

export function LenisProvider({ children }: { children: React.ReactNode }) {
    const [ready, setReady] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        startTransition(() => {
            setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
            setReady(true);
        });
    }, []);

    if (!ready || reducedMotion) {
        return <>{children}</>;
    }

    return (
        <ReactLenis root options={{ lerp: 0.1, smoothWheel: true }}>
            {children}
        </ReactLenis>
    );
}
