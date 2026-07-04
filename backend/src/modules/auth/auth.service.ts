import bcrypt from 'bcryptjs';
import { AdminModel } from '../../models/Admin';
import { DriverModel } from '../../models/Driver';
import { UserModel } from '../../models/User';
import { sendOtp, verifyOtp } from '../../services/otp';
import { badRequest, notFound, unauthorized } from '../../utils/http';
import { signToken } from '../../utils/jwt';

export async function requestOtp(phone: string): Promise<void> {
  if (!phone) throw badRequest('phone is required');
  await sendOtp(phone);
}

/** Customer login: verify OTP, auto-create the user on first login. */
export async function verifyCustomerOtp(phone: string, otp: string) {
  if (!verifyOtp(phone, otp)) throw unauthorized('Invalid OTP');
  let user = await UserModel.findOne({ phone });
  if (!user) user = await UserModel.create({ phone });
  const token = signToken({ sub: String(user._id), role: 'customer' });
  return { token, user };
}

/** Driver login: verify OTP; driver must have registered first. */
export async function verifyDriverOtp(phone: string, otp: string) {
  if (!verifyOtp(phone, otp)) throw unauthorized('Invalid OTP');
  const driver = await DriverModel.findOne({ phone });
  if (!driver) throw notFound('No driver registered with this phone');
  const token = signToken({ sub: String(driver._id), role: 'driver' });
  return { token, driver };
}

export async function adminLogin(email: string, password: string) {
  const admin = await AdminModel.findOne({ email });
  if (!admin) throw unauthorized('Invalid credentials');
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) throw unauthorized('Invalid credentials');
  const token = signToken({ sub: String(admin._id), role: 'admin' });
  return { token, admin: { id: String(admin._id), email: admin.email } };
}
