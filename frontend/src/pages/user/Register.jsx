import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosClient from "../../api/axiosClient";

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        birthdate: '',
        gender: 'Nam'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.email || !formData.password || !formData.fullName || !formData.birthdate || !formData.gender) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);
        try {
            await axiosClient.post('/auth/register', {
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
                birthdate: formData.birthdate,
                gender: formData.gender
            });

            toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (err) {
            const errorMsg = err.resultMessage?.vn || err.message || 'Đăng ký thất bại';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
                        Đăng Ký
                    </h1>
                    <p className="text-gray-600">Tạo tài khoản để chia sẻ công thức</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Họ và tên
                        </label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Họ và Tên"
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none transition"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none transition"
                                required
                            />
                        </div>
                    </div>

                    {/* Birthdate and Gender Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Birthdate */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Ngày sinh
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="date"
                                    name="birthdate"
                                    value={formData.birthdate}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none transition"
                                    required
                                />
                            </div>
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Giới tính
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { value: 'Nam', label: 'Nam' },
                                    { value: 'Nữ', label: 'Nữ' },
                                    { value: 'Khác', label: 'Khác' }
                                ].map((g) => (
                                    <button
                                        key={g.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, gender: g.value })}
                                        className={`py-3 rounded-2xl font-bold text-xs transition ${formData.gender === g.value
                                            ? 'bg-orange-100 border-2 border-orange-500 text-orange-600'
                                            : 'bg-gray-50 border-2 border-transparent text-gray-500 hover:bg-gray-100'
                                            }`}
                                    >
                                        {g.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Ít nhất 6 ký tự"
                                className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none transition"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Xác nhận mật khẩu
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Nhập lại mật khẩu"
                                className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none transition"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-orange-500 font-semibold hover:underline">
                            Đăng nhập
                        </Link>
                    </p>
                </div>

                {/* Back to Home */}
                <div className="mt-4 text-center">
                    <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
                        ← Quay về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
