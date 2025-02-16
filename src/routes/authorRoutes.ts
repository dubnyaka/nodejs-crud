import express from "express";
import {
    getAuthors,
    getAuthor,
    createAuthor,
    updateAuthor,
    deleteAuthor,
    listTopAuthors
} from "../controllers/authorController";
import {validateCreateOrUpdateAuthor, validateTopAuthorsParam} from "../validators/authorValidator";
import {validateIdParam} from "../validators/commonValidator";

const router = express.Router();

router.get("/", getAuthors);
router.post("/", validateCreateOrUpdateAuthor, createAuthor);
router.put("/:id", validateCreateOrUpdateAuthor, updateAuthor);
router.delete("/:id", validateIdParam, deleteAuthor);


router.get("/top:n", validateTopAuthorsParam, listTopAuthors);
router.get("/:id", validateIdParam, getAuthor);

export default router;
