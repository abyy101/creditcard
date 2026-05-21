import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sqlite3 from 'sqlite3';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'applications.db');
const db = new sqlite3.Database(dbPath);

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row ?? null);
    });
  });

await run(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    mobile_number TEXT,
    payload_json TEXT NOT NULL
  )
`);

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/applications', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      res.status(400).json({ message: 'Invalid payload.' });
      return;
    }

    const personalDetails = payload.personalDetails ?? {};
    const firstName = typeof personalDetails.firstName === 'string' ? personalDetails.firstName : null;
    const lastName = typeof personalDetails.lastName === 'string' ? personalDetails.lastName : null;
    const email = typeof personalDetails.email === 'string' ? personalDetails.email : null;
    const mobileNumberRaw = typeof personalDetails.mobileNumber === 'string' ? personalDetails.mobileNumber : null;
    const mobileNumber = mobileNumberRaw ? normalizeMobileNumber(mobileNumberRaw) : null;
    const createdAt = new Date().toISOString();

    const result = await run(
      `
        INSERT INTO applications (
          created_at, first_name, last_name, email, mobile_number, payload_json
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      [createdAt, firstName, lastName, email, mobileNumber, JSON.stringify(payload)]
    );

    res.status(201).json({ id: result.lastID, createdAt });
  } catch (error) {
    console.error('Failed to save application:', error);
    res.status(500).json({ message: 'Failed to save application.' });
  }
});

app.get('/api/applications', async (_req, res) => {
  try {
    const rows = await all(
      `
        SELECT id, created_at AS createdAt, first_name AS firstName, last_name AS lastName, email, mobile_number AS mobileNumber
        FROM applications
        ORDER BY id DESC
      `
    );
    res.json(rows);
  } catch (error) {
    console.error('Failed to load applications:', error);
    res.status(500).json({ message: 'Failed to load applications.' });
  }
});

const otpStore = new Map();
const OTP_TTL_MS = 5 * 60 * 1000;
const MOBILE_REGEX = /^[+\d][\d\s-]{7,}$/;
const SMS_PROVIDER = process.env.SMS_PROVIDER || 'africastalking';
const AFRICASTALKING_USERNAME = (process.env.AFRICASTALKING_USERNAME || 'sandbox').trim();
const AFRICASTALKING_API_KEY = (process.env.AFRICASTALKING_API_KEY || '').trim();
const AFRICASTALKING_SENDER_ID = (process.env.AFRICASTALKING_SENDER_ID || '').trim();

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
  if (SMS_PROVIDER !== 'africastalking') {
    throw new Error(`Unsupported SMS_PROVIDER: ${SMS_PROVIDER}`);
  }
  if (!AFRICASTALKING_API_KEY) {
    throw new Error('SMS service not configured. Set AFRICASTALKING_API_KEY in your environment.');
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
  return resultText;
};

app.post('/api/progress/send-otp', async (req, res) => {
  try {
    const mobileNumberRaw = req.body?.mobileNumber;
    const mobileNumber = normalizeMobileNumber(mobileNumberRaw);
    if (!mobileNumber || !MOBILE_REGEX.test(mobileNumber)) {
      res.status(400).json({ message: 'Enter a valid mobile number.' });
      return;
    }

    const application = await get(
      `
        SELECT id
        FROM applications
        WHERE mobile_number = ?
        ORDER BY id DESC
        LIMIT 1
      `,
      [mobileNumber]
    );
    if (!application) {
      res.status(404).json({ message: 'No application found for this mobile number.' });
      return;
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    otpStore.set(mobileNumber, {
      otp,
      expiresAt: Date.now() + OTP_TTL_MS,
    });

    await sendOtpSms({ to: mobileNumber, otp });
    console.log(`OTP sent to ${mobileNumber}`);
    res.json({
      message: 'OTP sent successfully.',
    });
  } catch (error) {
    console.error('Failed to send OTP:', error);
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to send OTP.',
    });
  }
});

app.post('/api/progress/verify-otp', (req, res) => {
  const mobileNumberRaw = req.body?.mobileNumber;
  const otpRaw = req.body?.otp;
  const mobileNumber = normalizeMobileNumber(mobileNumberRaw);
  const otp = typeof otpRaw === 'string' ? otpRaw.trim() : '';

  if (!mobileNumber || !otp) {
    res.status(400).json({ message: 'Mobile number and OTP are required.' });
    return;
  }

  const record = otpStore.get(mobileNumber);
  if (!record) {
    res.status(400).json({ message: 'OTP not found. Please request a new OTP.' });
    return;
  }
  if (Date.now() > record.expiresAt) {
    otpStore.delete(mobileNumber);
    res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    return;
  }
  if (record.otp !== otp) {
    res.status(400).json({ message: 'Invalid OTP.' });
    return;
  }

  otpStore.delete(mobileNumber);
  res.json({ message: 'OTP verified successfully.' });
});

app.get('/api/progress', async (req, res) => {
  try {
    const mobileNumberRaw = req.query.mobileNumber;
    const mobileNumber = normalizeMobileNumber(mobileNumberRaw);
    if (!mobileNumber || !MOBILE_REGEX.test(mobileNumber)) {
      res.status(400).json({ message: 'Enter a valid mobile number.' });
      return;
    }

    const application = await get(
      `
        SELECT id, created_at AS createdAt, first_name AS firstName, last_name AS lastName
        FROM applications
        WHERE mobile_number = ?
        ORDER BY id DESC
        LIMIT 1
      `,
      [mobileNumber]
    );
    if (!application) {
      res.status(404).json({ message: 'No application found for this mobile number.' });
      return;
    }

    res.json({
      applicationId: application.id,
      applicantName: [application.firstName, application.lastName].filter(Boolean).join(' ').trim() || 'Applicant',
      mobileNumber,
      status: 'Submitted',
      submittedAt: application.createdAt,
      progress: [
        { stage: 'Application received', state: 'completed' },
        { stage: 'Document verification', state: 'in_progress' },
        { stage: 'Credit review', state: 'pending' },
        { stage: 'Final decision', state: 'pending' },
      ],
    });
  } catch (error) {
    console.error('Failed to fetch progress:', error);
    res.status(500).json({ message: 'Failed to fetch progress.' });
  }
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
