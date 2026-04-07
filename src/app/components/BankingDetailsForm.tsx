import { useState } from 'react';

interface LoanCommitment {
  id: string;
  bank: string;
  outstandingAmount: string;
  monthlyRepayment: string;
}

interface BankingFormData {
  bank: string;
  accountName: string;
  lengthOfTime: string;
  accountNumber: string;
  preferredCard: string;
  paymentInsurance: string;
  creditShieldInsurance: boolean;
  loanCommitments: LoanCommitment[];
  debtServiceRatio: string;
}

interface BankingDetailsFormProps {
  onBack: () => void;
  onProceed: () => void;
}

export default function BankingDetailsForm({ onBack, onProceed }: BankingDetailsFormProps) {
  const [formData, setFormData] = useState<BankingFormData>({
    bank: '',
    accountName: '',
    lengthOfTime: '',
    accountNumber: '',
    preferredCard: '',
    paymentInsurance: '',
    creditShieldInsurance: false,
    loanCommitments: [
      { id: '1', bank: '', outstandingAmount: '', monthlyRepayment: '' }
    ],
    debtServiceRatio: '',
  });

  const handleInputChange = (field: keyof BankingFormData, value: string | boolean) => {
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
        { id: Date.now().toString(), bank: '', outstandingAmount: '', monthlyRepayment: '' }
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
    console.log('Banking Form Data:', formData);
    onProceed();
  };

  return (
    <div>
      <div className="bg-white rounded-[10px] border border-[#e5e7eb] p-6">
        {/* Section Header */}
        <div className="flex items-center gap-2 pb-4 border-b border-[#e5e7eb] mb-6">
          <div className="size-[24px] text-[#fa551e]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M7 14H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M7 10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#101828]">Applicant's banking details</h2>
        </div>

        {/* Card repayments Section */}
        <div className="mb-6">
          <h3 className="text-[15px] font-semibold text-[#364153] mb-4">Card repayments</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Bank */}
            <div>
              <label className="block text-[13.1px] text-[#364153] mb-2">Bank</label>
              <input
                type="text"
                placeholder="Enter bank name"
                value={formData.bank}
                onChange={(e) => handleInputChange('bank', e.target.value)}
                className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent"
              />
            </div>

            {/* Account name */}
            <div>
              <label className="block text-[13.1px] text-[#364153] mb-2">Account name</label>
              <input
                type="text"
                placeholder="Enter account name"
                value={formData.accountName}
                onChange={(e) => handleInputChange('accountName', e.target.value)}
                className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent"
              />
            </div>

            {/* Length of time with Bank */}
            <div>
              <label className="block text-[13.1px] text-[#364153] mb-2">Length of time with Bank</label>
              <input
                type="text"
                placeholder="e.g., 5 years"
                value={formData.lengthOfTime}
                onChange={(e) => handleInputChange('lengthOfTime', e.target.value)}
                className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent"
              />
            </div>

            {/* Account number */}
            <div>
              <label className="block text-[13.1px] text-[#364153] mb-2">Account number</label>
              <input
                type="text"
                placeholder="Enter account number"
                value={formData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Card preference Section */}
        <div className="mb-6">
          <h3 className="text-[15px] font-semibold text-[#364153] mb-4">Card preference</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Preferred Card */}
            <div>
              <label className="block text-[13.1px] text-[#364153] mb-2">Preferred Card</label>
              <select
                value={formData.preferredCard}
                onChange={(e) => handleInputChange('preferredCard', e.target.value)}
                className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent appearance-none bg-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 13px center',
                }}
              >
                <option value="">Select preferred card</option>
                <option value="gold">Gold Card</option>
                <option value="platinum">Platinum Card</option>
                <option value="classic">Classic Card</option>
                <option value="signature">Signature Card</option>
              </select>
            </div>

            {/* Payment insurance */}
            <div>
              <label className="block text-[13.1px] text-[#364153] mb-2">Payment insurance</label>
              <select
                value={formData.paymentInsurance}
                onChange={(e) => handleInputChange('paymentInsurance', e.target.value)}
                className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent appearance-none bg-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 13px center',
                }}
              >
                <option value="">Select payment insurance</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {/* Credit Shield Insurance */}
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.creditShieldInsurance}
                  onChange={(e) => handleInputChange('creditShieldInsurance', e.target.checked)}
                  className="size-[18px] rounded border-[#d1d5dc] text-[#dc0032] focus:ring-2 focus:ring-[#dc0032]"
                />
                <span className="text-[13.1px] text-[#364153]">I would like Credit Shield insurance protection</span>
              </label>
            </div>
          </div>
        </div>

        {/* Applicant's existing loan and card commitments */}
        <div className="mb-4">
          <h3 className="text-[15px] font-semibold text-[#364153] mb-4">Applicant's existing loan and card commitments</h3>

          <div className="border border-[#e5e7eb] rounded-[8px] overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[2fr_2fr_2fr_auto] gap-4 bg-[#f9fafb] px-4 py-3 border-b border-[#e5e7eb]">
              <div className="text-[13.1px] font-semibold text-[#364153]">Bank</div>
              <div className="text-[13.1px] font-semibold text-[#364153]">Outstanding amount/Credit limit</div>
              <div className="text-[13.1px] font-semibold text-[#364153]">Monthly repayment</div>
              <div className="w-[40px]"></div>
            </div>

            {/* Table Rows */}
            {formData.loanCommitments.map((loan, index) => (
              <div key={loan.id} className={`grid grid-cols-[2fr_2fr_2fr_auto] gap-4 px-4 py-3 ${index < formData.loanCommitments.length - 1 ? 'border-b border-[#e5e7eb]' : ''}`}>
                <div>
                  <input
                    type="text"
                    placeholder="Enter bank"
                    value={loan.bank}
                    onChange={(e) => handleLoanCommitmentChange(loan.id, 'bank', e.target.value)}
                    className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Enter amount"
                    value={loan.outstandingAmount}
                    onChange={(e) => handleLoanCommitmentChange(loan.id, 'outstandingAmount', e.target.value)}
                    className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Enter repayment"
                    value={loan.monthlyRepayment}
                    onChange={(e) => handleLoanCommitmentChange(loan.id, 'monthlyRepayment', e.target.value)}
                    className="w-full px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent"
                  />
                </div>
                <div className="flex items-center justify-center">
                  {formData.loanCommitments.length > 1 && (
                    <button
                      onClick={() => removeLoanCommitment(loan.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove row"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M6 6L14 14M6 14L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Row Button */}
          <button
            onClick={addLoanCommitment}
            className="mt-2 text-[#dc0032] text-[13.1px] font-medium hover:underline flex items-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add another commitment
          </button>
        </div>

        {/* Debt Service Ratio */}
        <div className="mt-6">
          <label className="block text-[13.1px] text-[#364153] mb-2">Debt Service Ratio</label>
          <input
            type="text"
            placeholder="Enter debt service ratio"
            value={formData.debtServiceRatio}
            onChange={(e) => handleInputChange('debtServiceRatio', e.target.value)}
            className="max-w-[400px] px-[13px] py-[9px] border border-[#d1d5dc] rounded-[8px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#dc0032] focus:border-transparent"
          />
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
