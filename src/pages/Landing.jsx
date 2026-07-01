import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { subscribeToGlobalStats, formatBytes } from "../utils/storageHelpers";
import "../styles/landing.css";

const TOTAL_BYTES = 1 * 1024 * 1024 * 1024;

export default function Landing() {
  const [stats, setStats] = useState({ totalBytes: 0 });

  useEffect(() => {
    const unsub = subscribeToGlobalStats(setStats);
    return unsub;
  }, []);

  const usedPct = Math.min((stats.totalBytes / TOTAL_BYTES) * 100, 100);

  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="brand">
          <span className="brand-mark">H</span>
          <span>Holdr</span>
        </div>
        <nav>
          <Link to="/login" className="nav-link">Log in</Link>
          <Link to="/signup" className="nav-link nav-link--solid">Get started</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy fade-up">
          <p className="eyebrow">A quiet place for your files</p>
          <h1>
            Keep every file
            <br />
            where you can <em>actually</em> find it.
          </h1>
          <p className="hero-sub">
            Holdr is a personal file vault. Upload, organise, and hand out
            access only to the people who need it. No clutter, no ads, no
            surprise charges.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary">Create your vault</Link>
            <Link to="/login" className="btn btn-ghost">I already have one</Link>
          </div>

          <div className="hero-storage-meter fade-up">
            <div className="hero-meter-header">
              <span className="hero-meter-label">Vault capacity</span>
              <span className="hero-meter-value">
                {formatBytes(stats.totalBytes)} <span>of 1.0 GB used</span>
              </span>
            </div>
            <div className="hero-meter-track">
              <div
                className="hero-meter-fill"
                style={{ width: `${usedPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="hero-visual fade-up fade-up--delay">
          <div className="ledger-card">
            <div className="ledger-row">
              <span className="ledger-dot" />
              <span className="ledger-name">finsight_report.pdf</span>
              <span className="ledger-leader" />
              <span className="ledger-size">2.4 MB</span>
            </div>
            <div className="ledger-row">
              <span className="ledger-dot" />
              <span className="ledger-name">project_brief.docx</span>
              <span className="ledger-leader" />
              <span className="ledger-size">812 KB</span>
            </div>
            <div className="ledger-row">
              <span className="ledger-dot" />
              <span className="ledger-name">quiz_dataset.csv</span>
              <span className="ledger-leader" />
              <span className="ledger-size">5.1 MB</span>
            </div>
            <div className="ledger-row ledger-row--active">
              <span className="ledger-dot" />
              <span className="ledger-name">cover_design.png</span>
              <span className="ledger-leader" />
              <span className="ledger-size">1.8 MB</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature-card fade-up">
          <span className="feature-index">01</span>
          <h3>Your files, your rules</h3>
          <p>
            Every upload sits inside a folder only you can open. Nobody else
            gets a key unless you hand one out.
          </p>
        </div>
        <div className="feature-card fade-up">
          <span className="feature-index">02</span>
          <h3>Share with a link</h3>
          <p>
            Send a single file to a single person, without giving them the
            run of your whole drive.
          </p>
        </div>
        <div className="feature-card fade-up">
          <span className="feature-index">03</span>
          <h3>Nothing to manage</h3>
          <p>
            No servers to babysit, no invoices to dodge. It just keeps your
            files where you left them.
          </p>
        </div>
      </section>

      <footer className="landing-footer">
        <span>Holdr</span>
        <span>Built for keeping things in order.</span>
      </footer>
    </div>
  );
}