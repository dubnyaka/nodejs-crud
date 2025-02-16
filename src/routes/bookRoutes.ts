import express from "express";
import {
    bulkUploadBooks,
    createBook,
    deleteBook,
    getBookById,
    getBooksPaginated,
    updateBook
} from "../controllers/bookController";
import {
    validateCreateOrUpdateBook,
    validateListBooksPaginated,
    validateUploadBooks
} from "../validators/bookValidator";
import {validateIdParam} from "../validators/commonValidator";

const router = express.Router();

router.post("/", validateCreateOrUpdateBook, createBook);
router.get("/:id", validateIdParam, getBookById);
router.put("/:id", validateCreateOrUpdateBook, updateBook);
router.delete("/:id", validateIdParam, deleteBook);
router.post("/_list", validateListBooksPaginated, getBooksPaginated);
router.post("/upload", validateUploadBooks, bulkUploadBooks)

export default router;
