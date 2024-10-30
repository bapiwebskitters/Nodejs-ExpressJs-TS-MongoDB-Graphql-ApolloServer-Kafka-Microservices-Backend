// src/models/Permission.ts
import mongoose, { Schema, Model } from "mongoose";
import {IBranch} from '../interfaces/BranchInterface'

const branchSchema: Schema<IBranch> = new Schema(
  {
    name: { type: String, required: true , index:true},
    desc: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
    status: { type: String, default: "Active", enum: ["Active", "Inactive"] },
  },
  { timestamps: true, versionKey: false }
);

const Branch: Model<IBranch> = mongoose.model<IBranch>(
  "Branch",
  branchSchema
);

export default Branch;
