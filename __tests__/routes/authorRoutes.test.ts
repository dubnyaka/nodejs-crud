import {MetadataStorage, MikroORM} from "@mikro-orm/postgresql";
import {Book} from "../../src/entities/book.entity";
import {Author} from "../../src/entities/author.entity";
import app from "../../src/app";
import request from "supertest";
import config from '../../src/mikro-orm.config';

const clearDatabase = async () => {
    const orm = app.locals.orm;
    if (!orm) throw new Error('ORM not initialized');
    const em = orm.em.fork();
    await em.nativeDelete(Book, {});
    await em.nativeDelete(Author, {});
};

const createAuthorApi = async (overrides: Partial<any> = {}) => {
    const authorData = {name: "Test Author", ...overrides};
    const res = await request(app).post("/api/authors").send(authorData);
    return res.body;
};

describe("Author Routes", () => {
    beforeAll(async () => {
        // clear the metadata cache to avoid the error Method Map.prototype.set called on incompatible receiver #<Map>
        MetadataStorage.clear();
        app.locals.orm = await MikroORM.init(config);
        await clearDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    describe("POST /api/authors", () => {
        it("should create a new author", async () => {
            const res = await request(app)
                .post("/api/authors")
                .send({name: "New Author"});
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("id");
            expect(res.body).toMatchObject({name: "New Author"});
        });

        it("should return an error when 'name' is missing", async () => {
            const res = await request(app).post("/api/authors").send({});
            expect(res.status).toBe(400);
            expect(res.body).toEqual({errors: ['"name" is required']});
        });

        it("should return an error for invalid data type (name as number)", async () => {
            const res = await request(app).post("/api/authors").send({name: 123});
            expect(res.status).toBe(400);
            expect(res.body).toEqual({errors: ['"name" must be a string']});
        });
    });

    describe("GET /api/authors", () => {
        beforeEach(async () => {
            await createAuthorApi({name: "Author One"});
            await createAuthorApi({name: "Author Two"});
        });

        it("should return a list of authors", async () => {
            const res = await request(app).get("/api/authors");
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2);
            res.body.forEach((author: any) => {
                expect(author).toHaveProperty("id");
                expect(author).toHaveProperty("name");
            });
        });
    });

    describe("GET /api/authors/:id", () => {
        let author: any;

        beforeEach(async () => {
            author = await createAuthorApi({name: "Specific Author"});
        });

        it("should return an author by its ID", async () => {
            const res = await request(app).get(`/api/authors/${author.id}`);
            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({id: author.id, name: "Specific Author"});
        });

        it("should return 404 for a non-existent ID", async () => {
            const res = await request(app).get("/api/authors/999999");
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("error");
        });
    });

    describe("PUT /api/authors/:id", () => {
        let author: any;

        beforeEach(async () => {
            author = await createAuthorApi({name: "Author to Update"});
        });

        it("should update the author data", async () => {
            const updatedData = {name: "Updated Author"};
            const res = await request(app)
                .put(`/api/authors/${author.id}`)
                .send(updatedData);
            expect(res.status).toBe(200);
            expect(res.body).toMatchObject(updatedData);
        });

        it("should return 404 when updating a non-existent author", async () => {
            const res = await request(app)
                .put("/api/authors/999999")
                .send({name: "Non-existent Author"});
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("error");
        });

        it("should return a validation error for invalid data (name as number)", async () => {
            const res = await request(app)
                .put(`/api/authors/${author.id}`)
                .send({name: 123});
            expect(res.status).toBe(400);
            expect(res.body).toEqual({errors: ['"name" must be a string']});
        });
    });

    describe("DELETE /api/authors/:id", () => {
        let author: any;

        beforeEach(async () => {
            author = await createAuthorApi({name: "Author to Delete"});
        });

        it("should delete the author", async () => {
            const res = await request(app).delete(`/api/authors/${author.id}`);
            expect(res.status).toBe(204);

            const getRes = await request(app).get(`/api/authors/${author.id}`);
            expect(getRes.status).toBe(404);
        });

        it("should return 404 when deleting a non-existent author", async () => {
            await request(app).delete(`/api/authors/${author.id}`);
            const res = await request(app).delete(`/api/authors/${author.id}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("error");
        });
    });

    describe("GET /api/authors/top:n", () => {
        beforeEach(async () => {
            // Используем MikroORM для вставки данных напрямую
            const em = app.locals.orm.em.fork();
            // Создаем двух авторов
            const author1 = em.create(Author, {name: "Top Author 1"});
            const author2 = em.create(Author, {name: "Top Author 2"});
            await em.persistAndFlush([author1, author2]);

            // Создаем книги для первого автора
            const book1 = em.create(Book, {
                title: "Book 1",
                author: author1,
                genre: "Fiction",
                pages: 150,
                year: 2020,
            });
            const book2 = em.create(Book, {
                title: "Book 2",
                author: author1,
                genre: "Fiction",
                pages: 180,
                year: 2021,
            });
            await em.persistAndFlush([book1, book2]);
        });

        it("should return top authors with a valid count", async () => {
            const res = await request(app).get("/api/authors/top1");
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(1);
            const topAuthor = res.body[0];
            expect(topAuthor).toHaveProperty("id");
            expect(topAuthor).toHaveProperty("name");
            expect(topAuthor).toHaveProperty("count", 2);
        });

        it("should return a validation error for an invalid parameter (non-numeric n)", async () => {
            const res = await request(app).get("/api/authors/top1a");
            expect(res.status).toBe(400);
            expect(res.body).toEqual({errors: ['"Author Count" must be a number']});
        });
    });
});
