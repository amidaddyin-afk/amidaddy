import { initializeDatabase } from "./database.js";

const connectDb = async () => {
  try {
    initializeDatabase();
    console.log("SQLite database initialized");
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
};

export default connectDb;
