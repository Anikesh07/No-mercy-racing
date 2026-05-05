import {
  ShieldCheck,
  Trophy,
  Users,
  Flag,
  AlertTriangle,
  Ban,
  Repeat,
  Video,
  Crown
} from "lucide-react";
import Panel from "../components/Panel.jsx";

const sections = [
  {
    title: "Event Structure",
    icon: <Flag className="text-neonPink" />,
    items: [
      "Event runs for 7 consecutive days",
      "Minimum 5 teams required",
      "Each team must have 4 Main, 1 Reserve, and 1 female racer",
      "Management approval required before participation",
      "Participation = acceptance of all rules"
    ]
  },

  {
    title: "Entry Rules",
    icon: <Trophy className="text-yellow-400" />,
    items: [
      "Entry Fee: $25,000",
      "No refunds allowed after registration",
      "Teams must confirm participation before start"
    ]
  },

  {
    title: "Daily Match Format",
    icon: <Users className="text-neonBlue" />,
    items: [
      "Grand Prix (All 4 main drivers)",
      "Duo Clash (2 Drivers each team)",
      "Solo Showdown (1 Driver each team)",
      "All formats contribute to total points"
    ]
  },

  // 🔥 YOUR NEW STRATEGY RULE (IMPORTANT)
  {
    title: "Race Participation Strategy",
    icon: <Users className="text-yellow-400" />,
    highlight: true,
    items: [
      "Top Grand Prix racers are not allowed to participate in Duo or Solo races",
      "Drivers participating in Duo Clash cannot participate in Solo Showdown",
      "Each driver can participate in only 1 or 2 races per day",
      "At least one driver must play only one race",
      "Remaining drivers must cover two races",
      "Teams must plan strategy carefully for maximum performance"
    ]
  },
  // 🔥 MOST IMPORTANT FIRST
  {
    title: "Dirty Driving (STRICT)",
    icon: <Ban className="text-red-500" />,
    highlight: true,
    items: [
      "No ramming, PIT, blocking, brake-checking",
      "Minor violation → Warning",
      "Moderate violation → Position penalty",
      "Major violation → Disqualification",
      "Severe violation → Disqualification + disciplinary action",
      "Repeated violations → Ban or removal"
    ]
  },

  {
    title: "Grid & Start Rules",
    icon: <Flag className="text-cyan-400" />,
    items: [
      "2-line grid system",
      "Day 1: random grid",
      "Day 2+: reverse ranking order",
      "No jump start allowed",
      "Lane discipline must be maintained"
    ]
  },

  {
    title: "Disconnect Rule",
    icon: <Repeat className="text-purple-400" />,
    items: [
      "Disconnect = last position",
      "No rejoin advantage allowed",
      "Repeated disconnects may lead to penalties"
    ]
  },

  {
    title: "Refusal to Play",
    icon: <Ban className="text-red-400" />,
    highlight: true,
    items: [
      "Skipping races is strictly not allowed",
      "Penalty: $300,000 – $500,000",
      "Additional disciplinary action may apply"
    ]
  },

  {
    title: "Wrong Participation",
    icon: <AlertTriangle className="text-yellow-400" />,
    items: [
      "Invalid player participation = result not counted",
      "Repeated violations lead to penalties"
    ]
  },

  {
    title: "Player Swap Rule",
    icon: <Repeat className="text-blue-400" />,
    items: [
      "Maximum 2 swaps per team",
      "Must be declared before race",
      "No mid-race swaps allowed"
    ]
  },

  {
    title: "POV Submission",
    icon: <Video className="text-neonBlue" />,
    items: [
      "Top players must submit POV within 24 hours",
      "Failure to submit may result in admin action"
    ]
  },

  {
    title: "Tie-Breaker",
    icon: <Trophy className="text-yellow-300" />,
    items: [
      "Each team selects best driver",
      "1v1 race on hardest track",
      "Winner determines final ranking"
    ]
  },

  {
    title: "Admin Authority",
    icon: <Crown className="text-purple-400" />,
    items: [
      "Admin enforces all rules",
      "Handles disputes and decisions",
      "All admin decisions are final"
    ]
  },

  {
    title: "Final Statement",
    icon: <ShieldCheck className="text-green-300" />,
    items: [
      "Play fair",
      "Follow all rules",
      "Respect decisions",
      "League rewards discipline and teamwork"
    ]
  }
];

export default function Rules() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-8">

      {/* HEADER */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-neonBlue">
          Regulations
        </p>
        <h2 className="mt-2 text-4xl font-black">Rules</h2>
        <p className="text-slate-400 mt-2">
          Read carefully. Ignorance won’t save you mid-race.
        </p>
      </div>

      {/* RULES GRID */}
      <Panel title="Official League Rules">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <div
              key={section.title}
              className={`rounded-xl border p-5 transition ${
                section.highlight
                  ? "border-yellow-400/60 bg-yellow-500/10 shadow-lg shadow-yellow-500/10"
                  : "border-white/10 bg-white/[0.03]"
              } hover:scale-[1.02] hover:border-neonPink/40`}
            >
              <div className="mb-3 flex items-center gap-2 font-bold">
                {section.icon}
                <h3>{section.title}</h3>
              </div>

              <ul className="space-y-2 text-sm text-slate-300">
                {section.items.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-neonPink">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Panel>

    </div>
  );
}