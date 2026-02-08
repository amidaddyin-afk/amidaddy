import { readDb, writeDb } from "../config/database.js";
import { v4 as uuidv4 } from "uuid";

export class Order {
  static async create({ userId, items, totalPrice, paymentStatus, orderStatus, shippingAddress }) {
    const db = readDb();
    const id = uuidv4();
    const now = Date.now();

    const order = {
      id,
      userId,
      items: items || [],
      totalPrice,
      paymentStatus: paymentStatus || "pending",
      orderStatus: orderStatus || "pending",
      shippingAddress: shippingAddress || {},
      createdAt: now,
      updatedAt: now
    };

    db.orders.push(order);
    writeDb(db);
    return this._toOrder(order);
  }

  static find({ userId = null } = {}) {
    const db = readDb();
    let orders = [...db.orders];

    if (userId) {
      orders = orders.filter(o => o.userId === userId);
    }

    orders.sort((a, b) => b.createdAt - a.createdAt);
    return orders.map(o => this._toOrder(o));
  }

  static findById(id) {
    const db = readDb();
    const order = db.orders.find(o => o.id === id);
    return order ? this._toOrder(order) : null;
  }

  static async update(id, updates) {
    const db = readDb();
    const idx = db.orders.findIndex(o => o.id === id);
    if (idx === -1) return null;

    const order = db.orders[idx];
    
    if (updates.paymentStatus !== undefined) {
      order.paymentStatus = updates.paymentStatus;
    }
    if (updates.orderStatus !== undefined) {
      order.orderStatus = updates.orderStatus;
    }

    order.updatedAt = Date.now();
    db.orders[idx] = order;
    writeDb(db);
    return this._toOrder(order);
  }

  static _toOrder(order) {
    return {
      _id: order.id,
      id: order.id,
      user: order.userId,
      userId: order.userId,
      items: order.items || [],
      totalPrice: order.totalPrice,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      shippingAddress: order.shippingAddress || {},
      createdAt: new Date(order.createdAt),
      updatedAt: new Date(order.updatedAt)
    };
  }
}

export default Order;
