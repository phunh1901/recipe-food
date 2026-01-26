import { createClient } from "@supabase/supabase-js";

// Lấy biến môi trường từ file .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Kiểm tra nếu thiếu biến môi trường để tránh lỗi khi chạy App
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Thiếu cấu hình Supabase trong file .env!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
