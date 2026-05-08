import Driver from "../models/Driver.js";
import Match from "../models/Match.js";
import Team from "../models/Team.js";

const RACE_TRACKS = [
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

function getRandomTrack() {
  return RACE_TRACKS[Math.floor(Math.random() * RACE_TRACKS.length)];
}

function spreadAcrossSevenDays(index, total) {
  if (total <= 7) return index + 1;
  return Math.floor((index * 7) / total) + 1;
}

function shuffleList(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function getQualifierCount(teamCount) {
  const count = Number(teamCount);
  if (count <= 8) return count;
  if (count <= 10) return 8;
  if (count <= 13) return 10;
  if (count <= 15) return 12;
  return count - (count % 2);
}

function flattenRounds(rounds) {
  return rounds.reduce((acc, round) => acc.concat(round), []);
}

function generateRoundRobinSchedule(teams) {
  const t = [...teams];
  if (t.length % 2 !== 0) {
    t.push(null);
  }
  
  const numRounds = t.length - 1;
  const half = t.length / 2;
  const rounds = [];
  
  for (let round = 0; round < numRounds; round++) {
    const roundMatches = [];
    for (let i = 0; i < half; i++) {
      const home = t[i];
      const away = t[t.length - 1 - i];
      if (home !== null && away !== null) {
        roundMatches.push([home, away]);
      }
    }
    rounds.push(roundMatches);
    t.splice(1, 0, t.pop());
  }
  
  return rounds;
}

function dateForDay(startDate, day) {
  if (!startDate) return undefined;
  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) return undefined;
  date.setDate(date.getDate() + day - 1);
  return date;
}

async function ensureApprovedTeams(teamCount) {
  const count = Number(teamCount);
  if (!Number.isInteger(count) || count < 2) {
    throw new Error("Enter at least 2 teams");
  }

  const existingTeams = await Team.find({ status: "Approved" }).sort({ createdAt: 1, crewName: 1 });
  const teams = [...existingTeams];
  let nextNumber = 1;

  while (teams.length < count) {
    let crewName = `Team ${nextNumber}`;
    while (await Team.exists({ crewName })) {
      nextNumber += 1;
      crewName = `Team ${nextNumber}`;
    }

    const team = await Team.create({
      crewName,
      leaderName: `${crewName} Leader`,
      discord: `${crewName.toLowerCase().replace(/\s+/g, "-")}-discord`,
      status: "Approved"
    });
    teams.push(team);
    nextNumber += 1;
  }

  return teams.slice(0, count);
}

async function participantsForTeams(teams, raceType) {
  const participants = [];

  for (const team of teams) {
    const drivers = await Driver.find({ teamId: team._id }).sort({ role: 1, alias: 1 });
    const driverLimit = raceType === "Team" ? 4 : raceType === "Duo" ? 2 : 0;
    participants.push({
      teamId: team._id,
      driverIds: drivers.slice(0, driverLimit).map((driver) => driver._id)
    });
  }

  return participants;
}

export async function resetDriverStatuses(day) {
  await Driver.updateMany({}, { $set: { status: "Eligible", restrictionReason: "" } });
  if (day) {
    await Driver.updateMany(
      { "assignments.day": day },
      { $pull: { assignments: { day } }, $set: { status: "Eligible", restrictionReason: "" } }
    );
  }
}

export async function generateFixtures() {
  const teams = await Team.find({ status: "Approved" }).sort({ crewName: 1 });
  if (teams.length < 2) throw new Error("At least 2 approved teams are required");

  await Match.deleteMany({ status: "Pending" });
  await resetDriverStatuses();

  const matches = [];
  for (let day = 1; day <= 7; day += 1) {
    const teamParticipants = [];
    const duoParticipants = [];

    for (const team of teams) {
      const drivers = await Driver.find({ teamId: team._id }).sort({ role: 1, alias: 1 });
      const mains = drivers.filter((driver) => driver.role === "Main").slice(0, 4);
      const duo = drivers.slice(0, 2);

      teamParticipants.push({ teamId: team._id, driverIds: mains.map((driver) => driver._id) });
      duoParticipants.push({ teamId: team._id, driverIds: duo.map((driver) => driver._id) });
    }

    // Day 1-2: ONLY Grand Prix races
    matches.push({
      day,
      slot: 1,
      type: "Team",
      trackName: getRandomTrack(),
      teams: teams.map((team) => team._id),
      participants: teamParticipants
    });

    // Days 3+: Include Duo matches
    if (day >= 3) {
      matches.push({
        day,
        slot: 2,
        type: "Duo",
        trackName: getRandomTrack(),
        teams: teams.map((team) => team._id),
        participants: duoParticipants
      });
    }
  }

  // Solo matches only from day 3 onwards
  const soloRounds = generateRoundRobinSchedule(teams);
  const dailySlots = { 3: 3, 4: 3, 5: 3, 6: 3, 7: 3 };

  soloRounds.forEach((roundMatches, roundIndex) => {
    // Start from day 3 instead of day 2
    const day = 3 + (roundIndex % 5);
    roundMatches.forEach(([home, away]) => {
      matches.push({
        day,
        slot: dailySlots[day]++,
        type: "Solo",
        trackName: getRandomTrack(),
        teams: [home._id, away._id],
        participants: [
          { teamId: home._id, driverIds: [] },
          { teamId: away._id, driverIds: [] }
        ]
      });
    });
  });

  return Match.insertMany(matches);
}

export async function generateCustomFixtures({ teamCount, startDate, shuffle = true } = {}) {
  const selectedTeams = await ensureApprovedTeams(teamCount);
  const teams = shuffle ? shuffleList(selectedTeams) : selectedTeams;

  await Match.deleteMany({ status: "Pending" });
  await resetDriverStatuses();

  const matches = [];

  for (let day = 1; day <= 7; day += 1) {
    const raceDate = dateForDay(startDate, day);

    // Days 1-2: ONLY Grand Prix races (Team matches)
    matches.push({
      day,
      raceDate,
      slot: 1,
      type: "Team",
      trackName: getRandomTrack(),
      teams: teams.map((team) => team._id),
      participants: await participantsForTeams(teams, "Team")
    });

    // Days 3+: Include Duo matches
    if (day >= 3) {
      matches.push({
        day,
        raceDate,
        slot: 2,
        type: "Duo",
        trackName: getRandomTrack(),
        teams: teams.map((team) => team._id),
        participants: await participantsForTeams(teams, "Duo")
      });
    }
  }

  // Solo matches only from day 3 onwards
  const soloRounds = generateRoundRobinSchedule(teams);
  const shuffledRounds = shuffle ? shuffleList(soloRounds) : soloRounds;
  const dailySlots = { 3: 3, 4: 3, 5: 3, 6: 3, 7: 3 };

  shuffledRounds.forEach((roundMatches, roundIndex) => {
    // Start from day 3 instead of day 2
    const day = 3 + (roundIndex % 5);
    roundMatches.forEach(([home, away]) => {
      matches.push({
        day,
        raceDate: dateForDay(startDate, day),
        slot: dailySlots[day]++,
        type: "Solo",
        trackName: getRandomTrack(),
        teams: [home._id, away._id],
        participants: [
          { teamId: home._id, driverIds: [] },
          { teamId: away._id, driverIds: [] }
        ]
      });
    });
  });

  return Match.insertMany(matches);
}

export async function assignDrivers(matchId, participantAssignments) {
  const match = await Match.findById(matchId);
  if (!match) throw new Error("Match not found");
  if (match.status === "Completed") throw new Error("Completed matches cannot be edited");

  const teamIdsInSlot = match.teams.map(String);
  const driverIds = participantAssignments.flatMap((entry) => entry.driverIds);
  const drivers = await Driver.find({ _id: { $in: driverIds } });

  const used = new Set();
  for (const driver of drivers) {
    if (!teamIdsInSlot.includes(String(driver.teamId))) {
      throw new Error(`${driver.alias} does not belong to this match`);
    }
    if (driver.status === "Restricted") {
      throw new Error(`${driver.alias} is restricted: ${driver.restrictionReason}`);
    }
    if (used.has(String(driver._id))) {
      throw new Error(`${driver.alias} is assigned twice`);
    }
    const sameDayAssignment = driver.assignments.find(
      (assignment) => assignment.day === match.day && ["Duo", "Solo"].includes(assignment.type) && assignment.type !== match.type
    );
    if (sameDayAssignment) {
      throw new Error(`${driver.alias} is already assigned to ${sameDayAssignment.type} on day ${match.day}`);
    }
    used.add(String(driver._id));
  }

  match.participants = participantAssignments;
  await match.save();

  await Driver.updateMany(
    { _id: { $in: driverIds } },
    { $push: { assignments: { matchId: match._id, day: match.day, type: match.type } }, $set: { status: "Assigned" } }
  );

  return match;
}

/* =====================================================
   NEW FIXTURE SYSTEM: ROUND ROBIN → ELIMINATION
   ===================================================== */

/**
 * Generate all possible Team vs Team matchups for Round Robin
 * @param {Array} teams - Array of team objects
 * @returns {Array} Array of [team1, team2] pairs
 */
function generateTeamVsTeamMatchups(teams) {
  const matchups = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matchups.push([teams[i], teams[j]]);
    }
  }
  return matchups;
}

