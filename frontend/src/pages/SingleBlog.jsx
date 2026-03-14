import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Share2, Clock, User, ArrowLeft, Send, Star, Eye, Facebook, Twitter, Linkedin, Link2 } from 'lucide-react';
import api from '../services/api';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import { useAuth } from '../hooks/useAuth';
import { RelatedPostsGrid } from '../components/BlogWidgets';

const SingleBlog = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [ratingHover, setRatingHover] = useState(0);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const { token } = useAuth();

    const [scrollProgress, setScrollProgress] = useState(0);

    const fetchPost = async () => {
        try {
            const { data } = await api.get(`/posts/${slug}`);
            setPost({
                ...data,
                averageRating: data.averageRating || '0.0',
                totalRatings: data.totalRatings || 0,
                view_count: data.view_count || 0
            });

            if (data.id) {
                const [commentsRes, relatedRes] = await Promise.all([
                    api.get(`/comments/post/${data.id}`),
                    api.get(`/posts?limit=3`)
                ]);
                setComments(commentsRes.data || []);
                setRelatedPosts(relatedRes.data?.posts?.filter(p => p.id !== data.id) || []);
            }
        } catch (error) {
            console.error('Failed to fetch post', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPost();
        window.scrollTo(0, 0);
    }, [slug, token]);

    // Calculate Reading Progress
    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scroll = `${(totalScroll / windowHeight) * 100}%`;
            setScrollProgress(scroll);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('guestName');
        const name = nameInput ? nameInput.value : '';
        if (!newComment.trim()) return;
        try {
            await api.post('/comments', { post_id: post.id, comment: newComment, guest_name: name });
            setNewComment('');
            if (nameInput) nameInput.value = '';
            alert('Comment submitted for approval!');
        } catch (err) {
            alert('Failed to submit comment');
        }
    };

    const handleRate = async (ratingVal) => {
        if (!token) {
            alert('Please login to rate this article.');
            return;
        }
        setIsSubmittingRating(true);
        try {
            const { data } = await api.post(`/posts/${post.id}/rate`, { rating: ratingVal });
            setPost(prev => ({
                ...prev,
                averageRating: data.averageRating,
                totalRatings: data.totalRatings
            }));
            alert('Rating submitted!');
        } catch {
            alert('Failed to rate.');
        } finally {
            setIsSubmittingRating(false);
        }
    };

    const cleanContent = post?.content ? DOMPurify.sanitize(post.content) : '';

    // ── Optimize Cloudinary URLs for Core Web Vitals ───────────────────────
    const optimizeImgUrl = (url) => {
        if (!url) return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80';
        if (url.includes('cloudinary.com') && !url.includes('upload/q_auto,f_auto,w_1200,c_fill')) {
            return url.replace('/upload/', '/upload/q_auto,f_auto,w_1200,c_fill/');
        }
        return url;
    };
    const optimizedImage = optimizeImgUrl(post?.featured_image);

    // ── Inject JSON-LD structured data for SEO ───────────────────────────────
    useEffect(() => {
        if (!post) return;
        const schema = {
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            'headline': post.title,
            'description': post.meta_description || post.title,
            'image': [optimizedImage],
            'datePublished': post.created_at,
            'dateModified': post.updated_at || post.created_at,
            'author': {
                '@type': 'Person',
                'name': post.author_name || 'DailyUpdatesHub Editorial Team',
                'url': 'https://dailyupdateshub.in/about'
            },
            'publisher': {
                '@type': 'Organization',
                'name': 'DailyUpdatesHub',
                'logo': {
                    '@type': 'ImageObject',
                    'url': 'https://dailyupdateshub.in/favicon.png'
                },
                'url': 'https://dailyupdateshub.in'
            },
            'mainEntityOfPage': {
                '@type': 'WebPage',
                '@id': `https://dailyupdateshub.in/blog/${post.slug}`
            },
            'articleSection': post.category_name || 'News',
            'inLanguage': 'en-IN'
        };
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'article-schema';
        script.text = JSON.stringify(schema);
        // Remove old schema if exists
        const old = document.getElementById('article-schema');
        if (old) old.remove();
        document.head.appendChild(script);
        // Also update page title & meta description dynamically
        document.title = `${post.meta_title || post.title} | DailyUpdatesHub`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && post.meta_description) metaDesc.setAttribute('content', post.meta_description);
        return () => {
            const s = document.getElementById('article-schema');
            if (s) s.remove();
        };
    }, [post]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#fcfcfd] dark:bg-[#0b0e14]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-600"></div>
            </div>
        );
    }

    if (!post) {
        return <div className="text-center py-40 bg-[#fcfcfd] dark:bg-[#0b0e14] min-h-screen">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Post not found.</h2>
            <Link to="/" className="text-primary-600 font-bold underline mt-4 inline-block">Return to Feed</Link>
        </div>;
    }

    return (
        <article className="bg-[#fcfcfd] dark:bg-[#0b0e14] transition-colors duration-500 min-h-screen pb-20 relative">

            {/* Sticky Reading Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1.5 md:h-2 bg-gray-200 dark:bg-white/5 z-[60]">
                <div
                    className="h-full bg-gradient-to-r from-primary-600 to-indigo-500 transition-all duration-150 ease-out shadow-neon-primary"
                    style={{ width: scrollProgress }}
                />
            </div>

            {/* Mobile-Optimized Floating Social Dock */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:-translate-x-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:right-8 z-50 flex md:flex-col gap-2 md:gap-3 bg-white/90 dark:bg-[#0b0e14]/90 backdrop-blur-xl p-3 md:p-4 rounded-full md:rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-2xl transition-all duration-500 animate-fade-in-up">
                <button
                    onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${encodeURIComponent(post.title)}`, '_blank')}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-50 dark:bg-white/5 hover:bg-[#1DA1F2] hover:text-white dark:hover:bg-[#1DA1F2] text-gray-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    aria-label="Share on Twitter"
                >
                    <Twitter size={20} className="md:w-6 md:h-6" />
                </button>
                <button
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-50 dark:bg-white/5 hover:bg-[#4267B2] hover:text-white dark:hover:bg-[#4267B2] text-gray-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    aria-label="Share on Facebook"
                >
                    <Facebook size={20} className="md:w-6 md:h-6" />
                </button>
                <button
                    onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}&title=${encodeURIComponent(post.title)}`, '_blank')}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-50 dark:bg-white/5 hover:bg-[#0077b5] hover:text-white dark:hover:bg-[#0077b5] text-gray-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    aria-label="Share on LinkedIn"
                >
                    <Linkedin size={20} className="md:w-6 md:h-6" />
                </button>
                <div className="w-px h-6 md:w-6 md:h-px bg-gray-200 dark:bg-white/10 mx-1 md:mx-auto my-auto md:my-1"></div>
                <button
                    onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 focus:bg-emerald-500 focus:text-white focus:ring-4 focus:ring-emerald-500/30 text-primary-600 dark:text-primary-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    aria-label="Copy Link"
                >
                    <Link2 size={20} className="md:w-6 md:h-6" />
                </button>
            </div>

            {/* Content Header Section */}
            <header className="relative w-full bg-[#0b0e14] pt-28 md:pt-32 pb-12 md:pb-20 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-primary-600/10 blur-[100px] rounded-full"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <Link to="/" className="inline-flex items-center gap-2 text-primary-400 hover:text-white mb-8 font-black uppercase text-[10px] tracking-widest transition-all hover:-translate-x-2">
                            <ArrowLeft size={14} /> Back to Hub
                        </Link>

                        <div className="flex items-center justify-center gap-3 mb-8">
                            <span className="bg-primary-600 text-white text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest shadow-neon-primary">
                                {post.category_name || 'Insights'}
                            </span>
                            <div className="h-px w-8 bg-white/10"></div>
                            <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Global Post</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-black text-white leading-tight mb-10 tracking-tighter">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs">
                                    {post.author_name ? post.author_name.charAt(0) : 'A'}
                                </div>
                                <span className="text-white">{post.author_name || 'Admin'}</span>
                            </div>
                            <span className="flex items-center gap-2 border-l border-white/10 pl-8"><Clock size={12} className="text-primary-500" /> {new Date(post.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            <span className="flex items-center gap-2 border-l border-white/10 pl-8"><Eye size={12} className="text-primary-500" /> {post.view_count} Views</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Featured Image - Responsive Aspect Ratio */}
            <div className="container mx-auto px-4 -mt-6 md:-mt-10 mb-10 md:mb-20 relative z-20">
                <div className="max-w-5xl mx-auto">
                    <div className="relative overflow-hidden rounded-2xl md:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] md:shadow-[0_40px_100px_rgba(0,0,0,0.5)] bg-gray-900 border border-white/5">
                        <img
                            src={optimizedImage}
                            className="w-full h-auto max-h-[750px] object-contain mx-auto block"
                            alt={post.title}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto animate-fade-in-up">

                    {/* Sanitized HTML Content */}
                    <div className="prose prose-lg dark:prose-invert max-w-none font-medium text-gray-700 dark:text-gray-300 leading-relaxed
                                  prose-headings:font-black prose-headings:tracking-tight prose-headings:text-gray-900 dark:prose-headings:text-white
                                  prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:font-black
                                  prose-img:rounded-[2rem] prose-img:shadow-2xl prose-blockquote:border-primary-600 prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-white/5 prose-blockquote:p-6 prose-blockquote:rounded-2xl">
                        {parse(cleanContent)}
                    </div>

                    {/* Author Signature */}
                    <div className="mt-12 md:mt-20 p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] glass-card border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-left">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-[2rem] bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-black text-3xl md:text-4xl shadow-neon-primary flex-shrink-0">
                            {post.author_name ? post.author_name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                            <h4 className="text-xl font-heading font-black text-gray-900 dark:text-white uppercase tracking-tight">Written by {post.author_name || 'Admin'}</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-base mt-2 font-medium">Industry expert specializing in technical storytelling and innovative digital solutions. Dedicated to bringing you the most accurate and insightful updates daily.</p>
                        </div>
                    </div>

                    {/* Rating Interactive */}
                    <div className="mt-8 md:mt-12 bg-white dark:bg-dark-card p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl flex flex-col items-center">
                        <h4 className="text-base md:text-lg font-heading font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4 md:mb-6">Enjoyed this story?</h4>
                        <div className="flex items-center gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleRate(star)}
                                    onMouseEnter={() => setRatingHover(star)}
                                    onMouseLeave={() => setRatingHover(0)}
                                    className="transition-transform hover:scale-125"
                                >
                                    <Star
                                        size={36}
                                        className={`${(ratingHover || 0) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-white/10'} transition-colors`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="mt-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Rating: {post.averageRating} / 5.0</p>
                    </div>

                    {/* Comments Section */}
                    <section className="mt-16 md:mt-24">

                        {/* Section Header */}
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <h3 className="text-2xl md:text-3xl font-heading font-black text-gray-900 dark:text-white tracking-tight">
                                    Discussion
                                </h3>
                                <span className="px-3 py-1 bg-primary-600 text-white text-xs font-black rounded-full shadow-neon-primary">
                                    {comments.length}
                                </span>
                            </div>
                            {comments.length > 0 && (
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest hidden md:block">
                                    {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                                </span>
                            )}
                        </div>

                        {/* Comment List */}
                        <div className="space-y-6 mb-12">
                            {comments.length === 0 ? (
                                <div className="text-center py-14 px-6 bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-white/5 shadow-soft">
                                    <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500 mx-auto mb-4">
                                        <Send size={28} />
                                    </div>
                                    <h4 className="text-lg font-black text-gray-900 dark:text-white mb-2">Start the conversation</h4>
                                    <p className="text-gray-400 text-sm">Be the first to share your thoughts on this article.</p>
                                </div>
                            ) : (
                                comments.map((comment, idx) => {
                                    const initials = (comment.user_name || 'U').charAt(0).toUpperCase();
                                    const gradients = [
                                        'from-violet-500 to-purple-600',
                                        'from-blue-500 to-cyan-500',
                                        'from-emerald-500 to-teal-600',
                                        'from-orange-500 to-rose-500',
                                        'from-pink-500 to-fuchsia-600',
                                    ];
                                    const gradient = gradients[idx % gradients.length];
                                    return (
                                        <div key={comment.id} className="flex gap-4 group">
                                            {/* Avatar */}
                                            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-base flex-shrink-0 shadow-md mt-1`}>
                                                {initials}
                                            </div>
                                            {/* Bubble */}
                                            <div className="flex-1 bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-3xl rounded-tl-lg p-5 shadow-soft group-hover:border-primary-200 dark:group-hover:border-primary-900/50 transition-colors">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="font-black text-gray-900 dark:text-white text-sm">
                                                        {comment.user_name || 'Anonymous'}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                        <Clock size={10} />
                                                        {new Date(comment.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{comment.comment}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Comment Form */}
                        <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-white/5 shadow-soft overflow-hidden">
                            {/* Form Header */}
                            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 px-6 md:px-8 py-5 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Send size={14} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="font-black text-white text-sm uppercase tracking-wider">Leave a Comment</h4>
                                    <p className="text-white/60 text-[10px] font-medium mt-0.5">Comments are reviewed before being published</p>
                                </div>
                            </div>

                            {/* Form Body */}
                            <form onSubmit={handleCommentSubmit} className="p-6 md:p-8 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="guestName" className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Your Name *</label>
                                        <input
                                            type="text"
                                            id="guestName"
                                            className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/5 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Email <span className="text-gray-300 dark:text-white/20 font-normal normal-case">(optional, not shown)</span></label>
                                        <input
                                            type="email"
                                            className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/5 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="commentText" className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Your Thoughts *</label>
                                    <textarea
                                        id="commentText"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/5 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all min-h-[130px] resize-y"
                                        placeholder="What do you think about this article? Share your perspective..."
                                        required
                                    />
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <p className="text-[10px] text-gray-400 font-medium">* Required fields. Comments pending moderation.</p>
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-black text-xs uppercase tracking-widest px-6 py-3 rounded-2xl transition-all hover:shadow-neon-primary hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        <Send size={14} /> Post Comment
                                    </button>
                                </div>
                            </form>
                        </div>

                    </section>
                </div>
            </div>

            {/* Related Posts Section embedded here */}
            <div className="container mx-auto px-4 max-w-4xl pt-10">
                <RelatedPostsGrid posts={relatedPosts} />
            </div>

        </article>
    );
};

export default SingleBlog;
