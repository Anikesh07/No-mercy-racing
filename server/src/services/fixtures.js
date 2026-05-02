import Driver from "../models/Driver.js";
import Match from "../models/Match.js";
import Team from "../models/Team.js";

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

    matches.push({
      day,
      slot: 1,
      type: "Team",
      teams: teams.map((team) => team._id),
      participants: teamParticipants
    });

    matches.push({
      day,
      slot: 2,
      type: "Duo",
      teams: teams.map((team) => team._id),
      participants: duoParticipants
    });
  }

  const soloPairs = [];
  for (let i = 0; i < teams.length; i += 1) {
    for (let j = i + 1; j < teams.length; j += 1) {
      soloPairs.push([teams[i], teams[j]]);
    }
  }

  soloPairs.forEach(([home, away], index) => {
    const day = spreadAcrossSevenDays(index, soloPairs.length);
    matches.push({
      day,
      slot: 3 + index,
      type: "Solo",
      teams: [home._id, away._id],
      participants: [
        { teamId: home._id, driverIds: [] },
        { teamId: away._id, driverIds: [] }
      ]
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

    matches.push({
      day,
      raceDate,
      slot: 1,
      type: "Team",
      teams: teams.map((team) => team._id),
      participants: await participantsForTeams(teams, "Team")
    });

    matches.push({
      day,
      raceDate,
      slot: 2,
      type: "Duo",
      teams: teams.map((team) => team._id),
      participants: await participantsForTeams(teams, "Duo")
    });
  }

  const soloPairs = [];
  for (let first = 0; first < teams.length; first += 1) {
    for (let second = first + 1; second < teams.length; second += 1) {
      soloPairs.push([teams[first], teams[second]]);
    }
  }

  const soloSchedule = shuffle ? shuffleList(soloPairs) : soloPairs;
  soloSchedule.forEach(([home, away], index) => {
    const day = 2 + (index % 6);
    matches.push({
      day,
      raceDate: dateForDay(startDate, day),
      slot: 3 + Math.floor(index / 6),
      type: "Solo",
      teams: [home._id, away._id],
      participants: [
        { teamId: home._id, driverIds: [] },
        { teamId: away._id, driverIds: [] }
      ]
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
