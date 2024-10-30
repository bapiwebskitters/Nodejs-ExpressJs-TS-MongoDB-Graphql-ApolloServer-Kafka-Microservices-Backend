import Joi from "joi";

export const branchCreateSchema = Joi.object({
    name: Joi.string().required().required(),
    desc: Joi.string().required(),
    status: Joi.string().valid("Active", "Inactive").default("Active"),
});

export const branchUpdateSchema = Joi.object({
    name: Joi.string(),
    desc: Joi.string(),
    status: Joi.string().valid("Active", "Inactive"),
});
