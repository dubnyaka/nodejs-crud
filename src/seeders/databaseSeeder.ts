import {EntityManager} from '@mikro-orm/core';
import {Seeder} from '@mikro-orm/seeder';
import {Author} from '../entities/author.entity';
import {Book} from '../entities/book.entity';
import * as fs from 'fs';
import * as path from 'path';

export class DatabaseSeeder extends Seeder {
    async run(em: EntityManager): Promise<void> {
        await em.begin();

        try {
            const authorsPath = path.join(__dirname, 'authors.json');
            const booksPath = path.join(__dirname, 'books.json');

            const authorsData = JSON.parse(fs.readFileSync(authorsPath, 'utf-8'));
            const booksData = JSON.parse(fs.readFileSync(booksPath, 'utf-8'));

            const authorCount = await em.count(Author);
            const bookCount = await em.count(Book);
            if (authorCount > 0 || bookCount > 0) {
                console.log('Skipping seeding: authors or books already exist');
                await em.rollback();
                return;
            }

            console.log('Seeding authors...');
            const authorMap = new Map<string, number>();

            for (const authorData of authorsData) {
                const author = em.create(Author, {name: authorData.name});
                await em.persistAndFlush(author);
                authorMap.set(authorData.name, author.id);
            }

            console.log('Seeding books...');
            for (const bookData of booksData) {
                const authorId = authorMap.get(bookData.author_name);
                if (!authorId) {
                    console.error(`Skipping book: No matching author for ${bookData.author_name}`);
                    continue;
                }

                const author = await em.findOne(Author, {id: authorId});
                if (!author) {
                    throw new Error(`Author with id ${authorId} not found for book ${bookData.title}`);
                }

                em.create(Book, {
                    title: bookData.title,
                    genre: bookData.genre,
                    description: bookData.description,
                    pages: bookData.pages,
                    year: bookData.year,
                    author: author,
                });
            }

            await em.flush();
            await em.commit();
            console.log('Database seeded successfully.');
        } catch (error) {
            console.error('Seeding failed:', error);
            await em.rollback();
        }
    }
}
