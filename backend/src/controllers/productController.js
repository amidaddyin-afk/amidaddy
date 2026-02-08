import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getProducts = asyncHandler(async (req, res) => {
  const { search, category } = req.query;
  const products = Product.find({ search, category });
  res.json(products);
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, category, images, model3D } = req.body;
  const product = await Product.create({
    name,
    description,
    price,
    stock,
    category,
    images: images || [],
    model3D
  });
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  const updated = await Product.update(req.params.id, req.body);
  res.json(updated);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  Product.deleteOne(req.params.id);
  res.json({ message: "Product removed" });
});
