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
  deliveryMethod: string;
  frequencyOfDeduction: string;
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
  deliveryMethod: '',
  frequencyOfDeduction: '',
  statementMergeVia: '',
};

interface PaymentInfoFormProps {
  onBack: () => void;
  onProceed: (data: PaymentInfoFormData) => void;
  initialData?: PaymentInfoFormData;
}

const inputClassName =
  'h-[42px] w-full rounded-[8px] border border-[#d1d5dc] px-[13px] text-[15px] leading-[24px] text-[#0a0a0a] placeholder:text-[rgba(10,10,10,0.5)] focus:outline-none focus:ring-1 focus:ring-[#dc0032]';

const labelClass = 'mb-2 block text-[14px] font-medium text-[#364153]';

export default function PaymentInfoForm({ onBack, onProceed, initialData }: PaymentInfoFormProps) {
  const [formData, setFormData] = useState<PaymentInfoFormData>(initialData ?? emptyPaymentInfoFormData);

  const handleInputChange = (field: keyof PaymentInfoFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProceed = () => {
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
              <label className={labelClass}>Name</label>
              <input
                type="text"
                placeholder=""
                value={formData.refereeName}
                onChange={(e) => handleInputChange('refereeName', e.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClass}>Relationship to Applicant</label>
              <input
                type="text"
                placeholder=""
                value={formData.refereeRelationship}
                onChange={(e) => handleInputChange('refereeRelationship', e.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClass}>ID/Passport no</label>
              <input
                type="text"
                placeholder=""
                value={formData.refereeIdPassport}
                onChange={(e) => handleInputChange('refereeIdPassport', e.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClass}>Postal address</label>
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
              <label className={labelClass}>Payment option</label>
              <select
                value={formData.paymentOption}
                onChange={(e) => handleInputChange('paymentOption', e.target.value)}
                className={`${inputClassName} ${formData.paymentOption ? 'text-[#0a0a0a]' : 'text-[rgba(10,10,10,0.5)]'}`}
              >
                <option value="">Select payment option</option>
                <option value="auto-credit">Auto-credit</option>
                <option value="direct-debit">Direct debit</option>
                <option value="standing-order">Standing order</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Delivery method</label>
              <select
                value={formData.deliveryMethod}
                onChange={(e) => handleInputChange('deliveryMethod', e.target.value)}
                className={`${inputClassName} ${formData.deliveryMethod ? 'text-[#0a0a0a]' : 'text-[rgba(10,10,10,0.5)]'}`}
              >
                <option value="">Select delivery option</option>
                <option value="branch">Branch pickup</option>
                <option value="postal">Postal address</option>
                <option value="courier">Courier</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Frequency of deduction</label>
              <input
                type="text"
                placeholder=""
                value={formData.frequencyOfDeduction}
                onChange={(e) => handleInputChange('frequencyOfDeduction', e.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClass}>Please merge my statements via:</label>
              <select
                value={formData.statementMergeVia}
                onChange={(e) => handleInputChange('statementMergeVia', e.target.value)}
                className={`${inputClassName} ${formData.statementMergeVia ? 'text-[#0a0a0a]' : 'text-[rgba(10,10,10,0.5)]'}`}
              >
                <option value="">Select option</option>
                <option value="email">Email</option>
                <option value="post">Post</option>
                <option value="sms">SMS</option>
              </select>
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
