import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../contexts/AuthContext";
import {
    User,
    MapPin,
    Calendar,
    Mail,
    Edit3,
    Heart,
    ChefHat,
    Shield,
    Cake,
    Trash2,
    Camera,
    CheckCircle2,
    XCircle
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/ConfirmModal";

const Profile = () => {
    const navigate = useNavigate();
    const { user: authUser, logout, login } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [updating, setUpdating] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [myRecipesCount, setMyRecipesCount] = useState(0);
    const [showDeleteAccountStep1, setShowDeleteAccountStep1] = useState(false);
    const [showDeleteAccountStep2, setShowDeleteAccountStep2] = useState(false);
    const [showDeleteAvatarModal, setShowDeleteAvatarModal] = useState(false);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get("/user/myProfile");
            const data = res.data.data || res.data;
            setProfile(data);
            setEditData({
                fullName: data.fullName || "",
                birthdate: data.birthdate ? data.birthdate.split("T")[0] : "",
                gender: data.gender || "Khác"
            });
        } catch (err) {
            console.error("Lỗi lấy hồ sơ:", err);
            setError("Không thể tải thông tin hồ sơ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleDeleteAccount = () => {
        setShowDeleteAccountStep1(true);
    };

    const proceedToStep2 = () => {
        setShowDeleteAccountStep1(false);
        setShowDeleteAccountStep2(true);
    };

    const confirmDeleteAccount = async () => {
        try {
            await axiosClient.delete("/user/delete");
            toast.success("Tài khoản của bạn đã được xóa.");
            logout();
            navigate("/");
        } catch (err) {
            console.error("Delete account error:", err);
            toast.error(err.response?.data?.resultMessage?.vn || "Không thể xóa tài khoản. Vui lòng thử lại sau.");
        }
    };

    const handleDeleteAvatar = async () => {
        try {
            await axiosClient.delete("/user/avatar");
            toast.success("Đã xóa ảnh đại diện!");
            setShowDeleteAvatarModal(false);
            fetchProfile();
        } catch (err) {
            console.error("Delete avatar error:", err);
            toast.error(err.response?.data?.resultMessage?.vn || "Không thể xóa ảnh đại diện.");
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const formData = new FormData();
            formData.append("fullName", editData.fullName);
            formData.append("birthdate", editData.birthdate);
            formData.append("gender", editData.gender);
            if (selectedImage) {
                formData.append("image", selectedImage);
            }

            await axiosClient.put("/user/update", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast.success("Cập nhật hồ sơ thành công!");

            // Reset ảnh preview
            setSelectedImage(null);
            setImagePreview(null);
            setIsEditing(false);

            // Fetch lại profile mới nhất từ server
            await fetchProfile();

            // Cập nhật lại user trong AuthContext
            if (authUser) {
                const profileRes = await axiosClient.get("/user/myProfile");
                const updatedProfile = profileRes.data.data || profileRes.data;
                login({ ...authUser, ...updatedProfile });
            }
        } catch (err) {
            console.error("Lỗi cập nhật hồ sơ:", err);
            toast.error(err.response?.data?.resultMessage?.vn || "Cập nhật thất bại");
        } finally {
            setUpdating(false);
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

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Đã có lỗi xảy ra</h2>
                        <p className="text-gray-600 mb-8">{error || "Không thể tải dữ liệu hồ sơ"}</p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => fetchProfile()}
                                className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-200"
                            >
                                Thử lại
                            </button>
                            <button
                                onClick={() => logout()}
                                className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                            >
                                <LogOut size={18} />
                                Đăng xuất và đăng nhập lại
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const infoItems = [
        { label: "Họ và tên", value: profile.fullName || "Chưa thiết lập", icon: <User size={20} className="text-orange-500" /> },
        { label: "Email", value: profile.email, icon: <Mail size={20} className="text-blue-500" /> },
        { label: "Ngày sinh", value: profile.birthdate ? new Date(profile.birthdate).toLocaleDateString("vi-VN") : "Chưa cập nhật", icon: <Calendar size={20} className="text-green-500" /> },
        { label: "Giới tính", value: profile.gender || 'Chưa cập nhật', icon: <User size={20} className="text-pink-500" /> },
        { label: "Vai trò", value: profile.role === "admin" ? "Quản trị viên" : "Người dùng", icon: <Shield size={20} className="text-purple-500" /> },
        { label: "Ngày tham gia", value: new Date(profile.created_at).toLocaleDateString("vi-VN"), icon: <CheckCircle2 size={20} className="text-teal-500" /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Profile Header */}
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
                        <div className="h-32 bg-gradient-to-r from-orange-500 to-red-600"></div>
                        <div className="px-8 pb-8">
                            <div className="relative flex justify-between items-end -mt-16 mb-6">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                                        {profile.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            profile.fullName?.charAt(0).toUpperCase() || authUser.email.charAt(0).toUpperCase()
                                        )}
                                    </div>




                                </div>

                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="mb-2 flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-200"
                                >
                                    <Edit3 size={18} />
                                    <span>Chỉnh sửa hồ sơ</span>
                                </button>
                            </div>

                            <div className="flex flex-col gap-1">
                                <h1 className="text-3xl font-black text-gray-800">{profile.fullName || "Người dùng RecipeFood"}</h1>
                                <p className="text-gray-500 flex items-center gap-2">
                                    <Mail size={16} />
                                    {profile.email}
                                </p>
                            </div>

                            {/* Social Stats */}
                            <div className="flex gap-8 mt-6 pt-6 border-t border-gray-100">
                                <button
                                    onClick={() => navigate("/social")}
                                    className="flex flex-col items-center gap-1 group/stat"
                                >
                                    <span className="text-2xl font-black text-gray-800 group-hover/stat:text-orange-500 transition">
                                        {profile.followersCount || 0}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Người theo dõi</span>
                                </button>
                                <button
                                    onClick={() => navigate("/social")}
                                    className="flex flex-col items-center gap-1 group/stat"
                                >
                                    <span className="text-2xl font-black text-gray-800 group-hover/stat:text-orange-500 transition">
                                        {profile.followingCount || 0}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Đang theo dõi</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Profile Info Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-3xl shadow-lg p-8">
                                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <User size={24} className="text-orange-500" />
                                    Thông tin cá nhân
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {infoItems.map((item, index) => (
                                        <div key={index} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-md transition">
                                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                                    {item.label}
                                                </p>
                                                <p className="text-gray-800 font-semibold mt-0.5 break-all">
                                                    {item.value}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Side Card: Account Status */}
                        <div className="space-y-8">
                            <div className="bg-white rounded-3xl shadow-lg p-8 text-white relative overflow-hidden group">
                                <Shield size={120} className="absolute -bottom-10 -right-10 text-white/10 group-hover:scale-110 transition duration-500" />
                                <div className="relative z-10">
                                    <button
                                        onClick={handleDeleteAccount}
                                        className="w-full py-3 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-xl font-bold text-sm transition mt-3"
                                    >
                                        Xóa tài khoản
                                    </button>
                                    {profile?.avatar_url && (
                                        <button
                                            onClick={() => setShowDeleteAvatarModal(true)}
                                            className="w-full py-3 bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 rounded-xl font-bold text-sm transition mt-3 flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={16} />
                                            Xóa ảnh đại diện
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsEditing(false)}
                    ></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white flex justify-between items-center">
                            <h2 className="text-xl font-bold">Chỉnh sửa hồ sơ</h2>
                            <button onClick={() => setIsEditing(false)} className="hover:rotate-90 transition">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                            {/* Avatar Preview in Modal */}
                            <div className="flex flex-col items-center gap-4 mb-4">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-orange-100 overflow-hidden flex items-center justify-center">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : profile.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={40} className="text-gray-300" />
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 p-2 bg-orange-500 text-white rounded-full shadow-md cursor-pointer hover:bg-orange-600 transition">
                                        <Camera size={14} />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 font-medium italic">Ảnh đại diện mới sẽ được cập nhật</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Họ và tên</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={editData.fullName}
                                            onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl transition outline-none"
                                            placeholder="Nhập họ và tên..."
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Ngày sinh</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="date"
                                            value={editData.birthdate}
                                            onChange={(e) => setEditData({ ...editData, birthdate: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl transition outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Giới tính</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['Nam', 'Nữ', 'Khác'].map((g) => (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => setEditData({ ...editData, gender: g })}
                                                className={`py-3 rounded-2xl font-bold text-sm transition ${editData.gender === g
                                                    ? 'bg-orange-100 border-2 border-orange-500 text-orange-600'
                                                    : 'bg-gray-50 border-2 border-transparent text-gray-500 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-4 border-2 border-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {updating ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={18} />
                                            <span>Lưu thay đổi</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Account Step 1 Modal */}
            <ConfirmModal
                isOpen={showDeleteAccountStep1}
                onClose={() => setShowDeleteAccountStep1(false)}
                onConfirm={proceedToStep2}
                title="⚠️ Xóa tài khoản?"
                message={`Hành động này sẽ XÓA VĨNH VIỄN:\n\n Tất cả công thức nấu ăn của bạn\n Tất cả bình luận của bạn\n Tất cả lượt thích của bạn\n Tất cả người theo dõi và đang theo dõi\n Tất cả thông báo\n Toàn bộ thông tin cá nhân\n\nBạn có CHẮC CHẮN muốn tiếp tục?`}
                confirmText="Tiếp tục"
                cancelText="Hủy bỏ"
                variant="danger"
            />

            {/* Delete Account Step 2 (Final Confirmation) */}
            <ConfirmModal
                isOpen={showDeleteAccountStep2}
                onClose={() => setShowDeleteAccountStep2(false)}
                onConfirm={confirmDeleteAccount}
                title=" XÁC NHẬN LẦN CUỐI"
                message="Bạn thực sự muốn xóa tài khoản? Điều này KHÔNG THỂ hoàn tác!"
                confirmText="Xóa vĩnh viễn"
                cancelText="Tôi đã suy nghĩ lại"
                variant="danger"
            />

            {/* Delete Avatar Modal */}
            <ConfirmModal
                isOpen={showDeleteAvatarModal}
                onClose={() => setShowDeleteAvatarModal(false)}
                onConfirm={handleDeleteAvatar}
                title="Xóa ảnh đại diện?"
                message="Bạn có chắc chắn muốn xóa ảnh đại diện hiện tại?"
                confirmText="Xóa"
                cancelText="Hủy"
                variant="warning"
            />

            <Footer />
        </div>
    );
};

export default Profile;

