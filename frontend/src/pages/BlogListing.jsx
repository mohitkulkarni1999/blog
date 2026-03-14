import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WeatherWidget, MarketWidget, TrendingPostsWidget, NewsletterWidget } from '../components/BlogWidgets';
import { Clock, Search, ChevronRight, ChevronLeft, TrendingUp, Tag, ArrowRight, Sparkles, Activity } from 'lucide-react';
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
            // Parallelize initial data fetch for speed
            const promises = [
                api.get(`/posts?page=${page}&limit=10&search=${search}&category=${category}`)
            ];

            if (featuredPosts.length === 0) promises.push(api.get('/posts?limit=5'));
            if (categories.length === 0) promises.push(api.get('/categories'));

            const results = await Promise.all(promises);

            setPosts(results[0].data.posts || []);
            setPages(results[0].data.pages || 1);

            let resIdx = 1;
            if (featuredPosts.length === 0) {
                setFeaturedPosts(results[resIdx].data.posts || []);
                resIdx++;
            }
            if (categories.length === 0) {
                setCategories(results[resIdx].data || []);
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

            {/* Dynamic Hero Section */}
            {page === 1 && !search && !loading && posts.length > 0 ? (
                <section className="relative w-full h-[60vh] min-h-[500px] flex items-end overflow-hidden group">
                    <div className="absolute inset-0">
                        <img
                            src={posts[0].featured_image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80'}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            alt={posts[0].title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/60 to-transparent"></div>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 pb-20 animate-fade-in-up">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-primary-600 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest shadow-neon-primary">
                                    {posts[0].category_name || 'Latest Story'}
                                </span>
                                <div className="h-px w-10 bg-white/20"></div>
                                <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">{new Date(posts[0].created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>

                            <Link to={`/blog/${posts[0].slug}`}>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white leading-tight mb-6 tracking-tighter hover:text-primary-400 transition-colors line-clamp-3">
                                    {posts[0].title}
                                </h1>
                            </Link>

                            <p className="text-gray-300 text-base md:text-lg mb-8 line-clamp-2 max-w-2xl font-medium">
                                {posts[0].meta_description || 'Click to read the full technical article from our team...'}
                            </p>

                            <div className="flex flex-wrap items-center gap-6">
                                <Link to={`/blog/${posts[0].slug}`} className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-black uppercase tracking-widest px-8 py-4 rounded-xl transition-all shadow-neon-primary hover:gap-4 flex items-center gap-2">
                                    Read Full Story <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            ) : (
                <section className="relative pt-28 md:pt-32 pb-12 md:pb-20 overflow-hidden bg-white dark:bg-[#0b0e14] border-b border-gray-100 dark:border-white/5">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="container mx-auto px-4 relative z-10 text-center animate-fade-in-up">
                        <h1 className="text-4xl md:text-5xl font-heading font-black text-gray-900 dark:text-white mb-8 tracking-tight">
                            {search ? `Search results for "${search}"` : category ? 'Explore Category' : 'All Updates'}
                        </h1>
                        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto relative group">
                            <div className="absolute inset-0 bg-primary-500/10 blur-xl group-hover:bg-primary-500/20 transition-all rounded-[2rem]"></div>
                            <div className="relative flex items-center bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-1.5 md:p-2 shadow-xl focus-within:ring-2 focus-within:ring-primary-500/50 transition-all w-full">
                                <Search className="ml-2 md:ml-4 text-gray-400 shrink-0" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search stories..."
                                    className="flex-grow w-full min-w-0 bg-transparent border-none px-2 md:px-4 py-2 text-gray-800 dark:text-white focus:ring-0 placeholder:text-gray-400 font-medium text-sm"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 md:px-6 py-2 rounded-lg transition-all shadow-lg active:scale-95 text-xs uppercase tracking-widest shrink-0">
                                    Find
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            )}

            <div className="container mx-auto px-4 mt-8 md:mt-16 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8 md:gap-12">

                    {/* Main Content Column */}
                    <div className="lg:w-2/3 xl:w-[72%]">
                        {loading ? (
                            <div className="flex justify-center py-10 md:py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-600"></div>
                            </div>
                        ) : (
                            <div className="animate-fade-in-up">

                                {/* Horizontal Explore Categories */}
                                {categories && categories.length > 0 && (
                                    <div className="mb-8 md:mb-10 w-full overflow-hidden">
                                        <div className="flex items-center w-full overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                                            <div className="flex items-stretch sticky left-0 z-10">
                                                <div className="flex items-center gap-2 pr-4 bg-[#fcfcfd] dark:bg-[#0b0e14]">
                                                    <Tag size={16} className="text-primary-600 shrink-0" />
                                                    <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest shrink-0">Explore:</span>
                                                </div>
                                                <div className="w-12 bg-gradient-to-r from-[#fcfcfd] dark:from-[#0b0e14] to-transparent pointer-events-none"></div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-nowrap pr-4">
                                                {categories.map((cat) => (
                                                    <Link
                                                        key={cat.id}
                                                        to={`/?category=${cat.id}`}
                                                        className="px-4 py-2 bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-300 text-[10px] font-black rounded-lg hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 hover:border-primary-600 transition-all uppercase tracking-widest shrink-0 whitespace-nowrap shadow-sm"
                                                    >
                                                        {cat.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Heading for List */}
                                <div className="flex items-center justify-between mb-6 md:mb-10">
                                    <h3 className="text-xl font-heading font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                                        <div className="w-8 h-1 bg-primary-600 rounded-full"></div> Latest Feed
                                    </h3>
                                </div>

                                {/* Article Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10 md:mb-16">
                                    {posts.length === 0 ? (
                                        <div className="col-span-full text-center py-24 bg-white dark:bg-dark-card rounded-3xl border border-dashed border-gray-200 dark:border-dark-border">
                                            <Search className="mx-auto text-gray-300 mb-4" size={50} />
                                            <h4 className="text-xl font-bold text-gray-400">We couldn't find any articles matching that.</h4>
                                        </div>
                                    ) : (
                                        posts.map((post, index) => {
                                            if (page === 1 && !search && index === 0) {
                                                return (
                                                    <div key={post.id} className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border shadow-2xl col-span-full">
                                                        <div className="flex flex-col xl:flex-row">
                                                            <Link to={`/blog/${post.slug}`} className="xl:w-3/5 h-[250px] md:h-[450px] overflow-hidden block">
                                                                <img
                                                                    src={post.featured_image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80'}
                                                                    alt={post.title}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                                                />
                                                            </Link>
                                                            <div className="xl:w-2/5 p-6 md:p-12 flex flex-col justify-center">
                                                                <div className="flex items-center gap-3 mb-4 md:mb-6">
                                                                    <span className="bg-primary-600 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest shadow-neon-primary">
                                                                        {post.category_name || 'Latest Story'}
                                                                    </span>
                                                                    <div className="h-px w-10 bg-white/20"></div>
                                                                    <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">{new Date(post.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                                                </div>
                                                                <Link to={`/blog/${post.slug}`}>
                                                                    <h2 className="text-2xl md:text-3xl font-heading font-black text-gray-900 dark:text-white mb-3 md:mb-5 leading-tight group-hover:text-primary-600 transition-colors">
                                                                        {post.title}
                                                                    </h2>
                                                                </Link>
                                                                <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base leading-relaxed mb-6 md:mb-8 line-clamp-3 font-medium">
                                                                    {post.meta_description || 'Click to read the full technical article from our team...'}
                                                                </p>
                                                                <Link to={`/blog/${post.slug}`} className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-neon-primary hover:gap-4 flex items-center gap-2 w-fit">
                                                                    Read Full Story <ArrowRight size={16} />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
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
                    <aside className="lg:w-1/3 xl:w-[28%] space-y-6 md:space-y-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>

                        {/* Trending Sidebar */}
                        <div className="bg-white dark:bg-dark-card p-6 md:p-8 rounded-3xl md:rounded-[2rem] shadow-soft border border-gray-100 dark:border-dark-border overflow-hidden relative">
                            <h4 className="text-lg font-heading font-black text-gray-900 dark:text-white mb-6 md:mb-8 flex items-center gap-3 uppercase tracking-tighter">
                                <TrendingUp size={22} className="text-primary-600" /> Hot Right Now
                            </h4>
                            <div className="space-y-5">
                                {featuredPosts.map((fp, i) => (
                                    <Link key={fp.id} to={`/blog/${fp.slug}`} className="flex gap-3 group items-center">
                                        {/* Thumbnail */}
                                        <div className="flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-bg">
                                            {fp.featured_image ? (
                                                <img
                                                    src={fp.featured_image}
                                                    alt={fp.title}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-black text-lg">
                                                    {String(i + 1).padStart(2, '0')}
                                                </div>
                                            )}
                                        </div>
                                        {/* Text */}
                                        <div className="flex-1 min-w-0">
                                            <h5 className="text-sm font-bold text-gray-800 dark:text-white leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                                                {fp.title}
                                            </h5>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-widest truncate">{fp.category_name || 'Trending'}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <WeatherWidget />
                        <MarketWidget />
                        <TrendingPostsWidget posts={featuredPosts} />

                        {/* Advertisement Space */}
                        <div className="bg-gray-50 dark:bg-white/5 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[2rem] p-8 text-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Advertisement Space</span>
                            <div className="h-40 flex items-center justify-center">
                                <p className="text-gray-400 text-xs italic">Place your Google AdSense code here</p>
                            </div>
                        </div>

                        <NewsletterWidget />

                    </aside>
                </div>

                {/* Categories Grid at the Bottom */}
                <div className="mt-24 mb-12">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="h-px bg-gray-100 dark:bg-white/5 flex-grow"></div>
                        <h3 className="text-sm font-black uppercase tracking-[0.4em] text-gray-400">Trending Categories</h3>
                        <div className="h-px bg-gray-100 dark:bg-white/5 flex-grow"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.slice(0, 6).map(cat => (
                            <Link 
                                key={cat.id} 
                                to={`/?category=${cat.id}`}
                                className="group relative h-32 rounded-3xl overflow-hidden bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center gap-2 hover:border-primary-500 transition-all font-black text-xs uppercase tracking-widest text-gray-900 dark:text-white"
                            >
                                <div className="absolute inset-0 bg-primary-600 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                                <Activity size={24} className="text-primary-600 group-hover:scale-125 transition-transform" />
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogListing;
