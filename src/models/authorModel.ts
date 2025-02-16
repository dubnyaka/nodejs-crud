import {EntityManager} from '@mikro-orm/postgresql';
import {Author} from '../entities/author.entity';
import {ApiError} from '../errors/ApiError';
import {Book} from "../entities/book.entity";

export const listAuthors = async (em: EntityManager): Promise<Author[]> =>
    em.find(Author, {});

export const findAuthorById = async (em: EntityManager, id: number): Promise<Author> => {
    const author = await em.findOne(Author, id);
    if (!author) {
        throw new ApiError(`Author with id ${id} not found`, 404);
    }
    return author;
};

export const insertAuthor = async (em: EntityManager, name: string): Promise<Author> =>
    await em.transactional(async (trx) => {
        const existing = await trx.findOne(Author, {name});
        if (existing) {
            throw new ApiError(`Author with name "${name}" already exists`, 400);
        }
        const author = trx.create(Author, {name});
        await trx.persistAndFlush(author);

        const event = {
            event_type: 'AUTHOR_CREATED',
            payload: JSON.stringify({
                authorId: author.id,
                createdAt: new Date().toISOString(),
            }),
        };
        await trx.getConnection().execute(
            `INSERT INTO outbox (event_type, payload)
             VALUES (?, ?)`,
            [event.event_type, event.payload]
        );

        return author;
    });

export const updateAuthorById = async (em: EntityManager, id: number, name: string): Promise<Author> => {
    const author = await em.findOne(Author, id);
    if (!author) {
        throw new ApiError(`Author with id ${id} not found`, 404);
    }
    const duplicate = await em.findOne(Author, {name});
    if (duplicate && duplicate.id !== id) {
        throw new ApiError(`Author with name "${name}" already exists`, 400);
    }
    author.name = name;
    await em.flush();
    return author;
};

export const deleteAuthorById = async (em: EntityManager, id: number): Promise<void> => {
    const author = await em.findOne(Author, id);
    if (!author) {
        throw new ApiError(`Author with id ${id} not found`, 404);
    }
    await em.removeAndFlush(author);
};

export const getTopAuthors = async (em: EntityManager, n: number): Promise<Array<{
    id: number;
    name: string;
    count: number
}>> => {
    const result = await em.getConnection().execute(
        `SELECT a.id, a.name, COUNT(b.id) as count
         FROM author a
             LEFT JOIN book b
         ON a.id = b.author_id
         GROUP BY a.id, a.name
         ORDER BY count DESC
             LIMIT ?`, [n]
    );
    return result.map((item: any) => ({
        id: Number(item.id),
        name: String(item.name),
        count: Number(item.count),
    }));
};