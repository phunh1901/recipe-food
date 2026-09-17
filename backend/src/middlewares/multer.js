import multer from "multer";
const types = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
const parser = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 20 },
  fileFilter: (req, file, callback) => {
    if (!types.has(file.mimetype)) return callback(Object.assign(new Error("Chỉ chấp nhận ảnh JPEG, PNG, GIF hoặc WebP."), { status: 400 }));
    callback(null, true);
  },
});
export const isImageBuffer = (buffer, type) => {
  if (!Buffer.isBuffer(buffer)) return false;
  if (type === "image/jpeg") return buffer.length >= 3 && buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  if (type === "image/png") return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (type === "image/gif") return /^GIF8[79]a$/.test(buffer.subarray(0, 6).toString("ascii"));
  if (type === "image/webp") return buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  return false;
};
export default {
  single: (field) => [parser.single(field), (req, res, next) => {
    if (req.file && !isImageBuffer(req.file.buffer, req.file.mimetype)) {
      return res.status(400).json({ resultMessage: { vn: "Nội dung tệp không phải ảnh hợp lệ." } });
    }
    next();
  }],
};
