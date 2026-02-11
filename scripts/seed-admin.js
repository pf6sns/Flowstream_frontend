// Seed script to create a default company + admin user
// Run with: node scripts/seed-admin.js

const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

// 1) Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || "orchestrai";

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not set in .env.local");
  process.exit(1);
}

// 2) Seed data (from your request)
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "12345678";
const COMPANY_NAME = "snsihub";

// You can adjust these if you want:
const COMPANY_DOMAIN = "snsihub.com";
const COMPANY_INDUSTRY = "IT Services";
const COMPANY_TIMEZONE = "Asia/Kolkata";

async function main() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log("⏳ Connecting to MongoDB...");
    await client.connect();
    const db = client.db(DB_NAME);

    const companies = db.collection("companies");
    const users = db.collection("users");

    // 3) Upsert company
    console.log(`⏳ Seeding company "${COMPANY_NAME}"...`);

    const now = new Date();

    const companyResult = await companies.findOneAndUpdate(
      { domain: COMPANY_DOMAIN },
      {
        $setOnInsert: {
          name: COMPANY_NAME,
          domain: COMPANY_DOMAIN,
          industry: COMPANY_INDUSTRY,
          logoUrl: "",
          timezone: COMPANY_TIMEZONE,
          status: "active", // "pending" | "active" | "suspended"
          createdAt: now
        },
        $set: {
          updatedAt: now,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

    // Some driver versions may not return the document in value reliably,
    // so we explicitly fetch the company after the upsert.
    let company = companyResult.value;
    if (!company) {
      company = await companies.findOne({ domain: COMPANY_DOMAIN });
      if (!company) {
        throw new Error("Failed to create or fetch company document.");
      }
    }

    console.log(`✅ Company ready: ${company.name} (id: ${company._id})`);

    // 4) Hash admin password
    console.log("⏳ Hashing admin password...");
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // 5) Upsert admin user
    console.log(`⏳ Seeding admin user "${ADMIN_EMAIL}"...`);

    const existingUser = await users.findOne({
      email: ADMIN_EMAIL.toLowerCase(),
    });

    if (existingUser) {
      // Update existing admin's password & link to company
      await users.updateOne(
        { _id: existingUser._id },
        {
          $set: {
            companyId: company._id,
            passwordHash,
            fullName: existingUser.fullName || "Admin User",
            role: "admin", // "admin" | "hr" | "viewer"
            status: "active", // "active" | "inactive"
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        }
      );
      console.log(`✅ Updated existing admin user: ${ADMIN_EMAIL}`);
    } else {
      // Create new admin user
      const newUser = {
        companyId: company._id,
        email: ADMIN_EMAIL.toLowerCase(),
        passwordHash,
        fullName: "Admin User",
        role: "admin",
        status: "active",
        createdAt: now,
        lastLogin: null,
      };

      const insertResult = await users.insertOne(newUser);
      console.log(
        `✅ Created new admin user: ${ADMIN_EMAIL} (id: ${insertResult.insertedId})`
      );
    }

    console.log("\n🎉 Seeding completed successfully.");
    console.log("Company:", COMPANY_NAME);
    console.log("Admin email:", ADMIN_EMAIL);
    console.log("Admin password:", ADMIN_PASSWORD);
  } catch (err) {
    console.error("❌ Error during seeding:", err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();