function createBracketPairs(teams) {
  const pairs = [];
  let left = 0;
  let right = teams.length - 1;

  while (left < right) {
    pairs.push([teams[left], teams[right]]);
    left += 1;
    right -= 1;
  }

  return pairs;
}

/**
 * Generate the qualifying stage for Days 1-2.
 * Only Grand Prix matches are created on these days.
 * @param {Array} teams - Array of team objects
 * @param {Date} startDate - Tournament start date
 * @returns {Array} Array of match objects for the qualifying stage
 */
async function generateQualifyingStage(teams, startDate) {
  const matches = [];
  const rounds = generateRoundRobinSchedule(teams);
  const dayRounds = [rounds[0] || [], rounds[1] || []];

  for (let dayIndex = 0; dayIndex < 2; dayIndex += 1) {
    const day = dayIndex + 1;
    let slot = 1;

    for (const [team1, team2] of dayRounds[dayIndex]) {
      const drivers1 = await Driver.find({ teamId: team1._id }).sort({ role: 1, alias: 1 }).limit(4);
      const drivers2 = await Driver.find({ teamId: team2._id }).sort({ role: 1, alias: 1 }).limit(4);

      matches.push({
        day,
        raceDate: dateForDay(startDate, day),
        slot: slot++,
        type: "Team",
        trackName: getRandomTrack(),
        teams: [team1._id, team2._id],
        participants: [
          { teamId: team1._id, driverIds: drivers1.map((d) => d._id) },
          { teamId: team2._id, driverIds: drivers2.map((d) => d._id) }
        ]
      });
    }
  }

  return matches;
}

