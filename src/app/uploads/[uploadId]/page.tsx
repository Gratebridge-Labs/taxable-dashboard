'use client';

import React, { use, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { ShieldCheck, EyeOff, Lock, ChevronDown, Search, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = 'https://api.gettaxable.com/api';

type UploadStatus = 'pending' | 'completed';

type Bank = {
  id: string;
  name: string;
  logo: string | null;
};

type UploadedFile = {
  documentId: string;
  fileUrl: string;
  kind: 'bank_statement' | 'relief';
  bankId?: string;
  deductionId?: string;
  uploadedAt: string;
};

type ReliefDocumentStatusItem = {
  deductionId: string;
  deductionType: string;
  label: string;
  amount: number;
  hasSupportingDocument: boolean;
};

type UploadSession = {
  uploadId: string;
  status: UploadStatus;
  type: string;
  year: number | null;
  profileId: string | null;
  selectedBanks: string[];
  files: UploadedFile[];
  reliefDocumentStatus: ReliefDocumentStatusItem[] | null;
  banks: Bank[];
};

type PageProps = {
  params: Promise<{ uploadId: string }>;
};

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);

  if (!res.ok) {
    const message = `Request failed: ${res.status}`;
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

const allowedFileTypes = '.pdf,.jpg,.jpeg,.png,.gif,.webp';
const maxFileSizeBytes = 20 * 1024 * 1024;

export default function UploadPage({ params }: PageProps) {
  const { uploadId } = use(params);

  const [session, setSession] = useState<UploadSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const [savingBanks, setSavingBanks] = useState(false);
  const [uploadingFileId, setUploadingFileId] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const bankDropdownRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(0);

  const hasReliefStep = Boolean(
    session?.reliefDocumentStatus && session.reliefDocumentStatus.length > 0,
  );

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      setLoadingSession(true);
      setSessionError(null);

      try {
        const data = await fetchJson<{
          success: boolean;
          data: UploadSession;
        }>(`${API_BASE_URL}/uploads/${uploadId}`);

        if (!isMounted) return;

        setSession(data.data);
      } catch (err: unknown) {
        if (!isMounted) return;

        if (err instanceof Error) {
          setSessionError(err.message);
        } else {
          setSessionError('Unable to load upload link. It may have expired.');
        }
      } finally {
        if (isMounted) {
          setLoadingSession(false);
        }
      }
    }

    if (uploadId) {
      loadSession();
    }

    return () => {
      isMounted = false;
    };
  }, [uploadId]);

  const banksById = useMemo(() => {
    const map = new Map<string, Bank>();
    session?.banks.forEach((bank) => {
      map.set(bank.id, bank);
    });
    return map;
  }, [session]);

  const _filteredBanks = useMemo(() => {
    if (!session?.banks) return [];
    const q = bankSearchQuery.trim().toLowerCase();
    if (!q) return session.banks;
    return session.banks.filter((b) => b.name.toLowerCase().includes(q));
  }, [session?.banks, bankSearchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target as Node)) {
        setBankDropdownOpen(false);
      }
    }
    if (bankDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [bankDropdownOpen]);

  const _handleToggleBank = async (bankId: string) => {
    if (!session) return;

    const isSelected = session.selectedBanks.includes(bankId);
    const next = isSelected
      ? session.selectedBanks.filter((id) => id !== bankId)
      : [...session.selectedBanks, bankId];

    setSavingBanks(true);
    setSession((prev) =>
      prev ? { ...prev, selectedBanks: next } : prev,
    );

    try {
      await fetchJson<{ success: boolean; data: { selectedBanks: string[] } }>(
        `${API_BASE_URL}/uploads/${session.uploadId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ selectedBanks: next }),
        },
      );
    } catch {
      // If saving fails, reload the session from the server for consistency.
      try {
        const data = await fetchJson<{
          success: boolean;
          data: UploadSession;
        }>(`${API_BASE_URL}/uploads/${uploadId}`);
        setSession(data.data);
      } catch {
        // Swallow; error will be visible on next interaction.
      }
    } finally {
      setSavingBanks(false);
    }
  };

  const handleUpload = async (
    files: FileList | null,
    kind: 'bank_statement' | 'relief',
    options: { bankId?: string; deductionId?: string },
  ) => {
    if (!session || !files || files.length === 0) return;

    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (file.size > maxFileSizeBytes) {
        setUploadMessage('File is larger than 20MB. Please choose a smaller file.');
        continue;
      }

      setUploadMessage(null);
      const uploadKey = `${kind}-${options.bankId || options.deductionId || ''}-${file.name}`;
      setUploadingFileId(uploadKey);

      try {
        const query = new URLSearchParams({
          uploadId: session.uploadId,
          kind,
        });

        if (options.bankId) query.set('bankId', options.bankId);
        if (options.deductionId) query.set('deductionId', options.deductionId);

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_BASE_URL}/upload?${query.toString()}`, {
          method: 'POST',
          body: formData,
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Upload failed');
        }

        // Refresh session to pull in the new file list.
        const refreshed = await fetchJson<{
          success: boolean;
          data: UploadSession;
        }>(`${API_BASE_URL}/uploads/${session.uploadId}`);

        setSession(refreshed.data);
        setUploadMessage('File uploaded successfully.');
      } catch (err: unknown) {
        setUploadMessage(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      } finally {
        setUploadingFileId(null);
      }
    }
  };

  const existingBankFilesByBankId = useMemo(() => {
    const map = new Map<string, UploadedFile[]>();
    session?.files
      .filter((file) => file.kind === 'bank_statement' && file.bankId)
      .forEach((file) => {
        const key = file.bankId as string;
        const arr = map.get(key) || [];
        arr.push(file);
        map.set(key, arr);
      });
    return map;
  }, [session]);

  const existingReliefFilesByDeductionId = useMemo(() => {
    const map = new Map<string, UploadedFile[]>();
    session?.files
      .filter((file) => file.kind === 'relief' && file.deductionId)
      .forEach((file) => {
        const key = file.deductionId as string;
        const arr = map.get(key) || [];
        arr.push(file);
        map.set(key, arr);
      });
    return map;
  }, [session]);

  const canAddAnotherBank = useMemo(() => {
    if (!session || session.selectedBanks.length === 0) return true;
    const lastBankId = session.selectedBanks[session.selectedBanks.length - 1];
    const files = existingBankFilesByBankId.get(lastBankId) ?? [];
    return files.length >= 1;
  }, [session?.selectedBanks, existingBankFilesByBankId]);

  const step1CanProceed = useMemo(() => {
    if (!session || session.selectedBanks.length === 0) return false;
    return session.selectedBanks.every(
      (id) => (existingBankFilesByBankId.get(id)?.length ?? 0) >= 1,
    );
  }, [session?.selectedBanks, existingBankFilesByBankId]);

  const step2CanProceed = useMemo(() => {
    if (!session?.reliefDocumentStatus?.length) return true;
    return session.reliefDocumentStatus.every(
      (r) => (existingReliefFilesByDeductionId.get(r.deductionId)?.length ?? 0) >= 1,
    );
  }, [session?.reliefDocumentStatus, existingReliefFilesByDeductionId]);

  const banksNotYetAdded = useMemo(() => {
    if (!session?.banks) return [];
    const selected = new Set(session.selectedBanks);
    return session.banks.filter((b) => !selected.has(b.id));
  }, [session?.banks, session?.selectedBanks]);

  const filteredBanksNotYetAdded = useMemo(() => {
    const q = bankSearchQuery.trim().toLowerCase();
    if (!q) return banksNotYetAdded;
    return banksNotYetAdded.filter((b) => b.name.toLowerCase().includes(q));
  }, [banksNotYetAdded, bankSearchQuery]);

  const handleAddBank = async (bankId: string) => {
    if (!session || session.selectedBanks.includes(bankId)) return;
    const next = [...session.selectedBanks, bankId];
    setSavingBanks(true);
    setSession((prev) => (prev ? { ...prev, selectedBanks: next } : prev));
    setBankDropdownOpen(false);
    setBankSearchQuery('');
    try {
      await fetchJson<{ success: boolean; data: { selectedBanks: string[] } }>(
        `${API_BASE_URL}/uploads/${session.uploadId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selectedBanks: next }),
        },
      );
    } catch {
      try {
        const data = await fetchJson<{ success: boolean; data: UploadSession }>(
          `${API_BASE_URL}/uploads/${uploadId}`,
        );
        setSession(data.data);
      } catch {
        /* noop */
      }
    } finally {
      setSavingBanks(false);
    }
  };

  const title = useMemo(() => {
    if (!session) return 'Secure document upload';
    if (session.type === 'bank_statements') return 'Securely upload your bank statements';
    if (session.type === 'relief_documents') return 'Securely upload your relief documents';
    return 'Secure document upload';
  }, [session]);

  const subtitle = useMemo(() => {
    if (!session) {
      return 'Taxable uses this secure upload link so our team can review your documents without accessing your accounts directly.';
    }

    if (session.year) {
      return `Upload documents for your ${session.year} tax filing.`;
    }

    return 'Upload your documents so we can prepare your tax report.';
  }, [session]);

  const isExpired = sessionError !== null;

  const showIntroCard = step === 0 || loadingSession || isExpired;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full">
        <div className="w-full rounded-3xl bg-white shadow-md border border-gray-100 px-7 py-8">
          {/* Full intro (title, Trust/Private/Secure) only on initial card or loading/error */}
          {showIntroCard && (
            <>
              <div className="flex flex-col items-center text-center mb-6">
                <div className="mb-3 flex items-center justify-center gap-2">
                  <Image
                    src="/favicon.svg"
                    alt="Taxable"
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                  <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full bg-[#F3F4FF] text-[#003787] uppercase tracking-wide">
                    TEST MODE
                  </span>
                </div>

                <p className="text-xs font-semibold text-taxable-gray mb-1">
                  Secure upload powered by <span className="text-[#003787]">Taxable</span>
                </p>

                <h1 className="text-[22px] font-bold text-taxable-dark leading-snug mb-2">
                  {title}
                </h1>
                <p className="text-[13px] text-taxable-gray font-medium leading-relaxed">
                  {subtitle}
                </p>
              </div>

              <div className="space-y-3 text-left mb-6">
                <div className="flex gap-3">
                  <div className="mt-0.5 shrink-0">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E0ECFF] text-[#003787]">
                      <ShieldCheck className="h-4 w-4" strokeWidth={2.25} />
                    </span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-taxable-dark mb-0.5">
                      Trust
                    </p>
                    <p className="text-[12px] text-taxable-gray leading-relaxed">
                      Thousands of Nigerians use Taxable to handle their tax documents securely.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-0.5 shrink-0">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E6F9F3] text-[#047857]">
                      <EyeOff className="h-4 w-4" strokeWidth={2.25} />
                    </span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-taxable-dark mb-0.5">
                      Private
                    </p>
                    <p className="text-[12px] text-taxable-gray leading-relaxed">
                      Your files are encrypted and only used to prepare your tax report. We never
                      share them without your consent.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-0.5 shrink-0">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#EFF6FF] text-[#1D4ED8]">
                      <Lock className="h-4 w-4" strokeWidth={2.25} />
                    </span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-taxable-dark mb-0.5">
                      Secure
                    </p>
                    <p className="text-[12px] text-taxable-gray leading-relaxed">
                      Industry-standard AES-256 encryption and strict access controls keep your
                      data safe.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Compact header for step 1 and 2 cards */}
          {!showIntroCard && session && (
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/favicon.svg"
                alt="Taxable"
                width={24}
                height={24}
                className="rounded-full shrink-0"
              />
              <span className="text-[14px] font-semibold text-taxable-dark">Taxable</span>
            </div>
          )}

          {loadingSession && (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-[#F9FAFB] px-4 py-6 text-center text-[13px] text-taxable-gray">
              Loading your secure upload link&hellip;
            </div>
          )}

          {!loadingSession && isExpired && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-5 text-center">
              <p className="text-[13px] font-semibold text-red-700 mb-1">
                This upload link is no longer available.
              </p>
              <p className="text-[12px] text-red-600 leading-relaxed">
                Your session may have expired or the link is invalid. Please contact the person
                who sent you this link to request a new one.
              </p>
            </div>
          )}

          {/* Step 0: Intro card — no bank or relief content */}
          {!loadingSession && session && !isExpired && step === 0 && (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#003787] px-4 text-[14px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
              >
                Link documents
              </button>
              <p className="mt-3 text-center text-[11px] text-taxable-gray leading-relaxed">
                By continuing, you agree that Taxable may securely store and process your
                documents for the purpose of preparing your tax report. You can request deletion
                of your files at any time.
              </p>
            </>
          )}

          {/* Step 1: Bank statements card only */}
          {!loadingSession && session && !isExpired && step === 1 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[12px] text-taxable-gray font-medium">
                  {hasReliefStep ? 'Step 1 of 2' : 'Step 1'}
                </p>
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="text-[12px] font-semibold text-[#003787] hover:underline"
                >
                  Back
                </button>
              </div>
              <h2 className="text-[18px] font-bold text-taxable-dark mb-1">
                Bank statements
              </h2>
              <p className="text-[13px] text-taxable-gray mb-4">
                Select a bank, upload at least one statement, then add another bank if you have more.
              </p>

              <section className="mb-6">
                {session.selectedBanks.length === 0 ? (
                  <div className="relative" ref={bankDropdownRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setBankDropdownOpen((o) => !o);
                        if (!bankDropdownOpen) setBankSearchQuery('');
                      }}
                      className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left shadow-sm hover:border-gray-300 transition-colors"
                    >
                      <span className="text-[13px] text-taxable-dark truncate">
                        Select your bank
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-taxable-gray transition-transform ${bankDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {bankDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                        <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 bg-[#FAFAFA]">
                          <Search className="h-4 w-4 text-taxable-gray shrink-0" />
                          <input
                            type="text"
                            value={bankSearchQuery}
                            onChange={(e) => setBankSearchQuery(e.target.value)}
                            placeholder="Search banks..."
                            className="flex-1 min-w-0 bg-transparent text-[13px] text-taxable-dark placeholder:text-taxable-gray outline-none py-1"
                          />
                        </div>
                        <div className="max-h-56 overflow-y-auto py-1">
                          {filteredBanksNotYetAdded.length === 0 ? (
                            <p className="px-3 py-4 text-[12px] text-taxable-gray text-center">
                              No banks match your search.
                            </p>
                          ) : (
                            filteredBanksNotYetAdded.map((bank) => (
                              <button
                                key={bank.id}
                                type="button"
                                onClick={() => handleAddBank(bank.id)}
                                disabled={savingBanks}
                                className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[#F5F5F5] transition-colors"
                              >
                                {bank.logo ? (
                                  <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full bg-white border border-gray-100">
                                    <Image
                                      src={bank.logo}
                                      alt=""
                                      width={24}
                                      height={24}
                                      className="object-contain"
                                    />
                                  </span>
                                ) : (
                                  <span className="h-6 w-6 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-semibold text-taxable-gray">
                                    {bank.name.charAt(0)}
                                  </span>
                                )}
                                <span className="flex-1 text-[13px] font-medium text-taxable-dark truncate">
                                  {bank.name}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                        <div className="border-t border-gray-100 px-3 py-2 bg-[#FAFAFA]">
                          <button
                            type="button"
                            onClick={() => setBankDropdownOpen(false)}
                            className="w-full rounded-lg border border-gray-200 py-2 text-[12px] font-semibold text-taxable-dark hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {session.selectedBanks.map((bankId) => {
                        const bank = banksById.get(bankId);
                        const existingFiles = existingBankFilesByBankId.get(bankId) || [];
                        const isUploadingThisBank =
                          uploadingFileId?.startsWith(`bank_statement-${bankId}-`) ?? false;

                        return (
                          <div
                            key={bankId}
                            className="rounded-2xl border border-gray-100 bg-[#F9FAFB] px-4 py-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {bank?.logo && (
                                  <span className="relative h-6 w-6 overflow-hidden rounded-full bg-white shrink-0">
                                    <Image
                                      src={bank.logo}
                                      alt=""
                                      width={24}
                                      height={24}
                                      className="object-contain"
                                    />
                                  </span>
                                )}
                                <p className="text-[13px] font-semibold text-taxable-dark">
                                  {bank?.name || bankId}
                                </p>
                              </div>
                              {isUploadingThisBank ? (
                                <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-semibold text-[#1D4ED8]">
                                  Uploading&hellip;
                                </span>
                              ) : existingFiles.length > 0 ? (
                                <span className="rounded-full bg-[#E6F9F3] px-2 py-0.5 text-[11px] font-semibold text-[#047857]">
                                  {existingFiles.length} file
                                  {existingFiles.length > 1 ? 's' : ''} uploaded
                                </span>
                              ) : (
                                <span className="rounded-full bg-[#FFF7ED] px-2 py-0.5 text-[11px] font-semibold text-[#C05621]">
                                  Upload required
                                </span>
                              )}
                            </div>

                            <label className="flex cursor-pointer flex-col items-start gap-1 rounded-xl border border-dashed border-gray-300 bg-white px-3 py-3 text-left hover:border-[#003787] transition-colors">
                              <span className="text-[12px] font-semibold text-taxable-dark">
                                Upload bank statement
                              </span>
                              <span className="text-[11px] text-taxable-gray">
                                PDF or image files, up to 20MB each.
                              </span>
                              <input
                                type="file"
                                multiple
                                accept={allowedFileTypes}
                                className="mt-1 text-[11px]"
                                disabled={isUploadingThisBank}
                                onChange={(event) =>
                                  handleUpload(event.target.files, 'bank_statement', {
                                    bankId,
                                  })
                                }
                              />
                            </label>
                          </div>
                        );
                      })}
                    </div>

                    {canAddAnotherBank ? (
                      <div className="relative mt-4" ref={bankDropdownRef}>
                        <button
                          type="button"
                          onClick={() => {
                            setBankDropdownOpen((o) => !o);
                            if (!bankDropdownOpen) setBankSearchQuery('');
                          }}
                          className="flex w-full items-center justify-between gap-2 rounded-xl border border-dashed border-[#003787] bg-[#F3F4FF] px-3 py-2.5 text-left hover:bg-[#E8EAFF] transition-colors"
                        >
                          <span className="text-[13px] font-semibold text-[#003787]">
                            I have another bank
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-[#003787] transition-transform ${bankDropdownOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {bankDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                            <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 bg-[#FAFAFA]">
                              <Search className="h-4 w-4 text-taxable-gray shrink-0" />
                              <input
                                type="text"
                                value={bankSearchQuery}
                                onChange={(e) => setBankSearchQuery(e.target.value)}
                                placeholder="Search banks..."
                                className="flex-1 min-w-0 bg-transparent text-[13px] text-taxable-dark placeholder:text-taxable-gray outline-none py-1"
                              />
                            </div>
                            <div className="max-h-56 overflow-y-auto py-1">
                              {filteredBanksNotYetAdded.length === 0 ? (
                                <p className="px-3 py-4 text-[12px] text-taxable-gray text-center">
                                  No more banks to add.
                                </p>
                              ) : (
                                filteredBanksNotYetAdded.map((bank) => (
                                  <button
                                    key={bank.id}
                                    type="button"
                                    onClick={() => handleAddBank(bank.id)}
                                    disabled={savingBanks}
                                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[#F5F5F5] transition-colors"
                                  >
                                    {bank.logo ? (
                                      <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full bg-white border border-gray-100">
                                        <Image
                                          src={bank.logo}
                                          alt=""
                                          width={24}
                                          height={24}
                                          className="object-contain"
                                        />
                                      </span>
                                    ) : (
                                      <span className="h-6 w-6 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-semibold text-taxable-gray">
                                        {bank.name.charAt(0)}
                                      </span>
                                    )}
                                    <span className="flex-1 text-[13px] font-medium text-taxable-dark truncate">
                                      {bank.name}
                                    </span>
                                  </button>
                                ))
                              )}
                            </div>
                            <div className="border-t border-gray-100 px-3 py-2 bg-[#FAFAFA]">
                              <button
                                type="button"
                                onClick={() => setBankDropdownOpen(false)}
                                className="w-full rounded-lg border border-gray-200 py-2 text-[12px] font-semibold text-taxable-dark hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="mt-4 text-[12px] text-taxable-gray">
                        Upload at least one statement for{' '}
                        <span className="font-semibold text-taxable-dark">
                          {banksById.get(session.selectedBanks[session.selectedBanks.length - 1])?.name ?? 'your bank'}
                        </span>{' '}
                        to add another bank.
                      </p>
                    )}
                  </>
                )}
              </section>

              {!step1CanProceed && session.selectedBanks.length > 0 && (
                <p className="mb-2 text-[12px] text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                  Upload at least one statement for each bank above before continuing.
                </p>
              )}
              <div className="flex gap-3 mt-6">
                {hasReliefStep ? (
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!step1CanProceed}
                    className="flex-1 inline-flex h-11 items-center justify-center rounded-xl bg-[#003787] px-4 text-[14px] font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!step1CanProceed}
                    className="flex-1 inline-flex h-11 items-center justify-center rounded-xl bg-[#003787] px-4 text-[14px] font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Done
                  </button>
                )}
              </div>
            </>
          )}

          {/* Step 2: Relief documents card only */}
          {!loadingSession && session && !isExpired && step === 2 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[12px] text-taxable-gray font-medium">
                  Step 2 of 2
                </p>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[12px] font-semibold text-[#003787] hover:underline"
                >
                  Back
                </button>
              </div>
              <h2 className="text-[18px] font-bold text-taxable-dark mb-1">
                Relief documents
              </h2>
              <p className="text-[13px] text-taxable-gray mb-4">
                If you claimed tax reliefs, upload supporting documents for each so we can validate them.
              </p>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {(session.reliefDocumentStatus ?? []).map((relief) => {
                      const files =
                        existingReliefFilesByDeductionId.get(relief.deductionId) || [];
                      const uploadKey = `relief-${relief.deductionId}`;

                      const isUploadingThisRelief =
                        uploadingFileId?.startsWith(`relief-${relief.deductionId}-`) ?? false;

                      return (
                        <div
                          key={relief.deductionId}
                          className="rounded-2xl border border-gray-100 bg-[#F9FAFB] px-4 py-3"
                        >
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[13px] font-semibold text-taxable-dark">
                                {relief.label}
                              </p>
                              <p className="text-[11px] text-taxable-gray">
                                {formatAmount(relief.amount)} claimed
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0 ${
                                isUploadingThisRelief
                                  ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                                  : relief.hasSupportingDocument
                                  ? 'bg-[#E6F9F3] text-[#047857]'
                                  : 'bg-[#FFF7ED] text-[#C05621]'
                              }`}
                            >
                              {isUploadingThisRelief
                                ? 'Uploading\u2026'
                                : relief.hasSupportingDocument
                                ? 'Document on file'
                                : 'Document required'}
                            </span>
                          </div>

                          {files.length > 0 && !isUploadingThisRelief && (
                            <p className="mb-1 text-[11px] font-medium text-taxable-gray">
                              {files.length} file{files.length > 1 ? 's' : ''} uploaded
                            </p>
                          )}

                          <label className="flex cursor-pointer flex-col items-start gap-1 rounded-xl border border-dashed border-gray-300 bg-white px-3 py-3 text-left hover:border-[#003787] transition-colors">
                            <span className="text-[12px] font-semibold text-taxable-dark">
                              Upload supporting document
                            </span>
                            <span className="text-[11px] text-taxable-gray">
                              PDF or image files, up to 20MB each.
                            </span>
                            <input
                              key={uploadKey}
                              type="file"
                              multiple
                              accept={allowedFileTypes}
                              className="mt-1 text-[11px]"
                              disabled={isUploadingThisRelief}
                              onChange={(event) =>
                                handleUpload(event.target.files, 'relief', {
                                  deductionId: relief.deductionId,
                                })
                              }
                            />
                          </label>
                        </div>
                      );
                    })}
              </div>

              {!step2CanProceed && (
                <p className="mt-4 mb-2 text-[12px] text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                  Upload at least one supporting document for each relief above before finishing.
                </p>
              )}
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!step2CanProceed}
                className="mt-6 w-full inline-flex h-11 items-center justify-center rounded-xl bg-[#003787] px-4 text-[14px] font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Done
              </button>
            </>
          )}

          {/* Step 3: Success — data collected */}
          {!loadingSession && session && !isExpired && step === 3 && (
            <div className="flex flex-col items-center text-center py-6">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#E6F9F3] text-[#047857] mb-4">
                <CheckCircle2 className="h-10 w-10" strokeWidth={2} />
              </span>
              <h2 className="text-[20px] font-bold text-taxable-dark mb-2">
                Data collected
              </h2>
              <p className="text-[14px] text-taxable-gray font-medium leading-relaxed max-w-[280px] mb-6">
                Your documents have been received. We&apos;ll use them to prepare your tax report. You can close this page.
              </p>
              <a
                href="https://gettaxable.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#003787] px-5 text-[14px] font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Go to gettaxable.com
              </a>
            </div>
          )}

          {(step === 1 || step === 2) && (uploadMessage || uploadingFileId) && (
            <div className="mt-3 text-center">
              {uploadMessage && (
                <p className="text-[11px] font-medium text-taxable-gray">{uploadMessage}</p>
              )}
              {uploadingFileId && (
                <p className="mt-0.5 text-[11px] text-taxable-gray">
                  Uploading file&hellip; please keep this page open.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

