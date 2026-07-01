import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="dash-nav">
      <div className="brand">
        <span className="brand-mark">H</span>
        <span>Holdr</span>
      </div>
      <div className="dash-user">
        <Link to="/stats" className="nav-stats-link">Storage stats</Link>
        <span className="dash-user-name">{user?.displayName || user?.email}</span>
        <button className="btn btn-ghost btn-small" onClick={handleLogout}>Log out</button>
      </div>
    </header>
  );
}