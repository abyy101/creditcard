import React, { useState } from 'react';

export interface LoanCommitment {
  id: string;
  bank: string;
  outstandingAmount: string;
  monthlyRepayment: string;
}

export interface BankingFormData {
  bank: string;
  accountName: string;
  lengthOfTime: string;
  accountNumber: string;
  preferredCard: string;
  paymentInsurance: string;
  creditShieldInsurance: string;
  loanCommitments: LoanCommitment[];
  debtServiceRatio: string;
}

export const emptyBankingFormData: BankingFormData = {
  bank: '',
  accountName: '',
  lengthOfTime: '',
  accountNumber: '',
  preferredCard: '',
  paymentInsurance: '',
  creditShieldInsurance: '',
  loanCommitments: [{ id: '1', bank: '', outstandingAmount: '', monthlyRepayment: '' }],
  debtServiceRatio: '',
};

interface BankingDetailsFormProps {
  onBack: () => void;
  onProceed: (data: BankingFormData) => void;
  initialData?: BankingFormData;
}

const inputClassName =
  'h-[42px] w-full rounded-[8px] border border-[#d1d5dc] px-[13px] text-[15px] leading-[24px] text-[#0a0a0a] placeholder:text-[rgba(10,10,10,0.5)] focus:outline-none focus:ring-1 focus:ring-[#dc0032]';
const selectClassName =
  'h-[42px] w-full rounded-[8px] border border-[#d1d5dc] bg-white px-[13px] text-[15px] text-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#dc0032]';

const labelClass = 'mb-2 block text-[14px] font-medium text-[#364153]';

