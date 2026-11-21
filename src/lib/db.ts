import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }

    // Check possible locations for SQLite database in local and Vercel serverless
    const candidatePaths = [
        path.join(process.cwd(), "prisma", "dev.db"),
        path.join(process.cwd(), "dev.db"),
        path.resolve("./prisma/dev.db"),
        path.resolve("./dev.db"),
    ];

    for (const candidate of candidatePaths) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).size > 0) {
            return `file:${candidate}`;
        }
    }

    return "file:./prisma/dev.db";
}

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        datasources: {
            db: {
                url: getDatabaseUrl(),
            },
        },
        log: ["error"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
