import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        
        const updatedSection = await prisma.section.update({
            where: { id },
            data: {
                name: body.name,
                department: body.department,
                year: parseInt(body.year),
                semester: parseInt(body.semester),
            }
        });
        
        return NextResponse.json(updatedSection);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update section" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.section.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete section" }, { status: 500 });
    }
}
