'use client';
import React, { useState, useEffect, startTransition } from 'react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PrimaryButton, SecondaryButton } from '@/screens/TaxFolders/TaxFolderShared';
import { InformationFill } from '@mingcute/react';

// ── Hint Icon ──────────────────────────────────────────────────────────
const HintIcon = ({ tip }: { tip: string }) => (
    <span className="relative group inline-flex items-center ml-1 align-middle cursor-default">
        <InformationFill className="w-3.5 h-3.5" color="#E5E5E5" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-neutral-800 text-white text-1 leading-snug rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40 font-medium">
            {tip}
        </div>
    </span>
);

export interface PayeStaff {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
    taxId: string;
    gross: number;
    pensionOn: boolean;
    nhfOn: boolean;
    hmoOn: boolean;
    annualRent: string;
    annualRentChecked: boolean;
}

interface AddEmployeeDrawerProps {
    open: boolean;
    onClose: () => void;
    onAdd: (staff: PayeStaff) => void;
    editStaff?: PayeStaff | null;
    onRemove?: (staff: PayeStaff) => void;
    onSave?: (staff: PayeStaff) => void;
}

export function AddEmployeeDrawer({ open, onClose, onAdd, editStaff, onRemove, onSave }: AddEmployeeDrawerProps) {
    const isViewMode = !!editStaff;
    const [isEditing, setIsEditing] = useState(false);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [position, setPosition] = useState('');
    const [taxId, setTaxId] = useState('');
    const [gross, setGross] = useState('');
    const [pensionOn, setPensionOn] = useState(false);
    const [nhfOn, setNhfOn] = useState(false);
    const [hmoOn, setHmoOn] = useState(false);
    const [annualRent, setAnnualRent] = useState('');
    const [annualRentChecked, setAnnualRentChecked] = useState(false);

    useEffect(() => {
        startTransition(() => {
            if (editStaff) {
                setFirstName(editStaff.firstName);
                setLastName(editStaff.lastName);
                setEmail(editStaff.email);
                setPhone(editStaff.phone);
                setPosition(editStaff.position);
                setTaxId(editStaff.taxId);
                setGross(editStaff.gross.toLocaleString('en-US'));
                setPensionOn(editStaff.pensionOn);
                setNhfOn(editStaff.nhfOn);
                setHmoOn(editStaff.hmoOn);
                setAnnualRent(editStaff.annualRent);
                setAnnualRentChecked(editStaff.annualRentChecked);
            } else if (open) {
                setFirstName(''); setLastName(''); setEmail(''); setPhone('');
                setPosition(''); setTaxId(''); setGross('');
                setPensionOn(false); setNhfOn(false); setHmoOn(false);
                setAnnualRent(''); setAnnualRentChecked(false);
            }
            setIsEditing(false);
            setShowRemoveConfirm(false);
        });
    }, [editStaff, open]);

    const isValid = firstName && lastName && email && phone && position && taxId && gross;
    const _readOnly = isViewMode && !isEditing;

    const headerTitle = isViewMode
        ? isEditing ? `${firstName} ${lastName}` : 'Employee Details'
        : 'Add Employee';

    const handleAdd = () => {
        if (!isValid || isViewMode) return;
        onAdd({
            id: crypto.randomUUID(),
            firstName, lastName, email, phone, position, taxId,
            gross: Number(gross.replace(/,/g, '')),
            pensionOn, nhfOn, hmoOn, annualRent, annualRentChecked,
        });
        onClose();
    };

    const handleSave = () => {
        if (!isValid || !editStaff || !onSave) return;
        onSave({
            id: editStaff.id,
            firstName, lastName, email, phone, position, taxId,
            gross: Number(gross.replace(/,/g, '')),
            pensionOn, nhfOn, hmoOn, annualRent, annualRentChecked,
        });
        setIsEditing(false);
        onClose();
    };

    const handleRemove = () => {
        if (editStaff && onRemove) {
            onRemove(editStaff);
            setShowRemoveConfirm(false);
            onClose();
        }
    };

    const handleEditClick = () => setIsEditing(true);

    const handleCancelEdit = () => {
        if (editStaff) {
            setFirstName(editStaff.firstName);
            setLastName(editStaff.lastName);
            setEmail(editStaff.email);
            setPhone(editStaff.phone);
            setPosition(editStaff.position);
            setTaxId(editStaff.taxId);
            setGross(editStaff.gross.toLocaleString('en-US'));
            setPensionOn(editStaff.pensionOn);
            setNhfOn(editStaff.nhfOn);
            setHmoOn(editStaff.hmoOn);
            setAnnualRent(editStaff.annualRent);
            setAnnualRentChecked(editStaff.annualRentChecked);
        }
        setIsEditing(false);
    };

    return (
        <>
            <Drawer open={open} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className="flex flex-col max-h-[90dvh]" data-animate>
                <div data-lenis-prevent className="overflow-y-auto flex-1">
                    <div className="mx-auto max-w-[450px] px-6 py-8">
                        <h2 className="text-5 font-semibold text-taxable-dark text-center mb-8">
                            {headerTitle}
                        </h2>

                        <div className="relative overflow-hidden">
                            <div className={`transition-transform duration-300 ease-in-out ${isEditing ? '-translate-x-full' : 'translate-x-0'}`}>
                                {isViewMode && (
                                    <FormContent
                                        firstName={firstName} lastName={lastName}
                                        email={email} phone={phone}
                                        position={position} taxId={taxId}
                                        gross={gross}
                                        pensionOn={pensionOn} nhfOn={nhfOn} hmoOn={hmoOn}
                                        annualRent={annualRent} annualRentChecked={annualRentChecked}
                                        disabled={true}
                                        onFirstNameChange={() => {}} onLastNameChange={() => {}}
                                        onEmailChange={() => {}} onPhoneChange={() => {}}
                                        onPositionChange={() => {}} onTaxIdChange={() => {}}
                                        onGrossChange={() => {}}
                                        onPensionChange={() => {}} onNhfChange={() => {}}
                                        onHmoChange={() => {}}
                                        onAnnualRentChange={() => {}} onAnnualRentToggle={() => {}}
                                        readOnlyStyle="bg-neutral-50 text-neutral-400"
                                    />
                                )}
                            </div>
                            <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${isEditing ? 'translate-x-0' : 'translate-x-full'}`}>
                                {isEditing && (
                                    <FormContent
                                        firstName={firstName} lastName={lastName}
                                        email={email} phone={phone}
                                        position={position} taxId={taxId}
                                        gross={gross}
                                        pensionOn={pensionOn} nhfOn={nhfOn} hmoOn={hmoOn}
                                        annualRent={annualRent} annualRentChecked={annualRentChecked}
                                        disabled={false}
                                        onFirstNameChange={setFirstName} onLastNameChange={setLastName}
                                        onEmailChange={setEmail} onPhoneChange={setPhone}
                                        onPositionChange={setPosition} onTaxIdChange={setTaxId}
                                        onGrossChange={(v) => setGross(v)}
                                        onPensionChange={() => setPensionOn(p => !p)}
                                        onNhfChange={() => setNhfOn(p => !p)}
                                        onHmoChange={() => setHmoOn(p => !p)}
                                        onAnnualRentChange={(v) => setAnnualRent(v)}
                                        onAnnualRentToggle={() => setAnnualRentChecked(p => !p)}
                                        readOnlyStyle=""
                                    />
                                )}
                            </div>
                            {!isViewMode && (
                                <FormContent
                                    firstName={firstName} lastName={lastName}
                                    email={email} phone={phone}
                                    position={position} taxId={taxId}
                                    gross={gross}
                                    pensionOn={pensionOn} nhfOn={nhfOn} hmoOn={hmoOn}
                                    annualRent={annualRent} annualRentChecked={annualRentChecked}
                                    disabled={false}
                                    onFirstNameChange={setFirstName} onLastNameChange={setLastName}
                                    onEmailChange={setEmail} onPhoneChange={setPhone}
                                    onPositionChange={setPosition} onTaxIdChange={setTaxId}
                                    onGrossChange={(v) => setGross(v)}
                                    onPensionChange={() => setPensionOn(p => !p)}
                                    onNhfChange={() => setNhfOn(p => !p)}
                                    onHmoChange={() => setHmoOn(p => !p)}
                                    onAnnualRentChange={(v) => setAnnualRent(v)}
                                    onAnnualRentToggle={() => setAnnualRentChecked(p => !p)}
                                    readOnlyStyle=""
                                />
                            )}
                        </div>

                        <div className="flex gap-3 mt-8">
                            {isViewMode && !isEditing && (
                                <>
                                    <button onClick={() => setShowRemoveConfirm(true)} className="flex-1 h-12 border border-red-200 bg-red-50 text-red-600 font-semibold rounded-xl text-3">
                                        Remove Staff
                                    </button>
                                    <PrimaryButton onClick={handleEditClick} className="flex-1">
                                        Edit Details
                                    </PrimaryButton>
                                </>
                            )}
                            {isViewMode && isEditing && (
                                <>
                                    <SecondaryButton onClick={handleCancelEdit} className="flex-1">
                                        Cancel
                                    </SecondaryButton>
                                    <PrimaryButton onClick={handleSave} disabled={!isValid} className="flex-1">
                                        Save
                                    </PrimaryButton>
                                </>
                            )}
                            {!isViewMode && (
                                <>
                                    <SecondaryButton onClick={onClose} className="flex-1">
                                        Cancel
                                    </SecondaryButton>
                                    <PrimaryButton onClick={handleAdd} disabled={!isValid} className="flex-1">
                                        Add Employee
                                    </PrimaryButton>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Remove confirmation modal (inside portal) */}
                {showRemoveConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20" onClick={() => setShowRemoveConfirm(false)}>
                        <div className="bg-white rounded-2xl p-6 max-w-[400px] mx-4 w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                </div>
                                <h3 className="text-6 font-semibold text-neutral-800 mb-2">Remove Employee?</h3>
                                <p className="text-3 text-neutral-500 font-medium mb-6">
                                    Are you sure you want to remove <span className="font-semibold text-neutral-700">{editStaff?.firstName} {editStaff?.lastName}</span>? This action cannot be undone.
                                </p>
                                <div className="flex gap-3 w-full">
                                    <SecondaryButton className="flex-1" onClick={() => setShowRemoveConfirm(false)}>
                                        Cancel
                                    </SecondaryButton>
                                    <button onClick={handleRemove} className="flex-1 h-12 bg-red-600 text-white font-semibold rounded-xl text-3">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </DrawerContent>
            </Drawer>
        </>
    );
}

// ── Form content sub-component ──────────────────────────────────────────

interface FormContentProps {
    firstName: string; lastName: string;
    email: string; phone: string;
    position: string; taxId: string;
    gross: string;
    pensionOn: boolean; nhfOn: boolean; hmoOn: boolean;
    annualRent: string; annualRentChecked: boolean;
    disabled: boolean;
    onFirstNameChange: (v: string) => void;
    onLastNameChange: (v: string) => void;
    onEmailChange: (v: string) => void;
    onPhoneChange: (v: string) => void;
    onPositionChange: (v: string) => void;
    onTaxIdChange: (v: string) => void;
    onGrossChange: (v: string) => void;
    onPensionChange: () => void;
    onNhfChange: () => void;
    onHmoChange: () => void;
    onAnnualRentChange: (v: string) => void;
    onAnnualRentToggle: () => void;
    readOnlyStyle: string;
}

function FormContent(props: FormContentProps) {
    const rs = props.readOnlyStyle;

    return (
        <>
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <label className="block text-2 font-medium text-neutral-500 mb-1">First Name</label>
                    <Input type="text" value={props.firstName} onChange={e => props.onFirstNameChange(e.target.value)} disabled={props.disabled} placeholder="Enter first name" className={rs} />
                </div>
                <div>
                    <label className="block text-2 font-medium text-neutral-500 mb-1">Last Name</label>
                    <Input type="text" value={props.lastName} onChange={e => props.onLastNameChange(e.target.value)} disabled={props.disabled} placeholder="Enter last name" className={rs} />
                </div>
                <div>
                    <label className="block text-2 font-medium text-neutral-500 mb-1">Email</label>
                    <Input type="email" value={props.email} onChange={e => props.onEmailChange(e.target.value)} disabled={props.disabled} placeholder="Enter email" className={rs} />
                </div>
                <div>
                    <label className="block text-2 font-medium text-neutral-500 mb-1">Phone Number</label>
                    <Input type="tel" value={props.phone} onChange={e => props.onPhoneChange(e.target.value)} disabled={props.disabled} placeholder="Enter phone number" className={rs} />
                </div>
                <div>
                    <label className="block text-2 font-medium text-neutral-500 mb-1">Job Position</label>
                    <Input type="text" value={props.position} onChange={e => props.onPositionChange(e.target.value)} disabled={props.disabled} placeholder="Enter job position" className={rs} />
                </div>
                <div>
                    <label className="block text-2 font-medium text-neutral-500 mb-1">JTB Tax ID <HintIcon tip="The employee's Tax Identification Number (TIN) issued by the Joint Tax Board (JTB)." /></label>
                    <Input type="text" value={props.taxId} onChange={e => props.onTaxIdChange(e.target.value)} disabled={props.disabled} placeholder="Enter tax ID" className={rs} />
                </div>
                <div className="col-span-2">
                    <label className="block text-2 font-medium text-neutral-500 mb-1">Monthly Salary</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-3 text-neutral-500 pointer-events-none">₦</span>
                        <Input type="text" value={props.gross} onChange={e => {
                            const raw = e.target.value.replace(/[^0-9.]/g, '');
                            const parts = raw.split('.');
                            const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                            const formatted = parts.length > 1 ? integer + '.' + parts.slice(1).join('') : integer;
                            props.onGrossChange(formatted);
                        }} disabled={props.disabled} placeholder="0" className={`pl-8 ${rs}`} />
                    </div>
                </div>
            </div>

            {/* Deductions section */}
            <div className="mb-8">
                <div className="text-2 font-semibold text-neutral-800 mb-3">Deductions <HintIcon tip="Select the statutory deductions applicable to this employee. These are subtracted from gross income before tax is calculated." /></div>
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-6">
                        <label className={`flex items-center gap-2 ${props.disabled ? 'cursor-default' : 'cursor-pointer'}`}>
                            <Checkbox checked={props.pensionOn} onCheckedChange={() => !props.disabled && props.onPensionChange()} disabled={props.disabled} />
                            <span className={`text-2 font-medium ${props.disabled ? 'text-neutral-300' : 'text-neutral-700'}`}>Pension 8%</span>
                        </label>
                        <label className={`flex items-center gap-2 ${props.disabled ? 'cursor-default' : 'cursor-pointer'}`}>
                            <Checkbox checked={props.nhfOn} onCheckedChange={() => !props.disabled && props.onNhfChange()} disabled={props.disabled} />
                            <span className={`text-2 font-medium ${props.disabled ? 'text-neutral-300' : 'text-neutral-700'}`}>NHF (2.5%)</span>
                        </label>
                        <label className={`flex items-center gap-2 ${props.disabled ? 'cursor-default' : 'cursor-pointer'}`}>
                            <Checkbox checked={props.hmoOn} onCheckedChange={() => !props.disabled && props.onHmoChange()} disabled={props.disabled} />
                            <span className={`text-2 font-medium ${props.disabled ? 'text-neutral-300' : 'text-neutral-700'}`}>HMO (5%)</span>
                        </label>
                        <label className={`flex items-center gap-2 ${props.disabled ? 'cursor-default' : 'cursor-pointer'}`}>
                            <Checkbox checked={props.annualRentChecked} onCheckedChange={() => !props.disabled && props.onAnnualRentToggle()} disabled={props.disabled} />
                            <span className={`text-2 font-medium ${props.disabled ? 'text-neutral-300' : 'text-neutral-700'}`}>Annual Rent</span>
                        </label>
                    </div>
                    {props.annualRentChecked && (
                        <div className="relative pl-6">
                            <span className="absolute left-9 top-1/2 -translate-y-1/2 text-3 text-neutral-500 pointer-events-none">₦</span>
                            <Input type="text" value={props.annualRent} placeholder="Enter annual rent amount"
                                onChange={e => {
                                    const raw = e.target.value.replace(/[^0-9.]/g, '');
                                    const parts = raw.split('.');
                                    const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                    props.onAnnualRentChange(parts.length > 1 ? integer + '.' + parts.slice(1).join('') : integer);
                                }}
                                disabled={props.disabled}
                                className={`pl-12 ${rs}`}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
