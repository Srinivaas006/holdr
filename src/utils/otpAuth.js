export async function sendOtp(email) {
  return Promise.resolve({ email, sent: false });
}

export async function verifyOtp(email, code) {
  return Promise.resolve({ email, verified: false, code });
}
