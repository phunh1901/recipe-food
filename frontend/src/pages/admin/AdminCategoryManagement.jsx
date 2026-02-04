import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axiosClient from "../../api/axiosClient";
import {
    Tags,
    ShieldAlert,
    Edit3,
    Trash2,
    Plus,
    Search,
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    CheckCircle,
    Users,
    LogOut,
    MoreHorizontal,
    FolderPlus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/ConfirmModal";

const AdminCategoryManagement = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editForm, setEditForm] = useState({ name: "" });
    const [actionLoading, setActionLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [pendingDeleteCatId, setPendingDeleteCatId] = useState(null);

    const fetchCategories = async (page = 1, search = searchTerm) => {
        try {
            setLoading(true);
            const res = await axiosClient.get(`/categories?page=${page}&limit=10&name=${search}`);
            setCategories(res.data || []);
            setPagination(res.pagination || { currentPage: page, totalPages: 1 });
        } catch (err) {
            console.error("Lỗi lấy danh mục:", err);
            toast.error("Không thể tải danh sách danh mục");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchCategories(1, searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        setActionLoading(true);
        try {
            await axiosClient.post("/categories", { name: newCategoryName });
            toast.success("Đã thêm danh mục mới!");
            setNewCategoryName("");
            setIsAddModalOpen(false);
            fetchCategories(1);
        } catch (err) {
            toast.error(err.resultMessage?.vn || "Thêm thất bại");
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await axiosClient.put(`/categories/${editingCategory.id}`, { name: editForm.name });
            toast.success("Cập nhật danh mục thành công!");
            setEditingCategory(null);
            fetchCategories(pagination.currentPage);
        } catch (err) {
            toast.error("Cập nhật thất bại");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = (id) => {
        setPendingDeleteCatId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await axiosClient.delete(`/categories/${pendingDeleteCatId}`);
            toast.success('Đã xóa danh mục!');
            fetchCategories(pagination.currentPage);
            setShowDeleteModal(false);
            setPendingDeleteCatId(null);
        } catch (err) {
            console.error('Lỗi xóa danh mục:', err);
            toast.error(err.resultMessage?.vn || 'Không thể xóa danh mục này');
        }
    };

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
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-bold text-sm transition"
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
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-bold text-sm transition"
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

                {/* Main Content Areas */}
                <main className="flex-1 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-gray-800">Quản lý danh mục</h1>
                            <p className="text-gray-500 font-medium">Bố trí cấu trúc món ăn cho hệ thống</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Tìm danh mục..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full sm:w-48 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                                />
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                            >
                                <Plus size={18} />
                                Thêm mới
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest w-16">ID</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Tên danh mục</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Ngày tạo</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-20 text-center">
                                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                            </td>
                                        </tr>
                                    ) : categories.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-20 text-center text-gray-400 italic">Hiện chưa có danh mục nào</td>
                                        </tr>
                                    ) : (
                                        categories.map(cat => (
                                            <tr key={cat.id} className="hover:bg-gray-50/50 transition duration-150">
                                                <td className="px-6 py-4 text-xs font-bold text-gray-400">#{cat.id?.toString().slice(-4)}</td>
                                                <td className="px-6 py-4 font-bold text-gray-800">{cat.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(cat.created_at).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingCategory(cat);
                                                                setEditForm({ name: cat.name });
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                            title="Sửa tên"
                                                        >
                                                            <Edit3 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(cat.id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-xs text-gray-400 font-bold italic">Trang {pagination.currentPage} / {pagination.totalPages}</p>
                            <div className="flex gap-2">
                                <button
                                    disabled={pagination.currentPage <= 1}
                                    onClick={() => fetchCategories(pagination.currentPage - 1)}
                                    className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-50 hover:border-blue-500 hover:text-blue-500 transition"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    disabled={pagination.currentPage >= pagination.totalPages}
                                    onClick={() => fetchCategories(pagination.currentPage + 1)}
                                    className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-50 hover:border-blue-500 hover:text-blue-500 transition"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-6 bg-blue-600 text-white flex justify-between items-center">
                            <h2 className="text-xl font-black">Thêm danh mục mới</h2>
                            <button onClick={() => setIsAddModalOpen(false)}><MoreHorizontal size={24} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="p-8 space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tên danh mục</label>
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Vd: Món khai vị, Đồ tráng miệng..."
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading || !newCategoryName.trim()}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {actionLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FolderPlus size={18} />}
                                    Thêm ngay
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingCategory && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-6 bg-blue-600 text-white flex justify-between items-center">
                            <h2 className="text-xl font-black">Đổi tên danh mục</h2>
                            <button onClick={() => setEditingCategory(null)}><MoreHorizontal size={24} /></button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-8 space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tên mới</label>
                                <input
                                    type="text"
                                    autoFocus
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingCategory(null)}
                                    className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading || !editForm.name.trim()}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {actionLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Category Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Xóa danh mục?"
                message="Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                cancelText="Hủy"
                variant="warning"
            />

            <Footer />
        </div>
    );
};

export default AdminCategoryManagement;
