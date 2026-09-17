import { randomUUID } from "node:crypto";
import { supabaseAdmin, createAuthClient } from "../config/supabase.js";
import {
  getPagination,
  getPaginationResult,
} from "../middlewares/pagination.js";
import { removeStoredImage } from "../config/storage.js";
import { isValid, REGEX_PATTERNS } from "../middlewares/validators.js";

// Xem tài khoản cá nhân của mình ------------------------------------------
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        resultMessage: {
          en: "Unauthorized access.",
          vn: "Truy cập không hợp lệ.",
        },
      });
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select(
        "id, email, fullName, birthdate, gender, avatar_url, role, created_at"
      )
      .eq("id", userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        resultMessage: {
          en: "User profile not found.",
          vn: "Không tìm thấy thông tin người dùng.",
        },
      });
    }

    const [followerCount, followingCount] = await Promise.all([
      supabaseAdmin
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("following_id", userId),
      supabaseAdmin
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("follower_id", userId),
    ]);

    return res.status(200).json({
      resultMessage: {
        en: "Get profile successful",
        vn: "Lấy thông tin cá nhân thành công",
      },
      data: {
        ...user,
        isSuperAdmin: userId === process.env.SUPER_ADMIN_ID,
        followersCount: followerCount.count || 0,
        followingCount: followingCount.count || 0,
      },
    });
  } catch (err) {
    console.error("getMyProfile Error:", err.message);
    return res.status(500).json({
      resultMessage: {
        en: "Internal server error.",
        vn: "Lỗi máy chủ nội bộ.",
      },
    });
  }
};

// Xem tài khoản cá nhân của các user khác cho role user ----------------
export const getUserPublicProfile = async (req, res) => {
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

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("fullName, avatar_url, birthdate, gender")
      .eq("id", id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        resultMessage: {
          en: "User not found.",
          vn: "Người dùng không tồn tại.",
        },
      });
    }

    const currentUserId = req.user?.id;

    // Fetch stats and isFollowing status
    const [followerCount, followingCount, isFollowingCheck] = await Promise.all([
      supabaseAdmin
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("following_id", id),
      supabaseAdmin
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("follower_id", id),
      currentUserId
        ? supabaseAdmin
          .from("follows")
          .select("id")
          .eq("follower_id", currentUserId)
          .eq("following_id", id)
          .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    return res.status(200).json({
      resultMessage: {
        en: "Get public profile successful",
        vn: "Lấy thông tin người dùng thành công",
      },
      data: {
        ...user,
        id, // Ensure ID is returned
        followersCount: followerCount.count || 0,
        followingCount: followingCount.count || 0,
        isFollowing: !!isFollowingCheck.data,
      },
    });
  } catch (err) {
    console.error("getUserPublicProfile Error:", err.message);
    return res.status(500).json({
      resultMessage: { en: "System error.", vn: "Lỗi hệ thống." },
    });
  }
};

//  xóa tài khoản cá nhân
export const selfDeleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    if (userId === process.env.SUPER_ADMIN_ID) {
      return res.status(403).json({ resultMessage: { vn: "Không thể xóa tài khoản quản trị viên tối cao." } });
    }

    // 1. Xóa tất cả dữ liệu liên quan (CASCADE DELETE)
    console.log(`Starting cascade delete for user ${userId}`);

    await Promise.all([
      supabaseAdmin.from("follows").delete().eq("follower_id", userId),
      supabaseAdmin.from("follows").delete().eq("following_id", userId),
      supabaseAdmin.from("likes").delete().eq("user_id", userId),
      supabaseAdmin.from("comments").delete().eq("user_id", userId),
      supabaseAdmin.from("notifications").delete().eq("user_id", userId),
      supabaseAdmin.from("recipes").delete().eq("user_id", userId),
    ]);

    console.log(`Cascade delete completed for user ${userId}`);

    // 2. Xóa user từ database
    const { error: dbError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", userId);

    if (dbError) {
      console.error("Database deletion error:", dbError);
      throw new Error("Failed to delete user from database");
    }

    // 3. Xóa từ Auth system
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      console.error("Auth deletion warning:", authError);
      // Database đã xóa, nên vẫn return success nhưng log warning
    }

    console.log(`User ${userId} successfully deleted`);

    return res.status(200).json({
      resultMessage: {
        vn: "Tài khoản của bạn đã được xóa hoàn toàn.",
        en: "Your account has been permanently deleted.",
      },
    });
  } catch (err) {
    console.error("selfDeleteAccount Error:", err.message);
    return res.status(500).json({
      resultMessage: {
        vn: "Đã xảy ra lỗi khi xóa tài khoản. Vui lòng thử lại.",
        en: "An error occurred while deleting your account. Please try again.",
      },
    });
  }
};

