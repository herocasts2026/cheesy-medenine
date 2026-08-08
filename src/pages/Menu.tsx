import { useState, useRef } from 'react';
import { Plus, Minus, Check, ChevronLeft, ChevronRight, X, Expand, ShoppingBag, ImageIcon } from 'lucide-react';
import { menuItems, menuCategories, tacosSupplements, tacosSauces, MenuItem } from '@/data/menuData';
import { useCart } from '@/contexts/CartContext';
import { useLang } from '@/contexts/LanguageContext';

export default function Menu() {
  const { t, isRTL } = useLang();
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState('burgers');
  const [tacosModal, setTacosModal] = useState<MenuItem | null>(null);
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);

  const filteredItems = menuItems.filter(i => i.category === activeCategory);

  return (
    <div className="pt-24 pb-20 bg-[#FAF9F6] dark:bg-[#1a1a1a] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#F6B21A] font-black uppercase tracking-wider text-sm mb-2">{t.ourMenu}</p>
          <h1 className="text-4xl sm:text-5xl font-black text-[#2C2C2C] dark:text-white mb-3">{t.ourMenuSub}</h1>
          <p className="text-gray-500 dark:text-gray-400">Cheesy Medenine — {t.medenine}</p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {menuCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#F6B21A] text-[#2C2C2C] shadow-lg shadow-[#F6B21A]/30 scale-105'
                  : 'bg-white dark:bg-[#2C2C2C] text-[#2C2C2C] dark:text-white hover:bg-[#F6B21A]/10'
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span>{isRTL ? cat.nameAr : cat.nameFr}</span>
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map(item => (
            <ProductCard
              key={item.id}
              item={item}
              onExpand={() => setDetailItem(item)}
              onAdd={() => item.id === 'tacos-geant' || item.id === 'tacos-poulet' || item.id === 'tacos-geant-viande-hachee' ? setTacosModal(item) : addToCart(item)}
            />
          ))}
        </div>
      </div>

      {detailItem && <DetailModal item={detailItem} onClose={() => setDetailItem(null)} onAdd={(i) => { addToCart(i); setDetailItem(null); }} />}
      {tacosModal && <TacosModal item={tacosModal} onClose={() => setTacosModal(null)} />}
    </div>
  );
}

/* ---------- Reusable Carousel ---------- */
function Carousel({ images, alt, className, arrowSize = 18, showExpand = false, onExpand }: {
  images: string[];
  alt: string;
  className?: string;
  arrowSize?: number;
  showExpand?: boolean;
  onExpand?: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const touchX = useRef<number | null>(null);
  const hasMultiple = images.length > 1;
  const isEmpty = images.length === 0;

  if (isEmpty) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-[#333] ${className}`}>
        <ImageIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
      </div>
    );
  }

  const next = (e?: React.MouseEvent) => { e?.stopPropagation(); setIdx(i => (i + 1) % images.length); };
  const prev = (e?: React.MouseEvent) => { e?.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); };

  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx > 50) prev();
    else if (dx < -50) next();
    touchX.current = null;
  };

  return (
    <div className={`relative overflow-hidden bg-gray-50 dark:bg-[#333] ${className}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="w-full h-full flex items-center justify-center p-2.5">
        <img
          src={images[idx]}
          alt={alt}
          className="w-full h-full object-contain"
        />
      </div>

      {hasMultiple && (
        <>
          {/* Arrows — always visible on mobile, hover on desktop */}
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            aria-label="Previous"
          >
            <ChevronLeft size={arrowSize} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            aria-label="Next"
          >
            <ChevronRight size={arrowSize} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-5 bg-[#F6B21A]' : 'w-1.5 bg-white/60'}`} />
            ))}
          </div>
        </>
      )}

      {showExpand && hasMultiple && (
        <div className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <Expand size={14} />
        </div>
      )}
    </div>
  );
}

