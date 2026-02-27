import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, Eye, Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';

const Dashboard = () => {
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState({ totalPosts: 0, totalViews: 0, totalComments: 0 });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [postsRes, statsRes] = await Promise.all([
                api.get('/posts?limit=50'),
                api.get('/stats')
            ]);
            setPosts(postsRes.data.posts || []);
            setStats(statsRes.data || { totalPosts: 0, totalViews: 0, totalComments: 0 });
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

    return (
        <div className="space-y-6">

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'Total Posts', value: stats.totalPosts, icon: <FileText size={24} />, color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' },
                    { title: 'Total Comments', value: stats.totalComments, icon: <Users size={24} />, color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' },
                    { title: 'Total Views', value: stats.totalViews, icon: <Eye size={24} />, color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30' },
                ].map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-soft flex items-center gap-4 transition-colors">
                        <div className={`p-4 rounded-full ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{stat.title}</p>
                            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Posts Table */}
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-soft border border-gray-100 dark:border-dark-border overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-border flex justify-between items-center bg-gray-50/50 dark:bg-dark-bg/50">
                    <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white">Recent Posts</h3>
                    <Link to="/admin/create-post" className="btn-primary flex items-center gap-2 py-2 px-4 shadow-sm text-sm">
                        <Plus size={16} /> New Post
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-dark-bg text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider border-b border-gray-100 dark:border-dark-border">
                                    <th className="px-6 py-4 font-semibold">Title</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map((post) => (
                                    <tr key={post.id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50/50 dark:hover:bg-dark-bg/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-heading font-semibold text-gray-900 dark:text-white line-clamp-1">{post.title}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${post.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>
                                                {post.status || 'draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 flex justify-end gap-3 text-right">
                                            <Link to={`/blog/${post.slug}`} target="_blank" className="text-gray-400 hover:text-primary-600 transition-colors tooltip" title="View">
                                                <Eye size={18} />
                                            </Link>
                                            <Link to={`/admin/edit-post/${post.id}`} className="text-gray-400 hover:text-blue-600 transition-colors tooltip" title="Edit">
                                                <Edit size={18} />
                                            </Link>
                                            <button onClick={() => handleDelete(post.id)} className="text-gray-400 hover:text-red-600 transition-colors tooltip" title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {posts.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8 text-gray-500">No posts found. Start writing!</td>
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
