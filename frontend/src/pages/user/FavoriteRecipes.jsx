import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from "../../api/axiosClient";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Heart, Clock, ChefHat, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const FavoriteRecipes = () => {
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/recipes/favorite');
            setRecipes(response.data || []);
        } catch (err) {
            console.error('Lỗi lấy công thức yêu thích:', err);
            toast.error('Không thể tải công thức yêu thích');
        } finally {
            setLoading(false);
        }
    };

    const handleUnfavorite = async (recipeId, e) => {
        e.stopPropagation();

        try {
            await axiosClient.put(`/recipes/bookmark/${recipeId}`);
            toast.success('Đã bỏ khỏi danh sách yêu thích');
            // Remove from list immediately
            setRecipes(recipes.filter(r => r.id !== recipeId));
        } catch (err) {
            console.error('Lỗi bỏ yêu thích:', err);
            toast.error('Không thể bỏ yêu thích');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-gray-800 mb-2 flex items-center gap-3">
                        <Heart className="text-red-500" fill="currentColor" />
                        Công thức yêu thích
                    </h1>
                    <p className="text-gray-600">Các món ăn bạn đã lưu lại</p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && recipes.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
                        <Heart size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            Chưa có công thức yêu thích
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Khám phá và lưu lại những công thức bạn thích!
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition"
                        >
                            Khám phá công thức
                        </button>
                    </div>
                )}

                {/* Recipe Grid */}
                {!loading && recipes.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recipes.map((recipe) => (
                            <div
                                key={recipe.id}
                                onClick={() => navigate(`/recipe/${recipe.id}`)}
                                className="bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-xl transition group cursor-pointer"
                            >
                                {/* Image */}
                                <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300">
                                    <img
                                        src={recipe.image_url || 'https://via.placeholder.com/400x300'}
                                        alt={recipe.food_name}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Unfavorite Button */}
                                    <button
                                        onClick={(e) => handleUnfavorite(recipe.id, e)}
                                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition shadow-lg"
                                    >
                                        <Heart size={20} className="text-red-500" fill="currentColor" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-orange-500 transition">
                                        {recipe.food_name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {recipe.description || 'Không có mô tả'}
                                    </p>

                                    {/* Meta */}
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} />
                                            <span>{recipe.cooking_time || 0} phút</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <ChefHat size={14} />
                                            <span>{recipe.difficulty === 'easy' ? 'Dễ' : recipe.difficulty === 'medium' ? 'Trung bình' : 'Khó'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Eye size={14} />
                                            <span>{recipe.view_count || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats */}
                {!loading && recipes.length > 0 && (
                    <div className="mt-8 text-center text-gray-500 text-sm">
                        Bạn đã lưu <span className="font-bold text-orange-500">{recipes.length}</span> công thức
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default FavoriteRecipes;
