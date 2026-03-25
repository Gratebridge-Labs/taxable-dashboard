Taxable API Documentation gettaxable.com
Taxable Backend API • For Internal Use Only • Web-Focused Implementation Guide Page 1
Table of Contents
1. Profile Management
1.1 Create Minimal Profile (POST)
1.2 Complete Profile Details (PUT)
1.3 Create Upload Session (POST)
1.4 Submit Profile for Review (POST)
1.5 File Tax / Mark as Filed (POST)
2. Helper Endpoints (Public)
2.1 Get Allowed Years (GET)
2.2 Get Income Sources (GET)
3. Tax Calculation & Summary
3.1 Get Tax Summary (GET)
3.2 Calculate Tax (POST)
3.3 Get Calculation Breakdown (GET)
3.4 Get Calculation History (GET)
4. Payment Flows
4.1 Create Filing Payment Link (POST)
4.2 Create Subscription Payment Link (POST)
4.3 Get Subscription Status (GET)
5. Admin Endpoints
5.1 Approve NIN (PATCH)
5.2 Update Filing Status (PATCH)
5.3 Generate Filing Payment Link — Admin (POST)
6. Profile Lifecycle & Status Flow
7. Payment Flow Logic
8. Error Responses
9. Frontend Implementation Examples
Taxable API Documentation gettaxable.com
Taxable Backend API • For Internal Use Only • Web-Focused Implementation Guide Page 2
Overview
Base URL (Production): https://api.gettaxable.com/api
Base URL (Local Dev): http://localhost:3000/api
All protected endpoints require a valid Bearer JWT token in the Authorization header and the user must have a verified
email address.
Authorization: Bearer <jwt_token>
Content-Type: application/json
Public endpoints (helper endpoints) do not require authentication.
1. Profile Management (Web-Specific)
1.1 Create Minimal Profile
POST /taxableprofile/web/create Create a new tax profile
Request Body:
{
"year": 2026,
"profileType": "Individual"
}
Request Fields:
Field Type Required Description
year Integer Yes Tax year. Allowed: 2025 or 2026 only.
profileType String Yes "Individual" or "Business"
Response (201 Created):
{
"success": true,
"message": "Tax profile created successfully",
"data": {
"profileId": "TP958909103",
"id": "67c9a1b2f3d4e5f6a7b8c9d0",
"year": 2026,
"profileType": "Individual",
"status": "draft",
"filingStatus": "pending_upload",
"createdAt": "2026-03-22T10:30:00.000Z",
"uploadSession": {
"uploadId": "UP123456789",
"uploadUrl": "https://uploads.gettaxable.com/UP123456789"
}
}
}
Taxable API Documentation gettaxable.com
Taxable Backend API • For Internal Use Only • Web-Focused Implementation Guide Page 3
■ The response includes an uploadSession automatically — use uploadUrl for document uploads. Store profileId (e.g.,
TP958909103) — it's required for all subsequent API calls.
1.2 Complete Profile Details
PUT /taxableprofile/web/:profileId/complete Add full profile information
Request Body (all fields optional):
{
"primaryNIN": "12345678901",
"primaryIncomeSources": ["Salary / Employment", "Investment income"],
"residency183Days": true,
"state": "Lagos",
"paysRent": true,
"rentAnnualAmount": 1200000,
"rentMonthlyAmount": 100000,
"hasHealthInsurance": true,
"healthInsuranceAnnualAmount": 240000,
"healthInsuranceMonthlyAmount": 20000,
"hasPension": true,
"pensionAnnualAmount": 600000,
"pensionMonthlyAmount": 50000,
"paysMortgage": false,
"filingPreference": "monthly",
"dob": "1990-01-15",
"street": "123 Main Street",
"city": "Lagos"
}
Key Validation Rules:
Field Type Required Description
primaryNIN String No Exactly 11 digits
filingPreference String No "monthly" or "annual". Year 2025 → "annual" only; 2026 → both allowed
primaryIncomeSources Array No Array of valid income source strings (see /income-sources endpoint)
dob String No ISO date format: YYYY-MM-DD
state String No Nigerian state name
Response (200 OK):
{
"success": true,
"message": "Profile updated successfully",
"data": {
"profileId": "TP958909103",
"year": 2026,
"profileType": "Individual",
"updatedFields": ["primaryNIN", "primaryIncomeSources", "filingPreference"]
}
}
Taxable API Documentation gettaxable.com
Taxable Backend API • For Internal Use Only • Web-Focused Implementation Guide Page 4
■ All optional fields accept null, omitted, or empty string "" (empty strings are automatically converted to null on the backend).
1.3 Create Upload Session
POST /taxableprofile/web/:profileId/upload-session
Generate a new document upload
session
Response (201 Created):
{
"success": true,
"message": "Upload session created",
"data": {
"uploadId": "UP123456789",
"uploadUrl": "https://uploads.gettaxable.com/UP123456789",
"profileId": "TP958909103",
"year": 2026
}
}
Use the uploadUrl for frontend file uploads. Supports PDF, images, and other document types.
1.4 Submit Profile for Review
POST /taxableprofile/web/:profileId/submit Submit profile to tax agent for review
Response (200 OK):
{
"success": true,
"message": "Profile submitted successfully for review",
"data": {
"profileId": "TP958909103",
"submitted": true,
"submittedAt": "2026-03-22T10:35:00.000Z",
"status": "active"
}
}
1.5 File Tax (Mark as Filed)
POST /taxableprofile/web/:profileId/file Mark the tax profile as officially filed
Response (200 OK):
{
"success": true,
"message": "Tax filed successfully",
"data": {
"profileId": "TP958909103",
"filed": true,
"filedAt": "2026-03-22T10:40:00.000Z",
"status": "completed",
"filingStatus": "filed"
}
}
Taxable API Documentation gettaxable.com
Taxable Backend API • For Internal Use Only • Web-Focused Implementation Guide Page 5
2. Helper Endpoints (Public — No Auth Required)
2.1 Get Allowed Years
GET /taxableprofile/web/allowed-years
Returns which tax years are available
for filing
Response (200 OK):
{
"success": true,
"data": {
"allowedYears": [2025, 2026],
"currentYear": 2026,
"note": "Only 2025 and 2026 tax years are available for filing"
}
}
2.2 Get Income Sources
GET /taxableprofile/web/income-sources
Returns the list of valid income source
strings
Response (200 OK):
{
"success": true,
"data": {
"incomeSources": [
"Salary / Employment",
"Business/Self-employment",
"Freelance/Consulting",
"Investment income",
"Rental income",
"Digital Assets/Crypto"
],
"count": 6
}
}
Use these exact strings for the primaryIncomeSources array in profile completion.
Taxable API Documentation gettaxable.com
Taxable Backend API • For Internal Use Only • Web-Focused Implementation Guide Page 6
3. Tax Calculation & Summary
3.1 Get Tax Summary
GET /calculations/:profileId/summary
Full tax summary including breakdown
and next steps
Query Parameters:
Field Type Required Description
year Integer No Override the year used for calculation
Response (200 OK) — key fields:
{
"success": true,
"data": {
"profile": {
"profileId": "TP958909103",
"year": 2026,
"filingStatus": "draft",
"filingPreference": "Monthly",
"nin": "****901",
"taxAuthority": "Lagos Internal Revenue Service",
"deductibles": {
"rent": { "display": "NGN 1,200,000", "annualAmount": 1200000 },
"healthInsurance": { "display": "NGN 240,000", "annualAmount": 240000 },
"pension": { "display": "NGN 600,000", "annualAmount": 600000 },
"mortgage": { "display": "—", "annualAmount": 0 }
}
},
"taxSummary": {
"totalIncome": 8500000,
"totalDeductions": 2040000,
"chargeableIncome": 6460000,
"estimatedAnnualTax": 1292000,
"estimatedMonthlyTax": 107667,
"isRefund": false,
"breakdownAvailable": true
},
"actions": {
"canSubmit": true,
"canPayAccountantReview": true,
"canPayFilingFee": false,
"canFile": false
},
"paymentOptions": [
{ "type": "accountant_review", "amount": 30000, "status": "available" }
]
}
}
Taxable API Documentation gettaxable.com
Taxable Backend API • For Internal Use Only • Web-Focused Implementation Guide Page 7
■ Use the actions object to conditionally show/hide UI buttons — e.g., only show "Pay for Review" button when
canPayAccountantReview: true.
3.2 Calculate Tax
POST /calculations/:profileId/calculate Trigger a fresh tax calculation
{
"year": 2026,
"calculationType": "annual",
"month": 3
}
3.3 Get Calculation Breakdown
GET /calculations/:profileId/breakdown
Detailed breakdown of income,
deductions, and tax
Query Parameters:
Field Type Required Description
year Integer No Tax year to generate breakdown for
3.4 Get Calculation History
GET /calculations/:profileId/history List all past calculations for this profile
{
"success": true,
"data": {
"calculations": [
{
"calculationId": "67c9a1b2f3d4e5f6a7b8c9d1",
"calculationType": "annual",
"period": { "year": 2026, "month": null },
"finalTaxLiability": 1292000,
"isRefund": false,
"status": "draft",
"calculatedAt": "2026-03-22T10:30:00.000Z"
}
]
}
}
Taxable API Documentation gettaxable.com
Taxable Backend API • For Internal Use Only • Web-Focused Implementation Guide Page 8
4. Payment Flows
4.1 Create Filing Payment Link
POST /paystack/filing-link
Generate a Paystack checkout URL for
filing fees
{
"profileId": "TP958909103",
"type": "accountant_review"
}
Payment Types:
type Description
accountant_review — — NGN 30,000 — available when filingStatus is 'draft' or 'submitted'
filing_fee — — NGN 25,000 — available when filingStatus is 'tax_agent_review'
Response (200 OK):
{
"success": true,
"data": {
"authorization_url": "https://checkout.paystack.com/abc123",
"reference": "filing_67c9a1b2..._1742657400000",
"type": "accountant_review",
"amountNaira": 30000
}
}
■ Redirect the user to authorization_url to complete payment. The payment webhook automatically updates the profile
status — no manual polling needed.
4.2 Create Subscription Payment Link
POST /paystack/create-link
Generate a Paystack subscription
checkout URL
{
"plan": "monthly",
"callback_url": "https://dashboard.gettaxable.com/payment-success"
}
plan Amount
monthly — — NGN 4,000 / month
yearly — — NGN 30,000 / year
4.3 Get Subscription Status
GET /paystack/subscription/status
Check if the current user has an active
subscription
Taxable API Documentation gettaxable.com
Taxable Backend API • For Internal Use Only • Web-Focused Implementation Guide Page 9
{
"success": true,
"data": {
"hasActiveSubscription": true,
"activeSubscription": {
"plan": "monthly",
"planName": "Monthly",
"paidAt": "2026-03-01T10:00:00.000Z",
"currentPeriodEnd": "2026-03-31T10:00:00.000Z"
}
}
}
Taxable API Documentation gettaxable.com
Taxable Backend API • For Internal Use Only • Web-Focused Implementation Guide Page 10
5. Admin Endpoints
■ Admin endpoints require elevated admin-level authentication. Not for general frontend use.
5.1 Approve NIN
PATCH /admin/taxable-profiles/:profileId/nin-approval Verify and approve a user's NIN
{ "verified": true, "notes": "NIN verified with BVN match" }
5.2 Update Filing Status (Admin)
PATCH /admin/taxable-profiles/:profileId/filing-statu
s
Manually override the filing status
{ "filingStatus": "tax_agent_review" }
Allowed filingStatus values:
filingStatus Value Meaning
pending_upload Initial state after profile creation
upload_done User has uploaded supporting documents
pending_accountant_payment Awaiting accountant review payment
tax_agent_review Profile is under review by a tax agent
tax_agent_approved Tax agent has approved the profile
pending_filing_payment Awaiting final filing fee payment
filed Tax has been officially filed
5.3 Generate Filing Payment Link (Admin)
POST /admin/taxable-profiles/:profileId/filing-link
Create a payment link on behalf of a
user
{
"userId": "67c9a1b2f3d4e5f6a7b8c9d0",
"type": "accountant_review"
}
Taxable API Documentation gettaxable.com
Taxable Backend API • For Internal Use Only • Web-Focused Implementation Guide Page 11
6. Profile Lifecycle & Status Flow
The standard lifecycle a profile moves through, from creation to filing:
1 CREATE POST /taxableprofile/web/create
2 COMPLETE PUT /taxableprofile/web/:id/complete
3 UPLOAD POST /taxableprofile/web/:id/upload-session
4 SUBMIT POST /taxableprofile/web/:id/submit
5 PAY POST /paystack/filing-link
6 FILE POST /taxableprofile/web/:id/file
Status Transition Flow:
draft (pending_upload)
→ [user uploads docs] → upload_done
→ [user submits] → submitted
→ [pays NGN 30,000] → tax_agent_review
→ [agent approves] → tax_agent_approved
→ [pays NGN 25,000] → pending_filing_payment
→ [filed] → filed (COMPLETED)
Year & Filing Preference Rules:
Year Allowed Preferences Notes
2025 annual only Year has passed — only annual filing allowed
2026 monthly or annual Current year — both filing preferences available
Taxable API Documentation gettaxable.com
Taxable Backend API • For Internal Use Only • Web-Focused Implementation Guide Page 12
7. Payment Flow Logic
Payment Type Amount Available When After Payment
accountant_review NGN 30,000
filingStatus = 'draft' or
'submitted'
Status changes to tax_agent_review
filing_fee NGN 25,000
filingStatus =
'tax_agent_review'
Status changes to filed
Payment Tip: Always redirect the user to authorization_url. After payment, Paystack sends a webhook to the backend,
which automatically updates the profile's filingStatus. You don't need to call any endpoint after payment.
8. Error Responses
All endpoints return a consistent error format. Always check the success field first.
{
"success": false,
"message": "Error description (human-readable)",
"error": "Detailed error message (development environment only)"
}
HTTP Status Meaning
200 Success — request completed
201 Created — new resource created successfully
400 Bad Request — validation error in request body or params
401 Unauthorized — missing or invalid Bearer token
403 Forbidden — email not verified
404 Not Found — profile or resource does not exist
409 Conflict — duplicate profile for this year/type
500 Internal Server Error — something went wrong on the backend
Taxable API Documentation gettaxable.com
Taxable Backend API • For Internal Use Only • Web-Focused Implementation Guide Page 13
9. Frontend Implementation Examples
Complete Onboarding Flow
// 1. Create minimal profile
const createProfile = async (token) => {
const res = await fetch('/api/taxableprofile/web/create', {
method: 'POST',
headers: {
'Authorization': `Bearer ${token}`,
'Content-Type': 'application/json'
},
body: JSON.stringify({ year: 2026, profileType: 'Individual' })
});
const { data } = await res.json();
// data.profileId → store this for all subsequent calls
// data.uploadSession.uploadUrl → use for document upload
return data;
};
// 2. Complete profile details
const completeProfile = async (token, profileId, details) => {
const res = await fetch(`/api/taxableprofile/web/${profileId}/complete`, {
method: 'PUT',
headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
body: JSON.stringify(details)
});
return await res.json();
};
// 3. Get tax summary (and use actions to render UI)
const getTaxSummary = async (token, profileId) => {
const res = await fetch(`/api/calculations/${profileId}/summary`, {
headers: { 'Authorization': `Bearer ${token}` }
});
const { data } = await res.json();
// data.actions.canPayAccountantReview → show 'Pay for Review' button
// data.actions.canFile → show 'File My Tax' button
return data;
};
// 4. Initiate payment
const initiatePayment = async (token, profileId, type) => {
const res = await fetch('/api/paystack/filing-link', {
method: 'POST',
headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
body: JSON.stringify({ profileId, type })
});
const { data } = await res.json();
window.location.href = data.authorization_url; // redirect to Paystack
};
Taxable API Documentation gettaxable.com
Taxable Backend API • For Internal Use Only • Web-Focused Implementation Guide Page 14
Key Reminders for Frontend:
1. Always use profileId (e.g., TP958909103) — not the MongoDB id.
2. Check success: true before accessing data.
3. Use the actions object from the summary endpoint to conditionally render buttons.
4. After Paystack redirect, the webhook updates status — no further API call needed.
[3/23, 12:18 AM] Gratebridge Labs: Phase 2: Personal Info Endpoint

