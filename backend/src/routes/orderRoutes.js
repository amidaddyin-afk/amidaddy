import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrders,
  updateOrderStatus
} from "../controllers/orderController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/user", protect, getMyOrders);
router.get("/", protect, adminOnly, getOrders);
router.put("/:id", protect, adminOnly, updateOrderStatus);

export default router;
