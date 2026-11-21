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

    // On Vercel / AWS Lambda, the application bundle (/var/task) is mounted as strictly read-only.
    // To allow SQLite writes (generate timetable, delete, edit), we copy the bundled database to /tmp.
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    if (isServerless) {
        const tmpDbPath = path.join("/tmp", "dev.db");

        const sourceCandidates = [
            path.join(process.cwd(), "prisma", "dev.db"),
            path.join(process.cwd(), "dev.db"),
            path.resolve("./prisma/dev.db"),
            path.resolve("./dev.db"),
        ];

        let sourcePath: string | null = null;
        for (const candidate of sourceCandidates) {
            if (fs.existsSync(candidate) && fs.statSync(candidate).size > 0) {
                sourcePath = candidate;
                break;
            }
        }

        if (sourcePath && (!fs.existsSync(tmpDbPath) || fs.statSync(tmpDbPath).size === 0)) {
            try {
                fs.copyFileSync(sourcePath, tmpDbPath);
            } catch (err) {
                console.error("Failed to copy SQLite database to /tmp:", err);
            }
        }

        if (fs.existsSync(tmpDbPath)) {
            return `file:${tmpDbPath}`;
        }
    }

    // Local development candidates
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
