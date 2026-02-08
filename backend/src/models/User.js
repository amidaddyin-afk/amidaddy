import { readDb, writeDb } from "../config/database.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export class User {
  static async create({ name, email, password }) {
    const db = readDb();
    
    // Check if email already exists
    if (db.users.some(u => u.email === email)) {
      throw new Error("Email already registered");
    }

    const id = uuidv4();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const now = Date.now();

    const user = {
      id,
      name,
      email,
      password: hashedPassword,
      role: "customer",
      createdAt: now,
      updatedAt: now
    };

    db.users.push(user);
    writeDb(db);
    return this._toUser(user);
  }

  static findOne({ email }) {
    const db = readDb();
    const user = db.users.find(u => u.email === email);
    return user ? this._toUser(user) : null;
  }

  static findById(id) {
    const db = readDb();
    const user = db.users.find(u => u.id === id);
    return user ? this._toUser(user) : null;
  }

  static _toUser(user) {
    return {
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
      matchPassword: async function (entered) {
        return bcrypt.compare(entered, this.password);
      }
    };
  }
}

export default User;
