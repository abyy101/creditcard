import React, { useRef, useState, type ChangeEvent } from 'react';
import Tesseract from 'tesseract.js';
import EmploymentDetailsForm, { type EmploymentFormData } from './EmploymentDetailsForm';
import BankingDetailsForm, { type BankingFormData } from './BankingDetailsForm';
import AdditionalCardholderForm, { type AdditionalCardholderFormData } from './AdditionalCardholderForm';
import PaymentInfoForm, { type PaymentInfoFormData } from './PaymentInfoForm';
import AgreementDeclarationForm from './AgreementDeclarationForm';
import ReviewPage, { type PersonalDetailsData } from './ReviewPage';
import Footer from './Footer';

type FormData = PersonalDetailsData;
const absaLogo = new URL('../../assets/ABSA_Group_Limited_Logo.svg', import.meta.url).href;

const emptyPersonalDetails: PersonalDetailsData = {
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
  mobileNumber: '',
  nationalIdUpload: '',
  taxPinUpload: '',
  physicalAddress: '',
  townCity: '',
  poBox: '',
  postalCode: '',
  email: '',
  proofOfAddressUpload: '',
};

const KENYAN_ID_ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
]);
const KENYAN_ID_NUMBER_IN_TEXT_REGEX = /\b\d{7,8}\b/;
const MAX_ID_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const OCR_MAX_IMAGE_EDGE = 1400;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[+\d][\d\s-]{7,}$/;
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

type TrackingStage = 'none' | 'mobile' | 'otp' | 'progress';

interface ApplicationProgressView {
  applicationId: number;
  applicantName: string;
  mobileNumber: string;
  status: string;
  submittedAt: string;
  progress: Array<{ stage: string; state: 'completed' | 'in_progress' | 'pending' }>;
}

