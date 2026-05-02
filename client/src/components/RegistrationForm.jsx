import { useState } from "react";
import { Plus, Send } from "lucide-react";
import { api } from "../api.js";
import Panel from "./Panel.jsx";

const blankDrivers = Array.from({ length: 5 }, (_, index) => ({
  alias: "",
  icName: "",
  phone: "",
  discord: "",
  role: index === 4 ? "Reserve" : "Main"
}));

export default function RegistrationForm() {
  const [team, setTeam] = useState({ crewName: "", leaderName: "", discord: "" });
  const [drivers, setDrivers] = useState(blankDrivers);
  const [message, setMessage] = useState("");

  const updateDriver = (index, key, value) => {
    setDrivers((current) => current.map((driver, driverIndex) => (driverIndex === index ? { ...driver, [key]: value } : driver)));
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await api.post("/teams/register", { ...team, drivers });
      setTeam({ crewName: "", leaderName: "", discord: "" });
      setDrivers(blankDrivers);
      setMessage("Registration submitted for admin approval.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <Panel title="Team Registration" action={<Plus className="h-5 w-5 text-neonPink" />}>
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["crewName", "Crew Name"],
            ["leaderName", "Crew Leader Name"],
            ["discord", "Discord ID"]
          ].map(([key, label]) => (
            <label key={key} className="text-sm text-slate-300">
              {label}
              <input required value={team[key]} onChange={(event) => setTeam({ ...team, [key]: event.target.value })} className="mt-2 w-full px-3 py-2" />
            </label>
          ))}
        </div>

        <div className="grid gap-3">
          {drivers.map((driver, index) => (
            <div key={index} className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 md:grid-cols-5">
              <input required placeholder="Driver Alias" value={driver.alias} onChange={(event) => updateDriver(index, "alias", event.target.value)} className="px-3 py-2" />
              <input required placeholder="IC Name" value={driver.icName} onChange={(event) => updateDriver(index, "icName", event.target.value)} className="px-3 py-2" />
              <input required placeholder="IC Phone" value={driver.phone} onChange={(event) => updateDriver(index, "phone", event.target.value)} className="px-3 py-2" />
              <input required placeholder="Discord ID" value={driver.discord} onChange={(event) => updateDriver(index, "discord", event.target.value)} className="px-3 py-2" />
              <select value={driver.role} onChange={(event) => updateDriver(index, "role", event.target.value)} className="px-3 py-2">
                <option>Main</option>
                <option>Reserve</option>
              </select>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-400">Validation: exactly 5 drivers, 4 Main and 1 Reserve, no duplicate aliases.</p>
          <button className="inline-flex items-center gap-2 rounded-lg bg-neonPink px-4 py-2 font-bold text-black shadow-glow">
            <Send className="h-4 w-4" />
            Submit Crew
          </button>
        </div>
        {message && <p className="text-sm text-neonBlue">{message}</p>}
      </form>
    </Panel>
  );
}
