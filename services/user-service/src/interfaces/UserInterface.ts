import mongoose, { Document, Types } from "mongoose";

export interface IUser extends Document {
  first_name: string;
  last_name: string;
  full_name?: string;
  email: string;
  phone?: string;
  role: mongoose.Types.ObjectId;
  password: string;
  status: "Active" | "Inactive";
  comparePassword(password: string): Promise<boolean>;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  zipcode?: string;
  landmark?: string;
  profile_image?: string;
  isDeleted: boolean;
}
