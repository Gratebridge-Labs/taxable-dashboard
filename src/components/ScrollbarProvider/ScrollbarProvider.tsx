'use client';
import { useEffect } from 'react';
import { OverlayScrollbars } from 'overlayscrollbars';

export function ScrollbarProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const instances: ReturnType<typeof OverlayScrollbars>[] = [];
        const targets = new Set<HTMLElement>();

        const init = (el: HTMLElement) => {
            if (targets.has(el)) return;
            targets.add(el);
            const os = OverlayScrollbars(el, {
                scrollbars: {
                    theme: 'os-theme-taxable',
                    autoHide: 'never',
                    clickScroll: true,
                },
            });
            instances.push(os);
        };

        // Main page scrollbar
        init(document.body);

        // All scrollable drawer/content containers + table wrappers
        document.querySelectorAll<HTMLElement>('[data-lenis-prevent], [data-slot="table-container"]').forEach(init);

        // Watch for dynamically mounted elements (drawers opening, etc.)
        const observer = new MutationObserver(() => {
            document.querySelectorAll<HTMLElement>('[data-lenis-prevent], [data-slot="table-container"]').forEach(init);
        });
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            instances.forEach(os => os.destroy());
            targets.clear();
        };
    }, []);

    return <>{children}</>;
}
