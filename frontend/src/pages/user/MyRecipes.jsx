import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from "../../api/axiosClient";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Clock, ChefHat, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from "../../components/ConfirmModal";

const MyRecipes = () => {
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, public, pending, rejected, private
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchMyRecipes(1);
    }, []);

    const fetchMyRecipes = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axiosClient.get(`/recipes/my-recipes?page=${page}&limit=9`);
            setRecipes(response.data || []);
            setPagination(response.pagination || null);
            setCurrentPage(page);
        } catch (err) {
            console.error('Lỗi lấy công thức của tôi:', err);
            toast.error('Không thể tải công thức');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (recipeId) => {
        setPendingDeleteId(recipeId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        const loadingToast = toast.loading('Đang xóa công thức...');
        try {
            await axiosClient.delete(`/recipes/delete/${pendingDeleteId}`);
            toast.success('Công thức đã được xóa thành công!', { id: loadingToast });
            fetchMyRecipes();
        } catch (err) {
            console.error('Lỗi xóa công thức:', err);
            toast.error('Gặp lỗi khi xóa công thức. Vui lòng thử lại sau.', { id: loadingToast });
        }
    };

    const handleRequestPublic = async (recipeId) => {
        const loadingToast = toast.loading('Đang xử lý yêu cầu...');
        try {
            const response = await axiosClient.patch(`/recipes/request-public/${recipeId}`);
            toast.success(response.resultMessage?.vn || 'Thành công!', { id: loadingToast });
            fetchMyRecipes();
        } catch (err) {
            console.error('Lỗi yêu cầu công khai:', err);
            toast.error(err.resultMessage?.vn || (typeof err === 'string' ? err : 'Lỗi hệ thống'), { id: loadingToast });
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
            fetchMyRecipes(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getStatusInfo = (recipe) => {
        if (recipe.status === 'pending' && recipe.is_public_request) {
            return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Đang chờ duyệt' };
        }
        if (recipe.status === 'rejected') {
            return { bg: 'bg-red-100', text: 'text-red-700', label: 'Bị từ chối' };
        }
        if (recipe.visibility === 'public') {
            return { bg: 'bg-green-100', text: 'text-green-700', label: 'Công khai' };
        }
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Riêng tư' };
    };

    const filteredRecipes = recipes.filter(recipe => {
        if (filter === 'all') return true;
        const status = getStatusInfo(recipe);
        if (filter === 'public') return status.label === 'Công khai';
        if (filter === 'pending') return status.label === 'Đang chờ duyệt';
        if (filter === 'rejected') return status.label === 'Bị từ chối';
        if (filter === 'private') return status.label === 'Riêng tư';
        return true;
    });

    const getStatusCounts = () => {
        const counts = { all: recipes.length, public: 0, pending: 0, rejected: 0, private: 0 };
        recipes.forEach(r => {
            const status = getStatusInfo(r);
            if (status.label === 'Công khai') counts.public++;
            else if (status.label === 'Đang chờ duyệt') counts.pending++;
            else if (status.label === 'Bị từ chối') counts.rejected++;
            else if (status.label === 'Riêng tư') counts.private++;
        });
        return counts;
    };

    const counts = getStatusCounts();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-gray-800 mb-2">Công thức của tôi</h1>
                    <p className="text-gray-600">Quản lý các công thức bạn đã tạo</p>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-full font-semibold transition ${filter === 'all'
                            ? 'bg-orange-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Tất cả ({counts.all})
                    </button>
                    <button
                        onClick={() => setFilter('public')}
                        className={`px-4 py-2 rounded-full font-semibold transition ${filter === 'public'
                            ? 'bg-green-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Công khai ({counts.public})
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-full font-semibold transition ${filter === 'pending'
                            ? 'bg-yellow-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Chờ duyệt ({counts.pending})
                    </button>
                    <button
                        onClick={() => setFilter('rejected')}
                        className={`px-4 py-2 rounded-full font-semibold transition ${filter === 'rejected'
                            ? 'bg-red-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Bị từ chối ({counts.rejected})
                    </button>
                    <button
                        onClick={() => setFilter('private')}
                        className={`px-4 py-2 rounded-full font-semibold transition ${filter === 'private'
                            ? 'bg-gray-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Riêng tư ({counts.private})
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredRecipes.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
                        <ChefHat size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {filter === 'all' ? 'Chưa có công thức nào' : `Không có công thức món ăn này`}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {filter === 'all' && 'Tạo công thức đầu tiên của bạn ngay!'}
                        </p>
                        {filter === 'all' && (
                            <button
                                onClick={() => navigate('/create-recipe')}
                                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition"
                            >
                                + Tạo công thức mới
                            </button>
                        )}
                    </div>
                )}

                {/* Recipe Grid */}
                {!loading && filteredRecipes.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRecipes.map((recipe) => {
                            const status = getStatusInfo(recipe);

                            return (
                                <div
                                    key={recipe.id}
                                    className="bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-xl transition group flex flex-col"
                                >
                                    {/* Image */}
                                    <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300">
                                        <img
                                            src={recipe.image_url || 'https://via.placeholder.com/400x300'}
                                            alt={recipe.food_name}
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Status Badge */}
                                        <div className={`absolute top-3 right-3 ${status.bg} ${status.text} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm`}>
                                            <span>{status.icon}</span>
                                            <span>{status.label}</span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                                            {recipe.food_name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                            {recipe.description || 'Không có mô tả'}
                                        </p>

                                        {recipe.status === 'rejected' && recipe.admin_note && (
                                            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                                                <p className="text-xs font-black text-red-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                    <span>⚠️</span> Lý do từ chối:
                                                </p>
                                                <p className="text-xs text-red-500 italic">"{recipe.admin_note}"</p>
                                            </div>
                                        )}

                                        {/* Meta */}
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 mt-auto">
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} />
                                                <span>{recipe.cooking_time || 0} phút</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Eye size={14} />
                                                <span>{recipe.view_count || 0} lượt xem</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition font-semibold"
                                                >
                                                    <Eye size={16} />
                                                    <span>Xem</span>
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/edit-recipe/${recipe.id}`)}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition font-semibold"
                                                >
                                                    <Edit size={16} />
                                                    <span>Sửa</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(recipe.id)}
                                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            {(status.label === 'Riêng tư' || status.label === 'Bị từ chối') && (
                                                <button
                                                    onClick={() => handleRequestPublic(recipe.id)}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-bold shadow-md"
                                                >

                                                    <span>Yêu cầu công khai</span>
                                                </button>
                                            )}

                                            {status.label === 'Đang chờ duyệt' && (
                                                <button
                                                    onClick={() => handleRequestPublic(recipe.id)}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-bold shadow-sm"
                                                >

                                                    <span>Hủy yêu cầu</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination Controls */}
                {pagination && (
                    <div className="flex justify-center items-center gap-2 mt-12 pb-8">
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
                                            className={`px-4 py-2 rounded-xl font-bold transition shadow-sm ${currentPage === pageNum
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
                                    return <span key={pageNum} className="px-2 text-gray-400">...</span>;
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
            </div>

            <Footer />

            {/* Delete Recipe Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Xóa công thức?"
                message="Bạn có chắc chắn muốn xóa công thức này? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                cancelText="Hủy"
                variant="danger"
            />
        </div>
    );
};

export default MyRecipes;
