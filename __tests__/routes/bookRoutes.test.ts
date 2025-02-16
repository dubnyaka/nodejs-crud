import { MetadataStorage, MikroORM } from "@mikro-orm/postgresql";
import { Book } from "../../src/entities/book.entity";
import { Author } from "../../src/entities/author.entity";
import app from "../../src/app";
import request from "supertest";
import config from "../../src/mikro-orm.config";

const clearDatabase = async () => {
    const orm = app.locals.orm;
    if (!orm) throw new Error("ORM not initialized");
    const em = orm.em.fork();
    await em.nativeDelete(Book, {});
    await em.nativeDelete(Author, {});
};

const clearBooks = async () => {
    const orm = app.locals.orm;
    if (!orm) throw new Error("ORM not initialized");
    const em = orm.em.fork();
    await em.nativeDelete(Book, {});
};

let authorId: number;

const createBookApi = async (overrides: Partial<any> = {}) => {
    const bookData = {
        title: "Test Book",
        author_id: authorId,
        genre: "Fiction",
        pages: 200,
        year: 2023,
        ...overrides,
    };
    const res = await request(app).post("/api/books").send(bookData);
    return res.body;
};

describe("Book Routes", () => {
    beforeAll(async () => {
        MetadataStorage.clear();
        app.locals.orm = await MikroORM.init(config);
        await clearDatabase();
        const orm = app.locals.orm;
        const em = orm.em.fork();
        const author = em.create(Author, { name: "Test Author" });
        await em.persistAndFlush(author);
        authorId = author.id;
    });

    beforeEach(async () => {
        await clearBooks();
    });

    describe("POST /api/books", () => {
        it("should create a new book", async () => {
            const res = await request(app)
                .post("/api/books")
                .send({
                    title: "Test Book",
                    author_id: authorId,
                    genre: "Fiction",
                    pages: 200,
                    year: 2023,
                });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("id");
        });

        it("should return an error when the required field (title) is missing", async () => {
            const res = await request(app)
                .post("/api/books")
                .send({
                    author_id: authorId,
                    genre: "Fiction",
                    pages: 200,
                    year: 2023,
                });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ errors: ['"title" is required'] });
        });

        it("should return an error for invalid data type (pages as string)", async () => {
            const res = await request(app)
                .post("/api/books")
                .send({
                    title: "Test Book",
                    author_id: authorId,
                    genre: "Fiction",
                    pages: "not-a-number",
                    year: 2023,
                });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ errors: ['"pages" must be a number'] });
        });
    });

    describe("GET /api/books/:id", () => {
        let book: any;

        beforeEach(async () => {
            book = await createBookApi({ title: "Test Book for GET" });
        });

        it("should return a book by its ID", async () => {
            const res = await request(app).get(`/api/books/${book.id}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("id", book.id);
            expect(res.body).toHaveProperty("author");
        });

        it("should return 404 for a non-existent ID", async () => {
            const res = await request(app).get("/api/books/999999");
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("error");
        });
    });

    describe("PUT /api/books/:id", () => {
        let book: any;

        beforeEach(async () => {
            book = await createBookApi({ title: "Test Book for PUT" });
        });

        it("should update the book data", async () => {
            const updatedData = {
                title: "Updated Book",
                author_id: authorId,
                genre: "Mystery",
                pages: 250,
                year: 2024,
            };

            const res = await request(app)
                .put(`/api/books/${book.id}`)
                .send(updatedData);

            expect(res.status).toBe(200);
            // Verify updated fields
            expect(res.body).toEqual(expect.objectContaining({
                title: updatedData.title,
                genre: updatedData.genre,
                pages: updatedData.pages,
                year: updatedData.year,
            }));
            // Check that the author is updated correctly (the response may contain either author_id or an author object with id)
            expect(res.body.author).toBe(authorId);
        });

        it("should return 404 when updating a non-existent book", async () => {
            const res = await request(app)
                .put("/api/books/999999")
                .send({
                    title: "Non-existent Book",
                    author_id: authorId,
                    genre: "Mystery",
                    pages: 250,
                    year: 2024,
                });
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("error");
        });

        it("should return a validation error for invalid data (pages as a string)", async () => {
            const res = await request(app)
                .put(`/api/books/${book.id}`)
                .send({
                    title: "Updated Book",
                    author_id: authorId,
                    genre: "Mystery",
                    pages: "invalid",
                    year: 2024,
                });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ errors: ['"pages" must be a number'] });
        });
    });

    describe("POST /api/books/_list", () => {
        beforeEach(async () => {
            await createBookApi({ title: "Book A", genre: "Sci-Fi", pages: 150, year: 2021 });
            await createBookApi({ title: "Book B", genre: "Drama", pages: 200, year: 2022 });
        });

        it("should return a paginated list of books", async () => {
            const res = await request(app)
                .post("/api/books/_list")
                .send({ page: 1, size: 10 });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("list");
            expect(res.body).toHaveProperty("totalPages");
            expect(Array.isArray(res.body.list)).toBe(true);
        });

        it("should return a validation error for incorrect pagination parameters", async () => {
            const res = await request(app)
                .post("/api/books/_list")
                .send({ page: -1, size: "invalid" });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({
                errors: [
                    '"page" must be greater than or equal to 1',
                    '"size" must be a number'
                ]
            });
        });
    });

    describe("POST /api/books/upload", () => {
        it("should perform bulk upload of books", async () => {
            const books = [
                { title: "Book 1", author_id: authorId, pages: 100, genre: "Sci-Fi", year: 2022 },
                { title: "Book 2", author_id: authorId, pages: 200, genre: "Drama", year: 2021 },
            ];

            const res = await request(app).post("/api/books/upload").send(books);
            expect(res.status).toBe(201);
            expect(res.body).toEqual({ importedCount: 2 });
        });

        it("should return an error if one of the books is invalid", async () => {
            const books = [
                { title: "Book 1", author_id: authorId, pages: 100, genre: "Sci-Fi", year: 2022 },
                { author_id: authorId, pages: 200, genre: "Drama", year: 2021 },
            ];

            const res = await request(app).post("/api/books/upload").send(books);
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ errors: ['"title" is required'] });
        });
    });

    describe("DELETE /api/books/:id", () => {
        let book: any;

        beforeEach(async () => {
            book = await createBookApi({ title: "Test Book for DELETE" });
        });

        it("should delete the book", async () => {
            const res = await request(app).delete(`/api/books/${book.id}`);
            expect(res.status).toBe(204);
            const getRes = await request(app).get(`/api/books/${book.id}`);
            expect(getRes.status).toBe(404);
        });

        it("should return 404 when trying to delete a non-existent book", async () => {
            await request(app).delete(`/api/books/${book.id}`);
            const res = await request(app).delete(`/api/books/${book.id}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("error");
        });
    });
});
