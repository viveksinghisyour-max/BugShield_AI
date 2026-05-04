import { useEffect, useState } from "react";
import { api } from "../api/client.js";

export default function Reports() {
  const [history, setHistory] = useState([]);
  const [scanId, setScanId] = useState("");
  const [type, setType] = useState("pdf");

  useEffect(() => {
    api("/scan-history").then(setHistory).catch(console.error);
  }, []);

  const download = async () => {
    if (!scanId) return;
    const blob = await api(`/report?scan_id=${scanId}&report_type=${type}`);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bugshield-scan-${scanId}.${type}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl rounded-3xl border border-white/10 bg-white/[0.04] p-8">
      <h2 className="text-3xl font-black">Reports</h2>
      <p className="mt-2 text-slate-400">Generate PDF, JSON, or CSV security reports for completed scans.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm text-slate-300">Scan</span>
          <select value={scanId} onChange={(event) => setScanId(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3">
            <option value="">Select scan</option>
            {history.map((scan) => <option key={scan.id} value={scan.id}>#{scan.id} - {scan.project_name}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm text-slate-300">Format</span>
          <select value={type} onChange={(event) => setType(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3">
            <option value="pdf">PDF</option>
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
        </label>
      </div>
      <button onClick={download} className="mt-6 rounded-2xl bg-blue-600 px-6 py-3 font-black hover:bg-blue-500">Generate Report</button>
    </div>
  );
}
