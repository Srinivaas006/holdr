import { useNavigate } from "react-router-dom";
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
        <span className="brand-mark">V</span>
        <span>Holdr</span>
      </div>
      <div className="dash-user">
        <span className="dash-user-name">{user?.displayName || user?.email}</span>
        <button className="btn btn-ghost btn-small" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}
