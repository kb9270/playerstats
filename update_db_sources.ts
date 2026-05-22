import { db } from "./server/db";
import { news } from "./shared/schema";

async function main() {
  if (!db) {
    console.log("No database connection available. Cannot update database tables.");
    return;
  }

  console.log("Updating all news sources in database to 'Khalil'...");
  try {
    // In Drizzle, updating without .where() updates all records.
    await db.update(news).set({ source: "Khalil" });
    console.log("Database update completed successfully.");
  } catch (error) {
    console.error("Error updating database news sources:", error);
  }
}

main().catch(err => {
  console.error("Failed to run DB update:", err);
});
