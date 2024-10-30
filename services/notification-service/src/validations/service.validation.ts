// src/validations/role.validation.ts
import Joi from "joi";

export const serviceCreateSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    status: Joi.string().valid("Active", "Inactive").default("Active"),
    isDeleted: Joi.boolean().default(false),
});

export const serviceUpdateSchema = Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    status: Joi.string().valid("Active", "Inactive"),
    isDeleted: Joi.boolean().default(false),
});

export const servicePaginateSchema = Joi.object({
    page: Joi.number().default(1),
    pageSize: Joi.number().default(10)
});

