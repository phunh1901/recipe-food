import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axiosClient from "../../api/axiosClient";
import {
    Users,
    ShieldAlert,
    Edit3,
    Trash2,
    UserX,
    UserCheck,
    Search,
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    CheckCircle,
    Tags,
    LogOut,
    Mail,
    Calendar,
    MoreHorizontal
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/auth";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/ConfirmModal";

const AdminUserManagement = () => {
    const navigate = useNavigate();
    const { logout, user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

    // Edit Modal State
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ fullName: "", gender: "other", role: "user" });
    const [updating, setUpdating] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [pendingDeleteUserId, setPendingDeleteUserId] = useState(null);

    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true);
            const res = await axiosClient.get(`/user/admin/all?page=${page}&limit=10`);
            setUsers(res.data || []);
            setPagination(res.pagination || { currentPage: page, totalPages: 1 });
        } catch (err) {
            console.error("Lỗi lấy danh sách user:", err);
            toast.error("Không thể tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleBanToggle = async (user) => {
        try {
            await axiosClient.put(`/user/admin/updateuser/${user.id}`, {
                is_banned: !user.is_banned
            });
            toast.success(user.is_banned ? "Đã mở khóa tài khoản!" : "Đã khóa tài khoản thành công!");
            fetchUsers(pagination.currentPage);
        } catch (err) {
            console.error("Lỗi thay đổi trạng thái user:", err);
            toast.error("Thao tác thất bại");
        }
    };

    const handleDeleteUser = (id) => {
        setPendingDeleteUserId(id);
        setShowDeleteModal(true);
    };

    const confirmDeleteUser = async () => {
        try {
            await axiosClient.delete(`/user/admin/delete/${pendingDeleteUserId}`);
            toast.success('Đã xóa người dùng!');
            fetchUsers(pagination.currentPage);
        } catch (err) {
            console.error('Lỗi xóa user:', err);
            toast.error('Không thể xóa người dùng');
        } finally {
            setShowDeleteModal(false);
            setPendingDeleteUserId(null);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            await axiosClient.put(`/user/admin/updateuser/${editingUser.id}`, editForm);
            toast.success("Cập nhật thành công!");
            setEditingUser(null);
            fetchUsers(pagination.currentPage);
        } catch {
            toast.error("Cập nhật thất bại");
        } finally {
            setUpdating(false);
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
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-bold text-sm transition"
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

                {/* Main Content Areas */}
                <main className="flex-1 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-gray-800">Quản lý người dùng</h1>
                            <p className="text-gray-500 font-medium">Danh sách tài khoản trong hệ thống</p>
                        </div>
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm tên, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Người dùng</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Vai trò</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Trạng thái</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Ngày tạo</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center">
                                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                            </td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center text-gray-400 italic">Không tìm thấy người dùng nào</td>
                                        </tr>
                                    ) : (
                                        users.map(user => (
                                            <tr key={user.id} className="hover:bg-gray-50/50 transition duration-150">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                            {user.fullName?.[0] || user.email?.[0]?.toUpperCase()}
                                                        </div>
                                                        <div
                                                            onClick={() => navigate(`/profile/${user.id}`)}
                                                            className="cursor-pointer group/name"
                                                        >
                                                            <p className="font-bold text-gray-800 group-hover/name:text-blue-600 transition">{user.fullName || "Chưa đặt tên"}</p>
                                                            <p className="text-xs text-gray-400">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user.is_banned ? (
                                                        <span className="flex items-center gap-1.5 text-xs text-red-500 font-bold">
                                                            <UserX size={14} /> Bị khóa
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 text-xs text-green-500 font-bold">
                                                            <UserCheck size={14} /> Hoạt động
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingUser(user);
                                                                setEditForm({
                                                                    fullName: user.fullName || "",
                                                                    gender: user.gender || "other",
                                                                    role: user.role || "user"
                                                                });
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                            title="Sửa thông tin"
                                                        >
                                                            <Edit3 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleBanToggle(user)}
                                                            className={`p-2 rounded-lg transition ${user.is_banned ? 'text-green-400 hover:text-green-600 hover:bg-green-50' : 'text-orange-400 hover:text-orange-600 hover:bg-orange-50'
                                                                }`}
                                                            title={user.is_banned ? "Mở khóa" : "Khóa tài khoản"}
                                                        >
                                                            {user.is_banned ? <UserCheck size={18} /> : <UserX size={18} />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                            title="Xóa vĩnh viễn"
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
                                    onClick={() => fetchUsers(pagination.currentPage - 1)}
                                    className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-50 hover:border-blue-500 hover:text-blue-500 transition"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    disabled={pagination.currentPage >= pagination.totalPages}
                                    onClick={() => fetchUsers(pagination.currentPage + 1)}
                                    className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-50 hover:border-blue-500 hover:text-blue-500 transition"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-6 bg-blue-600 text-white flex justify-between items-center">
                            <h2 className="text-xl font-black">Sửa người dùng</h2>
                            <button onClick={() => setEditingUser(null)} className="hover:rotate-90 transition duration-300">
                                <MoreHorizontal size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Họ và tên</label>
                                <input
                                    type="text"
                                    value={editForm.fullName}
                                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Giới tính</label>
                                <select
                                    value={editForm.gender}
                                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                >
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Vai trò</label>
                                <select
                                    disabled={!currentUser?.isSuperAdmin || editingUser.id === currentUser.id}
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                >
                                    <option value="user">Người dùng (User)</option>
                                    <option value="admin">Quản trị viên (Admin)</option>
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                                >
                                    {updating && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete User Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDeleteUser}
                title="Xóa người dùng?"
                message="Bạn có chắc chắn muốn xóa vĩnh viễn người dùng này? Thao tác này không thể hoàn tác."
                confirmText="Xóa"
                cancelText="Hủy"
                variant="danger"
            />

            <Footer />
        </div>
    );
};

export default AdminUserManagement;
