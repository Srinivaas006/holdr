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
} from "firebase/firestore";
import { db } from "../firebase/config";
import { supabase, FILES_BUCKET } from "../supabase/config";

export async function uploadFile(uid, file, onProgress) {
  const path = `${uid}/${Date.now()}_${file.name}`;

  if (onProgress) onProgress(10);

  const { error: uploadError } = await supabase.storage
    .from(FILES_BUCKET)
    .upload(path, file, { upsert: false });

  if (uploadError) {
    throw uploadError;
  }

  if (onProgress) onProgress(70);

  const { data: urlData } = supabase.storage
    .from(FILES_BUCKET)
    .getPublicUrl(path);

  const docRef = await addDoc(collection(db, "files"), {
    ownerId: uid,
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    url: urlData.publicUrl,
    path,
    sharedWith: [],
    createdAt: serverTimestamp(),
  });

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

export async function removeFile(fileId, path) {
  const { error } = await supabase.storage.from(FILES_BUCKET).remove([path]);
  if (error) {
    throw error;
  }
  await deleteDoc(doc(db, "files", fileId));
}

export function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(1)} ${units[i]}`;
}
