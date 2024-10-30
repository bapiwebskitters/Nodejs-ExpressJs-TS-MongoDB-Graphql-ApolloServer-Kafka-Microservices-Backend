// src/validations/role.validation.ts
import Joi from "joi";

export const createRoleSchema = Joi.object({
  roleDisplayName: Joi.string().allow("").optional(),
  role: Joi.string().allow("").optional(),
  rolegroup: Joi.string().valid("backend", "frontend").optional(),
  desc: Joi.string().allow("").optional(),
  isDeleted: Joi.boolean().optional(),
  status: Joi.string().valid("Active", "Inactive").optional(),
  permissions: Joi.array().items(Joi.string()).optional(),
});

export const permissionIdsSchema = Joi.array().items(Joi.string()).required();
