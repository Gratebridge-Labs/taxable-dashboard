'use client';
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
  CreatePaymentLinkRequest,
  CreatePaymentLinkResponse,
  CreateSubscriptionLinkRequest,
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
    const data = await response.json();
    
    // For "Profile not found" - treat as empty list, not error
    if (data.message === 'Profile not found') {
      return { success: true, data: { profiles: [] }, message: 'Profile not found' } as unknown as T;
    }
    
    if (!response.ok || !data.success) {
      const errorMessage = data.message || `Request failed with status ${response.status}`;
      console.error('[TaxableApi] Request failed:', {
        status: response.status,
        message: data.message,
        errors: data.errors // Some APIs return specific validation errors here
      });
      throw new Error(errorMessage);
    }
    
    return data;
  }

  async createProfile(token: string, year: number, profileType: 'Individual' | 'Business'): Promise<Profile> {
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.PROFILE.CREATE}`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ year, profileType }),
    });
    const data = await this.handleResponse<{ success: boolean; data: Profile }>(response);
    return data.data;
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
    return this.handleResponse<any>(response);
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
    const url = month 
      ? `${this.baseUrl}${TAXABLE_ENDPOINTS.PAYSTACK.FILING_LINK(profileId, month)}`
      : `${this.baseUrl}${TAXABLE_ENDPOINTS.PAYSTACK.FILING_LINK(profileId)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(token),
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
    console.log('[TaxableApi] getProfileList called');
    console.log('[TaxableApi] Token:', token ? 'present' : 'MISSING');
    console.log('[TaxableApi] Full URL:', `${this.baseUrl}${TAXABLE_ENDPOINTS.PROFILE.LIST}`);
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.PROFILE.LIST}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    console.log('[TaxableApi] Response status:', response.status);
    return this.handleResponse<ProfileListResponse>(response);
  }

  async getProfile(token: string, profileId: string): Promise<Profile> {
    console.log('[TaxableApi] getProfile called with profileId:', profileId);
    console.log('[TaxableApi] Full URL:', `${this.baseUrl}${TAXABLE_ENDPOINTS.PROFILE.GET(profileId)}`);
    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.PROFILE.GET(profileId)}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    const result = await this.handleResponse<{ success: boolean; data: { profile: Profile } }>(response);
    console.log('[TaxableApi] getProfile result:', JSON.stringify(result, null, 2));
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
    return this.handleResponse<DeductionListResponse>(response);
  }

  async uploadFile(token: string, profileId: string, file: File, category?: string, description?: string): Promise<UploadResponse> {
    // Step 1: get an uploadId from the upload-session endpoint
    const session = await this.createUploadSession(token, profileId);

    // Step 2: upload the file with the uploadId
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadId', session.uploadId);
    if (category) formData.append('category', category);
    if (description) formData.append('description', description);

    const response = await fetch(`${this.baseUrl}${TAXABLE_ENDPOINTS.UPLOAD}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }, // no Content-Type — browser sets multipart boundary
      body: formData,
    });
    return this.handleResponse<UploadResponse>(response);
  }

  async batchCreateDeductions(token: string, data: BatchDeductionRequest): Promise<BatchDeductionResponse> {
    const results: Deduction[] = [];
    
    // Since the batch endpoint is not available, we loop through individual creations
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