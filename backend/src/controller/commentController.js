import { supabaseAdmin } from "../config/supabase.js";
import {
  getPagination,
  getPaginationResult,
} from "../middlewares/pagination.js";
import { isValidTextarea, sanitizeInput } from "../middlewares/validators.js";
// Tạo comment -----------------------------------------------------------------------------------
export const addComment = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    // Check input
    const cleanContent = sanitizeInput(content);
    if (!isValidTextarea(cleanContent, 1, 1000)) {
      return res.status(400).json({
        resultMessage: {
          en: "Comment must be between 1 and 1000 characters.",
          vn: "Bình luận phải từ 1 đến 1000 ký tự.",
        },
      });
    }

    // Insert và lấy thông tin User qua Alias 'user'
    const { data, error } = await supabaseAdmin
      .from("recipe_comments")
      .insert([{
        recipe_id: recipeId,
        user_id: userId,
        content: cleanContent
      }])
      .select(`
        id, 
        content, 
        created_at, 
        user:users!user_id (id, fullName, avatar_url)
      `)
      .single();

    if (error) {
      console.error("Supabase Error:", error.message);
      throw error;
    }

    return res.status(201).json({
      resultMessage: { en: "Comment added", vn: "Đã thêm bình luận" },
      data: data,
    });
  } catch (err) {
    console.error("System Error:", err);
    return res
      .status(500)
      .json({ resultMessage: { vn: "Lỗi hệ thống khi thêm bình luận." } });
  }
};

// Lấy danh sách comment ----------------------------------------------------------------
export const getComments = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { page, limit } = req.query;

    const { from, to, currentPage, pageSize } = getPagination(page, limit);

    const { data, error, count } = await supabaseAdmin
      .from("recipe_comments")
      .select(
        `
        id, content, created_at, updated_at, user_id,
        user:user_id (id, fullName, avatar_url)
      `,
        { count: "exact" }
      )
      .eq("recipe_id", recipeId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return res.status(200).json({
      resultMessage: {
        en: "Get comments successfully",
        vn: "Lấy danh sách bình luận thành công",
      },
      pagination: getPaginationResult(count, currentPage, pageSize),
      data: data || [],
    });
  } catch (err) {
    return res
      .status(500)
      .json({ resultMessage: { vn: "Lỗi hệ thống khi lấy bình luận." } });
  }
};

// Cập nhật comment ----------------------------------------------------------------------
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    const cleanContent = sanitizeInput(content);
    if (!isValidTextarea(cleanContent, 1, 1000)) {
      return res.status(400).json({
        resultMessage: { vn: "Nội dung bình luận không hợp lệ." },
      });
    }

    // Chỉ chủ comment mới sửa
    const { data, error } = await supabaseAdmin
      .from("recipe_comments")
      .update({ content: cleanContent, updated_at: new Date() })
      .eq("id", commentId)
      .eq("user_id", userId)
      .select(`id, content, updated_at`)
      .single();

    if (error || !data) {
      return res.status(403).json({
        resultMessage: {
          en: "Permission denied or comment not found",
          vn: "Bạn không có quyền hoặc bình luận không tồn tại.",
        },
      });
    }

    return res.status(200).json({
      resultMessage: { en: "Comment updated", vn: "Đã cập nhật bình luận" },
      data: data,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ resultMessage: { vn: "Lỗi hệ thống khi sửa bình luận." } });
  }
};

// Xóa comment ------------------------------------------------------------------------------
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { id: userId, role } = req.user;

    //  Kiểm tra sự tồn tại và quyền
    const { data: exist, error: fetchError } = await supabaseAdmin
      .from("recipe_comments")
      .select("user_id")
      .eq("id", commentId)
      .maybeSingle();

    if (fetchError || !exist) {
      return res
        .status(404)
        .json({ resultMessage: { vn: "Bình luận không tồn tại." } });
    }

    //  Chủ hoặc admin
    if (exist.user_id !== userId && role !== "admin") {
      return res.status(403).json({
        resultMessage: { vn: "Bạn không có quyền xóa bình luận này." },
      });
    }

    const { error } = await supabaseAdmin
      .from("recipe_comments")
      .delete()
      .eq("id", commentId);

    if (error) throw error;

    return res.status(200).json({
      resultMessage: {
        en: "Comment deleted",
        vn: "Đã xóa bình luận thành công",
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ resultMessage: { vn: "Lỗi hệ thống khi xóa bình luận." } });
  }
};
