import type { CreatePayeEmployeeRequest, PayeEmployee, UpdatePayeEmployeeRequest } from '@/types/api';
import type { PayeStaff } from '@/screens/TaxFolders/AddEmployeeDrawer';

export function mapApiEmployeeToPayeStaff(emp: PayeEmployee): PayeStaff {
  const rentAmount = emp.annualRentAmount ?? emp.payroll?.annualRent;
  return {
    id: emp.id,
    firstName: emp.firstName,
    lastName: emp.lastName,
    email: emp.email,
    phone: emp.phone,
    position: emp.jobTitle,
    taxId: emp.jtbTaxId,
    gross: emp.monthlySalary,
    pensionOn: emp.statutoryDeductions?.pension ?? false,
    nhfOn: emp.statutoryDeductions?.nhf ?? false,
    hmoOn: emp.statutoryDeductions?.hmo ?? false,
    annualRentChecked: emp.statutoryDeductions?.annualRent ?? false,
    annualRent: typeof rentAmount === 'number' && rentAmount > 0
      ? rentAmount.toLocaleString('en-US')
      : '',
    payeThisMonth: emp.payroll?.payeThisMonth,
    annualPaye: emp.payroll?.annualPaye,
  };
}

function buildDeductions(staff: PayeStaff) {
  return {
    pension: staff.pensionOn,
    nhf: staff.nhfOn,
    hmo: staff.hmoOn,
    annualRent: staff.annualRentChecked,
  };
}

function rentAmountFromStaff(staff: PayeStaff): number | undefined {
  if (!staff.annualRentChecked) return undefined;
  const amount = Number((staff.annualRent || '').replace(/,/g, '')) || 0;
  return amount > 0 ? amount : undefined;
}

export function mapPayeStaffToCreateRequest(staff: PayeStaff, month: number): CreatePayeEmployeeRequest {
  const annualRentAmount = rentAmountFromStaff(staff);
  return {
    month,
    firstName: staff.firstName,
    lastName: staff.lastName,
    email: staff.email,
    phone: staff.phone,
    jobPosition: staff.position,
    jtbTaxId: staff.taxId,
    monthlySalary: staff.gross,
    deductions: buildDeductions(staff),
    ...(annualRentAmount !== undefined ? { annualRentAmount } : {}),
  };
}

export function mapPayeStaffToUpdateRequest(staff: PayeStaff): UpdatePayeEmployeeRequest {
  const annualRentAmount = rentAmountFromStaff(staff);
  return {
    firstName: staff.firstName,
    lastName: staff.lastName,
    email: staff.email,
    phone: staff.phone,
    jobPosition: staff.position,
    jtbTaxId: staff.taxId,
    monthlySalary: staff.gross,
    deductions: buildDeductions(staff),
    ...(staff.annualRentChecked
      ? { annualRentAmount: annualRentAmount ?? 0 }
      : { annualRentAmount: 0 }),
  };
}

export function validatePayeStaffForApi(staff: PayeStaff): string | null {
  if (staff.annualRentChecked) {
    const amount = Number((staff.annualRent || '').replace(/,/g, '')) || 0;
    if (amount <= 0) {
      return 'Annual rent amount is required when annual rent relief is selected.';
    }
  }
  return null;
}
