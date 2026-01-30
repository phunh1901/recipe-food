import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Clock,
    ChefHat,
    Heart,
    ThumbsUp,
    ThumbsDown,
    Share2,
    ArrowLeft,
    User as UserIcon,
    MoreVertical,
    Edit2,
    Trash2
} from 'lucide-react';
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import ConfirmModal from "../../components/ConfirmModal";

const RecipeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [commentCount, setCommentCount] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentContent, setEditCommentContent] = useState('');
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [pendingDeleteCommentId, setPendingDeleteCommentId] = useState(null);

    // Add CSS for recipe content
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .recipe-content h3 {
                font-size: 1.25rem;
                font-weight: 700;
                color: #1f2937;
                margin-top: 1.5rem;
                margin-bottom: 0.75rem;
            }
            .recipe-content ul {
                list-style-type: disc;
                margin-left: 1.5rem;
                margin-bottom: 1rem;
            }
            .recipe-content li {
                margin-bottom: 0.5rem;
                line-height: 1.6;
            }
            .recipe-content strong {
                font-weight: 600;
                color: #111827;
            }
            .recipe-content p {
                margin-bottom: 0.75rem;
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    useEffect(() => {
        const fetchRecipeDetail = async () => {
            try {
                const response = await axiosClient.get(`/recipes/detail-recipe/${id}`);
                setRecipe(response.data);
            } catch (err) {
                console.error('Lỗi lấy chi tiết recipe:', err);
                toast.error('Không thể tải công thức');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        fetchRecipeDetail();
        fetchComments();
    }, [id, navigate]);

    const fetchComments = async () => {
        try {
            const response = await axiosClient.get(`/comments/${id}`);
            setComments(response.data || []);
            setCommentCount(response.pagination?.total || response.data?.length || 0);
        } catch (err) {
            console.error('Lỗi lấy comments:', err);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('Vui lòng đăng nhập để bình luận');
            navigate('/login');
            return;
        }

        if (!newComment.trim()) {
            toast.error('Nội dung bình luận không được để trống');
            return;
        }

        setSubmittingComment(true);
        try {
            await axiosClient.post(`/comments/${id}`, { content: newComment });
            toast.success('Đã thêm bình luận!');
            setNewComment('');
            fetchComments(); // Reload comments
        } catch (err) {
            toast.error('Lỗi khi gửi bình luận');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleEditComment = (comment) => {
        setEditingCommentId(comment.id);
        setEditCommentContent(comment.content);
    };

    const handleUpdateComment = async (e) => {
        e.preventDefault();
        if (!editCommentContent.trim()) return;

        try {
            await axiosClient.put(`/comments/${editingCommentId}`, { content: editCommentContent });
            toast.success('Đã cập nhật bình luận!');
            setEditingCommentId(null);
            fetchComments();
        } catch (err) {
            toast.error('Lỗi khi cập nhật bình luận');
        }
    };

    const handleDeleteComment = async (commentId) => {
        setPendingDeleteCommentId(commentId);
        setShowDeleteModal(true);
    };

    const confirmDeleteComment = async () => {
        try {
            await axiosClient.delete(`/comments/${pendingDeleteCommentId}`);
            toast.success('Đã xóa bình luận!');
            fetchComments();
            setOpenDropdownId(null);
        } catch (err) {
            toast.error('Lỗi khi xóa bình luận');
        }
    };

    const handleReaction = async (reactionType) => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để tương tác');
            navigate('/login');
            return;
        }

        try {
            await axiosClient.post(`/reaction/${id}`, { reaction: reactionType });
            toast.success('Đã ghi nhận phản hồi của bạn!');
            // Reload recipe để cập nhật stats
            const response = await axiosClient.get(`/recipes/detail-recipe/${id}`);
            setRecipe(response.data);
        } catch (err) {
            toast.error('Lỗi khi gửi phản hồi');
        }
    };

    const handleFavorite = async () => {
        if (!user) {
            toast.error('Vui lòng đăng nhập');
            navigate('/login');
            return;
        }

        try {
            const res = await axiosClient.put(`/recipes/bookmark/${id}`);
            const { isFavorited, favoriteCount } = res.data;

            setRecipe(prev => ({
                ...prev,
                statistics: {
                    ...prev.statistics,
                    favoriteCount: favoriteCount
                },
                userInteraction: {
                    ...prev.userInteraction,
                    isFavorited: isFavorited
                }
            }));

            toast.success(isFavorited ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích');
        } catch (err) {
            toast.error('Lỗi khi lưu yêu thích');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-10">
                    <div className="animate-pulse space-y-6">
                        <div className="h-96 bg-gray-200 rounded-3xl"></div>
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!recipe) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6 transition"
                >
                    <ArrowLeft size={20} />
                    <span>Quay lại</span>
                </button>

                {/* Recipe Header */}
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8">
                    {/* Featured Image */}
                    <div className="relative h-64 bg-gradient-to-br from-gray-200 to-gray-300">
                        <img
                            src={recipe.image_url || 'https://via.placeholder.com/800x400'}
                            alt={recipe.food_name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <h1 className="absolute bottom-6 left-6 text-4xl font-black text-white drop-shadow-lg">
                            {recipe.food_name}
                        </h1>
                    </div>

                    {/* Recipe Meta */}
                    <div className="p-8">
                        <div className="flex flex-wrap items-center gap-6 mb-6">
                            <div
                                onClick={() => navigate(`/profile/${recipe.user.id}`)}
                                className="flex items-center gap-2 text-gray-600 hover:text-orange-500 cursor-pointer transition"
                            >
                                <UserIcon size={20} className="text-orange-500" />
                                <span className="font-medium">{recipe.user?.fullName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Clock size={20} className="text-orange-500" />
                                <span>{recipe.cooking_time || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ChefHat size={20} className="text-orange-500" />
                                <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium capitalize">
                                    {recipe.difficulty}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 text-lg leading-relaxed mb-6">
                            {recipe.description}
                        </p>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-4 pb-6 border-b">
                            <button
                                onClick={() => handleReaction('like')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${recipe.userInteraction?.myReaction === 'like'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                            >
                                <ThumbsUp size={18} />
                                <span>{recipe.statistics?.likeCount || 0}</span>
                            </button>

                            <button
                                onClick={() => handleReaction('dislike')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${recipe.userInteraction?.myReaction === 'dislike'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                            >
                                <ThumbsDown size={18} />
                                <span>{recipe.statistics?.dislikeCount || 0}</span>
                            </button>

                            <button
                                onClick={handleFavorite}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${recipe.userInteraction?.isFavorited
                                    ? 'bg-red-50 text-red-600 border-2 border-red-500 shadow-sm'
                                    : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                                    }`}
                            >
                                <Heart
                                    size={18}
                                    fill={recipe.userInteraction?.isFavorited ? 'red' : 'none'}
                                    className={recipe.userInteraction?.isFavorited ? 'text-red-500' : 'text-gray-500'}
                                />
                                <span className="font-bold">{recipe.statistics?.favoriteCount || 0}</span>
                            </button>

                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    toast.success('Đã copy link!');
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
                            >
                                <Share2 size={18} />
                                <span>Chia sẻ</span>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="mt-8 prose max-w-none">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">Hướng dẫn</h2>
                            <div
                                className="recipe-content text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: recipe.content }}
                                style={{
                                    '--h3-size': '1.25rem',
                                    '--h3-weight': '700',
                                    '--h3-color': '#1f2937'
                                }}
                            />
                        </div>
                    </div>
                </div>


                {/* Comments Section - Insert this BEFORE </main> closing tag in RecipeDetail.jsx */}
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden p-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                        <span>💬 Bình luận</span>
                        <span className="text-lg font-normal text-gray-500">({commentCount})</span>
                    </h2>

                    {/* Comment Input */}
                    {user ? (
                        <form onSubmit={handleSubmitComment} className="mb-8">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Viết bình luận của bạn..."
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none resize-none"
                                rows="3"
                            />
                            <div className="flex justify-end mt-3">
                                <button
                                    type="submit"
                                    disabled={submittingComment || !newComment.trim()}
                                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submittingComment ? 'Đang gửi...' : 'Gửi bình luận'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="mb-8 p-4 bg-orange-50 border-2 border-orange-200 rounded-2xl text-center">
                            <p className="text-gray-700 mb-3">
                                Vui lòng đăng nhập để bình luận
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-medium hover:shadow-lg transition"
                            >
                                Đăng nhập
                            </button>
                        </div>
                    )}

                    {/* Comments List */}
                    <div className="space-y-6">
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <div key={comment.id} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0">
                                    <div className="flex-shrink-0">
                                        {comment.user?.avatar_url ? (
                                            <img
                                                src={comment.user.avatar_url}
                                                alt={comment.user.fullName}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
                                                {comment.user?.fullName?.[0]?.toUpperCase() || '?'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-800">
                                                    {comment.user?.fullName || 'Người dùng'}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(comment.created_at).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>

                                            {user && (user.id === comment.user_id || user.role === 'admin') && (
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setOpenDropdownId(openDropdownId === comment.id ? null : comment.id)}
                                                        className="p-1.5 rounded-full hover:bg-gray-100 transition"
                                                    >
                                                        <MoreVertical size={18} className="text-gray-400" />
                                                    </button>

                                                    {openDropdownId === comment.id && (
                                                        <>
                                                            {/* Backdrop to close dropdown */}
                                                            <div
                                                                className="fixed inset-0 z-10"
                                                                onClick={() => setOpenDropdownId(null)}
                                                            />

                                                            {/* Dropdown Menu */}
                                                            <div className="absolute right-0 top-8 z-20 bg-white rounded-lg shadow-xl border border-gray-200 py-1 w-40">
                                                                <button
                                                                    onClick={() => {
                                                                        handleEditComment(comment);
                                                                        setOpenDropdownId(null);
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition flex items-center gap-2"
                                                                >
                                                                    <Edit2 size={16} />
                                                                    <span>Sửa</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        handleDeleteComment(comment.id);
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition flex items-center gap-2"
                                                                >
                                                                    <Trash2 size={16} />
                                                                    <span>Xóa</span>
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {editingCommentId === comment.id ? (
                                            <div className="mt-2">
                                                <textarea
                                                    value={editCommentContent}
                                                    onChange={(e) => setEditCommentContent(e.target.value)}
                                                    className="w-full p-3 border-2 border-orange-200 rounded-xl focus:outline-none bg-orange-50/30"
                                                    rows="2"
                                                />
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={handleUpdateComment}
                                                        className="px-4 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition"
                                                    >
                                                        Cập nhật
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingCommentId(null)}
                                                        className="px-4 py-1.5 bg-gray-100 text-gray-500 text-xs font-bold rounded-lg hover:bg-gray-200 transition"
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-2xl">
                                <p className="text-gray-500">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
                            </div>
                        )}
                    </div>
                </div>


            </main>

            <Footer />

            {/* Delete Comment Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDeleteComment}
                title="Xóa bình luận?"
                message="Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                cancelText="Hủy"
                variant="danger"
            />
        </div>
    );
};

export default RecipeDetail;

