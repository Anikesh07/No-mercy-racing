import {
  ShieldCheck,
  Trophy,
  Users,
  Flag,
  AlertTriangle,
  Ban,
  Repeat,
  Video,
  Crown,
  Wrench
} from "lucide-react";

import Panel from "../components/Panel.jsx";

const sections = [
  {
  title: "Event Structure",
  icon: <Flag className="text-neonPink" />,
  highlight: true,
  items: [
    "Event runs for 7 consecutive days",
    "Day 1 and Day 2 will be qualifying rounds",
    "From Day 3 onward, elimination rounds will begin",
    "Management approval required before participation",
    "Participation = acceptance of all league rules",
    "All teams must reach the race track 30 minutes before race start time",
    "Late arrival may result in penalties or disqualification"
  ]
},

  {
    title: "Entry Rules",
    icon: <Trophy className="text-yellow-400" />,
    items: [
      "Entry Fee: Free for this season",
      "No refunds allowed after registration",
      "Teams must confirm participation before start"
    ]
  },

  {
    title: "Daily Match Format",
    icon: <Users className="text-neonBlue" />,
    items: [
      "Grand Prix (4 Drivers each team)",
      "Duo Clash (2 Drivers each team)",
      "Solo Showdown (1 Driver each team)",
      "All race formats contribute to total points"
    ]
  },

  {
    title: "Vehicle Regulations",
    icon: <ShieldCheck className="text-cyan-400" />,
    highlight: true,
    items: [
      "Grand Prix: Only Class 6 and Class 7 vehicles allowed",
      "Duo Clash: Only Class 8 vehicles allowed",
      "Solo Showdown: Only Muscle class vehicles allowed",
      "Management can ban any overpowered vehicle on the spot",
      "Using banned vehicles may result in disqualification"
    ]
  },

  {
    title: "Race Logistics & External Situations",
    icon: <Wrench className="text-orange-400" />,
    highlight: true,
    items: [
      "Teams are allowed to bring their own mechanic and repair kits",
      "Hosts will not provide mechanics, repair kits, or race support equipment",
      "All required race supplies must be arranged by participating crews",
      "If PD becomes involved during races or chase situations, crews must escape on their own",
      "Police involvement or chase situations are NOT considered host-side issues",
      "No restart, compensation, or re-run will be provided due to PD involvement"
    ]
  },

  {
    title: "Core Race Regulations",
    icon: <ShieldCheck className="text-red-400" />,
    highlight: true,
    items: [
      "All races must run on 60 FPS lock with clearly visible gameplay",
      "POV must be recorded/streamed in OBS using Full Display Capture",
      "POV recording is mandatory for every race",
      "POV must show Steam Apps and Task Manager at race start",
      "No PIT maneuvers, ramming, or intentional blocking allowed",
      "No VIN scratched vehicles allowed",
      "Management decisions are final and binding",
      "Management can ban any overpowered vehicle at any time"
    ]
  },

  {
    title: "Dirty Driving (STRICT)",
    icon: <Ban className="text-red-500" />,
    highlight: true,
    items: [
      "No ramming, PIT maneuvers, blocking, or brake-checking",
      "Minor violation → Warning",
      "Moderate violation → Position penalty",
      "Major violation → Disqualification",
      "Severe violation → Disqualification + disciplinary action",
      "Repeated violations → Ban or removal from league"
    ]
  },

  {
  title: "Track Selection & Start Rules",
  icon: <Flag className="text-cyan-400" />,
  highlight: true,
  items: [
    "2-line grid system will be used",
    "Day 1 grid determined randomly",
    "Day 2+ grid based on reverse ranking order",
    "From elimination rounds, out of 3 tracks:",
    "2 tracks can be selected by participating crews",
    "1 track will be selected by management",
    "Management reserves the right to change tracks at any time if required",
    "No jump starts allowed",
    "Lane discipline must be maintained"
  ]
},

  {
    title: "Disconnect Rule",
    icon: <Repeat className="text-purple-400" />,
    items: [
      "Disconnect = automatic last position",
      "No rejoin advantage allowed",
      "Repeated disconnects may lead to penalties"
    ]
  },

  {
    title: "Wrong Participation",
    icon: <AlertTriangle className="text-yellow-400" />,
    items: [
      "Invalid player participation = result not counted",
      "Repeated violations may lead to penalties or disqualification"
    ]
  },

  {
    title: "POV Submission",
    icon: <Video className="text-neonBlue" />,
    highlight: true,
    items: [
      "Required POVs must be submitted within 2 hours after race completion",
      "League points and standings will only update after both crews submit their POVs",
      "Failure to submit POV may result in penalties or result cancellation",
      "Edited, incomplete, or corrupted POVs may be rejected by management"
    ]
  },

  {
    title: "Tie-Breaker",
    icon: <Trophy className="text-yellow-300" />,
    items: [
      "Each team selects their best driver",
      "1v1 race on the hardest selected track",
      "Winner determines final ranking"
    ]
  },

  {
    title: "Admin Authority",
    icon: <Crown className="text-purple-400" />,
    items: [
      "Admins enforce all league regulations",
      "Admins handle disputes and investigations",
      "All management decisions are final"
    ]
  },

  {
    title: "Final Statement",
    icon: <ShieldCheck className="text-green-300" />,
    items: [
      "Play fair",
      "Respect all racers and officials",
      "Follow all league regulations",
      "Discipline and consistency win championships"
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

        <h2 className="mt-2 text-4xl font-black">
          Rules
        </h2>

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