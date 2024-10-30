import mongoose, { Schema, Model, Document } from "mongoose";
import bcrypt from "bcrypt";
import { IService } from "../interfaces/ServiceInterface";


const serviceSchema: Schema<IService> = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

// Ensure indexes for unique fields
serviceSchema.index({ name: 1 }, { unique: true });


serviceSchema.set("toJSON", { virtuals: true });

const Service: Model<IService> = mongoose.model<IService>("Service", serviceSchema);
export default Service;
