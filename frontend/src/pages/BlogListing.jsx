import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, Search, ChevronRight, ChevronLeft, TrendingUp, Tag } from 'lucide-react';
import api from '../services/api';

const BlogListing = () => {
    const [posts, setPosts] = useState([]);
    const [featuredPosts, setFeaturedPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const location = useLocation();

    // Get search from URL if present
    const queryParams = new URLSearchParams(location.search);
    const urlSearch = queryParams.get('search') || '';
    const [search, setSearch] = useState(urlSearch);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/posts?page=${page}&limit=10&search=${search}`);
            setPosts(data.posts || []);
            setPages(data.pages || 1);

            // Fetch sidebar data if not already present
            if (featuredPosts.length === 0) {
                const featRes = await api.get('/posts?limit=5');
                setFeaturedPosts(featRes.data.posts || []);
            }
            if (categories.length === 0) {
                const catRes = await api.get('/categories');
                setCategories(catRes.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch posts', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setSearch(urlSearch);
        setPage(1);
    }, [urlSearch]);

    useEffect(() => {
        fetchPosts();
    }, [page, search]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchPosts();
    };

    return (
        <div className="bg-gray-50 dark:bg-dark-bg min-h-screen pt-12 pb-24 transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="mb-16 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 dark:text-white leading-tight">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Articles</span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg max-w-2xl">
                        Discover insightful articles, technical tutorials, and the latest news from our expert writers.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content Column */}
                    <div className="lg:w-2/3 xl:w-3/4">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
                            </div>
                        ) : (
                            <>
                                {/* Featured Latest Post */}
                                {page === 1 && !search && posts.length > 0 && (
                                    <div className="mb-12 group relative overflow-hidden rounded-3xl shadow-lg dark:bg-dark-card card-hover ring-1 ring-gray-100 dark:ring-dark-border">
                                        <Link to={`/blog/${posts[0].slug}`} className="block h-[400px] md:h-[500px] w-full relative bg-gray-900">
                                            <img
                                                src={posts[0].featured_image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80'}
                                                alt={posts[0].title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                                            <div className="absolute bottom-0 left-0 w-full p-8 md:p-10">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="bg-primary-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">
                                                        Featured
                                                    </span>
                                                    <span className="flex items-center text-gray-300 text-xs">
                                                        <Clock size={12} className="mr-1" />
                                                        {new Date(posts[0].created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h2 className="text-2xl md:text-4xl font-heading font-bold text-white mb-3 group-hover:text-primary-300 transition-colors max-w-4xl leading-tight">
                                                    {posts[0].title}
                                                </h2>
                                                <p className="text-gray-300 text-base line-clamp-2 max-w-2xl font-light">
                                                    {posts[0].meta_description || 'Click to read the full story...'}
                                                </p>
                                            </div>
                                        </Link>
                                    </div>
                                )}

                                {/* Article List */}
                                <div className="space-y-8">
                                    {posts.length === 0 ? (
                                        <div className="text-center py-20 bg-white dark:bg-dark-card rounded-2xl border border-dashed border-gray-300 dark:border-dark-border">
                                            <Search className="mx-auto text-gray-400 mb-4" size={48} />
                                            <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white">No results found</h3>
                                            <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search terms.</p>
                                        </div>
                                    ) : (
                                        posts.map((post, index) => {
                                            if (page === 1 && !search && index === 0) return null;

                                            return (
                                                <article key={post.id} className="group flex flex-col md:flex-row bg-white dark:bg-dark-card rounded-2xl overflow-hidden border border-gray-100 dark:border-dark-border shadow-soft card-hover transition-colors items-stretch">
                                                    <Link to={`/blog/${post.slug}`} className="relative h-56 md:h-auto md:w-1/3 lg:w-1/4 xl:w-1/5 overflow-hidden block flex-shrink-0">
                                                        <img
                                                            src={post.featured_image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80'}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                            loading="lazy"
                                                        />
                                                    </Link>
                                                    <div className="p-6 md:p-8 flex flex-col flex-grow justify-center">
                                                        <div className="flex items-center text-primary-600 dark:text-primary-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                                                            {post.category_name || 'Articles'}
                                                        </div>
                                                        <Link to={`/blog/${post.slug}`} className="block mb-2 text-gray-900 dark:text-white">
                                                            <h2 className="text-xl md:text-2xl font-heading font-bold leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                                {post.title}
                                                            </h2>
                                                        </Link>
                                                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed mb-4 font-light max-w-3xl">
                                                            {post.meta_description || 'Click here to continue reading...'}
                                                        </p>
                                                        <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                                                            <div className="flex items-center space-x-3">
                                                                <span className="flex items-center"><Clock size={12} className="mr-1" /> {new Date(post.created_at).toLocaleDateString()}</span>
                                                                <span>By {post.author_name || 'Admin'}</span>
                                                            </div>
                                                            <Link to={`/blog/${post.slug}`} className="flex items-center text-primary-600 dark:text-primary-400 hover:underline">
                                                                Read More <ChevronRight size={14} />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </article>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Pagination */}
                                {pages > 1 && (
                                    <div className="flex justify-center items-center mt-12 space-x-3">
                                        <button
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="p-2 rounded-full border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <span className="text-sm font-medium dark:text-gray-300">Page {page} of {pages}</span>
                                        <button
                                            onClick={() => setPage((p) => Math.min(pages, p + 1))}
                                            disabled={page === pages}
                                            className="p-2 rounded-full border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Sidebar Column */}
                    <aside className="lg:w-1/3 xl:w-1/4 space-y-10">
                        {/* Featured Section in Sidebar */}
                        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
                            <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <TrendingUp size={20} className="text-primary-600" /> Featured Posts
                            </h3>
                            <div className="space-y-6">
                                {featuredPosts.map((fp) => (
                                    <Link key={fp.id} to={`/blog/${fp.slug}`} className="flex gap-4 group">
                                        <img
                                            src={fp.featured_image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80'}
                                            alt={fp.title}
                                            className="w-16 h-16 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                                        />
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
                                                {fp.title}
                                            </h4>
                                            <p className="text-[10px] text-gray-400 mt-1">{new Date(fp.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Newsletter/CTA */}
                        <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-xl font-heading font-bold mb-2">Join our Newsletter</h3>
                                <p className="text-primary-100 text-sm mb-6">Receive the latest articles and stories directly in your inbox.</p>
                                <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        className="w-full bg-white/10 border border-white/20 rounded-xl py-2 px-4 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                                    />
                                    <button className="w-full bg-white text-primary-600 font-bold py-2 rounded-xl text-sm hover:bg-primary-50 transition-colors shadow-md">
                                        Subscribe
                                    </button>
                                </form>
                            </div>
                            {/* Decorative Blur */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                        </div>

                        {/* Topics/Categories */}
                        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
                            <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Tag size={20} className="text-primary-600" /> Topics
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {categories.length > 0 ? (
                                    categories.map((cat) => (
                                        <Link
                                            key={cat.id}
                                            to={`/?search=${encodeURIComponent(cat.name)}`}
                                            className="px-3 py-1.5 bg-gray-50 dark:bg-dark-border text-gray-600 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 transition-colors cursor-pointer"
                                        >
                                            {cat.name}
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 italic">No topics found.</p>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default BlogListing;
