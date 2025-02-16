import {Request, Response, NextFunction, ErrorRequestHandler} from "express";
import {ApiError} from "../errors/ApiError";

export const jsonErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof SyntaxError && "body" in err) {
        res.status(400).json({error: "Invalid JSON payload"});
        return;
    }
    next(err);
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({error: err.message});
    } else {
        res.status(500).json({error: "Internal server error"});
    }
};
