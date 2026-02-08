import connectDb from "./config/db.js";
import Product from "./models/Product.js";
import User from "./models/User.js";
import sampleProducts from "./data/sampleProducts.js";
import { readDb, writeDb } from "./config/database.js";

const seed = async () => {
  try {
    await connectDb();
    
    // Clear existing data
    writeDb({ users: [], products: [], orders: [] });
    
    // Create admin user
    const admin = await User.create({
      name: "Admin",
      email: "admin@amidaddy.in",
      password: "Admin@123"
    });
    
    // Create sample products
    for (const p of sampleProducts) {
      await Product.create(p);
    }
    
    console.log("✅ Seed complete");
    console.log(`✅ Admin login: ${admin.email} / Admin@123`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error.message);
    process.exit(1);
  }
};

seed();
