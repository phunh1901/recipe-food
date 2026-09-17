import sanitizeHtml from "sanitize-html";

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
  if (typeof text !== "string") return "";
  return sanitizeHtml(text.trim(), {
    allowedTags: ["p", "br", "h2", "h3", "h4", "ul", "ol", "li", "strong", "b", "em", "i", "u", "blockquote"],
    allowedAttributes: {},
  });
};


export const isValid = (value, pattern) => {
  if (typeof value !== "string" || !value) return false;
  return pattern.test(value);
};
