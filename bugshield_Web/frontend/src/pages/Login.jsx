import { Link, useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { useState } from "react";
import { api, setSession } from "../api/client.js";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const result = await api("/login", { method: "POST", body: JSON.stringify(form) });
      setSession(result.token, result.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Scan, explain, and fix code vulnerabilities.">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
        <Input label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} />
        {error && <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        <button className="w-full rounded-2xl bg-blue-600 px-5 py-3 font-black text-white hover:bg-blue-500">Login</button>
        <p className="text-center text-sm text-slate-400">
          New to BugShield? <Link className="text-green-300" to="/register">Create account</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen bg-slate-950 text-white lg:grid-cols-[1fr_520px]">
      <section className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_top_left,#1d4ed8,transparent_34%),linear-gradient(135deg,#020617,#0f172a)] p-12 lg:block">
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-green-400/10 blur-3xl" />
        <div className="relative z-10 max-w-xl">
          <div className="mb-10 flex items-center gap-3">
            <div className="rounded-3xl bg-blue-600 p-4"><Shield size={34} /></div>
            <div>
              <h1 className="text-3xl font-black">BugShield</h1>
              <p className="text-slate-300">Your AI shield against software bugs</p>
            </div>
          </div>
          <h2 className="text-6xl font-black leading-tight">Security scanning built for modern builders.</h2>
          <p className="mt-6 text-lg text-slate-300">Upload code, detect vulnerabilities, learn root causes, and generate professional reports from one dashboard.</p>
        </div>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-glow">
          <h2 className="text-3xl font-black">{title}</h2>
          <p className="mb-8 mt-2 text-slate-400">{subtitle}</p>
          {children}
        </div>
      </section>
    </div>
  );
}

export function Input({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-300">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none ring-blue-500 transition focus:ring-2" required />
    </label>
  );
}
