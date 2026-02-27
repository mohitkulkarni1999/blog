import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import BlogListing from './pages/BlogListing';
import SingleBlog from './pages/SingleBlog';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import CreatePost from './pages/admin/CreatePost';
import Categories from './pages/admin/Categories';
import EditPost from './pages/admin/EditPost';

import { useAuth } from './hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user, token, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!token || !user) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<BlogListing />} />
        <Route path="/blog/:slug" element={<SingleBlog />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Protected Routes with AdminLayout */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="create-post" element={<CreatePost />} />
        <Route path="edit-post/:id" element={<EditPost />} />
        <Route path="categories" element={<Categories />} />
      </Route>
    </Routes>
  );
}

export default App;
