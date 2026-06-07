import express from "express"
import {getCategories} from "../controllers/category.controller.js"

const router = express.Router()
router.get("/", getCategories)

console.log("CATEGORY ROUTE ACTIVE")

export default router