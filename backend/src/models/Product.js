import { readDb, writeDb } from "../config/database.js";
import { v4 as uuidv4 } from "uuid";

export class Product {
  static async create({ name, description, price, stock, category, images, model3D }) {
    const db = readDb();
    const id = uuidv4();
    const now = Date.now();

    const product = {
      id,
      name,
      description,
      price,
      stock: stock || 0,
      category,
      images: images || [],
      model3D: model3D || null,
      createdAt: now,
      updatedAt: now
    };

    db.products.push(product);
    writeDb(db);
    return this._toProduct(product);
  }

  static find({ search = null, category = null } = {}) {
    const db = readDb();
    let products = [...db.products];

    if (search) {
      const regex = new RegExp(search, "i");
      products = products.filter(p => 
        regex.test(p.name) || regex.test(p.description)
      );
    }

    if (category) {
      products = products.filter(p => p.category === category);
    }

    // Sort by creation date descending
    products.sort((a, b) => b.createdAt - a.createdAt);
    return products.map(p => this._toProduct(p));
  }

  static findById(id) {
    const db = readDb();
    const product = db.products.find(p => p.id === id);
    return product ? this._toProduct(product) : null;
  }

  static async update(id, updates) {
    const db = readDb();
    const idx = db.products.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const product = db.products[idx];
    const fields = ["name", "description", "price", "stock", "category", "images", "model3D"];
    
    fields.forEach(field => {
      if (updates[field] !== undefined) {
        product[field] = updates[field];
      }
    });

    product.updatedAt = Date.now();
    db.products[idx] = product;
    writeDb(db);
    return this._toProduct(product);
  }

  static deleteOne(id) {
    const db = readDb();
    db.products = db.products.filter(p => p.id !== id);
    writeDb(db);
  }

  static _toProduct(product) {
    return {
      _id: product.id,
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      images: product.images || [],
      model3D: product.model3D,
      createdAt: new Date(product.createdAt),
      updatedAt: new Date(product.updatedAt)
    };
  }
}

export default Product;
