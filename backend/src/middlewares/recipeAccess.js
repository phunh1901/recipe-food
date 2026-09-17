import { supabaseAdmin } from "../config/supabase.js";

export const canReadRecipe = (recipe, user) => Boolean(recipe && (
  (recipe.visibility === "public" && recipe.status === "approved") ||
  (user && (recipe.user_id === user.id || user.role === "admin"))
));

export const requireRecipeAccess = async (req, res, next) => {
  try {
    const id = req.params.recipeId || req.params.id;
    const { data, error } = await supabaseAdmin.from("recipes")
      .select("id, user_id, visibility, status").eq("id", id).maybeSingle();
    if (error) throw error;
    if (!canReadRecipe(data, req.user)) {
      return res.status(404).json({ resultMessage: { vn: "Không tìm thấy công thức." } });
    }
    next();
  } catch (error) {
    next(error);
  }
};
