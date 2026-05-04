import { useEffect, useState } from "react";
import { api } from "../api.js";
import Leaderboards from "../components/Leaderboards.jsx";
import { Trophy, RefreshCw, AlertTriangle, Crown, Flame } from "lucide-react";

export default function LeaderboardsPage() {
  const [leaderboards, setLeaderboards] = useState({
    teams: [],
    drivers: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/leaderboards");
      setLeaderboards(res.data);
      setLastUpdated(new Date());

    } catch {
      setError("Failed to load leaderboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const topTeam = leaderboards.teams?.[0];
  const topDriver = leaderboards.drivers?.[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-12">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 p-8 bg-gradient-to-br from-black via-[#0a0a12] to-black">

        <div className="absolute inset-0 bg-gradient-to-r from-neonPink/10 via-transparent to-purple-500/10 pointer-events-none" />

        <div className="relative flex justify-between flex-wrap gap-6 items-center">

          <div>
            <h2 className="text-5xl font-black flex items-center gap-3">
              <Trophy className="text-neonPink" />
              <span className="bg-gradient-to-r from-white via-neonPink to-purple-400 bg-clip-text text-transparent">
                Leaderboards
              </span>
            </h2>

            <p className="text-slate-400 mt-3 max-w-md">
              No luck. No shortcuts. Just speed, control, and domination.
            </p>

            {lastUpdated && (
              <p className="text-xs text-slate-500 mt-2">
                Updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>

          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </section>

      {/* ================= TOP SECTION ================= */}
      {!loading && !error && (
        <section className="grid md:grid-cols-2 gap-6">

          {/* 👑 TOP TEAM */}
          {topTeam && (
            <div className="relative rounded-2xl p-6 border border-neonPink/40 bg-black/40 hover:scale-[1.02] transition">
              <Crown className="absolute top-4 right-4 text-neonPink opacity-20" />

              <p className="text-xs uppercase tracking-wider text-neonPink">
                Leading Crew
              </p>

              <h3 className="text-3xl font-black mt-2">
                {topTeam.crewName}
              </h3>

              <p className="text-slate-400 text-sm mt-2">
                {topTeam.points} pts • {topTeam.leaderName}
              </p>
            </div>
          )}

          {/* 🔥 TOP DRIVER */}
          {topDriver && (
            <div className="relative rounded-2xl p-6 border border-yellow-400/40 bg-black/40 hover:scale-[1.02] transition">
              <Flame className="absolute top-4 right-4 text-yellow-400 opacity-20" />

              <p className="text-xs uppercase tracking-wider text-yellow-400">
                Top Driver
              </p>

              <h3 className="text-3xl font-black mt-2">
                {topDriver.alias}
              </h3>

              <p className="text-slate-400 text-sm mt-2">
                {topDriver.ratingPoints} rating • {topDriver.teamId?.crewName}
              </p>
            </div>
          )}

        </section>
      )}

      {/* ================= ERROR ================= */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300">
          <AlertTriangle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* ================= LOADING ================= */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-[200px] gap-3 text-slate-400">
          <div className="h-10 w-10 rounded-full border-2 border-neonPink border-t-transparent animate-spin" />
          Loading leaderboards...
        </div>
      )}

      {/* ================= TABLE ================= */}
      {!loading && !error && (
        <section>
          <Leaderboards data={leaderboards} />
        </section>
      )}

    </div>
  );
}