import React, { useRef, useState, type ChangeEvent, type CSSProperties } from 'react';

export interface EmploymentFormData {
  employmentType: string;
  jobTitle: string;
  employerName: string;
  workingSince: string;
  industrySector: string;
  monthlySalary: string;
  creditCardIncomeType: string;
  maritalStatus: string;
  proofOfEmploymentUpload: string;
  workPermitUpload: string;
  payslipUpload: string;
  natureOfBusiness: string;
  monthlyTurnover: string;
  businessPhysicalAddress: string;
  nearestLandmark: string;
  businessCounty: string;
  businessPoBox: string;
  telephoneHome: string;
  businessEmail: string;
  physicalAddress: string;
  townCity: string;
  poBox: string;
  county: string;
  poBox2: string;
  postalCode: string;
}

export const emptyEmploymentFormData: EmploymentFormData = {
  employmentType: '',
  jobTitle: '',
  employerName: '',
  workingSince: '',
  industrySector: '',
  monthlySalary: '',
  creditCardIncomeType: '',
  maritalStatus: '',
  proofOfEmploymentUpload: '',
  workPermitUpload: '',
  payslipUpload: '',
  natureOfBusiness: '',
  monthlyTurnover: '',
  businessPhysicalAddress: '',
  nearestLandmark: '',
  businessCounty: '',
  businessPoBox: '',
  telephoneHome: '',
  businessEmail: '',
  physicalAddress: '',
  townCity: '',
  poBox: '',
  county: '',
  poBox2: '',
  postalCode: '',
};

interface EmploymentDetailsFormProps {
  onBack: () => void;
  onProceed: (data: EmploymentFormData) => void;
  initialData?: EmploymentFormData;
}

const inputClassName =
  'h-[42px] w-full rounded-[8px] border border-[#d1d5dc] px-[13px] text-[15px] leading-[24px] text-[#0a0a0a] placeholder:text-[rgba(10,10,10,0.5)] focus:outline-none focus:ring-1 focus:ring-[#dc0032]';

const selectClassName =
  'h-[42px] w-full appearance-none rounded-[8px] border border-[#d1d5dc] bg-white px-[13px] text-[15px] text-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#dc0032]';

const selectChevronStyle: CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 13px center',
};
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KENYAN_LOCATION_SUGGESTIONS = [
  'Nairobi',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Eldoret',
  'Thika',
  'Kitengela',
  'Machakos',
  'Kiambu',
  'Nyeri',
  'Meru',
  'Kakamega',
];