// đổi mật khẩu ----------------------------------------------------------------
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    // 1. Kiểm tra đầu vào rỗng
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        resultMessage: {
          en: "Please provide all required fields.",
          vn: "Vui lòng cung cấp đầy đủ các trường bắt buộc.",
        },
      });
    }

    // 2. Validate định dạng mật khẩu mới
    if (!isValid(newPassword, REGEX_PATTERNS.PASSWORD)) {
      return res.status(400).json({
        resultMessage: {
          en: "New password must be 6-20 characters.",
          vn: "Mật khẩu mới phải từ 6-20 ký tự.",
        },
      });
    }

    // 3. Kiểm tra khớp mật khẩu
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        resultMessage: {
          en: "Confirm password does not match.",
          vn: "Mật khẩu xác thực không khớp với mật khẩu mới.",
        },
      });
    }

    const authClient = createAuthClient();
    const { error: signInError } = await authClient.auth.signInWithPassword({
      email: req.user.email,
      password: oldPassword,
    });

    if (signInError) {
      return res.status(400).json({
        resultMessage: {
          en: "Incorrect old password.",
          vn: "Mật khẩu cũ không chính xác.",
        },
      });
    }

    const { error: updateError } = await authClient.auth.updateUser({
      password: newPassword,
    });

    if (updateError) throw updateError;

    return res.status(200).json({
      resultMessage: {
        en: "Password changed successfully.",
        vn: "Đổi mật khẩu thành công.",
      },
    });
  } catch (err) {
    return res.status(500).json({
      resultMessage: {
        en: "Internal server error.",
        vn: "Lỗi hệ thống khi đổi mật khẩu.",
      },
    });
  }
};

