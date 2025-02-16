import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { ApiError } from "../errors/ApiError";
import {
    findBookById,
    insertBook,
    updateBookById,
    deleteBookById,
    findBooksPaginated,
    uploadBooks,
} from "../models/bookModel";
import { findAuthorById } from "../models/authorModel";

export const getBooksPaginated = asyncHandler(async (req: Request, res: Response) => {
    const em = req.app.locals.orm.em.fork();
    const { authorId, genre, year, page, size } = req.body;
    const params = {
        authorId: authorId ? Number(authorId) : undefined,
        genre: genre ? String(genre) : undefined,
        year: year ? Number(year) : undefined,
        page: page ? Number(page) : undefined,
        size: size ? Number(size) : undefined,
    };

    const result = await findBooksPaginated(em, params);
    res.status(200).json(result);
});

export const getBookById = asyncHandler(async (req: Request, res: Response) => {
    const em = req.app.locals.orm.em.fork();
    const bookId = Number(req.params.id);
    const book = await findBookById(em, bookId);
    res.status(200).json(book);
});

export const createBook = asyncHandler(async (req: Request, res: Response) => {
    const em = req.app.locals.orm.em.fork();
    const { author_id } = req.body;
    const author = await findAuthorById(em, author_id);
    if (!author) {
        throw new ApiError(`Author with id ${author_id} not found`, 400);
    }
    const insertedBook = await insertBook(em, req.body);
    res.status(201).json(insertedBook);
});

export const updateBook = asyncHandler(async (req: Request, res: Response) => {
    const em = req.app.locals.orm.em.fork();
    const bookId = Number(req.params.id);
    const updatedBook = await updateBookById(em, bookId, req.body);
    res.status(200).json(updatedBook);
});

export const deleteBook = asyncHandler(async (req: Request, res: Response) => {
    const em = req.app.locals.orm.em.fork();
    const bookId = Number(req.params.id);
    await deleteBookById(em, bookId);
    res.status(204).send();
});

export const bulkUploadBooks = asyncHandler(async (req: Request, res: Response) => {
    const em = req.app.locals.orm.em.fork();
    const books = req.body;
    const importedCount = await uploadBooks(em, books);
    res.status(201).json({ importedCount });
});
