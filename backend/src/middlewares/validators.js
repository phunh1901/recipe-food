export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  FULL_NAME: /^[a-zA-ZÀ-ỹ\s]{2,50}$/,
  PASSWORD: /^.{6,20}$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,

  // Regex cho slug hoặc ID nếu cần
  SLUG: /^[a-z0-9-]+$/,
};

/**
 * Kiểm tra tính hợp lệ của chuỗi văn bản dài (textarea)
 * @param {string} text - Nội dung văn bản
 * @param {number} min - Độ dài tối thiểu
 * @param {number} max - Độ dài tối đa
 */
export const isValidTextarea = (text, min = 1, max = 5000) => {
  if (!text || typeof text !== "string") return false;
  const length = text.trim().length;
  return length >= min && length <= max;
};

// Chống XSS cơ bản
export const sanitizeInput = (text) => {
  if (!text) return "";
  return text
    .trim()
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "") // Xóa thẻ script
    .replace(/on\w+="[^"]*"/gim, "") // Xóa các event handler như onclick
    .replace(/javascript:/gim, ""); // Xóa các link thực thi code
};


export const isValid = (value, pattern) => {
  if (!value) return false;
  return pattern.test(value);
};