const parseCurrencyLikeNumber = (value: string) => {
  const cleaned = value.replace(/[^\d.]/g, '');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const getCardTypeFromMonthlySalary = (monthlySalary: number) => {
  if (!Number.isFinite(monthlySalary) || monthlySalary <= 0) return '';
  if (monthlySalary < 50000) return 'Classic';
  if (monthlySalary < 80000) return 'Classic Rewards';
  if (monthlySalary < 150000) return 'Gold Rewards';
  if (monthlySalary < 300000) return 'Platinum';
  if (monthlySalary < 600000) return 'Visa Signature';
  return 'Visa Infinite';
};

export default function EmploymentDetailsForm({ onBack, onProceed, initialData }: EmploymentDetailsFormProps) {
  const [formData, setFormData] = useState<EmploymentFormData>(initialData ?? emptyEmploymentFormData);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const isSalaried = formData.employmentType === 'salaried';
  const isSelfEmployed = formData.employmentType === 'self-employed';
  const showEmployerDetails = !isSelfEmployed;

  const handleInputChange = (field: keyof EmploymentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDocumentUpload = (field: keyof EmploymentFormData, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleInputChange(field, file.name);
    }
  };

  const handleProceed = () => {
    if (!formData.employmentType.trim()) {
      alert('Employment Type is required.');
      return;
    }
    if (!formData.workingSince.trim()) {
      alert('Working since date is required.');
      return;
    }
    if (!formData.jobTitle.trim()) {
      alert('Job title is required.');
      return;
    }

    if (isSelfEmployed) {
      const selfEmployedRequired: Array<keyof EmploymentFormData> = [
        'natureOfBusiness',
        'monthlyTurnover',
        'businessPhysicalAddress',
        'businessCounty',
        'businessEmail',
      ];
      const missing = selfEmployedRequired.find((field) => !String(formData[field] ?? '').trim());
      if (missing) {
        alert('Please complete all required self-employed details.');
        return;
      }
      if (!EMAIL_REGEX.test(formData.businessEmail.trim())) {
        alert('Please enter a valid business email address containing @.');
        return;
      }
    } else {
      const salariedRequired: Array<keyof EmploymentFormData> = [
        'employerName',
        'industrySector',
        'monthlySalary',
        'creditCardIncomeType',
        'physicalAddress',
        'townCity',
      ];
      const missing = salariedRequired.find((field) => !String(formData[field] ?? '').trim());
      if (missing) {
        alert('Please complete all required employment details.');
        return;
      }
      if (isSalaried) {
        if (!formData.proofOfEmploymentUpload || !formData.workPermitUpload || !formData.payslipUpload) {
          alert('Please upload all required employment documents.');
          return;
        }
      }
    }

    console.log('Employment Form Data:', formData);
    onProceed(formData);
  };

  const labelClass = 'mb-2 block text-[14px] font-medium text-[#364153]';

  const renderUploadField = (label: string, field: keyof EmploymentFormData, required = false) => (
    <div>
      <label className={labelClass}>
        {label} {required && <span className="text-[#fb2c36]">*</span>}
      </label>
      <button
        type="button"
        onClick={() => fileInputRefs.current[String(field)]?.click()}
        className="flex h-[42px] w-full items-center justify-between rounded-[8px] border border-[#d1d5dc] bg-white px-[13px] text-left focus:outline-none focus:ring-1 focus:ring-[#dc0032]"
      >
        <span
          className={`truncate text-[15px] ${formData[field] ? 'text-[#0a0a0a]' : 'text-[rgba(10,10,10,0.5)]'}`}
        >
          {formData[field] ? String(formData[field]) : 'Upload document'}
        </span>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 text-[#161616]" aria-hidden>
          <path d="M9 11V4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path
            d="M6.5 6.5L9 4L11.5 6.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 10.5V13.5H14V10.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <input
        ref={(el) => {
          fileInputRefs.current[String(field)] = el;
        }}
        type="file"
        className="hidden"
        onChange={(e) => handleDocumentUpload(field, e)}
      />
    </div>
  );

  return (
    <>
      <div className="rounded-[10px] border border-[#e5e7eb] bg-white p-[25px] shadow-[0px_2px_4px_rgba(16,24,40,0.14)]">
        <div className="mb-6 flex items-center gap-2 border-b border-[#e5e7eb] pb-4">
          <div className="h-[20px] w-[20px] shrink-0 text-[#f93f24]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <rect x="3" y="6" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path
                d="M7 6V4C7 3.44772 7.44772 3 8 3H12C12.5523 3 13 3.44772 13 4V6"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <h2 className="text-[34px] font-bold leading-[1.1] text-[#101828]">Employment Details</h2>
        </div>

        <div className={showEmployerDetails ? 'mb-6' : ''}>
          <h3 className="mb-4 text-[26px] font-bold leading-[1.1] text-[#364153]">Employee Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Employment Type <span className="text-[#fb2c36]">*</span>
              </label>
              <select
                value={formData.employmentType}
                onChange={(e) => handleInputChange('employmentType', e.target.value)}
                className={selectClassName}
                style={selectChevronStyle}
              >
                <option value="">Select employment type</option>
                <option value="salaried">Salaried</option>
                <option value="self-employed">Self employed</option>
                <option value="freelancer">Freelancer</option>
                <option value="homemaker">Homemaker</option>
                <option value="retired">Retired</option>
                <option value="student">Student</option>
                <option value="unemployed-others">Unemployed/others</option>
                <option value="minor">Minor</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Job title <span className="text-[#fb2c36]">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter job title"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                className={inputClassName}
              />
            </div>

            {isSelfEmployed && (
              <>
                <div>
                  <label className={labelClass}>
                    Nature of business <span className="text-[#fb2c36]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={formData.natureOfBusiness}
                    onChange={(e) => handleInputChange('natureOfBusiness', e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Working since <span className="text-[#fb2c36]">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.workingSince}
                    onChange={(e) => handleInputChange('workingSince', e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Monthly turn over <span className="text-[#fb2c36]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter amount"
                    value={formData.monthlyTurnover}
                    onChange={(e) => handleInputChange('monthlyTurnover', e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Physical address <span className="text-[#fb2c36]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter address"
                    value={formData.businessPhysicalAddress}
                    onChange={(e) => handleInputChange('businessPhysicalAddress', e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClass}>Nearest landmark</label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.nearestLandmark}
                    onChange={(e) => handleInputChange('nearestLandmark', e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    County <span className="text-[#fb2c36]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter county"
                    value={formData.businessCounty}
                    onChange={(e) => handleInputChange('businessCounty', e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClass}>PO Box</label>
                  <input
                    type="text"
                    placeholder="Enter PO Box"
                    value={formData.businessPoBox}
                    onChange={(e) => handleInputChange('businessPoBox', e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClass}>Telephone (H)</label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.telephoneHome}
                    onChange={(e) => handleInputChange('telephoneHome', e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>
                    Email <span className="text-[#fb2c36]">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder=""
                    value={formData.businessEmail}
                    onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </>
            )}

            {!isSelfEmployed && (
              <>
                <div>
                  <label className={labelClass}>
                    Name of Employer <span className="text-[#fb2c36]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={formData.employerName}
                    onChange={(e) => handleInputChange('employerName', e.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Working since <span className="text-[#fb2c36]">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.workingSince}
                    onChange={(e) => handleInputChange('workingSince', e.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Industry/Sector <span className="text-[#fb2c36]">*</span>
                  </label>
                  <select
                    value={formData.industrySector}
                    onChange={(e) => handleInputChange('industrySector', e.target.value)}
                    className={selectClassName}
                    style={selectChevronStyle}
                  >
                    <option value="">Select industry</option>
                    <option value="technology">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Monthly Net salary (Gross less Tax) <span className="text-[#fb2c36]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter amount"
                    value={formData.monthlySalary}
                    onChange={(e) => {
                      const salaryInput = e.target.value;
                      const salaryValue = parseCurrencyLikeNumber(salaryInput);
                      handleInputChange('monthlySalary', salaryInput);
                      handleInputChange('creditCardIncomeType', getCardTypeFromMonthlySalary(salaryValue));
                    }}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Type of Credit card based on income <span className="text-[#fb2c36]">*</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    placeholder="You can qualify for a..."
                    value={formData.creditCardIncomeType}
                    className={`${inputClassName} bg-[#f9fafb]`}
                  />
                </div>

                {isSalaried ? (
                  <>
                    {renderUploadField('Upload proof of employment', 'proofOfEmploymentUpload', true)}
                    {renderUploadField('Upload Work permit', 'workPermitUpload', true)}
                    {renderUploadField('Upload payslip', 'payslipUpload', true)}
                  </>
                ) : (
                  <div>
                    <label className={labelClass}>
                      Marital Status <span className="text-[#fb2c36]">*</span>
                    </label>
                    <select
                      value={formData.maritalStatus}
                      onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                      className={selectClassName}
                      style={selectChevronStyle}
                    >
                      <option value="">Select</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {showEmployerDetails && (
          <div>
            <h3 className="mb-4 mt-4 text-[26px] font-bold leading-[1.1] text-[#364153]">Employer Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {isSalaried ? (
                <>
                  <div>
                    <label className={labelClass}>
                      Employer&apos;s physical address <span className="text-[#fb2c36]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter address"
                      value={formData.physicalAddress}
                      onChange={(e) => handleInputChange('physicalAddress', e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Town/City <span className="text-[#fb2c36]">*</span>
                    </label>
                    <input
                      type="text"
                      list="employment-town-city-options"
                      placeholder="Enter town/city"
                      value={formData.townCity}
                      onChange={(e) => handleInputChange('townCity', e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                </>
              ) : (
                <div className="col-span-2">
                  <label className={labelClass}>
                    Employer&apos;s physical address <span className="text-[#fb2c36]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter address"
                    value={formData.physicalAddress}
                    onChange={(e) => handleInputChange('physicalAddress', e.target.value)}
                    className={inputClassName}
                  />
                </div>
              )}

              {!isSalaried && (
                <>
                  <div>
                    <label className={labelClass}>
                      Town/City <span className="text-[#fb2c36]">*</span>
                    </label>
                    <input
                      type="text"
                      list="employment-town-city-options"
                      placeholder="Enter town/city"
                      value={formData.townCity}
                      onChange={(e) => handleInputChange('townCity', e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>PO Box</label>
                    <input
                      type="text"
                      placeholder="Enter PO Box"
                      value={formData.poBox}
                      onChange={(e) => handleInputChange('poBox', e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                </>
              )}

              {isSalaried && (
                <>
                  <div>
                    <label className={labelClass}>PO Box</label>
                    <input
                      type="text"
                      placeholder="Enter PO Box"
                      value={formData.poBox}
                      onChange={(e) => handleInputChange('poBox', e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>County</label>
                    <input
                      type="text"
                      placeholder="Enter county"
                      value={formData.county}
                      onChange={(e) => handleInputChange('county', e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>PO Box</label>
                    <input
                      type="text"
                      placeholder="Enter PO Box"
                      value={formData.poBox2}
                      onChange={(e) => handleInputChange('poBox2', e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Postal code</label>
                    <input
                      type="text"
                      placeholder="Enter postal code"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                </>
              )}

              {!isSalaried && (
                <>
                  <div>
                    <label className={labelClass}>County</label>
                    <input
                      type="text"
                      placeholder="Enter county"
                      value={formData.county}
                      onChange={(e) => handleInputChange('county', e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>PO Box</label>
                    <input
                      type="text"
                      placeholder="Enter PO Box"
                      value={formData.poBox2}
                      onChange={(e) => handleInputChange('poBox2', e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Postal code</label>
                    <input
                      type="text"
                      placeholder="Enter postal code"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <datalist id="employment-town-city-options">
        {KENYAN_LOCATION_SUGGESTIONS.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>

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
          className="rounded-[8px] bg-[#f93f24] px-7 py-[11px] text-[16px] font-semibold text-white hover:bg-[#e02d14]"
        >
          Proceed
        </button>
      </div>
    </>
  );
}
