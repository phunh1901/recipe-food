import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axiosClient from "../../api/axiosClient";
import { User, ChevronRight, Search as SearchIcon, Users } from "lucide-react";

const UserSearch = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const query = searchParams.get("query") || "";

    const fetchUsers = async (page = 1) => {
        setLoading(true);
        try {
            const res = await axiosClient.get(`/user/search?name=${encodeURIComponent(query)}&page=${page}&limit=12`);
            setUsers(res.data || []);
            setPagination(res.pagination);
        } catch (err) {
            console.error("Lỗi tìm kiếm người dùng:", err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        fetchUsers(1);
    }, [query]);

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                        <Users size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-800">
                            {query ? <>Kết quả cho: <span className="text-orange-500">"{query}"</span></> : 'Tìm kiếm người dùng'}
                        </h1>
                        <p className="text-gray-500 font-medium">Tìm thấy {pagination?.totalItems || 0} người dùng</p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : users.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {users.map((u) => (
                            <div
                                key={u.id}
                                onClick={() => navigate(`/profile/${u.id}`)}
                                className="group bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer transform hover:-translate-y-1"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        {u.avatar_url ? (
                                            <img
                                                src={u.avatar_url}
                                                alt={u.fullName}
                                                className="w-16 h-16 rounded-full object-cover border-4 border-orange-50 group-hover:border-orange-200 transition"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                                {u.fullName?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                        {u.role === 'admin' && (
                                            <div className="absolute -bottom-1 -right-1 bg-orange-500 p-1 rounded-full border-2 border-white shadow-sm" title="Admin">
                                                <User size={10} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-800 group-hover:text-orange-600 transition truncate">
                                            {u.fullName}
                                        </h3>
                                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <SearchIcon size={64} className="mx-auto text-gray-200 mb-4" />
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy người dùng nào</h3>
                        <p className="text-gray-500">Hãy thử tìm kiếm với tên khác</p>
                    </div>
                )}

                {/* Pagination */}
                {pagination && (
                    <div className="mt-12 flex justify-center gap-2">
                        {[...Array(pagination.totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handlePageChange(i + 1)}
                                className={`w-10 h-10 rounded-xl font-bold transition ${currentPage === i + 1
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-500'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default UserSearch;