Update Personal Information

PUT /api/taxableprofile/web/:profileId/personal-info
Request Body:

{
  "tin": "1234567890",
  "residencyStatus": "resident",
  "fullName": "John Chukwuma",
  "dateOfBirth": "1990-05-15",
  "streetAddress": "123 Victoria Island",
  "city": "Lagos",
  "state": "Lagos"
}
Response:

{
  "success": true,
  "message": "Personal information updated successfully",
  "data": {
    "profileId": "TP589605302",
    "updatedFields": ["tin", "residencyStatus", "fullName", "dateOfBirth", "streetAddress", "city", "state"],
    "personalInfo": {
      "tin": "1234567890",
      "residencyStatus": "resident",
      "fullName": "John Chukwuma",
      "dateOfBirth": "1990-05-15T00:00:00.000Z",
      "streetAddress": "123 Victoria Island",
      "city": "Lagos",
      "state": "Lagos"
    }
  }
}
Phase 3: Relief Verification Workflow

Verify Deduction

POST /api/deductions/:id/verify
Request Body:

{
  "status": "verified",
  "notes": "Document verified successfully",
  "documentId": "67e1a2b3c4d5e6f7890a1b2d"
}
Response:

{
  "success": true,
  "message": "Deduction verified successfully",
  "data": {
    "deduction": {
      "id": "67e1a2b3c4d5e6f7890a1b2c",
      "deductionType": "rent_relief",
      "amount": 500000,
      "verificationStatus": "verified",
      "verificationNotes": "Document verified successfully",
      "verifiedBy": "67e1a2b3c4d5e6f7890a1b2e",
      "verifiedAt": "2025-01-15T12:30:00Z",
      "documentId": "67e1a2b3c4d5e6f7890a1b2d"
    }
  }
}
[3/23, 12:18 AM] Gratebridge Labs: Phase 5: Enhanced Tax Calculation

