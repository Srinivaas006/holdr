import { formatBytes, removeFile } from "../utils/storageHelpers";

export default function FileItem({ file }) {
  const handleDelete = async () => {
    const ok = window.confirm(`Remove ${file.name}? This can't be undone.`);
    if (!ok) return;
    await removeFile(file.id, file.path);
  };

  return (
    <div className="ledger-row ledger-row--interactive">
      <span className="ledger-dot" />
      <span className="ledger-name">{file.name}</span>
      <span className="ledger-leader" />
      <span className="ledger-size">{formatBytes(file.size)}</span>
      <div className="ledger-actions">
        <a href={file.url} target="_blank" rel="noreferrer" className="ledger-action">
          Download
        </a>
        <button className="ledger-action ledger-action--danger" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
