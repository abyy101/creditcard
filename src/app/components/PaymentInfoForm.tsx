import React, { useState } from 'react';

export interface PaymentInfoFormData {
  refereeName: string;
  refereeRelationship: string;
  refereeIdPassport: string;
  refereePostalAddress: string;
  relative2Name: string;
  relative2Relationship: string;
  relative2IdPassport: string;
  relative2PostalAddress: string;
  paymentOption: string;
  autoDebitHowMuchPercent: string;
  nonAbsaBankName: string;
  nonAbsaAccountName: string;
  nonAbsaAccountNumber: string;
  deliveryMethod: string;
  frequencyOfDeduction: string;
  paymentDate: string;
  statementMergeVia: string;
}

export const emptyPaymentInfoFormData: PaymentInfoFormData = {
  refereeName: '',
  refereeRelationship: '',
  refereeIdPassport: '',
  refereePostalAddress: '',
  relative2Name: '',
  relative2Relationship: '',
  relative2IdPassport: '',
  relative2PostalAddress: '',
  paymentOption: '',
  autoDebitHowMuchPercent: '',
  nonAbsaBankName: '',
  nonAbsaAccountName: '',
  nonAbsaAccountNumber: '',
  deliveryMethod: '',
  frequencyOfDeduction: '',
  paymentDate: '',
  statementMergeVia: '',
};

interface PaymentInfoFormProps {
  onBack: () => void;
  onProceed: (data: PaymentInfoFormData) => void;
  initialData?: PaymentInfoFormData;
}

const inputClassName =
  'h-[42px] w-full rounded-[8px] border border-[#d1d5dc] px-[13px] text-[15px] leading-[24px] text-[#0a0a0a] placeholder:text-[rgba(10,10,10,0.5)] focus:outline-none focus:ring-1 focus:ring-[#dc0032]';
const selectClassName = `${inputClassName} bg-white`;

const labelClass = 'mb-2 block text-[14px] font-medium text-[#364153]';

