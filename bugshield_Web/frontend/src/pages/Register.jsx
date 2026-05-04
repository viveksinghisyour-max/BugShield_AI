import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { api, setSession } from "../api/client.js";
import { AuthShell, Input } from "./Login.jsx";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "developer" });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const result = await api("/register", { method: "POST", body: JSON.stringify(form) });
      setSession(result.token, result.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthShell title="Create account" subtitle="Start scanning code with BugShield.">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
        <Input label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
        <Input label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} />
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Role</span>
          <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3">
            <option value="developer">Developer</option>
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        {error && <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        <button className="w-full rounded-2xl bg-blue-600 px-5 py-3 font-black text-white hover:bg-blue-500">Register</button>
        <p className="text-center text-sm text-slate-400">
          Already have an account? <Link className="text-green-300" to="/login">Login</Link>
        </p>
      </form>
    </AuthShell>
  );
}
