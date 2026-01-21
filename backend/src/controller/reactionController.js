import { supabaseAdmin } from "../config/supabase.js";

// dislike, like ---------------------------------------------------------------
export const reactRecipe = async (req, res) => {
  try {
    const { id: recipeId } = req.params;
    const userId = req.user.id;
    const { reaction } = req.body; // "like" hoặc "dislike"

    if (!["like", "dislike"].includes(reaction)) {
      return res.status(400).json({
        resultMessage: {
          en: "Invalid reaction type",
          vn: "Loại tương tác không hợp lệ",
        },
      });
    }

    // Kiểm tra xem đã tồn tại reaction chưa
    const { data: exist, error: existError } = await supabaseAdmin
      .from("recipes_reaction")
      .select("reaction")
      .eq("recipe_id", recipeId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existError) throw existError;

    // Chưa có
    if (!exist) {
      const { error: insertError } = await supabaseAdmin
        .from("recipes_reaction")
        .insert([{ recipe_id: recipeId, user_id: userId, reaction: reaction }]);

      if (insertError) throw insertError;
      return res.status(201).json({
        resultMessage: { en: "Reaction added", vn: "Đã thêm tương tác" },
        data: { reaction },
      });
    }

    // Đã có
    if (exist.reaction === reaction) {
      const { error: deleteError } = await supabaseAdmin
        .from("recipes_reaction")
        .delete()
        .eq("recipe_id", recipeId)
        .eq("user_id", userId);

      if (deleteError) throw deleteError;
      return res.status(200).json({
        resultMessage: { en: "Reaction removed", vn: "Đã xóa tương tác" },
        data: { reaction: null },
      });
    }

    // Đổi like <-> dislike
    const { error: updateError } = await supabaseAdmin
      .from("recipes_reaction")
      .update({ reaction: reaction })
      .eq("recipe_id", recipeId)
      .eq("user_id", userId);

    if (updateError) throw updateError;
    return res.status(200).json({
      resultMessage: { en: "Reaction updated", vn: "Đã cập nhật tương tác" },
      data: { reaction },
    });
  } catch (err) {
    console.error("React Recipe Error:", err.message);
    return res.status(500).json({
      resultMessage: { en: "Internal server error", vn: "Lỗi máy chủ nội bộ" },
    });
  }
};

// số lượng dislike, like -------------------------------------------------------
export const getReactions = async (req, res) => {
  try {
    const { id: recipeId } = req.params;

    // Đếm trực tiếp trên Database
    const [likeCount, dislikeCount] = await Promise.all([
      supabaseAdmin
        .from("recipes_reaction")
        .select("*", { count: "exact", head: true })
        .eq("recipe_id", recipeId)
        .eq("reaction", "like"),
      supabaseAdmin
        .from("recipes_reaction")
        .select("*", { count: "exact", head: true })
        .eq("recipe_id", recipeId)
        .eq("reaction", "dislike"),
    ]);

    if (likeCount.error) throw likeCount.error;
    if (dislikeCount.error) throw dislikeCount.error;

    return res.status(200).json({
      resultMessage: {
        en: "Get reactions successful",
        vn: "Lấy lượt tương tác thành công",
      },
      data: {
        likes: likeCount.count || 0,
        dislikes: dislikeCount.count || 0,
      },
    });
  } catch (err) {
    console.error("Get Reactions Error:", err.message);
    return res.status(500).json({
      resultMessage: {
        en: "Could not fetch reactions",
        vn: "Không thể lấy dữ liệu tương tác",
      },
    });
  }
};
