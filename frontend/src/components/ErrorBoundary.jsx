import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    // Bắt lỗi và cập nhật state
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error: error,
        };
    }

    // Log lỗi (có thể gửi lên server)
    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error);
        console.error("Component stack:", errorInfo.componentStack);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="text-6xl mb-4">Lỗi</div>

                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Đã xảy ra lỗi
                        </h1>

                        <p className="text-gray-600 mb-6">
                            Ứng dụng gặp sự cố không mong muốn. Vui lòng làm mới trang để tiếp tục.
                        </p>

                        <button
                            onClick={this.handleReload}
                            className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
                        >
                            Làm mới trang
                        </button>

                        {/* Chỉ hiển thị lỗi chi tiết khi DEV */}
                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <details className="mt-4 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500">
                                    Chi tiết lỗi
                                </summary>
                                <pre className="mt-2 p-4 bg-red-50 text-red-800 text-xs rounded overflow-auto">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
