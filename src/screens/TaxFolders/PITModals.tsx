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
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 font-sans">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-[15px] font-extrabold text-[#0C0C0E]">
                                    Switch to {pendingPeriodMode === 'monthly' ? 'Monthly' : 'Annual'} filing?
                                </h3>
                                <p className="mt-1 text-[13px] font-medium text-[#64748B]">
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
                                className="text-[#94A3B8] hover:text-[#0C0C0E]"
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
                                className="h-11 w-full sm:w-auto rounded-xl border border-gray-200 bg-white px-5 text-[13px] font-semibold text-[#0C0C0E] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={switchingFilingPref}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={onConfirmFilingPref}
                                className="h-11 w-full sm:w-auto rounded-xl bg-[#0C0C0E] px-5 text-[13px] font-semibold text-white shadow-sm hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 font-sans">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-[15px] font-extrabold text-[#0C0C0E]">I need help</h3>
                                <p className="mt-1 text-[13px] font-medium text-[#64748B]">
                                    If you’re unsure about your income, deductions, or payment data, you can book a Tax Agent to review your return for you.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (bookingTaxAgent) return;
                                    setHelpModalOpen(false);
                                }}
                                className="text-[#94A3B8] hover:text-[#0C0C0E]"
                                aria-label="Close"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-4 rounded-xl border border-gray-100 bg-[#FAFAFA] px-3 py-3">
                            <p className="text-[12px] font-semibold text-[#0C0C0E]">Cost</p>
                            <p className="mt-0.5 text-[13px] font-extrabold text-[#0C0C0E]">₦30,000</p>
                            <p className="mt-1 text-[12px] font-medium text-[#64748B]">
                                You’ll be redirected to Paystack to complete payment.
                            </p>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setHelpModalOpen(false)}
                                disabled={bookingTaxAgent}
                                className="h-11 w-full sm:w-auto rounded-xl border border-gray-200 bg-white px-5 text-[13px] font-semibold text-[#0C0C0E] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Not now
                            </button>
                            <button
                                type="button"
                                onClick={onBookTaxAgent}
                                disabled={bookingTaxAgent}
                                className="h-11 w-full sm:w-auto rounded-xl bg-[#0C0C0E] px-5 text-[13px] font-semibold text-white shadow-sm hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
