import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  addItem,
  deleteItem,
  editItem,
  getItemByCity,
  getItemById,
  getItemsByShop,
  rating,
  searchItems
} from "../controllers/item.controllers.js";
import { upload } from "../middlewares/multer.js";

const itemRouter = express.Router();

// Add or edit items (requires auth)
itemRouter.post("/add-item", isAuth, upload.single("image"), addItem);
itemRouter.post("/edit-item/:itemId", isAuth, upload.single("image"), editItem);

// Get, delete, search items
itemRouter.get("/get-by-id/:itemId", isAuth, getItemById);
itemRouter.get("/delete/:itemId", isAuth, deleteItem);
itemRouter.get("/get-by-city/:city", isAuth, getItemByCity);
itemRouter.get("/get-by-shop/:shopId", isAuth, getItemsByShop);
itemRouter.get("/search-items", isAuth, searchItems);

// Item rating
itemRouter.post("/rating", isAuth, rating);

export default itemRouter;
