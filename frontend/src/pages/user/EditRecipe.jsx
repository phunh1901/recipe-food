import React, { useState, useEffect } from 'react';
import axiosClient from "../../api/axiosClient";
import Navbar from "../../components/Navbar";
import ImageUpload from "../../components/ImageUpload";
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, X } from 'lucide-react';

const EditRecipe = () => {
    const { id } = useParams();
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        food_name: '',
        description: '',
        cooking_time: '',
        difficulty: 'Dễ',
        category_id: ''
    });

    const [ingredients, setIngredients] = useState(['']);
    const [steps, setSteps] = useState(['']);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [recipeRes, categoriesRes] = await Promise.all([
                    axiosClient.get(`/recipes/detail-recipe/${id}`),
                    axiosClient.get('/categories')
                ]);

                const recipe = recipeRes.data?.data || recipeRes.data; // Handle nested data structure
                setCategories(categoriesRes.data || []);

                const loadedCategoryId = recipe.category_id;

                setFormData({
                    food_name: recipe.food_name,
                    description: recipe.description,
                    cooking_time: recipe.cooking_time || '',
                    difficulty: recipe.difficulty || 'Dễ',
                    category_id: loadedCategoryId || (categoriesRes.data?.[0]?.id || '')
                });

                setImagePreview(recipe.image_url);

                const { ingredients: parsedIngredients, steps: parsedSteps } = parseContent(recipe.content);
                setIngredients(parsedIngredients.length > 0 ? parsedIngredients : ['']);
                setSteps(parsedSteps.length > 0 ? parsedSteps : ['']);

            } catch (err) {
                console.error('Lỗi lấy dữ liệu:', err);
                toast.error('Không thể tải thông tin công thức');
                navigate('/my-recipes');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const parseContent = (htmlContent) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        const ingredientsList = Array.from(doc.querySelectorAll('h3'))
            .find(h3 => h3.textContent.includes('Nguyên liệu'))
            ?.nextElementSibling;

        const stepsList = Array.from(doc.querySelectorAll('h3'))
            .find(h3 => h3.textContent.includes('Các bước thực hiện'))
            ?.nextElementSibling;

        const ingredients = ingredientsList
            ? Array.from(ingredientsList.querySelectorAll('li')).map(li => li.textContent)
            : [];

        const steps = stepsList
            ? Array.from(stepsList.querySelectorAll('li')).map(li => li.textContent)
            : [];

        return { ingredients, steps };
    };

    const buildContent = () => {
        let html = '';
        if (ingredients.some(ing => ing.trim())) {
            html += '<h3>Nguyên liệu:</h3><ul>';
            ingredients.forEach(ing => {
                if (ing.trim()) html += `<li>${ing}</li>`;
            });
            html += '</ul>';
        }
        if (steps.some(step => step.trim())) {
            html += '<h3>Các bước thực hiện:</h3><ol>';
            steps.forEach(step => {
                if (step.trim()) html += `<li>${step}</li>`;
            });
            html += '</ol>';
        }
        return html;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!ingredients.some(ing => ing.trim())) {
            toast.error('Vui lòng thêm ít nhất một nguyên liệu');
            return;
        }
        if (!steps.some(step => step.trim())) {
            toast.error('Vui lòng thêm ít nhất một bước thực hiện');
            return;
        }
        if (!formData.category_id) {
            toast.error('Vui lòng chọn danh mục');
            return;
        }

        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('food_name', formData.food_name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('content', buildContent());
            formDataToSend.append('cooking_time', formData.cooking_time || 0);
            formDataToSend.append('difficulty', formData.difficulty);
            formDataToSend.append('category_id', formData.category_id);

            if (file) formDataToSend.append('image', file);

            await axiosClient.put(`/recipes/update/${id}`, formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Cập nhật công thức thành công!');
            navigate('/my-recipes');
        } catch (err) {
            console.error('Lỗi cập nhật:', err);
            toast.error(err?.response?.data?.resultMessage?.vn || 'Lỗi khi cập nhật');
        } finally {
            setLoading(false);
        }
    };

    const addIngredient = () => setIngredients([...ingredients, '']);
    const removeIngredient = (index) => ingredients.length > 1 && setIngredients(ingredients.filter((_, i) => i !== index));
    const updateIngredient = (index, value) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = value;
        setIngredients(newIngredients);
    };

    const addStep = () => setSteps([...steps, '']);
    const removeStep = (index) => steps.length > 1 && setSteps(steps.filter((_, i) => i !== index));
    const updateStep = (index, value) => {
        const newSteps = [...steps];
        newSteps[index] = value;
        setSteps(newSteps);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-12">
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm space-y-6">
                    <h1 className="text-3xl font-bold text-gray-800">Chỉnh sửa công thức</h1>

                    <ImageUpload onImageChange={setFile} label="Ảnh món ăn" initialPreview={imagePreview} />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên món ăn
                        </label>
                        <input type="text" placeholder="Tên món ăn" className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                            value={formData.food_name} onChange={(e) => setFormData({ ...formData, food_name: e.target.value })} required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả món ăn
                        </label>
                        <textarea placeholder="Mô tả ngắn gọn..." className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500 h-24"
                            value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-gray-700">Nguyên liệu</label>
                            <button type="button" onClick={addIngredient} className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition">
                                <Plus size={16} /> Thêm
                            </button>
                        </div>
                        <div className="space-y-2">
                            {ingredients.map((ingredient, index) => (
                                <div key={index} className="flex gap-2">
                                    <input type="text" placeholder={`Nguyên liệu `} className="flex-1 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                                        value={ingredient} onChange={(e) => updateIngredient(index, e.target.value)} />
                                    {ingredients.length > 1 && (
                                        <button type="button" onClick={() => removeIngredient(index)} className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition"><X size={20} /></button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-gray-700">Các bước thực hiện</label>
                            <button type="button" onClick={addStep} className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition">
                                <Plus size={16} /> Thêm bước
                            </button>
                        </div>
                        <div className="space-y-2">
                            {steps.map((step, index) => (
                                <div key={index} className="flex gap-2">
                                    <div className="flex items-center justify-center w-8 h-10 bg-orange-100 text-orange-600 rounded-lg font-bold text-sm">{index + 1}</div>
                                    <textarea placeholder={`Bước `} className="flex-1 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 resize-none h-20"
                                        value={step} onChange={(e) => updateStep(index, e.target.value)} />
                                    {steps.length > 1 && (
                                        <button type="button" onClick={() => removeStep(index)} className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition self-start"><X size={20} /></button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian nấu (phút)</label>
                            <input type="number" min="0" placeholder="30" className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                                value={formData.cooking_time} onChange={(e) => setFormData({ ...formData, cooking_time: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Độ khó</label>
                            <select className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                                value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}>
                                <option value="Dễ">Dễ</option>
                                <option value="Trung bình">Trung bình</option>
                                <option value="Khó">Khó</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục món ăn</label>
                        <select
                            className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                            value={formData.category_id}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                            required
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-4">
                        <button type="submit" disabled={loading} className="flex-1 py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Đang cập nhật...' : 'Cập nhật công thức'}
                        </button>
                        <button type="button" onClick={() => navigate('/my-recipes')} className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition">
                            Hủy
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default EditRecipe;
