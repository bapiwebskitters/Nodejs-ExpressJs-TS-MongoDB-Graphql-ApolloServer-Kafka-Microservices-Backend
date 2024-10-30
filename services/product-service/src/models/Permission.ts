// src/models/Permission.ts
import mongoose, { Document, Schema, Model } from "mongoose";

export interface IPermission extends Document {
  permissionName: string;
  permissionKey: string;
  desc: string;
  isDeleted: boolean;
  status: "Active" | "Inactive";
}

const permissionSchema: Schema<IPermission> = new Schema(
  {
    permissionName: { type: String, required: true },
    permissionKey: { type: String, required: true, unique: true, index: true },
    desc: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
    status: { type: String, default: "Active", enum: ["Active", "Inactive"] },
  },
  { timestamps: true, versionKey: false }
);

const Permission: Model<IPermission> = mongoose.model<IPermission>(
  "Permission",
  permissionSchema
);

export default Permission;
