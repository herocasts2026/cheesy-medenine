import { X, Plus, Minus, Trash2, ShoppingBag, ImageIcon } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLang } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, isCartOpen, setIsCartOpen } = useCart();
  const { t, isRTL } = useLang();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/order');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-full sm:w-96 z-[70] bg-white dark:bg-[#1a1a1a] shadow-2xl transition-transform duration-300 flex flex-col ${
          isCartOpen ? 'translate-x-0' : isRTL ? '-translate-x-full' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <ShoppingBag size={22} className="text-[#F6B21A]" />
            <h2 className="text-xl font-black text-[#2C2C2C] dark:text-white">{t.yourOrder}</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} className="text-[#2C2C2C] dark:text-white" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={56} className="text-gray-200 dark:text-gray-700" />
              <p className="text-gray-400 dark:text-gray-500 font-medium">{t.cartEmpty}</p>
            </div>
          ) : (
            cartItems.map(({ item, quantity }) => (
              <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-[#FAF9F6] dark:bg-[#2C2C2C]">
                {item.images.length > 0 ? (
                  <img src={item.images[0]} alt={item.nameFr} className="w-16 h-16 rounded-xl object-contain p-1 flex-shrink-0" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/fallback-food.webp'; }} />
                ) : (
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-[#333] flex-shrink-0">
                    <ImageIcon className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#2C2C2C] dark:text-white text-sm leading-snug">{item.nameFr}</p>
                  <p className="text-[#F6B21A] font-black mt-1">{item.price} {t.dt}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-7 h-7 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-[#F6B21A] transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="font-black text-sm w-5 text-center">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-7 h-7 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-[#F6B21A] transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-auto p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-600 dark:text-gray-400">{t.total}</span>
              <span className="text-2xl font-black text-[#F6B21A]">{totalPrice.toFixed(1)} {t.dt}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-4 rounded-2xl bg-[#F6B21A] hover:bg-[#FF9F1C] text-[#2C2C2C] font-black text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#F6B21A]/30"
            >
              {t.checkout}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
