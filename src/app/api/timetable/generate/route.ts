import { NextResponse } from "next/server";
import { generateTimetable } from "@/lib/algorithm/scheduler";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST() {
    try {
        const sectionsCount = await prisma.section.count();
        if (sectionsCount === 0) {
            return NextResponse.json({ success: false, error: "No sections to schedule." }, { status: 400 });
        }

        const facultyCount = await prisma.faculty.count();
        if (facultyCount === 0) {
            return NextResponse.json({ success: false, error: "No faculty found." }, { status: 400 });
        }

        const result = await generateTimetable();

        if (result.success) {
            const sections = await prisma.section.findMany({
                include: {
                    timetables: {
                        include: {
                            subject: true,
                            faculty: true,
                            room: true,
                        },
                    },
                },
            });

            return NextResponse.json(
                { success: true, message: "Timetable generated successfully", sections },
                { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
            );
        } else {
            return NextResponse.json({ success: false, error: result.error || "Generation failed" }, { status: 400 });
        }
    } catch (error: any) {
        console.error("API /timetable/generate Error:", error);
        return NextResponse.json({ success: false, error: error?.message || "Internal Server Error" }, { status: 500 });
    }
}