Calculate Tax

GET /api/taxableprofile/web/:profileId/calculate
Response:

{
  "success": true,
  "data": {
    "profile": {
      "profileId": "TP589605302",
      "year": 2025,
      "profileType": "Individual",
      "primaryTIN": "1234567890",
      "primaryNIN": "12345678901"
    },
    "calculation": {
      "grossIncome": 8500000,
      "totalDeductions": 1500000,
      "totalReliefs": 2000000,
      "taxableIncome": 7000000,
      "taxBrackets": [
        {"from": 0, "to": 300000, "rate": 0.07, "amount": 21000},
        {"from": 300001, "to": 600000, "rate": 0.11, "amount": 33000},
        {"from": 600001, "to": 1100000, "rate": 0.15, "amount": 75000},
        {"from": 1100001, "to": 1600000, "rate": 0.19, "amount": 95000},
        {"from": 1600001, "to": 3200000, "rate": 0.21, "amount": 336000},
        {"from": 3200001, "to": 7000000, "rate": 0.24, "amount": 912000}
      ],
      "grossTax": 1472000,
      "netTaxPayable": 1472000,
      "calculationDate": "2025-01-15T15:30:00Z"
    },
    "summary": {
      "incomeSources": [
        {"type": "employment", "category": "salary", "amount": 5000000},
        {"type": "freelance", "category": "freelance_fee", "amount": 2000000},
        {"type": "crypto", "category": "crypto", "amount": 1500000}
      ],
      "deductions": [
        {"type": "rent_relief", "amount": 500000, "verificationStatus": "verified"},
        {"type": "pension", "amount": 1000000, "verificationStatus": "pending"}
      ]
    }
  }
}
Phase 1: Income CRUD

