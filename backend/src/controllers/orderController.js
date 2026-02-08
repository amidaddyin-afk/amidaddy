import Order from "../models/Order.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ message: "No order items" });
  }
  const productIds = items.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const enriched = items.map((item) => {
    const product = products.find((p) => p._id.toString() === item.product);
    return {
      product: item.product,
      name: product?.name || item.name,
      qty: item.qty,
      price: product?.price || item.price,
      image: product?.images?.[0]
    };
  });
  const totalPrice = enriched.reduce((sum, item) => sum + item.price * item.qty, 0);
  const order = await Order.create({
    user: req.user._id,
    items: enriched,
    totalPrice,
    shippingAddress
  });
  res.status(201).json(order);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
  res.json(orders);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  if (orderStatus) order.orderStatus = orderStatus;
  if (paymentStatus) order.paymentStatus = paymentStatus;
  const updated = await order.save();
  res.json(updated);
});
