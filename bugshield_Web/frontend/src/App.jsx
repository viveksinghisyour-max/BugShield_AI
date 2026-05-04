import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Projects from "./pages/Projects.jsx";
import UploadProject from "./pages/UploadProject.jsx";
import ScanHistory from "./pages/ScanHistory.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";
import { clearSession, getToken } from "./api/client.js";

function Protected({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const navigate = useNavigate();
  const logout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <Protected>
            <AppLayout onLogout={logout} />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="upload" element={<UploadProject />} />
        <Route path="history" element={<ScanHistory />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