1. List Income Records

GET /api/taxableprofile/web/:profileId/income
Query Params: ?year=2025&month=1&incomeType=employment&category=salary

Response:

{
  "success": true,
  "data": {
    "incomeRecords": [
      {
        "_id": "67e1a2b3c4d5e6f7890a1b2c",
        "incomeType": "employment",
        "category": "salary",
        "totalAmount": 5000000,
        "netAmount": 5000000,
        "period": {"year": 2025, "month": 1},
        "employment": {
          "employerName": "Tech Corp",
          "annualGrossSalary": 5000000,
          "bonuses": 500000,
          "commissions": 300000
        }
      }
    ],
    "summary": {
      "totalRecords": 1,
      "totalAmount": 5000000,
      "totalNetAmount": 5000000,
      "averageAmount": 5000000
    }
  }
}
2. Add Income Record

POST /api/taxableprofile/web/:profileId/income
Request Body (Employment Example):

{
  "type": "employment",
  "category": "salary",
  "amount": 5000000,
  "month": 1,
  "year": 2025,
  "employerName": "Tech Corp",
  "employerTIN": "1234567890",
  "bonuses": 500000,
  "commissions": 300000
}
Request Body (Freelance Example):

{
  "type": "freelance",
  "category": "freelance_fee",
  "amount": 2000000,
  "month": 1,
  "year": 2025,
  "clientName": "Client Inc",
  "freelanceFees": 2000000,
  "royalties": 500000
}
Request Body (Crypto Example):

