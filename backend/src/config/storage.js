import { supabaseAdmin } from "./supabase.js";

export const getStoragePath = (url, bucket, userId) => {
  const base = new URL(process.env.SUPABASE_URL);
  const parsed = new URL(url);
  const prefix = `/storage/v1/object/public/${bucket}/`;
  if (parsed.origin !== base.origin || !parsed.pathname.startsWith(prefix)) {
    throw new Error("Invalid storage URL");
  }
  const path = decodeURIComponent(parsed.pathname.slice(prefix.length));
  if (!path.startsWith(`${userId}/`) || path.split("/").some(part => part === ".." || part === ".")) {
    throw new Error("Invalid storage owner");
  }
  return path;
};

export const removeStoredImage = async (url, bucket, userId) => {
  if (!url) return;
  const path = getStoragePath(url, bucket, userId);
  const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
  if (error) throw error;
};
