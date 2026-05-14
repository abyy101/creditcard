import React from 'react';
import type { EmploymentFormData } from './EmploymentDetailsForm';
import type { BankingFormData } from './BankingDetailsForm';
import type { AdditionalCardholderFormData } from './AdditionalCardholderForm';
import type { PaymentInfoFormData } from './PaymentInfoForm';

export interface PersonalDetailsData {
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
  mobileNumber: string;
  nationalIdUpload: string;
  taxPinUpload: string;
  physicalAddress: string;
  townCity: string;
  poBox: string;
  postalCode: string;
  email: string;
  proofOfAddressUpload: string;
}

interface ReviewPageProps {
  personalData: PersonalDetailsData;
  photoPreview: string | null;
  employmentData: EmploymentFormData | null;
  bankingData: BankingFormData | null;
  additionalCardholderData: AdditionalCardholderFormData | null;
  paymentInfoData: PaymentInfoFormData | null;
  signatureDataUrl: string | null;
  onEdit: (step: number) => void;
  onSubmit: () => void;
}

const placeholder = '—';

function display(value: string | undefined | null) {
  if (value == null) return placeholder;
  const trimmed = value.toString().trim();
  return trimmed.length ? trimmed : placeholder;
}

interface FieldRow {
  label: string;
  value: string | undefined | null;
}

function FieldGrid({ rows }: { rows: FieldRow[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="text-[12px] font-medium uppercase tracking-wide text-[#6b7280]">{row.label}</div>
          <div className="mt-1 break-words text-[15px] text-[#101828]">{display(row.value)}</div>
        </div>
      ))}
    </div>
  );
}

interface SectionCardProps {
  title: string;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}

function SectionCard({ title, step, onEdit, children }: SectionCardProps) {
  return (
    <div className="rounded-[10px] border border-[#e5e7eb] bg-white p-[25px] shadow-[0px_2px_4px_rgba(16,24,40,0.14)]">
      <div className="mb-5 flex items-center justify-between gap-2 border-b border-[#e5e7eb] pb-4">
        <h2 className="text-[20px] font-bold leading-[1.2] text-[#101828]">{title}</h2>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="flex items-center gap-1.5 rounded-[8px] border border-[#d1d5dc] bg-white px-3 py-[6px] text-[13px] font-semibold text-[#364153] hover:bg-gray-50"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M16.5 4.5L19.5 7.5L8 19L4 20L5 16L16.5 4.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M14 7L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Edit
        </button>
      </div>
      {children}
    </div>
  );
}

