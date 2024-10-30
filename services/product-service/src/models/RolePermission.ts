// src/models/RolePermission.ts
import mongoose, { Document, Schema, Model } from "mongoose";

export interface IRolePermission extends Document {
  role: mongoose.Types.ObjectId;
  permission: mongoose.Types.ObjectId;
  isDeleted: boolean;
  status: "Active" | "Inactive";
}

const rolePermissionSchema: Schema<IRolePermission> = new Schema(
  {
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    permission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Permission",
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
    status: { type: String, default: "Active", enum: ["Active", "Inactive"] },
  },
  { timestamps: true, versionKey: false }
);

rolePermissionSchema.index({ role: 1, permission: 1 }, { unique: true });

const RolePermission: Model<IRolePermission> = mongoose.model<IRolePermission>(
  "RolePermission",
  rolePermissionSchema
);

export default RolePermission;
