import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Image as ImageIcon, CheckCircle, AlertCircle, Trash2, Plus } from 'lucide-react';
import api from '../../services/api';

const CreatePost = () => {
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
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingMultiple, setUploadingMultiple] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories', error);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        setUploadingImage(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            const { data } = await api.post('/upload', formDataUpload, config);

            setFormData({ ...formData, featured_image: data.image });
            setStatusMsg({ type: 'success', msg: 'Image uploaded successfully' });
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
            setStatusMsg({ type: 'success', msg: `${files.length} images uploaded` });
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
        setLoading(true);
        setStatusMsg({ type: '', msg: '' });

        try {
            await api.post('/posts', formData);
            setStatusMsg({ type: 'success', msg: 'Post created successfully!' });
            setTimeout(() => navigate('/admin'), 2000);
        } catch (error) {
            setStatusMsg({ type: 'error', msg: 'Failed to create post. Please fill all required fields.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-heading font-extrabold text-gray-900 dark:text-white">Create New Post</h2>
            </div>

            {statusMsg.msg && (
                <div className={`p-4 rounded-xl flex items-center gap-3 font-medium ${statusMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30' : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30'
                    }`}>
                    {statusMsg.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {statusMsg.msg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-card rounded-2xl shadow-soft border border-gray-100 dark:border-dark-border p-8">

                {/* Basic Info */}
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
                            placeholder="Enter a compelling title..."
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

                {/* Content */}
                <div className="mt-10 space-y-6">
                    <h3 className="text-xl font-heading font-semibold pb-4 border-b border-gray-100 dark:border-dark-border mb-6">Post Content</h3>

                    <div className="relative">
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button type="button" className="p-2 text-gray-500 hover:text-primary-600 bg-gray-100 dark:bg-dark-bg rounded-md tooltip" title="Upload Image (Feature coming soon)">
                                <ImageIcon size={18} />
                            </button>
                        </div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content (HTML/Markdown supported) *</label>
                        <textarea
                            id="content"
                            name="content"
                            rows="12"
                            value={formData.content}
                            onChange={handleChange}
                            required
                            placeholder="<h1>Start writing your masterpiece...</h1>"
                            className="input-field py-4 font-mono text-sm resize-y leading-relaxed"
                        ></textarea>
                    </div>

                    <div>
                        <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Featured Image Upload</label>
                        <div className="flex gap-4 items-center">
                            <input
                                type="text"
                                id="featured_image"
                                name="featured_image"
                                value={formData.featured_image}
                                onChange={handleChange}
                                className="input-field py-3 flex-1"
                                placeholder="Upload an image or enter URL..."
                            />
                            <label className="btn-outline cursor-pointer whitespace-nowrap">
                                <ImageIcon size={20} className="mr-2 inline" />
                                {uploadingImage ? 'Uploading...' : 'Upload File'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={uploadFileHandler}
                                    disabled={uploadingImage}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Additional Images Section */}
                    <div className="pt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Additional Post Images (Multiple)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                            {formData.additional_images.map((img, index) => (
                                <div key={index} className="relative group aspect-video rounded-xl overflow-hidden border border-gray-100 dark:border-dark-border">
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl aspect-video cursor-pointer hover:border-primary-500 transition-colors">
                                <Plus size={24} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Add More</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={uploadMultipleHandler}
                                    disabled={uploadingMultiple}
                                />
                            </label>
                        </div>
                        {uploadingMultiple && <p className="text-xs text-primary-600 animate-pulse">Uploading images...</p>}
                    </div>
                </div>

                {/* SEO Info */}
                <div className="mt-10 space-y-6">
                    <h3 className="text-xl font-heading font-semibold pb-4 border-b border-gray-100 dark:border-dark-border mb-6">SEO Metadata</h3>

                    <div>
                        <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meta Title</label>
                        <input
                            type="text"
                            id="meta_title"
                            name="meta_title"
                            value={formData.meta_title}
                            onChange={handleChange}
                            className="input-field py-3"
                            placeholder="SEO optimized title..."
                        />
                        <p className="text-xs text-gray-500 mt-2">Recommended length: 50-60 characters</p>
                    </div>

                    <div>
                        <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meta Description</label>
                        <textarea
                            id="meta_description"
                            name="meta_description"
                            rows="3"
                            value={formData.meta_description}
                            onChange={handleChange}
                            className="input-field py-3 resize-y"
                            placeholder="Brief description for search engines..."
                        ></textarea>
                        <p className="text-xs text-gray-500 mt-2">Recommended length: 150-160 characters</p>
                    </div>
                </div>

                {/* Submit */}
                <div className="mt-10 pt-6 border-t border-gray-100 dark:border-dark-border flex items-center justify-end gap-4">
                    <button type="button" onClick={() => navigate('/admin')} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium px-4">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-8 py-3 text-lg shadow-md">
                        {loading ? 'Saving...' : <><Save size={20} /> Save Post</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;
