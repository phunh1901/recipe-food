import { supabaseAdmin } from "../config/supabase.js";
import {
  getPagination,
  getPaginationResult,
} from "../middlewares/pagination.js";

// xem các thông báo ----------------------------------------------------------------
export const getMyNotifications = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const userId = req.user.id;
    const { from, to, currentPage, pageSize } = getPagination(page, limit);

    const { data, error, count } = await supabaseAdmin
      .from("notifications")
      .select(
        `
        *,
        sender:sender_id (id, fullName, avatar_url)
      `,
        { count: "exact" }
      )
      .eq("receiver_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return res.status(200).json({
      resultMessage: { en: "Success", vn: "Lấy thông báo thành công" },
      pagination: getPaginationResult(count, currentPage, pageSize),
      data,
    });
  } catch (err) {
    return res.status(500).json({ resultMessage: { vn: "Lỗi hệ thống." } });
  }
};

// đánh dấu các thông báo đã đọc -------------------------------------------------------
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id: paramId } = req.params;
    const { id: bodyId } = req.body;
    const userId = req.user.id;


    const targetId = paramId || bodyId;

    let query = supabaseAdmin
      .from("notifications")
      .update({ is_read: true })
      .eq("receiver_id", userId);

    if (targetId && targetId !== "all") {
      query = query.eq("id", targetId);
    }

    const { error } = await query;
    if (error) throw error;

    return res.status(200).json({
      resultMessage: { en: "Marked as read", vn: "Đã đánh dấu đã đọc" },
    });
  } catch (err) {
    console.error("markNotificationAsRead Error:", err.message);
    return res.status(500).json({ resultMessage: { vn: "Lỗi hệ thống." } });
  }
};

// Xóa thông báo 1 hoặc all -------------------------------------------------
export const deleteNotification = async (req, res) => {
  try {
    const { id: paramId } = req.params;
    const { id: bodyId } = req.body;
    const userId = req.user.id;

    const targetId = paramId || bodyId;

    let query = supabaseAdmin
      .from("notifications")
      .delete()
      .eq("receiver_id", userId);

    if (targetId && targetId !== "all") {
      query = query.eq("id", targetId);
    }

    const { error } = await query;

    if (error) throw error;

    return res.status(200).json({
      resultMessage: {
        en: targetId === "all" || !targetId ? "All notifications cleared" : "Notification deleted",
        vn: targetId === "all" || !targetId ? "Đã dọn sạch thông báo" : "Đã xóa thông báo",
      },
    });
  } catch (err) {
    console.error("Delete Notification Error:", err.message);
    return res.status(500).json({
      resultMessage: {
        en: "Internal server error",
        vn: "Lỗi hệ thống khi xóa thông báo",
      },
    });
  }
};
