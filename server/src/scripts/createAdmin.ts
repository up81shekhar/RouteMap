import crypto from "crypto";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { connectDB, disconnectDB } from "../config/db.js";
import { User } from "../models/User.js";

async function run() {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(8).toString("hex");

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role === "admin") {
      console.log(`User already exists and is admin: ${email}`);
    } else {
      existing.role = "admin";
      await existing.save();
      console.log(`Promoted existing user to admin: ${email}`);
    }
    console.log("No changes to password. To change it, update the user in the database.");
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ name: "Admin", email, passwordHash, role: "admin" });
    console.log(`Created admin user: ${email}`);
    console.log(`Password: ${password}`);
  }

  await disconnectDB();
  process.exit(0);
}

run().catch((err) => {
  console.error("Failed to create admin user:", err);
  process.exit(1);
});
