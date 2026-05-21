import React, { useEffect, useMemo, useState } from 'react';
import Footer from './Footer';

const absaLogo = new URL('../../assets/ABSA_Group_Limited_Logo.svg', import.meta.url).href;

type ReviewStatus = 'Submitted' | 'In Review' | 'Approved' | 'Rejected';
type ReviewerFilter = 'all' | 'Submitted' | 'In Review' | 'Approved' | 'Rejected';

interface UploadedFilePayload {
  fileName: string;
  dataUrl: string;
  mimeType: string;
}

interface ReviewerApplication {
  id: number;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  status: ReviewStatus;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewerNotes: string;
  payload: {
    personalDetails?: Record<string, string | null>;
    employmentData?: Record<string, string | null>;
    bankingData?: Record<string, string | null | Array<Record<string, string>>>;
    additionalCardholderData?: Record<string, string | null>;
    paymentInfoData?: Record<string, string | null>;
    signatureDataUrl?: string | null;
    attachments?: {
      profilePhoto?: UploadedFilePayload | null;
      personalDocuments?: Record<string, UploadedFilePayload>;
      employmentDocuments?: Record<string, UploadedFilePayload>;
    };
  } | null;
}

type LocalReviewState = {
  [applicationId: number]: {
    status: ReviewStatus;
    reviewedBy: string;
    reviewerNotes: string;
    isSaving: boolean;
  };
};

const statusBadgeClass: Record<ReviewStatus, string> = {
  Submitted: 'bg-[#fdecef] text-[#a0042f]',
  'In Review': 'bg-[#fff4e8] text-[#b76100]',
  Approved: 'bg-[#eaf8ef] text-[#117a3f]',
  Rejected: 'bg-[#fbe9ed] text-[#8d1131]',
};

const sidebarButtonClass: Record<ReviewerFilter, { active: string; idle: string; pill: string }> = {
  all: {
    active: 'border-[#98a2b3] bg-[#f2f4f7] text-[#344054]',
    idle: 'border-[#d0d5dd] bg-[#f8f9fb] text-[#475467] hover:bg-[#f2f4f7]',
    pill: 'bg-[#eaecf0] text-[#344054]',
  },
  Submitted: {
    active: 'border-[#dc0032] bg-[#fff1f3] text-[#9f1239]',
    idle: 'border-[#f3d4dc] bg-[#fff8fa] text-[#7a243b] hover:bg-[#fff1f4]',
    pill: 'bg-[#f9dbe3] text-[#8f2141]',
  },
  'In Review': {
    active: 'border-[#f59e0b] bg-[#fffbeb] text-[#9a6700]',
    idle: 'border-[#fde2b0] bg-[#fffaf0] text-[#8a5b05] hover:bg-[#fff5df]',
    pill: 'bg-[#fee7ba] text-[#8a5b05]',
  },
  Approved: {
    active: 'border-[#16a34a] bg-[#f0fdf4] text-[#166534]',
    idle: 'border-[#bde8cb] bg-[#f6fdf8] text-[#1f6b3f] hover:bg-[#ebf9f0]',
    pill: 'bg-[#cdeeda] text-[#1f6b3f]',
  },
  Rejected: {
    active: 'border-[#dc0032] bg-[#ffeef2] text-[#8d1131]',
    idle: 'border-[#f2ccd7] bg-[#fff7f9] text-[#7f1d35] hover:bg-[#ffeff4]',
    pill: 'bg-[#f5d6df] text-[#8d1131]',
  },
};

