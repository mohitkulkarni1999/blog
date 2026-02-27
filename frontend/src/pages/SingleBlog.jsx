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
    const { token } = useAuth(); // Assuming this provides auth status

    const fetchPost = async () => {
        try {
            const { data } = await api.get(`/posts/${slug}`);
            setPost({
                ...data,
                averageRating: data.averageRating || '0.0',
                totalRatings: data.totalRatings || 0,
                view_count: data.view_count || 0
            });

            // Fetch comments for all users
            if (data.id) {
                const commentsRes = await api.get(`/comments/post/${data.id}`);
                setComments(commentsRes.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch post', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPost();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug, token]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !post || !token) return;
        try {
            await api.post('/comments', { post_id: post.id, comment: newComment });
            setNewComment('');
            alert('Comment submitted for approval!');
        } catch {
            alert('Must be logged in to comment');
        }
    };

    const handleRate = async (ratingVal) => {
        if (!token) {
            alert('Please login to rate this post.');
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
            alert('Thank you for your rating!');
        } catch {
            alert('Failed to submit rating.');
        } finally {
            setIsSubmittingRating(false);
        }
    };

    const cleanContent = post?.content ? DOMPurify.sanitize(post.content) : '';

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!post) {
        return <div className="text-center py-20 text-xl font-heading font-medium dark:text-white">Post not found. <Link to="/blog" className="text-primary-600 underline">Return.</Link></div>;
    }

    return (
        <article className="bg-white dark:bg-dark-bg transition-colors duration-300 min-h-screen">

            {/* Hero Section */}
            <header className="relative w-full h-[50vh] min-h-[400px] flex items-end justify-center bg-gray-900 overflow-hidden">
                <img
                    src={post.featured_image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80'}
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                    alt={post.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-16 pt-32 max-w-4xl">
                    <Link to="/blog" className="inline-flex items-center text-primary-300 hover:text-white mb-6 transition-colors text-sm font-medium uppercase tracking-wider group">
                        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Blog
                    </Link>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="bg-primary-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
                            {post.category_name || 'General'}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white leading-tight drop-shadow-lg mb-6">
                        {post.title}
                    </h1>
                    <div className="flex flex-wrap items-center text-gray-300 text-sm gap-6 font-medium">
                        <span className="flex items-center gap-2"><User size={16} className="text-primary-400" /> By {post.author_name || 'Admin'}</span>
                        <span className="flex items-center gap-2"><Clock size={16} className="text-primary-400" /> {new Date(post.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center gap-2"><Eye size={16} className="text-primary-400" /> {post.view_count} Views</span>
                        <span className="flex items-center gap-2 text-yellow-500"><Star size={16} fill="currentColor" /> {post.averageRating} ({post.totalRatings})</span>
                        <button className="flex items-center gap-2 hover:text-white transition-colors ml-auto"><Share2 size={16} /> Share</button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="max-w-3xl mx-auto">
                    {/* Prose for Markdown/HTML content styling */}
                    <div className="prose prose-lg dark:prose-dark max-w-none font-sans prose-img:rounded-xl prose-img:shadow-soft">
                        {parse(cleanContent)}
                    </div>

                    {/* Additional Images Gallery */}
                    {post.additional_images && post.additional_images.length > 0 && (
                        <div className="mt-16">
                            <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-6">Article Gallery</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {post.additional_images.map((img, idx) => (
                                    <div key={idx} className="group overflow-hidden rounded-2xl shadow-soft border border-gray-100 dark:border-dark-border aspect-video">
                                        <img
                                            src={img}
                                            alt={`Gallery ${idx + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Author Bio (Placeholder for future) */}
                    <div className="mt-16 py-8 border-y border-gray-100 dark:border-dark-border flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white font-heading font-bold text-2xl shadow-neon flex-shrink-0">
                            {post.author_name ? post.author_name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                            <h4 className="font-heading font-bold text-gray-900 dark:text-white text-lg">Written by {post.author_name || 'Admin'}</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Passionate developer and technical writer sharing knowledge about full-stack web development and design.</p>
                        </div>
                    </div>

                    {/* Interactive Post Actions (Rating) */}
                    <div className="mt-8 mb-16 flex flex-col items-center p-8 bg-gray-50 dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm">
                        <h4 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-4">Rate this Article</h4>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleRate(star)}
                                    onMouseEnter={() => setRatingHover(star)}
                                    onMouseLeave={() => setRatingHover(0)}
                                    disabled={isSubmittingRating}
                                    className={`transition-colors p-1 ${isSubmittingRating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Star
                                        size={32}
                                        className={`${(ratingHover || 0) >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'} hover:scale-110 transition-transform`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Current Rating: <span className="font-bold text-gray-900 dark:text-white">{post.averageRating}</span>/5 ({post.totalRatings} ratings)</p>
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
                            <button type="submit" className="btn-primary" onClick={(e) => {
                                e.preventDefault();
                                const name = document.getElementById('guestName').value;
                                if (!newComment.trim()) return;
                                api.post('/comments', { post_id: post.id, comment: newComment, guest_name: name })
                                    .then(() => {
                                        setNewComment('');
                                        document.getElementById('guestName').value = '';
                                        alert('Comment submitted for approval!');
                                    }).catch(err => {
                                        alert('Failed to submit comment');
                                    });
                            }}>Post Comment</button>
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
