import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Plus, Check, Loader2, X, MessageSquare, Utensils } from 'lucide-react';
import { useCart, SelectedSupplement } from '@/contexts/CartContext';
import { useLang } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { MenuItem, menuItems, menuCategories } from '@/data/menuData';

export default function Menu() {
  const { t, isRTL, lang } = useLang();
  const { addToCart, cartItems } = useCart();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedItemId, setAddedItemId] = useState<string | null>(null);

  // حالة النافذة المنبثقة (Modal) والتخصيص
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [selectedSupplements, setSelectedSupplements] = useState<SelectedSupplement[]>([]);
  const [selectedSauces, setSelectedSauces] = useState<string[]>([]);
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [customComment, setCustomComment] = useState('');

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('menu_items').select('*');

      if (error) {
        console.error('Error fetching menu items from Supabase, falling back to local data:', error);
        setItems(menuItems);
      } else if (data && data.length > 0) {
        setItems(data as MenuItem[]);
      } else {
        setItems(menuItems);
      }
    } catch (err) {
      console.error('Unexpected error, using local menuItems fallback:', err);
      setItems(menuItems);
    } finally {
      setLoading(false);
    }
  };

  // فتح نافذة التخصيص أو الإضافة المباشرة حسب نوع العنصر
  const handleItemClick = (item: MenuItem) => {
    if (item.category === 'boissons') {
      // إضافة مباشرة للمشروبات دون فتح النافذة
      addToCart(item, [], [], [], '');
      setAddedItemId(item.id);
      setTimeout(() => {
        setAddedItemId(null);
      }, 1200);
    } else {
      // فتح النافذة المنبثقة للوجبات والأصناف الأخرى
      setSelectedItemForModal(item);
      setSelectedSupplements([]);
      setSelectedSauces([]);
      setRemovedIngredients([]);
      setCustomComment('');
    }
  };

  const closeModal = () => {
    setSelectedItemForModal(null);
  };

  // تبديل اختيار الإضافات المدفوعة
  const toggleSupplement = (supp: { name: string; price: number }) => {
    setSelectedSupplements(prev =>
      prev.some(s => s.name === supp.name)
        ? prev.filter(s => s.name !== supp.name)
        : [...prev, supp]
    );
  };

  // تبديل اختيار الصلصات
  const toggleSauce = (sauce: string) => {
    setSelectedSauces(prev =>
      prev.includes(sauce) ? prev.filter(s => s !== sauce) : [...prev, sauce]
    );
  };

  // تبديل حذف المكونات (Sans)
  const toggleRemoveIngredient = (ing: string) => {
    setRemovedIngredients(prev =>
      prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
    );
  };

  // الإضافة للسلة بعد التخصيص
  const handleConfirmAddToCart = () => {
    if (!selectedItemForModal) return;

    addToCart(
      selectedItemForModal,
      selectedSupplements,
      selectedSauces,
      removedIngredients,
      customComment
    );
    setAddedItemId(selectedItemForModal.id);
    closeModal();
    setTimeout(() => {
      setAddedItemId(null);
    }, 1200);
  };

  // حساب السعر النهائي داخل النافذة المنبثقة
  const calculateModalTotalPrice = () => {
    if (!selectedItemForModal) return 0;
    const suppsTotal = selectedSupplements.reduce((sum, s) => sum + s.price, 0);
    return selectedItemForModal.price + suppsTotal;
  };

  // تصفية الأصناف بحسب التصنيف والبحث
  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    const itemName = lang === 'ar' ? item.nameAr || item.nameFr || item.name : item.nameFr || item.name;
    const itemDesc = lang === 'ar' ? item.descriptionAr || item.descriptionFr || item.description : item.descriptionFr || item.description;
    const matchesSearch = itemName.toLowerCase().includes(searchQuery.toLowerCase()) || (itemDesc && itemDesc.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const getItemCartQuantity = (id: string) => {
    const cartItem = cartItems.find((ci) => ci.item.id === id);
    return cartItem ? cartItem.quantity : 0;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* العنوان والبحث */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-black text-[#2C2C2C] dark:text-white">
          {t.menuTitle || (isRTL ? 'قائمة الطعام' : 'Notre Menu')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          {isRTL ? 'اختر وجبتك المفضلة واطلبها مباشرة عبر الواتساب' : 'Découvrez nos délicieux plats et commandez directement via WhatsApp'}
        </p>
        <div className="relative mt-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'بحث عن وجبة...' : 'Rechercher un plat...'}
            className="w-full px-5 py-3.5 pl-12 rounded-2xl bg-white dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-800 text-[#2C2C2C] dark:text-white shadow-sm focus:outline-none focus:border-[#F6B21A] transition-colors"
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* أقسام المنيو - Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none justify-start sm:justify-center">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-[#F6B21A] text-[#2C2C2C] shadow-md scale-105'
              : 'bg-white dark:bg-[#2C2C2C] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
          }`}
        >
          {isRTL ? 'الكل 🍽️' : 'Tout 🍽️'}
        </button>
        {menuCategories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#F6B21A] text-[#2C2C2C] shadow-md scale-105'
                  : 'bg-white dark:bg-[#2C2C2C] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{isRTL ? cat.nameAr : cat.nameFr}</span>
            </button>
          );
        })}
      </div>

      {/* حالة التحميل Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-10 h-10 text-[#F6B21A] animate-spin" />
          <p className="text-gray-400 font-bold text-sm">
            {isRTL ? 'جاري تحميل المنيو...' : 'Chargement du menu...'}
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 font-bold">
            {isRTL ? 'لا توجد نتائج مطابقة' : 'Aucun résultat trouvé'}
          </p>
        </div>
      ) : (
        /* شبكة المنتجات Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const quantityInCart = getItemCartQuantity(item.id);
            const isJustAdded = addedItemId === item.id;
            const isDrink = item.category === 'boissons';
            const title = lang === 'ar' ? item.nameAr || item.nameFr || item.name : item.nameFr || item.name;
            const description = lang === 'ar' ? item.descriptionAr || item.descriptionFr || item.description : item.descriptionFr || item.description;

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="bg-white dark:bg-[#2C2C2C] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-gray-100 dark:border-gray-800/80 group cursor-pointer"
              >
                <div className="p-4 space-y-3">
                  {/* الصورة */}
                  <div className="relative aspect-square rounded-2xl bg-[#FAF9F6] dark:bg-[#1f1f1f] overflow-hidden flex items-center justify-center">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={title}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-700" />
                    )}
                    {quantityInCart > 0 && (
                      <span className="absolute top-3 right-3 bg-[#F6B21A] text-[#2C2C2C] font-black text-xs px-2.5 py-1 rounded-full shadow-md">
                        {quantityInCart}
                      </span>
                    )}
                  </div>

                  {/* تفاصيل الوجبة */}
                  <div>
                    <h3 className="font-bold text-lg text-[#2C2C2C] dark:text-white line-clamp-1">
                      {title}
                    </h3>
                    {description && (
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                        {description}
                      </p>
                    )}
                  </div>
                </div>

                {/* السعر والزر */}
                <div className="p-4 pt-0 flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-2xl font-black text-[#F6B21A]">
                      {item.price}
                    </span>
                    <span className="text-xs font-bold text-gray-400 ml-1">
                      {t.dt}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(item);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                      isJustAdded
                        ? 'bg-[#25D366] text-white scale-95'
                        : 'bg-[#F6B21A] hover:bg-[#e0a012] text-[#2C2C2C] active:scale-95 shadow-sm'
                    }`}
                  >
                    {isJustAdded ? (
                      <>
                        <Check size={14} />
                        <span>{isRTL ? 'تمت الإضافة' : 'Ajouté'}</span>
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        <span>
                          {isDrink
                            ? isRTL ? 'إضافة' : 'Ajouter'
                            : isRTL ? 'تخصيص' : 'Personnaliser'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------ MODAL (نافذة تخصيص الوجبة) ------------------ */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-white dark:bg-[#1A1A1A] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transition-all border border-gray-100 dark:border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header النافذة */}
            <div className="relative p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Utensils size={20} className="text-[#F6B21A]" />
                <h3 className="text-xl font-black text-[#2C2C2C] dark:text-white">
                  {lang === 'ar' ? selectedItemForModal.nameAr || selectedItemForModal.nameFr || selectedItemForModal.name : selectedItemForModal.nameFr || selectedItemForModal.name}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* محتوى الخيارات (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* 1. Suppléments الإضافات */}
              {selectedItemForModal.supplements && selectedItemForModal.supplements.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm text-[#2C2C2C] dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#F6B21A]"></span>
                    {isRTL ? 'الإضافات (Suppléments)' : 'Suppléments (إضافات)'}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedItemForModal.supplements.map((supp, idx) => {
                      const isSelected = selectedSupplements.some(s => s.name === supp.name);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleSupplement(supp)}
                          className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                            isSelected
                              ? 'border-[#F6B21A] bg-[#F6B21A]/10 text-[#2C2C2C] dark:text-white'
                              : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                          }`}
                        >
                          <span>{supp.name}</span>
                          <span className="text-[#F6B21A] font-black">+{supp.price} DT</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Sauces الصلصات */}
              {selectedItemForModal.sauces && selectedItemForModal.sauces.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm text-[#2C2C2C] dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {isRTL ? 'اختر الصلصات (Sauces)' : 'Sauces au choix'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItemForModal.sauces.map((sauce, idx) => {
                      const isSelected = selectedSauces.includes(sauce);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleSauce(sauce)}
                          className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {sauce}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Sans بدون */}
              {selectedItemForModal.removableIngredients && selectedItemForModal.removableIngredients.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm text-[#2C2C2C] dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    {isRTL ? 'بدون (Sans)' : 'Sans (إزالة مكونات)'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItemForModal.removableIngredients.map((ing, idx) => {
                      const isSelected = removedIngredients.includes(ing);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleRemoveIngredient(ing)}
                          className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                            isSelected
                              ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 line-through'
                              : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          Sans {ing}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Note / Commentaire ملاحظات */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-[#2C2C2C] dark:text-white flex items-center gap-2">
                  <MessageSquare size={14} className="text-gray-400" />
                  {isRTL ? 'ملاحظة خاصة (Note)' : 'Remarque spéciale'}
                </h4>
                <textarea
                  rows={2}
                  value={customComment}
                  onChange={(e) => setCustomComment(e.target.value)}
                  placeholder={isRTL ? 'أي ملاحظة للمطبخ...' : 'Ex: Extra cuit, pas trop piquant...'}
                  className="w-full p-3 text-xs rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#252525] text-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#F6B21A]"
                />
              </div>
            </div>

            {/* Footer النافذة السفلية - السعر الإجمالي وزر الإضافة */}
            <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4 bg-gray-50/50 dark:bg-[#1f1f1f]">
              <div>
                <span className="text-xs text-gray-400 block font-bold">{isRTL ? 'السعر الإجمالي:' : 'Prix Total:'}</span>
                <span className="text-2xl font-black text-[#F6B21A]">
                  {calculateModalTotalPrice().toFixed(1)} <span className="text-xs font-bold text-gray-400">DT</span>
                </span>
              </div>
              <button
                onClick={handleConfirmAddToCart}
                className="px-6 py-3.5 rounded-2xl bg-[#F6B21A] hover:bg-[#e0a012] text-[#2C2C2C] font-black text-sm transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                <Plus size={16} />
                <span>{isRTL ? 'إضافة للسلة' : 'Ajouter au Panier'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
