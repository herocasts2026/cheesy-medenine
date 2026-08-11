import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Search, Check, ImageIcon } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLang } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';

export default function Menu() {
  const { t, isRTL } = useLang();
  const { addToCart, cartItems } = useCart();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // للمنتج المحدد في النافذة المنبثقة
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
        .order('sort_order');

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true);

      if (categoriesData) setCategories(categoriesData);
      if (productsData) setProducts(productsData);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  // دالة التعامل مع النقر على المنتج
  const handleProductClick = (product) => {
    const name = product?.nameFr?.toLowerCase() || '';

    // إلغاء النافذة المنبثقة لـ Tacos Géant و Tacos Géant Viande Hachée وإضافتهما مباشرة للسلة
    if (name.includes('géant') || name.includes('geant')) {
      addToCart(product, 1, [], []);
      return;
    }

    // لجميع المنتجات الأخرى التي تحتوي على خيارات صوصات أو إضافات
    const hasSauces = product?.sauces && product.sauces.length > 0;
    const hasSupplements = product?.supplements && product.supplements.length > 0;

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
      product.nameFr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.nameAr?.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#121212] py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* شريط البحث */}
        <div className="relative max-w-md mx-auto">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'بحث عن وجبة...' : 'Rechercher un plat...'}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-[#2C2C2C] border border-gray-100 dark:border-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#F6B21A] transition-colors shadow-sm"
          />
        </div>

        {/* قائمة الأقسام */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#F6B21A] text-[#2C2C2C] shadow-md'
                : 'bg-white dark:bg-[#2C2C2C] text-gray-600 dark:text-gray-300 hover:bg-gray-100'
            }`}
          >
            {isRTL ? 'الكل' : 'Tout'}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#F6B21A] text-[#2C2C2C] shadow-md'
                  : 'bg-white dark:bg-[#2C2C2C] text-gray-600 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              {isRTL ? cat.nameAr : cat.nameFr}
            </button>
          ))}
        </div>

        {/* شبكة المنتجات */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-[#2C2C2C] rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-gray-50 dark:bg-[#1a1a1a] mb-4 flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.nameFr}
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                  <h3 className="font-black text-lg text-[#2C2C2C] dark:text-white">
                    {product.nameFr}
                  </h3>
                  {product.descriptionFr && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {product.descriptionFr}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xl font-black text-[#F6B21A]">
                    {product.price} {t.dt}
                  </span>
                  <button
                    onClick={() => handleProductClick(product)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F6B21A] text-[#2C2C2C] font-black hover:bg-[#e0a116] transition-all hover:scale-105"
                  >
                    <Plus size={18} />
                    <span>{isRTL ? 'إضافة' : 'Ajouter'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* النافذة المنبثقة للتخصيص (للباقي فقط) */}
        {selectedProduct && (
          <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl max-w-lg w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
              <div>
                <h3 className="text-2xl font-black text-[#2C2C2C] dark:text-white">
                  {selectedProduct.nameFr}
                </h3>
                <p className="text-[#F6B21A] font-black text-lg mt-1">
                  {selectedProduct.price} {t.dt}
                </p>
              </div>

              {/* الصلصات */}
              {selectedProduct.sauces && selectedProduct.sauces.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-[#2C2C2C] dark:text-white text-sm">
                    Sauces
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProduct.sauces.map((sauce) => {
                      const isSelected = selectedSauces.includes(sauce);
                      return (
                        <button
                          key={sauce}
                          onClick={() =>
                            setSelectedSauces((prev) =>
                              isSelected
                                ? prev.filter((s) => s !== sauce)
                                : [...prev, sauce]
                            )
                          }
                          className={`p-3 rounded-xl border text-sm font-bold flex items-center justify-between ${
                            isSelected
                              ? 'border-[#F6B21A] bg-[#F6B21A]/10 text-[#2C2C2C] dark:text-white'
                              : 'border-gray-200 dark:border-gray-700 text-gray-500'
                          }`}
                        >
                          <span>{sauce}</span>
                          {isSelected && <Check size={16} className="text-[#F6B21A]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* الإضافات */}
              {selectedProduct.supplements &&
                selectedProduct.supplements.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-[#2C2C2C] dark:text-white text-sm">
                      Suppléments
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedProduct.supplements.map((sup) => {
                        const isSelected = selectedSupplements.some(
                          (s) => s.name === sup.name
                        );
                        return (
                          <button
                            key={sup.name}
                            onClick={() =>
                              setSelectedSupplements((prev) =>
                                isSelected
                                  ? prev.filter((s) => s.name !== sup.name)
                                  : [...prev, sup]
                              )
                            }
                            className={`p-3 rounded-xl border text-sm font-bold flex items-center justify-between ${
                              isSelected
                                ? 'border-[#F6B21A] bg-[#F6B21A]/10 text-[#2C2C2C] dark:text-white'
                                : 'border-gray-200 dark:border-gray-700 text-gray-500'
                            }`}
                          >
                            <span>{sup.name}</span>
                            <span className="text-[#F6B21A]">+{sup.price} D</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="w-1/3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-gray-500"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmCustomization}
                  className="w-2/3 py-3 rounded-xl bg-[#F6B21A] text-[#2C2C2C] font-black"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
