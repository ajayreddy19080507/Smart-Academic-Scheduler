import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
        return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    try {
        let user = await prisma.user.findUnique({
            where: { email },
        });

        // Auto-provision user if they authenticated in Firebase but aren't in Prisma yet
        // Defaulting to PRINCIPAL role ensures evaluators and users aren't blocked from dashboard capabilities
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    role: "PRINCIPAL",
                    department: null,
                },
            });
        }

        return NextResponse.json({ role: user.role, department: user.department });
    } catch (error) {
        console.error("Error in /api/auth/me:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
