"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { DAYS } from "@/lib/algorithm/types";
import { Button } from "@/components/ui/Button";
import { Trash2, Loader2, RotateCcw, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function TimetableView() {
    const { user } = useAuth();
    const [sections, setSections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isClearing, setIsClearing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null);

    const fetchTimetables = async () => {
        setLoading(true);
        try {
            // Check if a fresh timetable was generated in this browser session
            const cached = sessionStorage.getItem("fresh_timetables");
            const cachedTime = sessionStorage.getItem("timetables_generated_at");
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setSections(parsed);
                        if (cachedTime) setLastGeneratedAt(cachedTime);
                        setLoading(false);
                        return;
                    }
                } catch {
                    // Fall back to server fetch
                }
            }

            const res = await fetch("/api/timetable/all", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setSections(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimetables();
    }, []);

    const handleClear = async () => {
        if (!confirm("Are you sure you want to delete ALL generated timetables? This action cannot be undone.")) return;

        setIsClearing(true);
        try {
            const res = await fetch("/api/timetable/clear", { method: "DELETE" });
            if (res.ok) {
                sessionStorage.removeItem("fresh_timetables");
                sessionStorage.removeItem("timetables_generated_at");
                setLastGeneratedAt(null);
                setSections(sections.map(s => ({ ...s, timetables: [] }))); // Optimistic clear
                alert("Timetable cleared successfully!");
            } else {
                alert("Failed to clear timetable.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsClearing(false);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch("/api/generate", { method: "POST" });
            const data = await res.json().catch(() => ({}));

            if (res.ok && data.success !== false) {
                if (data.sections && Array.isArray(data.sections)) {
                    sessionStorage.setItem("fresh_timetables", JSON.stringify(data.sections));
                    const genTime = new Date().toLocaleTimeString();
                    sessionStorage.setItem("timetables_generated_at", genTime);
                    setLastGeneratedAt(genTime);
                    setSections(data.sections);
                } else {
                    await fetchTimetables();
                }
                alert("New Timetable Generated Successfully!");
            } else {
                alert(`Failed to generate timetable: ${data.error || "Check constraints."}`);
            }
        } catch (e) {
            console.error(e);
            alert("Error generating timetable. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const canManageTimetable = user?.role === "PRINCIPAL" || user?.role === "HOD";

    if (loading) return <div className="p-6 flex items-center gap-2"><Loader2 className="animate-spin text-blue-500" /> <span>Loading timetables...</span></div>;

    return (
        <div className="p-6 space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-900">Generated Timetables</h1>
                        {lastGeneratedAt && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                                <Clock className="w-3.5 h-3.5" /> Generated at {lastGeneratedAt}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Conflict-free schedule matrix across all academic sections.</p>
                </div>

                {canManageTimetable && (
                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={handleClear}
                            disabled={isClearing || sections.every(s => s.timetables.length === 0)}
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        >
                            {isClearing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            Clear Timetable
                        </Button>
                        <Button onClick={handleGenerate} disabled={isGenerating || isClearing} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                            Generate Fresh Timetable
                        </Button>
                    </div>
                )}
            </div>

            {sections.length === 0 && (
                <p className="text-gray-500 text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                    No sections found. Please add sections in the Manage Sections tab.
                </p>
            )}

            {sections.map(section => (
                <div key={section.id} className="space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-800 border-l-4 border-blue-500 pl-3">
                        {section.department} - {section.year} - {section.name} (Sem {section.semester})
                    </h2>

                    <div className="overflow-x-auto pb-4">
                        <GlassCard className="min-w-[800px] p-0 overflow-hidden">
                            <div className="grid grid-cols-8 text-sm text-center border-b border-gray-200 bg-gray-50/50">
                                <div className="p-4 font-bold text-gray-400 uppercase tracking-wider">Day / Slot</div>
                                {[1, 2, 3, 4, 5, 6, 7].map(slot => (
                                    <div key={slot} className="p-4 font-bold text-gray-600">
                                        Period {slot}
                                    </div>
                                ))}
                            </div>

                            {DAYS.map(day => (
                                <div key={day} className="grid grid-cols-8 border-b border-gray-100 last:border-0 hover:bg-white/40 transition-colors">
                                    <div className="p-4 font-bold text-gray-500 flex items-center justify-center bg-gray-50/30">
                                        {day}
                                    </div>

                                    {[1, 2, 3, 4, 5, 6, 7].map(slotNum => {
                                        const entry = section.timetables.find((t: any) => t.day === day && t.slot === slotNum);

                                        return (
                                            <div key={slotNum} className="p-2 min-h-[100px] border-l border-gray-100 flex flex-col items-center justify-center text-center relative group">
                                                {entry ? (
                                                    <>
                                                        <div className="text-xs text-gray-800 font-bold line-clamp-2 px-1 mb-1">
                                                            {entry.subject?.name}
                                                        </div>
                                                        {entry.faculty && (
                                                            <div className="mt-2 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-100">
                                                                {entry.faculty.name}
                                                            </div>
                                                        )}
                                                        {entry.room && (
                                                            <div className="absolute top-1 right-1 text-[10px] text-gray-400 font-mono">
                                                                {entry.room.name}
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-gray-300">-</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </GlassCard>
                    </div>
                </div>
            ))}
        </div>
    );
}
