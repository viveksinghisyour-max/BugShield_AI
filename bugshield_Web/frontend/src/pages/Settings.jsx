import { getUser } from "../api/client.js";

export default function Settings() {
  const user = getUser();
  return (
    <div className="max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-8">
      <h2 className="text-3xl font-black">Settings</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Info label="Name" value={user?.name} />
        <Info label="Email" value={user?.email} />
        <Info label="Role" value={user?.role} />
        <Info label="Theme" value="Dark mode enabled" />
      </div>
      <p className="mt-8 rounded-2xl bg-blue-500/10 p-4 text-blue-200">Future expansion: user management, email notification settings, API keys, and team permissions.</p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 font-bold">{value || "-"}</p>
    </div>
  );
}
