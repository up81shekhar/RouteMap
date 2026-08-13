import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

async function main() {
  try {
    await connectDB();
  } catch (err) {
    console.error("❌ Could not connect to MongoDB:", err instanceof Error ? err.message : err);
    console.error("   Set MONGODB_URI in your .env to a real MongoDB Atlas connection string.");
    console.error("   The server will still boot below so /api/health can be checked, but every");
    console.error("   database-backed route will fail until a real connection succeeds.");
  }

  app.listen(env.PORT, () => {
    console.log(`🚀 LearnPath API listening on http://localhost:${env.PORT}`);
  });
}

main();
