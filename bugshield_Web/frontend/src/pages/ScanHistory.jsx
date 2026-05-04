import { useEffect, useState } from "react";
import SeverityBadge from "../components/SeverityBadge.jsx";
import { api } from "../api/client.js";

export default function ScanHistory() {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api("/scan-history").then(setHistory).catch(console.error);
  }, []);

  const open = async (scanId) => {
    const result = await api(`/scan/${scanId}`);
    setSelected(result);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <section>
        <h2 className="mb-5 text-3xl font-black">Scan History</h2>
        <div className="space-y-3">
          {history.map((scan) => (
            <button key={scan.id} onClick={() => open(scan.id)} className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-left hover:bg-white/[0.07]">
              <p className="font-black">{scan.project_name}</p>
              <p className="text-sm text-slate-400">Scan #{scan.id} • {scan.status}</p>
              <p className="mt-2 text-green-300">Score: {scan.security_score}/100</p>
            </button>
          ))}
        </div>
      </section>
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h3 className="mb-4 text-xl font-black">Vulnerabilities</h3>
        {!selected && <p className="text-slate-400">Select a scan to view results.</p>}
        {selected && <VulnerabilityTable rows={selected.vulnerabilities} />}
      </section>
    </div>
  );
}

function VulnerabilityTable({ rows }) {
  return (
    <div className="overflow-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="text-slate-400">
          <tr><th className="p-3">File</th><th>Line</th><th>Issue</th><th>Severity</th><th>Status</th><th>Fix Suggestion</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-white/10">
              <td className="p-3">{row.file}</td>
              <td>{row.line}</td>
              <td className="font-semibold">{row.issue}</td>
              <td><SeverityBadge severity={row.severity} /></td>
              <td>{row.status}</td>
              <td className="max-w-sm text-slate-300">{row.recommendation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
