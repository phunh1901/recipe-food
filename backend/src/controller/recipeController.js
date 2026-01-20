import { supabaseAdmin } from "../config/supabase.js";
import { uploadImage } from "../config/uploadImage.js";
import {
  getPagination,
  getPaginationResult,
} from "../middlewares/pagination.js";
import {
  sanitizeInput,
  isValidTextarea,
} from "../middlewares/validators.js";

// Tạo công thức --------------------------------------------------
export const createRecipe = async (req, res) => {
  try {
    const {
      food_name,
      description,
      category_id,
      content,
      cooking_time,
      difficulty,
    } = req.body;

    const image = req.file;
    const { id: userId, role } = req.user;

    // Các trường bắt buộc
    if (!food_name || !description || !content || !category_id) {
      return res.status(400).json({
        resultMessage: {
          en: "Missing required fields (Name, Description, Content, Category).",
          vn: "Vui lòng cung cấp các trường bắt buộc (Tên, Mô tả, Nội dung, Danh mục).",
        },
      });
    }

    // Kiểm tra tên món ăn
    const trimmedFoodName = food_name.trim();
    if (trimmedFoodName.length < 1 || trimmedFoodName.length > 100) {
      return res.status(400).json({
        resultMessage: {
          en: "Food name must be between 1 and 100 characters.",
          vn: "Tên món ăn phải từ 1 đến 100 ký tự.",
        },
      });
    }

    // Kiểm tra nội dung
    const cleanContent = sanitizeInput(content);
    if (!isValidTextarea(cleanContent, 5, 50000)) {
      return res.status(400).json({
        resultMessage: {
          en: "Invalid content length",
          vn: "Nội dung quá ngắn hoặc quá dài",
        },
      });
    }

    // Upload ảnh đại diện món ăn
    let imageUrl = null;
    if (image) {
      try {
        console.log('[CREATE RECIPE] Uploading image for user:', userId);
        imageUrl = await uploadImage(image, "recipes", userId);
        console.log('[CREATE RECIPE] Image uploaded successfully:', imageUrl);
      } catch (uploadError) {
        console.error('[CREATE RECIPE] Image upload error:', uploadError);
        return res.status(400).json({
          resultMessage: {
            en: "Image upload failed.",
            vn: "Tải ảnh món ăn thất bại.",
          },
          error: uploadError.message,
        });
      }
    }

    // Thiết lập hiển thị
    const visibility = role === "admin" ? "public" : "private";
    const status = "approved";

    // Insert vào Database
    const { data: recipeData, error: insertError } = await supabaseAdmin
      .from("recipes")
      .insert([
        {
          food_name: trimmedFoodName,
          user_id: userId,
          description: description.trim(),
          category_id: category_id,
          content: cleanContent,
          cooking_time: cooking_time || 0,
          difficulty: ["Dễ", "Trung bình", "Khó"].includes(difficulty) ? difficulty : "Dễ",
          image_url: imageUrl,
          visibility: visibility,
          status: status,
          is_public_request: false,
        },
      ])
      .select(
        `
        id, food_name, description, content, image_url, 
        cooking_time, difficulty, visibility, created_at,
        user:user_id (id, fullName, avatar_url)
      `
      ) // Cả thông tin user
      .single();

    if (insertError) throw insertError;

    return res.status(201).json({
      resultMessage: {
        en: "Recipe created successfully!",
        vn: "Thêm công thức nấu ăn thành công!",
      },
      data: recipeData,
    });
  } catch (err) {
    console.error("Error creating recipe:", err.message);
    return res.status(500).json({
      resultMessage: {
        en: "Internal server error",
        vn: "Lỗi máy chủ nội bộ",
      },
      error: err.message,
    });
  }
};

