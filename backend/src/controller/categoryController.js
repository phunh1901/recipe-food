import { supabaseAdmin } from "../config/supabase.js";
import {
  getPagination,
  getPaginationResult,
} from "../middlewares/pagination.js";
import { sanitizeInput } from "../middlewares/validators.js";

// lấy tất cả category ----------------------------------------------------------------------------
export const getAllCategories = async (req, res) => {
  try {
    const { page, limit, name = "" } = req.query;

    const pageSize = limit ? parseInt(limit) : (page ? 10 : 1000);
    const { from, to, currentPage } = getPagination(page, pageSize);

    const { data: categories, error, count } = await supabaseAdmin
      .from("categories")
      .select("id, name, created_at, updated_at", { count: "exact" })
      .ilike("name", `%${name.trim()}%`)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return res.status(200).json({
      resultMessage: {
        en: "Get categories successfully",
        vn: "Lấy danh sách danh mục thành công",
      },
      pagination: getPaginationResult(count, currentPage, pageSize),
      data: categories,
    });
  } catch (err) {
    console.error("getAllCategories Error:", err.message);
    return res.status(500).json({
      resultMessage: {
        en: "Failed to fetch categories",
        vn: "Lỗi khi lấy danh sách danh mục",
      },
    });
  }
};

// tạo category --------------------------------------------
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const cleanName = sanitizeInput(name);

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({
        resultMessage: {
          en: "Category name is required (min 2 characters)",
          vn: "Tên danh mục là bắt buộc (tối thiểu 2 ký tự)",
        },
      });
    }

    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert([{ name: cleanName }])
      .select("id, name, created_at")
      .single();

    if (error) throw error;

    return res.status(201).json({
      resultMessage: {
        en: "Category created successfully",
        vn: "Tạo danh mục thành công",
      },
      data,
    });
  } catch (err) {
    return res.status(500).json({
      resultMessage: {
        en: "Failed to create category",
        vn: "Lỗi khi tạo danh mục",
      },
      error: err.message,
    });
  }
};

// cập nhật categoty ---------------------------------------------------------------
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const cleanName = sanitizeInput(name);

    if (!id || !cleanName) {
      return res.status(400).json({
        resultMessage: {
          en: "Missing ID or name",
          vn: "Thiếu ID hoặc tên danh mục mới",
        },
      });
    }

    const { data, error } = await supabaseAdmin
      .from("categories")
      .update({ name: cleanName, updated_at: new Date() })
      .eq("id", id)
      .select("id, name, updated_at")
      .single();

    if (error || !data) {
      return res.status(404).json({
        resultMessage: {
          en: "Category not found",
          vn: "Không tìm thấy danh mục",
        },
      });
    }

    return res.status(200).json({
      resultMessage: {
        en: "Category updated successfully",
        vn: "Cập nhật danh mục thành công",
      },
      data,
    });
  } catch (err) {
    return res.status(500).json({
      resultMessage: {
        en: "Failed to update category",
        vn: "Lỗi hệ thống khi cập nhật",
      },
    });
  }
};

// xóa category ----------------------------------------------------------
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra data liên kết
    const { data: recipes, error: checkError } = await supabaseAdmin
      .from("recipes")
      .select("id")
      .eq("category_id", id)
      .limit(1);

    if (recipes && recipes.length > 0) {
      return res.status(400).json({
        resultMessage: {
          en: "Cannot delete category because it is being used by recipes",
          vn: "Không thể xóa danh mục này vì đang có công thức sử dụng nó",
        },
      });
    }

    // Thực hiện xóa
    const { error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return res.status(200).json({
      resultMessage: {
        en: "Category deleted successfully",
        vn: "Xóa danh mục thành công",
      },
    });
  } catch (err) {
    return res.status(500).json({
      resultMessage: {
        en: "Failed to delete category",
        vn: "Lỗi hệ thống khi xóa danh mục",
      },
    });
  }
};
