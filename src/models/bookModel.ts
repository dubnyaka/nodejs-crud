import { EntityManager, FilterQuery } from '@mikro-orm/core';
import { Book } from '../entities/book.entity';
import { Author } from '../entities/author.entity';
import { ApiError } from '../errors/ApiError';

interface ListBooksParams {
    authorId?: number;
    genre?: string;
    year?: number;
    page?: number;
    size?: number;
}

interface PaginatedResult<T> {
    list: T[];
    totalPages: number;
}

interface BookListItem {
    id: number;
    title: string;
    authorName: string;
    genre: string;
    year: number;
}

export const findBooksPaginated = async (
    em: EntityManager,
    { authorId, genre, year, page = 1, size = 10 }: ListBooksParams
): Promise<PaginatedResult<BookListItem>> => {
    const filter: FilterQuery<Book> = {};
    if (authorId) {
        filter.author = authorId;
    }
    if (genre) {
        filter.genre = genre;
    }
    if (year) {
        filter.year = year;
    }
    const totalCount = await em.count(Book, filter);
    const totalPages = Math.ceil(totalCount / size);
    const books = await em.find(Book, filter, {
        populate: ['author'],
        limit: size,
        offset: (page - 1) * size,
    });
    const list: BookListItem[] = books.map((b) => ({
        id: b.id,
        title: b.title,
        authorName: b.author?.name || '',
        genre: b.genre,
        year: b.year,
    }));
    return { list, totalPages };
};

export const findBookById = async (
    em: EntityManager,
    id: number
): Promise<Book> => {
    const book = await em.findOne(Book, id, { populate: ['author'] });
    if (!book) {
        throw new ApiError(`Book with id ${id} not found`, 404);
    }
    return book;
};

export const insertBook = async (
    em: EntityManager,
    data: Record<string, any>
): Promise<Book> => {
    const authorRef = em.getReference(Author, data.author_id);
    const book = em.create(Book, {
        title: data.title,
        genre: data.genre,
        description: data.description,
        pages: data.pages,
        year: data.year,
        author: authorRef,
    });
    await em.persistAndFlush(book);
    return book;
};

export const updateBookById = async (
    em: EntityManager,
    id: number,
    data: Record<string, any>
): Promise<Book> => {
    const book = await em.findOne(Book, id);
    if (!book) {
        throw new ApiError(`Book with id ${id} not found`, 404);
    }

    const { author_id, ...updateData } = data;
    Object.assign(book, updateData);

    if (author_id !== undefined) {
        book.author = em.getReference(Author, author_id);
    }

    await em.flush();
    return book;
};

export const deleteBookById = async (
    em: EntityManager,
    id: number
): Promise<void> => {
    const book = await em.findOne(Book, id);
    if (!book) {
        throw new ApiError(`Book with id ${id} not found`, 404);
    }
    await em.removeAndFlush(book);
};

export const uploadBooks = async (
    em: EntityManager,
    booksData: Record<string, any>[]
): Promise<number> => {
    const authorIds = [...new Set(booksData.map((b) => Number(b.author_id)))];
    const existingAuthors = await em.find(Author, { id: { $in: authorIds } });
    const existingAuthorIds = existingAuthors.map((a) => a.id);
    const missingAuthors = authorIds.filter((id) => !existingAuthorIds.includes(id));
    if (missingAuthors.length > 0) {
        throw new ApiError(`Authors with ids ${missingAuthors.join(', ')} not found`, 400);
    }
    let importedCount = 0;
    await em.transactional(async (trx) => {
        for (const data of booksData) {
            const authorRef = trx.getReference(Author, data.author_id);
            const book = trx.create(Book, {
                title: data.title,
                genre: data.genre,
                description: data.description,
                pages: data.pages,
                year: data.year,
                author: authorRef,
            });
            await trx.persistAndFlush(book);
            importedCount++;
        }
    });
    return importedCount;
};
