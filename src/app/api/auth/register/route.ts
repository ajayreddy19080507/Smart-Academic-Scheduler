import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, role, department } = body;

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const validRole = ["PRINCIPAL", "HOD", "FACULTY"].includes(role) ? role : "PRINCIPAL";
        const dept = validRole === "HOD" ? (department || "CSE") : null;

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                role: validRole,
                department: dept,
            },
            create: {
                email,
                role: validRole,
                department: dept,
            },
        });

        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        console.error("Register API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to create user record" }, { status: 500 });
    }
}

