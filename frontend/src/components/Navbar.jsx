import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../api/supabaseClient";
import axiosClient from "../api/axiosClient";
import {
  Bell,
  LogOut,
  PlusCircle,
  LayoutDashboard,
  Search,
  User,
  Settings,
  BookmarkIcon,
  Heart,
} from "lucide-react";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("recipe");

  // Search ---------------------------------------------
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (location.pathname === "/search-users") {
      setSearchType("user");
      setSearchQuery(params.get("query") || "");
    } else if (params.get("search")) {
      setSearchType("recipe");
      setSearchQuery(params.get("search") || "");
    }
  }, [location.pathname, location.search]);

  // Fetch Notifications ---------------------------------------------
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await axiosClient.get("/notifications");
      const notifList = res.data || [];
      setNotifications(notifList);
      setUnreadCount(notifList.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Lỗi lấy thông báo:", err);
    }
  };

  // lắng nghe thông báo ---------------------------------------------
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          toast.success(payload.new.message_vn);
          setNotifications((prev) => [payload.new, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Handlers ---------------------------------------------
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (searchType === "recipe") {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/search-users?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Render ---------------------------------------------
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* LOGO */}
          <Link
            to="/"
            className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500"
          >
            RecipeFood
          </Link>

          {/* SEARCH DESKTOP */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl mx-8"
          >
            <div className="flex w-full border rounded-full overflow-hidden">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="px-4 bg-gray-50 border-r text-sm font-semibold"
              >
                <option value="recipe">Công thức</option>
                <option value="user">Người dùng</option>
              </select>

              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    searchType === "recipe"
                      ? "Tìm kiếm công thức..."
                      : "Tìm người dùng..."
                  }
                  className="w-full pl-10 pr-4 py-2 outline-none"
                />
              </div>
            </div>
          </form>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full"
                  >
                    <LayoutDashboard size={18} />
                    Quản trị
                  </Link>
                )}

                <Link
                  to="/create-recipe"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-white rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                >
                  <PlusCircle size={18} />
                  Tạo công thức
                </Link>

                {/* NOTIFICATIONS */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotif(!showNotif)}
                    className="p-2 hover:bg-gray-100 rounded-full transition relative"
                  >
                    <Bell size={22} className="text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotif && (
                    <div className="absolute right-0 mt-3 w-80 bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                      <div className="p-4 border-b font-bold text-gray-700 flex justify-between items-center bg-gray-50/50">
                        Thông báo
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await axiosClient.put("/notifications", { id: "all" });
                              setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                              setUnreadCount(0);
                              toast.success("Đã đọc tất cả");
                            } catch (err) {
                              toast.error("Lỗi thao tác");
                            }
                          }}
                          className="text-xs text-orange-500 font-normal hover:underline cursor-pointer"
                        >
                          Đã đọc tất cả
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!n.is_read) {
                                  try {
                                    await axiosClient.put("/notifications", { id: n.id });
                                    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, is_read: true } : item));
                                    setUnreadCount(prev => Math.max(0, prev - 1));
                                  } catch (err) {
                                    console.error("Lỗi đánh dấu:", err);
                                  }
                                }

                              }}
                              className={`p-4 border-b text-sm transition relative ${!n.is_read
                                ? "bg-orange-50/50 border-l-4 border-l-orange-500"
                                : "bg-white hover:bg-gray-50"
                                }`}
                            >
                              <p className={`text-gray-800 ${!n.is_read ? "font-bold" : "font-medium"}`}>
                                {n.message_vn}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-gray-400">
                                  {new Date(n.created_at).toLocaleString('vi-VN')}
                                </span>
                                {!n.is_read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animte-pulse"></span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-gray-400 text-sm italic">
                            Không có thông báo nào
                          </div>
                        )}
                      </div>
                      <div className="p-3 border-t bg-gray-50 text-center">
                        <Link
                          to="/notifications"
                          onClick={() => setShowNotif(false)}
                          className="text-xs font-bold text-orange-500 hover:text-orange-600 transition"
                        >
                          Xem tất cả thông báo
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* USER MENU */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-full transition border border-transparent hover:border-gray-200"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                      {(user.fullName || user.email)?.[0]?.toUpperCase()}
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-64 bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                      <div className="p-5 border-b bg-gradient-to-br from-gray-50 to-white">
                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1">
                          {user.role}
                        </p>
                        <p className="font-black text-gray-800 truncate text-base">
                          {user.fullName || user.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-gray-400 truncate font-medium">{user.email}</p>
                      </div>

                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-5 py-3 text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition font-bold text-sm"
                        >
                          <User size={18} />
                          Trang cá nhân
                        </Link>
                        <Link
                          to="/my-recipes"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-5 py-3 text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition font-bold text-sm"
                        >
                          <BookmarkIcon size={18} />
                          Công thức của tôi
                        </Link>
                        <Link
                          to="/favorites"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-5 py-3 text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition font-bold text-sm"
                        >
                          <Heart size={18} />
                          Mục yêu thích
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-5 py-3 text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition font-bold text-sm"
                        >
                          <Settings size={18} />
                          Cài đặt tài khoản
                        </Link>
                      </div>

                      <div className="border-t">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-5 py-4 text-red-500 hover:bg-red-50 transition font-black text-sm"
                        >
                          <LogOut size={18} />
                          Đăng xuất hệ thống
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2 rounded-full text-white font-bold bg-gradient-to-r from-orange-500 to-red-500"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>

        {/* SEARCH MOBILE */}
        <form onSubmit={handleSearch} className="md:hidden pb-4">
          <div className="flex border rounded-full overflow-hidden">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-2 text-xs bg-gray-50 border-r"
            >
              <option value="recipe">Công thức</option>
              <option value="user">Người dùng</option>
            </select>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 text-sm outline-none"
              placeholder={
                searchType === "recipe"
                  ? "Tìm công thức..."
                  : "Tìm người dùng..."
              }
            />
          </div>
        </form>
      </div>
    </nav>
  );
};

export default Navbar;
