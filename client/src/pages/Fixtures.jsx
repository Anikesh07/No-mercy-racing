import { useEffect, useState } from "react";
import { api } from "../api.js";
import Badge from "../components/Badge.jsx";
import Panel from "../components/Panel.jsx";

const raceNames = {
  Team: "Grand Prix",
  Duo: "Duo Clash",
  Solo: "Solo Showdown",
  Rivalry: "Rivalry Clash"
};

const raceStyles = {
  Team: "border-neonPink/40 bg-neonPink/15 text-neonPink",
  Duo: "border-neonBlue/40 bg-neonBlue/15 text-neonBlue",
  Solo: "border-emerald-400/40 bg-emerald-400/15 text-emerald-300",
  Rivalry: "border-red-400/40 bg-red-400/15 text-red-300"
};

function raceName(type) {
  return raceNames[type] || type;
}

function RaceTypeBadge({ type }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${
        raceStyles[type] || "border-white/20 bg-white/10 text-white"
      }`}
    >
      {raceName(type)}
    </span>
  );
}

function raceDateLabel(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString();
}

function raceTimeLabel(time) {
  return time || "";
}

export default function Fixtures() {
  const [fixtures, setFixtures] = useState([]);
  const [dayFilter, setDayFilter] = useState("all");

  useEffect(() => {
    api
      .get("/fixtures")
      .then((res) => setFixtures(res.data))
      .catch(() => {});
  }, []);

  const visibleFixtures = fixtures.filter(
    (match) =>
      match.isPublished &&
      (dayFilter === "all" || String(match.day) === dayFilter)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-neonBlue">
          Race calendar
        </p>
        <h2 className="mt-2 text-3xl font-black">Fixtures</h2>
      </div>

      <Panel title="7-Day Match Schedule">
        {/* Day filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["all", "1", "2", "3", "4", "5", "6", "7"].map((day) => (
            <button
              key={day}
              onClick={() => setDayFilter(day)}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                dayFilter === day
                  ? "border-neonPink/50 bg-neonPink text-black"
                  : "border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {day === "all" ? "All" : `Day ${day}`}
            </button>
          ))}
        </div>

        <div className="grid gap-3">
          {visibleFixtures.length === 0 && (
            <p className="text-sm text-slate-400">
              No published fixtures for this filter.
            </p>
          )}

          {visibleFixtures.map((match) => (
            <div
              key={match._id}
              className="grid gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[120px_150px_130px_90px_140px_140px_1fr_110px] md:items-center"
            >
              <Badge tone={match.status === "Completed" ? "green" : "yellow"}>
                Day {match.day}
              </Badge>

              <RaceTypeBadge type={match.type} />

              <span className="text-sm text-slate-400">
                {raceDateLabel(match.raceDate)}
              </span>

              <span className="text-sm text-slate-400">
                {raceTimeLabel(match.raceTime)}
              </span>

              <span className="text-sm text-slate-300">
                {match.trackName || "Track TBA"}
              </span>

              <span className="text-sm text-slate-300">
                {match.carName || "Car TBA"}
              </span>

              {/* 🔥 THIS IS THE ONLY IMPORTANT CHANGE */}
              <span className="text-slate-300">
                {match.type === "Team"
                  ? "All Teams"
                  : match.type === "Duo"
                  ? "All Teams (2 racers)"
                  : match.teams
                      ?.map((team) => team.crewName)
                      .join(" vs ") || "All approved teams"}
              </span>

              <Badge tone={match.status === "Completed" ? "green" : "purple"}>
                {match.status}
              </Badge>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}