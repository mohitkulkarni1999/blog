import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Share2, Clock, User, ArrowLeft, Send, Star, Eye } from 'lucide-react';
import api from '../services/api';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import { useAuth } from '../hooks/useAuth';

const SingleBlog = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [ratingHover, setRatingHover] = useState(0);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const { token } = useAuth();

    const fetchPost = async () => {
        try {
            const { data } = await api.get(`/posts/${slug}`);

            const postData = {
                ...data,
                averageRating: data.averageRating || '0.0',
                totalRatings: data.totalRatings || 0,
                view_count: data.view_count || 0
            };
            setPost(postData);
            setComments(data.comments || []);
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
        <article className="bg-[#fcfcfd] dark:bg-[#0b0e14] transition-colors duration-500 min-h-screen pb-20">

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
                            src={post.featured_image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80'}
                            className="w-full h-auto max-h-[750px] object-contain mx-auto block"
                            alt={post.title}
                            loading="eager"
                            fetchpriority="high"
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
                    <section className="mt-16">
                        <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-8">Comments ({comments.length})</h3>

                        {/* Comment Form */}
                        <form onSubmit={handleCommentSubmit} className="mb-12 bg-gray-50 dark:bg-dark-card p-6 rounded-2xl border border-gray-100 dark:border-dark-border shadow-soft">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><Send size={18} className="text-primary-500" /> Leave a Reply</h4>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    className="input-field mb-4 max-w-sm"
                                    id="guestName"
                                />
                            </div>
                            <textarea
                                value={newComment}
                                id="commentText"
                                onChange={(e) => setNewComment(e.target.value)}
                                className="input-field min-h-[120px] resize-y mb-4"
                                placeholder="Share your thoughts..."
                                required
                            />
                            <button type="submit" className="btn-primary">Post Comment</button>
                        </form>

                        {/* Comment List */}
                        <div className="space-y-8">
                            {comments.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-8 italic bg-gray-50 dark:bg-dark-card rounded-xl">Be the first to comment!</p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold flex-shrink-0">
                                            {comment.user_name ? comment.user_name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div className="bg-gray-50 dark:bg-dark-card p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-dark-border flex-grow">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-heading font-semibold text-gray-900 dark:text-white">{comment.user_name}</span>
                                                <span className="text-xs text-gray-400"><Clock size={12} className="inline mr-1" />{new Date(comment.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{comment.comment}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </article>
    );
};

export default SingleBlog;
