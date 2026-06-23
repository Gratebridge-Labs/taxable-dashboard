'use client';

import React from 'react';

export interface PITModalsProps {
    // Filing Preference Modal
    confirmFilingPrefOpen: boolean;
    setConfirmFilingPrefOpen: (open: boolean) => void;
    pendingPeriodMode: 'monthly' | 'annually' | null;
    setPendingPeriodMode: (mode: 'monthly' | 'annually' | null) => void;
    switchingFilingPref: boolean;
    onConfirmFilingPref: () => Promise<void>;

    // Help Modal
    helpModalOpen: boolean;
    setHelpModalOpen: (open: boolean) => void;
    bookingTaxAgent: boolean;
    onBookTaxAgent: () => Promise<void>;
}

export const PITModals = ({
    confirmFilingPrefOpen,
    setConfirmFilingPrefOpen,
    pendingPeriodMode,
    setPendingPeriodMode,
    switchingFilingPref,
    onConfirmFilingPref,

    helpModalOpen,
    setHelpModalOpen,
    bookingTaxAgent,
    onBookTaxAgent,
}: PITModalsProps) => {
    return (
        <>
            {/* Filing preference confirmation modal */}
            {confirmFilingPrefOpen && pendingPeriodMode && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-3 font-extrabold text-neutral-800">
                                    Switch to {pendingPeriodMode === 'monthly' ? 'Monthly' : 'Annual'} filing?
                                </h3>
                                <p className="mt-1 text-2 font-medium text-slate-500">
                                    This will update your tax profile and change how you enter income/deductions and how tax is calculated.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (switchingFilingPref) return;
                                    setConfirmFilingPrefOpen(false);
                                    setPendingPeriodMode(null);
                                }}
                                className="text-slate-400 hover:text-neutral-800"
                                aria-label="Close"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    if (switchingFilingPref) return;
                                    setConfirmFilingPrefOpen(false);
                                    setPendingPeriodMode(null);
                                }}
                                className="h-11 w-full sm:w-auto rounded-xl border border-neutral-200 bg-white px-5 text-2 font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={switchingFilingPref}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={onConfirmFilingPref}
                                className="h-11 w-full sm:w-auto rounded-xl bg-neutral-800 px-5 text-2 font-semibold text-white shadow-sm hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                disabled={switchingFilingPref}
                            >
                                {switchingFilingPref ? 'Switching…' : `Switch to ${pendingPeriodMode === 'monthly' ? 'Monthly' : 'Annual'}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Help / Tax agent modal */}
            {helpModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-3 font-extrabold text-neutral-800">I need help</h3>
                                <p className="mt-1 text-2 font-medium text-slate-500">
                                    If you’re unsure about your income, deductions, or payment data, you can book a Tax Agent to review your return for you.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (bookingTaxAgent) return;
                                    setHelpModalOpen(false);
                                }}
                                className="text-slate-400 hover:text-neutral-800"
                                aria-label="Close"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-4 rounded-xl border border-neutral-100 bg-taxable-light px-3 py-3">
                            <p className="text-1 font-semibold text-neutral-800">Cost</p>
                            <p className="mt-0.5 text-2 font-extrabold text-neutral-800">₦30,000</p>
                            <p className="mt-1 text-1 font-medium text-slate-500">
                                You’ll be redirected to Paystack to complete payment.
                            </p>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setHelpModalOpen(false)}
                                disabled={bookingTaxAgent}
                                className="h-11 w-full sm:w-auto rounded-xl border border-neutral-200 bg-white px-5 text-2 font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Not now
                            </button>
                            <button
                                type="button"
                                onClick={onBookTaxAgent}
                                disabled={bookingTaxAgent}
                                className="h-11 w-full sm:w-auto rounded-xl bg-neutral-800 px-5 text-2 font-semibold text-white shadow-sm hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {bookingTaxAgent ? 'Generating…' : 'Book a Tax Agent'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
