import { supabaseAdmin, createAuthClient } from "../config/supabase.js";
import { REGEX_PATTERNS, isValid } from "../middlewares/validators.js";

// API đăng ký -------------------------------------------------------------------
export const register = async (req, res) => {
  const { email, password, fullName, birthdate, gender } = req.body || {};

  const trimmedEmail = (typeof email === "string" ? email.trim().toLowerCase() : "");
  const trimmedName = (typeof fullName === "string" ? fullName.trim() : "");

  // 1. Kiểm tra rỗng
  if (
    ![trimmedEmail, password, trimmedName, birthdate, gender].every(Boolean)
  ) {
    return res.status(400).json({
      resultMessage: {
        en: "Missing required fields!",
        vn: "Vui lòng cung cấp đầy đủ thông tin!",
      },
    });
  }

  // 2. Sử dụng Regex chung để kiểm tra
  if (!isValid(trimmedEmail, REGEX_PATTERNS.EMAIL)) {
    return res.status(400).json({
      resultMessage: {
        en: "Invalid email format!",
        vn: "Định dạng email không hợp lệ!",
      },
    });
  }

  if (!isValid(trimmedName, REGEX_PATTERNS.FULL_NAME)) {
    return res.status(400).json({
      resultMessage: {
        en: "Name must be 2-50 characters and contain only letters.",
        vn: "Tên phải từ 2-50 ký tự và không chứa ký tự đặc biệt.",
      },
    });
  }

  if (!isValid(password, REGEX_PATTERNS.PASSWORD)) {
    return res.status(400).json({
      resultMessage: {
        en: "Password must be 6-20 characters.",
        vn: "Mật khẩu phải từ 6-20 ký tự.",
      },
    });
  }
  try {
    // Đăng ký vào Auth của Supabase
    const { data: authData, error: authError } = await createAuthClient().auth.signUp({
      email: trimmedEmail,
      password: password,
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return res.status(400).json({
          resultMessage: {
            en: "An account with this email already exists.",
            vn: "Một tài khoản với địa chỉ email này đã tồn tại.",
          },
        });
      }
      return res.status(400).json({
        resultMessage: {
          en: authError.message,
          vn: "Lỗi đăng ký tài khoản hệ thống.",
        },
      });
    }

    const userId = authData.user.id;

    // Insert vào bảng users
    const { error: profileError } = await supabaseAdmin.from("users").insert({
      id: userId,
      email: trimmedEmail,
      fullName: trimmedName,
      gender: gender,
      birthdate: birthdate,
      avatar_url: null,
      role: "user",
    });

    if (profileError) {
      console.error("Profile Insert Error:", profileError);

      // ROLLBACK: Xóa user lỗi trong auth
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      } catch (deleteError) {
        console.error("Critical: Failed to rollback auth user:", deleteError);
      }

      return res.status(500).json({
        resultMessage: {
          en: "Error creating user profile.",
          vn: "Đã xảy ra lỗi khi tạo hồ sơ người dùng.",
        },
      });
    }

    // 201 thành công
    return res.status(201).json({
      resultMessage: {
        en: "Registration successful. Please check your email for verification.",
        vn: "Bạn đã đăng ký thành công. Vui lòng kiểm tra email để xác minh.",
      },
      data: {
        userId: userId,
        email: trimmedEmail,
      },
    });
  } catch (err) {
    console.error("Unexpected Error:", err);
    return res.status(500).json({
      resultMessage: {
        en: "Internal server error.",
        vn: "Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại sau.",
      },
    });
  }
};

// API đăng nhập -------------------------------------------------------------------------------------------
export const login = async (req, res) => {
  const { email, password } = req.body || {};
  const trimmedEmail = (typeof email === "string" ? email.trim().toLowerCase() : "");

  // 1. Validation
  if (!trimmedEmail || !password) {
    return res.status(400).json({
      resultMessage: {
        en: "Missing email or password!",
        vn: "Vui lòng nhập email và mật khẩu!",
      },
    });
  }

  try {
    // Auth qua Supabase
    const { data, error } = await createAuthClient().auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (error) {
      const isUnconfirmed = error.message.includes("Email not confirmed");
      return res.status(isUnconfirmed ? 403 : 401).json({
        resultMessage: {
          vn: isUnconfirmed
            ? "Email chưa được xác minh!"
            : "Email hoặc mật khẩu không đúng.",
        },
      });
    }

    // Lấy Role & Ban status
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from("users")
      .select("role, is_banned")
      .eq("id", data.user.id)
      .single();

    if (dbError || !dbUser) throw dbError || new Error("Missing user profile");

    if (dbUser?.is_banned) {
      const { error } = await supabaseAdmin.auth.admin.signOut(data.session.access_token, "local");
      if (error) throw error;
      return res.status(403).json({
        resultMessage: {
          en: "Account is banned.",
          vn: "Tài khoản của bạn đã bị khóa.",
        },
      });
    }

    return res.status(200).json({
      resultMessage: { en: "Login successful", vn: "Đăng nhập thành công" },
      user: { ...data.user, role: dbUser.role, isSuperAdmin: data.user.id === process.env.SUPER_ADMIN_ID },
      session: data.session,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ resultMessage: { en: "Internal error", vn: "Lỗi máy chủ." } });
  }
};

