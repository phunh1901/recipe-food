import { supabaseAdmin } from "../config/supabase.js";
const authenticate = (optional) => async (req, res, next) => {
  const token = req.headers.authorization?.match(/^Bearer (\S+)$/i)?.[1];
  if (!token) {
    if (optional) return next();
    return res.status(401).json({ message: "Vui lòng đăng nhập." });
  }
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error && (!error.status || error.status >= 500)) {
      return next(Object.assign(new Error("Authentication service unavailable"), { status: 503 }));
    }
    if (error || !user) return res.status(401).json({ message: "Phiên đăng nhập hết hạn hoặc không hợp lệ." });
    const { data: profile, error: profileError } = await supabaseAdmin.from("users")
      .select("role, is_banned").eq("id", user.id).maybeSingle();
    if (profileError) throw profileError;
    if (!profile || profile.is_banned) return res.status(403).json({ message: "Tài khoản không tồn tại hoặc đã bị khóa." });
    req.user = { id: user.id, email: user.email, role: profile.role };
    req.token = token;
    next();
  } catch (error) { next(error); }
};
export const verifyToken = authenticate(false);
export const optionalVerifyToken = authenticate(true);
export const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
  next();
};
export const isSuperAdmin = (req, res, next) => {
  if (!process.env.SUPER_ADMIN_ID || req.user?.id !== process.env.SUPER_ADMIN_ID)
    return res.status(403).json({ message: "Chỉ quản trị viên tối cao có quyền này." });
  next();
};
