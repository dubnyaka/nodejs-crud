import express, {Request, Response} from "express";
import dotenv from "dotenv";
import authorRoutes from "./routes/authorRoutes";
import bookRoutes from "./routes/bookRoutes";
import {errorHandler, jsonErrorHandler} from "./middlewares/errorHandler";
import db from "./db";

dotenv.config();
const app = express();

app.use(express.json());

app.use("/api/authors", authorRoutes);
app.use("/api/books", bookRoutes);

app.get("/", (req, res) => {
    res.send("Hello from docker!");
});

app.get("/health", async (req: Request, res: Response) => {
    try {
        const result = await db.raw("SELECT 1+1 as result");
        const data = result.rows ? result.rows[0] : result[0];
        res.json({ status: "ok", result: data });
    } catch (error) {
        console.error("Ошибка подключения к БД:", error);
        res.status(500).json({ status: "error", message: (error as Error).message });
    }
});

app.use(jsonErrorHandler);
app.use(errorHandler);

export default app;
