import { useState } from 'react';
import EmploymentDetailsForm from './EmploymentDetailsForm';
import BankingDetailsForm from './BankingDetailsForm';

interface FormData {
  profilePhoto: File | null;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  maritalStatus: string;
  nationalId: string;
  passportNo: string;
  placeOfBirth: string;
}

export default function CreditCardApplication() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    profilePhoto: null,
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    maritalStatus: '',
    nationalId: '',
    passportNo: '',
    placeOfBirth: '',
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profilePhoto: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProceed = () => {
    console.log('Form Data:', formData);
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleEmploymentProceed = () => {
    setCurrentStep(3);
  };

  const handleBankingProceed = () => {
    setCurrentStep(4);
  };

  const steps = [
    { number: 1, name: 'Personal Details', description: 'Lorem Ipsum is simply', icon: 'person', completed: currentStep > 1 },
    { number: 2, name: 'Employment Details', description: 'Lorem Ipsum is simply', icon: 'work', completed: currentStep > 2 },
    { number: 3, name: 'Banking Details', description: 'Lorem Ipsum is simply', icon: 'bank', completed: currentStep > 3 },
    { number: 4, name: 'Card Repayments', description: 'Lorem Ipsum is simply', icon: 'card', completed: currentStep > 4 },
    { number: 5, name: 'Payment Info', description: 'Lorem Ipsum is simply', icon: 'payment', completed: currentStep > 5 },
    { number: 6, name: 'Agreement and Declaration', description: 'Lorem Ipsum is simply', icon: 'agreement', completed: false },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] relative">
      {/* Header */}
      <div className="bg-[#dc0032] h-[56px] flex items-center px-6">
        <div className="relative size-[40px] rounded-full bg-white flex items-center justify-center">
          <div className="relative size-[32px]">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 49 48">
              <path d="M24.5 48C38.031 48 49 37.2548 49 24C49 10.7452 38.031 3.05176e-05 24.5 3.05176e-05C10.969 3.05176e-05 0 10.7452 0 24C0 37.2548 10.969 48 24.5 48Z" fill="#DC0032" />
            </svg>
          </div>
        </div>
        <button className="ml-6 text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Date and user info */}
      <div className="absolute right-6 top-[80px] text-sm text-gray-600">
        Thursday, 18. July 2013 | Your security SurePhone™ is: <span className="font-bold">Sleve81</span>
      </div>

      <div className="flex mt-[60px] px-[40px] gap-8">
        {/* Stepper */}
        <div className="w-[240px] flex-shrink-0">
          <div className="flex flex-col gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`size-[40px] rounded-full flex items-center justify-center font-bold transition-colors ${
                      step.completed
                        ? 'bg-green-500 text-white'
                        : currentStep === step.number
                        ? 'bg-[#dc0032] text-white'
                        : 'border-2 border-gray-300 bg-white text-gray-400'
                    }`}
                  >
                    {step.completed ? (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M4 10L8 14L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : step.number === 1 ? (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        <path d="M4 18C4 14.6863 6.68629 12 10 12C13.3137 12 16 14.6863 16 18" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                      </svg>
                    ) : step.number === 2 ? (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <rect x="3" y="6" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        <path d="M7 6V4C7 3.44772 7.44772 3 8 3H12C12.5523 3 13 3.44772 13 4V6" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    ) : null}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-[2px] h-[40px] mt-2 ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                  )}
                </div>
                <div>
                  <div className={`${currentStep === step.number ? 'font-bold text-[#101828]' : 'text-gray-600'}`}>
                    {step.name}
                  </div>
                  <div className="text-sm text-gray-400">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Form */}
        <div className="flex-1 max-w-[900px]">
          <h1 className="text-3xl font-bold text-[#101828] mb-8">Credit Card Application Form</h1>

          {currentStep === 1 && (
            <>
              <div className="bg-white rounded-[10px] border border-[#e5e7eb] p-6">
                {/* Section Header */}
                <div className="flex items-center gap-2 pb-4 border-b border-[#e5e7eb] mb-6">
                  <div className="size-[20px] text-[#f93f24]">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M4 18C4 14.6863 6.68629 12 10 12C13.3137 12 16 14.6863 16 18" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-[#101828]">Personal Information</h2>
                </div>

                {/* Profile Photo */}
                <div className="mb-6">
                  <label className="block text-[13.1px] text-[#364153] mb-2">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="size-[128px] border-2 border-dashed border-[#d1d5dc] rounded-[10px] bg-[#f9fafb] flex items-center justify-center overflow-hidden">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Profile preview" className="size-full object-cover" />
                      ) : (
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                          <circle cx="24" cy="18" r="8" stroke="#99A1AF" strokeWidth="4"/>
                          <path d="M8 40C8 32 15.1634 25.6 24 25.6C32.8366 25.6 40 32 40 40" stroke="#99A1AF" strokeWidth="4"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="bg-[#dc0032] text-white px-4 py-2 rounded-[8px] cursor-pointer flex items-center gap-2 hover:bg-[#c0002b] transition-colors">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M8 3V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M13 8H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M8 3L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 3L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-[15px]">Upload Photo</span>
                        <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handlePhotoUpload} />
                      </label>
                      <span className="text-[11.4px] text-[#6a7282]">JPG,PNG</span>
                    </div>
                  </div>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-[13.1px] text-[#364153] mb-2">
                      First Name <span className="text-[#fb2c36]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-[13px] py-[11px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-[13.1px] text-[#364153] mb-2">
                      Last Name <span className="text-[#fb2c36]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-[13px] py-[11px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-[13.1px] text-[#364153] mb-2">
                      Date of Birth <span className="text-[#fb2c36]">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-[13.1px] text-[#364153] mb-2">
                      Gender <span className="text-[#fb2c36]">*</span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent appearance-none bg-white"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 13px center',
                      }}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Nationality */}
                  <div>
                    <label className="block text-[13.1px] text-[#364153] mb-2">
                      Nationality <span className="text-[#fb2c36]">*</span>
                    </label>
                    <select
                      value={formData.nationality}
                      onChange={(e) => handleInputChange('nationality', e.target.value)}
                      className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent appearance-none bg-white"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 13px center',
                      }}
                    >
                      <option value="">Select nationality</option>
                      <option value="us">United States</option>
                      <option value="uk">United Kingdom</option>
                      <option value="ca">Canada</option>
                      <option value="au">Australia</option>
                      <option value="other">Other</option>
                    </select>
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
                      <option value="">Select marital status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                  </div>

                  {/* National ID */}
                  <div>
                    <label className="block text-[13.1px] text-[#364153] mb-2">
                      National ID <span className="text-[#fb2c36]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter ID Number"
                      value={formData.nationalId}
                      onChange={(e) => handleInputChange('nationalId', e.target.value)}
                      className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent"
                    />
                  </div>

                  {/* Passport No */}
                  <div>
                    <label className="block text-[13.1px] text-[#364153] mb-2">
                      Passport no. <span className="text-[#fb2c36]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter passport number"
                      value={formData.passportNo}
                      onChange={(e) => handleInputChange('passportNo', e.target.value)}
                      className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent"
                    />
                  </div>

                  {/* Place of Birth */}
                  <div className="col-span-2">
                    <label className="block text-[13.1px] text-[#364153] mb-2">
                      Place of Birth. <span className="text-[#fb2c36]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter place of birth"
                      value={formData.placeOfBirth}
                      onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
                      className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Proceed Button */}
              <div className="flex justify-end mt-6">
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
            </>
          )}

          {currentStep === 2 && (
            <EmploymentDetailsForm onBack={handleBack} onProceed={handleEmploymentProceed} />
          )}

          {currentStep === 3 && (
            <BankingDetailsForm onBack={handleBack} onProceed={handleBankingProceed} />
          )}

          {currentStep === 4 && (
            <div className="bg-white rounded-[10px] border border-[#e5e7eb] p-6">
              <h2 className="text-lg font-bold text-[#101828] mb-4">Card Repayments</h2>
              <p className="text-gray-600">Card repayments form will be implemented here...</p>
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="bg-white border border-[#d1d5dc] text-[#364153] px-6 py-3 rounded-[8px] font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Back
                </button>
                <button
                  onClick={() => alert('Form completed!')}
                  className="bg-[#f93f24] text-white px-6 py-3 rounded-[8px] font-medium hover:bg-[#e02d14] transition-colors flex items-center gap-2"
                >
                  Proceed
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}