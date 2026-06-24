'use client';
import React, { ReactNode, useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import Lenis from 'lenis';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import LogoWhite from '@/components/OnboardingLayout/LogoWhite';
import { useFormEntrance } from '@/hooks/useFormEntrance';

interface OnboardingLayoutProps {
    children: ReactNode;
}

const OnboardingLayout = ({ children }: OnboardingLayoutProps) => {
    const leftRef = useRef<HTMLDivElement>(null);
    const rightRef = useFormEntrance<HTMLDivElement>({ duration: 0.6, stagger: 0.04, y: 16 });

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const lenis = new Lenis({ lerp: 0.1 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__lenis = lenis;

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).__lenis = undefined;
        };
    }, []);

    useLayoutEffect(() => {
        if (!leftRef.current) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            gsap.set('[data-animate-left]', { opacity: 1, y: 0, clearProps: 'all' });
            return;
        }

        const ctx = gsap.context(() => {
            gsap.fromTo(
                '[data-animate-left]',
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    stagger: 0.08,
                    ease: 'power3.out',
                    onStart: () => gsap.set('[data-animate-left]', { transition: 'none' }),
                    onComplete: () => gsap.set('[data-animate-left]', { clearProps: 'transition' }),
                }
            );
        }, leftRef);

        return () => ctx.revert();
    }, []);

    return (
        <OnboardingProvider>
            <div className="min-h-screen md:h-screen w-full flex flex-col md:flex-row bg-white md:overflow-hidden">
                {/* Left Panel - Reusable Content */}
                <div ref={leftRef} className="w-full md:w-[45%] lg:w-[40%] bg-taxable-blue p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
                    <div data-animate-left>
                        <LogoWhite />
                    </div>

                    <div className="relative z-10 mt-12 md:mt-0">
                        <h1 data-animate-left className="text-7 font-semibold text-taxable-light mb-4 md:mb-6 leading-[1.1] tracking-[-0.02em]">
                            Start your stress-free tax journey.
                        </h1>
                        <p data-animate-left className="text-neutral-50 text-2 font-medium tracking-[-0.01em]">
                            Join thousands of Nigerians filing smarter in 10 minutes.
                        </p>
                    </div>
                </div>

                {/* Right Panel - Dynamic Content */}
                <div data-lenis-prevent className="w-full md:w-[55%] lg:w-[60%] h-auto md:h-full overflow-y-auto bg-white">
                    <div ref={rightRef} className="min-h-full p-6 md:p-12 lg:p-16 flex flex-col justify-start md:justify-center py-16">
                        {children}
                    </div>
                </div>
            </div>
        </OnboardingProvider>
    );
};

export default OnboardingLayout;
