import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Image as ImageIcon, CheckCircle, AlertCircle, Trash2, Plus, Loader2, FileText, Search, Tag, ChevronDown, X } from 'lucide-react';
import api from '../../services/api';

const EditPost = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        featured_image: '',
        category_id: '',
        meta_title: '',
        meta_description: '',
        status: 'draft',
        additional_images: [],
    });
    const [categories, setCategories] = useState([]);
    const [statusMsg, setStatusMsg] = useState({ type: '', msg: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingMultiple, setUploadingMultiple] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [postRes, catRes] = await Promise.all([
                    api.get(`/posts/admin/${id}`),
                    api.get('/categories')
                ]);

                const post = postRes.data;
                setFormData({
                    title: post.title || '',
                    content: post.content || '',
                    featured_image: post.featured_image || '',
                    category_id: post.category_id || '',
                    meta_title: post.meta_title || '',
                    meta_description: post.meta_description || '',
                    status: post.status || 'draft',
                    additional_images: post.additional_images || [],
                });
                setCategories(catRes.data || []);
            } catch (error) {
                console.error('Failed to fetch post data', error);
                setStatusMsg({ type: 'error', msg: 'Failed to load post data' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        setUploadingImage(true);

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            const { data } = await api.post('/upload', formDataUpload, config);
            setFormData(prev => ({ ...prev, featured_image: data.image }));
            setStatusMsg({ type: 'success', msg: 'Featured image updated' });
        } catch (error) {
            console.error(error);
            setStatusMsg({ type: 'error', msg: 'Image upload failed' });
        } finally {
            setUploadingImage(false);
        }
    };

    const uploadMultipleHandler = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const formDataUpload = new FormData();
        files.forEach(file => formDataUpload.append('images', file));
        setUploadingMultiple(true);

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            const { data } = await api.post('/upload/multiple', formDataUpload, config);
            setFormData(prev => ({
                ...prev,
                additional_images: [...prev.additional_images, ...data.images]
            }));
            setStatusMsg({ type: 'success', msg: `${files.length} images added` });
        } catch (error) {
            console.error(error);
            setStatusMsg({ type: 'error', msg: 'Multiple upload failed' });
        } finally {
            setUploadingMultiple(false);
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            additional_images: prev.additional_images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setStatusMsg({ type: '', msg: '' });

        try {
            await api.put(`/posts/${id}`, formData);
            setStatusMsg({ type: 'success', msg: 'Post updated successfully!' });
            setTimeout(() => navigate('/admin'), 1500);
        } catch (error) {
            console.error(error);
            setStatusMsg({ type: 'error', msg: 'Failed to update post.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 size={48} className="animate-spin text-primary-600 mb-4" />
            <p className="text-gray-500 font-medium">Loading post content...</p>
        </div>
    );

    const metaTitleLen = formData.meta_title?.length || 0;
    const metaDescLen = formData.meta_description?.length || 0;

    return (
        <div className="min-h-screen pb-16">

            {/* ── Page Header ───────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Edit Post
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Make changes to your blog post or manage its status.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                    >
                        <X size={16} /> Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-gradient-to-tr from-primary-600 to-primary-500 text-white rounded-xl shadow-md hover:shadow-neon-primary transition-all active:scale-95 disabled:opacity-60"
                    >
                        {saving ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Updating...
                            </span>
                        ) : (
                            <><Save size={16} /> Update Post</>
                        )}
                    </button>
                </div>
            </div>

            {/* ── Status Banner ─────────────────────────────────── */}
            {statusMsg.msg && (
                <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 font-medium text-sm border animate-fade-in-up ${statusMsg.type === 'success'
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                    }`}>
                    {statusMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {statusMsg.msg}
                </div>
            )}

            {/* ── Two-Column Layout ─────────────────────────────── */}
            <form id="edit-post-form" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">

                    {/* ── LEFT: Main Content ──────────────────────── */}
                    <div className="space-y-6">

                        {/* Title Card */}
                        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-soft p-5 sm:p-7">
                            <label htmlFor="title" className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                                <FileText size={14} /> Post Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full bg-transparent border-none outline-none text-2xl sm:text-3xl font-heading font-extrabold text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                placeholder="Enter a compelling title..."
                            />
                        </div>

                        {/* Content Card */}
                        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-soft overflow-hidden">
                            <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-gray-100 dark:border-dark-border">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={14} /> Content
                                    <span className="text-gray-300 dark:text-gray-700 font-normal normal-case tracking-normal">— HTML supported</span>
                                </span>
                                <span className="text-xs text-gray-400 font-mono">{formData.content?.length || 0} chars</span>
                            </div>
                            <textarea
                                id="content"
                                name="content"
                                rows="18"
                                value={formData.content}
                                onChange={handleChange}
                                required
                                placeholder="<h1>Start writing your masterpiece...</h1>"
                                className="w-full p-5 sm:p-7 bg-transparent font-mono text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-gray-700 focus:outline-none resize-y leading-relaxed"
                            />
                        </div>

                        {/* Featured Image Card */}
                        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-soft p-5 sm:p-7">
                            <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                                <ImageIcon size={14} /> Featured Image
                            </label>

                            {formData.featured_image ? (
                                <div className="relative mb-4 rounded-xl overflow-hidden border border-gray-100 dark:border-dark-border aspect-video bg-gray-50 dark:bg-dark-bg">
                                    <img src={formData.featured_image} alt="Featured" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, featured_image: '' }))}
                                        className="absolute top-3 right-3 p-1.5 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl aspect-video mb-4 cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 transition-colors group bg-gray-50/50 dark:bg-dark-bg/50">
                                    {uploadingImage ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <svg className="animate-spin h-8 w-8 text-primary-500" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            <span className="text-xs text-gray-400 font-medium">Uploading...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <ImageIcon size={32} className="text-gray-300 dark:text-gray-700 group-hover:text-primary-500 transition-colors mb-2" />
                                            <span className="text-sm font-semibold text-gray-400 group-hover:text-primary-500 transition-colors">Click to upload featured image</span>
                                            <span className="text-xs text-gray-300 dark:text-gray-700 mt-1">PNG, JPG, WEBP</span>
                                        </>
                                    )}
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { uploadFileHandler(e); e.target.value = null; }} disabled={uploadingImage} />
                                </label>
                            )}

                            <div className="flex items-center gap-2 mt-2">
                                <input
                                    type="text"
                                    id="featured_image"
                                    name="featured_image"
                                    value={formData.featured_image}
                                    onChange={handleChange}
                                    className="flex-1 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-300 dark:placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all"
                                    placeholder="Or paste image URL directly..."
                                />
                            </div>
                        </div>

                        {/* Additional Images Card */}
                        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-soft p-5 sm:p-7">
                            <div className="flex items-center justify-between mb-4">
                                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                                    <Plus size={14} /> Gallery Images
                                </label>
                                {uploadingMultiple && (
                                    <span className="text-xs text-primary-500 animate-pulse font-medium flex items-center gap-1.5">
                                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Uploading...
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {formData.additional_images.map((img, index) => (
                                    <div key={index} className="relative group aspect-video rounded-xl overflow-hidden border border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl aspect-video cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 transition-colors bg-gray-50/50 dark:bg-dark-bg/50 group">
                                    <Plus size={20} className="text-gray-300 dark:text-gray-700 group-hover:text-primary-500 transition-colors" />
                                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-primary-500 transition-colors mt-1 uppercase tracking-widest">Add More</span>
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => { uploadMultipleHandler(e); e.target.value = null; }} disabled={uploadingMultiple} />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Sidebar ───────────────────────────── */}
                    <div className="space-y-5">

                        {/* Publish Settings */}
                        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-soft p-5">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Publish Settings</h4>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="status" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Status</label>
                                    <div className="relative">
                                        <select
                                            id="status"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full appearance-none bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all"
                                        >
                                            <option value="draft">📝  Draft</option>
                                            <option value="published">🟢  Published</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="category_id" className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                                        <Tag size={12} /> Category
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="category_id"
                                            name="category_id"
                                            value={formData.category_id}
                                            onChange={handleChange}
                                            className="w-full appearance-none bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all"
                                        >
                                            <option value="">— Select Category —</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="mt-5 w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-tr from-primary-600 to-primary-500 text-white font-bold rounded-xl shadow-md hover:shadow-neon-primary transition-all active:scale-95 disabled:opacity-60 text-sm"
                            >
                                {saving ? 'Updating...' : <><Save size={16} /> Update Post</>}
                            </button>
                        </div>

                        {/* SEO Card */}
                        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-soft p-5">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Search size={13} /> SEO Metadata
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label htmlFor="meta_title" className="text-xs font-semibold text-gray-500 dark:text-gray-400">Meta Title</label>
                                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${metaTitleLen > 60 ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : metaTitleLen >= 50 ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-gray-400 bg-gray-100 dark:bg-dark-bg'}`}>
                                            {metaTitleLen}/60
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        id="meta_title"
                                        name="meta_title"
                                        value={formData.meta_title}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-300 dark:placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all"
                                        placeholder="SEO optimized title..."
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Target: 50–60 characters</p>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label htmlFor="meta_description" className="text-xs font-semibold text-gray-500 dark:text-gray-400">Meta Description</label>
                                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${metaDescLen > 160 ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : metaDescLen >= 140 ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-gray-400 bg-gray-100 dark:bg-dark-bg'}`}>
                                            {metaDescLen}/160
                                        </span>
                                    </div>
                                    <textarea
                                        id="meta_description"
                                        name="meta_description"
                                        rows="4"
                                        value={formData.meta_description}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-300 dark:placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all resize-y"
                                        placeholder="Brief description for search engines..."
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Target: 150–160 characters</p>
                                </div>

                                {/* Live Google Preview */}
                                {(formData.meta_title || formData.meta_description) && (
                                    <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-dark-border">
                                        <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest mb-2">Google Preview</p>
                                        <p className="text-blue-600 dark:text-blue-400 text-sm font-medium line-clamp-1">{formData.meta_title || formData.title || 'Page Title'}</p>
                                        <p className="text-green-700 dark:text-green-500 text-[10px] my-0.5">yourblog.com › blog › slug</p>
                                        <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2 leading-relaxed">{formData.meta_description || 'No description provided.'}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Writing Tips Card */}
                        <div className="bg-gradient-to-br from-primary-600/10 to-primary-400/5 dark:from-primary-900/30 dark:to-transparent rounded-2xl border border-primary-100 dark:border-primary-900/40 p-5">
                            <h4 className="text-xs font-black text-primary-700 dark:text-primary-400 uppercase tracking-widest mb-3">✨ Editing Tips</h4>
                            <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                <li>• Check the <code className="bg-white/60 dark:bg-white/10 px-1 rounded text-primary-600 dark:text-primary-400">Content</code> tab length before publishing.</li>
                                <li>• Verify the <code className="bg-white/60 dark:bg-white/10 px-1 rounded text-primary-600 dark:text-primary-400">Google Preview</code> layout below the SEO block.</li>
                                <li>• Updating URLs/Images instantly syncs backwards.</li>
                                <li>• Remember to hit <strong>Update Post</strong> to save changes!</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditPost;
