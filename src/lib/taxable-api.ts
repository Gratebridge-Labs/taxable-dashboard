import { API_BASE_URL, TAXABLE_ENDPOINTS } from './api-endpoints';
import type {
  Profile,
  ProfileCompleteRequest,
  PersonalInfoRequest,
  AllowedYearsResponse,
  IncomeSourcesResponse,
  IncomeListResponse,
  AddIncomeRequest,
  IncomeResponse,
  IncomeSummaryResponse,
  TaxSummaryResponse,
  CalculateTaxResponse,
  CalculationHistoryResponse,
  CreateProfileOptions,
  BusinessCompanyInfoResponse,
  BusinessCompanyInfoRequest,
  CreatePayeEmployeeRequest,
  UpdatePayeEmployeeRequest,
  PayeEmployeesListResponse,
  PayeEmployeeResponse,
  DeletePayeEmployeeResponse,
  UpsertVatRequest,
  FileVatRequest,
  VatListResponse,
  VatFilingResponse,
  DeleteVatMonthResponse,
  CreateWhtDeductionRequest,
  UpdateWhtDeductionRequest,
  FileWhtMonthRequest,
  WhtDeductionsListResponse,
  WhtDeductionResponse,
  DeleteWhtDeductionResponse,
  FileWhtMonthResponse,
  CreateWhtCreditRequest,
  UpdateWhtCreditRequest,
  WhtCreditsListResponse,
  WhtCreditResponse,
  DeleteWhtCreditResponse,
  UpsertCitRequest,
  FileCitRequest,
  CitFilingResponse,
  FileCitResponse,
  CreateCitWhtCreditRequest,
  UpdateCitWhtCreditRequest,
  CitWhtCreditsListResponse,
  CitWhtCreditResponse,
  DeleteCitWhtCreditResponse,
  CitQuarterlyResponse,
  PayCitQuarterRequest,
  DeferCitQuarterRequest,
  CitQuarterActionResponse,
  CreateSubscriptionLinkRequest,
  CreatePaymentLinkResponse,
  SubscriptionStatusResponse,
  VerifyDeductionRequest,
  DeductionVerificationResponse,
  ProfileListResponse,
  Deduction,
  DeductionListResponse,
  BatchDeductionRequest,
  BatchDeductionResponse,
  UpdateDeductionRequest,
  DeductionResponse,
  DeleteDeductionResponse,
  UploadResponse,
  PaymentLinkResponse,
  PaymentRecordsResponse,
  IncomeDataResponse,
  UpdateIncomeDataRequest,
  UpdateIncomeDataResponse,
} from '@/types/api';

class TaxableApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const text = await response.text();
    let data: Record<string, unknown>;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(text || `Request failed with status ${response.status}`);
    }

    if (data.message === 'Profile not found') {
      return { success: true, data: { profiles: [] }, message: 'Profile not found' } as unknown as T;
    }

    if (!response.ok || !data.success) {
      const errorMessage = String(data.message || '') || `Request failed with status ${response.status}`;
      console.error('[TaxableApi] Request failed:', {
        status: response.status,
        message: data.message,
        errors: data.errors,
      });
      throw new Error(errorMessage);
    }

    return data as T;
  }

  async createProfile(token: string, year: number, profileType: 'Individual' | 'Business', options?: CreateProfileOptions): Promise<Profile> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.PROFILE.CREATE}`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ year, profileType, ...(options ?? {}) }),
    });
    const data = await this.handleResponse<{ success: boolean; data: Profile }>(response);
    return data.data;
  }

  async getBusinessCompanyInfo(token: string, profileId: string): Promise<BusinessCompanyInfoResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.COMPANY_INFO(profileId)}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    return this.handleResponse<BusinessCompanyInfoResponse>(response);
  }

  async updateBusinessCompanyInfo(token: string, profileId: string, data: BusinessCompanyInfoRequest): Promise<BusinessCompanyInfoResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.COMPANY_INFO(profileId)}`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse<BusinessCompanyInfoResponse>(response);
  }

  async listPayeEmployees(
    token: string,
    profileId: string,
    month: number,
    year?: number
  ): Promise<PayeEmployeesListResponse> {
    const params = new URLSearchParams({ month: String(month) });
    if (typeof year === 'number') params.set('year', String(year));
    const response = await fetch(
      `${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.PAYE_EMPLOYEES(profileId)}?${params.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders(token),
      }
    );
    return this.handleResponse<PayeEmployeesListResponse>(response);
  }

  async createPayeEmployee(
    token: string,
    profileId: string,
    data: CreatePayeEmployeeRequest
  ): Promise<PayeEmployeeResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.PAYE_EMPLOYEES(profileId)}`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse<PayeEmployeeResponse>(response);
  }

  async updatePayeEmployee(
    token: string,
    profileId: string,
    employeeId: string,
    data: UpdatePayeEmployeeRequest
  ): Promise<PayeEmployeeResponse> {
    const response = await fetch(
      `${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.PAYE_EMPLOYEE(profileId, employeeId)}`,
      {
        method: 'PUT',
        headers: this.getHeaders(token),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<PayeEmployeeResponse>(response);
  }

  async deletePayeEmployee(
    token: string,
    profileId: string,
    employeeId: string
  ): Promise<DeletePayeEmployeeResponse> {
    const response = await fetch(
      `${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.PAYE_EMPLOYEE(profileId, employeeId)}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(token),
      }
    );
    return this.handleResponse<DeletePayeEmployeeResponse>(response);
  }

  async getVat(
    token: string,
    profileId: string,
    year: number,
    month?: number
  ): Promise<VatListResponse | VatFilingResponse> {
    const params = new URLSearchParams({ year: String(year) });
    if (typeof month === 'number') params.set('month', String(month));
    const response = await fetch(
      `${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.VAT(profileId)}?${params.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders(token),
      }
    );
    return this.handleResponse<VatListResponse | VatFilingResponse>(response);
  }

  async upsertVat(
    token: string,
    profileId: string,
    data: UpsertVatRequest
  ): Promise<VatFilingResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.VAT(profileId)}`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse<VatFilingResponse>(response);
  }

  async fileVat(
    token: string,
    profileId: string,
    data: FileVatRequest
  ): Promise<VatFilingResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.VAT_FILE(profileId)}`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse<VatFilingResponse>(response);
  }

  async deleteVatMonth(
    token: string,
    profileId: string,
    year: number,
    month: number
  ): Promise<DeleteVatMonthResponse> {
    const params = new URLSearchParams({ year: String(year), month: String(month) });
    const response = await fetch(
      `${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.VAT(profileId)}?${params.toString()}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(token),
      }
    );
    return this.handleResponse<DeleteVatMonthResponse>(response);
  }

  async listWhtDeductions(
    token: string,
    profileId: string,
    year: number,
    month: number
  ): Promise<WhtDeductionsListResponse> {
    const params = new URLSearchParams({ year: String(year), month: String(month) });
    const response = await fetch(
      `${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.WHT_DEDUCTIONS(profileId)}?${params.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders(token),
      }
    );
    return this.handleResponse<WhtDeductionsListResponse>(response);
  }

  async createWhtDeduction(
    token: string,
    profileId: string,
    data: CreateWhtDeductionRequest
  ): Promise<WhtDeductionResponse> {
    const response = await fetch(
      `${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.WHT_DEDUCTIONS(profileId)}`,
      {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<WhtDeductionResponse>(response);
  }

  async updateWhtDeduction(
    token: string,
    profileId: string,
    deductionId: string,
    data: UpdateWhtDeductionRequest
  ): Promise<WhtDeductionResponse> {
    const response = await fetch(
      `${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.WHT_DEDUCTION(profileId, deductionId)}`,
      {
        method: 'PUT',
        headers: this.getHeaders(token),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<WhtDeductionResponse>(response);
  }

  async deleteWhtDeduction(
    token: string,
    profileId: string,
    deductionId: string
  ): Promise<DeleteWhtDeductionResponse> {
    const response = await fetch(
      `${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.WHT_DEDUCTION(profileId, deductionId)}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(token),
      }
    );
    return this.handleResponse<DeleteWhtDeductionResponse>(response);
  }

  async fileWhtMonth(
    token: string,
    profileId: string,
    data: FileWhtMonthRequest
  ): Promise<FileWhtMonthResponse> {
    const response = await fetch(
      `${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.WHT_FILE(profileId)}`,
      {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<FileWhtMonthResponse>(response);
  }

  async listWhtCredits(
    token: string,
    profileId: string,
    year: number,
    month?: number
  ): Promise<WhtCreditsListResponse> {
    const params = new URLSearchParams({ year: String(year) });
    if (typeof month === 'number') params.set('month', String(month));
    const response = await fetch(
      `${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.WHT_CREDITS(profileId)}?${params.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders(token),
      }
    );
    return this.handleResponse<WhtCreditsListResponse>(response);
  }

  async createWhtCredit(
    token: string,
    profileId: string,
    data: CreateWhtCreditRequest
  ): Promise<WhtCreditResponse> {
    const response = await fetch(
      `${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.WHT_CREDITS(profileId)}`,
      {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<WhtCreditResponse>(response);
  }

  async updateWhtCredit(
    token: string,
    profileId: string,
    creditId: string,
    data: UpdateWhtCreditRequest
  ): Promise<WhtCreditResponse> {
    const response = await fetch(
      `${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.WHT_CREDIT(profileId, creditId)}`,
      {
        method: 'PUT',
        headers: this.getHeaders(token),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<WhtCreditResponse>(response);
  }

  async deleteWhtCredit(
    token: string,
    profileId: string,
    creditId: string
  ): Promise<DeleteWhtCreditResponse> {
    const response = await fetch(
      `${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.WHT_CREDIT(profileId, creditId)}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(token),
      }
    );
    return this.handleResponse<DeleteWhtCreditResponse>(response);
  }

  async getCit(
    token: string,
    profileId: string,
    year: number
  ): Promise<CitFilingResponse> {
    const params = new URLSearchParams({ year: String(year) });
    const response = await fetch(
      `${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.CIT(profileId)}?${params.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders(token),
      }
    );
    return this.handleResponse<CitFilingResponse>(response);
  }

  async upsertCit(
    token: string,
    profileId: string,
    data: UpsertCitRequest
  ): Promise<CitFilingResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.CIT(profileId)}`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse<CitFilingResponse>(response);
  }

  async fileCit(
    token: string,
    profileId: string,
    data: FileCitRequest
  ): Promise<FileCitResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.CIT_FILE(profileId)}`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse<FileCitResponse>(response);
  }

  async listCitWhtCredits(
    token: string,
    profileId: string,
    year: number
  ): Promise<CitWhtCreditsListResponse> {
    const params = new URLSearchParams({ year: String(year) });
    const response = await fetch(
      `${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.CIT_WHT_CREDITS(profileId)}?${params.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders(token),
      }
    );
    return this.handleResponse<CitWhtCreditsListResponse>(response);
  }

  async createCitWhtCredit(
    token: string,
    profileId: string,
    data: CreateCitWhtCreditRequest
  ): Promise<CitWhtCreditResponse> {
    const response = await fetch(
      `${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.CIT_WHT_CREDITS(profileId)}`,
      {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<CitWhtCreditResponse>(response);
  }

  async updateCitWhtCredit(
    token: string,
    profileId: string,
    creditId: string,
    data: UpdateCitWhtCreditRequest
  ): Promise<CitWhtCreditResponse> {
    const response = await fetch(
      `${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.CIT_WHT_CREDIT(profileId, creditId)}`,
      {
        method: 'PUT',
        headers: this.getHeaders(token),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<CitWhtCreditResponse>(response);
  }

  async deleteCitWhtCredit(
    token: string,
    profileId: string,
    creditId: string
  ): Promise<DeleteCitWhtCreditResponse> {
    const response = await fetch(
      `${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.CIT_WHT_CREDIT(profileId, creditId)}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(token),
      }
    );
    return this.handleResponse<DeleteCitWhtCreditResponse>(response);
  }

  async getCitQuarterly(
    token: string,
    profileId: string,
    year: number
  ): Promise<CitQuarterlyResponse> {
    const params = new URLSearchParams({ year: String(year) });
    const response = await fetch(
      `${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.CIT_QUARTERLY(profileId)}?${params.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders(token),
      }
    );
    return this.handleResponse<CitQuarterlyResponse>(response);
  }

  async payCitQuarter(
    token: string,
    profileId: string,
    data: PayCitQuarterRequest
  ): Promise<CitQuarterActionResponse> {
    const response = await fetch(
      `${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.CIT_QUARTERLY_PAY(profileId)}`,
      {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<CitQuarterActionResponse>(response);
  }

  async deferCitQuarter(
    token: string,
    profileId: string,
    data: DeferCitQuarterRequest
  ): Promise<CitQuarterActionResponse> {
    const response = await fetch(
      `${this.baseUrl}${TAXABLE_ENDPOINTS.BUSINESS.CIT_QUARTERLY_DEFER(profileId)}`,
      {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<CitQuarterActionResponse>(response);
  }

  async getAllowedYears(): Promise<AllowedYearsResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.PROFILE.ALLOWED_YEARS}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<AllowedYearsResponse>(response);
  }

  async getIncomeSources(): Promise<IncomeSourcesResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.PROFILE.INCOME_SOURCES}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<IncomeSourcesResponse>(response);
  }

  async completeProfile(token: string, profileId: string, data: ProfileCompleteRequest): Promise<{ profileId: string; year: number; profileType: string; updatedFields: string[] }> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.PROFILE.COMPLETE(profileId)}`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    const result = await this.handleResponse<{ success: boolean; data: { profileId: string; year: number; profileType: string; updatedFields: string[] } }>(response);
    return result.data;
  }

  async updatePersonalInfo(token: string, profileId: string, data: PersonalInfoRequest): Promise<{ profileId: string; updatedFields: string[]; personalInfo: PersonalInfoRequest }> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.PROFILE.PERSONAL_INFO(profileId)}`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    const result = await this.handleResponse<{ success: boolean; data: { profileId: string; updatedFields: string[]; personalInfo: PersonalInfoRequest } }>(response);
    return result.data;
  }

  async createUploadSession(token: string, profileId: string): Promise<{ uploadId: string; uploadUrl: string; profileId: string; year: number }> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.PROFILE.UPLOAD_SESSION(profileId)}`, {
      method: 'POST',
      headers: this.getHeaders(token),
    });
    const result = await this.handleResponse<{ success: boolean; data: { uploadId: string; uploadUrl: string; profileId: string; year: number } }>(response);
    return result.data;
  }

  async submitProfile(token: string, profileId: string): Promise<{ profileId: string; submitted: boolean; submittedAt: string; status: string }> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.PROFILE.SUBMIT(profileId)}`, {
      method: 'POST',
      headers: this.getHeaders(token),
    });
    const result = await this.handleResponse<{ success: boolean; data: { profileId: string; submitted: boolean; submittedAt: string; status: string } }>(response);
    return result.data;
  }

  async fileTax(token: string, profileId: string): Promise<{ profileId: string; filed: boolean; filedAt: string; status: string; filingStatus: string }> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.PROFILE.FILE(profileId)}`, {
      method: 'POST',
      headers: this.getHeaders(token),
    });
    const result = await this.handleResponse<{ success: boolean; data: { profileId: string; filed: boolean; filedAt: string; status: string; filingStatus: string } }>(response);
    return result.data;
  }

  async getIncomeList(token: string, profileId: string, params?: { year?: number; month?: number; incomeType?: string; category?: string }): Promise<IncomeListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.year) queryParams.set('year', params.year.toString());
    if (params?.month) queryParams.set('month', params.month.toString());
    if (params?.incomeType) queryParams.set('incomeType', params.incomeType);
    if (params?.category) queryParams.set('category', params.category);

    const url = `${this.baseUrl}${TAXABLE_ENDPOINTS.INCOME.LIST(profileId)}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    return this.handleResponse<IncomeListResponse>(response);
  }

  async addIncome(token: string, profileId: string, data: AddIncomeRequest): Promise<IncomeResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.INCOME.ADD(profileId)}`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse<IncomeResponse>(response);
  }

  async updateIncome(token: string, profileId: string, incomeId: string, data: Partial<AddIncomeRequest>): Promise<IncomeResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.INCOME.UPDATE(profileId, incomeId)}`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse<IncomeResponse>(response);
  }

  async deleteIncome(token: string, profileId: string, incomeId: string): Promise<{ success: boolean; message: string; data: { deletedRecord: { id: string; incomeType: string; amount: number; period: { year: number; month: number } } } }> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.INCOME.DELETE(profileId, incomeId)}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });
    return this.handleResponse<{ success: boolean; message: string; data: { deletedRecord: { id: string; incomeType: string; amount: number; period: { year: number; month: number } } } }>(response);
  }

  async getIncomeSummary(token: string, profileId: string): Promise<IncomeSummaryResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.INCOME.SUMMARY(profileId)}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    return this.handleResponse<IncomeSummaryResponse>(response);
  }

  async getTaxSummary(token: string, profileId: string, year?: number): Promise<TaxSummaryResponse> {
    const url = year
      ? `${this.baseUrl}${TAXABLE_ENDPOINTS.CALCULATIONS.SUMMARY(profileId)}?year=${year}`
      : `${this.baseUrl}${TAXABLE_ENDPOINTS.CALCULATIONS.SUMMARY(profileId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    return this.handleResponse<TaxSummaryResponse>(response);
  }

  async calculateTaxPost(token: string, profileId: string, data: { year: number; calculationType: string; month?: number }): Promise<CalculateTaxResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.CALCULATIONS.CALCULATE(profileId)}`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse<CalculateTaxResponse>(response);
  }

  async calculateTaxGet(token: string, profileId: string): Promise<CalculateTaxResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.PROFILE.CALCULATE(profileId)}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    return this.handleResponse<CalculateTaxResponse>(response);
  }

  async calculateTaxByMonth(token: string, profileId: string, month: number): Promise<CalculateTaxResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.PROFILE.CALCULATE(profileId, month)}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    return this.handleResponse<CalculateTaxResponse>(response);
  }

  async getIncomeData(token: string, profileId: string): Promise<IncomeDataResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.INCOME_DATA.GET(profileId)}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    return this.handleResponse<IncomeDataResponse>(response);
  }

  async updateMonthlyIncomeData(token: string, profileId: string, month: number, data: UpdateIncomeDataRequest): Promise<UpdateIncomeDataResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.INCOME_DATA.MONTHLY(profileId, month)}`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse<UpdateIncomeDataResponse>(response);
  }

  async updateAnnualIncomeData(token: string, profileId: string, data: UpdateIncomeDataRequest): Promise<UpdateIncomeDataResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.INCOME_DATA.ANNUAL(profileId)}`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse<UpdateIncomeDataResponse>(response);
  }

  async uploadSimple(token: string, file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.UPLOAD_SIMPLE}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    return this.handleResponse<UploadResponse>(response);
  }

  async getCalculationBreakdown(token: string, profileId: string, year?: number): Promise<CalculateTaxResponse> {
    const url = year
      ? `${this.baseUrl}${TAXABLE_ENDPOINTS.CALCULATIONS.BREAKDOWN(profileId)}?year=${year}`
      : `${this.baseUrl}${TAXABLE_ENDPOINTS.CALCULATIONS.BREAKDOWN(profileId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    return this.handleResponse<CalculateTaxResponse>(response);
  }

  async getCalculationHistory(token: string, profileId: string): Promise<CalculationHistoryResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.CALCULATIONS.HISTORY(profileId)}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    return this.handleResponse<CalculationHistoryResponse>(response);
  }

  async createFilingPaymentLink(token: string, profileId: string, month?: number): Promise<PaymentLinkResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.PAYSTACK.FILING_LINK}`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({
        profileId,
        ...(typeof month === 'number' ? { month } : {}),
      }),
    });
    return this.handleResponse<PaymentLinkResponse>(response);
  }

  async createTaxAgentPaymentLink(token: string, profileId: string): Promise<PaymentLinkResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.PAYSTACK.TAX_AGENT_LINK}`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ profileId }),
    });
    return this.handleResponse<PaymentLinkResponse>(response);
  }

  async getPaymentRecords(token: string, profileId: string): Promise<PaymentRecordsResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.PAYSTACK.PAYMENTS(profileId)}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    return this.handleResponse<PaymentRecordsResponse>(response);
  }

  async createSubscriptionPaymentLink(token: string, data: CreateSubscriptionLinkRequest): Promise<CreatePaymentLinkResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.PAYSTACK.SUBSCRIPTION_LINK}`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse<CreatePaymentLinkResponse>(response);
  }

  async getSubscriptionStatus(token: string): Promise<SubscriptionStatusResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.PAYSTACK.SUBSCRIPTION_STATUS}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    return this.handleResponse<SubscriptionStatusResponse>(response);
  }

  async verifyDeduction(token: string, deductionId: string, data: VerifyDeductionRequest): Promise<DeductionVerificationResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.DEDUCTIONS.VERIFY(deductionId)}`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse<DeductionVerificationResponse>(response);
  }

  async getProfileList(token: string): Promise<ProfileListResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.PROFILE.LIST}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    return this.handleResponse<ProfileListResponse>(response);
  }

  async getProfile(token: string, profileId: string): Promise<Profile> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.PROFILE.GET(profileId)}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    const result = await this.handleResponse<{ success: boolean; data: { profile: Profile } }>(response);
    return result.data.profile;
  }

  async deleteProfile(token: string, profileId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.PROFILE.DELETE(profileId)}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  async getDeductionList(token: string, profileId: string, year?: number): Promise<DeductionListResponse> {
    const url = `${this.baseUrl}${TAXABLE_ENDPOINTS.DEDUCTIONS.LIST(profileId, year)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    const result = await this.handleResponse<Record<string, unknown> & { success: boolean; data?: Deduction[] | Record<string, unknown>; count?: number }>(response);

    if (result?.success && Array.isArray(result.data)) {
      const deductions: Deduction[] = result.data as Deduction[];
      const y = typeof year === 'number' ? year : deductions[0]?.year;
      return {
        success: true,
        data: {
          profileId,
          profileYear: y ?? 0,
          deductions,
          deductionsByYear: {
            [(y ?? 0).toString()]: deductions,
          },
          count: result.count ?? deductions.length,
        },
      } as DeductionListResponse;
    }

    return result as unknown as DeductionListResponse;
  }

  async uploadFile(token: string, profileId: string, file: File, category?: string, description?: string): Promise<UploadResponse> {
    const session = await this.createUploadSession(token, profileId);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadId', session.uploadId);
    if (category) formData.append('category', category);
    if (description) formData.append('description', description);

    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.UPLOAD}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    return this.handleResponse<UploadResponse>(response);
  }

  async batchCreateDeductions(token: string, data: BatchDeductionRequest): Promise<BatchDeductionResponse> {
    const results: Deduction[] = [];

    for (const item of data.deductions) {
      const mappedType =
        item.deductionType === 'rent_relief' ? 'rent_relief'
        : item.deductionType === 'pension' ? 'pension'
        : item.deductionType === 'mortgage_interest' ? 'mortgage'
        : item.deductionType === 'mortgage' ? 'mortgage'
        : item.deductionType === 'nhis' ? 'insurance'
        : item.deductionType === 'insurance' ? 'insurance'
        : item.deductionType === 'health_insurance' ? 'insurance'
        : item.deductionType === 'life_insurance' ? 'insurance'
        : undefined;

      if (!mappedType) {
        throw new Error(`Unsupported deduction type: ${item.deductionType}`);
      }

      const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.DEDUCTIONS.CREATE}`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({
          profileId: data.profileId,
          year: data.year,
          type: mappedType,
          value: item.amount,
          frequency: item.frequency ?? 'annual',
          month: item.month ?? null,
          documentUrl: item.documentUrl
        }),
      });

      const result = await this.handleResponse<{ success: boolean; data: Deduction }>(response);
      if (result.success && result.data) {
        results.push(result.data);
      }
    }

    return {
      success: true,
      message: `${results.length} deduction(s) created successfully`,
      data: {
        profileId: data.profileId,
        profileYear: data.year,
        deductions: results,
        deductionsByYear: {
          [data.year.toString()]: results
        }
      }
    };
  }

  async updateDeduction(token: string, deductionId: string, data: UpdateDeductionRequest): Promise<DeductionResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.DEDUCTIONS.UPDATE(deductionId)}`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse<DeductionResponse>(response);
  }

  async deleteDeduction(token: string, deductionId: string): Promise<DeleteDeductionResponse> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.DEDUCTIONS.DELETE(deductionId)}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });
    return this.handleResponse<DeleteDeductionResponse>(response);
  }
}

export const taxableApi = new TaxableApiService();
export default taxableApi;