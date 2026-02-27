import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Image as ImageIcon, CheckCircle, AlertCircle, Trash2, Plus, Loader2 } from 'lucide-react';
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
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const serverUrl = apiUrl.replace('/api', '');
            setFormData({ ...formData, featured_image: serverUrl + data.image });
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
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const serverUrl = apiUrl.replace('/api', '');
            const newImages = data.images.map(img => serverUrl + img);

            setFormData(prev => ({
                ...prev,
                additional_images: [...prev.additional_images, ...newImages]
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

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-heading font-extrabold text-gray-900 dark:text-white">Edit Post</h2>
            </div>

            {statusMsg.msg && (
                <div className={`p-4 rounded-xl flex items-center gap-3 font-medium animate-fade-in ${statusMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30' : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30'
                    }`}>
                    {statusMsg.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {statusMsg.msg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-card rounded-2xl shadow-soft border border-gray-100 dark:border-dark-border p-8">
                <div className="space-y-6">
                    <h3 className="text-xl font-heading font-semibold pb-4 border-b border-gray-100 dark:border-dark-border mb-6">Basic Information</h3>
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Post Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="input-field py-3 text-lg font-heading"
                            placeholder="Enter title..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                            <select
                                id="category_id"
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                className="input-field py-3"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="input-field py-3"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mt-10 space-y-6">
                    <h3 className="text-xl font-heading font-semibold pb-4 border-b border-gray-100 dark:border-dark-border mb-6">Post Content</h3>
                    <div className="relative">
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content (HTML supported) *</label>
                        <textarea
                            id="content"
                            name="content"
                            rows="12"
                            value={formData.content}
                            onChange={handleChange}
                            required
                            className="input-field py-4 font-mono text-sm resize-y leading-relaxed"
                        ></textarea>
                    </div>

                    <div>
                        <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Featured Image</label>
                        <div className="flex gap-4 items-center">
                            <input
                                type="text"
                                id="featured_image"
                                name="featured_image"
                                value={formData.featured_image}
                                onChange={handleChange}
                                className="input-field py-3 flex-1"
                            />
                            <label className="btn-outline cursor-pointer">
                                <ImageIcon size={20} className="mr-2 inline" />
                                {uploadingImage ? 'Uploading...' : 'Change'}
                                <input type="file" accept="image/*" className="hidden" onChange={uploadFileHandler} disabled={uploadingImage} />
                            </label>
                        </div>
                    </div>

                    <div className="pt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Additional Post Images (Multiple)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                            {formData.additional_images.map((img, index) => (
                                <div key={index} className="relative group aspect-video rounded-xl overflow-hidden border border-gray-100 dark:border-dark-border">
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl aspect-video cursor-pointer hover:border-primary-500 transition-colors">
                                <Plus size={24} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Add More</span>
                                <input type="file" multiple accept="image/*" className="hidden" onChange={uploadMultipleHandler} disabled={uploadingMultiple} />
                            </label>
                        </div>
                        {uploadingMultiple && <p className="text-xs text-primary-600 animate-pulse">Uploading...</p>}
                    </div>
                </div>

                <div className="mt-10 space-y-6">
                    <h3 className="text-xl font-heading font-semibold pb-4 border-b border-gray-100 dark:border-dark-border mb-6">SEO Metadata</h3>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meta Title</label>
                            <input type="text" id="meta_title" name="meta_title" value={formData.meta_title} onChange={handleChange} className="input-field py-3" />
                        </div>
                        <div>
                            <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meta Description</label>
                            <textarea id="meta_description" name="meta_description" rows="3" value={formData.meta_description} onChange={handleChange} className="input-field py-3"></textarea>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-100 dark:border-dark-border flex items-center justify-end gap-4">
                    <button type="button" onClick={() => navigate('/admin')} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 font-medium px-4">Cancel</button>
                    <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 px-8 py-3 text-lg">
                        {saving ? 'Updating...' : <><Save size={20} /> Update Post</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditPost;
