import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const OTP_TTL_MINUTES = 10;

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtp(email) {
  const code = generateCode();
  const expiresAt = Timestamp.fromMillis(Date.now() + OTP_TTL_MINUTES * 60000);

  await setDoc(doc(db, "otps", email), {
    code,
    expiresAt,
    createdAt: serverTimestamp(),
  });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Holdr <onboarding@resend.dev>",
      to: [email],
      subject: "Your Holdr verification code",
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px">
          <h2 style="margin:0 0 8px">Your verification code</h2>
          <p style="color:#888;margin:0 0 24px">Enter this code to complete your Holdr signup.</p>
          <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#d9a441;margin-bottom:24px">
            ${code}
          </div>
          <p style="color:#888;font-size:13px">
            This code expires in ${OTP_TTL_MINUTES} minutes.<br/>
            If you didn't request this, ignore this email.
          </p>
        </div>
      `,
    }),
  });

  const result = await response.json();

  if (result.error) {
    throw new Error(result.error.message || "Failed to send code");
  }

  return { email, sent: true };
}

export async function verifyOtp(email, code) {
  const ref = doc(db, "otps", email);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return { verified: false, reason: "No code requested for this email." };
  }

  const data = snap.data();

  if (Date.now() > data.expiresAt.toMillis()) {
    await deleteDoc(ref);
    return { verified: false, reason: "Code expired, request a new one." };
  }

  if (data.code !== code) {
    return { verified: false, reason: "Incorrect code." };
  }

  await deleteDoc(ref);
  return { verified: true };
}