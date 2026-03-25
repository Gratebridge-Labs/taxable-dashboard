export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.gettaxable.com/api';

export const TAXABLE_ENDPOINTS = {
  PROFILE: {
    CREATE: '/taxableprofile/web/create',
    LIST: '/taxableprofile/web',
    GET: (profileId: string) => `/taxableprofile/web/${profileId}`,
    DELETE: (profileId: string) => `/taxableprofile/web/${profileId}`,
    COMPLETE: (profileId: string) => `/taxableprofile/web/${profileId}/complete`,
    PERSONAL_INFO: (profileId: string) => `/taxableprofile/web/${profileId}/personal-info`,
    UPLOAD_SESSION: (profileId: string) => `/taxableprofile/web/${profileId}/upload-session`,
    SUBMIT: (profileId: string) => `/taxableprofile/web/${profileId}/submit`,
    FILE: (profileId: string) => `/taxableprofile/web/${profileId}/file`,
    CALCULATE: (profileId: string, month?: number) => 
      month ? `/taxableprofile/web/${profileId}/calculate?month=${month}` : `/taxableprofile/web/${profileId}/calculate`,
    ALLOWED_YEARS: '/taxableprofile/web/allowed-years',
    INCOME_SOURCES: '/taxableprofile/web/income-sources',
  },
  UPLOAD: '/upload',
  UPLOAD_SIMPLE: '/upload/simple',
  INCOME_DATA: {
    GET: (profileId: string) => `/taxableprofile/web/${profileId}/income-data`,
    MONTHLY: (profileId: string, month: number) => `/taxableprofile/web/${profileId}/income-data/monthly/${month}`,
    ANNUAL: (profileId: string) => `/taxableprofile/web/${profileId}/income-data/annual`,
  },
  INCOME: {
    LIST: (profileId: string) => `/taxableprofile/web/${profileId}/income`,
    ADD: (profileId: string) => `/taxableprofile/web/${profileId}/income`,
    UPDATE: (profileId: string, incomeId: string) => `/taxableprofile/web/${profileId}/income/${incomeId}`,
    DELETE: (profileId: string, incomeId: string) => `/taxableprofile/web/${profileId}/income/${incomeId}`,
    SUMMARY: (profileId: string) => `/taxableprofile/web/${profileId}/income/summary`,
  },
  CALCULATIONS: {
    SUMMARY: (profileId: string) => `/calculations/${profileId}/summary`,
    CALCULATE: (profileId: string) => `/calculations/${profileId}/calculate`,
    BREAKDOWN: (profileId: string) => `/calculations/${profileId}/breakdown`,
    HISTORY: (profileId: string) => `/calculations/${profileId}/history`,
  },
  DEDUCTIONS: {
    LIST: (profileId: string, year?: number) =>
      `/deductions?profileId=${profileId}${year ? `&year=${year}` : ''}`,
    CREATE: '/deductions',
    BATCH: '/deductions/batch',
    UPDATE: (deductionId: string) => `/deductions/${deductionId}`,
    DELETE: (deductionId: string) => `/deductions/${deductionId}`,
    VERIFY: (deductionId: string) => `/deductions/${deductionId}/verify`,
  },
  PAYSTACK: {
    FILING_LINK: (profileId: string, month?: number) => 
      month ? `/paystack/filing/link?profileId=${profileId}&month=${month}` : `/paystack/filing/link?profileId=${profileId}`,
    TAX_AGENT_LINK: '/paystack/tax-agent/link',
    SUBSCRIPTION_LINK: '/paystack/create-link',
    SUBSCRIPTION_STATUS: '/paystack/subscription/status',
    PAYMENTS: (profileId: string) => `/paystack/filing/payments?profileId=${profileId}`,
  },
};