// src/validations/permission.validation.ts
import Joi from "joi";

export const createPermissionSchema = Joi.object({
  permissionName: Joi.string().required().messages({
    "string.empty": "Permission name is required",
  }),
  permissionKey: Joi.string().required().messages({
    "string.empty": "Permission key is required",
  }),
  desc: Joi.string().optional().allow(""),
});
