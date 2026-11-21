"use client";

import { Button } from "@/components/ui/Button";
import { Play, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function GenerateButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/generate", { method: "POST" });
            const data = await res.json().catch(() => ({}));

            if (res.ok && data.success !== false) {
                router.push("/dashboard/timetable");
            } else {
                alert(`Generation failed: ${data.error || "Server could not process constraints."}`);
            }
        } catch (e: any) {
            console.error(e);
            alert(`Error generating timetable: ${e?.message || e}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onClick={handleGenerate} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            Generate Timetable
        </Button>
    );
}
