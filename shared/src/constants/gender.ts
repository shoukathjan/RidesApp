export const GENDERS = ['male', 'female', 'other'] as const;
export type Gender = (typeof GENDERS)[number];

export const GenderLabel: Record<Gender, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
};
