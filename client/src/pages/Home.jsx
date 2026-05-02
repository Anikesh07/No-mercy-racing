import { CalendarDays, Gauge, ShieldCheck, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api.js";
import Badge from "../components/Badge.jsx";
import Panel from "../components/Panel.jsx";

export default function Home() {
  const [leaderboards, setLeaderboards] = useState({ teams: [], drivers: [] });

  useEffect(() => {
    api.get("/leaderboards").then((res) => setLeaderboards(res.data)).catch(() => {});
  }, []);

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:py-12">
      <section className="flex min-h-[420px] flex-col justify-center">
          <Badge tone="pink">Automated tournament control</Badge>
          <h2 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
            No Mercy Racing League
          </h2>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            A full tournament system for crew registration, race scheduling, result entry, team points, driver ratings, penalties, and POV tracking.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/register" className="rounded-lg bg-neonPink px-5 py-3 font-bold text-black shadow-glow">Register Crew</Link>
            <Link to="/leaderboards" className="rounded-lg border border-neonBlue/40 px-5 py-3 font-bold text-neonBlue hover:bg-neonBlue/10">View Rankings</Link>
          </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat icon={Trophy} label="Top Team Points" value={leaderboards.teams?.[0]?.points ?? 0} />
        <Stat icon={Gauge} label="Top Driver Rating" value={leaderboards.drivers?.[0]?.ratingPoints ?? 0} />
        <Stat icon={CalendarDays} label="Race Days" value="7" />
      </section>

      <Panel title="System Modules" action={<ShieldCheck className="h-5 w-5 text-neonBlue" />}>
        <div className="grid gap-3 md:grid-cols-3">
          {["Registration validation", "Fixture automation", "Rating leaderboard", "Eligibility locks", "Penalty controls", "POV duplicate checks"].map((item) => (
            <div key={item} className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">{item}</div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="glass rounded-lg p-4">
      <Icon className="h-5 w-5 text-neonPink" />
      <p className="mt-3 text-sm text-slate-400">{label}</p>
      <p className="text-3xl font-black text-white">{value}</p>
    </div>
  );
}
