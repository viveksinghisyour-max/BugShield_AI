import { useEffect, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Tooltip } from "chart.js";
import StatCard from "../components/StatCard.jsx";
import { api } from "../api/client.js";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api("/dashboard").then(setData).catch(console.error);
  }, []);

  if (!data) return <p className="text-slate-400">Loading dashboard...</p>;
  const cards = data.cards;
  const severityLabels = Object.keys(data.severity_distribution);
  const typeLabels = Object.keys(data.vulnerability_types).slice(0, 8);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Projects" value={cards.total_projects} />
        <StatCard label="Total Scans" value={cards.total_scans} tone="green" />
        <StatCard label="Vulnerabilities" value={cards.total_vulnerabilities} tone="amber" />
        <StatCard label="Critical Issues" value={cards.critical_issues} tone="red" />
        <StatCard label="Security Score" value={`${cards.security_score}/100`} tone="blue" />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Panel title="Severity Distribution">
          <Doughnut data={{ labels: severityLabels, datasets: [{ data: severityLabels.map((key) => data.severity_distribution[key]), backgroundColor: ["#ef4444", "#f97316", "#eab308", "#22c55e"] }] }} />
        </Panel>
        <Panel title="Vulnerability Types">
          <Bar data={{ labels: typeLabels, datasets: [{ label: "Findings", data: typeLabels.map((key) => data.vulnerability_types[key]), backgroundColor: "#1d4ed8" }] }} />
        </Panel>
        <Panel title="Security Trend">
          <Line data={{ labels: data.security_trend.map((item) => new Date(item.scan_date).toLocaleDateString()), datasets: [{ label: "Score", data: data.security_trend.map((item) => item.security_score), borderColor: "#22c55e", backgroundColor: "#22c55e" }] }} />
        </Panel>
      </section>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <h2 className="mb-5 text-lg font-black">{title}</h2>
      {children}
    </div>
  );
}
