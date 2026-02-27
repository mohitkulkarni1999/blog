import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
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

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#fcfcfd] dark:bg-[#0b0e14]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-600"></div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, token, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!token || !user) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
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