export default function ReviewerApprovalPage() {
  const [applications, setApplications] = useState<ReviewerApplication[]>([]);
  const [reviewState, setReviewState] = useState<LocalReviewState>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedApplication, setExpandedApplication] = useState<ReviewerApplication | null>(null);
  const [activeFilter, setActiveFilter] = useState<ReviewerFilter>('all');

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/reviewer/applications');
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || `Request failed with status ${response.status}`);
      }
      setApplications(result);
      setReviewState((prev) => {
        const next: LocalReviewState = { ...prev };
        for (const item of result as ReviewerApplication[]) {
          if (!next[item.id]) {
            next[item.id] = {
              status: item.status,
              reviewedBy: item.reviewedBy ?? '',
              reviewerNotes: item.reviewerNotes ?? '',
              isSaving: false,
            };
          }
        }
        return next;
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadApplications();
  }, []);

  const sortedApplications = useMemo(
    () => [...applications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [applications]
  );

  const statusCounts = useMemo(() => {
    const counts: Record<ReviewerFilter, number> = {
      all: applications.length,
      Submitted: 0,
      'In Review': 0,
      Approved: 0,
      Rejected: 0,
    };
    for (const item of applications) {
      counts[item.status] += 1;
    }
    return counts;
  }, [applications]);

  const filteredApplications = useMemo(
    () => sortedApplications.filter((application) => (activeFilter === 'all' ? true : application.status === activeFilter)),
    [sortedApplications, activeFilter]
  );

  const handleStateChange = (id: number, field: 'status' | 'reviewedBy' | 'reviewerNotes', value: string) => {
    setReviewState((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || { status: 'Submitted', reviewedBy: '', reviewerNotes: '', isSaving: false }),
        [field]: value,
      },
    }));
  };

  const handleSaveDecision = async (id: number) => {
    const current = reviewState[id];
    if (!current) return;

    try {
      setReviewState((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          isSaving: true,
        },
      }));

      const response = await fetch(`/api/reviewer/applications/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: current.status,
          reviewedBy: current.reviewedBy,
          reviewerNotes: current.reviewerNotes,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || `Request failed with status ${response.status}`);
      }

      setApplications((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: result.status as ReviewStatus,
                reviewedAt: result.reviewedAt,
                reviewedBy: result.reviewedBy,
                reviewerNotes: result.reviewerNotes,
              }
            : item
        )
      );
    } catch (saveError) {
      alert(saveError instanceof Error ? saveError.message : 'Failed to save decision.');
    } finally {
      setReviewState((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          isSaving: false,
        },
      }));
    }
  };

  const downloadFile = (fileName: string, dataUrl: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName || 'attachment';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderFieldRows = (title: string, data: Record<string, unknown> | undefined) => {
    if (!data) return null;
    const entries = Object.entries(data).filter(([, value]) => value !== null && value !== '');
    if (entries.length === 0) return null;

    return (
      <div className="rounded-[8px] border border-[#e5e7eb] bg-[#fafafa] p-3">
        <p className="mb-2 text-[12px] font-semibold uppercase text-[#6b7280]">{title}</p>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {entries.map(([key, value]) => (
            <div key={key} className="text-[13px] text-[#101828]">
              <span className="font-semibold">{key}:</span> {String(value)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#f5f5f5] font-['Source_Sans_3','Roboto',Arial,sans-serif]">
      <div className="flex h-[72px] shrink-0 items-center border-b border-[#d7dce2] bg-white px-3">
        <img src={absaLogo} alt="Absa logo" className="h-[44px] w-auto object-contain" />
        <div className="mx-3 h-[22px] w-px bg-[#e5e7eb]" />
        <span className="text-[13px] font-medium text-[#364153]">Application Review Console</span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-6 py-6 pb-24">
        <div className="flex h-full min-h-0 gap-5">
          <aside className="w-[280px] shrink-0 rounded-[10px] border border-[#e5e7eb] bg-white p-4 shadow-[0px_2px_4px_rgba(16,24,40,0.14)]">
            <h2 className="mb-4 text-[18px] font-bold text-[#101828]">Application Queues</h2>
            <div className="space-y-2">
              {[
                { key: 'all' as ReviewerFilter, label: 'Received applications' },
                { key: 'In Review' as ReviewerFilter, label: 'In review' },
                { key: 'Approved' as ReviewerFilter, label: 'Approved' },
                { key: 'Rejected' as ReviewerFilter, label: 'Rejected' },
              ].map((item) => {
                const isActive = activeFilter === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveFilter(item.key)}
                    className={`flex w-full items-center justify-between rounded-[8px] border px-3 py-2 text-left text-[14px] font-semibold ${
                      isActive ? sidebarButtonClass[item.key].active : sidebarButtonClass[item.key].idle
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className={`rounded-full px-2 py-[1px] text-[12px] ${sidebarButtonClass[item.key].pill}`}>
                      {statusCounts[item.key]}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => void loadApplications()}
              className="mt-4 w-full rounded-[8px] border border-[#d1d5dc] bg-white px-4 py-2 text-[14px] font-semibold text-[#364153] hover:bg-gray-50"
            >
              Refresh list
            </button>
          </aside>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="mb-6">
              <h1 className="text-[34px] font-bold leading-[1.1] text-[#101828]">Reviewer Dashboard</h1>
              <p className="mt-1 text-[14px] text-[#4b5563]">
                Showing: <span className="font-semibold">{activeFilter === 'all' ? 'Received applications' : activeFilter}</span>
              </p>
            </div>

            {loading && <p className="text-[14px] text-[#4b5563]">Loading applications...</p>}
            {error && <p className="mb-4 text-[14px] font-medium text-[#dc2626]">{error}</p>}

            {!loading && !error && filteredApplications.length === 0 && (
              <div className="rounded-[10px] border border-[#e5e7eb] bg-white p-6 text-[14px] text-[#4b5563]">
                No applications in this queue.
              </div>
            )}

            <div className="space-y-4">
              {filteredApplications.map((application) => {
            const local = reviewState[application.id] ?? {
              status: application.status,
              reviewedBy: application.reviewedBy ?? '',
              reviewerNotes: application.reviewerNotes ?? '',
              isSaving: false,
            };

            return (
              <div
                key={application.id}
                className="rounded-[10px] border border-[#e5e7eb] bg-white p-[22px] shadow-[0px_2px_4px_rgba(16,24,40,0.14)]"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#e5e7eb] pb-3">
                  <div>
                    <h2 className="text-[20px] font-bold text-[#101828]">
                      {application.firstName || application.lastName
                        ? `${application.firstName} ${application.lastName}`.trim()
                        : 'Unnamed Applicant'}
                    </h2>
                    <p className="text-[13px] text-[#4b5563]">
                      Submitted: {new Date(application.createdAt).toLocaleString('en-GB')}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-[4px] text-[12px] font-semibold ${statusBadgeClass[application.status]}`}>
                    {application.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-[8px] border border-[#e5e7eb] bg-[#fafafa] p-3">
                    <p className="text-[12px] font-semibold uppercase text-[#6b7280]">Applicant Details</p>
                    <p className="mt-1 text-[14px] text-[#101828]">Email: {application.email || '—'}</p>
                    <p className="text-[14px] text-[#101828]">Mobile: {application.mobileNumber || '—'}</p>
                    <p className="text-[14px] text-[#101828]">
                      National ID: {application.payload?.personalDetails?.nationalId || '—'}
                    </p>
                    <p className="text-[14px] text-[#101828]">Town/City: {application.payload?.personalDetails?.townCity || '—'}</p>
                  </div>

                  <div className="rounded-[8px] border border-[#e5e7eb] bg-[#fafafa] p-3">
                    <p className="text-[12px] font-semibold uppercase text-[#6b7280]">Financial Snapshot</p>
                    <p className="mt-1 text-[14px] text-[#101828]">
                      Employment: {application.payload?.employmentData?.employmentType || '—'}
                    </p>
                    <p className="text-[14px] text-[#101828]">
                      Monthly Salary: {application.payload?.employmentData?.monthlySalary || '—'}
                    </p>
                    <p className="text-[14px] text-[#101828]">
                      Recommended Card: {application.payload?.employmentData?.creditCardIncomeType || '—'}
                    </p>
                    <p className="text-[14px] text-[#101828]">
                      Debt Service Ratio: {application.payload?.bankingData?.debtServiceRatio || '—'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-[#364153]">Decision</label>
                    <select
                      value={local.status}
                      onChange={(event) => handleStateChange(application.id, 'status', event.target.value)}
                      className="h-[42px] w-full rounded-[8px] border border-[#d1d5dc] bg-white px-[13px] text-[15px] focus:outline-none focus:ring-1 focus:ring-[#dc0032]"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="In Review">In Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-[#364153]">Reviewed by</label>
                    <input
                      type="text"
                      value={local.reviewedBy}
                      onChange={(event) => handleStateChange(application.id, 'reviewedBy', event.target.value)}
                      placeholder="Reviewer name"
                      className="h-[42px] w-full rounded-[8px] border border-[#d1d5dc] px-[13px] text-[15px] focus:outline-none focus:ring-1 focus:ring-[#dc0032]"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="mb-2 block text-[14px] font-medium text-[#364153]">Notes</label>
                    <input
                      type="text"
                      value={local.reviewerNotes}
                      onChange={(event) => handleStateChange(application.id, 'reviewerNotes', event.target.value)}
                      placeholder="Decision notes"
                      className="h-[42px] w-full rounded-[8px] border border-[#d1d5dc] px-[13px] text-[15px] focus:outline-none focus:ring-1 focus:ring-[#dc0032]"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-[12px] text-[#6b7280]">
                    {application.reviewedAt ? `Last reviewed: ${new Date(application.reviewedAt).toLocaleString('en-GB')}` : 'Not yet reviewed'}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedApplication(application)}
                      className="rounded-[8px] border border-[#d1d5dc] bg-white p-[10px] text-[#364153] hover:bg-gray-50"
                      title="View full application details"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M16.5 4.5L19.5 7.5L8 19L4 20L5 16L16.5 4.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                        <path d="M14 7L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSaveDecision(application.id)}
                      disabled={local.isSaving}
                      className={`rounded-[8px] px-5 py-[10px] text-[14px] font-semibold text-white ${
                        local.isSaving ? 'cursor-not-allowed bg-[#f78b7b]' : 'bg-[#f93f24] hover:bg-[#e02d14]'
                      }`}
                    >
                      {local.isSaving ? 'Saving...' : 'Save decision'}
                    </button>
                  </div>
                </div>
              </div>
            );
              })}
            </div>
          </div>
        </div>
      </div>

      {expandedApplication && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-[1100px] overflow-y-auto rounded-[12px] border border-[#e5e7eb] bg-white p-5">
            <div className="mb-4 flex items-center justify-between border-b border-[#e5e7eb] pb-3">
              <h2 className="text-[22px] font-bold text-[#101828]">
                Full Application Details - #{expandedApplication.id}
              </h2>
              <button
                type="button"
                onClick={() => setExpandedApplication(null)}
                className="rounded-[8px] border border-[#d1d5dc] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#364153] hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              {renderFieldRows('Personal Details', expandedApplication.payload?.personalDetails)}
              {renderFieldRows('Employment Details', expandedApplication.payload?.employmentData)}
              {renderFieldRows('Banking Details', expandedApplication.payload?.bankingData as Record<string, unknown>)}
              {renderFieldRows('Additional Cardholder', expandedApplication.payload?.additionalCardholderData)}
              {renderFieldRows('Payment Information', expandedApplication.payload?.paymentInfoData)}

              <div className="rounded-[8px] border border-[#e5e7eb] bg-[#fafafa] p-3">
                <p className="mb-2 text-[12px] font-semibold uppercase text-[#6b7280]">Attachments</p>
                <div className="space-y-2">
                  {expandedApplication.payload?.attachments?.profilePhoto && (
                    <div className="flex items-center justify-between rounded-[8px] border border-[#e5e7eb] bg-white px-3 py-2">
                      <span className="text-[13px] text-[#101828]">
                        Profile Photo - {expandedApplication.payload.attachments.profilePhoto.fileName}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          downloadFile(
                            expandedApplication.payload?.attachments?.profilePhoto?.fileName || 'profile-photo',
                            expandedApplication.payload?.attachments?.profilePhoto?.dataUrl || ''
                          )
                        }
                        className="rounded-[8px] bg-[#f93f24] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#e02d14]"
                      >
                        Download
                      </button>
                    </div>
                  )}

                  {Object.entries(expandedApplication.payload?.attachments?.personalDocuments || {}).map(([field, file]) => (
                    <div key={field} className="flex items-center justify-between rounded-[8px] border border-[#e5e7eb] bg-white px-3 py-2">
                      <span className="text-[13px] text-[#101828]">
                        {field} - {file.fileName}
                      </span>
                      <button
                        type="button"
                        onClick={() => downloadFile(file.fileName || field, file.dataUrl)}
                        className="rounded-[8px] bg-[#f93f24] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#e02d14]"
                      >
                        Download
                      </button>
                    </div>
                  ))}

                  {Object.entries(expandedApplication.payload?.attachments?.employmentDocuments || {}).map(([field, file]) => (
                    <div key={field} className="flex items-center justify-between rounded-[8px] border border-[#e5e7eb] bg-white px-3 py-2">
                      <span className="text-[13px] text-[#101828]">
                        {field} - {file.fileName}
                      </span>
                      <button
                        type="button"
                        onClick={() => downloadFile(file.fileName || field, file.dataUrl)}
                        className="rounded-[8px] bg-[#f93f24] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#e02d14]"
                      >
                        Download
                      </button>
                    </div>
                  ))}

                  {!expandedApplication.payload?.attachments?.profilePhoto &&
                    Object.keys(expandedApplication.payload?.attachments?.personalDocuments || {}).length === 0 &&
                    Object.keys(expandedApplication.payload?.attachments?.employmentDocuments || {}).length === 0 && (
                      <p className="text-[13px] text-[#6b7280]">No downloadable attachments found for this application.</p>
                    )}
                </div>
              </div>

              {expandedApplication.payload?.signatureDataUrl && (
                <div className="rounded-[8px] border border-[#e5e7eb] bg-[#fafafa] p-3">
                  <p className="mb-2 text-[12px] font-semibold uppercase text-[#6b7280]">Signature</p>
                  <img
                    src={expandedApplication.payload.signatureDataUrl}
                    alt="Applicant signature"
                    className="max-h-[140px] rounded-[8px] border border-[#e5e7eb] bg-white p-1"
                  />
                  <button
                    type="button"
                    onClick={() => downloadFile(`signature-${expandedApplication.id}.png`, expandedApplication.payload?.signatureDataUrl || '')}
                    className="mt-2 rounded-[8px] bg-[#f93f24] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#e02d14]"
                  >
                    Download signature
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-30">
        <div className="pointer-events-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
}
