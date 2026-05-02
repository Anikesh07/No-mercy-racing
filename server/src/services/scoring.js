import Driver from "../models/Driver.js";
import Match from "../models/Match.js";
import Team from "../models/Team.js";

const teamGpPoints = [10, 8, 6, 5, 4, 3, 2];
const duoPoints = [8, 6, 5, 4, 3];

function positionPoints(type, position) {
  if (type === "Team") return teamGpPoints[position - 1] || 1;
  if (type === "Duo") return duoPoints[position - 1] || 2;
  return position === 1 ? 7 : 0;
}

function driverRating(position, disqualified) {
  if (disqualified) return 0;
  if (position === 1) return 12;
  if (position === 2) return 8;
  if (position === 3) return 6;
  return 2;
}

export async function applyResults(matchId, results) {
  const match = await Match.findById(matchId);
  if (!match) throw new Error("Match not found");
  if (match.status === "Completed") throw new Error("Results already submitted");

  const positions = new Set();
  for (const result of results) {
    if (positions.has(result.position)) throw new Error("Finishing positions must be unique");
    positions.add(result.position);
  }

  const teamDeltas = new Map();
  const addTeamDelta = (teamId, delta) => {
    const key = String(teamId);
    teamDeltas.set(key, (teamDeltas.get(key) || 0) + delta);
  };

  const participation = match.type === "Team" ? 4 : match.type === "Duo" ? 4 : 3;
  for (const participant of match.participants) {
    addTeamDelta(participant.teamId, participation * Math.max(participant.driverIds.length, match.type === "Solo" ? 1 : 0));
  }

  for (const result of results) {
    if (!result.disqualified) addTeamDelta(result.teamId, positionPoints(match.type, result.position));

    if (result.driverId) {
      const isWin = result.position === 1 && !result.disqualified;
      await Driver.findByIdAndUpdate(result.driverId, {
        $inc: {
          racesPlayed: 1,
          wins: isWin ? 1 : 0,
          podiums: result.position <= 3 && !result.disqualified ? 1 : 0,
          totalPositions: result.position,
          racePoints: result.disqualified ? 0 : positionPoints(match.type, result.position),
          ratingPoints: driverRating(result.position, result.disqualified)
        },
        $set: { status: "Eligible", restrictionReason: "" }
      });
    }
  }

  if (match.type === "Team") {
    const teamTotals = [...teamDeltas.entries()].sort((a, b) => a[1] - b[1]);
    if (teamTotals[0]) teamDeltas.set(teamTotals[0][0], teamTotals[0][1] - 3);
    if (teamTotals[1]) teamDeltas.set(teamTotals[1][0], teamTotals[1][1] - 2);
    if (teamTotals[2]) teamDeltas.set(teamTotals[2][0], teamTotals[2][1] - 1);

    const restrictedDriverIds = results
      .filter((result) => result.position <= 3 && result.driverId && !result.disqualified)
      .map((result) => result.driverId);
    await Driver.updateMany(
      { _id: { $in: restrictedDriverIds } },
      { $set: { status: "Restricted", restrictionReason: "Top Team GP performer cannot enter Duo or Solo today" } }
    );
  }

  if (match.type === "Rivalry" && match.betPoints > 0) {
    const sorted = [...results].sort((a, b) => a.position - b.position);
    if (sorted[0] && sorted[1]) {
      addTeamDelta(sorted[0].teamId, match.betPoints);
      addTeamDelta(sorted[1].teamId, -match.betPoints);
    }
  }

  for (const [teamId, delta] of teamDeltas.entries()) {
    await Team.findByIdAndUpdate(teamId, { $inc: { points: delta } });
  }

  match.results = results;
  match.status = "Completed";
  await match.save();
  return match;
}

export async function getLeaderboards() {
  const teams = await Team.find({ status: "Approved" }).sort({ points: -1, crewName: 1 });
  const drivers = await Driver.find().populate("teamId", "crewName").sort({ ratingPoints: -1, wins: -1, racePoints: -1 });

  return {
    teams: teams.map((team, index) => ({ ...team.toObject(), rank: index + 1 })),
    drivers: drivers.map((driver, index) => {
      const races = driver.racesPlayed || 0;
      return {
        ...driver.toObject(),
        rank: index + 1,
        winRate: races ? Math.round((driver.wins / races) * 100) : 0,
        avgPosition: races ? Number((driver.totalPositions / races).toFixed(2)) : 0
      };
    })
  };
}
