import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Simple Icons
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-taxable-dark">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" fill="none" />
    <path d="M9 12h.01" /><path d="M12 12h.01" /><path d="M15 12h.01" /> {/* Placeholder detail */}
    <path d="M8 11h8v5H8z" /> {/* Lock/File ish */}
  </svg>
);
// Adjusting icons to match the image better (generic outlines)
const FileLockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M12 13v4" />
    <path d="M12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /> {/* Lock shape loosely */}
  </svg>
);

const GlobeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const FileCheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M16 13h-4" />
    <path d="M12 17h4" />
    <path d="M10 13H8" />
    <path d="M10 17H8" />
  </svg>
);

const Logo = () => (
  <Link href="/" className="flex items-center">
    <Image
      src="/logo_blue.svg"
      alt="Taxable"
      width={100}
      height={61}
      priority
    />
  </Link>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-taxable-dark font-sans">
      <header className="py-6 px-[52px] flex items-center justify-between w-full">
        <Logo />
        <nav className="flex items-center gap-8">
          <div className="hidden md:flex gap-6 text-lg font-medium text-taxable-gray">
            <Link href="#" className="hover:text-taxable-gray transition-colors">About</Link>
            <Link href="#" className="hover:text-taxable-gray transition-colors">Blog</Link>
          </div>
          <Link href="/signin" className="bg-taxable-beige hover:bg-gray-200 text-taxable-blue font-medium px-5 py-2 rounded-2xl text-lg transition-colors">
            Sign In
          </Link>
        </nav>
      </header>

      <main className="w-full px-[52px] pt-16 md:pt-24 pb-20">
        <section className="max-w-3xl mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-taxable-dark mb-6 leading-none max-w-[558px]">
            The modern standard for Nigerian tax compliance.
          </h1>
          <p className="text-sm md:text-lg font-medium text-taxable-gray mb-8 leading-relaxed max-w-[558px]">
            Drag, drop, and done. Taxable transforms your bank statements into professional, FIRS-compliant tax reports. Built for entrepreneurs who value precision, privacy, and peace of mind.
          </p>
          <button className="bg-taxable-blue hover:opacity-90 text-white font-medium px-8 py-3.5 rounded-lg text-base shadow-lg shadow-taxable-blue/10 transition-transform active:scale-95">
            Get Started Free
          </button>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-10 mb-20 bg-white">
          <div className="flex flex-row items-start gap-4">
            <div className="p-2.5 bg-taxable-light rounded-xl flex-shrink-0">
              <FileLockIcon />
            </div>
            <div>
              <h3 className="font-bold text-taxable-dark mb-1 whitespace-nowrap">Bank-Level Security</h3>
              <p className="text-sm text-taxable-gray leading-relaxed">
                End-to-end encryption for every file.
              </p>
            </div>
          </div>
          <div className="flex flex-row items-start gap-4">
            <div className="p-2.5 bg-taxable-light rounded-xl flex-shrink-0">
              <GlobeIcon />
            </div>
            <div>
              <h3 className="font-bold text-taxable-dark mb-1 whitespace-nowrap">Universal Support</h3>
              <p className="text-sm text-taxable-gray leading-relaxed">
                Compatible with all Nigerian bank exports.
              </p>
            </div>
          </div>
          <div className="flex flex-row items-start gap-4">
            <div className="p-2.5 bg-taxable-light rounded-xl flex-shrink-0">
              <CheckCircleIcon />
            </div>
            <div>
              <h3 className="font-bold text-taxable-dark mb-1 whitespace-nowrap">FIRS-Aligned</h3>
              <p className="text-sm text-taxable-gray leading-relaxed">
                Built on current Nigerian tax regulations.
              </p>
            </div>
          </div>
          <div className="flex flex-row items-start gap-4">
            <div className="p-2.5 bg-taxable-light rounded-xl flex-shrink-0">
              <FileCheckIcon />
            </div>
            <div>
              <h3 className="font-bold text-taxable-dark mb-1 whitespace-nowrap">Audit-Ready</h3>
              <p className="text-sm text-taxable-gray leading-relaxed">
                Professional reports with full audit trails.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full bg-taxable-beige rounded-3xl h-[600px] w-full relative overflow-hidden">
          {/* Placeholder for the big beige area in the design. 
                Could be an image or just a color block as per the design summary provided. 
                The design image shows just a large beige area, effectively a UI placeholder or empty state. */}
        </section>
      </main>
    </div>
  );
}
