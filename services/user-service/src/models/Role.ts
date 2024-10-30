// src/models/Role.ts
import mongoose, { Document, Schema, Model } from "mongoose";

const roleGroup = ["backend", "frontend"] as const;
const status = ["Active", "Inactive"] as const;

export interface IRole extends Document {
  roleDisplayName: string;
  role: string;
  rolegroup: (typeof roleGroup)[number];
  desc: string;
  isDeleted: boolean;
  status: (typeof status)[number];
}

const roleSchema: Schema<IRole> = new Schema(
  {
    roleDisplayName: { type: String, default: "" },
    role: { type: String, default: "" },
    rolegroup: { type: String, default: "backend", enum: roleGroup },
    desc: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
    status: { type: String, default: "Active", enum: status },
  },
  { timestamps: true, versionKey: false }
);

// Adding the virtual field
roleSchema.virtual("permissions", {
  ref: "RolePermission",
  localField: "_id",
  foreignField: "role",
  justOne: false,
});

roleSchema.set("toJSON", { virtuals: true });

const Role: Model<IRole> = mongoose.model<IRole>("Role", roleSchema);

export default Role;