// Cập nhật công thức --------------------------------------------------------
export const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      food_name,
      description,
      category_id,
      content,
      cooking_time,
      difficulty,
    } = req.body;

    const image = req.file;
    const { id: userId, role } = req.user;

    // Kiểm tra ID
    if (!id) {
      return res.status(400).json({
        resultMessage: {
          en: "Recipe ID is required!",
          vn: "Thiếu ID công thức!",
        },
      });
    }

    // Kiểm tra xem có dữ liệu gửi lên không
    if (
      !food_name &&
      !description &&
      !category_id &&
      !content &&
      !cooking_time &&
      !difficulty &&
      !image
    ) {
      return res.status(400).json({
        resultMessage: {
          en: "Nothing to update.",
          vn: "Không có dữ liệu nào để cập nhật.",
        },
      });
    }

    // Kiểm tra role
    const { data: existingRecipe, error: fetchError } = await supabaseAdmin
      .from("recipes")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingRecipe) {
      return res.status(404).json({
        resultMessage: {
          en: "Recipe not found",
          vn: "Không tìm thấy công thức",
        },
      });
    }

    if (existingRecipe.user_id !== userId && role !== "admin") {
      return res.status(403).json({
        resultMessage: {
          en: "Permission denied",
          vn: "Bạn không có quyền chỉnh sửa công thức này",
        },
      });
    }

    // Object cập nhật
    const updateData = { updated_at: new Date().toISOString() };

    if (food_name) {
      const trimmedName = food_name.trim();
      if (trimmedName.length < 1 || trimmedName.length > 100) {
        return res.status(400).json({
          resultMessage: {
            en: "Invalid food name length",
            vn: "Tên món ăn phải từ 1-100 ký tự",
          },
        });
      }
      updateData.food_name = trimmedName;
    }

    if (description) updateData.description = description.trim();

    if (content) {
      const cleanContent = sanitizeInput(content);
      if (!isValidTextarea(cleanContent, 5, 50000)) {
        return res.status(400).json({
          resultMessage: {
            en: "Invalid content length",
            vn: "Nội dung quá ngắn hoặc quá dài",
          },
        });
      }
      updateData.content = cleanContent;
    }

    if (category_id) updateData.category_id = category_id;
    if (cooking_time !== undefined) updateData.cooking_time = cooking_time;
    if (difficulty) {
      updateData.difficulty = ["Dễ", "Trung bình", "Khó"].includes(difficulty) ? difficulty : "Dễ";
    }

    // Xử lý Upload ảnh mới
    if (image) {
      try {
        console.log('[UPDATE RECIPE] Uploading image for user:', userId);
        const imageUrl = await uploadImage(image, "recipes", userId);
        console.log('[UPDATE RECIPE] Image uploaded successfully:', imageUrl);
        updateData.image_url = imageUrl;
      } catch (uploadError) {
        console.error('[UPDATE RECIPE] Image upload error:', uploadError);
        return res.status(400).json({
          resultMessage: {
            en: "Image upload failed",
            vn: "Lỗi khi tải ảnh lên",
          },
          error: uploadError.message,
        });
      }
    }

    // Thực hiện cập nhật và trả về kèm thông tin User liên kết
    const { data: updatedRecipe, error: updateError } = await supabaseAdmin
      .from("recipes")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        id, food_name, description, content, image_url, 
        cooking_time, difficulty, visibility, created_at, updated_at,
        user:user_id (id, fullName, avatar_url)
      `
      )
      .single();

    if (updateError) throw updateError;

    return res.status(200).json({
      resultMessage: {
        en: "Recipe updated successfully",
        vn: "Cập nhật công thức thành công",
      },
      data: updatedRecipe,
    });
  } catch (err) {
    console.error("Update Recipe Error:", err.message);
    return res.status(500).json({
      resultMessage: { en: "Internal server error", vn: "Lỗi máy chủ nội bộ" },
    });
  }
};

// delete --------------------------------------------------------------------
export const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    // Kiểm tra ID đầu vào
    if (!id) {
      return res.status(400).json({
        resultMessage: {
          en: "Recipe ID is required.",
          vn: "ID công thức là bắt buộc.",
        },
      });
    }

    // Kiểm tra công thức có tồn tại không
    const { data: existingRecipe, error: fetchError } = await supabaseAdmin
      .from("recipes")
      .select("user_id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !existingRecipe) {
      return res.status(404).json({
        resultMessage: {
          en: "Recipe not found.",
          vn: "Không tìm thấy công thức.",
        },
      });
    }

    // Kiểm tra quyền
    if (existingRecipe.user_id !== userId && role !== "admin") {
      return res.status(403).json({
        resultMessage: {
          en: "You do not have permission to delete this recipe.",
          vn: "Bạn không có quyền xóa công thức này.",
        },
      });
    }

    // Thực hiện xóa
    const { error: deleteError } = await supabaseAdmin
      .from("recipes")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    // Trả về phản hồi thành công
    return res.status(200).json({
      resultMessage: {
        en: "Your recipe was deleted successfully.",
        vn: "Công thức của bạn đã được xóa thành công.",
      },
    });
  } catch (err) {
    console.error("Error deleting recipe:", err.message);
    return res.status(500).json({
      resultMessage: {
        en: "Internal server error.",
        vn: "Lỗi máy chủ nội bộ.",
      },
    });
  }
};

// Xem tất cả công thức --------------------------------------------
export const getAllRecipes = async (req, res) => {
  try {
    const { page, limit, difficulty } = req.query;
    const { from, to, currentPage, pageSize } = getPagination(page, limit);

    // lấy data
    let query = supabaseAdmin.from("recipes").select(
      `
        id, 
        food_name, 
        description, 
        image_url, 
        cooking_time, 
        difficulty, 
        created_at,
        category_id,
        user:user_id (
          id,
          fullName,
          avatar_url
        )
      `,
      { count: "exact" }
    );

    // Lấy public và approved
    query = query.eq("visibility", "public").eq("status", "approved");

    // Lọc theo độ khó
    if (difficulty && ["Dễ", "Trung bình", "Khó"].includes(difficulty)) {
      query = query.eq("difficulty", difficulty);
    }

    // Truy vấn, phân trang
    const { data: recipes, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Trả về kết quả
    return res.status(200).json({
      resultMessage: {
        en: "Fetch recipes successfully",
        vn: "Lấy danh sách công thức thành công",
      },
      pagination: getPaginationResult(count, currentPage, pageSize),
      data: recipes,
    });
  } catch (err) {
    console.error("Error getting all recipes:", err.message);
    return res.status(500).json({
      resultMessage: {
        en: "Internal server error",
        vn: "Lỗi máy chủ nội bộ",
      },
    });
  }
};

// Lấy công thức theo category --------------------------------------------
export const getRecipesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { difficulty } = req.query;

    // Lấy chỉ số phân trang
    const { from, to, currentPage, pageSize } = getPagination(
      req.query.page,
      req.query.limit
    );

    // Truy vấn theo category
    let query = supabaseAdmin.from("recipes").select(
      `
        id, 
        food_name, 
        description, 
        image_url, 
        cooking_time, 
        difficulty, 
        created_at,
        category_id,
        user:user_id (
          id,
          fullName,
          avatar_url
        )
      `,
      { count: "exact" }
    );

    query = query.eq("visibility", "public").eq("status", "approved").eq("category_id", categoryId);

    // Lọc theo độ khó
    if (difficulty && ["Dễ", "Trung bình", "Khó"].includes(difficulty)) {
      query = query.eq("difficulty", difficulty);
    }

    // Truy vấn, phân trang
    const { data: recipes, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return res.status(200).json({
      resultMessage: {
        en: "Fetch recipes by category successfully",
        vn: "Lấy công thức theo danh mục thành công",
      },
      pagination: getPaginationResult(count, currentPage, pageSize),
      data: recipes,
    });
  } catch (err) {
    console.error("Error getting recipes by category:", err.message);
    return res.status(500).json({
      resultMessage: {
        en: "Internal server error",
        vn: "Lỗi máy chủ nội bộ",
      },
    });
  }
};


// Xem chi tiết recipes --------------------------------------------------
export const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;

    if (!id) {
      return res.status(400).json({
        resultMessage: {
          en: "Recipe ID is required",
          vn: "ID công thức là bắt buộc",
        },
      });
    }

    // Truy vấn recipes và thống kê
    const [recipeResult, favCountResult, reactionResult, userStatusResult] =
      await Promise.all([
        // thông tin Recipe và Tác giả
        supabaseAdmin
          .from("recipes")
          .select(
            `
          id, food_name, description, content, image_url, 
          cooking_time, difficulty, created_at, updated_at, category_id,
          user:user_id (id, fullName, avatar_url)
        `
          )
          .eq("id", id)
          .single(),

        // số yêu thích
        supabaseAdmin
          .from("favorites")
          .select("*", { count: "exact", head: true })
          .eq("recipe_id", id),

        // số Like và Dislike
        supabaseAdmin.from("recipes_reaction").select("reaction").eq("recipe_id", id),

        // User hiện tại đã Like/Dislike/Favorite chưa
        currentUserId
          ? Promise.all([
            supabaseAdmin
              .from("favorites")
              .select("id")
              .eq("recipe_id", id)
              .eq("user_id", currentUserId)
              .maybeSingle(),
            supabaseAdmin
              .from("recipes_reaction")
              .select("reaction")
              .eq("recipe_id", id)
              .eq("user_id", currentUserId)
              .maybeSingle(),
          ])
          : Promise.resolve([null, null]),
      ]);

    const { data: recipe, error } = recipeResult;

    if (error || !recipe) {
      return res.status(404).json({
        resultMessage: {
          en: "Recipe not found",
          vn: "Không tìm thấy công thức",
        },
      });
    }

    // Tính tổng Like/Dislike
    const reactions = reactionResult.data || [];
    const likes = reactions.filter((r) => r.reaction === "like").length;
    const dislikes = reactions.filter((r) => r.reaction === "dislike").length;

    // Xử lý trạng thái của User hiện tại (Đã tương tác hay chưa)
    const [userFav, userReact] = userStatusResult || [];

    // Tổng hợp dữ liệu trả về
    const finalData = {
      ...recipe,
      statistics: {
        favoriteCount: favCountResult.count || 0,
        likeCount: likes,
        dislikeCount: dislikes,
      },
      userInteraction: {
        isFavorited: !!userFav?.data,
        myReaction: userReact?.data?.reaction || null,
      },
    };

    return res.status(200).json({
      resultMessage: {
        en: "Get recipe detail successfully",
        vn: "Lấy chi tiết công thức thành công",
      },
      data: finalData,
    });
  } catch (err) {
    console.error("Error getting recipe by id:", err.message);
    return res.status(500).json({
      resultMessage: { en: "Internal server error", vn: "Lỗi máy chủ nội bộ" },
    });
  }
};

// Tìm kiếm công thức theo tên -------------------------------------------
export const searchRecipesByName = async (req, res) => {
  try {

    const { name, page, limit } = req.query;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        resultMessage: {
          en: "Please provide a search keyword",
          vn: "Vui lòng nhập từ khóa tìm kiếm",
        },
      });
    }

    // Phân trang
    const { from, to, currentPage, pageSize } = getPagination(page, limit);

    // Truy vấn dữ liệu
    let query = supabaseAdmin.from("recipes").select(
      `
        id, 
        food_name, 
        description, 
        image_url, 
        cooking_time, 
        difficulty, 
        created_at,
        category_id,
        user:user_id (
          id,
          fullName,
          avatar_url
        )
      `,
      { count: "exact" }
    );

    query = query.ilike("food_name", `%${name.trim()}%`).eq("visibility", "public");

    // Phân loại độ khó
    const { difficulty } = req.query;
    if (difficulty && ["Dễ", "Trung bình", "Khó"].includes(difficulty)) {
      query = query.eq("difficulty", difficulty);
    }

    const { data: recipes, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Trả về kết quả theo cấu trúc chuẩn
    return res.status(200).json({
      resultMessage: {
        en: "Search recipes successfully",
        vn: "Tìm kiếm công thức thành công",
      },
      pagination: getPaginationResult(count, currentPage, pageSize),
      data: recipes,
    });
  } catch (err) {
    console.error("Error searching recipes:", err.message);
    return res.status(500).json({
      resultMessage: {
        en: "Internal server error",
        vn: "Lỗi máy chủ nội bộ",
      },
    });
  }
};

// duyệt recipes public -------------------------------------------------
export const approveRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { recipeId, status, admin_note } = req.body;

    const targetId = id || recipeId;

    if (!targetId) {
      return res.status(400).json({
        resultMessage: {
          en: "Recipe ID is required.",
          vn: "Thiếu ID món ăn.",
        },
      });
    }

    let finalStatus = status;
    if (status === 'approve' || status === 'public') finalStatus = 'approved';
    if (status === 'reject') finalStatus = 'rejected';

    //  Kiểm tra đầu vào
    if (!["approved", "rejected"].includes(finalStatus)) {
      return res.status(400).json({
        resultMessage: {
          en: "Invalid status. Must be 'approved' or 'rejected'.",
          vn: "Trạng thái duyệt không hợp lệ. Phải là 'approved' hoặc 'rejected'.",
        },
      });
    }

    // Cập nhật Recipe
    const updateData = {
      status: finalStatus,
      updated_at: new Date().toISOString(),
      visibility: finalStatus === "approved" ? "public" : "private",
      admin_note: admin_note ? admin_note.trim() : null,
    };

    const { data: recipe, error: updateError } = await supabaseAdmin
      .from("recipes")
      .update(updateData)
      .eq("id", targetId)
      .select(
        `
        id, food_name, user_id, status, admin_note,
        user:user_id (id, fullName, avatar_url)
      `
      )
      .single();

    if (updateError) throw updateError;

    // Tự động tạo thông báo cho User
    if (recipe.user_id !== req.user.id) {
      const notificationData = {
        receiver_id: recipe.user_id,
        type: finalStatus === "approved" ? "recipe_approved" : "recipe_rejected",
        related_id: recipe.id,
        message_vn:
          finalStatus === "approved"
            ? `Công thức "${recipe.food_name}" của bạn đã được duyệt và công khai!`
            : `Công thức "${recipe.food_name}" bị từ chối. Lý do: ${admin_note || "Không có lý do cụ thể."
            }`,
        message_en:
          finalStatus === "approved"
            ? `Your recipe "${recipe.food_name}" has been approved and is now public!`
            : `Your recipe "${recipe.food_name}" was rejected. Reason: ${admin_note || "No reason provided."
            }`,
      };

      // Gửi thông báo
      const { error: notifyError } = await supabaseAdmin
        .from("notifications")
        .insert([notificationData]);

      if (notifyError) console.error("Notification Error:", notifyError.message);
    }

    //  Phản hồi cho Admin
    return res.status(200).json({
      resultMessage: {
        en: `Recipe has been ${status} successfully.`,
        vn: `Công thức đã được ${status === "approved" ? "phê duyệt" : "từ chối"
          } thành công.`,
      },
      data: recipe,
    });
  } catch (err) {
    console.error("Approve Recipe Error:", err.message);
    return res.status(500).json({
      resultMessage: {
        en: "Internal server error",
        vn: "Lỗi hệ thống khi duyệt bài",
      },
      error: err.message,
    });
  }
};

// api thêm/xóa favourite recipe -------------------------------------------------
export const toggleFavorite = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    if (!userId || !recipeId) {
      return res.status(400).json({
        resultMessage: { vn: "Thiếu thông tin người dùng hoặc công thức." }
      });
    }

    //  Check đã favorite chưa
    const { data: exist, error: checkErr } = await supabaseAdmin
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("recipe_id", recipeId)
      .maybeSingle();

    if (checkErr) throw checkErr;

    let isFavorited;

    // Toggle
    if (exist) {
      const { error: delErr } = await supabaseAdmin
        .from("favorites")
        .delete()
        .eq("id", exist.id);

      if (delErr) throw delErr;
      isFavorited = false;
    } else {
      const { error: insErr } = await supabaseAdmin
        .from("favorites")
        .insert({
          user_id: userId,
          recipe_id: recipeId,
        });

      if (insErr) throw insErr;
      isFavorited = true;
    }

    //  Lấy lại count
    const { count, error: countErr } = await supabaseAdmin
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("recipe_id", recipeId);

    if (countErr) throw countErr;

    return res.status(200).json({
      resultMessage: {
        vn: isFavorited
          ? "Đã thêm vào danh sách yêu thích."
          : "Đã xóa khỏi danh sách yêu thích.",
      },
      data: {
        isFavorited,
        favoriteCount: count || 0,
      },
    });
  } catch (err) {
    console.error("Toggle Favorite Error:", err);
    return res.status(500).json({
      resultMessage: { vn: "Lỗi hệ thống khi xử lý yêu thích." },
    });
  }
};


// xem recipes favourite của mình hoặc của người follow
export const getFavoritesRecipeOfUser = async (req, res) => {
  try {
    let { targetUserId } = req.params;
    const currentUserId = req.user.id;

    if (!targetUserId) {
      targetUserId = currentUserId;
    }

    if (targetUserId !== currentUserId) {
      const { data: isFollowing } = await supabaseAdmin
        .from("follows")
        .select("id")
        .eq("follower_id", currentUserId)
        .eq("following_id", targetUserId)
        .maybeSingle();

      if (!isFollowing) {
        return res.status(403).json({
          resultMessage: {
            vn: "Bạn cần theo dõi người này để xem danh sách yêu thích của họ.",
          },
        });
      }
    }

    const { data, error } = await supabaseAdmin
      .from("favorites")
      .select(
        `
        created_at,
        recipe:recipe_id (
          id, food_name, image_url, description, cooking_time, difficulty,
          user:user_id (id, fullName, avatar_url)
        )
      `
      )
      .eq("user_id", targetUserId);

    if (error) throw error;

    const formattedData = data.map(item => ({
      ...item.recipe,
      favorited_at: item.created_at
    }));

    return res.status(200).json({ data: formattedData });
  } catch (err) {
    console.error("Error getFavoritesRecipeOfUser:", err.message);
    return res
      .status(500)
      .json({ resultMessage: { vn: "Lỗi khi lấy danh sách yêu thích." } });
  }
};

// Lấy danh sách công thức của chính mình -------------------------------------------
export const getMyRecipes = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { page, limit } = req.query;

    const { from, to, currentPage, pageSize } = getPagination(page, limit);

    const { data, error, count } = await supabaseAdmin
      .from("recipes")
      .select(
        `
        id, food_name, description, image_url, 
        cooking_time, difficulty, status, visibility, is_public_request,
        created_at, updated_at, category_id
      `,
        { count: "exact" }
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return res.status(200).json({
      resultMessage: {
        en: "Get my recipes successfully",
        vn: "Lấy danh sách công thức của bạn thành công",
      },
      pagination: getPaginationResult(count, currentPage, pageSize),
      data: data || [],
    });
  } catch (err) {
    console.error("Error getMyRecipes:", err.message);
    return res.status(500).json({ resultMessage: { vn: "Lỗi hệ thống." } });
  }
};

// Gửi yêu cầu public recipes ---------------------------------------------------------
export const requestPublicRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    // Chỉ chủ sở hữu mới được yêu cầu public
    const { data: recipe, error: fetchError } = await supabaseAdmin
      .from("recipes")
      .select("id, status, visibility, is_public_request")
      .eq("id", recipeId)
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError || !recipe) {
      return res.status(404).json({
        resultMessage: {
          vn: "Công thức không tồn tại hoặc bạn không có quyền.",
        },
      });
    }

    if (recipe.visibility === "public" && recipe.status === "approved") {
      return res.status(400).json({
        resultMessage: { vn: "Công thức này đã được công khai rồi." },
      });
    }

    // Logic Toggle: Nếu đang chờ duyệt -> Hủy yêu cầu
    if (recipe.status === "pending" && recipe.is_public_request) {
      const { error: cancelError } = await supabaseAdmin
        .from("recipes")
        .update({
          is_public_request: false,
          status: "approved", // Quay lại trạng thái đã duyệt nhưng vẫn private
        })
        .eq("id", recipeId);

      if (cancelError) throw cancelError;

      // Delete unread notifications for admins about this recipe
      await supabaseAdmin
        .from("notifications")
        .delete()
        .eq("type", "recipe_approval_request")
        .eq("sender_id", userId)
        .eq("is_read", false);

      return res.status(200).json({
        resultMessage: {
          en: "Public request cancelled",
          vn: "Đã hủy yêu cầu công khai.",
        },
        data: { is_public_request: false, status: "approved" }
      });
    }

    // Gửi yêu cầu mới (hoặc gửi lại sau khi bị từ chối)
    const { error: updateError } = await supabaseAdmin
      .from("recipes")
      .update({
        is_public_request: true,
        status: "pending",
        admin_note: null,
      })
      .eq("id", recipeId);

    if (updateError) throw updateError;


    const { data: recipeDetails } = await supabaseAdmin
      .from("recipes")
      .select("food_name")
      .eq("id", recipeId)
      .single();

    // Get all admins
    const { data: admins } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("role", "admin");

    // Create notification for each admin
    if (admins && admins.length > 0) {
      const notifications = admins.map(admin => ({
        receiver_id: admin.id,
        sender_id: userId,
        type: "recipe_approval_request",
        title: "Yêu cầu duyệt công thức mới",
        message: `${req.user.fullName} đã gửi yêu cầu duyệt công thức "${recipeDetails?.food_name || 'Không rõ tên'}"`,
        link: `/admin/recipe-approval`,
        is_read: false
      }));

      await supabaseAdmin
        .from("notifications")
        .insert(notifications);
    }

    return res.status(200).json({
      resultMessage: {
        en: "Public request sent to Admin",
        vn: "Yêu cầu công khai đã được gửi tới Admin để duyệt.",
      },
      data: { is_public_request: true, status: "pending" }
    });
  } catch (err) {
    console.error("requestPublicRecipe Error:", err.message);
    return res.status(500).json({ resultMessage: { vn: "Lỗi hệ thống." } });
  }
};

// Danh sách chờ duyệt recipes ----------------------------------------------------------
export const getPendingRecipes = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { id: userId, role } = req.user;

    const { from, to, currentPage, pageSize } = getPagination(page, limit);

    let query = supabaseAdmin
      .from("recipes")
      .select(
        `
        id, food_name, description, content, image_url, created_at, status, is_public_request,
        user:user_id (id, fullName, avatar_url),
        category:category_id (id, name)
      `,
        { count: "exact" }
      )
      .eq("is_public_request", true)
      .eq("status", "pending");

    // phân role
    if (role !== "admin") {
      query = query.eq("user_id", userId);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return res.status(200).json({
      resultMessage: {
        en: "Get pending recipes successfully",
        vn: "Lấy danh sách công thức chờ duyệt thành công",
      },
      pagination: getPaginationResult(count, currentPage, pageSize),
      data: data,
    });
  } catch (err) {
    console.error("Error getPendingRecipes:", err.message);
    return res.status(500).json({ resultMessage: { vn: "Lỗi hệ thống." } });
  }
};

// Đếm số lượng favourire của 1 recipes ---------------------------------------------------
export const getFavoriteCount = async (req, res) => {
  try {
    const { id: recipeId } = req.params;

    if (!recipeId) {
      return res.status(400).json({
        resultMessage: {
          en: "Recipe ID is required",
          vn: "Thiếu ID công thức",
        },
      });
    }

    const { count, error } = await supabaseAdmin
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("recipe_id", recipeId);

    if (error) throw error;

    return res.status(200).json({
      resultMessage: {
        en: "Get favorite count successfully",
        vn: "Lấy số lượng yêu thích thành công",
      },
      data: {
        recipeId: recipeId,
        favoriteCount: count || 0,
      },
    });
  } catch (err) {
    console.error("Get Favorite Count Error:", err.message);
    return res.status(500).json({
      resultMessage: {
        en: "Internal server error",
        vn: "Lỗi hệ thống khi đếm lượt yêu thích",
      },
    });
  }
};

// xem danh sách các recipes bị từ chối
export const getMyRejectedRecipes = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { id: userId } = req.user;

    const { from, to, currentPage, pageSize } = getPagination(page, limit);


    const { data, error, count } = await supabaseAdmin
      .from("recipes")
      .select(
        `
        id, 
        food_name, 
        image_url, 
        status, 
        admin_note, 
        updated_at,
        category_id
      `,
        { count: "exact" }
      )
      .eq("user_id", userId)
      .eq("status", "rejected")
      .order("updated_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return res.status(200).json({
      resultMessage: {
        en: "Get rejected recipes successfully",
        vn: "Lấy danh sách bài bị từ chối thành công",
      },
      pagination: getPaginationResult(count, currentPage, pageSize),
      data: data || [],
    });
  } catch (err) {
    console.error("Error getMyRejectedRecipes:", err.message);
    return res.status(500).json({
      resultMessage: {
        en: "Internal server error",
        vn: "Lỗi hệ thống khi lấy danh sách bài bị từ chối",
      },
    });
  }
};
// Lấy tất cả công thức CÔNG KHAI của một người dùng nào đó ----------------------
export const getPublicRecipesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, limit } = req.query;

    if (!userId) {
      return res.status(400).json({
        resultMessage: {
          en: "User ID is required",
          vn: "Thiếu ID người dùng",
        },
      });
    }

    const { from, to, currentPage, pageSize } = getPagination(page, limit);

    const { data, error, count } = await supabaseAdmin
      .from("recipes")
      .select(
        `
        id, food_name, description, image_url, 
        cooking_time, difficulty, created_at, category_id
      `,
        { count: "exact" }
      )
      .eq("user_id", userId)
      .eq("visibility", "public")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return res.status(200).json({
      resultMessage: {
        en: "Get public recipes successfully",
        vn: "Lấy danh sách công thức công khai thành công",
      },
      pagination: getPaginationResult(count, currentPage, pageSize),
      data: data || [],
    });
  } catch (err) {
    console.error("Error getPublicRecipesByUser:", err.message);
    return res.status(500).json({ resultMessage: { vn: "Lỗi hệ thống." } });
  }
};


// Delete recipe image ----------------------------------------------------------------
export const deleteRecipeImage = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.id;

    const { data: recipe, error: getRecipeError } = await supabaseAdmin
      .from('recipes')
      .select('image_url, user_id')
      .eq('id', recipeId)
      .single();

    if (getRecipeError || !recipe) {
      return res.status(404).json({
        resultMessage: {
          en: 'Recipe not found.',
          vn: 'Không tìm thấy công thức.',
        },
      });
    }

    // kiểm tra role
    if (recipe.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        resultMessage: {
          en: 'You do not have permission to delete this image.',
          vn: 'Bạn không có quyền xóa ảnh này.',
        },
      });
    }

    // Nếu có ảnh thì xóa nó khỏi storage
    if (recipe.image_url) {
      const imagePath = recipe.image_url.split('/').pop();
      const { error: deleteStorageError } = await supabaseAdmin.storage
        .from('recipes')
        .remove([`images/${imagePath}`]);

      if (deleteStorageError) {
        console.error('Error deleting recipe image from storage:', deleteStorageError);
      }
    }

    // cập nhật database để xóa image_url
    const { error: updateError } = await supabaseAdmin
      .from('recipes')
      .update({ image_url: null })
      .eq('id', recipeId);

    if (updateError) {
      return res.status(500).json({
        resultMessage: {
          en: 'Failed to update recipe image.',
          vn: 'Không thể cập nhật ảnh công thức.',
        },
      });
    }

    return res.status(200).json({
      resultMessage: {
        en: 'Recipe image deleted successfully.',
        vn: 'Đã xóa ảnh công thức thành công.',
      },
    });
  } catch (err) {
    console.error('deleteRecipeImage Error:', err.message);
    return res.status(500).json({
      resultMessage: {
        en: 'Internal server error.',
        vn: 'Lỗi hệ thống khi xóa ảnh công thức.',
      },
    });
  }
};
