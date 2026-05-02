import { ShieldCheck } from "lucide-react";
import Panel from "../components/Panel.jsx";

const rules = [
  "The event runs for 7 consecutive days.",
  "Minimum 5 teams are recommended to start the league.",
  "Each team must register 4 Main racers and 1 Reserve racer.",
  "Every approved team participates in Team Grand Prix, Duo Clash, and Solo Showdown.",
  "Duo racers cannot play Solo Showdown on the same day.",
  "Top performers in Team Grand Prix are restricted from Duo and Solo.",
  "Rivalry Clash can only be between adjacent ranked teams.",
  "Dirty driving, refusal, disqualification, and wrong participation can trigger penalties.",
  "Top players must submit POV within the admin-defined deadline.",
  "Admin decisions are final for disputes and disciplinary action."
];

export default function Rules() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-neonBlue">Regulations</p>
        <h2 className="mt-2 text-3xl font-black">Rules</h2>
      </div>
      <Panel title="Official League Rules" action={<ShieldCheck className="h-5 w-5 text-neonBlue" />}>
        <div className="grid gap-3 md:grid-cols-2">
          {rules.map((rule) => (
            <div key={rule} className="rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-slate-300">{rule}</div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
