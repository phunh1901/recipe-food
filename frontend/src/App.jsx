import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/user/Home";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import ForgotPassword from './pages/user/ForgotPassword';
import UpdatePassword from "./pages/user/UpdatePassword";
import Notifications from './pages/user/Notifications';
import CreateRecipe from "./pages/user/CreateRecipe";
import PublicProfile from './pages/user/PublicProfile';
import RecipeDetail from "./pages/user/RecipeDetail";
import MyRecipes from "./pages/user/MyRecipes";
import FavoriteRecipes from "./pages/user/FavoriteRecipes";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import AdminCategoryManagement from "./pages/admin/AdminCategoryManagement";
import AdminRecipeApproval from "./pages/admin/AdminRecipeApproval";
import SocialConnections from "./pages/user/SocialConnections";
import Profile from "./pages/user/Profile";
import Settings from "./pages/user/Settings";
import EditRecipe from "./pages/user/EditRecipe";

import UserSearch from "./pages/user/UserSearch";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Quan trọng: Đây là nơi link Gmail sẽ trỏ về */}
            <Route path="/update-password" element={<UpdatePassword />} />

            {/* Route yêu cầu đăng nhập */}
            <Route
              path="/create-recipe"
              element={
                <ProtectedRoute>
                  <CreateRecipe />
                </ProtectedRoute>
              }
            />

            {/* Recipe Detail Page */}
            <Route path="/recipe/:id" element={<RecipeDetail />} />

            {/* User Search Page */}
            <Route path="/search-users" element={<UserSearch />} />

            {/* Public Profile Page */}
            <Route path="/profile/:id" element={<PublicProfile />} />

            {/* My Recipes Page */}
            <Route
              path="/my-recipes"
              element={
                <ProtectedRoute>
                  <MyRecipes />
                </ProtectedRoute>
              }
            />

            <Route
              path="/edit-recipe/:id"
              element={
                <ProtectedRoute>
                  <EditRecipe />
                </ProtectedRoute>
              }
            />

            {/* Favorite Recipes Page */}
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <FavoriteRecipes />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/approvals"
              element={
                <ProtectedRoute adminOnly>
                  <AdminRecipeApproval />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly>
                  <AdminUserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute adminOnly>
                  <AdminCategoryManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/social-connections"
              element={
                <ProtectedRoute>
                  <SocialConnections />
                </ProtectedRoute>
              }
            />

            {/* Settings Page */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
