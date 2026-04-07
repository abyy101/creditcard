import { useState } from 'react';

interface EmploymentFormData {
  employmentType: string;
  jobTitle: string;
  employerName: string;
  workingSince: string;
  industrySector: string;
  monthlySalary: string;
  maritalStatus: string;
  physicalAddress: string;
  townCity: string;
  poBox: string;
  county: string;
  poBox2: string;
  postalCode: string;
}

interface EmploymentDetailsFormProps {
  onBack: () => void;
  onProceed: () => void;
}

export default function EmploymentDetailsForm({ onBack, onProceed }: EmploymentDetailsFormProps) {
  const [formData, setFormData] = useState<EmploymentFormData>({
    employmentType: '',
    jobTitle: '',
    employerName: '',
    workingSince: '',
    industrySector: '',
    monthlySalary: '',
    maritalStatus: '',
    physicalAddress: '',
    townCity: '',
    poBox: '',
    county: '',
    poBox2: '',
    postalCode: '',
  });

  const handleInputChange = (field: keyof EmploymentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProceed = () => {
    console.log('Employment Form Data:', formData);
    onProceed();
  };

  return (
    <div>
      <div className="bg-white rounded-[10px] border border-[#e5e7eb] p-6">
        {/* Section Header */}
        <div className="flex items-center gap-2 pb-4 border-b border-[#e5e7eb] mb-6">
          <div className="size-[20px] text-[#fa551e]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="6" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M7 6V4C7 3.44772 7.44772 3 8 3H12C12.5523 3 13 3.44772 13 4V6" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#101828]">Employment Details</h2>
        </div>

        {/* Employee Details Section */}
        <div className="mb-6">
          <h3 className="text-[15px] font-semibold text-[#364153] mb-4">Employee Details</h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Employment Type */}
            <div>
              <label className="block text-[13.1px] text-[#364153] mb-2">
                Employment Type <span className="text-[#fb2c36]">*</span>
              </label>
              <select
                value={formData.employmentType}
                onChange={(e) => handleInputChange('employmentType', e.target.value)}
                className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent appearance-none bg-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 13px center',
                }}
              >
                <option value="">Select employment type</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="self-employed">Self Employed</option>
                <option value="unemployed">Unemployed</option>
              </select>
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-[13.1px] text-[#364153] mb-2">Job title</label>
              <input
                type="text"
                placeholder="Enter job title"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent"
              />
            </div>

            {/* Name of Employer */}
            <div>
              <label className="block text-[13.1px] text-[#364153] mb-2">Name of Employer</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={formData.employerName}
                onChange={(e) => handleInputChange('employerName', e.target.value)}
                className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent"
              />
            </div>

            {/* Working Since */}
            <div>
              <label className="block text-[13.1px] text-[#364153] mb-2">Working since</label>
              <input
                type="date"
                value={formData.workingSince}
                onChange={(e) => handleInputChange('workingSince', e.target.value)}
                className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent"
              />
            </div>

            {/* Industry/Sector */}
            <div>
              <label className="block text-[13.1px] text-[#364153] mb-2">Industry/Sector</label>
              <select
                value={formData.industrySector}
                onChange={(e) => handleInputChange('industrySector', e.target.value)}
                className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent appearance-none bg-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 13px center',
                }}
              >
                <option value="">Select gender</option>
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="retail">Retail</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Monthly Net Salary */}
            <div>
              <label className="block text-[13.1px] text-[#364153] mb-2">
                Monthly Net salary (Gross less Tax)
              </label>
              <input
                type="text"
                placeholder="Enter amount"
                value={formData.monthlySalary}
                onChange={(e) => handleInputChange('monthlySalary', e.target.value)}
                className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent"
              />
            </div>

            {/* Marital Status */}
            <div>
              <label className="block text-[13.1px] text-[#364153] mb-2">
                Marital Status <span className="text-[#fb2c36]">*</span>
              </label>
              <select
                value={formData.maritalStatus}
                onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent appearance-none bg-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 13px center',
                }}
              >
                <option value="">Select</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Employer Details Section */}
        <div>
          <h3 className="text-[15px] font-semibold text-[#364153] mb-4">Employer Details</h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Employer's Physical Address */}
            <div>
              <label className="block text-[13.1px] text-[#364153] mb-2">
                Employer's physical address
              </label>
              <input
                type="text"
                placeholder="Enter address"
                value={formData.physicalAddress}
                onChange={(e) => handleInputChange('physicalAddress', e.target.value)}
                className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent"
              />
            </div>

            {/* Town/City */}
            <div>
              <label className="block text-[13.1px] text-[#364153] mb-2">Town/City</label>
              <input
                type="text"
                placeholder="Enter town/city"
                value={formData.townCity}
                onChange={(e) => handleInputChange('townCity', e.target.value)}
                className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent"
              />
            </div>

            {/* PO Box */}
            <div>
              <label className="block text-[13.1px] text-[#364153] mb-2">PO Box</label>
              <input
                type="text"
                placeholder="Enter PO Box"
                value={formData.poBox}
                onChange={(e) => handleInputChange('poBox', e.target.value)}
                className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent"
              />
            </div>

            {/* County */}
            <div>
              <label className="block text-[13.1px] text-[#364153] mb-2">County</label>
              <input
                type="text"
                placeholder="Enter county"
                value={formData.county}
                onChange={(e) => handleInputChange('county', e.target.value)}
                className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent"
              />
            </div>

            {/* PO Box 2 */}
            <div>
              <label className="block text-[13.1px] text-[#364153] mb-2">PO Box</label>
              <input
                type="text"
                placeholder="Enter PO Box"
                value={formData.poBox2}
                onChange={(e) => handleInputChange('poBox2', e.target.value)}
                className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent"
              />
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-[13.1px] text-[#364153] mb-2">Postal code</label>
              <input
                type="text"
                placeholder="Enter postal code"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="bg-white border border-[#d1d5dc] text-[#364153] px-6 py-3 rounded-[8px] font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <button
          onClick={handleProceed}
          className="bg-[#f93f24] text-white px-6 py-3 rounded-[8px] font-medium hover:bg-[#e02d14] transition-colors flex items-center gap-2"
        >
          Proceed
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