/**
 * Get current standings/rankings from completed matches
 * @returns {Array} Sorted array of teams with their current points
 */
async function getCurrentStandings() {
  const teams = await Team.find({ status: "Approved" }).sort({ points: -1, crewName: 1 });
  return teams;
}

/**
 * Generate Elimination stage matches (Day 3+)
 * Teams are progressively eliminated based on standings
 * @param {Array} standings - Teams sorted by points (highest first)
 * @param {Date} startDate - Tournament start date
 * @returns {Array} Array of elimination stage match objects
 */
async function generateEliminationStage(qualifiers, startDate) {
  const matches = [];
  const eliminationPairings = createBracketPairs(qualifiers);
  const supportPairings = flattenRounds(generateRoundRobinSchedule(qualifiers));
  let supportIndex = 0;
  let day = 3;

  for (const [team1, team2] of eliminationPairings) {
    const drivers1 = await Driver.find({ teamId: team1._id }).sort({ role: 1, alias: 1 }).limit(4);
    const drivers2 = await Driver.find({ teamId: team2._id }).sort({ role: 1, alias: 1 }).limit(4);

    // Grand Prix elimination match
    matches.push({
      day,
      raceDate: dateForDay(startDate, day),
      slot: 1,
      type: "Team",
      trackName: getRandomTrack(),
      teams: [team1._id, team2._id],
      participants: [
        { teamId: team1._id, driverIds: drivers1.map((d) => d._id) },
        { teamId: team2._id, driverIds: drivers2.map((d) => d._id) }
      ]
    });

    // Duo Clash support match for the same day
    const duoPair = supportPairings[supportIndex % supportPairings.length];
    supportIndex += 1;
    if (duoPair && duoPair[0] && duoPair[1]) {
      const duoDrivers1 = await Driver.find({ teamId: duoPair[0]._id }).sort({ role: 1, alias: 1 }).limit(2);
      const duoDrivers2 = await Driver.find({ teamId: duoPair[1]._id }).sort({ role: 1, alias: 1 }).limit(2);

      matches.push({
        day,
        raceDate: dateForDay(startDate, day),
        slot: 2,
        type: "Duo",
        trackName: getRandomTrack(),
        teams: [duoPair[0]._id, duoPair[1]._id],
        participants: [
          { teamId: duoPair[0]._id, driverIds: duoDrivers1.map((d) => d._id) },
          { teamId: duoPair[1]._id, driverIds: duoDrivers2.map((d) => d._id) }
        ]
      });
    }

    // Solo Showdown support match for the same day
    const soloPair = supportPairings[supportIndex % supportPairings.length];
    supportIndex += 1;
    if (soloPair && soloPair[0] && soloPair[1]) {
      matches.push({
        day,
        raceDate: dateForDay(startDate, day),
        slot: 3,
        type: "Solo",
        trackName: getRandomTrack(),
        teams: [soloPair[0]._id, soloPair[1]._id],
        participants: [
          { teamId: soloPair[0]._id, driverIds: [] },
          { teamId: soloPair[1]._id, driverIds: [] }
        ]
      });
    }

    day += 1;
  }

  return matches;
}

