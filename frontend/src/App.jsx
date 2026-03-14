import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// ── Lazy Load Pages (Reduces initial JS bundle size) ──────────────────
const BlogListing = lazy(() => import('./pages/BlogListing'));
const SingleBlog = lazy(() => import('./pages/SingleBlog'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Auth Pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// Admin Pages
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const CreatePost = lazy(() => import('./pages/admin/CreatePost'));
const Categories = lazy(() => import('./pages/admin/Categories'));
const EditPost = lazy(() => import('./pages/admin/EditPost'));

import { useAuth } from './hooks/useAuth';

// ── Skeleton Loader while components download ────────────────────────
const LoadingScreen = () => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center">
    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Optimizing Engine...</p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, token, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!token || !user) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  // Warm up the backend silently on first load (prevents cold-start delay)
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    fetch(`${apiUrl}/categories`, { method: 'GET', cache: 'no-store' }).catch(() => { });
  }, []);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public Routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<BlogListing />} />
          <Route path="/blog" element={<BlogListing />} />
          <Route path="/blog/:slug" element={<SingleBlog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
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
    </Suspense>
  );
}

export default App;
