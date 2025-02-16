import { Request, Response } from "express";
import {
    listAuthors,
    findAuthorById,
    insertAuthor,
    updateAuthorById,
    deleteAuthorById,
    getTopAuthors,
} from "../models/authorModel";

export const getAuthors = async (req: Request, res: Response) => {
    try {
        const em = req.app.locals.orm.em.fork();
        const authors = await listAuthors(em);
        res.json(authors);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAuthor = async (req: Request, res: Response) => {
    try {
        const em = req.app.locals.orm.em.fork();
        const author = await findAuthorById(em, Number(req.params.id));
        res.status(200).json(author);
    } catch (error: any) {
        res.status(error.statusCode || 400).json({ error: error.message });
    }
};

export const createAuthor = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const em = req.app.locals.orm.em.fork();
        const author = await insertAuthor(em, name);
        res.status(201).json(author);
    } catch (error: any) {
        res.status(error.statusCode || 400).json({ error: error.message });
    }
};

export const updateAuthor = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const em = req.app.locals.orm.em.fork();
        const author = await updateAuthorById(em, Number(req.params.id), name);
        res.json(author);
    } catch (error: any) {
        res.status(error.statusCode || 400).json({ error: error.message });
    }
};

export const deleteAuthor = async (req: Request, res: Response) => {
    try {
        const em = req.app.locals.orm.em.fork();
        await deleteAuthorById(em, Number(req.params.id));
        res.status(204).end();
    } catch (error: any) {
        res.status(error.statusCode || 400).json({ error: error.message });
    }
};

export const listTopAuthors = async (req: Request, res: Response) => {
    try {
        const em = req.app.locals.orm.em.fork();
        const authors = await getTopAuthors(em, Number(req.params.n));
        res.json(authors);
    } catch (error: any) {
        res.status(error.statusCode || 400).json({ error: error.message });
    }
};