{
  "type": "crypto",
  "category": "crypto",
  "amount": 1500000,
  "platformName": "Binance",
  "cryptoType": "Bitcoin",
  "amountInNGN": 1500000
}
Response:

{
  "success": true,
  "message": "Income record added successfully",
  "data": {
    "incomeRecord": {
      "id": "67e1a2b3c4d5e6f7890a1b2c",
      "incomeType": "employment",
      "category": "salary",
      "amount": 5000000,
      "netAmount": 5000000,
      "period": {"year": 2025, "month": 1},
      "createdAt": "2025-01-15T10:30:00Z"
    }
  }
}
3. Update Income Record

PUT /api/taxableprofile/web/:profileId/income/:incomeId
Request Body:

{
  "amount": 5500000,
  "employment.bonuses": 600000,
  "month": 2
}
Response:

{
  "success": true,
  "message": "Income record updated successfully",
  "data": {
    "incomeRecord": {
      "id": "67e1a2b3c4d5e6f7890a1b2c",
      "incomeType": "employment",
      "category": "salary",
      "amount": 5500000,
      "netAmount": 5500000,
      "period": {"year": 2025, "month": 2},
      "updatedAt": "2025-01-15T11:30:00Z"
    }
  }
}
4. Delete Income Record

DELETE /api/taxableprofile/web/:profileId/income/:incomeId
Response:

