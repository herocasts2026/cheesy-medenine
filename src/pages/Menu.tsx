import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Search, ImageIcon } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLang } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';

export default function Menu() {
  const { t, isRTL } = useLang();
  const { addToCart } = useCart();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSauces, setSelectedSauces] = useState([]);
  const [selectedSupplements, setSelectedSupplements] = useState([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      const { data: productsData } = await supabase
        .from('products')
        .select('*');

      if (categoriesData) setCategories(categoriesData);
      if (productsData) setProducts(productsData);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  // الجزء المعدل فقط:
  const handleProductClick = (product) => {
    const name = product?.nameFr?.toLowerCase() || '';
    
    // شرط خاص لهذين الطبقين فقط:
    if (name.includes('tacos géant')) {
        addToCart(product, 1, [], []);
        return;
    }

    // باقي الكود كما هو للأطباق الأخرى:
    const hasSauces = product?.sauces && Array.isArray(product.sauces) && product.sauces.length > 0;
    const hasSupplements = product?.supplements && Array.isArray(product.supplements) && product.supplements.length > 0;

    if (hasSauces || hasSupplements) {
      setSelectedProduct(product);
      setSelectedSauces([]);
      setSelectedSupplements([]);
      setQuantity(1);
    } else {
      addToCart(product, 1, [], []);
    }
  };

  const handleConfirmCustomization = () => {
    if (!selectedProduct) return;
    addToCart(selectedProduct, quantity, selectedSauces, selectedSupplements);
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category_id === selectedCategory;
    const matchesSearch =
      (product.nameFr && product.nameFr.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.nameAr && product.nameAr.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#121212] py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'بحث عن وجبة...' : 'Rechercher un plat...'}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-[#2C2C2C] border border-gray-100 dark:border-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#F6B21A] transition-colors shadow-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              selectedCategory === 'all' ? 'bg-[#F6B21A] text-[#2C2C2C] shadow-md' : 'bg-white dark:bg-[#2C2C2C] text-gray-600 dark:text-gray-300'
            }`}
          >
            {isRTL ? 'الكل' : 'Tout'}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                selectedCategory === cat.id ? 'bg-[#F6B21A] text-[#2C2C2C] shadow-md' : 'bg-white dark:bg-[#2C2C2C] text-gray-600 dark:text-gray-300'
              }`}
            >
              {isRTL ? cat.nameAr : cat.nameFr}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 font-bold">جاري التحميل...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white dark:bg-[#2C2C2C] rounded-3xl p-5 shadow-sm">
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-gray-50 mb-4 flex items-center justify-center">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.nameFr} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                  )}
                </div>
                <h3 className="font-black text-lg text-[#2C2C2C] dark:text-white">{product.nameFr}</h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xl font-black text-[#F6B21A]">{product.price} {t?.dt || 'D'}</span>
                  <button
                    onClick={() => handleProductClick(product)}
                    className="bg-[#F6B21A] text-[#2C2C2C] px-4 py-2 rounded-xl font-black flex items-center gap-2"
                  >
                    <Plus size={18} />
                    <span>{isRTL ? 'إضافة' : 'Ajouter'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
