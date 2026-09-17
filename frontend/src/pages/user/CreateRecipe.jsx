import { escapeHtml } from "../../utils/recipeContent";
import React, { useState, useEffect } from 'react';
import axiosClient from "../../api/axiosClient";
import Navbar from "../../components/Navbar";
import ImageUpload from "../../components/ImageUpload";
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';

const CreateRecipe = () => {
  const [file, setFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    food_name: '',
    description: '',
    cooking_time: '',
    difficulty: 'Dễ',
    category_id: '' // Single category
  });

  // Separate state for structured content
  const [ingredients, setIngredients] = useState(['']);
  const [steps, setSteps] = useState(['']);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosClient.get('/categories');
        setCategories(res.data || []);
      } catch (err) {
        console.error('Lỗi lấy danh mục:', err);
        toast.error('Không thể tải danh mục');
      }
    };
    fetchCategories();
  }, []);

  // Convert structured data to HTML
  const buildContent = () => {
    let html = '';

    // Add ingredients section
    if (ingredients.some(ing => ing.trim())) {
      html += '<h3>Nguyên liệu:</h3><ul>';
      ingredients.forEach(ing => {
        if (ing.trim()) {
          html += `<li>${escapeHtml(ing)}</li>`;
        }
      });
      html += '</ul>';
    }

    // Add steps section
    if (steps.some(step => step.trim())) {
      html += '<h3>Các bước thực hiện:</h3><ol>';
      steps.forEach(step => {
        if (step.trim()) {
          html += `<li>${escapeHtml(step)}</li>`;
        }
      });
      html += '</ol>';
    }

    return html;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that at least one ingredient and one step exist
    if (!ingredients.some(ing => ing.trim())) {
      toast.error('Vui lòng thêm ít nhất một nguyên liệu');
      return;
    }

    if (!steps.some(step => step.trim())) {
      toast.error('Vui lòng thêm ít nhất một bước thực hiện');
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

      if (file) {
        formDataToSend.append('image', file);
      }

      await axiosClient.post('/recipes/create', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Công thức đã được lưu vào danh sách của bạn!');
      navigate('/my-recipes');
    } catch (err) {
      console.error('Lỗi tạo recipe:', err);
      toast.error(err?.resultMessage?.vn || 'Lỗi khi đăng bài');
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const removeStep = (index) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto py-10 px-4">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">Tạo công thức</h1>

          <ImageUpload
            onImageChange={setFile}
            label="Ảnh món ăn"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên món ăn
            </label>
            <input
              type="text"
              placeholder="Tên món ăn"
              className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
              value={formData.food_name}
              onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả món ăn
            </label>
            <textarea
              placeholder="Mô tả ngắn gọn..."
              className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500 h-24"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          {/* Ingredients Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Nguyên liệu
              </label>
              <button
                type="button"
                onClick={addIngredient}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition"
              >
                <Plus size={16} />
                Thêm nguyên liệu
              </button>
            </div>
            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`Nguyên liệu ${index + 1}`}
                    className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Steps Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Các bước thực hiện
              </label>
              <button
                type="button"
                onClick={addStep}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
              >
                <Plus size={16} />
                Thêm bước
              </button>
            </div>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-full font-bold text-sm flex-shrink-0 mt-2">
                    {index + 1}
                  </div>
                  <textarea
                    placeholder={`Bước ${index + 1}`}
                    className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500 h-20 resize-none"
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition h-fit"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian nấu (phút)
              </label>
              <input
                type="number"
                min="0"
                placeholder="30"
                className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.cooking_time}
                onChange={(e) => setFormData({ ...formData, cooking_time: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Độ khó
              </label>
              <select
                className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              >
                <option value="Dễ">Dễ</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Khó">Khó</option>
              </select>
            </div>
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục món ăn
            </label>
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

          <button
            disabled={loading}
            className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đăng tải...' : 'Đăng công thức'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRecipe;
