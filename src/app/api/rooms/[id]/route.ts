import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        
        const updatedRoom = await prisma.room.update({
            where: { id },
            data: {
                name: body.name,
                type: body.type,
                capacity: body.capacity ? parseInt(body.capacity) : null,
            }
        });
        
        return NextResponse.json(updatedRoom);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update room" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.room.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete room" }, { status: 500 });
    }
}
