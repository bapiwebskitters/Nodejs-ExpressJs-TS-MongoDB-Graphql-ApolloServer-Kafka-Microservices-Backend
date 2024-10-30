import mongoose, {Document} from "mongoose";

export interface IBranch extends Document {
    name: string;
    desc: string;
    isDeleted: boolean;
    status: "Active" | "Inactive";
}
