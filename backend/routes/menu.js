import express from "express"
import { createMenu, deleteMenu, editMenu, getAll, getMenuByCategory, getMenuById, getPagingMenu, searchMenu, /*uploadImageMenu*/ } from "../controllers/menu.js"
import authentication from './../middlewares/authentication.js';
import authorization from './../middlewares/authorization.js';
import upload from "../middlewares/upload.js";

const router = express.Router()

// router.put("/upload-imageMenu",upload.single("image") ,uploadImageMenu)
router.post("/create-menu" ,upload.single("image") , createMenu)
router.put("/:id", upload.single('image'), editMenu)
router.delete("/:id", authentication, authorization, deleteMenu)
router.get("/get-paging-menu", getPagingMenu)
router.get("/:id", getMenuById)
router.post("/search-menu", authentication, authorization, searchMenu)
router.get('/category/:category', getMenuByCategory);
router.get("/", getAll);

export default router