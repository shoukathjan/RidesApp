import { env } from '../config/env';

/**
 * OTP service — STUBBED. In development every phone number accepts the fixed
 * DEV_OTP code. Swap the body of these functions for a real SMS provider
 * (MSG91/Twilio/Firebase) later without changing callers.
 */
export async function sendOtp(phone: string): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(`[otp] (stub) code for ${phone} is ${env.devOtp}`);
}

export function verifyOtp(_phone: string, code: string): boolean {
  return code === env.devOtp;
}