/**
 * Main function: Generate new tournament fixtures with Round Robin → Elimination format
 * @param {Object} options - { teamCount, startDate, shuffle }
 * @returns {Array} All generated matches
 */
export async function generateNewTournamentFixtures({ teamCount, startDate, shuffle = true } = {}) {
  const selectedTeams = await ensureApprovedTeams(teamCount);
  const teams = shuffle ? shuffleList(selectedTeams) : selectedTeams;
  const qualifierCount = getQualifierCount(teams.length);
  const qualifiers = teams.slice(0, qualifierCount);

  // Clear existing pending matches
  await Match.deleteMany({ status: "Pending" });
  await resetDriverStatuses();

  const matches = [];

  // ===== QUALIFYING STAGE (Days 1-2) =====
  // Only Team Grand Prix races are generated for the first two days.
  const qualifyingMatches = await generateQualifyingStage(teams, startDate);
  matches.push(...qualifyingMatches);

  // ===== ELIMINATION STAGE (Day 3 onwards) =====
  // Use seeded qualifiers to generate a bracket-style elimination flow.
  const eliminationMatches = await generateEliminationStage(qualifiers, startDate);
  matches.push(...eliminationMatches);

  return Match.insertMany(matches);
}

/* ===================================================
   OLD FIXTURE SYSTEM (KEPT FOR REFERENCE/ROLLBACK)
   
   These functions can be restored if needed.
   The new system above (generateNewTournamentFixtures)
   replaces these old fixture generation methods.
   =================================================== */

/*
// OLD: generateFixtures() - commented out
// OLD: generateCustomFixtures() - commented out
// These are replaced by generateNewTournamentFixtures()
*/