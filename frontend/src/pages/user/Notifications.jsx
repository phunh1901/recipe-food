import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
    Bell,
    BellOff,
    Circle,
    Trash2,
    CheckCircle,
    Clock,
    MessageSquare,
    Heart,
    ChefHat,
    X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await axiosClient.get("/notifications");
            setNotifications(res.data || []);
        } catch (err) {
            console.error("Lỗi lấy thông báo:", err);
            toast.error("Không thể tải thông báo");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id = "all") => {
        try {
            await axiosClient.put("/notifications", { id });
            setNotifications(prev =>
                prev.map(n => (id === "all" || n.id === id) ? { ...n, is_read: true } : n)
            );
            if (id === "all") toast.success("Đã đánh dấu tất cả là đã đọc");
        } catch (err) {
            console.error("Lỗi đánh dấu:", err);
            toast.error("Thao tác thất bại");
        }
    };

    const handleDelete = async (id) => {
        try {
            const deleteTarget = id || "all";
            await axiosClient.delete("/notifications", { data: { id: deleteTarget } });
            if (deleteTarget === "all") {
                setNotifications([]);
                toast.success("Đã dọn sạch thông báo");
            } else {
                setNotifications(prev => prev.filter(n => n.id !== id));
                toast.success("Đã xóa thông báo");
            }
        } catch (err) {
            toast.error("Không thể xóa thông báo");
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'recipe_approved': return <CheckCircle className="text-green-500" />;
            case 'recipe_rejected': return <X className="text-red-500" />;
            case 'new_comment': return <MessageSquare className="text-blue-500" />;
            case 'new_like': return <Heart className="text-pink-500" />;
            case 'new_follow': return <Bell className="text-orange-500" />;
            default: return <Bell className="text-orange-500" />;
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) markAsRead(notification.id);

        // Navigate based on related_id or sender_id
        if (notification.type.includes('recipe') && notification.related_id) {
            navigate(`/recipe/${notification.related_id}`);
        } else if (notification.type.includes('follow')) {
            navigate(`/user-profile/${notification.sender_id}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-500 font-medium">Đang tải thông báo...</p>
                </div>
                <Footer />
            </div>
        );
    }

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-gray-800 tracking-tight">Thông báo</h1>
                        <p className="text-gray-500 mt-2">Cập nhật những hoạt động mới nhất liên quan đến bạn</p>
                    </div>
                    {notifications.length > 0 && unreadCount > 0 && (
                        <button
                            onClick={() => markAsRead()}
                            className="text-sm font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-4 py-2 rounded-xl transition"
                        >
                            Đánh dấu tất cả là đã đọc
                        </button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <BellOff size={64} className="mx-auto text-gray-200 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có thông báo nào</h3>
                        <p className="text-gray-500">Mọi cập nhật quan trọng từ hệ thống sẽ xuất hiện ở đây.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="divide-y divide-gray-50">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`p-6 flex gap-4 transition cursor-pointer group relative ${!n.is_read
                                            ? 'bg-orange-50/20 border-l-4 border-l-orange-500 hover:bg-orange-50/40'
                                            : 'bg-white hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${!n.is_read ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
                                            {getIcon(n.type)}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`text-sm md:text-base font-bold text-gray-800 ${!n.is_read ? '' : 'font-medium'}`}>
                                                {n.message_vn || n.message_en}
                                            </h4>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(n.id);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <Clock size={12} />
                                            <span>{new Date(n.created_at).toLocaleString('vi-VN')}</span>
                                            {!n.is_read && (
                                                <span className="flex items-center gap-1 text-orange-500 font-black uppercase tracking-widest text-[10px]">
                                                    <Circle size={8} fill="currentColor" /> Mới
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Notifications;
