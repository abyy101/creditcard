const MOBILE_REGEX = /^[+\d][\d\s-]{7,}$/;
const OTP_TTL_MS = 5 * 60 * 1000;

const getStore = () => {
  if (!globalThis.__creditcardStore) {
    globalThis.__creditcardStore = {
      nextId: 1,
      applications: [],
      otpStore: {},
    };
  }
  return globalThis.__creditcardStore;
};

const readJsonBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const normalizeMobileNumber = (value) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';

  const digitsOnly = trimmed.replace(/[^\d+]/g, '');
  if (digitsOnly.startsWith('+')) {
    return `+${digitsOnly.slice(1).replace(/\D/g, '')}`;
  }
  if (digitsOnly.startsWith('254')) {
    return `+${digitsOnly}`;
  }
  if (digitsOnly.startsWith('0')) {
    return `+254${digitsOnly.slice(1)}`;
  }
  return digitsOnly;
};

const sendOtpSms = async ({ to, otp }) => {
  const SMS_PROVIDER = process.env.SMS_PROVIDER || 'africastalking';
  const AFRICASTALKING_USERNAME = (process.env.AFRICASTALKING_USERNAME || 'sandbox').trim();
  const AFRICASTALKING_API_KEY = (process.env.AFRICASTALKING_API_KEY || '').trim();
  const AFRICASTALKING_SENDER_ID = (process.env.AFRICASTALKING_SENDER_ID || '').trim();

  if (SMS_PROVIDER !== 'africastalking') {
    throw new Error(`Unsupported SMS_PROVIDER: ${SMS_PROVIDER}`);
  }
  if (!AFRICASTALKING_API_KEY) {
    throw new Error('SMS service not configured. Set AFRICASTALKING_API_KEY in environment variables.');
  }

  const message = `Your Absa credit card application OTP is ${otp}. It expires in 5 minutes.`;
  const isSandbox = AFRICASTALKING_USERNAME.toLowerCase() === 'sandbox';
  const messagingUrl = isSandbox
    ? 'https://api.sandbox.africastalking.com/version1/messaging'
    : 'https://api.africastalking.com/version1/messaging';
  const form = new URLSearchParams({
    username: AFRICASTALKING_USERNAME,
    to,
    message,
  });
  if (AFRICASTALKING_SENDER_ID) {
    form.set('from', AFRICASTALKING_SENDER_ID);
  }

  const response = await fetch(messagingUrl, {
    method: 'POST',
    headers: {
      apiKey: AFRICASTALKING_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: form.toString(),
  });

  const resultText = await response.text();
  if (!response.ok) {
    throw new Error(`SMS delivery failed (${response.status}): ${resultText}`);
  }
};

const json = (res, statusCode, payload) => {
  res.status(statusCode).json(payload);
};

const getProgressByStatus = (status) => {
  const progressByStatus = {
    Submitted: [
      { stage: 'Application received', state: 'completed' },
      { stage: 'Document verification', state: 'in_progress' },
      { stage: 'Credit review', state: 'pending' },
      { stage: 'Final decision', state: 'pending' },
    ],
    'In Review': [
      { stage: 'Application received', state: 'completed' },
      { stage: 'Document verification', state: 'completed' },
      { stage: 'Credit review', state: 'in_progress' },
      { stage: 'Final decision', state: 'pending' },
    ],
    Approved: [
      { stage: 'Application received', state: 'completed' },
      { stage: 'Document verification', state: 'completed' },
      { stage: 'Credit review', state: 'completed' },
      { stage: 'Final decision', state: 'completed' },
    ],
    Rejected: [
      { stage: 'Application received', state: 'completed' },
      { stage: 'Document verification', state: 'completed' },
      { stage: 'Credit review', state: 'completed' },
      { stage: 'Final decision', state: 'completed' },
    ],
  };
  return progressByStatus[status] || progressByStatus.Submitted;
};

export default async function handler(req, res) {
  const store = getStore();
  const url = new URL(req.url || '/api', 'http://localhost');
  const path = url.pathname;
  const method = req.method || 'GET';

  if (path === '/api/health' && method === 'GET') {
    return json(res, 200, { ok: true });
  }

  if (path === '/api/applications' && method === 'POST') {
    const payload = await readJsonBody(req);
    if (!payload || typeof payload !== 'object') {
      return json(res, 400, { message: 'Invalid payload.' });
    }

    const personalDetails = payload.personalDetails ?? {};
    const id = store.nextId++;
    const createdAt = new Date().toISOString();
    const record = {
      id,
      createdAt,
      firstName: typeof personalDetails.firstName === 'string' ? personalDetails.firstName : '',
      lastName: typeof personalDetails.lastName === 'string' ? personalDetails.lastName : '',
      email: typeof personalDetails.email === 'string' ? personalDetails.email : '',
      mobileNumber: normalizeMobileNumber(personalDetails.mobileNumber),
      payload,
      status: 'Submitted',
      reviewedAt: null,
      reviewedBy: null,
      reviewerNotes: '',
    };
    store.applications.push(record);
    return json(res, 201, { id, createdAt });
  }

  if (path === '/api/applications' && method === 'GET') {
    const rows = [...store.applications]
      .sort((a, b) => b.id - a.id)
      .map((item) => ({
        id: item.id,
        createdAt: item.createdAt,
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email,
        mobileNumber: item.mobileNumber,
        status: item.status,
        reviewedAt: item.reviewedAt,
        reviewedBy: item.reviewedBy,
        reviewerNotes: item.reviewerNotes,
      }));
    return json(res, 200, rows);
  }

  if (path === '/api/reviewer/applications' && method === 'GET') {
    const rows = [...store.applications].sort((a, b) => b.id - a.id);
    return json(res, 200, rows);
  }

  if (path.startsWith('/api/reviewer/applications/') && path.endsWith('/status') && method === 'PATCH') {
    const match = path.match(/^\/api\/reviewer\/applications\/(\d+)\/status$/);
    const id = match ? Number(match[1]) : NaN;
    if (!Number.isInteger(id) || id <= 0) {
      return json(res, 400, { message: 'Invalid application id.' });
    }
    const body = await readJsonBody(req);
    const allowedStatuses = new Set(['Submitted', 'In Review', 'Approved', 'Rejected']);
    const nextStatus = typeof body.status === 'string' ? body.status.trim() : '';
    if (!allowedStatuses.has(nextStatus)) {
      return json(res, 400, { message: 'Invalid status.' });
    }

    const item = store.applications.find((entry) => entry.id === id);
    if (!item) {
      return json(res, 404, { message: 'Application not found.' });
    }

    item.status = nextStatus;
    item.reviewedAt = new Date().toISOString();
    item.reviewedBy = typeof body.reviewedBy === 'string' ? body.reviewedBy.trim() : null;
    item.reviewerNotes = typeof body.reviewerNotes === 'string' ? body.reviewerNotes.trim() : '';

    return json(res, 200, {
      id: item.id,
      status: item.status,
      reviewedAt: item.reviewedAt,
      reviewedBy: item.reviewedBy,
      reviewerNotes: item.reviewerNotes,
    });
  }

  if (path === '/api/progress/send-otp' && method === 'POST') {
    const body = await readJsonBody(req);
    const mobileNumber = normalizeMobileNumber(body.mobileNumber);
    if (!mobileNumber || !MOBILE_REGEX.test(mobileNumber)) {
      return json(res, 400, { message: 'Enter a valid mobile number.' });
    }
    const application = [...store.applications].reverse().find((item) => item.mobileNumber === mobileNumber);
    if (!application) {
      return json(res, 404, { message: 'No application found for this mobile number.' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    store.otpStore[mobileNumber] = {
      otp,
      expiresAt: Date.now() + OTP_TTL_MS,
    };

    try {
      await sendOtpSms({ to: mobileNumber, otp });
    } catch (error) {
      return json(res, 500, {
        message: error instanceof Error ? error.message : 'Failed to send OTP.',
      });
    }
    return json(res, 200, { message: 'OTP sent successfully.' });
  }

  if (path === '/api/progress/verify-otp' && method === 'POST') {
    const body = await readJsonBody(req);
    const mobileNumber = normalizeMobileNumber(body.mobileNumber);
    const otp = typeof body.otp === 'string' ? body.otp.trim() : '';
    if (!mobileNumber || !otp) {
      return json(res, 400, { message: 'Mobile number and OTP are required.' });
    }

    const record = store.otpStore[mobileNumber];
    if (!record) {
      return json(res, 400, { message: 'OTP not found. Please request a new OTP.' });
    }
    if (Date.now() > record.expiresAt) {
      delete store.otpStore[mobileNumber];
      return json(res, 400, { message: 'OTP has expired. Please request a new OTP.' });
    }
    if (record.otp !== otp) {
      return json(res, 400, { message: 'Invalid OTP.' });
    }

    delete store.otpStore[mobileNumber];
    return json(res, 200, { message: 'OTP verified successfully.' });
  }

  if (path === '/api/progress' && method === 'GET') {
    const mobileNumber = normalizeMobileNumber(url.searchParams.get('mobileNumber') || '');
    if (!mobileNumber || !MOBILE_REGEX.test(mobileNumber)) {
      return json(res, 400, { message: 'Enter a valid mobile number.' });
    }

    const application = [...store.applications].reverse().find((item) => item.mobileNumber === mobileNumber);
    if (!application) {
      return json(res, 404, { message: 'No application found for this mobile number.' });
    }

    return json(res, 200, {
      applicationId: application.id,
      applicantName: `${application.firstName || ''} ${application.lastName || ''}`.trim() || 'Applicant',
      mobileNumber,
      status: application.status,
      submittedAt: application.createdAt,
      progress: getProgressByStatus(application.status),
    });
  }

  return json(res, 404, { message: 'Not found.' });
}
