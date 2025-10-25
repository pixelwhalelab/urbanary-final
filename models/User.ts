import mongoose, { Schema, Document, models } from "mongoose";
import crypto from "crypto";

export interface IUser extends Document {
  userId?: string;
  name: string;
  email: string;
  phone: string;
  dob: Date;
  password: string;
  isVerified: boolean;
  otp?: string;
  otpExpiry?: Date;
  resetToken?: String;
  resetTokenExpiry?: Date;
  avatar?: string;
}

const UserSchema = new Schema<IUser>(
  {
    userId: { type: String, unique: true, default: () => crypto.randomUUID() },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    dob: { type: Date, required: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    avatar: { type: String },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
