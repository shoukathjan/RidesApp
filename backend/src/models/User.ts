import { Gender, GENDERS } from '@useme/shared';
import { Schema, model, InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String },
    phone: { type: String, required: true, unique: true, index: true },
    email: { type: String },
    gender: { type: String, enum: GENDERS },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema>;
export const UserModel = model('User', userSchema);
