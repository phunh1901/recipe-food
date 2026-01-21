import { supabaseAdmin } from "../config/supabase.js";
import {
  getPagination,
  getPaginationResult,
} from "../middlewares/pagination.js";
// follow/unfollow ------------------------------------------------------------
export const toggleFollow = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { followingId } = req.params;
    const followerName = req.user.fullName || "Ai đó";

    // Kiểm tra không cho tự follow chính mình
    if (followerId === followingId) {
      return res.status(400).json({
        resultMessage: {
          en: "You cannot follow yourself.",
          vn: "Bạn không thể theo dõi chính mình.",
        },
      });
    }

    // Kiểm tra trạng thái follow hiện tại
    const { data: exist, error: fetchError } = await supabaseAdmin
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    //  Xử lý logic Toggle
    if (exist) {
      // Đã follow
      const { error: deleteError } = await supabaseAdmin
        .from("follows")
        .delete()
        .eq("id", exist.id);

      if (deleteError) throw deleteError;

      return res.status(200).json({
        resultMessage: { en: "Unfollowed successfully", vn: "Đã bỏ theo dõi." },
        data: { isFollowing: false },
      });
    } else {
      // Chưa follow
      const { error: insertError } = await supabaseAdmin
        .from("follows")
        .insert([{ follower_id: followerId, following_id: followingId }]);

      if (insertError) throw insertError;

      // Thông báo
      const notificationData = {
        receiver_id: followingId,
        sender_id: followerId,
        type: "follow",
        related_id: followerId, // id người follow
        message_vn: `${followerName} đã bắt đầu theo dõi bạn!`,
        message_en: `${followerName} started following you!`,
      };

      // Ghi thông báo
      const { error: notifyError } = await supabaseAdmin
        .from("notifications")
        .insert([notificationData]);

      if (notifyError)
        console.error("Notification Error (Follow):", notifyError.message);

      return res.status(201).json({
        resultMessage: {
          en: "Followed successfully",
          vn: "Đã theo dõi người dùng này.",
        },
        data: { isFollowing: true },
      });
    }
  } catch (err) {
    console.error("Toggle Follow Error:", err.message);
    return res.status(500).json({
      resultMessage: { en: "Internal server error", vn: "Lỗi hệ thống." },
    });
  }
};
// Lấy danh sách những người đang theo dõi mình --------------------------------------------
export const getMyFollowers = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { id: currentUserId } = req.user;
    // id người khác || mình
    const targetUserId = req.params.userId || currentUserId;

    const { from, to, currentPage, pageSize } = getPagination(page, limit);

    const { data, error, count } = await supabaseAdmin
      .from("follows")
      .select(
        `
        created_at,
        follower:follower_id (id, fullName, avatar_url, role)
      `,
        { count: "exact" }
      )
      .eq("following_id", targetUserId)
      .range(from, to);

    if (error) throw error;

    // Có follow hay không
    const formattedData = await Promise.all(
      data.map(async (item) => {
        const u = item.follower;
        let isFollowing = false;

        // Fetch multiple stats in parallel for efficiency
        const [followCheckRes, recipeStatsRes] = await Promise.all([
          currentUserId
            ? supabaseAdmin
              .from("follows")
              .select("id")
              .eq("follower_id", currentUserId)
              .eq("following_id", u.id)
              .maybeSingle()
            : Promise.resolve({ data: null }),
          supabaseAdmin
            .from("recipes")
            .select("id")
            .eq("user_id", u.id)
            .eq("status", "approved")
            .eq("visibility", "public"),
        ]);

        isFollowing = !!followCheckRes.data;
        const recipeIds = recipeStatsRes.data?.map((r) => r.id) || [];
        const recipeCount = recipeIds.length;
        let totalFavorites = 0;

        if (recipeCount > 0) {
          const { count: favsCount } = await supabaseAdmin
            .from("favorites")
            .select("id", { count: "exact", head: true })
            .in("recipe_id", recipeIds);
          totalFavorites = favsCount || 0;
        }

        return { ...u, isFollowing, recipeCount, totalFavorites };
      })
    );

    return res.status(200).json({
      resultMessage: {
        en: "Get followers successfully",
        vn: "Lấy danh sách người theo dõi thành công",
      },
      pagination: getPaginationResult(count, currentPage, pageSize),
      data: formattedData,
    });
  } catch (err) {
    return res.status(500).json({ resultMessage: { vn: "Lỗi hệ thống." } });
  }
};

// Lấy danh sách những người mình đang theo dõi -----------------------------------------------------------
export const getMyFollowing = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { id: currentUserId } = req.user;
    const targetUserId = req.params.userId || currentUserId;

    const { from, to, currentPage, pageSize } = getPagination(page, limit);

    const { data, error, count } = await supabaseAdmin

      .from("follows")
      .select(
        `
        created_at,
        following:following_id (id, fullName, avatar_url, role)
      `,
        { count: "exact" }
      )
      .eq("follower_id", targetUserId)
      .range(from, to);

    if (error) throw error;

    // Kiểm tra follow (luôn true)
    const formattedData = await Promise.all(
      data.map(async (item) => {
        const u = item.following;
        let isFollowing = true; // Danh sách follow

        // Fetch stats in parallel
        const [followCheckRes, recipeStatsRes] = await Promise.all([
          targetUserId !== currentUserId
            ? supabaseAdmin
              .from("follows")
              .select("id")
              .eq("follower_id", currentUserId)
              .eq("following_id", u.id)
              .maybeSingle()
            : Promise.resolve({ data: { exists: true } }), // Dummy data if same user
          supabaseAdmin
            .from("recipes")
            .select("id")
            .eq("user_id", u.id)
            .eq("status", "approved")
            .eq("visibility", "public"),
        ]);

        if (targetUserId !== currentUserId) {
          isFollowing = !!followCheckRes.data;
        }

        const recipeIds = recipeStatsRes.data?.map((r) => r.id) || [];
        const recipeCount = recipeIds.length;
        let totalFavorites = 0;

        if (recipeCount > 0) {
          const { count: favsCount } = await supabaseAdmin
            .from("favorites")
            .select("id", { count: "exact", head: true })
            .in("recipe_id", recipeIds);
          totalFavorites = favsCount || 0;
        }

        return { ...u, isFollowing, recipeCount, totalFavorites };
      })
    );

    return res.status(200).json({
      resultMessage: {
        en: "Get following successfully",
        vn: "Lấy danh sách đang theo dõi thành công",
      },
      pagination: getPaginationResult(count, currentPage, pageSize),
      data: formattedData,
    });
  } catch (err) {
    return res.status(500).json({ resultMessage: { vn: "Lỗi hệ thống." } });
  }
};
