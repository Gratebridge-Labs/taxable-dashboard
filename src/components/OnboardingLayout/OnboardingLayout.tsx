'use client';
import React, { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Lenis from 'lenis';
import { OnboardingProvider } from '@/contexts/OnboardingContext';

const LogoWhite = () => (
    <Link href="/" className="flex items-center">
        <Image
            src="/logo.svg"
            alt="Taxable"
            width={100}
            height={61}
            priority
        />
    </Link>
);

interface OnboardingLayoutProps {
    children: ReactNode;
}

const OnboardingLayout = ({ children }: OnboardingLayoutProps) => {
    useEffect(() => {
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

    return (
        <OnboardingProvider>
            <div className="min-h-screen md:h-screen w-full flex flex-col md:flex-row bg-white md:overflow-hidden">
                {/* Left Panel - Reusable Content */}
                <div className="w-full md:w-[45%] lg:w-[40%] bg-taxable-blue p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
                    <div>
                        <LogoWhite />
                    </div>

                    <div className="relative z-10 mt-12 md:mt-0">
                        <h1 className="text-3xl md:text-5xl lg:text-5xl font-semibold text-taxable-light mb-4 md:mb-6 leading-[1.1] tracking-[-0.02em]">
                            Start your stress-free tax journey.
                        </h1>
                        <p className="text-neutral-50 text-2 font-medium tracking-[-0.01em]">
                            Join thousands of Nigerians filing smarter in 10 minutes.
                        </p>
                    </div>
                </div>

                {/* Right Panel - Dynamic Content */}
                <div data-lenis-prevent className="w-full md:w-[55%] lg:w-[60%] h-auto md:h-full overflow-y-auto bg-white">
                    <div className="min-h-full p-6 md:p-12 lg:p-16 flex flex-col justify-start md:justify-center py-16">
                        {children}
                    </div>
                </div>
            </div>
        </OnboardingProvider>
    );
};

export default OnboardingLayout;
