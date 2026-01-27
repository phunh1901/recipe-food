import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Facebook, Instagram, Twitter, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white mt-20">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="text-3xl font-black mb-4">RecipeFood</h2>
                        <p className="text-blue-100 mb-4 leading-relaxed">
                            Nền tảng chia sẻ công thức nấu ăn hàng đầu Bách Khoa.
                            Khám phá hàng ngàn món ăn từ khắp mọi miền Đại Cồ Việt.
                        </p>
                        <div className="flex gap-3">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition">
                                <Facebook size={20} />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition">
                                <Instagram size={20} />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition">
                                <Twitter size={20} />
                            </a>
                            <a href="https://phunh1901@gmail.com" target="_blank" rel="noopener noreferrer"
                                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Khám phá</h3>
                        <ul className="space-y-2 text-blue-100">
                            <li>
                                <Link to="/" className="hover:text-white transition" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Trang chủ</Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:text-white transition" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Công thức</Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:text-white transition" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Danh mục</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Hỗ trợ</h3>
                        <ul className="space-y-2 text-blue-100">
                            <li>
                                <Link to="/" className="hover:text-white transition" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Trợ giúp</Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:text-white transition" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Chính sách</Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:text-white transition" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Điều khoản</Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:text-white transition" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Liên hệ</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/20 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-blue-100">
                        © Ngo Hoang Phu - 20225062. RecipeFood from SOICT - HUST
                    </p>

                </div>
            </div>
        </footer>
    );
};

export default Footer;
