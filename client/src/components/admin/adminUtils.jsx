import React from "react";

export const raceNames = {
  Team: "Grand Prix",
  Duo: "Duo Clash",
  Solo: "Solo Showdown",
  Rivalry: "Rivalry Clash"
};

export const raceStyles = {
  Team: "border-neonPink/40 bg-neonPink/15 text-neonPink",
  Duo: "border-neonBlue/40 bg-neonBlue/15 text-neonBlue",
  Solo: "border-emerald-400/40 bg-emerald-400/15 text-emerald-300",
  Rivalry: "border-red-400/40 bg-red-400/15 text-red-300"
};

export const RACE_TRACKS = [
  "Vinwood toug",
  "Shadow Line",
  "Reverse Track",
  "Focus Death Trip",
  "City Sprint",
  "BBD Breeze",
  "East Side Oilers",
  "Hotlap Incident",
  "East Side GP",
  "Blackout",
  "Sandy Circuit",
  "Starway Drive"
];

export function raceName(type) {
  return raceNames[type] || type;
}

export function RaceTypeBadge({ type }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${raceStyles[type] || "border-white/20 bg-white/10 text-white"}`}>
      {raceName(type)}
    </span>
  );
}

export function formatRaceDate(date) {
  if (!date) return "Date not set";
  return new Date(date).toLocaleDateString();
}

export function dateInputValue(date) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function teamIdsFromMatch(match) {
  return match.teams?.map((team) => team._id || team).filter(Boolean) || [];
}
