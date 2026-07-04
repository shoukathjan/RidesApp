import { Gender, GENDERS } from '@useme/shared';
import { UserModel } from '../../models/User';
import { badRequest, notFound } from '../../utils/http';

function isProfileComplete(user: {
  name?: string | null;
  gender?: string | null;
}): boolean {
  return Boolean(user.name?.trim() && user.gender && GENDERS.includes(user.gender as Gender));
}

function toProfile(user: {
  _id: unknown;
  phone: string;
  name?: string | null;
  email?: string | null;
  gender?: string | null;
  createdAt: Date;
}) {
  return {
    id: String(user._id),
    phone: user.phone,
    name: user.name ?? undefined,
    email: user.email ?? undefined,
    gender: user.gender as Gender | undefined,
    profileComplete: isProfileComplete(user),
    createdAt: user.createdAt.toISOString(),
  };
}

export async function getProfile(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) throw notFound('User not found');
  return toProfile(user);
}

export async function updateProfile(
  userId: string,
  data: { name?: string; email?: string; gender?: Gender },
) {
  const updates: { name?: string; email?: string; gender?: Gender } = {};

  if (data.name !== undefined) {
    const name = data.name.trim();
    if (name.length < 2) throw badRequest('Name must be at least 2 characters');
    updates.name = name;
  }

  if (data.email !== undefined) {
    updates.email = data.email.trim() || undefined;
  }

  if (data.gender !== undefined) {
    if (!GENDERS.includes(data.gender)) throw badRequest('Invalid gender');
    updates.gender = data.gender;
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true },
  );
  if (!user) throw notFound('User not found');
  return toProfile(user);
}
