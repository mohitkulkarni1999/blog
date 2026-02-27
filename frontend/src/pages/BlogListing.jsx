import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, Search, ChevronRight, ChevronLeft, TrendingUp, Tag, ArrowRight, Sparkles } from 'lucide-react';
import api from '../services/api';

const BlogListing = () => {
    const [posts, setPosts] = useState([]);
    const [featuredPosts, setFeaturedPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const location = useLocation();

    // Get search and category from URL if present
    const queryParams = new URLSearchParams(location.search);
    const urlSearch = queryParams.get('search') || '';
    const urlCategory = queryParams.get('category') || '';

    const [search, setSearch] = useState(urlSearch);
    const [category, setCategory] = useState(urlCategory);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/posts?page=${page}&limit=10&search=${search}&category=${category}`);
            setPosts(data.posts || []);
            setPages(data.pages || 1);

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
        setCategory(urlCategory);
        setPage(1);
    }, [urlSearch, urlCategory]);

    useEffect(() => {
        fetchPosts();
    }, [page, search, category]);

    useEffect(() => {
        const trackSiteVisit = async () => {
            try { await api.post('/stats/visit'); } catch (err) { }
        };
        trackSiteVisit();
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        window.location.href = `/?search=${encodeURIComponent(search)}`;
    };

    return (
        <div className="bg-[#fcfcfd] dark:bg-[#0b0e14] min-h-screen pb-24 transition-colors duration-500 overflow-x-hidden">

            {/* Stunning Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-[#0b0e14] border-b border-gray-100 dark:border-white/5">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[10px] font-bold uppercase tracking-widest mb-6 border border-primary-100 dark:border-primary-800">
                            <Sparkles size={12} /> Live Updates Every Day
                        </div>
                        <h1 className="text-5xl md:text-7xl font-heading font-black text-gray-900 dark:text-white leading-[1.1] mb-8 tracking-tight">
                            Explore the world of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-indigo-500 to-primary-400">knowledge & news.</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
                            Premium insights, breaking updates, and technical deep-dives curated for professionals and tech enthusiasts.
                        </p>

                        {/* Centered Search */}
                        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative group">
                            <div className="absolute inset-0 bg-primary-500/10 blur-2xl group-hover:bg-primary-500/20 transition-all rounded-[2rem]"></div>
                            <div className="relative flex items-center bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl p-2 shadow-2xl focus-within:ring-2 focus-within:ring-primary-500/50 transition-all">
                                <Search className="ml-4 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search stories, topics, or trends..."
                                    className="flex-grow bg-transparent border-none px-4 py-3 text-gray-800 dark:text-white focus:ring-0 placeholder:text-gray-400 font-medium"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg active:scale-95">
                                    Discover
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 mt-16 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Main Content Column */}
                    <div className="lg:w-2/3 xl:w-[72%]">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-600"></div>
                            </div>
                        ) : (
                            <div className="animate-fade-in-up">
                                {/* Featured Section with Premium Styling */}
                                {page === 1 && !search && posts.length > 0 && (
                                    <div className="mb-16 group relative">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-25 transition-opacity duration-700"></div>
                                        <div className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border shadow-2xl">
                                            <div className="flex flex-col xl:flex-row">
                                                <Link to={`/blog/${posts[0].slug}`} className="xl:w-3/5 h-[300px] md:h-[450px] overflow-hidden block">
                                                    <img
                                                        src={posts[0].featured_image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80'}
                                                        alt={posts[0].title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                                    />
                                                </Link>
                                                <div className="xl:w-2/5 p-8 md:p-12 flex flex-col justify-center">
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <span className="bg-primary-600 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">Featured</span>
                                                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">{new Date(posts[0].created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                                    </div>
                                                    <h2 className="text-2xl md:text-3xl font-heading font-black text-gray-900 dark:text-white mb-5 leading-tight group-hover:text-primary-600 transition-colors">
                                                        <Link to={`/blog/${posts[0].slug}`}>{posts[0].title}</Link>
                                                    </h2>
                                                    <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed mb-8 line-clamp-3 font-medium">
                                                        {posts[0].meta_description || 'Step into the latest professional update from our team. We dive deep into market trends and technical innovations...'}
                                                    </p>
                                                    <Link to={`/blog/${posts[0].slug}`} className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-black uppercase text-xs tracking-widest hover:gap-4 transition-all">
                                                        Read Story <ArrowRight size={16} />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Heading for List */}
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-xl font-heading font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                                        <div className="w-8 h-1 bg-primary-600 rounded-full"></div> Latest Feed
                                    </h3>
                                </div>

                                {/* Article Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                                    {posts.length === 0 ? (
                                        <div className="col-span-full text-center py-24 bg-white dark:bg-dark-card rounded-3xl border border-dashed border-gray-200 dark:border-dark-border">
                                            <Search className="mx-auto text-gray-300 mb-4" size={50} />
                                            <h4 className="text-xl font-bold text-gray-400">We couldn't find any articles matching that.</h4>
                                        </div>
                                    ) : (
                                        posts.map((post, index) => {
                                            if (page === 1 && !search && index === 0) return null;
                                            return (
                                                <article key={post.id} className="group bg-white dark:bg-dark-card rounded-[2rem] overflow-hidden border border-gray-100 dark:border-dark-border shadow-soft transition-all hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full">
                                                    <Link to={`/blog/${post.slug}`} className="relative h-56 overflow-hidden block">
                                                        <img
                                                            src={post.featured_image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80'}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                            alt={post.title}
                                                        />
                                                        <div className="absolute top-4 left-4">
                                                            <span className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-md text-primary-600 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest shadow-sm">
                                                                {post.category_name || 'Update'}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                    <div className="p-8 flex flex-col flex-grow">
                                                        <Link to={`/blog/${post.slug}`}>
                                                            <h3 className="text-xl font-heading font-black text-gray-900 dark:text-white mb-3 leading-tight group-hover:text-primary-600 transition-colors">
                                                                {post.title}
                                                            </h3>
                                                        </Link>
                                                        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-6 font-medium leading-relaxed">
                                                            {post.meta_description || 'No description available for this post. Click to read the full technical article...'}
                                                        </p>
                                                        <div className="mt-auto pt-6 border-t border-gray-50 dark:border-dark-border flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 text-[10px] font-bold uppercase">
                                                                    {post.author_name ? post.author_name.charAt(0) : 'A'}
                                                                </div>
                                                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{post.author_name || 'Admin'}</span>
                                                            </div>
                                                            <span className="text-[11px] font-medium text-gray-400">{new Date(post.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </article>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Modern Pagination */}
                                {pages > 1 && (
                                    <div className="flex justify-center items-center gap-4">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center border border-gray-200 dark:border-dark-border disabled:opacity-30 hover:bg-white dark:hover:bg-dark-card transition-all"
                                        >
                                            <ChevronLeft size={20} className="dark:text-white" />
                                        </button>
                                        <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Page {page} / {pages}</span>
                                        <button
                                            onClick={() => setPage(p => Math.min(pages, p + 1))}
                                            disabled={page === pages}
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center border border-gray-200 dark:border-dark-border disabled:opacity-30 hover:bg-white dark:hover:bg-dark-card transition-all"
                                        >
                                            <ChevronRight size={20} className="dark:text-white" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar with Premium Cards */}
                    <aside className="lg:w-1/3 xl:w-[28%] space-y-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>

                        {/* Trending Sidebar */}
                        <div className="bg-white dark:bg-dark-card p-8 rounded-[2rem] shadow-soft border border-gray-100 dark:border-dark-border overflow-hidden relative">
                            <h4 className="text-lg font-heading font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
                                <TrendingUp size={22} className="text-primary-600" /> Hot Right Now
                            </h4>
                            <div className="space-y-8">
                                {featuredPosts.map((fp, i) => (
                                    <Link key={fp.id} to={`/blog/${fp.slug}`} className="flex gap-4 group">
                                        <div className="text-4xl font-black text-gray-100 dark:text-white/5 flex-shrink-0 group-hover:text-primary-100 dark:group-hover:text-primary-900/40 transition-colors">0{i + 1}</div>
                                        <div>
                                            <h5 className="text-sm font-black text-gray-800 dark:text-white leading-tight group-hover:text-primary-600 transition-colors line-clamp-2">
                                                {fp.title}
                                            </h5>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-2 tracking-widest">{fp.category_name || 'Trending'}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Topics Card */}
                        <div className="bg-white dark:bg-dark-card p-8 rounded-[2rem] shadow-soft border border-gray-100 dark:border-dark-border">
                            <h4 className="text-lg font-heading font-black text-gray-900 dark:text-white mb-6 uppercase flex items-center gap-3">
                                <Tag size={20} className="text-primary-600" /> Explore
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        to={`/?category=${cat.id}`}
                                        className="px-4 py-2 bg-gray-50 dark:bg-[#161b22] dark:border dark:border-white/5 text-gray-600 dark:text-gray-300 text-[11px] font-black rounded-xl hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 transition-all uppercase tracking-widest"
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Visual Ad / CTA */}
                        <div className="relative group overflow-hidden rounded-[2.5rem] bg-gray-900 shadow-2xl aspect-[4/5] flex items-end p-10">
                            <img
                                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80"
                                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-1000"
                                alt="Newsletter"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                            <div className="relative z-10 w-full">
                                <h4 className="text-2xl font-black text-white mb-2 leading-tight">Expert Stories, Delivered.</h4>
                                <p className="text-gray-300 text-sm mb-6 font-medium">Get the 1% knowledge others miss.</p>
                                <form className="space-y-3">
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl py-3 px-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                    <button className="w-full bg-white text-gray-900 font-black py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-primary-50 transition-colors">
                                        Subscribe Now
                                    </button>
                                </form>
                            </div>
                        </div>

                    </aside>
                </div>
            </div>
        </div>
    );
};

export default BlogListing;
