import mongoose, {Document} from "mongoose";

export interface IService extends Document {
    name: string,
    description : string,
    status: "Active" | "Inactive",
    isDeleted:Boolean
}

