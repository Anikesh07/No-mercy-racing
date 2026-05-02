import { useEffect, useState } from "react";
import { api } from "../api.js";
import Leaderboards from "../components/Leaderboards.jsx";

export default function LeaderboardsPage() {
  const [leaderboards, setLeaderboards] = useState({ teams: [], drivers: [] });

  useEffect(() => {
    api.get("/leaderboards").then((res) => setLeaderboards(res.data)).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-neonBlue">Rankings</p>
        <h2 className="mt-2 text-3xl font-black">Leaderboards</h2>
      </div>
      <Leaderboards data={leaderboards} />
    </div>
  );
}
