import { useState, useEffect } from 'react';
import { Search, Plus, Check, Utensils } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLang } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';

interface MenuItem {
  id: string;
  nameAr: string;
  nameFr: string;
  descriptionAr?: string;
  descriptionFr?: string;
  price: number;
  category: string;
  category_id?: string;
  images?: string[];
  sauces?: string[];
  supplements?: any[];
  available?: boolean;
}

export default function Menu() {
  const { t, isRTL } = useLang();
  const { addToCart } = useCart();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [addedItemId, setAddedItemId] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true);

      if (error) {
        console.error('Error fetching menu items:', error);
        return;
      }

      if (data) {
        setItems(data);
        const uniqueCategories = Array.from(
          new Set(data.map((item: MenuItem) => item.category).filter(Boolean))
        ) as string[];
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    // إضافة مباشرة إلى السلة دون فتح أي نافذة منبثقة إطلاقاً
    addToCart({
      id: item.id,
      nameFr: item.nameFr,
      nameAr: item.nameAr,
      price: item.price,
      images: item.images || [],
      category: item.category,
      category_id: item.category_id,
    });

    setAddedItemId(item.id);
    setTimeout(() => {
      setAddedItemId(null);
    }, 1200);
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (item.nameFr && item.nameFr.toLowerCase().includes(query)) ||
      (item.nameAr && item.nameAr.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#121212] py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-black text-[#2C2C2C] dark:text-white flex items-center gap-3">
            <Utensils className="text-[#F6B21A]" />
            <span>{isRTL ? 'قائمة الطعام' : 'Notre Menu'}</span>
          </h1>

          <div className="relative w-full sm:w-72">
            <Search
              size={18}
              className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${
                isRTL ? 'right-3' : 'left-3'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? 'ابحث عن أكلة...' : 'Rechercher un plat...'}
              className={`w-full py-2.5 rounded-xl bg-white dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-700 text-[#2C2C2C] dark:text-white text-sm focus:border-[#F6B21A] focus:outline-none transition-colors ${
                isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
              }`}
            />
          </div>
        </div>

        {/* Categories Bar */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#F6B21A] text-[#2C2C2C] shadow-sm'
                  : 'bg-white dark:bg-[#2C2C2C] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {isRTL ? 'الكل' : 'Tous'}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all capitalize ${
                  selectedCategory === cat
                    ? 'bg-[#F6B21A] text-[#2C2C2C] shadow-sm'
                    : 'bg-white dark:bg-[#2C2C2C] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Menu Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 dark:text-gray-500 font-medium text-lg">
              {isRTL ? 'لا توجد وجبات متاحة' : 'Aucun plat trouvé'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isAdded = addedItemId === item.id;
              const title = isRTL ? item.nameAr || item.nameFr : item.nameFr;
              const description = isRTL
                ? item.descriptionAr || item.descriptionFr
                : item.descriptionFr || item.descriptionAr;

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#2C2C2C] rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="w-full h-44 rounded-xl bg-[#FAF9F6] dark:bg-[#1a1a1a] mb-4 overflow-hidden flex items-center justify-center">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={title}
                          className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Utensils className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                      )}
                    </div>

                    <h3 className="font-bold text-[#2C2C2C] dark:text-white text-base leading-snug mb-1">
                      {title}
                    </h3>

                    {description && (
                      <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 mb-3">
                        {description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 mt-2">
                    <span className="text-xl font-black text-[#F6B21A]">
                      {item.price.toFixed(1)} {t.dt}
                    </span>

                    <button
                      onClick={() => handleAddToCart(item)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-all ${
                        isAdded
                          ? 'bg-green-500 text-white'
                          : 'bg-[#2C2C2C] dark:bg-white text-white dark:text-[#2C2C2C] hover:bg-[#F6B21A] dark:hover:bg-[#F6B21A] hover:text-[#2C2C2C]'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check size={14} />
                          <span>{isRTL ? 'تمت الإضافة' : 'Ajouté'}</span>
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          <span>{isRTL ? 'إضافة' : 'Ajouter'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
