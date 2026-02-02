import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
    Users,
    ChefHat,
    Heart,
    Calendar,
    User as UserIcon,
    ArrowLeft,
    UserPlus,
    UserMinus,
    Clock
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

const PublicProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [stats, setStats] = useState({ followers: 0, following: 0 });
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("recipes"); // recipes, favorites

    const isOwnProfile = currentUser?.id === id;

    useEffect(() => {
        fetchProfileData();
    }, [id]);

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            // 1. Get Public Profile Info
            const profileRes = await axiosClient.get(`/user/userProfile/${id}`);
            setProfile(profileRes.data);
            setStats({
                followers: profileRes.data.followersCount || 0,
                following: profileRes.data.followingCount || 0,
            });
            setIsFollowing(profileRes.data.isFollowing || false);

            // 2. Get User's Public Recipes
            const recipesRes = await axiosClient.get(`/recipes/public-user/${id}`);
            setRecipes(recipesRes.data || []);

            // 3. Get Favorites (if authorized/following)
            if (currentUser) {
                try {
                    const favRes = await axiosClient.get(`/recipes/favorite/${id}`);
                    setFavorites(favRes.data || []);
                } catch (e) {
                    // This might fail if not following, which is expected by backend logic
                    console.log("Could not fetch favorites: ", e.message);
                    setFavorites([]);
                }
            } else {
                setFavorites([]);
            }

        } catch (err) {
            console.error("Lỗi lấy thông tin hồ sơ:", err);
            toast.error("Không thể tải thông tin người dùng");
            navigate("/");
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async () => {
        if (!currentUser) {
            toast.error("Vui lòng đăng nhập để theo dõi");
            navigate("/login");
            return;
        }

        try {
            const res = await axiosClient.post(`/follows/${id}`);
            setIsFollowing(!isFollowing);
            setStats(prev => ({
                ...prev,
                followers: isFollowing ? prev.followers - 1 : prev.followers + 1
            }));
            toast.success(isFollowing ? "Đã bỏ theo dõi" : "Đã theo dõi");

            // Refresh favorites if now following
            if (!isFollowing) {
                const favRes = await axiosClient.get(`/recipes/favorite/${id}`);
                setFavorites(favRes.data || []);
            } else {
                setFavorites([]);
            }
        } catch (err) {
            toast.error("Gặp lỗi khi thực hiện thao tác");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-500 font-medium">Đang tải hồ sơ...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            {/* Header Banner */}
            <div className="h-48 md:h-64 bg-gradient-to-r from-orange-400 to-red-500"></div>

            <div className="max-w-5xl mx-auto px-4">
                {/* Profile Card */}
                <div className="relative -mt-24 md:-mt-32 bg-white rounded-3xl shadow-xl p-6 md:p-10 mb-8 border border-white">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Avatar */}
                        <div className="relative">
                            {profile.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt={profile.fullName}
                                    className="w-32 h-32 md:w-48 md:h-48 rounded-full border-8 border-white shadow-lg object-cover"
                                />
                            ) : (
                                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-8 border-white shadow-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-500">
                                    <UserIcon size={64} />
                                </div>
                            )}
                            {profile.role === 'admin' && (
                                <span className="absolute bottom-4 right-4 bg-orange-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white" title="Admin">
                                    <ChefHat size={20} />
                                </span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-3xl font-black text-gray-800 mb-1">{profile.fullName}</h1>
                                    <p className="text-gray-500 font-medium">{profile.email}</p>
                                </div>
                                {!isOwnProfile && (
                                    <button
                                        onClick={handleFollowToggle}
                                        className={`flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-bold transition shadow-lg transform hover:-translate-y-1 ${isFollowing
                                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            : 'bg-orange-500 text-white hover:bg-orange-600'
                                            }`}
                                    >
                                        {isFollowing ? (
                                            <>
                                                <UserMinus size={20} />
                                                <span>Bỏ theo dõi</span>
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus size={20} />
                                                <span>Theo dõi</span>
                                            </>
                                        )}
                                    </button>
                                )}
                                {isOwnProfile && (
                                    <button
                                        onClick={() => navigate("/profile")}
                                        className="px-8 py-3 bg-white border-2 border-orange-500 text-orange-500 rounded-2xl font-bold hover:bg-orange-50 transition shadow-lg transform hover:-translate-y-1"
                                    >
                                        Sửa hồ sơ
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-8 mb-6 py-4 border-y border-gray-100">
                                <div
                                    className="text-center group cursor-pointer"
                                    onClick={() => navigate(`/social-connections?tab=followers&userId=${id}`)}
                                >
                                    <div className="text-2xl font-black text-gray-800 group-hover:text-orange-500 transition">{stats.followers}</div>
                                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Người theo dõi</div>
                                </div>
                                <div
                                    className="text-center group cursor-pointer"
                                    onClick={() => navigate(`/social-connections?tab=following&userId=${id}`)}
                                >
                                    <div className="text-2xl font-black text-gray-800 group-hover:text-orange-500 transition">{stats.following}</div>
                                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Đang theo dõi</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-black text-gray-800">{recipes.length}</div>
                                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Công thức</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center md:justify-start gap-4 text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Calendar size={18} />
                                    <span>Giới tính: {profile.gender}</span>
                                </div>
                                {profile.birthdate && (
                                    <div className="flex items-center gap-1">
                                        <Users size={18} />
                                        <span>Ngày sinh: {new Date(profile.birthdate).toLocaleDateString("vi-VN")}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="flex border-b border-gray-200 mb-8">
                    <button
                        onClick={() => setActiveTab("recipes")}
                        className={`px-8 py-4 font-bold text-lg transition border-b-4 ${activeTab === "recipes"
                            ? "border-orange-500 text-orange-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                    >
                        Công thức
                    </button>
                    <button
                        onClick={() => setActiveTab("favorites")}
                        className={`px-8 py-4 font-bold text-lg transition border-b-4 ${activeTab === "favorites"
                            ? "border-orange-500 text-orange-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                    >
                        Yêu thích
                    </button>
                </div>

                {/* Tab Panel */}
                <div>
                    {activeTab === "recipes" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {recipes.length > 0 ? (
                                recipes.map((recipe) => (
                                    <div
                                        key={recipe.id}
                                        onClick={() => navigate(`/recipe/${recipe.id}`)}
                                        className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition group cursor-pointer transform hover:-translate-y-1 border border-gray-100"
                                    >
                                        <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300">
                                            <img
                                                src={recipe.image_url || 'https://via.placeholder.com/400x300'}
                                                alt={recipe.food_name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-orange-600 transition">{recipe.food_name}</h3>
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">{recipe.description}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    <span>{recipe.cooking_time} phút</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <ChefHat size={14} />
                                                    <span className="capitalize">{recipe.difficulty}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center bg-white rounded-3xl shadow-sm border border-gray-100">
                                    <ChefHat size={64} className="mx-auto text-gray-200 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có công thức công khai</h3>
                                    <p className="text-gray-500">Công thức của người dùng này sẽ xuất hiện ở đây.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {favorites.length > 0 ? (
                                favorites.map((recipe) => (
                                    <div
                                        key={recipe.id}
                                        onClick={() => navigate(`/recipe/${recipe.id}`)}
                                        className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition group cursor-pointer transform hover:-translate-y-1 border border-gray-100"
                                    >
                                        <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300">
                                            <img
                                                src={recipe.image_url || 'https://via.placeholder.com/400x300'}
                                                alt={recipe.food_name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-orange-600 transition">{recipe.food_name}</h3>
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">{recipe.description}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    <span>{recipe.cooking_time} phút</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <ChefHat size={14} />
                                                    <span className="capitalize">{recipe.difficulty}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center bg-white rounded-3xl shadow-sm border border-gray-100">
                                    <Heart size={64} className="mx-auto text-gray-200 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có món yêu thích</h3>
                                    {!isFollowing && !isOwnProfile && (
                                        <p className="text-orange-500 font-medium">Bạn cần theo dõi người này để xem danh sách yêu thích của họ.</p>
                                    )}
                                    {(isFollowing || isOwnProfile) && (
                                        <p className="text-gray-500">Người này chưa lưu món ăn nào vào mục yêu thích.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default PublicProfile;
