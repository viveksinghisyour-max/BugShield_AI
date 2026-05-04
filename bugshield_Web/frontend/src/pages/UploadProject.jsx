import { useState } from "react";
import { api } from "../api/client.js";

export default function UploadProject() {
  const [projectName, setProjectName] = useState("");
  const [file, setFile] = useState(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData();
    form.append("project_name", projectName);
    if (file) form.append("file", file);
    if (repoUrl) form.append("repo_url", repoUrl);
    const result = await api("/upload", { method: "POST", body: form });
    setMessage(`Project uploaded: ${result.project_name}`);
    setProjectName("");
    setFile(null);
    setRepoUrl("");
  };

  return (
    <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
      <h2 className="text-3xl font-black">Upload Project</h2>
      <p className="mt-2 text-slate-400">Upload a ZIP, source file, or attach a repository URL for tracking.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <Field label="Project Name" value={projectName} onChange={setProjectName} />
        <label className="block rounded-3xl border border-dashed border-blue-400/40 bg-blue-500/5 p-8 text-center">
          <input type="file" className="hidden" accept=".py,.js,.ts,.java,.env,.json,.txt,.zip" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          <span className="font-bold text-blue-200">{file ? file.name : "Click to select project file or ZIP"}</span>
          <span className="mt-2 block text-sm text-slate-400">Supported: .py, .js, .ts, .java, .env, .json, .txt, .zip</span>
        </label>
        <Field label="Repository URL (optional)" value={repoUrl} onChange={setRepoUrl} placeholder="https://github.com/team/repo" required={false} />
        <button className="rounded-2xl bg-green-500 px-6 py-3 font-black text-slate-950 hover:bg-green-400">Upload Project</button>
      </form>
      {message && <p className="mt-5 rounded-2xl bg-green-500/10 p-4 text-green-300">{message}</p>}
    </div>
  );
}

function Field({ label, value, onChange, placeholder = "", required = true }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-300">{label}</span>
      <input required={required} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
    </label>
  );
}