/* ---------- Product Card ---------- */
function ProductCard({ item, onExpand, onAdd }: { item: MenuItem; onExpand: () => void; onAdd: () => void }) {
  const { t, isRTL } = useLang();

  return (
    <div className="group flex flex-col rounded-3xl overflow-hidden bg-white dark:bg-[#2C2C2C] shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2">
      <div className="relative h-44 sm:h-48 cursor-pointer bg-gray-50 dark:bg-[#333]" onClick={onExpand}>
        <Carousel
          images={item.images}
          alt={item.nameFr}
          className="h-full w-full"
          showExpand
          onExpand={onExpand}
        />
        <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-[#F6B21A] text-[#2C2C2C] font-black text-base shadow-lg z-10">
          {item.price} {t.dt}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6">
        <h3 className="text-lg sm:text-xl font-black text-[#2C2C2C] dark:text-white mb-2 leading-snug">{isRTL ? item.nameAr : item.nameFr}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1">{isRTL ? item.descriptionAr : item.descriptionFr}</p>
        <button
          onClick={onAdd}
          className="mt-5 flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#2C2C2C] dark:bg-[#F6B21A] text-white dark:text-[#2C2C2C] font-bold hover:scale-[1.02] transition-all"
        >
          <Plus size={18} />
          {t.addToCart}
        </button>
      </div>
    </div>
  );
}

/* ---------- Detail Modal ---------- */
function DetailModal({ item, onClose, onAdd }: { item: MenuItem; onClose: () => void; onAdd: (i: MenuItem) => void }) {
  const { t, isRTL } = useLang();
  const [idx, setIdx] = useState(0);
  const touchX = useRef<number | null>(null);
  const images = item.images;
  const isEmpty = images.length === 0;
  const hasMultiple = images.length > 1;

  const next = () => setIdx(i => (i + 1) % images.length);
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);

  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx > 50) prev();
    else if (dx < -50) next();
    touchX.current = null;
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/60 transition-colors">
          <X size={20} />
        </button>

        {/* Carousel */}
        <div className="relative h-72 sm:h-96 overflow-hidden rounded-t-3xl bg-gray-100 dark:bg-[#333]" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {isEmpty ? (
            <div className="flex items-center justify-center w-full h-full">
              <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600" />
            </div>
          ) : (
            <>
              <div className="w-full h-full flex items-center justify-center p-3">
                <img
                  src={images[idx]}
                  alt={item.nameFr}
                  className="w-full h-full object-contain"
                />
              </div>
              {hasMultiple && (
                <>
                  <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm" aria-label="Previous">
                    <ChevronLeft size={22} />
                  </button>
                  <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm" aria-label="Next">
                    <ChevronRight size={22} />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setIdx(i)}
                        className={`h-2 rounded-full transition-all ${i === idx ? 'w-6 bg-[#F6B21A]' : 'w-2 bg-white/60'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Info */}
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h2 className="text-2xl sm:text-3xl font-black text-[#2C2C2C] dark:text-white">{isRTL ? item.nameAr : item.nameFr}</h2>
            <span className="text-2xl font-black text-[#F6B21A] whitespace-nowrap">{item.price} {t.dt}</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">{isRTL ? item.descriptionAr : item.descriptionFr}</p>

          {/* Thumbnails */}
          {hasMultiple && images.length > 0 && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {images.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === idx ? 'border-[#F6B21A] scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={g} alt="" className="w-full h-full object-contain p-0.5" />
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => onAdd(item)}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-[#F6B21A] hover:bg-[#FF9F1C] text-[#2C2C2C] font-black transition-all hover:scale-[1.02]"
          >
            <ShoppingBag size={18} />
            {t.addToCart} — {item.price} {t.dt}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Tacos Customization Modal ---------- */
function TacosModal({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const { t, isRTL } = useLang();
  const { addToCart } = useCart();
  const [sauces, setSauces] = useState<string[]>([]);
  const [supplements, setSupplements] = useState<string[]>([]);
  const [qty, setQty] = useState(1);

  const toggleSauce = (s: string) => setSauces(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleSupplement = (s: string) => setSupplements(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const supplementPrice = supplements.reduce((sum, name) => sum + (tacosSupplements.find(s => s.name === name)?.price || 0), 0);
  const total = (item.price + supplementPrice) * qty;

  const handleAdd = () => {
    const customized: MenuItem = {
      ...item,
      id: `${item.id}-${Date.now()}`,
      nameFr: `${item.nameFr} (${sauces.join(', ')}${supplements.length > 0 ? ' + ' + supplements.join(', ') : ''})`,
      price: item.price + supplementPrice,
    };
    for (let i = 0; i < qty; i++) addToCart(customized);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-[#2C2C2C] dark:text-white">{isRTL ? item.nameAr : item.nameFr}</h2>
            <p className="text-[#F6B21A] font-black mt-1">{item.price} {t.dt}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={20} className="text-[#2C2C2C] dark:text-white" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-black text-[#2C2C2C] dark:text-white mb-3">{isRTL ? 'الصلصات' : 'Sauces'}</h3>
          <div className="flex flex-wrap gap-2">
            {tacosSauces.map(s => (
              <button
                key={s}
                onClick={() => toggleSauce(s)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  sauces.includes(s)
                    ? 'bg-[#F6B21A] text-[#2C2C2C]'
                    : 'bg-[#FAF9F6] dark:bg-[#2C2C2C] text-[#2C2C2C] dark:text-white hover:bg-[#F6B21A]/10'
                }`}
              >
                {sauces.includes(s) && <Check size={14} />}
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-black text-[#2C2C2C] dark:text-white mb-3">{isRTL ? 'إضافات' : 'Suppléments'}</h3>
          <div className="grid grid-cols-2 gap-2">
            {tacosSupplements.map(s => (
              <button
                key={s.name}
                onClick={() => toggleSupplement(s.name)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  supplements.includes(s.name)
                    ? 'bg-[#F6B21A] text-[#2C2C2C]'
                    : 'bg-[#FAF9F6] dark:bg-[#2C2C2C] text-[#2C2C2C] dark:text-white hover:bg-[#F6B21A]/10'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {supplements.includes(s.name) && <Check size={14} />}
                  {s.name}
                </span>
                <span className="text-xs opacity-70">+{s.price} {t.dt}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <span className="font-black text-[#2C2C2C] dark:text-white">{t.quantity}</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-full bg-[#FAF9F6] dark:bg-[#2C2C2C] flex items-center justify-center"><Minus size={16} /></button>
            <span className="font-black text-lg w-8 text-center">{qty}</span>
            <button onClick={() => setQty(q => q + 1)} className="w-9 h-9 rounded-full bg-[#FAF9F6] dark:bg-[#2C2C2C] flex items-center justify-center"><Plus size={16} /></button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <span className="font-bold text-gray-600 dark:text-gray-400">{t.total}</span>
          <span className="text-2xl font-black text-[#F6B21A]">{total.toFixed(1)} {t.dt}</span>
        </div>
        <button
          onClick={handleAdd}
          className="w-full py-4 rounded-2xl bg-[#F6B21A] hover:bg-[#FF9F1C] text-[#2C2C2C] font-black transition-all hover:scale-[1.02]"
        >
          {t.addToCart} — {total.toFixed(1)} {t.dt}
        </button>
      </div>
    </div>
  );
}
