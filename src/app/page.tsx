import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Calendar, Layers, Users, Award, ExternalLink, FileText } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 relative z-10">

      {/* Hero Section */}
      <div className="text-center max-w-3xl space-y-6 mb-16 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-2 text-xs font-semibold tracking-wider text-blue-700 uppercase bg-blue-100/70 rounded-full border border-blue-200 backdrop-blur-sm">
          <Award className="h-3.5 w-3.5 text-blue-600" />
          <span>IEEE Published Research Project</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900">
          Timetables, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">Reimagined.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Create conflict-free, balanced schedules for your entire college in seconds.
          Powered by intelligent algorithms and wrapped in a stunning interface.
        </p>

        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <Link href="/login">
            <Button className="h-12 px-8 text-lg rounded-full shadow-blue-500/20 shadow-xl">
              Sign In (Demo Ready)
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="secondary" className="h-12 px-8 text-lg rounded-full bg-white/60 backdrop-blur-md border-white/40 hover:bg-white/80">
              Register New Account
            </Button>
          </Link>
        </div>
      </div>

      {/* IEEE Publication Showcase Banner */}
      <div className="w-full max-w-6xl mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
        <GlassCard className="p-6 md:p-8 border border-blue-200/80 bg-gradient-to-r from-blue-50/70 via-indigo-50/60 to-purple-50/70 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-700 shrink-0">
                <Award className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                  IEEE Conference Publication
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900">
                  Published IEEE Research Paper
                </h3>
                <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
                  An IEEE Conference paper was published on this project detailing the algorithmic CSP scheduling workflow and heuristic optimization.
                </p>
              </div>
            </div>
            <a
              href="https://ieeexplore.ieee.org/abstract/document/11744894"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto shrink-0"
            >
              <Button className="w-full md:w-auto h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center justify-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                <span>View on IEEE Xplore</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-80" />
              </Button>
            </a>
          </div>
        </GlassCard>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
        <GlassCard className="space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Smart Scheduling</h3>
          <p className="text-gray-500">
            Automatically generates conflict-free timetables considering all constraints like labs, room availability, and faculty load.
          </p>
        </GlassCard>

        <GlassCard className="space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Workload Balance</h3>
          <p className="text-gray-500">
            Ensures fair distribution of classes among faculty. Avoids burnout by intelligently spacing out lectures.
          </p>
        </GlassCard>

        <GlassCard className="space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-600">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Seamless Integration</h3>
          <p className="text-gray-500">
            Import data directly from Excel templates. Manage faculty, subjects, and rooms in one unified dashboard.
          </p>
        </GlassCard>
      </div>

    </main>
  );
}
