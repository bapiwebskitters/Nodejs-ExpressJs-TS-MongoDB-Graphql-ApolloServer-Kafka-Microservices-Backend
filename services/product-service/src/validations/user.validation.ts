// src/validations/role.validation.ts
import Joi from "joi";

export const userCreateSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().required(),
  status: Joi.string().valid("Active", "Inactive").default("Active"),
});

export const userUpdateSchema = Joi.object({
  first_name: Joi.string(),
  last_name: Joi.string(),
  username: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string(),
  role: Joi.string(),
  status: Joi.string().valid("Active", "Inactive"),
});



