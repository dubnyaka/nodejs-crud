import Joi from "../utils/joi.config";

export const authorSchema = Joi.object({
    name: Joi.string().trim().required(),
});

export const topAuthorsParamSchema = Joi.object({
    n: Joi.number().integer().positive().required().label("Author Count")
});