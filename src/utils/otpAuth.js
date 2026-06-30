import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import emailjs from "@emailjs/browser";
import { db } from "../firebase/config";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
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

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    { to_email: email, otp_code: code },
    PUBLIC_KEY
  );

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