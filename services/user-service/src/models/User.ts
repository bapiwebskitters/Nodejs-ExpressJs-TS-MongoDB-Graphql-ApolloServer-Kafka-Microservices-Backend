// src/models/User.ts
import mongoose, { Schema, Model, Document } from "mongoose";
import bcrypt from "bcrypt";
import { IUser } from "../interfaces/UserInterface";

const userSchema: Schema<IUser> = new Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    full_name: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    country: { type: String, default: "" },
    state: { type: String, default: "" },
    city: { type: String, default: "" },
    zipcode: { type: String, default: "" },
    landmark: { type: String, default: "" },
    profile_image: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

// Ensure indexes for unique fields
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

// Virtual field for role data
userSchema.virtual("role_data", {
  ref: "Role",
  localField: "role",
  foreignField: "_id",
  justOne: true,
});

// Password hashing
userSchema.pre<IUser>("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Method to check if the user's role matches the provided role ID
userSchema.methods.hasRole = function (
  roleId: mongoose.Types.ObjectId
): boolean {
  return this.role.toString() === roleId.toString();
};

userSchema.set("toJSON", { virtuals: true });

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
