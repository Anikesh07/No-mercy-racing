import { CalendarDays, Trophy, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api.js";
import bg from "../assets/bg.png";

export default function Home() {
  const [leaderboards, setLeaderboards] = useState({ teams: [], drivers: [] });
  const [fixtures, setFixtures] = useState([]);
  const [viewMode, setViewMode] = useState("teams");

  useEffect(() => {
    api.get("/leaderboards").then(res => setLeaderboards(res.data)).catch(() => {});
    api.get("/fixtures").then(res => setFixtures(res.data)).catch(() => {});
  }, []);

  const upcoming = fixtures.slice(0, 3);
  const topTeam = leaderboards.teams?.[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-14">

      {/* 🔥 HERO */}
      <section className="relative rounded-2xl border border-white/10 overflow-hidden h-[420px] flex items-center p-8">

  {/* 🖼 BACKGROUND IMAGE */}
  <img
    src={bg}
    alt="bg"
    className="absolute inset-0 w-full h-full object-cover"
  />

  {/* 🔥 DARK OVERLAY (READABILITY FIX) */}
  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

  {/* CONTENT */}
  <div className="relative z-10">
    <p className="text-xs tracking-widest text-neonBlue">
      HydraLyx
    </p>

    <h1 className="text-5xl font-black mt-2 bg-gradient-to-r from-white via-neonPink to-purple-400 bg-clip-text text-transparent">
      NO MERCY 1.0
    </h1>

    <p className="mt-4 text-slate-300 max-w-xl">
      This isn’t racing. This is war on wheels.  
      Only the fastest survive.
    </p>

    <div className="mt-6 flex gap-4 flex-wrap">

      <Link
        to="/register"
        className="px-5 py-2.5 rounded-lg font-semibold text-black 
        bg-gradient-to-r from-neonPink to-purple-500 
        shadow-[0_0_20px_rgba(255,0,150,0.6)] 
        hover:scale-105 transition"
      >
        Join Race
      </Link>

      <Link
        to="/fixtures"
        className="px-5 py-2.5 rounded-lg font-semibold text-neonBlue 
        border border-neonBlue/40 
        hover:bg-neonBlue/10 transition"
      >
        Schedule
      </Link>

      <Link
        to="/pov-submit"
        className="px-5 py-2.5 rounded-lg font-semibold text-yellow-400 
        border border-yellow-400/40 
        hover:bg-yellow-400/10 transition"
      >
        Submit POV
      </Link>

    </div>
  </div>
</section>

      {/* 🏁 TOGGLE + PODIUM */}
      <section>
        <div className="flex items-center justify-between mb-6">

          <h2 className="text-2xl font-black flex items-center gap-2">
            <Trophy /> TOP {viewMode === "drivers" ? "DRIVERS" : "CREWS"}
          </h2>

          <div className="flex rounded-lg border border-white/10 overflow-hidden">
            <button
  onClick={() => setViewMode("teams")}
  className={`px-4 py-2 text-sm font-bold transition ${
    viewMode === "teams"
      ? "bg-neonBlue text-black"
      : "text-slate-400 hover:bg-white/10"
  }`}
>
  Crews
</button>

<button
  onClick={() => setViewMode("drivers")}
  className={`px-4 py-2 text-sm font-bold transition ${
    viewMode === "drivers"
      ? "bg-neonPink text-black"
      : "text-slate-400 hover:bg-white/10"
  }`}
>
  Drivers
</button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-end justify-center gap-6">

          {viewMode === "teams" && (
  <>
    {leaderboards.teams?.[1] && (
      <TeamCard team={leaderboards.teams[1]} rank="2" size="medium" />
    )}
    {leaderboards.teams?.[0] && (
      <TeamCard team={leaderboards.teams[0]} rank="1" size="large" highlight />
    )}
    {leaderboards.teams?.[2] && (
      <TeamCard team={leaderboards.teams[2]} rank="3" size="small" />
    )}
  </>
)}

{viewMode === "drivers" && (
  <>
    {leaderboards.drivers?.[1] && (
      <DriverCard driver={leaderboards.drivers[1]} rank="2" size="medium" />
    )}
    {leaderboards.drivers?.[0] && (
      <DriverCard driver={leaderboards.drivers[0]} rank="1" size="large" highlight />
    )}
    {leaderboards.drivers?.[2] && (
      <DriverCard driver={leaderboards.drivers[2]} rank="3" size="small" />
    )}
  </>
)}

        </div>
      </section>

      {/* ⚡ UPCOMING */}
      <section>
        <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
          <CalendarDays /> NEXT RACES
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {upcoming.map(race => (
            <div key={race._id} className="race-box">
              <div className="flex justify-between text-xs text-slate-500">
                <span>DAY {race.day}</span>
                <span>{race.type}</span>
              </div>

              <h3 className="text-lg font-bold mt-2">
                {race.trackName || "TRACK UNKNOWN"}
              </h3>

              <p className="text-sm text-slate-400 mt-2">
                {race.raceDate
                  ? new Date(race.raceDate).toDateString()
                  : "DATE TBA"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 📜 RULES / INFO */}
<section>
  <h2 className="text-2xl font-black mb-6">
    📜 LEAGUE RULES
  </h2>

  <div className="grid md:grid-cols-3 gap-4">

    <div className="p-5 rounded-xl border border-white/10 bg-black/40">
      <h3 className="font-bold text-neonPink mb-2">
        Race Discipline
      </h3>
      <p className="text-sm text-slate-400">
        No intentional crashes, blocking, or dirty driving.
        Violations lead to penalties or disqualification.
      </p>
    </div>

    <div className="p-5 rounded-xl border border-white/10 bg-black/40">
      <h3 className="font-bold text-neonBlue mb-2">
        POV Submission
      </h3>
      <p className="text-sm text-slate-400">
        Every driver must submit POV after races.
        Missing POV = automatic penalty.
      </p>
    </div>

    <div className="p-5 rounded-xl border border-white/10 bg-black/40">
      <h3 className="font-bold text-yellow-400 mb-2">
        Fair Play
      </h3>
      <p className="text-sm text-slate-400">
        No exploits, cheats, or unfair advantages.
        Keep it competitive, not toxic.
      </p>
    </div>

  </div>
</section>
    </div>
  );
}

/* DRIVER CARD */
function DriverCard({ driver, rank, size, highlight }) {
  const sizes = {
    large: "h-[240px] w-[260px] scale-110",
    medium: "h-[210px] w-[230px]",
    small: "h-[190px] w-[210px]"
  };

  const rankStyle =
    rank === "1"
      ? "text-yellow-400 drop-shadow-[0_0_30px_rgba(255,215,0,0.9)] scale-110"
      : rank === "2"
      ? "text-gray-300 drop-shadow-[0_0_25px_rgba(200,200,200,0.8)]"
      : "text-orange-400 drop-shadow-[0_0_25px_rgba(255,140,0,0.8)]";

  return (
    <div
      className={`relative flex flex-col justify-center items-center text-center rounded-xl border 
      ${highlight ? "border-yellow-400 shadow-[0_0_60px_rgba(255,215,0,0.4)]" : "border-white/10"}
      bg-black/40 backdrop-blur p-4 ${sizes[size]}`}
    >

      {/* 🔥 BIG RANK */}
      <div className={`text-6xl font-black tracking-widest ${rankStyle}`}>
        #{rank}
      </div>

      <h3 className="text-xl font-black mt-2">
        {driver.alias}
      </h3>

      <p className="text-sm text-slate-400">
        {driver.teamId?.crewName || "Independent"}
      </p>

      <div className="mt-4 text-3xl font-black text-neonPink">
        {driver.ratingPoints}
      </div>

      <p className="text-xs text-slate-500">Rating</p>
    </div>
  );
}

/* TEAM CARD */
function TeamCard({ team, rank, size, highlight }) {
  const sizes = {
    large: "h-[240px] w-[260px] scale-110",
    medium: "h-[210px] w-[230px]",
    small: "h-[190px] w-[210px]"
  };

  const rankStyle =
    rank === "1"
      ? "text-neonBlue drop-shadow-[0_0_30px_rgba(0,200,255,0.9)] scale-110"
      : rank === "2"
      ? "text-gray-300 drop-shadow-[0_0_25px_rgba(200,200,200,0.8)]"
      : "text-orange-400 drop-shadow-[0_0_25px_rgba(255,140,0,0.8)]";

  return (
    <div
      className={`relative flex flex-col justify-center items-center text-center rounded-xl border 
      ${highlight ? "border-neonBlue shadow-[0_0_60px_rgba(0,200,255,0.4)]" : "border-white/10"}
      bg-black/40 backdrop-blur p-4 ${sizes[size]}`}
    >

      {/* 🔥 BIG RANK */}
      <div className={`text-6xl font-black tracking-widest ${rankStyle}`}>
        #{rank}
      </div>

      <h3 className="text-xl font-black mt-2">
        {team.crewName}
      </h3>

      <div className="mt-4 text-3xl font-black text-neonBlue">
        {team.points}
      </div>

      <p className="text-xs text-slate-500">Points</p>
    </div>
  );
}