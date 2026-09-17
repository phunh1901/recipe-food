import { supabaseAdmin } from "../config/supabase.js";
import { v4 as uuidv4 } from "uuid";

export const uploadImage = async (file, bucketName, userId) => {
  try {
    if (!file) throw new Error("No file provided");
    if (!bucketName) throw new Error("No bucket provided");

    // Tạo tên file unique
    const fileExt = { "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp" }[file.mimetype];
    if (!fileExt) throw new Error("Unsupported image type");

    const filePath = `${userId}/${uuidv4()}.${fileExt}`;

    // Upload
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    // Lấy public URL

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error("Upload image failed:", err);
    throw err;
  }
};
