import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const baseOptions = {
    abortEarly: false,
    stripUnknown: true,
    errors: { label: "key" }
} as const;

export const idParamSchema = Joi.object({
    id: Joi.number().integer().positive().required()
}).options(baseOptions);

export const validateIdParam = (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = idParamSchema.validate(req.params);
    if (error) {
        res.status(400).json({ errors: error.details.map(d => d.message) });
        return;
    }
    req.params = value;
    next();
};
