export default function StatCard({ label, value, tone = "blue" }) {
  const tones = {
    blue: "from-blue-600/30 to-cyan-500/10 border-blue-400/20",
    green: "from-green-600/25 to-emerald-500/10 border-green-400/20",
    red: "from-red-600/25 to-orange-500/10 border-red-400/20",
    amber: "from-amber-500/25 to-yellow-500/10 border-amber-300/20",
  };
  return (
    <div className={`rounded-3xl border bg-gradient-to-br ${tones[tone]} p-5 shadow-glow`}>
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-3 text-4xl font-black tracking-tight">{value}</p>
    </div>
  );
}
