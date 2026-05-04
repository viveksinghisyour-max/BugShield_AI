const styles = {
  CRITICAL: "bg-red-500/15 text-red-300 ring-red-400/30",
  HIGH: "bg-orange-500/15 text-orange-300 ring-orange-400/30",
  MEDIUM: "bg-yellow-500/15 text-yellow-200 ring-yellow-400/30",
  LOW: "bg-green-500/15 text-green-300 ring-green-400/30",
};

export default function SeverityBadge({ severity }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${styles[severity] || styles.LOW}`}>{severity}</span>;
}