{
  "success": true,
  "message": "Income record deleted successfully",
  "data": {
    "deletedRecord": {
      "id": "67e1a2b3c4d5e6f7890a1b2c",
      "incomeType": "employment",
      "amount": 5000000,
      "period": {"year": 2025, "month": 1}
    }
  }
}
5. Get Income Summary

GET /api/taxableprofile/web/:profileId/income/summary
Response:

{
  "success": true,
  "data": {
    "summary": {
      "totalRecords": 3,
      "totalAmount": 8500000,
      "totalNetAmount": 8500000,
      "averageAmount": 2833333,
      "byType": {
        "employment": {"count": 1, "totalAmount": 5000000},
        "freelance": {"count": 1, "totalAmount": 2000000},
        "crypto": {"count": 1, "totalAmount": 1500000}
      }
    },
    "monthlyBreakdown": [
      {"month": 1, "year": 2025, "totalAmount": 8500000, "count": 3}
    ]
  }
}

// 1. List all profiles
GET /api/taxableprofile/web
Authorization: Bearer <token>

// 2. Get single profile
GET /api/taxableprofile/web/profile_123
Authorization: Bearer <token>

// 3. List deductions by profile (with year filter)
GET /api/deductions/profile_123?year=2025
Authorization: Bearer <token>

// 4. Create deduction
POST /api/deductions
Authorization: Bearer <token>
Body: {
  "profileId": "profile_123",
  "year": 2025,
  "deductionType": "rent_relief",
  "amount": 500000
}

// 5. Update deduction
PUT /api/deductions/507f1f77bcf86cd799439011
Authorization: Bearer <token>
Body: { "amount": 600000 }

// 6. Delete deduction
DELETE /api/deductions/507f1f77bcf86cd799439011
Authorization: Bearer <token>