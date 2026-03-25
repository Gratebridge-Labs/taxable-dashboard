'use client';
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxableApi = void 0;
var api_endpoints_1 = require("./api-endpoints");
var TaxableApiService = /** @class */ (function () {
    function TaxableApiService(baseUrl) {
        if (baseUrl === void 0) { baseUrl = api_endpoints_1.API_BASE_URL; }
        this.baseUrl = baseUrl;
    }
    TaxableApiService.prototype.getHeaders = function (token) {
        var headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        if (token) {
            headers['Authorization'] = "Bearer ".concat(token);
        }
        return headers;
    };
    TaxableApiService.prototype.handleResponse = function (response) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('[TaxableApi] Response status:', response.status, response.statusText);
                        return [4 /*yield*/, response.json()];
                    case 1:
                        data = _a.sent();
                        console.log('[TaxableApi] Response data:', data);
                        // For "Profile not found" - treat as empty list, not error
                        if (data.message === 'Profile not found') {
                            console.log('[TaxableApi] No profiles - returning empty list');
                            return [2 /*return*/, { success: true, data: { profiles: [] }, message: 'Profile not found' }];
                        }
                        if (!response.ok || !data.success) {
                            throw new Error(data.message || "Request failed with status ".concat(response.status));
                        }
                        return [2 /*return*/, data];
                }
            });
        });
    };
    TaxableApiService.prototype.createProfile = function (token, year, profileType) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.PROFILE.CREATE), {
                            method: 'POST',
                            headers: this.getHeaders(token),
                            body: JSON.stringify({ year: year, profileType: profileType }),
                        })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, this.handleResponse(response)];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, data.data];
                }
            });
        });
    };
    TaxableApiService.prototype.getAllowedYears = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.PROFILE.ALLOWED_YEARS), {
                            method: 'GET',
                            headers: this.getHeaders(),
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    TaxableApiService.prototype.getIncomeSources = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.PROFILE.INCOME_SOURCES), {
                            method: 'GET',
                            headers: this.getHeaders(),
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    TaxableApiService.prototype.completeProfile = function (token, profileId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.PROFILE.COMPLETE(profileId)), {
                            method: 'PUT',
                            headers: this.getHeaders(token),
                            body: JSON.stringify(data),
                        })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, this.handleResponse(response)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result.data];
                }
            });
        });
    };
    TaxableApiService.prototype.updatePersonalInfo = function (token, profileId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.PROFILE.PERSONAL_INFO(profileId)), {
                            method: 'PUT',
                            headers: this.getHeaders(token),
                            body: JSON.stringify(data),
                        })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, this.handleResponse(response)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result.data];
                }
            });
        });
    };
    TaxableApiService.prototype.createUploadSession = function (token, profileId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.PROFILE.UPLOAD_SESSION(profileId)), {
                            method: 'POST',
                            headers: this.getHeaders(token),
                        })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, this.handleResponse(response)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result.data];
                }
            });
        });
    };
    TaxableApiService.prototype.submitProfile = function (token, profileId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.PROFILE.SUBMIT(profileId)), {
                            method: 'POST',
                            headers: this.getHeaders(token),
                        })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, this.handleResponse(response)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result.data];
                }
            });
        });
    };
    TaxableApiService.prototype.fileTax = function (token, profileId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.PROFILE.FILE(profileId)), {
                            method: 'POST',
                            headers: this.getHeaders(token),
                        })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, this.handleResponse(response)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result.data];
                }
            });
        });
    };
    TaxableApiService.prototype.getIncomeList = function (token, profileId, params) {
        return __awaiter(this, void 0, void 0, function () {
            var queryParams, url, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryParams = new URLSearchParams();
                        if (params === null || params === void 0 ? void 0 : params.year)
                            queryParams.set('year', params.year.toString());
                        if (params === null || params === void 0 ? void 0 : params.month)
                            queryParams.set('month', params.month.toString());
                        if (params === null || params === void 0 ? void 0 : params.incomeType)
                            queryParams.set('incomeType', params.incomeType);
                        if (params === null || params === void 0 ? void 0 : params.category)
                            queryParams.set('category', params.category);
                        url = "".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.INCOME.LIST(profileId)).concat(queryParams.toString() ? '?' + queryParams.toString() : '');
                        return [4 /*yield*/, fetch(url, {
                                method: 'GET',
                                headers: this.getHeaders(token),
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    TaxableApiService.prototype.addIncome = function (token, profileId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.INCOME.ADD(profileId)), {
                            method: 'POST',
                            headers: this.getHeaders(token),
                            body: JSON.stringify(data),
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    TaxableApiService.prototype.updateIncome = function (token, profileId, incomeId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.INCOME.UPDATE(profileId, incomeId)), {
                            method: 'PUT',
                            headers: this.getHeaders(token),
                            body: JSON.stringify(data),
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    TaxableApiService.prototype.deleteIncome = function (token, profileId, incomeId) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.INCOME.DELETE(profileId, incomeId)), {
                            method: 'DELETE',
                            headers: this.getHeaders(token),
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    TaxableApiService.prototype.getIncomeSummary = function (token, profileId) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.INCOME.SUMMARY(profileId)), {
                            method: 'GET',
                            headers: this.getHeaders(token),
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    TaxableApiService.prototype.getTaxSummary = function (token, profileId, year) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = year
                            ? "".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.CALCULATIONS.SUMMARY(profileId), "?year=").concat(year)
                            : "".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.CALCULATIONS.SUMMARY(profileId));
                        return [4 /*yield*/, fetch(url, {
                                method: 'GET',
                                headers: this.getHeaders(token),
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    TaxableApiService.prototype.calculateTaxPost = function (token, profileId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.CALCULATIONS.CALCULATE(profileId)), {
                            method: 'POST',
                            headers: this.getHeaders(token),
                            body: JSON.stringify(data),
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    TaxableApiService.prototype.calculateTaxGet = function (token, profileId) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.PROFILE.CALCULATE(profileId)), {
                            method: 'GET',
                            headers: this.getHeaders(token),
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    TaxableApiService.prototype.getCalculationBreakdown = function (token, profileId, year) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = year
                            ? "".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.CALCULATIONS.BREAKDOWN(profileId), "?year=").concat(year)
                            : "".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.CALCULATIONS.BREAKDOWN(profileId));
                        return [4 /*yield*/, fetch(url, {
                                method: 'GET',
                                headers: this.getHeaders(token),
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    TaxableApiService.prototype.getCalculationHistory = function (token, profileId) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.CALCULATIONS.HISTORY(profileId)), {
                            method: 'GET',
                            headers: this.getHeaders(token),
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    TaxableApiService.prototype.createFilingPaymentLink = function (token, data) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.PAYSTACK.FILING_LINK), {
                            method: 'POST',
                            headers: this.getHeaders(token),
                            body: JSON.stringify(data),
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    TaxableApiService.prototype.createSubscriptionPaymentLink = function (token, data) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.PAYSTACK.SUBSCRIPTION_LINK), {
                            method: 'POST',
                            headers: this.getHeaders(token),
                            body: JSON.stringify(data),
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    TaxableApiService.prototype.getSubscriptionStatus = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.PAYSTACK.SUBSCRIPTION_STATUS), {
                            method: 'GET',
                            headers: this.getHeaders(token),
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    TaxableApiService.prototype.verifyDeduction = function (token, deductionId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.DEDUCTIONS.VERIFY(deductionId)), {
                            method: 'POST',
                            headers: this.getHeaders(token),
                            body: JSON.stringify(data),
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    TaxableApiService.prototype.getProfileList = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('[TaxableApi] getProfileList called');
                        console.log('[TaxableApi] Token:', token ? 'present' : 'MISSING');
                        console.log('[TaxableApi] Full URL:', "".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.PROFILE.LIST));
                        return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.PROFILE.LIST), {
                                method: 'GET',
                                headers: this.getHeaders(token),
                            })];
                    case 1:
                        response = _a.sent();
                        console.log('[TaxableApi] Response status:', response.status);
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    TaxableApiService.prototype.getProfile = function (token, profileId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('[TaxableApi] getProfile called with profileId:', profileId);
                        console.log('[TaxableApi] Full URL:', "".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.PROFILE.GET(profileId)));
                        return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.PROFILE.GET(profileId)), {
                                method: 'GET',
                                headers: this.getHeaders(token),
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, this.handleResponse(response)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result.data];
                }
            });
        });
    };
    TaxableApiService.prototype.deleteProfile = function (token, profileId) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.PROFILE.DELETE(profileId)), {
                            method: 'DELETE',
                            headers: this.getHeaders(token),
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    TaxableApiService.prototype.getDeductionList = function (token, profileId, year) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = year
                            ? "".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.DEDUCTIONS.LIST(profileId), "?year=").concat(year)
                            : "".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.DEDUCTIONS.LIST(profileId));
                        return [4 /*yield*/, fetch(url, {
                                method: 'GET',
                                headers: this.getHeaders(token),
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    TaxableApiService.prototype.createDeduction = function (token, data) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.DEDUCTIONS.CREATE), {
                            method: 'POST',
                            headers: this.getHeaders(token),
                            body: JSON.stringify(data),
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    TaxableApiService.prototype.updateDeduction = function (token, deductionId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.DEDUCTIONS.UPDATE(deductionId)), {
                            method: 'PUT',
                            headers: this.getHeaders(token),
                            body: JSON.stringify(data),
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    TaxableApiService.prototype.deleteDeduction = function (token, deductionId) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(api_endpoints_1.TAXABLE_ENDPOINTS.DEDUCTIONS.DELETE(deductionId)), {
                            method: 'DELETE',
                            headers: this.getHeaders(token),
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    return TaxableApiService;
}());
exports.taxableApi = new TaxableApiService();
exports.default = exports.taxableApi;
