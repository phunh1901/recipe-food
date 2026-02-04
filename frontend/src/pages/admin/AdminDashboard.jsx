import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../contexts/AuthContext";
import {
    Users,
    BookOpen,
    Layers,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    LogOut,
    LayoutDashboard,
    UserCircle,
    Tags,
    ChevronRight,
    ShieldAlert,
    Search
} from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axiosClient.get("/user/admin/stats");
                console.log("Dữ liệu API nhận được:", res.data); // Xem kỹ log này ở Console F12

                // Nếu res.data đã là object chứa {users, recipes...} thì dùng res.data
                // Nếu res.data.data mới chứa các trường đó thì dùng res.data.data
                const finalData = res.data.data || res.data;

                setStats(finalData);
            } catch (err) {
                console.error("Lỗi lấy thống kê CHI TIẾT:", err);
                // Nếu err là object lỗi từ axiosClient (err.response?.data hoặc string)
                const msg = err.message || (typeof err === 'string' ? err : "Không thể tải thống kê hệ thống");
                setError(msg);
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Lỗi truy cập Admin</h2>
                        <p className="text-gray-600 mb-8">{error || "Không thể tải dữ liệu thống kê"}</p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
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

    const statCards = [
        {
            title: "Người dùng",
            value: stats?.users?.total || 0,
            subValue: `${stats?.users?.banned || 0} bị khóa`,
            icon: <Users className="text-blue-600" size={24} />,
            color: "bg-blue-50",
            borderColor: "border-blue-100"
        },
        {
            title: "Công thức công khai",
            value: stats?.recipes?.public || 0,
            icon: <CheckCircle className="text-green-600" size={24} />,
            color: "bg-green-50",
            borderColor: "border-green-100"
        },
        {
            title: "Chờ phê duyệt",
            value: stats?.recipes?.pending || 0,
            icon: <Clock className="text-orange-600" size={24} />,
            color: "bg-orange-50",
            borderColor: "border-orange-100"
        },
        {
            title: "Bị từ chối",
            value: stats?.recipes?.rejected || 0,
            icon: <XCircle className="text-red-600" size={24} />,
            color: "bg-red-50",
            borderColor: "border-red-100"
        },
        {
            title: "Danh mục món ăn",
            value: stats?.categories || 0,
            icon: <Layers className="text-purple-600" size={24} />,
            color: "bg-purple-50",
            borderColor: "border-purple-100"
        }
    ];

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
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-bold text-sm transition"
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
                                {stats?.recipes?.pending > 0 && (
                                    <span className="ml-auto bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                        {stats.recipes.pending}
                                    </span>
                                )}
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

                {/* Main Content Areas */}
                <main className="flex-1 space-y-8">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-black text-gray-800">Bảng điều khiển</h1>
                        <p className="text-gray-500 mt-1 font-medium">Chào mừng trở lại, quản trị viên</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {statCards.map((card, index) => (
                            <div
                                key={index}
                                className={`${card.color} ${card.borderColor} border-2 rounded-3xl p-6 transition hover:shadow-xl group`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{card.title}</p>
                                        <h3 className="text-4xl font-black mt-2 text-gray-800 group-hover:scale-110 transition origin-left">{card.value}</h3>
                                        {card.subValue && (
                                            <p className="text-[10px] text-red-500 mt-2 font-black bg-red-100/50 px-2 py-0.5 rounded-full inline-block">
                                                {card.subValue}
                                            </p>
                                        )}
                                    </div>
                                    <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:rotate-12 transition">
                                        {card.icon}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-1 gap-8">

                        {/* System Health / Tip */}
                        <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between">
                            <div className="relative z-10">
                                <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">Mẹo quản trị</div>
                                <h2 className="text-2xl font-black mb-4 leading-tight text-rose-300">
                                    Duy trì cộng đồng sạch & lành mạnh
                                </h2>
                                <p className="text-slate-300 text-sm leading-relaxed max-w-xs font-medium">
                                    Hãy thường xuyên kiểm tra các báo cáo vi phạm và phê duyệt các công thức chất lượng nhất để thu hút người dùng.
                                </p>
                            </div>
                            <div className="relative z-10 mt-8">
                                <button
                                    onClick={() => navigate("/")}
                                    className="px-6 py-3 bg-white text-black rounded-xl font-black text-sm hover:bg-orange-500 hover:text-white transition flex items-center gap-2 w-fit"
                                >
                                    Xem trang chủ
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                            <ShieldAlert size={200} className="absolute -bottom-20 -right-20 text-white/5 rotate-12" />
                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default AdminDashboard;
