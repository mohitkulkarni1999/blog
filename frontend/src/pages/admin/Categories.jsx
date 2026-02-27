import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, Loader2 } from 'lucide-react';
import api from '../../services/api';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/categories');
            setCategories(data || []);
        } catch (err) {
            console.error('Failed to fetch categories', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setSubmitting(true);
        setError('');
        try {
            await api.post('/categories', { name });
            setName('');
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create category');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category? This may affect posts assigned to it.')) return;

        try {
            await api.delete(`/categories/${id}`);
            fetchCategories();
        } catch (err) {
            alert('Failed to delete category');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-dark-card p-8 rounded-2xl shadow-soft border border-gray-100 dark:border-dark-border">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Category Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Organize your blog posts with structured categories.</p>
                </div>
                <div className="flex items-center gap-3 bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-xl border border-primary-100 dark:border-primary-900/30">
                    <Tag className="text-primary-600" size={20} />
                    <span className="text-primary-700 dark:text-primary-300 font-bold">{categories.length} Total</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Category Form */}
                <div className="lg:col-span-1 bg-white dark:bg-dark-card p-6 rounded-2xl shadow-soft border border-gray-100 dark:border-dark-border h-fit">
                    <h2 className="text-xl font-heading font-bold mb-6 text-gray-900 dark:text-white">Add New</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Category Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Technology"
                                className="input-field"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-xs italic">{error}</p>}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                            Create Category
                        </button>
                    </form>
                </div>

                {/* Categories List */}
                <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-2xl shadow-soft border border-gray-100 dark:border-dark-border overflow-hidden">
                    <div className="p-6 border-b border-gray-50 dark:border-dark-border">
                        <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">All Categories</h2>
                    </div>

                    {loading ? (
                        <div className="p-20 flex justify-center">
                            <Loader2 className="animate-spin text-primary-600" size={40} />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-dark-bg/50">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Name</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Slug</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                                    {categories.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-10 text-center text-gray-500 italic">No categories found. Start by adding one!</td>
                                        </tr>
                                    ) : (
                                        categories.map((cat) => (
                                            <tr key={cat.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-bg/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-gray-900 dark:text-white">{cat.name}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <code className="text-xs bg-gray-100 dark:bg-dark-border px-2 py-1 rounded text-primary-600 dark:text-primary-400">{cat.slug}</code>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDelete(cat.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Delete Category"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Categories;
