import Joi from "../utils/joi.config";

export const bookSchema = Joi.object({
    title: Joi.string().trim().required(),
    year: Joi.number().integer().min(1).required(),
    author_id: Joi.number().integer().min(1).required(),
    genre: Joi.string().trim().required(),
    pages: Joi.number().integer().min(1).required()
});

export const uploadBooksSchema = Joi.array()
    .items(bookSchema)
    .min(1);

export const listBooksPaginatedSchema = Joi.object({
    authorId: Joi.number().integer().positive().optional(),
    genre: Joi.string().trim().optional(),
    page: Joi.number().integer().min(1).optional(),
    size: Joi.number().integer().min(1).optional()
});