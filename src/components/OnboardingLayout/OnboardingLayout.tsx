import React, { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
    return (
        <div className="h-screen w-full flex flex-col md:flex-row bg-white font-sans overflow-hidden">
            {/* Left Panel - Reusable Content */}
            <div className="w-full md:w-[45%] lg:w-[40%] bg-taxable-blue p-8 md:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
                <div>
                    <LogoWhite />
                </div>

                <div className="relative z-10 mt-20 md:mt-0">
                    <h1 className="text-4xl md:text-5xl lg:text-5xl font-semibold text-taxable-light mb-6 leading-[1.1] tracking-tight">
                        Start your stress-free tax journey.
                    </h1>
                    <p className="text-taxable-gray text-sm md:text-lg font-medium">
                        Join thousands of Nigerians filing smarter in 10 minutes.
                    </p>
                </div>
            </div>

            {/* Right Panel - Dynamic Content */}
            <div className="w-full md:w-[55%] lg:w-[60%] h-full overflow-y-auto">
                <div className="min-h-full p-6 md:p-8 lg:p-12 flex flex-col justify-start md:justify-center py-12">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default OnboardingLayout;