export default function PaymentInfoForm({ onBack, onProceed, initialData }: PaymentInfoFormProps) {
  const [formData, setFormData] = useState<PaymentInfoFormData>(initialData ?? emptyPaymentInfoFormData);
  const isAbsaAutoDebit = formData.paymentOption === 'auto-debit-absa-customer';
  const isNonAbsaCustomer = formData.paymentOption === 'non-absa-customer';

  const handleInputChange = (field: keyof PaymentInfoFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProceed = () => {
    const requiredPrimaryReferee: Array<keyof PaymentInfoFormData> = [
      'refereeName',
      'refereeRelationship',
      'refereeIdPassport',
      'refereePostalAddress',
      'paymentOption',
      'deliveryMethod',
      'frequencyOfDeduction',
      'paymentDate',
      'statementMergeVia',
    ];
    const missingPrimary = requiredPrimaryReferee.find((field) => !String(formData[field] ?? '').trim());
    if (missingPrimary) {
      alert('Please complete all required referee and payment information fields.');
      return;
    }

    const relative2Fields: Array<keyof PaymentInfoFormData> = [
      'relative2Name',
      'relative2Relationship',
      'relative2IdPassport',
      'relative2PostalAddress',
    ];
    const hasAnyRelative2Data = relative2Fields.some((field) => String(formData[field] ?? '').trim());
    const hasMissingRelative2Data = relative2Fields.some((field) => !String(formData[field] ?? '').trim());
    if (hasAnyRelative2Data && hasMissingRelative2Data) {
      alert('If Relative 2 is provided, please complete all Relative 2 fields.');
      return;
    }

    if (isAbsaAutoDebit && !formData.autoDebitHowMuchPercent.trim()) {
      alert('Please provide How much (%) for Auto-Debit (Absa customer).');
      return;
    }

    if (
      isNonAbsaCustomer &&
      (!formData.nonAbsaBankName.trim() || !formData.nonAbsaAccountName.trim() || !formData.nonAbsaAccountNumber.trim())
    ) {
      alert('Please provide Bank Name, Account Name, and Account Number for Non-absa customer.');
      return;
    }

    console.log('Payment Info Data:', formData);
    onProceed(formData);
  };

  return (
    <>
      <div className="rounded-[10px] border border-[#e5e7eb] bg-white p-[25px] shadow-[0px_2px_4px_rgba(16,24,40,0.14)]">
        <div className="mb-5 flex items-center gap-2 border-b border-[#e5e7eb] pb-4">
          <div className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[6px] bg-[#fef2f2] text-[#f93f24]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M5 8H19L18 20H6L5 8Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 8V6.5C9 5.11929 10.1193 4 11.5 4H12.5C13.8807 4 15 5.11929 15 6.5V8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h2 className="text-[22px] font-bold leading-[1.2] text-[#101828]">Absacard payment method</h2>
        </div>

        <p className="mb-5 text-[14px] font-semibold leading-[1.5] text-[#1f2937]">
          I/We authorise you to settle/pay my/our card account by auto-credit from my/our Bank account as stated above. I/We
          will inform Absacard in writing if I/we wish to cancel this instruction. I/We understand that if any auto-credit is
          paid which breaches the terms of this instruction, the Bank will make a refund.
        </p>

        <div className="mb-6">
          <h3 className="mb-4 text-[14px] font-semibold leading-[1.2] text-[#101828]">Referees</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Name <span className="text-[#fb2c36]">*</span>
              </label>
              <input
                type="text"
                placeholder=""
                value={formData.refereeName}
                onChange={(e) => handleInputChange('refereeName', e.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClass}>
                Relationship to Applicant <span className="text-[#fb2c36]">*</span>
              </label>
              <input
                type="text"
                placeholder=""
                value={formData.refereeRelationship}
                onChange={(e) => handleInputChange('refereeRelationship', e.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClass}>
                ID/Passport no <span className="text-[#fb2c36]">*</span>
              </label>
              <input
                type="text"
                placeholder=""
                value={formData.refereeIdPassport}
                onChange={(e) => handleInputChange('refereeIdPassport', e.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClass}>
                Postal address <span className="text-[#fb2c36]">*</span>
              </label>
              <input
                type="text"
                placeholder=""
                value={formData.refereePostalAddress}
                onChange={(e) => handleInputChange('refereePostalAddress', e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>

          <h3 className="mb-4 mt-6 text-[14px] font-semibold leading-[1.2] text-[#101828]">Relative 2</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Name</label>
              <input
                type="text"
                placeholder=""
                value={formData.relative2Name}
                onChange={(e) => handleInputChange('relative2Name', e.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClass}>Relationship to Applicant</label>
              <input
                type="text"
                placeholder=""
                value={formData.relative2Relationship}
                onChange={(e) => handleInputChange('relative2Relationship', e.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClass}>ID/Passport no</label>
              <input
                type="text"
                placeholder=""
                value={formData.relative2IdPassport}
                onChange={(e) => handleInputChange('relative2IdPassport', e.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClass}>Postal address</label>
              <input
                type="text"
                placeholder=""
                value={formData.relative2PostalAddress}
                onChange={(e) => handleInputChange('relative2PostalAddress', e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-[17px] font-bold leading-[1.2] text-[#101828]">
            Card delivery/Statement account settlement
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Payment option <span className="text-[#fb2c36]">*</span>
              </label>
              <select
                value={formData.paymentOption}
                onChange={(e) => {
                  const selected = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    paymentOption: selected,
                    autoDebitHowMuchPercent: selected === 'auto-debit-absa-customer' ? prev.autoDebitHowMuchPercent : '',
                    nonAbsaBankName: selected === 'non-absa-customer' ? prev.nonAbsaBankName : '',
                    nonAbsaAccountName: selected === 'non-absa-customer' ? prev.nonAbsaAccountName : '',
                    nonAbsaAccountNumber: selected === 'non-absa-customer' ? prev.nonAbsaAccountNumber : '',
                  }));
                }}
                className={`${selectClassName} ${formData.paymentOption ? 'text-[#0a0a0a]' : 'text-[rgba(10,10,10,0.5)]'}`}
              >
                <option value="">Select payment option</option>
                <option value="auto-debit-absa-customer">Auto-Debit (Absa customer)</option>
                <option value="non-absa-customer">Non-absa customer</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>
                Delivery method <span className="text-[#fb2c36]">*</span>
              </label>
              <select
                value={formData.deliveryMethod}
                onChange={(e) => handleInputChange('deliveryMethod', e.target.value)}
                className={`${selectClassName} ${formData.deliveryMethod ? 'text-[#0a0a0a]' : 'text-[rgba(10,10,10,0.5)]'}`}
              >
                <option value="">Select delivery option</option>
                <option value="branch">Branch pickup</option>
                <option value="postal">Postal address</option>
                <option value="courier">Courier</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>
                Frequency of deduction <span className="text-[#fb2c36]">*</span>
              </label>
              <select
                value={formData.frequencyOfDeduction}
                onChange={(e) => handleInputChange('frequencyOfDeduction', e.target.value)}
                className={`${selectClassName} ${formData.frequencyOfDeduction ? 'text-[#0a0a0a]' : 'text-[rgba(10,10,10,0.5)]'}`}
              >
                <option value="">Select frequency</option>
                <option value="Monthly">Monthly</option>
                <option value="Annually">Annually</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>
                Payment date <span className="text-[#fb2c36]">*</span>
              </label>
              <select
                value={formData.paymentDate}
                onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                className={`${selectClassName} ${formData.paymentDate ? 'text-[#0a0a0a]' : 'text-[rgba(10,10,10,0.5)]'}`}
              >
                <option value="">Select payment date</option>
                <option value="5th">5th</option>
                <option value="8th">8th</option>
                <option value="14th">14th</option>
                <option value="23rd">23rd</option>
                <option value="28th">28th</option>
                <option value="30th">30th</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>
                Please merge my statements via: <span className="text-[#fb2c36]">*</span>
              </label>
              <select
                value={formData.statementMergeVia}
                onChange={(e) => handleInputChange('statementMergeVia', e.target.value)}
                className={`${selectClassName} ${formData.statementMergeVia ? 'text-[#0a0a0a]' : 'text-[rgba(10,10,10,0.5)]'}`}
              >
                <option value="">Select option</option>
                <option value="email">Email</option>
                <option value="post">Post</option>
                <option value="sms">SMS</option>
              </select>
            </div>

            {isAbsaAutoDebit && (
              <div>
                <label className={labelClass}>
                  How much (%) <span className="text-[#fb2c36]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="e.g. 20"
                    value={formData.autoDebitHowMuchPercent}
                    onChange={(e) => handleInputChange('autoDebitHowMuchPercent', e.target.value)}
                    className={`${inputClassName} pr-8`}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[14px] text-[#6b7280]">%</span>
                </div>
              </div>
            )}

            {isNonAbsaCustomer && (
              <>
                <div>
                  <label className={labelClass}>
                    Bank Name <span className="text-[#fb2c36]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nonAbsaBankName}
                    onChange={(e) => handleInputChange('nonAbsaBankName', e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Account Name <span className="text-[#fb2c36]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nonAbsaAccountName}
                    onChange={(e) => handleInputChange('nonAbsaAccountName', e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Account Number <span className="text-[#fb2c36]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nonAbsaAccountNumber}
                    onChange={(e) => handleInputChange('nonAbsaAccountNumber', e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </>
            )}
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