// API đăng xuất ------------------------------------------------------------------------------
export const logout = async (req, res) => {
  try {
    const { error } = await supabaseAdmin.auth.admin.signOut(req.token, "local");
    if (error) throw error;
    return res.status(200).json({
      resultMessage: { en: "Logout successful", vn: "Đăng xuất thành công" },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ resultMessage: { vn: "Lỗi khi đăng xuất." } });
  }
};

// API quên mật khẩu -------------------------------------------------------------------------
export const forgotPassword = async (req, res) => {
  const { email } = req.body || {};
  const trimmedEmail = (typeof email === "string" ? email.trim().toLowerCase() : "");

  if (!isValid(trimmedEmail, REGEX_PATTERNS.EMAIL)) {
    return res.status(400).json({
      resultMessage: {
        en: "Invalid email format.",
        vn: "Định dạng email không hợp lệ.",
      },
    });
  }

  try {
    const { error } = await createAuthClient().auth.resetPasswordForEmail(trimmedEmail, { redirectTo: `${process.env.FRONTEND_URL || "http://localhost:5173"}/update-password` });
    if (error) throw error;

    return res.status(200).json({
      resultMessage: {
        en: "Reset link sent!",
        vn: "Link đặt lại mật khẩu đã được gửi qua email.",
      },
    });
  } catch (err) {
    return res
      .status(400)
      .json({ resultMessage: { vn: "Lỗi: " + err.message } });
  }
};

// Cấp quyền Admin ----------------------------------------------------------------------
export const promoteToAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabaseAdmin
      .from("users")
      .update({ role: "admin", updated_at: new Date() })
      .eq("id", id);

    if (error) throw error;
    return res.status(200).json({
      resultMessage: {
        en: "Promoted to Admin",
        vn: `Đã cấp quyền Admin cho ID: ${id}`,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ resultMessage: { vn: "Lỗi khi cấp quyền." } });
  }
};

// Hạ quyền admin

export const demoteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const SUPER_ADMIN_ID = process.env.SUPER_ADMIN_ID;

    // Bảo vệ Super Admin
    if (id === SUPER_ADMIN_ID) {
      return res.status(403).json({
        resultMessage: {
          en: "You cannot demote the Super Admin.",
          vn: "Bạn không thể hạ quyền của Super Admin hệ thống.",
        },
      });
    }

    // Không cho phép tự hạ quyền chính mình
    if (id === req.user.id) {
      return res.status(400).json({
        resultMessage: {
          en: "You cannot demote yourself.",
          vn: "Bạn không thể tự hạ quyền của chính mình.",
        },
      });
    }

    const { error } = await supabaseAdmin
      .from("users")
      .update({ role: "user", updated_at: new Date() })
      .eq("id", id);

    if (error) throw error;

    return res.status(200).json({
      resultMessage: {
        en: "Admin demoted to User successfully.",
        vn: `Đã hạ quyền Admin thành công cho tài khoản ID: ${id}`,
      },
    });
  } catch (err) {
    console.error("Demote Error:", err.message);
    return res.status(500).json({
      resultMessage: {
        en: "System error during demotion.",
        vn: "Lỗi hệ thống khi hạ quyền.",
      },
    });
  }
};

// Khóa tài khoản ------------------------------------------------------------
export const banUser = async (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) {
    return res.status(400).json({
      resultMessage: { vn: "Bạn không thể tự khóa chính mình." },
    });
  }

  try {
    const { error } = await supabaseAdmin
      .from("users")
      .update({ is_banned: true, updated_at: new Date() })
      .eq("id", id);

    if (error) throw error;

    return res.status(200).json({
      resultMessage: { en: "User banned", vn: "Tài khoản đã được khóa." },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ resultMessage: { vn: "Lỗi khi khóa người dùng." } });
  }
};

// Mở khóa tài khoản ---------------------------------------------------------------
export const unbanUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        resultMessage: {
          en: "User ID is required.",
          vn: "Thiếu ID người dùng.",
        },
      });
    }

    const { error } = await supabaseAdmin
      .from("users")
      .update({ is_banned: false, updated_at: new Date() })
      .eq("id", id);

    if (error) throw error;

    return res.status(200).json({
      resultMessage: {
        en: "User has been unbanned successfully.",
        vn: "Đã mở khóa tài khoản thành công.",
      },
    });
  } catch (err) {
    console.error("Unban Error:", err.message);
    return res.status(500).json({
      resultMessage: {
        en: "Internal server error.",
        vn: "Lỗi hệ thống khi mở khóa người dùng.",
      },
    });
  }
};