// update tài khoản cá nhân
export const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, birthdate, gender } = req.body;

    // Kiểm tra nếu hoàn toàn không gửi gì lên
    if (!fullName && !birthdate && !gender && !req.file) {
      return res.status(400).json({
        resultMessage: {
          en: "Nothing to update.",
          vn: "Không có thông tin nào để cập nhật.",
        },
      });
    }

    const updateData = { updated_at: new Date() };

    // Validate Full Name
    if (fullName) {
      const trimmedName = fullName.trim();
      if (!isValid(trimmedName, REGEX_PATTERNS.FULL_NAME)) {
        return res.status(400).json({
          resultMessage: {
            en: "Invalid name format (2-50 characters, no special characters).",
            vn: "Tên không hợp lệ (2-50 ký tự, không chứa ký tự đặc biệt).",
          },
        });
      }
      updateData.fullName = trimmedName;
    }

    if (birthdate) updateData.birthdate = birthdate;
    if (gender) updateData.gender = gender;

    // Xử lý File Ảnh
    if (req.file) {
      const ext = { "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp" }[req.file.mimetype];
      const filePath = `${userId}/avatar_${randomUUID()}.${ext}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("avatar")
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        return res.status(400).json({
          resultMessage: {
            en: "Failed to upload image.",
            vn: "Không thể tải ảnh lên.",
          },
          error: uploadError.message,
        });
      }

      const { data: urlData } = supabaseAdmin.storage
        .from("avatar")
        .getPublicUrl(filePath);

      updateData.avatar_url = urlData.publicUrl;
    }

    // Cập nhật Database và Lấy dữ liệu mới nhất trả về
    const { data: updatedUser, error } = await supabaseAdmin
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select(
        "id, email, fullName, birthdate, gender, avatar_url, role, updated_at"
      )
      .single();

    if (error) {
      return res.status(400).json({
        resultMessage: {
          en: "Update failed.",
          vn: "Cập nhật thông tin thất bại.",
        },
      });
    }

    return res.status(200).json({
      resultMessage: {
        en: "Profile updated successfully.",
        vn: "Thông tin cá nhân của bạn đã được thay đổi thành công.",
      },
      data: updatedUser, // Trả về object user hoàn chỉnh thay vì chỉ mảng updateData
    });
  } catch (err) {
    console.error("Update User Error:", err);
    return res.status(500).json({
      resultMessage: {
        en: "Internal server error.",
        vn: "Lỗi máy chủ nội bộ.",
      },
    });
  }
};

// Lấy tất cả danh sách người dùng cho role admin -----------------------------------------------------

export const getAllUsers = async (req, res) => {
  try {
    // 1. Lấy chỉ số phân trang từ helper
    const { from, to, currentPage, pageSize } = getPagination(
      req.query.page,
      req.query.limit
    );

    // 2. Truy vấn: Chỉ lấy các cột cần thiết cho danh sách quản trị
    const {
      data: users,
      error,
      count,
    } = await supabaseAdmin
      .from("users")
      .select("id, email, fullName, role, is_banned, gender, created_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    // 3. Phản hồi chuẩn hóa
    return res.status(200).json({
      resultMessage: {
        en: "Get user list successfully",
        vn: "Lấy danh sách người dùng thành công",
      },
      pagination: getPaginationResult(count, currentPage, pageSize),
      data: users,
    });
  } catch (err) {
    console.error("getAllUsers Error:", err.message);
    return res.status(500).json({
      resultMessage: {
        en: "Internal server error.",
        vn: "Lỗi hệ thống khi lấy danh sách người dùng.",
      },
    });
  }
};

// Xem chi tiết người dùng cho role admin -----------------------------------------
export const getUserById = async (req, res) => {
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

    // Liệt kê chi tiết các cột muốn hiển thị ở trang Admin Detail
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select(
        "id, email, fullName, birthdate, gender, avatar_url, role, is_banned, created_at, updated_at"
      )
      .eq("id", id)
      .maybeSingle();

    if (error || !user) {
      return res.status(404).json({
        resultMessage: {
          en: "User not found.",
          vn: "Không tìm thấy người dùng này.",
        },
      });
    }

    return res.status(200).json({
      resultMessage: {
        en: "Get user details successfully",
        vn: "Lấy chi tiết người dùng thành công",
      },
      data: user,
    });
  } catch (err) {
    console.error("getUserById Error:", err.message);
    return res.status(500).json({
      resultMessage: {
        en: "Internal server error.",
        vn: "Lỗi hệ thống khi lấy thông tin người dùng.",
      },
    });
  }
};

// Admin xóa người dùng ---------------------------------------------------
export const adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Chống tự xóa
    if (id === req.user.id) {
      return res.status(400).json({
        resultMessage: {
          en: "You cannot delete yourself using Admin rights.",
          vn: "Bạn không thể xóa chính mình bằng quyền Admin.",
        },
      });
    }

    // 2. Xóa dữ liệu trong bảng users trước (Bảng con/liên kết)
    const { error: dbError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", id);

    if (dbError) throw dbError;

    // 3. Xóa tài khoản trong hệ thống Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) {
      console.error("Lỗi xóa Auth:", authError);
      // Lưu ý: Lúc này DB đã mất user nhưng Auth vẫn còn, Admin có thể phải xóa tay trong dashboard nếu cần
    }

    return res.status(200).json({
      resultMessage: {
        en: "User has been permanently deleted from the system.",
        vn: "Đã xóa vĩnh viễn người dùng khỏi hệ thống.",
      },
    });
  } catch (err) {
    console.error("adminDeleteUser Error:", err.message);
    return res.status(500).json({
      resultMessage: {
        en: "Error deleting user.",
        vn: "Lỗi khi thực hiện xóa người dùng.",
      },
    });
  }
};

// Tìm kiếm user theo tên ------------------------------------------------------
export const searchUsers = async (req, res) => {
  try {
    const { name, page, limit } = req.query;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        resultMessage: {
          en: "Please provide a name to search.",
          vn: "Vui lòng nhập tên cần tìm.",
        },
      });
    }

    const { from, to, currentPage, pageSize } = getPagination(page, limit);

    // Chỉ lấy các cột cần thiết cho việc hiển thị kết quả tìm kiếm
    const {
      data: users,
      error,
      count,
    } = await supabaseAdmin
      .from("users")
      .select("id, fullName, avatar_url, created_at", {
        count: "exact",
      })
      .ilike("fullName", `%${name.trim()}%`)
      .order("fullName", { ascending: true })
      .range(from, to);

    if (error) throw error;

    return res.status(200).json({
      resultMessage: {
        en: "Search users successfully",
        vn: "Tìm kiếm người dùng thành công",
      },
      pagination: getPaginationResult(count, currentPage, pageSize),
      data: users,
    });
  } catch (err) {
    console.error("searchUsers Error:", err.message);
    return res.status(500).json({
      resultMessage: {
        en: "Search failed",
        vn: "Lỗi khi tìm kiếm người dùng.",
      },
    });
  }
};

// Admin sửa thông tin user -------------------------------------------------------
export const adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, birthdate, gender, is_banned, role } = req.body || {};

    const updateData = { updated_at: new Date() };

    // Banning logic
    if (is_banned !== undefined) updateData.is_banned = is_banned;

    // Role changing logic
    if (role && ["user", "admin"].includes(role)) {
      updateData.role = role;
    }

    if (birthdate) updateData.birthdate = birthdate;
    if (gender) updateData.gender = gender;

    // 1. Kiểm tra fullName bằng Regex
    if (fullName) {
      const trimmedName = fullName.trim();
      if (!isValid(trimmedName, REGEX_PATTERNS.FULL_NAME)) {
        return res.status(400).json({
          resultMessage: {
            en: "Invalid name format.",
            vn: "Tên không hợp lệ (2-50 ký tự, không chứa ký tự đặc biệt).",
          },
        });
      }
      updateData.fullName = trimmedName;
    }

    if (birthdate) updateData.birthdate = birthdate;
    if (gender) updateData.gender = gender;

    // 2. Xử lý File Ảnh (Avatar)
    if (req.file) {
      const ext = { "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp" }[req.file.mimetype];
      const filePath = `${id}/avatar_${randomUUID()}.${ext}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("avatar")
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        return res.status(400).json({
          resultMessage: { en: "Image upload failed", vn: "Lỗi tải ảnh lên." },
          detail: uploadError.message,
        });
      }

      const { data } = supabaseAdmin.storage
        .from("avatar")
        .getPublicUrl(filePath);
      updateData.avatar_url = data.publicUrl;
    }

    // 3. Kiểm tra xem có gì để update không
    if (Object.keys(updateData).length <= 1) {
      return res.status(400).json({
        resultMessage: {
          en: "No data to update.",
          vn: "Không có dữ liệu mới để cập nhật.",
        },
      });
    }

    // 4. Update và Select các cột an toàn
    const { data: updatedUser, error: dbError } = await supabaseAdmin
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select(
        "id, email, fullName, birthdate, gender, avatar_url, role, is_banned, updated_at"
      )
      .single();

    if (dbError) throw dbError;

    return res.status(200).json({
      resultMessage: {
        en: "User updated successfully",
        vn: "Cập nhật thông tin thành công.",
      },
      data: updatedUser,
    });
  } catch (err) {
    console.error("adminUpdateUser Error:", err.message);
    return res.status(500).json({
      resultMessage: { en: "Internal server error", vn: "Lỗi máy chủ nội bộ." },
    });
  }
};
// Thống kê dành cho Admin -------------------------------------------------------
export const getAdminStats = async (req, res) => {
  try {
    // 1. Đếm người dùng
    const { count: totalUsers } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true });

    const { count: bannedUsers } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("is_banned", true);

    // 2. Đếm công thức theo trạng thái
    const { count: publicRecipes } = await supabaseAdmin
      .from("recipes")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")
      .eq("visibility", "public");

    const { count: pendingRecipes } = await supabaseAdmin
      .from("recipes")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const { count: rejectedRecipes } = await supabaseAdmin
      .from("recipes")
      .select("*", { count: "exact", head: true })
      .eq("status", "rejected");

    // 3. Đếm danh mục
    const { count: totalCategories } = await supabaseAdmin
      .from("categories")
      .select("*", { count: "exact", head: true });

    return res.status(200).json({
      resultMessage: {
        en: "Get admin statistics successfully",
        vn: "Lấy thống kê hệ thống thành công",
      },
      data: {
        users: {
          total: totalUsers || 0,
          banned: bannedUsers || 0,
        },
        recipes: {
          public: publicRecipes || 0,
          pending: pendingRecipes || 0,
          rejected: rejectedRecipes || 0,
        },
        categories: totalCategories || 0,
      },
    });
  } catch (err) {
    console.error("getAdminStats Error:", err.message);
    return res.status(500).json({
      resultMessage: {
        en: "Internal server error.",
        vn: "Lỗi hệ thống khi xóa ảnh đại diện.",
      },
    });
  }
};
// Delete avatar ----------------------------------------------------------------
export const deleteAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current avatar URL from database
    const { data: userData, error: getUserError } = await supabaseAdmin
      .from('users')
      .select('avatar_url')
      .eq('id', userId)
      .single();

    if (getUserError) {
      return res.status(404).json({
        resultMessage: {
          en: 'User not found.',
          vn: 'Không tìm thấy người dùng.',
        },
      });
    }

    // If there's an avatar, delete it from storage
    await removeStoredImage(userData.avatar_url, "avatar", userId);

    // Update database to remove avatar_url
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ avatar_url: null })
      .eq('id', userId);

    if (updateError) {
      return res.status(500).json({
        resultMessage: {
          en: 'Failed to update user avatar.',
          vn: 'Không thể cập nhật ảnh đại diện.',
        },
      });
    }

    return res.status(200).json({
      resultMessage: {
        en: 'Avatar deleted successfully.',
        vn: 'Đã xóa ảnh đại diện thành công.',
      },
    });
  } catch (err) {
    console.error('deleteAvatar Error:', err.message);
    return res.status(500).json({
      resultMessage: {
        en: 'Internal server error.',
        vn: 'Lỗi hệ thống khi xóa ảnh đại diện.',
      },
    });
  }
};
