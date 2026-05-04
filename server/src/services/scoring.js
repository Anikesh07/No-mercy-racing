import Driver from "../models/Driver.js";
import Match from "../models/Match.js";
import Team from "../models/Team.js";

/* ================= DYNAMIC POINT SYSTEM ================= */

function getMultiplier(type) {
  switch (type) {
    case "Team": return 2.0;      // Grand Prix
    case "Duo": return 1.5;       // Duo Clash
    case "Solo": return 1.2;      // Solo Showdown
    case "Rivalry": return 1.3;   // Rivalry
    default: return 1;
  }
}

function calculatePoints(type, position, total, disqualified) {
  if (disqualified) return 0;

  const base = total - position + 1;
  const participation = 2;
  const multiplier = getMultiplier(type);

  return Math.round((base + participation) * multiplier);
}

function driverRating(points, disqualified) {
  if (disqualified) return 0;
  return Math.round(points * 1.2); // simple scaling
}

/* ================= APPLY RESULTS ================= */

export async function applyResults(matchId, results) {
  const match = await Match.findById(matchId);
  if (!match) throw new Error("Match not found");
  if (match.status === "Completed") throw new Error("Results already submitted");

  // ✅ Unique positions check
  const positions = new Set();
  for (const r of results) {
    if (positions.has(r.position)) {
      throw new Error("Positions must be unique");
    }
    positions.add(r.position);
  }

  const teamDeltas = new Map();

  const addTeamDelta = (teamId, delta) => {
    const key = String(teamId);
    teamDeltas.set(key, (teamDeltas.get(key) || 0) + delta);
  };

  const total = results.length;

  /* ================= RESULTS PROCESS ================= */

  for (const r of results) {
    const pts = calculatePoints(
      match.type,
      r.position,
      total,
      r.disqualified
    );

    addTeamDelta(r.teamId, pts);

    if (r.driverId) {
      const isWin = r.position === 1 && !r.disqualified;

      await Driver.findByIdAndUpdate(r.driverId, {
        $inc: {
          racesPlayed: 1,
          wins: isWin ? 1 : 0,
          podiums: r.position <= 3 && !r.disqualified ? 1 : 0,
          totalPositions: r.position,
          racePoints: pts,
          ratingPoints: driverRating(pts, r.disqualified)
        },

        $min: {
          bestPosition: r.position
        },

        $set: {
          status: "Eligible",
          restrictionReason: ""
        }
      });
    }
  }

  /* ================= TEAM GP PENALTIES ================= */

  if (match.type === "Team") {
    const sorted = [...teamDeltas.entries()].sort((a, b) => a[1] - b[1]);

    if (sorted[0]) teamDeltas.set(sorted[0][0], sorted[0][1] - 3);
    if (sorted[1]) teamDeltas.set(sorted[1][0], sorted[1][1] - 2);
    if (sorted[2]) teamDeltas.set(sorted[2][0], sorted[2][1] - 1);

    const restrictedDrivers = results
      .filter(r => r.position <= 3 && r.driverId && !r.disqualified)
      .map(r => r.driverId);

    await Driver.updateMany(
      { _id: { $in: restrictedDrivers } },
      {
        $set: {
          status: "Restricted",
          restrictionReason: "Top GP performers cannot join Duo/Solo today"
        }
      }
    );
  }

  /* ================= RIVALRY BET ================= */

  if (match.type === "Rivalry" && match.betPoints > 0) {
    const sorted = [...results].sort((a, b) => a.position - b.position);

    if (sorted[0] && sorted[1]) {
      addTeamDelta(sorted[0].teamId, match.betPoints);
      addTeamDelta(sorted[1].teamId, -match.betPoints);
    }
  }

  /* ================= SAVE TEAM POINTS ================= */

  for (const [teamId, delta] of teamDeltas.entries()) {
    await Team.findByIdAndUpdate(teamId, {
      $inc: { points: delta }
    });
  }

  match.results = results;
  match.status = "Completed";
  await match.save();

  return match;
}

/* ================= LEADERBOARDS ================= */

export async function getLeaderboards() {
  const teams = await Team.find({ status: "Approved" });
  const drivers = await Driver.find().populate("teamId", "crewName");
  const matches = await Match.find({ status: "Completed" });

  const teamMap = {};

  teams.forEach(team => {
    teamMap[team._id] = {
      ...team.toObject(),
      breakdown: {
        grandPrix: 0,
        duo: 0,
        solo: 0,
        rivalry: 0
      }
    };
  });

  matches.forEach(match => {
    const total = match.results.length;

    match.results.forEach(result => {
      if (result.disqualified) return;

      const team = teamMap[result.teamId];
      if (!team) return;

      const pts = calculatePoints(
        match.type,
        result.position,
        total,
        result.disqualified
      );

      if (match.type === "Team") team.breakdown.grandPrix += pts;
      if (match.type === "Duo") team.breakdown.duo += pts;
      if (match.type === "Solo") team.breakdown.solo += pts;
      if (match.type === "Rivalry") team.breakdown.rivalry += pts;
    });
  });

  const teamLeaderboard = Object.values(teamMap)
    .sort((a, b) => b.points - a.points)
    .map((team, i) => ({
      ...team,
      rank: i + 1
    }));

  const driverLeaderboard = drivers
    .map(driver => {
      const races = driver.racesPlayed || 0;

      return {
        ...driver.toObject(),

        winRate: races
          ? Math.round((driver.wins / races) * 100)
          : 0,

        avgPosition: races
          ? Number((driver.totalPositions / races).toFixed(2))
          : 0,

        bestPosition: driver.bestPosition || "-"
      };
    })
    .sort((a, b) => {
      if (b.ratingPoints !== a.ratingPoints)
        return b.ratingPoints - a.ratingPoints;

      if (b.wins !== a.wins)
        return b.wins - a.wins;

      return a.avgPosition - b.avgPosition;
    })
    .map((driver, i) => ({
      ...driver,
      rank: i + 1
    }));

  return {
    teams: teamLeaderboard,
    drivers: driverLeaderboard
  };
}