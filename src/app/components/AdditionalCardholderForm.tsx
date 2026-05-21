import React, { useState } from 'react';

export interface AdditionalCardholderFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  maritalStatus: string;
  nationalId: string;
  mobile: string;
  email: string;
  relationship: string;
}

export const emptyAdditionalCardholderFormData: AdditionalCardholderFormData = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  nationality: '',
  maritalStatus: '',
  nationalId: '',
  mobile: '',
  email: '',
  relationship: '',
};

interface AdditionalCardholderFormProps {
  onBack: () => void;
  onProceed: (data: AdditionalCardholderFormData) => void;
  initialData?: AdditionalCardholderFormData;
}

const inputClassName =
  'h-[42px] w-full rounded-[8px] border border-[#d1d5dc] px-[13px] text-[15px] leading-[24px] text-[#0a0a0a] placeholder:text-[rgba(10,10,10,0.5)] focus:outline-none focus:ring-1 focus:ring-[#dc0032]';

const labelClass = 'mb-2 block text-[14px] font-medium text-[#364153]';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdditionalCardholderForm({ onBack, onProceed, initialData }: AdditionalCardholderFormProps) {
  const [formData, setFormData] = useState<AdditionalCardholderFormData>(
    initialData ?? emptyAdditionalCardholderFormData
  );

  const handleInputChange = (field: keyof AdditionalCardholderFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProceed = () => {
    const allFieldsEmpty = Object.values(formData).every((value) => !value.trim());
    if (allFieldsEmpty) {
      onProceed(formData);
      return;
    }

    const requiredFields: Array<keyof AdditionalCardholderFormData> = [
      'firstName',
      'lastName',
      'dateOfBirth',
      'gender',
      'nationalId',
      'mobile',
      'email',
      'relationship',
    ];
    const missingField = requiredFields.find((field) => !String(formData[field] ?? '').trim());
    if (missingField) {
      alert('Please complete all required fields for additional cardholder or clear the section.');
      return;
    }

    if (!EMAIL_REGEX.test(formData.email.trim())) {
      alert('Please enter a valid email address containing @ for additional cardholder.');
      return;
    }

    console.log('Additional Cardholder Data:', formData);
    onProceed(formData);
  };

  return (
    <>
      <div className="rounded-[10px] border border-[#e5e7eb] bg-white p-[25px] shadow-[0px_2px_4px_rgba(16,24,40,0.14)]">
        <div className="mb-5 flex items-center gap-2 border-b border-[#e5e7eb] pb-4">
          <div className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[6px] bg-[#fef2f2] text-[#f93f24]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M7 14H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M7 10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-[22px] font-bold leading-[1.2] text-[#101828]">Additional cardholder application</h2>
        </div>

        <p className="mb-5 text-[14px] font-semibold leading-[1.5] text-[#1f2937]">
          Complete this section only if you want us to issue a supplementary card (up to a maximum of 9) to another person
          (e.g. your spouse) as an authorised user of your Absacard account. Remember, that as the principal cardholder, you
          will be liable for any usage by your authorised user. The authorised user must sign this section where indicated.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              First Name <span className="text-[#fb2c36]">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={inputClassName}
            />
          </div>
          <div>
            <label className={labelClass}>
              Last Name <span className="text-[#fb2c36]">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={inputClassName}
            />
          </div>

          <div>
            <label className={labelClass}>
              Date of Birth <span className="text-[#fb2c36]">*</span>
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              className={inputClassName}
            />
          </div>
          <div>
            <label className={labelClass}>
              Gender <span className="text-[#fb2c36]">*</span>
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className={`${inputClassName} ${formData.gender ? 'text-[#0a0a0a]' : 'text-[rgba(10,10,10,0.5)]'}`}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Nationality</label>
            <input
              type="text"
              placeholder=""
              value={formData.nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
              className={inputClassName}
            />
          </div>
          <div>
            <label className={labelClass}>Marital Status</label>
            <input
              type="text"
              placeholder=""
              value={formData.maritalStatus}
              onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
              className={inputClassName}
            />
          </div>

          <div>
            <label className={labelClass}>
              National ID <span className="text-[#fb2c36]">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter ID Number"
              value={formData.nationalId}
              onChange={(e) => handleInputChange('nationalId', e.target.value)}
              className={inputClassName}
            />
          </div>
          <div>
            <label className={labelClass}>
              Mobile <span className="text-[#fb2c36]">*</span>
            </label>
            <input
              type="text"
              placeholder=""
              value={formData.mobile}
              onChange={(e) => handleInputChange('mobile', e.target.value)}
              className={inputClassName}
            />
          </div>

          <div>
            <label className={labelClass}>
              Email <span className="text-[#fb2c36]">*</span>
            </label>
            <input
              type="email"
              placeholder=""
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={inputClassName}
            />
          </div>
          <div>
            <label className={labelClass}>
              Relationship to Cardholder <span className="text-[#fb2c36]">*</span>
            </label>
            <input
              type="text"
              placeholder=""
              value={formData.relationship}
              onChange={(e) => handleInputChange('relationship', e.target.value)}
              className={inputClassName}
            />
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