export default function BankingDetailsForm({ onBack, onProceed, initialData }: BankingDetailsFormProps) {
  const [formData, setFormData] = useState<BankingFormData>(initialData ?? emptyBankingFormData);

  const handleInputChange = (field: keyof BankingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLoanCommitmentChange = (id: string, field: keyof LoanCommitment, value: string) => {
    setFormData((prev) => ({
      ...prev,
      loanCommitments: prev.loanCommitments.map((loan) =>
        loan.id === id ? { ...loan, [field]: value } : loan
      ),
    }));
  };

  const addLoanCommitment = () => {
    setFormData((prev) => ({
      ...prev,
      loanCommitments: [
        ...prev.loanCommitments,
        { id: Date.now().toString(), bank: '', outstandingAmount: '', monthlyRepayment: '' },
      ],
    }));
  };

  const removeLoanCommitment = (id: string) => {
    if (formData.loanCommitments.length > 1) {
      setFormData((prev) => ({
        ...prev,
        loanCommitments: prev.loanCommitments.filter((loan) => loan.id !== id),
      }));
    }
  };

  const handleProceed = () => {
    const requiredTopLevel: Array<keyof BankingFormData> = [
      'bank',
      'accountName',
      'accountNumber',
      'preferredCard',
      'debtServiceRatio',
    ];
    const missingTopLevel = requiredTopLevel.find((field) => !String(formData[field] ?? '').trim());
    if (missingTopLevel) {
      alert('Please complete all required banking details fields.');
      return;
    }

    const hasIncompleteCommitment = formData.loanCommitments.some(
      (loan) => !loan.bank.trim() || !loan.outstandingAmount.trim() || !loan.monthlyRepayment.trim()
    );
    if (hasIncompleteCommitment) {
      alert('Please complete bank, outstanding amount/credit limit, and monthly repayment for each commitment row.');
      return;
    }

    console.log('Banking Form Data:', formData);
    onProceed(formData);
  };

  return (
    <>
      <div className="rounded-[10px] border border-[#e5e7eb] bg-white p-[25px] shadow-[0px_2px_4px_rgba(16,24,40,0.14)]">
        <div className="mb-6 flex items-center gap-2 border-b border-[#e5e7eb] pb-4">
          <div className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[6px] bg-[#fef2f2] text-[#f93f24]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M7 14H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M7 10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-[22px] font-bold leading-[1.2] text-[#101828]">Applicant&apos;s banking details</h2>
        </div>

        <div className="mb-6">
          <h3 className="mb-4 text-[14px] font-semibold leading-[1.2] text-[#364153]">Card repayments</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Bank <span className="text-[#fb2c36]">*</span>
              </label>
              <input
                type="text"
                placeholder=""
                value={formData.bank}
                onChange={(e) => handleInputChange('bank', e.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClass}>
                Account name <span className="text-[#fb2c36]">*</span>
              </label>
              <input
                type="text"
                placeholder=""
                value={formData.accountName}
                onChange={(e) => handleInputChange('accountName', e.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClass}>Length of time with Bank</label>
              <input
                type="text"
                placeholder=""
                value={formData.lengthOfTime}
                onChange={(e) => handleInputChange('lengthOfTime', e.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClass}>
                Account number <span className="text-[#fb2c36]">*</span>
              </label>
              <input
                type="text"
                placeholder=""
                value={formData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-4 text-[14px] font-semibold leading-[1.2] text-[#364153]">Card preference</h3>
          <div className="mb-4 w-full md:max-w-[calc(50%-0.5rem)]">
            <label className={labelClass}>
              Preferred Card <span className="text-[#fb2c36]">*</span>
            </label>
            <input
              type="text"
              placeholder=""
              value={formData.preferredCard}
              onChange={(e) => handleInputChange('preferredCard', e.target.value)}
              className={inputClassName}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Payment insurance</label>
              <select
                value={formData.paymentInsurance}
                onChange={(e) => handleInputChange('paymentInsurance', e.target.value)}
                className={selectClassName}
              >
                <option value="">Select option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>I would like Credit Shield Insurance protection</label>
              <select
                value={formData.creditShieldInsurance}
                onChange={(e) => handleInputChange('creditShieldInsurance', e.target.value)}
                className={selectClassName}
              >
                <option value="">Select option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-[8px] border border-[#e5e7eb] bg-white p-4">
          <h3 className="mb-4 text-[14px] font-semibold leading-[1.2] text-[#364153]">
            Applicant&apos;s existing loan and card commitments
          </h3>
          {formData.loanCommitments.map((loan, index) => (
            <div
              key={loan.id}
              className={`grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.15fr_1fr_auto] md:items-end ${index < formData.loanCommitments.length - 1 ? 'mb-4 border-b border-[#e5e7eb] pb-4' : ''}`}
            >
              <div>
                <label className={labelClass}>
                  Bank <span className="text-[#fb2c36]">*</span>
                </label>
                <input
                  type="text"
                  placeholder=""
                  value={loan.bank}
                  onChange={(e) => handleLoanCommitmentChange(loan.id, 'bank', e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Outstanding amount/Credit limit <span className="text-[#fb2c36]">*</span>
                </label>
                <input
                  type="text"
                  placeholder=""
                  value={loan.outstandingAmount}
                  onChange={(e) => handleLoanCommitmentChange(loan.id, 'outstandingAmount', e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Monthly repayment <span className="text-[#fb2c36]">*</span>
                </label>
                <input
                  type="text"
                  placeholder=""
                  value={loan.monthlyRepayment}
                  onChange={(e) => handleLoanCommitmentChange(loan.id, 'monthlyRepayment', e.target.value)}
                  className={inputClassName}
                />
              </div>
              {formData.loanCommitments.length > 1 ? (
                <div className="flex items-end pb-[2px]">
                  <button
                    type="button"
                    onClick={() => removeLoanCommitment(loan.id)}
                    className="rounded-[8px] border border-[#e5e7eb] bg-white p-2 text-[#dc0032] hover:bg-[#fef2f2]"
                    title="Remove row"
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
                      <path d="M6 6L14 14M6 14L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="hidden md:block" aria-hidden />
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addLoanCommitment}
            className="mt-3 flex items-center gap-1 text-[13px] font-medium text-[#dc0032] hover:underline"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Add another commitment
          </button>

          <div className="mt-4 max-w-[260px]">
            <label className={labelClass}>
              Debt Service Ratio (%) <span className="text-[#fb2c36]">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="e.g. 35"
                value={formData.debtServiceRatio}
                onChange={(e) => handleInputChange('debtServiceRatio', e.target.value)}
                className={`${inputClassName} pr-8`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[14px] text-[#6b7280]">%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-[8px] border border-[#d1d5dc] bg-white px-6 py-[11px] text-[16px] font-semibold text-[#364153] hover:bg-gray-50"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <button
          type="button"
          onClick={handleProceed}
          className="flex items-center gap-2 rounded-[8px] bg-[#f93f24] px-7 py-[11px] text-[16px] font-semibold text-white hover:bg-[#e02d14]"
        >
          Proceed
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </>
  );
}
