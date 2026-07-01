import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
  setDoc,
  getDoc,
  increment,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { supabase, FILES_BUCKET } from "../supabase/config";

const GLOBAL_STATS_REF = () => doc(db, "stats", "global");

async function updateGlobalStats(byteDelta) {
  const ref = GLOBAL_STATS_REF();
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { totalBytes: Math.max(0, byteDelta), updatedAt: serverTimestamp() });
  } else {
    await setDoc(ref, {
      totalBytes: increment(byteDelta),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }
}

export async function uploadFile(uid, file, onProgress, ownerName, ownerEmail) {
  const path = `${uid}/${Date.now()}_${file.name}`;

  if (onProgress) onProgress(10);

  const { error: uploadError } = await supabase.storage
    .from(FILES_BUCKET)
    .upload(path, file, { upsert: false });

  if (uploadError) throw uploadError;

  if (onProgress) onProgress(70);

  const { data: urlData } = supabase.storage
    .from(FILES_BUCKET)
    .getPublicUrl(path);

  const docRef = await addDoc(collection(db, "files"), {
    ownerId: uid,
    ownerName: ownerName || "Unknown",
    ownerEmail: ownerEmail || "",
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    url: urlData.publicUrl,
    path,
    sharedWith: [],
    createdAt: serverTimestamp(),
  });

  await updateGlobalStats(file.size);

  if (onProgress) onProgress(100);
  return docRef.id;
}

export function subscribeToFiles(uid, callback) {
  const q = query(
    collection(db, "files"),
    where("ownerId", "==", uid),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const files = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(files);
  });
}

export async function removeFile(fileId, path, fileSize) {
  const { error } = await supabase.storage.from(FILES_BUCKET).remove([path]);
  if (error) throw error;
  await deleteDoc(doc(db, "files", fileId));
  if (fileSize) await updateGlobalStats(-fileSize);
}

export function subscribeToGlobalStats(callback) {
  return onSnapshot(GLOBAL_STATS_REF(), (snap) => {
    callback(snap.exists() ? snap.data() : { totalBytes: 0 });
  });
}

export async function getAllUsersStats() {
  const snap = await getDocs(collection(db, "files"));
  const map = {};
  snap.docs.forEach((d) => {
    const data = d.data();
    const uid = data.ownerId;
    if (!map[uid]) {
      map[uid] = {
        uid,
        name: data.ownerName || "Unknown",
        email: data.ownerEmail || "",
        totalBytes: 0,
        fileCount: 0,
      };
    }
    map[uid].totalBytes += data.size || 0;
    map[uid].fileCount += 1;
  });
  return Object.values(map).sort((a, b) => b.totalBytes - a.totalBytes);
}

export function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(1)} ${units[i]}`;
}