export default function ReviewPage({
  personalData,
  photoPreview,
  employmentData,
  bankingData,
  additionalCardholderData,
  paymentInfoData,
  signatureDataUrl,
  onEdit,
  onSubmit,
}: ReviewPageProps) {
  return (
    <>
      <div className="mb-6 rounded-[10px] border border-[#e5e7eb] bg-white p-[25px] shadow-[0px_2px_4px_rgba(16,24,40,0.14)]">
        <div className="flex items-start gap-3">
          <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[8px] bg-[#fef2f2] text-[#f93f24]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M9 12L11 14L15 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <h1 className="text-[24px] font-bold leading-[1.2] text-[#101828]">Review your application</h1>
            <p className="mt-1 text-[14px] text-[#4b5563]">
              Please verify the information below. Use the <span className="font-semibold">Edit</span> button in any section
              to make changes. Once everything looks correct, submit your application.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <SectionCard title="Personal Information" step={1} onEdit={onEdit}>
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-[10px] border border-[#e5e7eb] bg-[#f9fafb]">
              {photoPreview ? (
                <img src={photoPreview} alt="Applicant" className="h-full w-full object-cover" />
              ) : (
                <svg width="36" height="36" viewBox="0 0 48 48" fill="none" aria-hidden>
                  <circle cx="24" cy="18" r="8" stroke="#99A1AF" strokeWidth="4" />
                  <path d="M8 40C8 32 15.1634 25.6 24 25.6C32.8366 25.6 40 32 40 40" stroke="#99A1AF" strokeWidth="4" />
                </svg>
              )}
            </div>
            <div>
              <div className="text-[12px] font-medium uppercase tracking-wide text-[#6b7280]">Profile Photo</div>
              <div className="mt-1 text-[14px] text-[#101828]">
                {photoPreview ? 'Uploaded' : 'Not uploaded'}
              </div>
            </div>
          </div>

          <FieldGrid
            rows={[
              { label: 'First Name', value: personalData.firstName },
              { label: 'Last Name', value: personalData.lastName },
              { label: 'Date of Birth', value: personalData.dateOfBirth },
              { label: 'Gender', value: personalData.gender },
              { label: 'Nationality', value: personalData.nationality },
              { label: 'Marital Status', value: personalData.maritalStatus },
              { label: 'National ID', value: personalData.nationalId },
              { label: 'Passport no.', value: personalData.passportNo },
              { label: 'Place of Birth', value: personalData.placeOfBirth },
              { label: 'Mobile Number', value: personalData.mobileNumber },
              { label: 'Upload National ID', value: personalData.nationalIdUpload },
              { label: 'Upload Tax Pin certificate', value: personalData.taxPinUpload },
            ]}
          />

          <h3 className="mb-3 mt-6 text-[14px] font-semibold text-[#101828]">Address Details</h3>
          <FieldGrid
            rows={[
              { label: 'Physical address', value: personalData.physicalAddress },
              { label: 'Town/City', value: personalData.townCity },
              { label: 'PO Box', value: personalData.poBox },
              { label: 'Postal code', value: personalData.postalCode },
              { label: 'Email', value: personalData.email },
              { label: 'Upload proof of address', value: personalData.proofOfAddressUpload },
            ]}
          />
        </SectionCard>

        <SectionCard title="Employment Details" step={2} onEdit={onEdit}>
          {employmentData ? (
            <>
              <h3 className="mb-3 text-[14px] font-semibold text-[#101828]">Employee Details</h3>
              <FieldGrid
                rows={[
                  { label: 'Employment Type', value: employmentData.employmentType },
                  { label: 'Job title', value: employmentData.jobTitle },
                  { label: 'Name of Employer', value: employmentData.employerName },
                  { label: 'Working since', value: employmentData.workingSince },
                  { label: 'Industry/Sector', value: employmentData.industrySector },
                  { label: 'Monthly Net salary', value: employmentData.monthlySalary },
                  { label: 'Credit card type (based on income)', value: employmentData.creditCardIncomeType },
                  { label: 'Marital Status', value: employmentData.maritalStatus },
                  { label: 'Nature of business', value: employmentData.natureOfBusiness },
                  { label: 'Monthly turnover', value: employmentData.monthlyTurnover },
                  { label: 'Business physical address', value: employmentData.businessPhysicalAddress },
                  { label: 'Nearest landmark', value: employmentData.nearestLandmark },
                  { label: 'Business County', value: employmentData.businessCounty },
                  { label: 'Business PO Box', value: employmentData.businessPoBox },
                  { label: 'Telephone (H)', value: employmentData.telephoneHome },
                  { label: 'Business Email', value: employmentData.businessEmail },
                  { label: 'Proof of employment', value: employmentData.proofOfEmploymentUpload },
                  { label: 'Work permit', value: employmentData.workPermitUpload },
                  { label: 'Payslip', value: employmentData.payslipUpload },
                ]}
              />

              <h3 className="mb-3 mt-6 text-[14px] font-semibold text-[#101828]">Employer Details</h3>
              <FieldGrid
                rows={[
                  { label: "Employer's physical address", value: employmentData.physicalAddress },
                  { label: 'Town/City', value: employmentData.townCity },
                  { label: 'PO Box', value: employmentData.poBox },
                  { label: 'County', value: employmentData.county },
                  { label: 'PO Box (additional)', value: employmentData.poBox2 },
                  { label: 'Postal code', value: employmentData.postalCode },
                ]}
              />
            </>
          ) : (
            <p className="text-[14px] text-[#6b7280]">No employment details captured.</p>
          )}
        </SectionCard>

        <SectionCard title="Banking Details" step={3} onEdit={onEdit}>
          {bankingData ? (
            <>
              <h3 className="mb-3 text-[14px] font-semibold text-[#101828]">Card repayments</h3>
              <FieldGrid
                rows={[
                  { label: 'Bank', value: bankingData.bank },
                  { label: 'Account name', value: bankingData.accountName },
                  { label: 'Length of time with Bank', value: bankingData.lengthOfTime },
                  { label: 'Account number', value: bankingData.accountNumber },
                ]}
              />

              <h3 className="mb-3 mt-6 text-[14px] font-semibold text-[#101828]">Card preference</h3>
              <FieldGrid
                rows={[
                  { label: 'Preferred Card', value: bankingData.preferredCard },
                  { label: 'Payment insurance', value: bankingData.paymentInsurance },
                  { label: 'Credit Shield Insurance', value: bankingData.creditShieldInsurance },
                ]}
              />

              <h3 className="mb-3 mt-6 text-[14px] font-semibold text-[#101828]">
                Existing loan and card commitments
              </h3>
              {bankingData.loanCommitments.length === 0 ? (
                <p className="text-[14px] text-[#6b7280]">No commitments listed.</p>
              ) : (
                <div className="space-y-4">
                  {bankingData.loanCommitments.map((loan, index) => (
                    <div
                      key={loan.id}
                      className="rounded-[8px] border border-[#e5e7eb] bg-[#fafafa] p-4"
                    >
                      <div className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[#6b7280]">
                        Commitment {index + 1}
                      </div>
                      <FieldGrid
                        rows={[
                          { label: 'Bank', value: loan.bank },
                          { label: 'Outstanding amount/Credit limit', value: loan.outstandingAmount },
                          { label: 'Monthly repayment', value: loan.monthlyRepayment },
                        ]}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <FieldGrid rows={[{ label: 'Debt Service Ratio', value: bankingData.debtServiceRatio }]} />
              </div>
            </>
          ) : (
            <p className="text-[14px] text-[#6b7280]">No banking details captured.</p>
          )}
        </SectionCard>

        <SectionCard title="Additional Cardholder" step={4} onEdit={onEdit}>
          {additionalCardholderData ? (
            <FieldGrid
              rows={[
                { label: 'First Name', value: additionalCardholderData.firstName },
                { label: 'Last Name', value: additionalCardholderData.lastName },
                { label: 'Date of Birth', value: additionalCardholderData.dateOfBirth },
                { label: 'Gender', value: additionalCardholderData.gender },
                { label: 'Nationality', value: additionalCardholderData.nationality },
                { label: 'Marital Status', value: additionalCardholderData.maritalStatus },
                { label: 'National ID', value: additionalCardholderData.nationalId },
                { label: 'Mobile', value: additionalCardholderData.mobile },
                { label: 'Email', value: additionalCardholderData.email },
                { label: 'Relationship to Cardholder', value: additionalCardholderData.relationship },
              ]}
            />
          ) : (
            <p className="text-[14px] text-[#6b7280]">No additional cardholder added.</p>
          )}
        </SectionCard>

        <SectionCard title="Payment Information" step={5} onEdit={onEdit}>
          {paymentInfoData ? (
            <>
              <h3 className="mb-3 text-[14px] font-semibold text-[#101828]">Referees</h3>
              <FieldGrid
                rows={[
                  { label: 'Name', value: paymentInfoData.refereeName },
                  { label: 'Relationship to Applicant', value: paymentInfoData.refereeRelationship },
                  { label: 'ID/Passport no', value: paymentInfoData.refereeIdPassport },
                  { label: 'Postal address', value: paymentInfoData.refereePostalAddress },
                ]}
              />

              <h3 className="mb-3 mt-6 text-[14px] font-semibold text-[#101828]">Relative 2</h3>
              <FieldGrid
                rows={[
                  { label: 'Name', value: paymentInfoData.relative2Name },
                  { label: 'Relationship to Applicant', value: paymentInfoData.relative2Relationship },
                  { label: 'ID/Passport no', value: paymentInfoData.relative2IdPassport },
                  { label: 'Postal address', value: paymentInfoData.relative2PostalAddress },
                ]}
              />

              <h3 className="mb-3 mt-6 text-[14px] font-semibold text-[#101828]">
                Card delivery/Statement account settlement
              </h3>
              <FieldGrid
                rows={[
                  { label: 'Payment option', value: paymentInfoData.paymentOption },
                  { label: 'Delivery method', value: paymentInfoData.deliveryMethod },
                  { label: 'Frequency of deduction', value: paymentInfoData.frequencyOfDeduction },
                  { label: 'Statement merge via', value: paymentInfoData.statementMergeVia },
                ]}
              />
            </>
          ) : (
            <p className="text-[14px] text-[#6b7280]">No payment information captured.</p>
          )}
        </SectionCard>

        <SectionCard title="Agreement & Signature" step={6} onEdit={onEdit}>
          <p className="mb-4 text-[14px] text-[#1f2937]">
            By submitting, you confirm that you have read and accepted the Card Issuance, Information Warranty, Terms and
            Conditions, Financial Assessment, and Bank Terms declarations.
          </p>
          <div>
            <div className="mb-2 text-[12px] font-medium uppercase tracking-wide text-[#6b7280]">Applicant Signature</div>
            {signatureDataUrl ? (
              <div className="inline-block rounded-[8px] border border-[#e5e7eb] bg-white p-2">
                <img src={signatureDataUrl} alt="Applicant signature" className="block max-h-[160px]" />
              </div>
            ) : (
              <div className="text-[14px] text-[#6b7280]">No signature provided.</div>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={() => onEdit(6)}
          className="flex items-center gap-2 rounded-[8px] border border-[#d1d5dc] bg-white px-6 py-[11px] text-[16px] font-semibold text-[#364153] hover:bg-gray-50"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="flex items-center gap-2 rounded-[8px] bg-[#f93f24] px-7 py-[11px] text-[16px] font-semibold text-white hover:bg-[#e02d14]"
        >
          Submit Application
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M3 8L7 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </>
  );
}
