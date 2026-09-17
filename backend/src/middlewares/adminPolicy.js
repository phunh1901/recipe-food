import { supabaseAdmin } from "../config/supabase.js";

export const validateAdminAction = (actor, target, changes, superAdminId = process.env.SUPER_ADMIN_ID) => {
  if (!actor || actor.role !== "admin") return "Bạn không có quyền quản trị.";
  const changesRole = changes.role !== undefined && changes.role !== target.role;
  const sensitive = changesRole || changes.is_banned !== undefined || changes.delete;
  if (sensitive && (target.id === superAdminId || target.id === actor.id)) {
    return "Không thể khóa, xóa hoặc đổi quyền tài khoản này.";
  }
  if ((changesRole || (sensitive && target.role === "admin")) && actor.id !== superAdminId) {
    return "Chỉ quản trị viên tối cao có quyền thực hiện thao tác này.";
  }
  return null;
};

export const guardAdminAction = async (req, res, next) => {
  const changes = { ...(req.body || {}) };
  if (req.method === "DELETE") changes.delete = true;
  if (req.path.startsWith("/make-admin/")) changes.role = "admin";
  if (req.path.startsWith("/demote-admin/")) changes.role = "user";
  if (req.path.startsWith("/ban/")) changes.is_banned = true;
  if (req.path.startsWith("/unban/")) changes.is_banned = false;
  if (changes.role !== undefined && !["user", "admin"].includes(changes.role)) {
    return res.status(400).json({ resultMessage: { vn: "Vai trò không hợp lệ." } });
  }
  if (changes.is_banned !== undefined && typeof changes.is_banned !== "boolean") {
    if (!["true", "false"].includes(changes.is_banned)) {
      return res.status(400).json({ resultMessage: { vn: "Trạng thái khóa không hợp lệ." } });
    }
    changes.is_banned = changes.is_banned === "true";
    req.body.is_banned = changes.is_banned;
  }
  try {
    const { data, error } = await supabaseAdmin.from("users").select("id, role").eq("id", req.params.id).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ resultMessage: { vn: "Không tìm thấy người dùng." } });
    const message = validateAdminAction(req.user, data, changes);
    if (message) return res.status(403).json({ resultMessage: { vn: message } });
    next();
  } catch (error) {
    next(error);
  }
};
