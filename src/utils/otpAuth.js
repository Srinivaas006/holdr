import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;
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

  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject: "Your Holdr verification code",
      from_name: "Holdr",
      email: email,
      message: `Your verification code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes. If you didn't request this, ignore this email.`,
    }),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to send code");
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