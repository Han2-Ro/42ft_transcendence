import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// @ts-expect-error - Prisma 7+ constructor types
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      username: "testuser",
      passwordHash: "placeholder_hash",
    },
  });
  console.log("Created user:", user);

  // Fetch all users
  const users = await prisma.user.findMany();
  console.log("All users:", users);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());