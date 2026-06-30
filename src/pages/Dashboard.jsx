import Navbar from "../components/Navbar";
import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";
import "../styles/dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <Navbar />
      <main className="dash-main">
        <div className="dash-heading">
          <h1>Your vault</h1>
          <p>Everything you keep here is visible only to you.</p>
        </div>
        <FileUpload />
        <FileList />
      </main>
    </div>
  );
}
