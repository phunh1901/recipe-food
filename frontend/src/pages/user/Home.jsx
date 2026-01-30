import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axiosClient from "../../api/axiosClient";
import { ChevronLeft, ChevronRight, TrendingUp, Filter } from "lucide-react";

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchQuery = React.useMemo(() => {
    return searchParams.get("search") || "";
  }, [searchParams]);

  // Điều chỉnh chế độ hiển thị
  const fetchRecipes = async (page) => {
    setLoading(true);
    try {
      let url = `/recipes/all-recipes?page=${page}&limit=9`;

      if (searchQuery) {
        url = `/recipes/search?name=${encodeURIComponent(searchQuery)}&page=${page}&limit=9`;
      } else if (selectedCategory) {
        url = `/recipes/category/${selectedCategory}?page=${page}&limit=9`;
      }

      if (selectedDifficulty) {
        const separator = url.includes("?") ? "&" : "?";
        url += `${separator}difficulty=${selectedDifficulty}`;
      }
      const response = await axiosClient.get(url);
      setRecipes(response.data || []);
      setPagination(response.pagination || null);
    } catch (err) {
      console.error("Lỗi lấy danh sách món ăn:", err);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosClient.get("/categories");
        setCategories(response.data || []);
      } catch (err) {
        console.error("Lỗi lấy danh mục:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  useEffect(() => {
    fetchRecipes(currentPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, searchQuery, selectedCategory, selectedDifficulty]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  const handleDifficultyFilter = (difficultyId) => {
    setSelectedDifficulty(difficultyId);
    setCurrentPage(1); //reset về trang 1
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1); //reset về trang 1
  };

  const handleRecipeClick = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-4xl md:text-5xl font-black">
              {searchQuery
                ? `Tìm kiếm: "${searchQuery}"`
                : "Khám Phá Công Thức"}
            </h1>
          </div>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            Hàng ngàn công thức nấu ăn từ cộng đồng đam mê ẩm thực
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pb-16">
        {/* Category Filter */}
        <div className="mb-8 space-y-6">
          {categories.length > 0 && !searchQuery && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Filter size={20} className="text-orange-600" />
                <h2 className="text-xl font-bold text-gray-800">
                  Danh mục món ăn
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleCategoryFilter("")}
                  className={`px-5 py-2.5 rounded-full font-medium transition-all duration-200 ${
                    !selectedCategory
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-200 scale-105"
                      : "bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-400 hover:shadow-md"
                  }`}
                >
                  Tất cả
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryFilter(cat.id)}
                    className={`px-5 py-2.5 rounded-full font-medium transition-all duration-200 ${
                      selectedCategory === cat.id
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-200 scale-105"
                        : "bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-400 hover:shadow-md"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty Filter */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp size={20} className="text-orange-600" />
              <h2 className="text-xl font-bold text-gray-800">Độ khó</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { id: "", name: "Tất cả độ khó" },
                { id: "Dễ", name: "Dễ" },
                { id: "Trung bình", name: "Trung bình" },
                { id: "Khó", name: "Khó" },
              ].map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => handleDifficultyFilter(diff.id)}
                  className={`px-5 py-2.5 rounded-full font-medium transition-all duration-200 ${
                    selectedDifficulty === diff.id
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-200 scale-105"
                      : "bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-400 hover:shadow-md"
                  }`}
                >
                  {diff.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          // Skeleton Loading
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="flex justify-between mt-4">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-md">
            <div className="text-6xl mb-4">🍳</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {searchQuery
                ? "Không tìm thấy công thức nào"
                : "Chưa có công thức nào"}
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? "Thử tìm kiếm với từ khóa khác"
                : "Hãy là người đầu tiên chia sẻ công thức!"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => handleRecipeClick(recipe.id)}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-2"
                >
                  <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                    <img
                      src={
                        recipe.image_url ||
                        "https://via.placeholder.com/400x300?text=No+Image"
                      }
                      alt={recipe.food_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/400x300?text=No+Image";
                      }} // Xử lý link ảnh lỗi
                    />
                    <div className="absolute top-3 right-3">
                      <span className="bg-white/90 backdrop-blur-sm text-orange-600 px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg">
                        {recipe.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-xl mb-2 text-gray-800 group-hover:text-orange-600 transition line-clamp-1">
                      {recipe.food_name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                      {recipe.description}
                    </p>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold">
                          {recipe.user?.fullName?.[0]?.toUpperCase() || "U"}
                        </div>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${recipe.user.id}`);
                          }}
                          className="text-sm text-gray-600 font-medium hover:text-orange-500 cursor-pointer transition"
                        >
                          {recipe.user?.fullName}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <span>Xem chi tiết</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-3 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex gap-2">
                  {[...Array(pagination.totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-xl font-bold transition shadow-sm ${
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                              : "bg-white border border-gray-300 text-gray-700 hover:border-orange-300"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 3 ||
                      pageNum === currentPage + 3
                    ) {
                      return (
                        <span key={pageNum} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="p-3 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Home;
