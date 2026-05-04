import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  CircleSlash,
  Clock,
  Eye,
  EyeOff,
  KeyRound,
  LayoutDashboard,
  Link,
  MessageSquare,
  Plus,
  RefreshCcw,
  Save,
  Shield,
  Shuffle,
  Trophy
} from "lucide-react";
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

const dayFilters = [
  { id: "all", label: "All" },
  { id: "1", label: "Day 1" },
  { id: "2", label: "Day 2" },
  { id: "3", label: "Day 3" },
  { id: "4", label: "Day 4" },
  { id: "5", label: "Day 5" },
  { id: "6", label: "Day 6" },
  { id: "7", label: "Day 7" }
];

const adminSections = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "fixtures", label: "Fixtures", icon: CalendarDays },
  { id: "teams", label: "Teams", icon: Check },
  { id: "results", label: "Results", icon: Trophy },
  { id: "penalties", label: "Penalties", icon: Shield },
  { id: "povs", label: "POVs", icon: Link },
  { id: "eligibility", label: "Eligibility", icon: CircleSlash },
  { id: "chat", label: "Admin Chat", icon: MessageSquare }
];

function raceName(type) {
  return raceNames[type] || type;
}

function RaceTypeBadge({ type }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${raceStyles[type] || "border-white/20 bg-white/10 text-white"}`}>
      {raceName(type)}
    </span>
  );
}

function raceDateLabel(match) {
  if (!match.raceDate) return "";
  return ` - ${new Date(match.raceDate).toLocaleDateString()}`;
}

function formatRaceDate(date) {
  if (!date) return "Date not set";
  return new Date(date).toLocaleDateString();
}

function dateInputValue(date) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

function teamIdsFromMatch(match) {
  return match.teams?.map((team) => team._id || team).filter(Boolean) || [];
}

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem("nmrl_token") || "");
  const [login, setLogin] = useState({ username: "", password: "" });
  const [dashboard, setDashboard] = useState({ teams: [], drivers: [], matches: [], penalties: [] });
  const [fixtureForm, setFixtureForm] = useState({ teamCount: 8, startDate: "", shuffle: true });
  const [activeSection, setActiveSection] = useState("overview");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  const isAuthed = Boolean(token);

  const load = async () => {
    if (!localStorage.getItem("nmrl_token")) return;
    const res = await api.get("/admin/dashboard");
    setDashboard(res.data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, [token]);

  const doLogin = async (event) => {
    event.preventDefault();
    try {
      const res = await api.post("/auth/login", login);
      localStorage.setItem("nmrl_token", res.data.token);
      setToken(res.data.token);
      setMessage("Admin session active.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed.");
    }
  };

  if (!isAuthed) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <Panel title="Admin Control" className="w-full max-w-md">
          <form onSubmit={doLogin} className="space-y-4">
            <div className="grid h-12 w-12 place-items-center rounded-lg border border-neonPink/40 bg-neonPink/10">
              <KeyRound className="text-neonPink" />
            </div>
            <input required placeholder="Username" value={login.username} onChange={(e) => setLogin({ ...login, username: e.target.value })} className="w-full px-3 py-2" />
            <input required type="password" placeholder="Password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} className="w-full px-3 py-2" />
            <button className="w-full rounded-lg bg-neonPink px-4 py-2 font-bold text-black">Login</button>
            {message && <p className="text-sm text-neonBlue">{message}</p>}
          </form>
        </Panel>
      </main>
    );
  }

  const approve = async (teamId, status) => {
    await api.patch(`/admin/teams/${teamId}/status`, { status });
    await load();
  };

const deleteTeam = async (id) => {
  if (!window.confirm("Are you sure you want to delete this team?")) return;

  await api.delete(`/admin/teams/${id}`);
  await load();
};

const updateTeam = async (team) => {
  setSaving(true);

  await api.patch(`/admin/teams/${team._id}`, {
    crewName: team.crewName,
    leaderName: team.leaderName,
    points: team.points === "" ? 0 : Number(team.points)
  });

  await load();
setSaving(false);
setEditingTeam(null);
};

  const generateFixtures = async () => {
    try {
      const payload = {
        ...fixtureForm,
        teamCount: Number(fixtureForm.teamCount),
        startDate: fixtureForm.startDate || undefined
      };
      await api.post("/admin/fixtures/generate", payload);
      setMessage("Draft fixtures created. Review dates, times, and teams, then publish when ready.");
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || "Fixture generation failed.");
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-neonBlue">Hidden route</p>
          <h1 className="text-3xl font-black">Admin Control</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 hover:bg-white/10">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
          <button onClick={() => { localStorage.removeItem("nmrl_token"); setToken(""); }} className="rounded-lg border border-red-400/40 px-4 py-2 text-red-300">Logout</button>
        </div>
      </div>

      {message && <p className="mb-4 rounded-lg border border-neonBlue/30 bg-neonBlue/10 p-3 text-sm text-neonBlue">{message}</p>}

      <nav className="mb-5 rounded-lg border border-white/10 bg-white/[0.03] p-2 backdrop-blur-xl">
        <div className="flex flex-wrap gap-2 relative z-10 bg-black/40 p-2 rounded-lg mb-3">
          {adminSections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                activeSection === id
                  ? "border-neonPink/50 bg-neonPink text-black"
                  : "border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      <div className="grid gap-5">
        {activeSection === "overview" && <Overview dashboard={dashboard} />}
        {activeSection === "fixtures" && (
          <FixtureManager
            teams={dashboard.teams}
            matches={dashboard.matches}
            fixtureForm={fixtureForm}
            setFixtureForm={setFixtureForm}
            generateFixtures={generateFixtures}
            onDone={load}
            onMessage={setMessage}
          />
        )}

        {activeSection === "teams" && <Panel title="Team Approvals">
          <div className="table-scroll">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr><th className="py-3">Crew</th><th>Leader</th><th>Discord</th><th>Points</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {dashboard.teams.map((team) => (
                  <tr key={team._id} className="border-t border-white/10">
                    <td className="py-3 font-semibold">{team.crewName}</td>
                    <td>{team.leaderName}</td>
                    <td>{team.discord}</td>
                    <td className="text-neonBlue">{team.points}</td>
                    <td><Badge tone={team.status === "Approved" ? "green" : team.status === "Rejected" ? "red" : "yellow"}>{team.status}</Badge></td>
                    <td className="flex gap-2 py-2">

  {/* Approve */}
  <button
    title="Approve"
    onClick={() => approve(team._id, "Approved")}
    className="rounded-lg border border-emerald-400/40 p-2 text-emerald-300"
  >
    <Check className="h-4 w-4" />
  </button>

  {/* Reject */}
  <button
    title="Reject"
    onClick={() => approve(team._id, "Rejected")}
    className="rounded-lg border border-red-400/40 p-2 text-red-300"
  >
    <CircleSlash className="h-4 w-4" />
  </button>

  {/* Edit */}
  <button
    title="Edit"
    onClick={() => setEditingTeam(team)}
    className="rounded-lg border border-neonBlue/40 p-2 text-neonBlue"
  >
    ✏️
  </button>

  {/* Delete */}
  <button
    title="Delete"
    onClick={() => deleteTeam(team._id)}
    className="rounded-lg border border-red-500/40 p-2 text-red-500"
  >
    🗑
  </button>

</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>}

        {activeSection === "results" && (
          <ResultEntry
            matches={dashboard.matches}
            drivers={dashboard.drivers}
            onDone={load}
          />
        )}

        {activeSection === "penalties" && (
          <PenaltyEntry
            teams={dashboard.teams}
            drivers={dashboard.drivers}
            matches={dashboard.matches}
            onDone={load}
          />
        )}

        {activeSection === "povs" && (
          <PovEntry
            matches={dashboard.matches}
            drivers={dashboard.drivers}
            onDone={load}
          />
        )}

        {activeSection === "eligibility" && (
          <Eligibility drivers={dashboard.drivers} />
        )}

        {activeSection === "chat" && <AdminChat />}
      </div>

      {/* 🔥 EDIT TEAM MODAL (ADD HERE) */}
      {editingTeam && (
        <div
  className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
  onClick={() => setEditingTeam(null)}
>
  <div
    className="bg-black p-6 rounded-xl w-[400px] space-y-3 border border-white/10"
    onClick={(e) => e.stopPropagation()}
  >

            <h2 className="text-lg font-bold">Edit Team</h2>

            <input
              className="w-full p-2 bg-white/10 rounded"
              value={editingTeam.crewName}
              onChange={(e) =>
                setEditingTeam({ ...editingTeam, crewName: e.target.value })
              }
            />

            <input
              className="w-full p-2 bg-white/10 rounded"
              value={editingTeam.leaderName}
              onChange={(e) =>
                setEditingTeam({ ...editingTeam, leaderName: e.target.value })
              }
            />

            <input
              type="number"
              className="w-full p-2 bg-white/10 rounded"
              value={editingTeam.points}
              onChange={(e) =>
                setEditingTeam({ ...editingTeam, points: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingTeam(null)}
                className="px-3 py-2 border border-white/20 rounded"
              >
                Cancel
              </button>

              <button
  disabled={saving}
  onClick={() => updateTeam(editingTeam)}
  className="px-3 py-2 bg-neonBlue text-black rounded disabled:opacity-50"
>
  {saving ? "Saving..." : "Save"}
</button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

function Overview({ dashboard }) {
  const { teams, drivers, matches, penalties } = dashboard;
  const approvedTeams = teams.filter((team) => team.status === "Approved").length;
  const pendingTeams = teams.filter((team) => team.status === "Pending").length;
  const completedMatches = matches.filter((match) => match.status === "Completed").length;
  const pendingMatches = matches.filter((match) => match.status === "Pending").length;
  const restrictedDrivers = drivers.filter((driver) => driver.status === "Restricted").length;
  const upcomingMatches = [...matches]
    .filter((match) => match.status === "Pending")
    .sort((a, b) => a.day - b.day || a.slot - b.slot)
    .slice(0, 8);

  const raceTotals = matches.reduce((totals, match) => {
    const label = raceName(match.type);
    totals[label] = (totals[label] || 0) + 1;
    return totals;
  }, {});

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile label="Approved Teams" value={approvedTeams} />
        <SummaryTile label="Pending Teams" value={pendingTeams} />
        <SummaryTile label="Upcoming Races" value={pendingMatches} />
        <SummaryTile label="Completed Races" value={completedMatches} />
        <SummaryTile label="Drivers" value={drivers.length} />
        <SummaryTile label="Restricted Drivers" value={restrictedDrivers} />
        <SummaryTile label="Penalties" value={penalties.length} />
        <SummaryTile label="Total Fixtures" value={matches.length} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.35fr]">
        <Panel title="Event Summary" action={<LayoutDashboard className="h-5 w-5 text-neonBlue" />}>
          <div className="grid gap-3 mt-4 relative z-0">
            {Object.keys(raceTotals).length === 0 && <p className="text-sm text-slate-400">Create fixtures to see event totals.</p>}
            {Object.entries(raceTotals).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                <span className="font-semibold">{label}</span>
                <Badge tone="purple">{value}</Badge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Upcoming Races" action={<Clock className="h-5 w-5 text-neonPink" />}>
          <div className="grid gap-3 mt-4 relative z-0">
            {upcomingMatches.length === 0 && <p className="text-sm text-slate-400">No upcoming races yet.</p>}
            {upcomingMatches.map((match) => (
              <div key={match._id} className="grid gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 md:grid-cols-[90px_140px_120px_1fr] md:items-center">
                <Badge tone="yellow">Day {match.day}</Badge>
                <RaceTypeBadge type={match.type} />
                <span className="text-sm text-slate-400">{formatRaceDate(match.raceDate)}</span>
                <span className="truncate text-sm text-slate-300">{match.teams?.map((team) => team.crewName).join(" vs ") || "Teams pending"}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function SummaryTile({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function FixtureManager({ teams, matches, fixtureForm, setFixtureForm, generateFixtures, onDone, onMessage }) {
  const approvedTeams = teams.filter((team) => team.status === "Approved");
  const [dayFilter, setDayFilter] = useState("all");
  const filteredMatches = dayFilter === "all" ? matches : matches.filter((match) => String(match.day) === dayFilter);
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    const dateA = a.raceDate || "";
    const dateB = b.raceDate || "";
    return dateA.localeCompare(dateB) || (a.raceTime || "").localeCompare(b.raceTime || "") || a.day - b.day || a.slot - b.slot;
  });
  const draftCount = matches.filter((match) => !match.isPublished).length;
  const publishedCount = matches.filter((match) => match.isPublished).length;
  const [addForm, setAddForm] = useState({
    day: 1,
    slot: 1,
    raceDate: "",
    raceTime: "",
    trackName: "",
    carName: "",
    type: "Team",
    teamMode: "all",
    teamA: "",
    teamB: "",
    notes: "",
    isPublished: false
  });

  const publishAll = async () => {
    await api.post("/admin/fixtures/publish");
    onMessage("All pending fixtures are now visible on the main website.");
    await onDone();
  };

  const unpublishAll = async () => {
    await api.post("/admin/fixtures/unpublish");
    onMessage("All pending fixtures are hidden from the main website.");
    await onDone();
  };

  const addRace = async (event) => {
    event.preventDefault();
    const teamIds = addForm.teamMode === "all" ? approvedTeams.map((team) => team._id) : [addForm.teamA, addForm.teamB].filter(Boolean);
    await api.post("/admin/matches", {
      ...addForm,
      day: Number(addForm.day),
      slot: Number(addForm.slot),
      teamIds
    });
    setAddForm({ ...addForm, teamA: "", teamB: "", notes: "", isPublished: false });
    onMessage("Race added to draft fixtures.");
    await onDone();
  };

  return (
    <div className="grid gap-5">
      <Panel title="Fixture Creator" action={<CalendarDays className="h-5 w-5 text-neonBlue" />}>
        <div className="grid gap-3 lg:grid-cols-[150px_190px_1fr_auto] lg:items-end">
          <label className="grid gap-1 text-sm text-slate-300">
            Total teams
            <input
              type="number"
              min="2"
              value={fixtureForm.teamCount}
              onChange={(event) => setFixtureForm({ ...fixtureForm, teamCount: event.target.value })}
              className="px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm text-slate-300">
            Day 1 date
            <input
              type="date"
              value={fixtureForm.startDate}
              onChange={(event) => setFixtureForm({ ...fixtureForm, startDate: event.target.value })}
              className="px-3 py-2"
            />
          </label>
          <label className="flex min-h-10 items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={fixtureForm.shuffle}
              onChange={(event) => setFixtureForm({ ...fixtureForm, shuffle: event.target.checked })}
            />
            <Shuffle className="h-4 w-4 text-neonPink" />
            Shuffle teams before scheduling
          </label>
          <button onClick={generateFixtures} className="inline-flex items-center justify-center gap-2 rounded-lg bg-neonPink px-4 py-2 font-bold text-black">
            <Trophy className="h-4 w-4" /> Create Draft
          </button>
        </div>
      </Panel>

      <Panel title="Publish Control" action={<Eye className="h-5 w-5 text-neonBlue" />}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 relative z-10 bg-black/40 p-2 rounded-lg mb-3">
            <Badge tone="yellow">{draftCount} draft</Badge>
            <Badge tone="green">{publishedCount} published</Badge>
          </div>
          <div className="flex flex-wrap gap-2 relative z-10 bg-black/40 p-2 rounded-lg mb-3">
            <button onClick={unpublishAll} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-slate-200 hover:bg-white/10">
              <EyeOff className="h-4 w-4" /> Hide All
            </button>
            <button onClick={publishAll} className="inline-flex items-center gap-2 rounded-lg bg-neonBlue px-4 py-2 font-bold text-black">
              <Eye className="h-4 w-4" /> Confirm & Publish
            </button>
          </div>
        </div>
      </Panel>

      <Panel title="Add Race" action={<Plus className="h-5 w-5 text-neonPink" />}>
        <form onSubmit={addRace} className="grid gap-3 md:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] md:items-end">
          <FixtureInputs form={addForm} setForm={setAddForm} teams={approvedTeams} includeNotes />
          <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-neonPink px-4 py-2 font-bold text-black">
            <Plus className="h-4 w-4" /> Add
          </button>
        </form>
      </Panel>

      <Panel title="Date Wise Fixture Schedule" action={<Save className="h-5 w-5 text-neonBlue" />}>
  <div className="grid gap-4 mt-6 relative z-0">
          <div className="flex flex-wrap gap-2 relative z-10 bg-black/40 p-2 rounded-lg mb-3">
            {dayFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setDayFilter(filter.id)}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  dayFilter === filter.id
                    ? "border-neonPink/50 bg-neonPink text-black"
                    : "border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          {sortedMatches.length === 0 && <p className="text-sm text-slate-400">Create draft fixtures to schedule them here.</p>}
          {sortedMatches.map((match) => (
            <FixtureEditRow key={match._id} match={match} teams={approvedTeams} onDone={onDone} onMessage={onMessage} />
          ))}
        </div>
      </Panel>
    </div>
  );
}

function FixtureInputs({ form, setForm, teams, includeNotes = false }) {
  const useTwoTeams = form.teamMode === "two" || ["Solo", "Rivalry"].includes(form.type);
  const update = (key, value) => setForm({ ...form, [key]: value });

  return (
    <>
      <label className="grid min-w-0 gap-1 text-sm text-slate-300">
        Day
        <select value={form.day} onChange={(event) => update("day", event.target.value)} className="w-full px-3 py-2">
          {Array.from({ length: 30 }, (_, index) => index + 1).map((day) => <option key={day} value={day}>Day {day}</option>)}
        </select>
      </label>
      <label className="grid min-w-0 gap-1 text-sm text-slate-300">
        Slot
        <input type="number" min="1" value={form.slot} onChange={(event) => update("slot", event.target.value)} className="w-full px-3 py-2" />
      </label>
      <label className="grid min-w-0 gap-1 text-sm text-slate-300">
        Date
        <input type="date" value={form.raceDate} onChange={(event) => update("raceDate", event.target.value)} className="w-full px-3 py-2" />
      </label>
      <label className="grid min-w-0 gap-1 text-sm text-slate-300">
        Time
        <input type="time" value={form.raceTime} onChange={(event) => update("raceTime", event.target.value)} className="w-full px-3 py-2" />
      </label>
      <label className="grid min-w-0 gap-1 text-sm text-slate-300">
        Track
        <input value={form.trackName || ""} onChange={(event) => update("trackName", event.target.value)} placeholder="Track name" className="w-full px-3 py-2" />
      </label>
      <label className="grid min-w-0 gap-1 text-sm text-slate-300">
        Car
        <input value={form.carName || ""} onChange={(event) => update("carName", event.target.value)} placeholder="Car name" className="w-full px-3 py-2" />
      </label>
      <label className="grid min-w-0 gap-1 text-sm text-slate-300">
        Race
        <select
          value={form.type}
          onChange={(event) => {
            const type = event.target.value;
            setForm({ ...form, type, teamMode: ["Solo", "Rivalry"].includes(type) ? "two" : form.teamMode });
          }}
          className="w-full px-3 py-2"
        >
          {Object.entries(raceNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="grid min-w-0 gap-1 text-sm text-slate-300">
        Teams
        <select
          value={["Solo", "Rivalry"].includes(form.type) ? "two" : form.teamMode}
          onChange={(event) => update("teamMode", event.target.value)}
          disabled={["Solo", "Rivalry"].includes(form.type)}
          className="w-full px-3 py-2 disabled:opacity-60"
        >
          <option value="all">All approved teams</option>
          <option value="two">Select 2 teams</option>
        </select>
      </label>
      {useTwoTeams && (
        <div className="grid min-w-0 gap-2 md:col-span-2 md:grid-cols-2">
          <select value={form.teamA} onChange={(event) => update("teamA", event.target.value)} className="w-full px-3 py-2">
            <option value="">Team A</option>
            {teams.map((team) => <option key={team._id} value={team._id}>{team.crewName}</option>)}
          </select>
          <select value={form.teamB} onChange={(event) => update("teamB", event.target.value)} className="w-full px-3 py-2">
            <option value="">Team B</option>
            {teams.filter((team) => team._id !== form.teamA).map((team) => <option key={team._id} value={team._id}>{team.crewName}</option>)}
          </select>
        </div>
      )}
      {includeNotes && (
        <input value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Notes optional" className="w-full px-3 py-2 md:col-span-2" />
      )}
    </>
  );
}

function FixtureEditRow({ match, teams, onDone, onMessage }) {
  const initialTeamIds = teamIdsFromMatch(match);
  const [form, setForm] = useState({
    day: match.day || 1,
    slot: match.slot || 1,
    raceDate: dateInputValue(match.raceDate),
    raceTime: match.raceTime || "",
    trackName: match.trackName || "",
    carName: match.carName || "",
    type: match.type,
    teamMode: initialTeamIds.length === teams.length && !["Solo", "Rivalry"].includes(match.type) ? "all" : "two",
    teamA: initialTeamIds[0] || "",
    teamB: initialTeamIds[1] || "",
    notes: match.notes || "",
    isPublished: Boolean(match.isPublished)
  });

const save = async () => {
  const teamIds =
    form.teamMode === "all" && !["Solo", "Rivalry"].includes(form.type)
      ? teams.map((team) => team._id)
      : [form.teamA, form.teamB].filter(Boolean);

  const res = await api.patch(`/admin/matches/${match._id}`, {
    ...form,
    day: Number(form.day),
    slot: Number(form.slot),
    teamIds
  });

  // ✅ THIS LINE IS THE ACTUAL FIX
  setForm((prev) => ({
    ...prev,
    isPublished: res.data.isPublished
  }));

  onMessage(
    res.data.isPublished
      ? "Fixture saved & visible on website."
      : "Fixture saved & hidden from website."
  );

  await onDone();
};

  return (
    <div className="relative z-0 rounded-lg border border-white/10 bg-white/[0.03] p-3 mb-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={form.isPublished ? "green" : "yellow"}>{form.isPublished ? "Published" : "Draft"}</Badge>
          <RaceTypeBadge type={form.type} />
          <span className="text-sm text-slate-400">{match.teams?.map((team) => team.crewName).join(" vs ")}</span>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={form.isPublished} onChange={(event) => setForm({ ...form, isPublished: event.target.checked })} />
          Show on main website (Save to apply)
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] md:items-end">
        <FixtureInputs form={form} setForm={setForm} teams={teams} includeNotes />
        <button onClick={save} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-neonBlue px-4 py-2 font-bold text-black">
          <Save className="h-4 w-4" /> Save
        </button>
      </div>
    </div>
  );
}

function AdminChat() {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const loadMessages = async () => {
    const res = await api.get("/admin/chat");
    setMessages(res.data);
  };

  useEffect(() => {
    loadMessages().catch(() => {});
    const timer = window.setInterval(() => loadMessages().catch(() => {}), 5000);
    return () => window.clearInterval(timer);
  }, []);

  const sendMessage = async (event) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message) return;

    setSending(true);
    try {
      const res = await api.post("/admin/chat", { message });
      setMessages((current) => [...current, res.data]);
      setDraft("");
    } finally {
      setSending(false);
    }
  };

  return (
    <Panel title="Admin Chat" action={<MessageSquare className="h-5 w-5 text-neonBlue" />}>
      <div className="grid gap-4">
        <div className="grid max-h-[420px] gap-3 overflow-y-auto rounded-lg border border-white/10 bg-black/20 p-3">
          {messages.length === 0 && <p className="text-sm text-slate-400">No admin messages yet.</p>}
          {messages.map((item) => (
            <div key={item._id} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-neonBlue">{item.author}</span>
                <span className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-200">{item.message}</p>
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="grid gap-2 md:grid-cols-[1fr_auto]">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={1000}
            placeholder="Message other admins"
            className="px-3 py-2"
          />
          <button disabled={sending || !draft.trim()} className="rounded-lg bg-neonBlue px-4 py-2 font-bold text-black disabled:opacity-40">
            Send
          </button>
        </form>
      </div>
    </Panel>
  );
}

function ResultEntry({ matches, drivers, onDone }) {
  const [matchId, setMatchId] = useState("");
  const [rows, setRows] = useState([
    { teamId: "", driverId: "", disqualified: false }
  ]);
  const [message, setMessage] = useState("");

  const selectedMatch = useMemo(
    () => matches.find((m) => m._id === matchId),
    [matches, matchId]
  );

  useEffect(() => {
    if (!selectedMatch) return;

    const initial = selectedMatch.participants.flatMap(
      (participant, teamIndex) => {
        const ids =
          participant.driverIds?.length > 0
            ? participant.driverIds
            : [null];

        return ids.map((driver) => ({
          teamId:
            participant.teamId ||
            selectedMatch.teams?.[teamIndex]?._id ||
            "",
          driverId: driver?._id || "",
          disqualified: false
        }));
      }
    );

    setRows(
      initial.length
        ? initial
        : [{ teamId: "", driverId: "", disqualified: false }]
    );
  }, [selectedMatch]);

  const submit = async () => {
    try {
      const finalRows = rows.map((r, i) => ({
        ...r,
        position: i + 1
      }));

      await api.post(`/admin/matches/${matchId}/results`, {
        results: finalRows
      });

      setMessage("✅ Results submitted successfully");

      setTimeout(() => setMessage(""), 3000);

      await onDone();
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to submit results");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <>
      {/* 🔔 NOTIFICATION */}
      {message && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-lg bg-black border border-white/20 text-white shadow-lg">
          {message}
        </div>
      )}

      <Panel title="Result Entry">
        <div className="grid gap-4 mt-4">

          {/* MATCH SELECT */}
          <select
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            className="px-3 py-2"
          >
            <option value="">Select match</option>
            {matches
              .filter((m) => m.status === "Pending")
              .map((m) => (
                <option key={m._id} value={m._id}>
                  Day {m.day} - {raceName(m.type)} -{" "}
                  {m.teams?.map((t) => t.crewName).join(" vs ")}
                </option>
              ))}
          </select>

          {/* INFO */}
          {matchId && (
            <p className="text-xs text-slate-400">
              Enter results in finishing order (Top = Winner)
            </p>
          )}

          {/* ROWS */}
          <div className="space-y-2">
            {rows.map((row, index) => (
              <div
                key={index}
                className="flex items-center gap-3 border border-white/10 rounded-lg p-3 bg-white/[0.02]"
              >
                {/* POSITION */}
                <div className="w-10 text-center font-bold text-neonPink">
                  #{index + 1}
                </div>

                {/* TEAM */}
                <select
                  value={row.teamId}
                  onChange={(e) =>
                    setRows(updateRows(rows, index, "teamId", e.target.value))
                  }
                  className="flex-1 px-3 py-2"
                >
                  <option value="">Select Team</option>
                  {selectedMatch?.teams?.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.crewName}
                    </option>
                  ))}
                </select>

                {/* DRIVER */}
                <select
                  value={row.driverId}
                  onChange={(e) =>
                    setRows(updateRows(rows, index, "driverId", e.target.value))
                  }
                  className="flex-1 px-3 py-2"
                >
                  <option value="">Driver (optional)</option>
                  {drivers
                    .filter(
                      (d) =>
                        !row.teamId ||
                        d.teamId?._id === row.teamId
                    )
                    .map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.alias}
                      </option>
                    ))}
                </select>

                {/* DQ */}
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={row.disqualified}
                    onChange={(e) =>
                      setRows(
                        updateRows(
                          rows,
                          index,
                          "disqualified",
                          e.target.checked
                        )
                      )
                    }
                  />
                  DQ
                </label>
              </div>
            ))}
          </div>

          {/* BUTTONS */}
          <div className="flex gap-2">
            <button
              onClick={() =>
                setRows([
                  ...rows,
                  { teamId: "", driverId: "", disqualified: false }
                ])
              }
              className="rounded-lg border border-white/10 px-4 py-2"
            >
              Add Row
            </button>

            <button
              disabled={!matchId}
              onClick={submit}
              className="rounded-lg bg-neonBlue px-4 py-2 font-bold text-black disabled:opacity-40"
            >
              Submit Results
            </button>
          </div>
        </div>
      </Panel>
    </>
  );
}

function PenaltyEntry({ teams, drivers, matches, onDone }) {
  const [form, setForm] = useState({ teamId: "", driverId: "", matchId: "", type: "Dirty Driving", pointsDelta: -5, restrictionDays: 0, reason: "" });
  const submit = async () => {
    await api.post("/admin/penalties", form);
    await onDone();
  };
  return (
    <Panel title="Penalty System" action={<Shield className="h-5 w-5 text-red-300" />}>
      <div className="grid gap-2 md:grid-cols-4">
        <select value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value })} className="px-3 py-2"><option value="">Team</option>{teams.map((team) => <option key={team._id} value={team._id}>{team.crewName}</option>)}</select>
        <select value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })} className="px-3 py-2"><option value="">Driver optional</option>{drivers.map((driver) => <option key={driver._id} value={driver._id}>{driver.alias}</option>)}</select>
        <select value={form.matchId} onChange={(e) => setForm({ ...form, matchId: e.target.value })} className="px-3 py-2"><option value="">Match optional</option>{matches.map((match) => <option key={match._id} value={match._id}>Day {match.day} {raceName(match.type)}</option>)}</select>
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="px-3 py-2">
          {["Warning", "Dirty Driving", "Disqualification", "Team Deduction", "Player Restriction", "Refusal", "Wrong Participation"].map((type) => <option key={type}>{type}</option>)}
        </select>
        <input type="number" value={form.pointsDelta} onChange={(e) => setForm({ ...form, pointsDelta: Number(e.target.value) })} className="px-3 py-2" placeholder="Points delta" />
        <input type="number" value={form.restrictionDays} onChange={(e) => setForm({ ...form, restrictionDays: Number(e.target.value) })} className="px-3 py-2" placeholder="Restriction days" />
        <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="px-3 py-2 md:col-span-2" placeholder="Reason" />
      </div>
      <button onClick={submit} className="mt-3 rounded-lg bg-red-400 px-4 py-2 font-bold text-black">Apply Penalty</button>
    </Panel>
  );
}

function PovEntry({ onDone }) {
  const [data, setData] = useState([]);
  const [day, setDay] = useState("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (day !== "all") query.append("day", day);
      if (status !== "all") query.append("status", status);

      const res = await api.get(`/admin/povs?${query.toString()}`);
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [day, status]);

  const update = async (matchId, povId, payload) => {
    await api.patch(`/admin/povs/${matchId}/${povId}`, payload);
    await load();
    onDone();
  };

  return (
    <Panel title="POV Review System">

      {/* 🔥 FILTERS */}
      <div className="flex gap-2 mb-4 flex-wrap">

        {/* DAY FILTER */}
        <select
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="px-3 py-2"
        >
          <option value="all">All Days</option>
          {[1,2,3,4,5,6,7].map(d => (
            <option key={d} value={d}>Day {d}</option>
          ))}
        </select>

        {/* STATUS FILTER */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2"
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

        <button
          onClick={load}
          className="px-4 py-2 border border-white/20 rounded"
        >
          Refresh
        </button>
      </div>

      {/* 🧠 DATA */}
      <div className="space-y-6">

        {loading && <p className="text-slate-400">Loading POVs...</p>}

        {!loading && data.length === 0 && (
          <p className="text-slate-400">No POVs found</p>
        )}

        {data.map(match => (
          <div key={match.matchId} className="space-y-3">

            {/* MATCH HEADER */}
            <div className="text-sm text-slate-400">
              Day {match.day} • {match.type}
            </div>

            {/* POV CARDS */}
            {match.povs.map(pov => (
              <div
                key={pov._id}
                className="border border-white/10 rounded-lg p-4 flex justify-between items-center"
              >

                {/* LEFT */}
                <div>
                  <p className="font-bold">{pov.driverName}</p>
                  <p className="text-xs text-slate-400">{pov.teamName}</p>

                  <a
                    href={pov.url}
                    target="_blank"
                    className="text-neonBlue text-xs"
                  >
                    View POV
                  </a>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-2">

                  <Badge tone={
                    pov.status === "Approved"
                      ? "green"
                      : pov.status === "Rejected"
                      ? "red"
                      : "yellow"
                  }>
                    {pov.status}
                  </Badge>

                  {/* APPROVE */}
                  <button
                    onClick={() =>
                      update(match.matchId, pov._id, { status: "Approved" })
                    }
                    className="px-3 py-1 bg-emerald-400 text-black rounded"
                  >
                    ✓
                  </button>

                  {/* REJECT */}
                  <button
                    onClick={() =>
                      update(match.matchId, pov._id, { status: "Rejected" })
                    }
                    className="px-3 py-1 bg-red-400 text-black rounded"
                  >
                    ✕
                  </button>

                  {/* PENALTY */}
                  <button
                    onClick={() =>
                      update(match.matchId, pov._id, { penalty: true })
                    }
                    className="px-3 py-1 bg-yellow-400 text-black rounded"
                  >
                    ⚠
                  </button>

                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Eligibility({ drivers }) {
  return (
    <Panel title="Driver Eligibility">
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {drivers.map((driver) => (
          <div key={driver._id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div>
              <p className="font-semibold">{driver.alias}</p>
              <p className="text-xs text-slate-400">{driver.teamId?.crewName} / {driver.role}</p>
            </div>
            <Badge tone={driver.status === "Restricted" ? "red" : driver.status === "Assigned" ? "yellow" : "green"}>{driver.status}</Badge>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function updateRows(rows, index, key, value) {
  return rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row));
}


