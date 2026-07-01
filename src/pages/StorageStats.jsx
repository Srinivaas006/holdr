import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllUsersStats, subscribeToGlobalStats, formatBytes } from "../utils/storageHelpers";
import Navbar from "../components/Navbar";
import "../styles/stats.css";

const TOTAL_BYTES = 1 * 1024 * 1024 * 1024;

export default function StorageStats() {
  const [users, setUsers] = useState([]);
  const [globalStats, setGlobalStats] = useState({ totalBytes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUsersStats().then((data) => {
      setUsers(data);
      setLoading(false);
    });
    const unsub = subscribeToGlobalStats(setGlobalStats);
    return unsub;
  }, []);

  const totalUsedPct = Math.min((globalStats.totalBytes / TOTAL_BYTES) * 100, 100);

  return (
    <div className="dashboard">
      <Navbar />
      <main className="dash-main">
        <div className="dash-heading">
          <Link to="/dashboard" className="stats-back">← Back to vault</Link>
          <h1>Storage overview</h1>
          <p>Total usage across all accounts on this instance.</p>
        </div>

        <div className="stats-global-card">
          <div className="stats-global-top">
            <div>
              <p className="stats-label">Total used</p>
              <p className="stats-big">{formatBytes(globalStats.totalBytes)}</p>
            </div>
            <div className="stats-global-right">
              <p className="stats-label">Available</p>
              <p className="stats-big">{formatBytes(TOTAL_BYTES - globalStats.totalBytes)}</p>
            </div>
            <div className="stats-global-right">
              <p className="stats-label">Capacity</p>
              <p className="stats-big">1.0 GB</p>
            </div>
          </div>

          <div className="stats-bar-wrap">
            <div className="stats-bar">
              <div
                className="stats-bar-fill"
                style={{ width: `${totalUsedPct}%` }}
              />
            </div>
            <span className="stats-bar-pct">{totalUsedPct.toFixed(1)}%</span>
          </div>
        </div>

        <div className="stats-section-heading">
          <span>By user</span>
          <span>{users.length} account{users.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <p className="file-list-empty">Counting bytes...</p>
        ) : users.length === 0 ? (
          <p className="file-list-empty">No files uploaded yet.</p>
        ) : (
          <div className="stats-user-list">
            {users.map((u, i) => {
              const pct = Math.min((u.totalBytes / TOTAL_BYTES) * 100, 100);
              return (
                <div key={u.uid} className="stats-user-row">
                  <div className="stats-user-meta">
                    <span className="stats-user-index">{String(i + 1).padStart(2, "0")}</span>
                    <div className="stats-user-info">
                      <span className="stats-user-name">{u.name}</span>
                      <span className="stats-user-email">{u.email}</span>
                    </div>
                    <div className="stats-user-numbers">
                      <span className="stats-user-size">{formatBytes(u.totalBytes)}</span>
                      <span className="stats-user-files">{u.fileCount} file{u.fileCount !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="stats-user-bar">
                    <div className="stats-user-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}