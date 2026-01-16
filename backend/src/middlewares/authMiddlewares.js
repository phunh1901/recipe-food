import { supabaseAdmin } from "../config/supabase.js";
import fs from "fs";

export const verifyToken = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        resultCode: "00091",
        message: "Bạn không có quyền truy cập. Vui lòng đăng nhập.",
      });
    }

    // Thêm Timeout 10s để tránh treo request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabaseAdmin.auth.getUser(token);

      clearTimeout(timeoutId);

      if (authError || !authUser) {
        return res.status(401).json({
          resultCode: "00092",
          message: "Phiên đăng nhập hết hạn hoặc token không hợp lệ.",
          errorDetail: authError?.message
        });
      }


      // 2. TRUY VẤN DATABASE: Lấy role và tình trạng ban mới nhất
      const { data: dbUser, error: dbError } = await supabaseAdmin
        .from("users")
        .select("role, is_banned")
        .eq("id", authUser.id)
        .single();

      if (dbError || !dbUser) {
        console.error("Lỗi lấy thông tin DB:", dbError?.message);
        return res.status(404).json({
          resultCode: "00009",
          message: "Không tìm thấy thông tin người dùng trong hệ thống.",
        });
      }

      if (dbUser.is_banned) {
        return res.status(403).json({
          resultCode: "00098",
          message: "Tài khoản của bạn đã bị khóa bởi quản trị viên.",
        });
      }

      req.user = {
        id: authUser.id,
        email: authUser.email,
        role: dbUser.role,
      };

      next();
    } catch (innerErr) {
      clearTimeout(timeoutId);
      if (innerErr.name === 'AbortError') {
        console.error("LỖI: Kết nối tới Supabase Auth bị quá hạn (Timeout 10s)");
      } else {
        console.error("LỖI KẾT NỐI SUPABASE AUTH:", innerErr.message);
      }
      throw innerErr;
    }
  } catch (err) {
    console.error("Auth Middleware Exception:", err);
    return res.status(500).json({
      resultCode: "00008",
      message: "Lỗi hệ thống khi xác thực token. Chi tiết: " + err.message,
    });
  }
};

export const optionalVerifyToken = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return next();

    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !authUser) return next();

    const { data: dbUser } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", authUser.id)
      .maybeSingle();

    if (dbUser) {
      req.user = {
        id: authUser.id,
        email: authUser.email,
        role: dbUser.role,
      };
    }
    next();
  } catch (err) {
    next();
  }
};

export const verifyAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin access required" });

  next();
};

export const isSuperAdmin = (req, res, next) => {
  const SUPER_ADMIN_ID = process.env.SUPER_ADMIN_ID;

  if (req.user && req.user.id === SUPER_ADMIN_ID) {
    next();
  } else {
    return res.status(403).json({
      resultCode: "00096",
      message:
        "Truy cập bị từ chối. Chỉ Quản trị viên tối cao mới có quyền này.",
    });
  }
};
