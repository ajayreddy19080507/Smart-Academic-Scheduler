import { NextResponse } from "next/server";
import { generateTimetable } from "@/lib/algorithm/scheduler";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST() {
    try {
        const result = await generateTimetable();

        if (result.success) {
            return NextResponse.json({ success: true, message: "Timetable generated successfully" });
        } else {
            return NextResponse.json({ success: false, error: result.error || "Generation failed" }, { status: 400 });
        }
    } catch (error: any) {
        console.error("API /generate Error:", error);
        return NextResponse.json({ success: false, error: error?.message || "Internal Server Error" }, { status: 500 });
    }
}
