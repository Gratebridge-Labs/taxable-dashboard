'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

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
  params: {
    uploadId: string;
  };
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
  const { uploadId } = params;

  const [session, setSession] = useState<UploadSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const [savingBanks, setSavingBanks] = useState(false);
  const [uploadingFileId, setUploadingFileId] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

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
      } catch (err: any) {
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

  const handleToggleBank = async (bankId: string) => {
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
      } catch (err: any) {
        setUploadMessage(err.message || 'Upload failed. Please try again.');
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full">
        <div className="w-full rounded-3xl bg-white shadow-md border border-gray-100 px-7 py-8">
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
              <div className="mt-0.5">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#E0ECFF] text-[#003787] text-xs font-bold">
                  T
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
              <div className="mt-0.5">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#E6F9F3] text-[#047857] text-xs font-bold">
                  P
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
              <div className="mt-0.5">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#EFF6FF] text-[#1D4ED8] text-xs font-bold">
                  S
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

          {!loadingSession && session && !isExpired && (
            <>
              <section className="mb-5">
                <h2 className="text-[14px] font-semibold text-taxable-dark mb-2">
                  Bank statements
                </h2>
                <p className="text-[12px] text-taxable-gray mb-3">
                  Select the banks you use, then upload your statements for each one. You can
                  choose more than one bank.
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {session.banks.map((bank) => {
                    const isSelected = session.selectedBanks.includes(bank.id);
                    return (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => handleToggleBank(bank.id)}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                          isSelected
                            ? 'bg-[#003787] border-[#003787] text-white'
                            : 'bg-white border-gray-200 text-taxable-dark hover:bg-gray-50'
                        }`}
                        disabled={savingBanks}
                      >
                        {bank.logo && (
                          <span className="relative h-4 w-4 overflow-hidden rounded-full bg-white">
                            <Image
                              src={bank.logo}
                              alt={bank.name}
                              fill
                              sizes="16px"
                              className="object-contain"
                            />
                          </span>
                        )}
                        <span>{bank.name}</span>
                      </button>
                    );
                  })}
                </div>

                {session.selectedBanks.length > 0 && (
                  <div className="space-y-4">
                    {session.selectedBanks.map((bankId) => {
                      const bank = banksById.get(bankId);
                      const existingFiles = existingBankFilesByBankId.get(bankId) || [];

                      return (
                        <div
                          key={bankId}
                          className="rounded-2xl border border-gray-100 bg-[#F9FAFB] px-4 py-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {bank?.logo && (
                                <span className="relative h-6 w-6 overflow-hidden rounded-full bg-white">
                                  <Image
                                    src={bank.logo}
                                    alt={bank.name}
                                    fill
                                    sizes="24px"
                                    className="object-contain"
                                  />
                                </span>
                              )}
                              <p className="text-[13px] font-semibold text-taxable-dark">
                                {bank?.name || bankId}
                              </p>
                            </div>
                            {existingFiles.length > 0 && (
                              <span className="rounded-full bg-[#E6F9F3] px-2 py-0.5 text-[11px] font-semibold text-[#047857]">
                                {existingFiles.length} file
                                {existingFiles.length > 1 ? 's' : ''} uploaded
                              </span>
                            )}
                          </div>

                          <label className="flex cursor-pointer flex-col items-start gap-1 rounded-xl border border-dashed border-gray-300 bg-white px-3 py-3 text-left hover:border-[#003787]">
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
                )}
              </section>

              {session.reliefDocumentStatus && session.reliefDocumentStatus.length > 0 && (
                <section className="mb-4">
                  <h2 className="text-[14px] font-semibold text-taxable-dark mb-2">
                    Relief documents
                  </h2>
                  <p className="text-[12px] text-taxable-gray mb-3">
                    If you claimed any tax reliefs, upload the supporting documents for each
                    one so our team can validate them.
                  </p>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {session.reliefDocumentStatus.map((relief) => {
                      const files =
                        existingReliefFilesByDeductionId.get(relief.deductionId) || [];
                      const uploadKey = `relief-${relief.deductionId}`;

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
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                relief.hasSupportingDocument
                                  ? 'bg-[#E6F9F3] text-[#047857]'
                                  : 'bg-[#FFF7ED] text-[#C05621]'
                              }`}
                            >
                              {relief.hasSupportingDocument
                                ? 'Document on file'
                                : 'Document required'}
                            </span>
                          </div>

                          {files.length > 0 && (
                            <p className="mb-1 text-[11px] font-medium text-taxable-gray">
                              {files.length} file{files.length > 1 ? 's' : ''} uploaded
                            </p>
                          )}

                          <label className="flex cursor-pointer flex-col items-start gap-1 rounded-xl border border-dashed border-gray-300 bg-white px-3 py-3 text-left hover:border-[#003787]">
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
                </section>
              )}

              {uploadMessage && (
                <p className="mt-2 text-center text-[11px] font-medium text-taxable-gray">
                  {uploadMessage}
                </p>
              )}

              {uploadingFileId && (
                <p className="mt-1 text-center text-[11px] text-taxable-gray">
                  Uploading file&hellip; please keep this page open.
                </p>
              )}
            </>
          )}

          <button
            type="button"
            disabled={loadingSession || isExpired}
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#003787] px-4 text-[14px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExpired ? 'Upload link unavailable' : 'Link documents'}
          </button>

          <p className="mt-3 text-center text-[11px] text-taxable-gray leading-relaxed">
            By continuing, you agree that Taxable may securely store and process your
            documents for the purpose of preparing your tax report. You can request deletion
            of your files at any time.
          </p>
        </div>
      </div>
    </div>
  );
}

