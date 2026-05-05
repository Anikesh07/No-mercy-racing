import { useEffect, useState } from "react";
import { api } from "../api";
import { Flag, Users, User, Link2, Trophy, CalendarDays } from "lucide-react";

export default function PovSubmit() {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 NEW POPUP STATE
  const [popup, setPopup] = useState(null);

  const [form, setForm] = useState({
    matchId: "",
    teamId: "",
    driverName: "",
    raceType: "Team",
    raceDate: "",
    url: ""
  });

  useEffect(() => {
    api.get("/fixtures").then(res => setMatches(res.data)).catch(() => {});
    api.get("/teams").then(res => setTeams(res.data)).catch(() => {});
  }, []);

  const submit = async () => {
    try {
      if (
        !form.matchId ||
        !form.teamId ||
        !form.driverName ||
        !form.url ||
        !form.raceDate
      ) {
        setPopup({ type: "error", message: "Fill all fields" });
        return;
      }

      setLoading(true);

      await api.post("/pov/submit", form);

      // ✅ SUCCESS POPUP
      setPopup({ type: "success", message: "POV submitted successfully" });

      // auto close after 2 sec
      setTimeout(() => setPopup(null), 2000);

      setForm({
        matchId: "",
        teamId: "",
        driverName: "",
        raceType: "Team",
        raceDate: "",
        url: ""
      });

    } catch (err) {
      setPopup({
        type: "error",
        message: err?.response?.data?.message || "Submission failed"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">

      {/* 🔥 POPUP */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rounded-xl border border-white/10 bg-[#0b0b12] p-6 w-[90%] max-w-sm text-center shadow-xl">

            <p
              className={`text-lg font-semibold ${
                popup.type === "success"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {popup.message}
            </p>

            <button
              onClick={() => setPopup(null)}
              className="mt-4 w-full rounded-lg bg-neonPink py-2 font-bold text-black"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-black tracking-tight">
          Submit POV
        </h2>
        <p className="mt-2 text-slate-400">
          Upload your race footage for review & validation
        </p>
      </div>

      {/* FORM */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 space-y-5 shadow-xl">

        {/* MATCH */}
        <Field icon={Flag} label="Select Match">
          <select
            value={form.matchId}
            onChange={(e) => {
              const selected = matches.find(m => m._id === e.target.value);

              setForm({
                ...form,
                matchId: e.target.value,
                raceDate: selected?.raceDate
                  ? new Date(selected.raceDate).toISOString().split("T")[0]
                  : ""
              });
            }}
            className="input"
          >
            <option value="">Choose match</option>
            {matches.map(m => (
              <option key={m._id} value={m._id}>
                Day {m.day} • {m.type}
              </option>
            ))}
          </select>
        </Field>

        {/* TEAM */}
        <Field icon={Users} label="Select Team">
          <select
            value={form.teamId}
            onChange={(e) => setForm({ ...form, teamId: e.target.value })}
            className="input"
          >
            <option value="">Choose team</option>
            {teams.map(t => (
              <option key={t._id} value={t._id}>
                {t.crewName}
              </option>
            ))}
          </select>
        </Field>

        {/* DRIVER */}
        <Field icon={User} label="Driver Name">
          <input
            value={form.driverName}
            onChange={(e) => setForm({ ...form, driverName: e.target.value })}
            placeholder="Enter driver name"
            className="input"
          />
        </Field>

        {/* RACE TYPE */}
        <Field icon={Trophy} label="Race Type">
          <select
            value={form.raceType}
            onChange={(e) => setForm({ ...form, raceType: e.target.value })}
            className="input"
          >
            <option value="Team">Grand Prix</option>
            <option value="Duo">Duo Clash</option>
            <option value="Solo">Solo Showdown</option>
          </select>
        </Field>

        {/* DATE */}
        <Field icon={CalendarDays} label="Race Date">
          <input
            type="date"
            value={form.raceDate}
            onChange={(e) => setForm({ ...form, raceDate: e.target.value })}
            className="input"
          />
        </Field>

        {/* URL */}
        <Field icon={Link2} label="POV Link">
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://..."
            className="input"
          />
        </Field>

        {/* BUTTON */}
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-neonPink to-purple-500 py-3 font-bold text-black shadow-glow hover:scale-[1.02] transition disabled:opacity-50"
        >
          {loading ? "Submitting..." : "🚀 Submit POV"}
        </button>
      </div>
    </div>
  );
}

/* FIELD COMPONENT */
function Field({ icon: Icon, label, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Icon className="h-4 w-4 text-neonPink" />
        {label}
      </div>
      {children}
    </div>
  );
}