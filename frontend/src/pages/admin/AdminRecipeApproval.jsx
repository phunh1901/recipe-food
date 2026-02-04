import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axiosClient from "../../api/axiosClient";
import {
    CheckCircle,
    XCircle,
    Eye,
    Clock,
    AlertCircle,
    ChevronRight,
    Search,
    BookOpen,
    User,
    LayoutDashboard,
    Users,
    Tags,
    LogOut,
    ShieldAlert,
    MoreHorizontal
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import PromptModal from "../../components/PromptModal";

const AdminRecipeApproval = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Modal states
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [pendingRecipeId, setPendingRecipeId] = useState(null);

    const fetchPendingRecipes = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get("/recipes/admin/list-pending");
            setRecipes(res.data || []);
        } catch (err) {
            console.error("Lỗi lấy danh sách chờ duyệt:", err);
            toast.error("Không thể tải danh sách món ăn chờ duyệt");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingRecipes();
    }, []);

    const handleApprove = (recipeId, status) => {
        setPendingRecipeId(recipeId);
        if (status === 'reject') {
            setShowRejectModal(true);
        } else {
            setShowApproveModal(true);
        }
    };

    const handleRejectSubmit = async (reason) => {
        if (!reason || !reason.trim()) {
            toast.error("Bạn phải cung cấp lý do để từ chối bài viết");
            return;
        }

        setActionLoading(true);
        try {
            await axiosClient.patch("/recipes/admin/approve", {
                recipeId: pendingRecipeId,
                status: 'rejected',
                admin_note: reason.trim()
            });
            toast.success("Đã từ chối món ăn");
            setRecipes(recipes.filter(r => r.id !== pendingRecipeId));
            setSelectedRecipe(null);
        } catch (err) {
            console.error("Lỗi duyệt món ăn:", err);
            toast.error(err.response?.data?.resultMessage?.vn || "Thao tác thất bại");
        } finally {
            setActionLoading(false);
        }
    };

    const handleApproveSubmit = async (note) => {
        setActionLoading(true);
        try {
            await axiosClient.patch("/recipes/admin/approve", {
                recipeId: pendingRecipeId,
                status: 'approved',
                admin_note: note.trim() || "Tuyệt vời! Công thức của bạn đã được duyệt."
            });
            toast.success("Đã duyệt món ăn công khai!");
            setRecipes(recipes.filter(r => r.id !== pendingRecipeId));
            setSelectedRecipe(null);
        } catch (err) {
            console.error("Lỗi duyệt món ăn:", err);
            toast.error(err.response?.data?.resultMessage?.vn || "Thao tác thất bại");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 py-8 gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 shrink-0">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sticky top-24">
                        <div className="px-4 py-6 text-center border-b border-gray-50 mb-4">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <ShieldAlert size={32} />
                            </div>
                            <h2 className="font-black text-gray-800">Admin Hub</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Hệ thống quản trị</p>
                        </div>

                        <nav className="space-y-1">
                            <button
                                onClick={() => navigate("/admin")}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-bold text-sm transition"
                            >
                                <LayoutDashboard size={20} />
                                Tổng quan
                            </button>
                            <button
                                onClick={() => navigate("/admin/approvals")}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-bold text-sm transition"
                            >
                                <CheckCircle size={20} />
                                Duyệt bài viết
                            </button>
                            <button
                                onClick={() => navigate("/admin/users")}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-bold text-sm transition"
                            >
                                <Users size={20} />
                                Người dùng
                            </button>
                            <button
                                onClick={() => navigate("/admin/categories")}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-bold text-sm transition"
                            >
                                <Tags size={20} />
                                Danh mục
                            </button>
                        </nav>

                        <div className="mt-8 pt-8 border-t border-gray-50">
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-bold text-sm transition"
                            >
                                <LogOut size={20} />
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-gray-800">Duyệt món ăn</h1>
                            <p className="text-gray-500 font-medium">Cấp phép hiển thị cho công thực từ người dùng</p>
                        </div>
                        <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-xl font-bold text-sm">
                            {recipes.length} bài viết đang chờ
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* List of Pending Recipes */}
                        <div className="space-y-4">
                            {recipes.length === 0 ? (
                                <div className="bg-white rounded-3xl p-12 text-center shadow-sm border-2 border-dashed border-gray-200">
                                    <CheckCircle size={48} className="mx-auto text-green-500 mb-4 opacity-20" />
                                    <p className="text-gray-400 font-medium">Hiện không có món ăn nào chờ duyệt</p>
                                </div>
                            ) : (
                                recipes.map(recipe => (
                                    <div
                                        key={recipe.id}
                                        onClick={() => setSelectedRecipe(recipe)}
                                        className={`bg-white p-4 rounded-2xl shadow-sm border-2 transition cursor-pointer flex gap-4 items-center group ${selectedRecipe?.id === recipe.id ? 'border-orange-500' : 'border-transparent hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                                            <img src={recipe.image_url} alt={recipe.food_name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-800 truncate group-hover:text-orange-500 transition">
                                                {recipe.food_name}
                                            </h3>
                                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                <User size={12} />
                                                {recipe.user?.fullName || "Ẩn danh"}
                                            </p>
                                        </div>
                                        <ChevronRight size={18} className={`text-gray-300 transition ${selectedRecipe?.id === recipe.id ? 'translate-x-1 text-orange-500' : ''}`} />
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Preview Area */}
                        <div className="">
                            {selectedRecipe ? (
                                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 sticky top-24">
                                    <div className="h-64 bg-gray-200 relative">
                                        <img src={selectedRecipe.image_url} alt={selectedRecipe.food_name} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div className="absolute bottom-6 left-8 text-white">
                                            <span className="bg-orange-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase mb-2 inline-block shadow-lg">
                                                {selectedRecipe.category?.name || "Món ăn"}
                                            </span>
                                            <h2 className="text-3xl font-black">{selectedRecipe.food_name}</h2>
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                                    {selectedRecipe.user?.fullName?.[0] || "U"}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tác giả</p>
                                                    <p className="text-blue-600 font-bold text-sm">{selectedRecipe.user?.fullName || "Người dùng"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                                <button
                                                    disabled={actionLoading}
                                                    onClick={() => handleApprove(selectedRecipe.id, 'reject')}
                                                    className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-red-50 hover:text-red-500 transition flex items-center justify-center gap-2 text-sm"
                                                >
                                                    <XCircle size={18} />
                                                    Từ chối
                                                </button>
                                                <button
                                                    disabled={actionLoading}
                                                    onClick={() => handleApprove(selectedRecipe.id, 'approve')}
                                                    className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold hover:shadow-lg shadow-orange-200 transition flex items-center justify-center gap-2 text-sm"
                                                >
                                                    {actionLoading ? (
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <CheckCircle size={18} />
                                                    )}
                                                    Duyệt bài
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Mô tả</h3>
                                                <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl italic text-sm">
                                                    "{selectedRecipe.description}"
                                                </p>
                                            </div>

                                            <div className="space-y-6">
                                                <div>
                                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Nguyên liệu & Hướng dẫn</h3>
                                                    <div className="bg-gray-50 rounded-2xl p-4 overflow-hidden">
                                                        <div
                                                            className="recipe-content text-gray-700 leading-relaxed text-sm whitespace-pre-wrap"
                                                            dangerouslySetInnerHTML={{ __html: selectedRecipe.content }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center text-center shadow-xl border-2 border-gray-100 min-h-[500px]">
                                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                        <Eye size={40} className="text-gray-200" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Chế độ xem trước</h2>
                                    <p className="text-gray-400 max-w-sm">
                                        Chọn một món ăn từ danh sách bên trái để xem chi tiết và thực hiện kiểm duyệt
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            <Footer />

            {/* Reject Modal */}
            <PromptModal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                onSubmit={handleRejectSubmit}
                title="Nhập lý do từ chối"
                placeholder="Vui lòng nhập lý do từ chối món ăn này..."
                required={true}
                multiline={true}
                maxLength={500}
            />

            {/* Approve Modal */}
            <PromptModal
                isOpen={showApproveModal}
                onClose={() => setShowApproveModal(false)}
                onSubmit={handleApproveSubmit}
                title="Ghi chú phê duyệt"
                placeholder="Nhập ghi chú (tùy chọn)..."
                defaultValue="Tuyệt vời! Công thức của bạn đã được duyệt."
                required={false}
                multiline={true}
                maxLength={500}
            />
        </div>
    );
};

export default AdminRecipeApproval;
