# Individual Tax Filing Integration Test Protocol

## 1. Overview
This protocol defines the systematic testing of the end-to-end individual tax filing workflow. It validates the integration between the frontend application and backend services, focusing on data integrity, state management, and error handling.

## 2. Test Phases

### Phase 1: Authentication & Session Management
- **Test 1.1: Token Persistence**: Verify `Bearer` token is correctly retrieved from `UserContext` and attached to all authenticated requests.
- **Test 1.2: Token Refresh**: Verify application handles 401 Unauthorized by attempting a token refresh (if implemented) or redirecting to sign-in.
- **Test 1.3: Secure Headers**: Confirm `Content-Type: application/json` and `Authorization` headers are present in all mutable requests.

### Phase 2: Onboarding & Profile Initialization
- **Test 2.1: Minimal Profile Creation**: POST `/taxableprofile/web/create` with `year` and `profileType: 'individual'`. Verify response includes a valid `profileId`.
- **Test 2.2: Profile Completion**: PUT `/taxableprofile/web/{profileId}/complete` with `primaryIncomeSources` and `filingPreference`. Verify UI transitions to the PIT Details dashboard.
- **Test 2.3: Data Pre-loading**: GET `/taxableprofile/web/{profileId}`. Confirm `primaryIncomeSources` and `filingPreference` match the previously submitted data.

### Phase 3: Income Data Entry (CRUD)
- **Test 3.1: Employment Income**: POST `/taxableprofile/web/{profileId}/income` with `amount`, `bonuses`, `commissions`, and `employerName`. Verify `totalAmount` is calculated correctly in the backend response.
- **Test 3.2: Multi-category Income**: POST `/taxableprofile/web/{profileId}/income` for `Investment` and `Freelance` categories. Confirm data is stored in separate records without overwriting.
- **Test 3.3: Income Update**: PUT `/taxableprofile/web/{profileId}/income/{incomeId}`. Verify `bonuses` and `commissions` are updated and not cleared during the update.
- **Test 3.4: Copy from Last Month**: Trigger `handleCopyLastMonth`. Verify frontend correctly filters `incomeRecords` for the previous month and populates current state.

### Phase 4: Deductions & Statutory Reliefs
- **Test 4.1: Relief Persistence**: POST `/deductions` for `pension`, `health_insurance`, and `mortgage`. Verify 201 Created and correct `deductionType` mapping.
- **Test 4.2: Document Upload**: Trigger `verifyDeduction`. Confirm the `file` and `deductionId` are sent as `multipart/form-data` (or JSON as per backend requirements).
- **Test 4.3: Relief Retrieval**: GET `/deductions?profileId={id}&year={year}`. Verify the UI correctly maps `health_insurance` to "Health Insurance" and `mortgage` to "Mortgage Relief".

### Phase 5: Tax Calculation & Summary
- **Test 5.1: Real-time Summary**: GET `/calculations/{profileId}/summary`. Verify `taxDue`, `estimatedRefund`, and `actions` (e.g., "Book Accountant") are parsed and displayed correctly.
- **Test 5.2: Trigger Calculation**: POST `/calculations/{profileId}/calculate`. Verify backend forces a recalculation and the frontend updates the "Estimated Tax" badge.
- **Test 5.3: Calculation History**: GET `/calculations/{profileId}/history`. Verify historical results are displayed in chronological order.

### Phase 6: Review & Final Submission
- **Test 6.1: Profile Submission**: POST `/taxableprofile/web/{profileId}/submit`. Verify profile status moves to `Review`.
- **Test 6.2: Final Filing**: POST `/taxableprofile/web/{profileId}/file`. Verify profile status moves to `Filed`.
- **Test 6.3: Payment Integration**: POST `/paystack/filing-link`. Verify response includes a valid `authorization_url` and the UI redirects the user.

## 3. Error Handling Protocols
- **Network Failure**: Simulate timeout/offline. Verify user-friendly "Check your internet connection" toast.
- **Validation Errors**: Submit invalid `tin` or negative `amount`. Verify 400 Bad Request triggers appropriate inline error messages.
- **State Integrity**: Ensure data is not lost from UI fields if an API call fails during "Save & Continue".

## 4. Success Criteria
- 100% pass rate on all critical path endpoints (Create -> Income -> Summary -> Submit).
- No data loss during bidirectional mapping (Frontend <-> Backend).
- UI labels and backend types are perfectly synchronized (e.g., "Health Insurance" -> `health_insurance`).
- Authentication tokens are handled securely and consistently.
