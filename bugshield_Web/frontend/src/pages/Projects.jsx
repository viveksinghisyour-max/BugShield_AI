import { useEffect, useState } from "react";
import { api } from "../api/client.js";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState("");

  const load = () => api("/projects").then(setProjects).catch(console.error);
  useEffect(() => { load(); }, []);

  const scan = async (projectId) => {
    const result = await api("/scan", { method: "POST", body: JSON.stringify({ project_id: projectId }) });
    setMessage(`Scan queued. Scan ID: ${result.scan_id}`);
    load();
  };

  const remove = async (projectId) => {
    await api(`/projects/${projectId}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-black">Projects</h2>
      {message && <p className="rounded-2xl bg-blue-500/10 p-4 text-blue-200">{message}</p>}
      <div className="overflow-hidden rounded-3xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/10 text-slate-300">
            <tr><th className="p-4">Project</th><th>Status</th><th>Security Score</th><th>Uploaded</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-t border-white/10">
                <td className="p-4 font-bold">{project.project_name}</td>
                <td>{project.status}</td>
                <td>{project.security_score}/100</td>
                <td>{new Date(project.upload_date).toLocaleString()}</td>
                <td className="space-x-2">
                  <button onClick={() => scan(project.id)} className="rounded-xl bg-blue-600 px-3 py-2 font-bold">Scan</button>
                  <button onClick={() => remove(project.id)} className="rounded-xl bg-red-500/20 px-3 py-2 font-bold text-red-200">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
