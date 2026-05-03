import {
  ShieldCheck,
  Trophy,
  Users,
  Flag,
  AlertTriangle,
  Swords,
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
      "Admin approval required before participation",
      "Participation = acceptance of rules"
    ]
  },
  {
    title: "Entry & Match Rules",
    icon: <Trophy className="text-yellow-400" />,
    items: [
      "Entry Fee: $25,000",
      "Rivalry Clash: $10,000 per team",
      "Winner takes full amount",
      "No refunds allowed"
    ]
  },
  {
    title: "Daily Match Format",
    icon: <Users className="text-neonBlue" />,
    items: [
      "Grand Prix (Team race)",
      "Duo Clash (2 players)",
      "Solo Showdown (mandatory)",
      "Optional Rivalry Clash"
    ]
  },
  {
    title: "Participation Rules",
    icon: <ShieldCheck className="text-green-400" />,
    items: [
      "All teams must play daily",
      "Top GP players cannot play Duo/Solo",
      "Top Duo players cannot play Solo",
      "Duo players cannot play Solo",
      "Proper player rotation required"
    ]
  },
  {
    title: "Dominance Rule",
    icon: <AlertTriangle className="text-orange-400" />,
    items: [
      "If all 4 racers finish Top 5:",
      "Reserve must play Duo & Solo",
      "Bottom 2 must play Duo & Solo",
      "Top racers restricted"
    ]
  },
  {
    title: "Rivalry Clash",
    icon: <Swords className="text-red-400" />,
    items: [
      "Only adjacent teams can be challenged",
      "Each team has 1 defensive pass",
      "After pass → refusal = penalty",
      "Accepted matches cannot be cancelled"
    ]
  },
  {
    title: "Grid & Start Rules",
    icon: <Flag className="text-cyan-400" />,
    items: [
      "2-line grid system",
      "Day 1: random grid",
      "Day 2+: reverse ranking",
      "No jump start allowed",
      "Maintain lane discipline"
    ]
  },
  {
    title: "Dirty Driving (STRICT)",
    icon: <Ban className="text-red-500" />,
    highlight: true,
    items: [
      "No ramming, PIT, blocking, brake-checking",
      "Minor → Warning",
      "Moderate → Position penalty",
      "Major → Disqualification",
      "Severe → Disqualification + action",
      "Repeat → Ban or removal"
    ]
  },
  {
    title: "Disconnect Rule",
    icon: <Repeat className="text-purple-400" />,
    items: [
      "Disconnect = last position",
      "No rejoin advantage",
      "Repeated disconnect = penalty"
    ]
  },
  {
    title: "Refusal to Play",
    icon: <Ban className="text-red-400" />,
    highlight: true,
    items: [
      "Skipping races is not allowed",
      "Penalty: $300,000 – $500,000",
      "Additional disciplinary action"
    ]
  },
  {
    title: "Wrong Participation",
    icon: <AlertTriangle className="text-yellow-400" />,
    items: [
      "Invalid player = result not counted",
      "Repeat violation = penalties"
    ]
  },
  {
    title: "Player Swap Rule",
    icon: <Repeat className="text-blue-400" />,
    items: [
      "Max 2 swaps per team",
      "Declare before race",
      "No mid-race swaps"
    ]
  },
  {
    title: "POV Submission",
    icon: <Video className="text-neonBlue" />,
    items: [
      "Top players must submit POV within 24 hours",
      "Failure → admin action"
    ]
  },
  {
    title: "Tie-Breaker",
    icon: <Trophy className="text-yellow-300" />,
    items: [
      "Each team selects best driver",
      "1v1 race on hardest track",
      "Winner decides ranking"
    ]
  },
  {
    title: "Admin Authority",
    icon: <Crown className="text-purple-400" />,
    items: [
      "Admin enforces rules",
      "Handles disputes",
      "All decisions are final"
    ]
  },
  {
    title: "Final Statement",
    icon: <ShieldCheck className="text-green-300" />,
    items: [
      "Play fair",
      "Follow rules",
      "Respect decisions",
      "League rewards discipline & teamwork"
    ]
  }
];

export default function Rules() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-neonBlue">
          Regulations
        </p>
        <h2 className="mt-2 text-3xl font-black">Rules</h2>
      </div>

      <Panel title="Official League Rules">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <div
              key={section.title}
              className={`rounded-xl border p-5 transition ${
                section.highlight
                  ? "border-red-400/40 bg-red-500/10"
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