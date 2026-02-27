import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FileText,
    Users,
    Eye,
    Plus,
    Edit,
    Trash2,
    Globe,
    Star,
    MessageSquare,
    TrendingUp,
    BarChart3,
    UserCircle,
    RotateCw
} from 'lucide-react';
import api from '../../services/api';

const Dashboard = () => {
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState({
        totalPosts: 0,
        totalBlogViews: 0,
        totalComments: 0,
        totalSiteVisits: 0,
        uniqueVisitors: 0,
        repeatViews: 0,
        averageRating: 0,
        totalRatings: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [postsRes, statsRes] = await Promise.all([
                api.get('/posts/admin?limit=10'),
                api.get('/stats')
            ]);
            setPosts(postsRes.data.posts || []);
            setStats(statsRes.data || {
                totalPosts: 0,
                totalBlogViews: 0,
                totalComments: 0,
                totalSiteVisits: 0,
                uniqueVisitors: 0,
                repeatViews: 0,
                averageRating: 0,
                totalRatings: 0
            });
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await api.delete(`/posts/${id}`);
                fetchData();
            } catch (error) {
                console.error('Failed to delete post', error);
                alert('Failed to delete post.');
            }
        }
    };

    const statCards = [
        {
            title: 'Total Site Visits',
            value: stats.totalSiteVisits,
            icon: <Globe size={24} />,
            color: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30',
            desc: 'Total home page visitors'
        },
        {
            title: 'Unique Visitors',
            value: stats.uniqueVisitors,
            icon: <UserCircle size={24} />,
            color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
            desc: 'Individual unique devices'
        },
        {
            title: 'Returning Views',
            value: stats.repeatViews,
            icon: <RotateCw size={24} />,
            color: 'text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/30',
            desc: 'Repeated views from same IPs'
        },
        {
            title: 'Total Posts',
            value: stats.totalPosts,
            icon: <FileText size={24} />,
            color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
            desc: 'Articles published'
        },
        {
            title: 'Blog Reads',
            value: stats.totalBlogViews,
            icon: <Eye size={24} />,
            color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
            desc: 'Total article views'
        },
        {
            title: 'Total Posts',
            value: stats.totalPosts,
            icon: <FileText size={24} />,
            color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
            desc: 'Articles published'
        },
        {
            title: 'Comments',
            value: stats.totalComments,
            icon: <MessageSquare size={24} />,
            color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
            desc: 'Reader interactions'
        },
        {
            title: 'Avg Rating',
            value: `${stats.averageRating}/5`,
            icon: <Star size={24} />,
            color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
            desc: `From ${stats.totalRatings} ratings`
        },
        {
            title: 'Engagement',
            value: stats.totalPosts > 0 ? (stats.totalBlogViews / stats.totalPosts).toFixed(1) : 0,
            icon: <TrendingUp size={24} />,
            color: 'text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30',
            desc: 'Avg views per post'
        },
    ];

    return (
        <div className="space-y-8 pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Admin Overview</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time statistics and blog performance tracking.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/admin/create-post" className="btn-primary flex items-center gap-2 py-2.5 px-5 shadow-lg text-sm">
                        <Plus size={18} /> Create New Article
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-soft border border-gray-100 dark:border-dark-border flex flex-col items-center text-center group hover:border-primary-500 transition-all duration-300">
                        <div className={`p-3 rounded-xl mb-4 transition-transform group-hover:scale-110 ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{stat.title}</p>
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</h4>
                        <p className="text-[10px] text-gray-400 mt-1.5 line-clamp-1">{stat.desc}</p>
                    </div>
                ))}
            </div>

            {/* Performance Table */}
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-soft border border-gray-100 dark:border-dark-border overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-dark-border flex justify-between items-center bg-gray-50/30 dark:bg-dark-bg/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg">
                            <BarChart3 size={20} />
                        </div>
                        <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white">Article Performance</h3>
                    </div>
                    <button onClick={fetchData} className="text-sm text-primary-600 hover:text-primary-700 font-bold">
                        Refresh Data
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center py-24">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-dark-bg/50 text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-100 dark:border-dark-border">
                                    <th className="px-8 py-4">Article Details</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-4 py-4 text-center"><Eye size={14} className="mx-auto" /></th>
                                    <th className="px-4 py-4 text-center"><Star size={14} className="mx-auto" /></th>
                                    <th className="px-4 py-4 text-center"><MessageSquare size={14} className="mx-auto" /></th>
                                    <th className="px-8 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                                {posts.map((post) => (
                                    <tr key={post.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-bg/30 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={post.featured_image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80'}
                                                    alt={post.title}
                                                    className="w-12 h-12 rounded-xl object-cover shadow-sm bg-gray-100 dark:bg-dark-border"
                                                />
                                                <div>
                                                    <p className="font-heading font-bold text-gray-900 dark:text-white line-clamp-1 text-sm">{post.title}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1">Created on {new Date(post.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-2.5 py-1 bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                                                {post.category_name || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${post.status === 'published'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                }`}>
                                                {post.status || 'draft'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-5 text-center font-bold text-gray-700 dark:text-gray-300 text-sm">
                                            {post.view_count || 0}
                                        </td>
                                        <td className="px-4 py-5 text-center">
                                            <div className="flex items-center justify-center gap-1 text-sm font-bold text-amber-500">
                                                <Star size={12} fill="currentColor" />
                                                <span>{post.avg_rating || '0.0'}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{post.rating_count} rates</p>
                                        </td>
                                        <td className="px-4 py-5 text-center font-bold text-gray-700 dark:text-gray-300 text-sm">
                                            {/* We don't have per-post comment count in the JOINed query yet, but we can show 0 for now or update query */}
                                            {/* Note: In a real app, you'd add COALESCE((SELECT COUNT(*) FROM comments WHERE post_id = p.id), 0) to the query */}
                                            -
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-end gap-3 text-right">
                                                <Link to={`/blog/${post.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all" title="View Live">
                                                    <Eye size={18} />
                                                </Link>
                                                <Link to={`/admin/edit-post/${post.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="Edit Article">
                                                    <Edit size={18} />
                                                </Link>
                                                <button onClick={() => handleDelete(post.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Delete">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {posts.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-16 text-gray-500 italic">No articles found. Ready to write your first story?</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