export default function CreditCardApplication() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(emptyPersonalDetails);

  const [employmentData, setEmploymentData] = useState<EmploymentFormData | null>(null);
  const [bankingData, setBankingData] = useState<BankingFormData | null>(null);
  const [additionalCardholderData, setAdditionalCardholderData] = useState<AdditionalCardholderFormData | null>(null);
  const [paymentInfoData, setPaymentInfoData] = useState<PaymentInfoFormData | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);

  const [editingFromReview, setEditingFromReview] = useState(false);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [nationalIdUploadError, setNationalIdUploadError] = useState<string | null>(null);
  const [isNationalIdVerified, setIsNationalIdVerified] = useState(false);
  const [isValidatingNationalIdUpload, setIsValidatingNationalIdUpload] = useState(false);
  const [trackingStage, setTrackingStage] = useState<TrackingStage>('none');
  const [trackingMobileNumber, setTrackingMobileNumber] = useState('');
  const [trackingOtp, setTrackingOtp] = useState('');
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [applicationProgress, setApplicationProgress] = useState<ApplicationProgressView | null>(null);

  const goNextOrReview = (defaultNext: number) => {
    if (editingFromReview) {
      setEditingFromReview(false);
      setCurrentStep(7);
    } else {
      setCurrentStep(defaultNext);
    }
  };

  const validateKenyanIdUpload = (file: File) => {
    const hasAllowedMime = KENYAN_ID_ALLOWED_MIME_TYPES.has(file.type);
    const hasAllowedExtension = /\.(jpg|jpeg|png|pdf)$/i.test(file.name);
    if (!hasAllowedMime && !hasAllowedExtension) {
      return 'Upload a valid Kenyan ID file in JPG, PNG, or PDF format.';
    }
    if (file.size > MAX_ID_UPLOAD_SIZE_BYTES) {
      return 'ID upload is too large. Maximum size is 10MB.';
    }
    return null;
  };

  const normalizeText = (text: string) => text.replace(/\s+/g, ' ').trim().toUpperCase();

  const isLikelyKenyanIdText = (text: string) => {
    const normalized = normalizeText(text);

    const hasKenyaSignal = /\bKENYA\b|\bREPUBLIC\b/.test(normalized);
    const hasIdSignal = /\bIDENTITY\b|\bNATIONAL\s*ID\b|\bID\s*(NO|NUMBER)\b|\bCARD\s*NO\b/.test(normalized);
    const hasLikelyIdNumber = KENYAN_ID_NUMBER_IN_TEXT_REGEX.test(normalized);
    const hasJamhuriSignal = /\bJAMHURI\b/.test(normalized);
    const hasHolderSignatureSignal = /\bHOLDER'?S\s*SIGN\b/.test(normalized);
    const hasBioSignal = /\bDATE\s*OF\s*BIRTH\b|\bDOB\b|\bSEX\b|\bDISTRICT\b|\bPLACE\s*OF\s*ISSUE\b/.test(normalized);
    const hasNameLikeSignal = /\b[A-Z]{3,}\s+[A-Z]{3,}\b/.test(normalized);

    let confidenceScore = 0;
    if (/\bREPUBLIC\s+OF\s+KENYA\b/.test(normalized)) confidenceScore += 3;
    if (hasJamhuriSignal) confidenceScore += 2;
    if (/\bIDENTITY\s*CARD\b/.test(normalized)) confidenceScore += 3;
    if (/\bID\s*(NO|NUMBER)\b|\bCARD\s*NO\b/.test(normalized)) confidenceScore += 2;
    if (/\bDATE\s*OF\s*BIRTH\b|\bDOB\b/.test(normalized)) confidenceScore += 1;
    if (/\bSEX\b|\bMALE\b|\bFEMALE\b/.test(normalized)) confidenceScore += 1;
    if (/\bPLACE\s*OF\s*BIRTH\b|\bDISTRICT\b/.test(normalized)) confidenceScore += 1;
    if (hasHolderSignatureSignal) confidenceScore += 1;
    if (hasNameLikeSignal) confidenceScore += 1;
    if (hasLikelyIdNumber) confidenceScore += 2;

    return (
      (hasKenyaSignal && hasIdSignal && hasLikelyIdNumber) ||
      (hasKenyaSignal && hasLikelyIdNumber && (hasBioSignal || hasJamhuriSignal || hasHolderSignatureSignal) && confidenceScore >= 6)
    );
  };

  const prepareImageForOcr = async (file: File): Promise<File | Blob> => {
    if (typeof window === 'undefined' || typeof createImageBitmap === 'undefined') return file;

    const bitmap = await createImageBitmap(file);
    const longestEdge = Math.max(bitmap.width, bitmap.height);
    if (longestEdge <= OCR_MAX_IMAGE_EDGE) {
      bitmap.close();
      return file;
    }

    const scale = OCR_MAX_IMAGE_EDGE / longestEdge;
    const targetWidth = Math.max(1, Math.round(bitmap.width * scale));
    const targetHeight = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return file;
    }

    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), 'image/jpeg', 0.9);
    });

    return blob ?? file;
  };

  const extractTextFromPdf = async (file: File) => {
    const data = new Uint8Array(await file.arrayBuffer());
    const pdfjs = await import('pdfjs-dist');
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
    }
    const document = await pdfjs.getDocument({ data }).promise;

    const pagesToRead = Math.min(document.numPages, 2);
    let text = '';
    for (let pageNumber = 1; pageNumber <= pagesToRead; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      text += ` ${content.items.map((item) => ('str' in item ? item.str : '')).join(' ')}`;
    }

    return text;
  };

  const validateKenyanIdContent = async (file: File) => {
    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const extractedText = await extractTextFromPdf(file);
        // Some scanned PDFs have little/no embedded text and would need OCR in backend for reliable verification.
        if (normalizeText(extractedText).length < 20) {
          return 'Could not read enough text from this PDF. Please upload a clearer PDF or an image of the ID.';
        }
        return isLikelyKenyanIdText(extractedText)
          ? null
          : 'The uploaded PDF does not appear to be a Kenyan National ID document.';
      }

      const imageForOcr = await prepareImageForOcr(file);
      const { data } = await Tesseract.recognize(imageForOcr, 'eng');
      return isLikelyKenyanIdText(data.text)
        ? null
        : 'The uploaded image does not appear to be a Kenyan National ID document.';
    } catch (_error) {
      return 'We could not verify this document. Please upload a clearer image/PDF of the Kenyan ID.';
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
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

  const handleDocumentUpload = async (field: keyof FormData, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (field === 'nationalIdUpload') {
        setIsNationalIdVerified(false);
        const idUploadError = validateKenyanIdUpload(file);
        if (idUploadError) {
          setNationalIdUploadError(idUploadError);
          return;
        }

        setIsValidatingNationalIdUpload(true);
        const contentValidationError = await validateKenyanIdContent(file);
        setIsValidatingNationalIdUpload(false);

        if (contentValidationError) {
          setNationalIdUploadError(contentValidationError);
          return;
        }

        setNationalIdUploadError(null);
        setIsNationalIdVerified(true);
      }
      handleInputChange(field, file.name);
    }
  };

  const handleProceed = () => {
    const requiredPersonalFields: Array<keyof FormData> = [
      'firstName',
      'lastName',
      'dateOfBirth',
      'gender',
      'nationality',
      'maritalStatus',
      'nationalId',
      'mobileNumber',
      'physicalAddress',
      'townCity',
      'email',
    ];
    const missingField = requiredPersonalFields.find((field) => !String(formData[field] ?? '').trim());
    if (missingField) {
      alert('Please complete all required personal details fields.');
      return;
    }

    if (!EMAIL_REGEX.test(formData.email.trim())) {
      alert('Please enter a valid email address containing @.');
      return;
    }

    if (!formData.nationalIdUpload) {
      setNationalIdUploadError('Please upload a valid Kenyan ID document.');
      setIsNationalIdVerified(false);
      return;
    }

    if (isValidatingNationalIdUpload) {
      setNationalIdUploadError('Please wait while we verify your National ID document.');
      return;
    }

    if (nationalIdUploadError || !isNationalIdVerified) {
      setNationalIdUploadError((current) => current ?? 'Please upload a verifiable Kenyan National ID document.');
      return;
    }

    console.log('Personal Details:', formData);
    goNextOrReview(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleEmploymentProceed = (data: EmploymentFormData) => {
    setEmploymentData(data);
    goNextOrReview(3);
  };

  const handleBankingProceed = (data: BankingFormData) => {
    setBankingData(data);
    goNextOrReview(4);
  };

  const handleAdditionalCardholderProceed = (data: AdditionalCardholderFormData) => {
    setAdditionalCardholderData(data);
    goNextOrReview(5);
  };

  const handlePaymentInfoProceed = (data: PaymentInfoFormData) => {
    setPaymentInfoData(data);
    goNextOrReview(6);
  };

  const handleAgreementSubmit = (capturedSignature: string) => {
    setSignatureDataUrl(capturedSignature);
    setEditingFromReview(false);
    setCurrentStep(7);
  };

  const handleEditSection = (step: number) => {
    setEditingFromReview(true);
    setCurrentStep(step);
  };

  const handleClearForm = () => {
    setFormData(emptyPersonalDetails);
    setEmploymentData(null);
    setBankingData(null);
    setAdditionalCardholderData(null);
    setPaymentInfoData(null);
    setSignatureDataUrl(null);
    setPhotoPreview(null);
    setNationalIdUploadError(null);
    setIsNationalIdVerified(false);
    setIsValidatingNationalIdUpload(false);
    setTrackingStage('none');
    setTrackingMobileNumber('');
    setTrackingOtp('');
    setTrackingError(null);
    setApplicationProgress(null);
    setEditingFromReview(false);
    setCurrentStep(1);
  };

  const handleSendTrackingOtp = async () => {
    const mobile = trackingMobileNumber.trim();
    if (!MOBILE_REGEX.test(mobile)) {
      setTrackingError('Enter a valid mobile number.');
      return;
    }

    try {
      setIsSendingOtp(true);
      setTrackingError(null);
      const response = await fetch('/api/progress/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: mobile }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || `Request failed with status ${response.status}`);
      }

      setTrackingOtp('');
      setTrackingStage('otp');
    } catch (error) {
      setTrackingError(error instanceof Error ? error.message : 'Failed to send OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyTrackingOtp = async () => {
    const mobile = trackingMobileNumber.trim();
    const otp = trackingOtp.trim();
    if (!otp) {
      setTrackingError('Please enter the OTP sent to your mobile number.');
      return;
    }

    try {
      setIsVerifyingOtp(true);
      setTrackingError(null);

      const verifyResponse = await fetch('/api/progress/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: mobile, otp }),
      });
      const verifyResult = await verifyResponse.json();
      if (!verifyResponse.ok) {
        throw new Error(verifyResult?.message || `Request failed with status ${verifyResponse.status}`);
      }

      const progressResponse = await fetch(`/api/progress?mobileNumber=${encodeURIComponent(mobile)}`);
      const progressResult = await progressResponse.json();
      if (!progressResponse.ok) {
        throw new Error(progressResult?.message || `Request failed with status ${progressResponse.status}`);
      }

      setApplicationProgress(progressResult as ApplicationProgressView);
      setTrackingStage('progress');
    } catch (error) {
      setTrackingError(error instanceof Error ? error.message : 'Failed to verify OTP.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (isSubmittingApplication) return;

    const { profilePhoto, ...personalDetailsWithoutFile } = formData;
    const payload = {
      personalDetails: {
        ...personalDetailsWithoutFile,
        profilePhotoName: profilePhoto?.name ?? null,
      },
      photoPreview,
      employmentData,
      bankingData,
      additionalCardholderData,
      paymentInfoData,
      signatureDataUrl,
      submittedAt: new Date().toISOString(),
    };

    try {
      setIsSubmittingApplication(true);
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('Saved application:', result);
      setTrackingMobileNumber(formData.mobileNumber || '');
      setTrackingOtp('');
      setTrackingError(null);
      setApplicationProgress(null);
      setTrackingStage('mobile');
    } catch (error) {
      console.error('Failed to save application:', error);
      alert('Failed to save application to database. Please try again.');
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const steps = [
    { number: 1, name: 'Personal Details', description: 'Name,National ID etc', completed: currentStep > 1 },
    { number: 2, name: 'Employment Details', description: 'Employee,employer Details', completed: currentStep > 2 },
    { number: 3, name: 'Banking Details', description: 'Card repayments,preference', completed: currentStep > 3 },
    { number: 4, name: 'Additional Cardholder', description: 'Additional cardholder details', completed: currentStep > 4 },
    { number: 5, name: 'Payment info', description: 'Employee,employer Details', completed: currentStep > 5 },
    { number: 6, name: 'Agreement and Declaration', description: 'agreement,signature', completed: currentStep > 6 },
  ];

  const renderInput = (
    label: string,
    field: keyof FormData,
    placeholder?: string,
    required = false,
    type: 'text' | 'date' | 'email' = 'text',
    listId?: string,
    suggestions: string[] = []
  ) => (
    <div>
      <label className="mb-2 block text-[14px] font-medium text-[#364153]">
        {label} {required && <span className="text-[#fb2c36]">*</span>}
      </label>
      <input
        type={type}
        list={listId}
        placeholder={placeholder}
        value={String(formData[field] ?? '')}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="h-[42px] w-full rounded-[8px] border border-[#d1d5dc] px-[13px] text-[15px] leading-[24px] text-[#0a0a0a] placeholder:text-[rgba(10,10,10,0.5)] focus:outline-none focus:ring-1 focus:ring-[#dc0032]"
      />
      {listId && suggestions.length > 0 && (
        <datalist id={listId}>
          {suggestions.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
      )}
    </div>
  );

  const renderUploadField = (
    label: string,
    field: keyof FormData,
    required = false,
    error?: string | null,
    accept?: string,
    validating = false
  ) => (
    <div>
      <label className="mb-2 block text-[14px] font-medium text-[#364153]">
        {label} {required && <span className="text-[#fb2c36]">*</span>}
      </label>
      <button
        type="button"
        onClick={() => fileInputRefs.current[String(field)]?.click()}
        disabled={validating}
        className={`flex h-[42px] w-full items-center justify-between rounded-[8px] border bg-white px-[13px] text-left ${
          error ? 'border-[#dc2626]' : 'border-[#d1d5dc]'
        } ${validating ? 'cursor-not-allowed opacity-70' : ''}`}
      >
        <span className={`truncate text-[15px] ${formData[field] ? 'text-[#0a0a0a]' : 'text-[rgba(10,10,10,0.5)]'}`}>
          {formData[field] ? String(formData[field]) : 'Upload document'}
        </span>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 text-[#161616]">
          <path d="M9 11V4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M6.5 6.5L9 4L11.5 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 10.5V13.5H14V10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <input
        ref={(el) => {
          fileInputRefs.current[String(field)] = el;
        }}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleDocumentUpload(field, e)}
      />
      {validating && <p className="mt-2 text-[12px] font-medium text-[#364153]">Validating National ID document...</p>}
      {error && <p className="mt-2 text-[12px] font-medium text-[#dc2626]">{error}</p>}
    </div>
  );

  const renderStepIcon = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path d="M8 7H16M8 12H16M8 17H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <rect x="4" y="4" width="16" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        );
      case 2:
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="9" cy="11" r="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M13.5 10H17.5M13.5 13H17.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        );
      case 3:
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <rect x="6" y="3.5" width="12" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M9 8H15M9 12H15M9 16H12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        );
      case 4:
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8.5 12L11 14.5L15.5 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 5:
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <rect x="3.5" y="6" width="17" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M3.5 10H20.5" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path d="M8 7H16M8 12H16M8 17H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <rect x="4" y="4" width="16" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        );
    }
  };

  const today = new Date();
  const weekday = today.toLocaleDateString('en-GB', { weekday: 'long' });
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const currentDateLabel = `${weekday}, ${day}.${month}.${year}`;
  const isTrackingFlow = trackingStage !== 'none';

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#f5f5f5] font-['Source_Sans_3','Roboto',Arial,sans-serif]">
      <div className="flex h-[72px] shrink-0 items-center border-b border-[#d7dce2] bg-white px-3">
        <button
          type="button"
          className="flex h-[52px] items-center justify-center rounded-[4px] px-[2px] hover:bg-[#f8fafc]"
          aria-label="Absa home"
        >
          <img src={absaLogo} alt="Absa logo" className="h-[44px] w-auto object-contain" />
        </button>
        <div className="mx-3 h-[22px] w-px bg-[#e5e7eb]" />
        <span className="text-[13px] font-medium text-[#364153]">Credit card application</span>
        <div className="ml-auto h-[18px] w-px bg-[#eef1f4]" aria-hidden />
        <span className="ml-3 text-[11px] text-[#64748b]">Personal</span>
        <span className="ml-2 rounded-full bg-[#fef2f2] px-2 py-[2px] text-[10px] font-semibold text-[#b42318]">
          Kenya
        </span>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="mx-auto flex h-full min-h-0 w-[96%] max-w-[1460px] items-start gap-10 pt-8">
          {!isTrackingFlow && (
            <aside className="sticky top-0 w-[300px] shrink-0 self-start pt-12">
              <ol className="relative border-s-2 border-[#e5e7eb] text-[#4b5563]">
                {steps.map((step, index) => {
                  const isActive = currentStep === step.number;
                  const isCompleted = step.completed;
                  const stepSpacing = index === steps.length - 1 ? '' : 'mb-17';

                  return (
                    <li key={step.number} className={`ms-7 ${stepSpacing}`}>
                      <span
                        className={`absolute -start-[17px] flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-[#f5f5f5] ${
                          isCompleted
                            ? 'bg-[#dc0032] text-white'
                            : isActive
                              ? 'bg-[#f3f4f6] text-[#4b5563]'
                              : 'bg-[#f3f4f6] text-[#6b7280]'
                        }`}
                      >
                        {isCompleted ? (
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12L10 17L19 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          renderStepIcon(step.number)
                        )}
                      </span>
                      <h3 className={`leading-tight ${isActive || isCompleted ? 'text-[#1f3b5b]' : 'text-[#334155]'} text-[19px] font-medium`}>
                        {step.name}
                      </h3>
                      <p className="text-[14px] text-[#64748b]">{step.description}</p>
                    </li>
                  );
                })}
              </ol>
            </aside>
          )}

        <div className="h-full min-h-0 flex-1 overflow-y-auto pb-20 pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="mb-6 flex justify-between">
            <h1 className="text-[42px] font-semibold leading-[1.1] text-black">Credit Card Application Form</h1>
            <div className="pt-4 text-[11px] text-[#2d2323]">{currentDateLabel}</div>
          </div>

          {isTrackingFlow ? (
            <div className="mx-auto max-w-[760px]">
              {trackingStage === 'mobile' && (
                <div className="rounded-[10px] border border-[#e5e7eb] bg-white p-[25px] shadow-[0px_2px_4px_rgba(16,24,40,0.14)]">
                  <h2 className="mb-2 text-[24px] font-bold text-[#101828]">Track your application</h2>
                  <p className="mb-5 text-[14px] text-[#4b5563]">
                    Enter your mobile number to receive an OTP and view your application progress.
                  </p>
                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-[#364153]">Mobile number</label>
                    <input
                      type="text"
                      value={trackingMobileNumber}
                      onChange={(e) => {
                        setTrackingMobileNumber(e.target.value);
                        setTrackingError(null);
                      }}
                      placeholder="e.g. +254722123456"
                      className="h-[42px] w-full rounded-[8px] border border-[#d1d5dc] px-[13px] text-[15px] focus:outline-none focus:ring-1 focus:ring-[#dc0032]"
                    />
                    {trackingError && <p className="mt-2 text-[12px] font-medium text-[#dc2626]">{trackingError}</p>}
                  </div>
                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSendTrackingOtp}
                      disabled={isSendingOtp}
                      className={`rounded-[8px] px-7 py-[11px] text-[16px] font-semibold text-white ${
                        isSendingOtp ? 'cursor-not-allowed bg-[#f78b7b]' : 'bg-[#f93f24] hover:bg-[#e02d14]'
                      }`}
                    >
                      {isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                  </div>
                </div>
              )}

              {trackingStage === 'otp' && (
                <div className="rounded-[10px] border border-[#e5e7eb] bg-white p-[25px] shadow-[0px_2px_4px_rgba(16,24,40,0.14)]">
                  <h2 className="mb-2 text-[24px] font-bold text-[#101828]">Enter OTP</h2>
                  <p className="mb-5 text-[14px] text-[#4b5563]">
                    We sent an OTP to <span className="font-semibold">{trackingMobileNumber}</span>. Enter it below to continue.
                  </p>
                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-[#364153]">OTP</label>
                    <input
                      type="text"
                      value={trackingOtp}
                      onChange={(e) => {
                        setTrackingOtp(e.target.value);
                        setTrackingError(null);
                      }}
                      placeholder="Enter 6-digit OTP"
                      className="h-[42px] w-full rounded-[8px] border border-[#d1d5dc] px-[13px] text-[15px] focus:outline-none focus:ring-1 focus:ring-[#dc0032]"
                    />
                    {trackingError && <p className="mt-2 text-[12px] font-medium text-[#dc2626]">{trackingError}</p>}
                  </div>
                  <div className="mt-5 flex justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setTrackingStage('mobile');
                        setTrackingError(null);
                      }}
                      className="rounded-[8px] border border-[#d1d5dc] bg-white px-6 py-[11px] text-[16px] font-semibold text-[#364153] hover:bg-gray-50"
                    >
                      Change mobile
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyTrackingOtp}
                      disabled={isVerifyingOtp}
                      className={`rounded-[8px] px-7 py-[11px] text-[16px] font-semibold text-white ${
                        isVerifyingOtp ? 'cursor-not-allowed bg-[#f78b7b]' : 'bg-[#f93f24] hover:bg-[#e02d14]'
                      }`}
                    >
                      {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                </div>
              )}

              {trackingStage === 'progress' && applicationProgress && (
                <div className="rounded-[10px] border border-[#e5e7eb] bg-white p-[25px] shadow-[0px_2px_4px_rgba(16,24,40,0.14)]">
                  <h2 className="mb-2 text-[24px] font-bold text-[#101828]">Application progress</h2>
                  <p className="mb-1 text-[14px] text-[#4b5563]">
                    Applicant: <span className="font-semibold text-[#101828]">{applicationProgress.applicantName}</span>
                  </p>
                  <p className="mb-1 text-[14px] text-[#4b5563]">
                    Application ID: <span className="font-semibold text-[#101828]">#{applicationProgress.applicationId}</span>
                  </p>
                  <p className="mb-6 text-[14px] text-[#4b5563]">
                    Current status:{' '}
                    <span className="rounded-full bg-[#fef2f2] px-2 py-[2px] text-[12px] font-semibold text-[#b42318]">
                      {applicationProgress.status}
                    </span>
                  </p>

                  <div className="space-y-3">
                    {applicationProgress.progress.map((item) => (
                      <div
                        key={item.stage}
                        className="flex items-center justify-between rounded-[8px] border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2"
                      >
                        <span className="text-[14px] text-[#101828]">{item.stage}</span>
                        <span
                          className={`rounded-full px-2 py-[2px] text-[11px] font-semibold ${
                            item.state === 'completed'
                              ? 'bg-[#ecfdf3] text-[#027a48]'
                              : item.state === 'in_progress'
                                ? 'bg-[#fff7ed] text-[#b54708]'
                                : 'bg-[#f2f4f7] text-[#667085]'
                          }`}
                        >
                          {item.state === 'in_progress'
                            ? 'In progress'
                            : item.state === 'completed'
                              ? 'Completed'
                              : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setTrackingStage('none');
                        setCurrentStep(7);
                        setTrackingError(null);
                      }}
                      className="rounded-[8px] border border-[#d1d5dc] bg-white px-6 py-[11px] text-[16px] font-semibold text-[#364153] hover:bg-gray-50"
                    >
                      Back to application
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
          <>
          {currentStep === 1 && (
            <>
              <div className="rounded-[10px] border border-[#e5e7eb] bg-white p-[25px] shadow-[0px_2px_4px_rgba(16,24,40,0.14)]">
                <div className="mb-6 flex items-center gap-2 border-b border-[#e5e7eb] pb-4">
                  <div className="h-[20px] w-[20px] text-[#f93f24]">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M4 18C4 14.6863 6.68629 12 10 12C13.3137 12 16 14.6863 16 18" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <h2 className="text-[34px] font-bold leading-[1.1] text-[#101828]">Personal Information</h2>
                </div>

                <div className="mb-6">
                  <label className="mb-2 block text-[14px] font-medium text-[#364153]">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="flex h-[128px] w-[128px] items-center justify-center overflow-hidden rounded-[10px] border-2 border-dashed border-[#d1d5dc] bg-[#f9fafb]">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Profile preview" className="h-full w-full object-cover" />
                      ) : (
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                          <circle cx="24" cy="18" r="8" stroke="#99A1AF" strokeWidth="4" />
                          <path d="M8 40C8 32 15.1634 25.6 24 25.6C32.8366 25.6 40 32 40 40" stroke="#99A1AF" strokeWidth="4" />
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="flex cursor-pointer items-center gap-2 rounded-[8px] bg-[#dc0032] px-4 py-2 text-white">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M8 3V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M13 8H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M8 3L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8 3L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-[15px] font-semibold">Upload Photo</span>
                        <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handlePhotoUpload} />
                      </label>
                      <span className="text-[12px] text-[#6a7282]">JPG,PNG</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {renderInput('First Name', 'firstName', 'Enter first name', true)}
                  {renderInput('Last Name', 'lastName', 'Enter last name', true)}
                  {renderInput('Date of Birth', 'dateOfBirth', 'mm/dd/yyyy', true, 'date')}
                  <div>
                    <label className="mb-2 block text-[13px] text-[#364153]">
                      Gender <span className="text-[#fb2c36]">*</span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="h-[42px] w-full rounded-[8px] border border-[#d1d5dc] px-[13px] text-[15px] focus:outline-none focus:ring-1 focus:ring-[#dc0032]"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {renderInput('Nationality', 'nationality', '', true)}
                  <div>
                    <label className="mb-2 block text-[13px] text-[#364153]">
                      Marital Status <span className="text-[#fb2c36]">*</span>
                    </label>
                    <select
                      value={formData.maritalStatus}
                      onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                      className="h-[42px] w-full rounded-[8px] border border-[#d1d5dc] px-[13px] text-[15px] focus:outline-none focus:ring-1 focus:ring-[#dc0032]"
                    >
                      <option value=""> </option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                  </div>
                  {renderInput('National ID', 'nationalId', 'Enter ID Number', true)}
                  {renderInput('Passport no.', 'passportNo', '', true)}
                  {renderInput(
                    'Place of Birth.',
                    'placeOfBirth',
                    'Start typing location',
                    true,
                    'text',
                    'personal-place-of-birth-options',
                    KENYAN_LOCATION_SUGGESTIONS
                  )}
                  {renderUploadField(
                    'Upload National ID',
                    'nationalIdUpload',
                    true,
                    nationalIdUploadError,
                    '.jpg,.jpeg,.png,.pdf',
                    isValidatingNationalIdUpload
                  )}
                  {renderInput('Mobile Number', 'mobileNumber', '', true)}
                  {renderUploadField('Upload Tax Pin certificate', 'taxPinUpload', true)}
                </div>

                <h3 className="mb-4 mt-4 text-[26px] font-bold leading-[1.1] text-[#364153]">Address Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  {renderInput('Physical address', 'physicalAddress', '', true)}
                  {renderInput(
                    'Town/City',
                    'townCity',
                    'Start typing town/city',
                    true,
                    'text',
                    'personal-town-city-options',
                    KENYAN_LOCATION_SUGGESTIONS
                  )}
                  {renderInput('PO Box', 'poBox')}
                  {renderInput('Postal code', 'postalCode')}
                  {renderInput('Email', 'email', '', true, 'email')}
                  {renderUploadField('Upload proof of address', 'proofOfAddressUpload', true)}
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleProceed}
                  disabled={isValidatingNationalIdUpload}
                  className={`rounded-[8px] px-7 py-[11px] text-[16px] font-semibold text-white ${
                    isValidatingNationalIdUpload ? 'cursor-not-allowed bg-[#f78b7b]' : 'bg-[#f93f24]'
                  }`}
                >
                  {isValidatingNationalIdUpload ? 'Validating ID...' : 'Proceed'}
                </button>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <EmploymentDetailsForm
              onBack={handleBack}
              onProceed={handleEmploymentProceed}
              initialData={employmentData ?? undefined}
            />
          )}

          {currentStep === 3 && (
            <BankingDetailsForm
              onBack={() => setCurrentStep(2)}
              onProceed={handleBankingProceed}
              initialData={bankingData ?? undefined}
            />
          )}

          {currentStep === 4 && (
            <AdditionalCardholderForm
              onBack={() => setCurrentStep(3)}
              onProceed={handleAdditionalCardholderProceed}
              initialData={additionalCardholderData ?? undefined}
            />
          )}

          {currentStep === 5 && (
            <PaymentInfoForm
              onBack={() => setCurrentStep(4)}
              onProceed={handlePaymentInfoProceed}
              initialData={paymentInfoData ?? undefined}
            />
          )}

          {currentStep === 6 && (
            <AgreementDeclarationForm
              onBack={() => setCurrentStep(5)}
              onSubmit={handleAgreementSubmit}
              onClearAll={handleClearForm}
              initialSignature={signatureDataUrl ?? undefined}
              submitLabel={editingFromReview ? 'Save & return to review' : 'Submit Registration'}
            />
          )}

          {currentStep === 7 && (
            <ReviewPage
              personalData={formData}
              photoPreview={photoPreview}
              employmentData={employmentData}
              bankingData={bankingData}
              additionalCardholderData={additionalCardholderData}
              paymentInfoData={paymentInfoData}
              signatureDataUrl={signatureDataUrl}
              onEdit={handleEditSection}
              onSubmit={handleFinalSubmit}
              isSubmitting={isSubmittingApplication}
            />
          )}
          </>
          )}

        </div>
      </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-30">
        <div className="pointer-events-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
}