import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "../../data.json");

// Initialize database file if it doesn't exist
export const initializeDatabase = () => {
  if (!fs.existsSync(dbPath)) {
    const initialData = {
      users: [],
      products: [],
      orders: []
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
  }
};

// Read database
export const readDb = () => {
  try {
    const data = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return { users: [], products: [], orders: [] };
  }
};

// Write database
export const writeDb = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

