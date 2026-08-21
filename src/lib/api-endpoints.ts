export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/proxy';

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
  BUSINESS: {
    COMPANY_INFO: (profileId: string) => `/taxableprofile/business/${profileId}/company-info`,
    PAYE_EMPLOYEES: (profileId: string) => `/taxableprofile/business/${profileId}/paye/employees`,
    PAYE_EMPLOYEES_BULK: (profileId: string) => `/taxableprofile/business/${profileId}/paye/employees/bulk`,
    PAYE_EMPLOYEE: (profileId: string, employeeId: string) =>
      `/taxableprofile/business/${profileId}/paye/employees/${employeeId}`,
    IMPORT: (profileId: string) => `/taxableprofile/business/${profileId}/import`,
    IMPORT_SAMPLE: (type: string) => `/taxableprofile/business/import/samples/${type}`,
    VAT: (profileId: string) => `/taxableprofile/business/${profileId}/vat`,
    VAT_FILE: (profileId: string) => `/taxableprofile/business/${profileId}/vat/file`,
    WHT_DEDUCTIONS: (profileId: string) => `/taxableprofile/business/${profileId}/wht/deductions`,
    WHT_DEDUCTION: (profileId: string, id: string) =>
      `/taxableprofile/business/${profileId}/wht/deductions/${id}`,
    WHT_FILE: (profileId: string) => `/taxableprofile/business/${profileId}/wht/file`,
    WHT_CREDITS: (profileId: string) => `/taxableprofile/business/${profileId}/wht/credits`,
    WHT_CREDIT: (profileId: string, id: string) =>
      `/taxableprofile/business/${profileId}/wht/credits/${id}`,
    CIT: (profileId: string) => `/taxableprofile/business/${profileId}/cit`,
    CIT_FILE: (profileId: string) => `/taxableprofile/business/${profileId}/cit/file`,
    CIT_WHT_CREDITS: (profileId: string) => `/taxableprofile/business/${profileId}/cit/wht-credits`,
    CIT_WHT_CREDIT: (profileId: string, id: string) =>
      `/taxableprofile/business/${profileId}/cit/wht-credits/${id}`,
    CIT_QUARTERLY: (profileId: string) => `/taxableprofile/business/${profileId}/cit/quarterly`,
    CIT_QUARTERLY_PAY: (profileId: string) => `/taxableprofile/business/${profileId}/cit/quarterly/pay`,
    CIT_QUARTERLY_DEFER: (profileId: string) => `/taxableprofile/business/${profileId}/cit/quarterly/defer`,
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
    FILING_LINK: '/paystack/filing/link',
    TAX_AGENT_LINK: '/paystack/tax-agent/link',
    SUBSCRIPTION_LINK: '/paystack/create-link',
    SUBSCRIPTION_STATUS: '/paystack/subscription/status',
    PAYMENTS: (profileId: string) => `/paystack/filing/payments?profileId=${profileId}`,
  },
};