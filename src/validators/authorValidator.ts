import {NextFunction, Request, Response} from "express";
import {authorSchema, topAuthorsParamSchema} from "../schemas/authorSchemas";

export const validateCreateOrUpdateAuthor = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const {error, value} = authorSchema.validate(req.body);
    if (error) {
        res.status(400).json({errors: error.details.map(d => d.message)});
        return;
    }
    req.body = value;
    next();
};

export const validateTopAuthorsParam = (req: Request, res: Response, next: NextFunction): void => {
    const {error, value} = topAuthorsParamSchema.validate(req.params);
    if (error) {
        res.status(400).json({errors: error.details.map(d => d.message)});
        return;
    }
    req.params = value;
    next();
};