import {NextFunction, Request, Response} from "express";
import {bookSchema, listBooksPaginatedSchema, uploadBooksSchema} from "../schemas/bookSchemas";

export const validateCreateOrUpdateBook = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const { error, value } = bookSchema.validate(req.body);
    if (error) {
        res.status(400).json({ errors: error.details.map(d => d.message) });
        return;
    }
    req.body = value;
    next();
};

export const validateUploadBooks = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const { error, value } = uploadBooksSchema.validate(req.body);
    if (error) {
        res.status(400).json({ errors: error.details.map(d => d.message) });
        return;
    }
    req.body = value;
    next();
};

export const validateListBooksPaginated = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const { error, value } = listBooksPaginatedSchema.validate(req.body);
    if (error) {
        res.status(400).json({ errors: error.details.map(d => d.message) });
        return;
    }
    req.body = value;
    next();
};