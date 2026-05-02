export default function Badge({ children, tone = "blue" }) {
  const tones = {
    blue: "border-neonBlue/40 bg-neonBlue/10 text-neonBlue",
    pink: "border-neonPink/40 bg-neonPink/10 text-neonPink",
    purple: "border-neonPurple/40 bg-neonPurple/10 text-violet-200",
    green: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    yellow: "border-caution/40 bg-caution/10 text-yellow-200",
    red: "border-red-400/40 bg-red-400/10 text-red-300"
  };

  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
