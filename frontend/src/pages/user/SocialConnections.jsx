import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axiosClient from "../../api/axiosClient";
import {
    Users,
    UserPlus,
    UserCheck,
    UserMinus,
    Search,
    ArrowLeft,
    Heart,
    ChefHat
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/auth";

const SocialConnections = () => {
    const [searchParams] = useSearchParams();
    const urlTab = searchParams.get('tab');
    const urlUserId = searchParams.get('userId');
    const { user: currentUser } = useAuth();

    const [activeTab, setActiveTab] = useState(urlTab || "followers"); // "followers" or "following"
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [targetUser, setTargetUser] = useState(null);
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            // Determine which user to fetch data for
            const targetUserId = urlUserId || currentUser?.id;

            // If viewing another user's connections, fetch their profile info
            if (urlUserId && urlUserId !== currentUser?.id) {
                const profileRes = await axiosClient.get(`/user/userProfile/${urlUserId}`);
                setTargetUser(profileRes.data);
            } else {
                setTargetUser(null);
            }

            // Fetch follower/following lists
            const endpoint = targetUserId && targetUserId !== currentUser?.id
                ? `/follows/follower/${targetUserId}`
                : '/follows/my-follower';
            const endpoint2 = targetUserId && targetUserId !== currentUser?.id
                ? `/follows/following/${targetUserId}`
                : '/follows/my-following';

            const [followersRes, followingRes] = await Promise.all([
                axiosClient.get(endpoint),
                axiosClient.get(endpoint2)
            ]);
            setFollowers(followersRes.data || []);
            setFollowing(followingRes.data || []);
        } catch (err) {
            console.error("Lỗi lấy dữ liệu follow:", err);
            toast.error("Không thể tải danh sách");
        } finally {
            setLoading(false);
        }
    }, [urlUserId, currentUser?.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleToggleFollow = async (targetUserId) => {
        try {
            await axiosClient.post(`/follows/${targetUserId}`);
            toast.success("Đã cập nhật!");
            fetchData(); // Refresh both lists
        } catch (err) {
            console.error("Lỗi toggle follow:", err);
            toast.error("Thao tác thất bại");
        }
    };

    const filteredList = (activeTab === "followers" ? followers : following).filter(user =>
        (user.fullName || user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
                <button
                    onClick={() => navigate("/profile")}
                    className="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition mb-8 font-bold text-sm"
                >
                    <ArrowLeft size={18} />
                    Quay lại hồ sơ
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-800 tracking-tight">
                            {targetUser ? `${targetUser.fullName}` : 'Mạng xã hội'}
                        </h1>
                        <p className="text-gray-500 mt-2">
                            {targetUser ? 'Xem danh sách người theo dõi và đang theo dõi' : 'Kết nối với những đầu bếp tài năng khác'}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 border-b-2 border-gray-100 mb-8">
                    <button
                        onClick={() => setActiveTab("followers")}
                        className={`pb-4 text-lg font-bold transition-all relative ${activeTab === "followers" ? "text-orange-600" : "text-gray-400 hover:text-gray-600"
                            }`}
                    >
                        Người theo dõi ({followers.length})
                        {activeTab === "followers" && <div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-orange-600 rounded-full animate-in slide-in-from-left duration-200"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab("following")}
                        className={`pb-4 text-lg font-bold transition-all relative ${activeTab === "following" ? "text-orange-600" : "text-gray-400 hover:text-gray-600"
                            }`}
                    >
                        Đang theo dõi ({following.length})
                        {activeTab === "following" && <div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-orange-600 rounded-full animate-in slide-in-from-left duration-200"></div>}
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder={`Tìm kiếm trong danh sách ${activeTab === 'followers' ? 'người theo dõi' : 'đang theo dõi'}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-200 focus:bg-white rounded-2xl transition outline-none font-medium"
                    />
                </div>

                {/* List */}
                <div className="space-y-4">
                    {filteredList.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                            <Users size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-400 font-bold">Không tìm thấy ai trong danh sách này</p>
                        </div>
                    ) : (
                        filteredList.map(user => (
                            <div
                                key={user.id}
                                className="group flex items-center justify-between p-4 bg-white border-2 border-gray-50 rounded-2xl hover:border-orange-100 hover:shadow-xl hover:shadow-orange-50/50 transition duration-300"
                            >
                                <div
                                    className="flex items-center gap-4 cursor-pointer"
                                    onClick={() => navigate(`/profile/${user.id}`)}
                                >
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 p-0.5 shadow-lg shadow-orange-100">
                                        <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-100 flex items-center justify-center text-white text-xl font-bold">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.fullName} className="w-full h-full object-cover" />
                                            ) : (
                                                user.fullName?.[0]?.toUpperCase() || "?"
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg group-hover:text-orange-500 transition">{user.fullName || "Người dùng"}</h3>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{user.role || 'user'}</p>
                                        <div className="flex gap-3 mt-1">
                                            <span className="text-[10px] text-orange-400 flex items-center gap-1 font-bold">
                                                <ChefHat size={10} /> {user.recipeCount || 0} công thức
                                            </span>
                                            <span className="text-[10px] text-red-400 flex items-center gap-1 font-bold">
                                                <Heart size={10} /> {user.totalFavorites || 0} yêu thích
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleToggleFollow(user.id)}
                                    className={`px-6 py-2.5 rounded-full font-bold text-sm transition flex items-center gap-2 ${user.isFollowing
                                        ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"
                                        : "bg-orange-500 text-white shadow-lg shadow-orange-100 hover:bg-orange-600"
                                        }`}
                                >
                                    {user.isFollowing ? (
                                        <>
                                            <UserMinus size={16} />
                                            Bỏ theo dõi
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={16} />
                                            {activeTab === 'followers' ? 'Theo dõi lại' : 'Theo dõi'}
                                        </>
                                    )}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default SocialConnections;
