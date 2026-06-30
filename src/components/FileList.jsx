import { useEffect, useState } from "react";
import { subscribeToFiles } from "../utils/storageHelpers";
import { useAuth } from "../context/AuthContext";
import FileItem from "./FileItem";

export default function FileList() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToFiles(user.uid, (data) => {
      setFiles(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  if (loading) {
    return <p className="file-list-empty">Reading the ledger...</p>;
  }

  if (!files.length) {
    return <p className="file-list-empty">Nothing stored yet. Drop a file above to begin.</p>;
  }

  return (
    <div className="ledger-card ledger-card--full">
      {files.map((file) => (
        <FileItem key={file.id} file={file} />
      ))}
    </div>
  );
}
