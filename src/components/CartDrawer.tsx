import { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ImageIcon, Send, User, Phone, MapPin } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLang } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';

export default function CartDrawer() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
    isTakeAway,
    setIsTakeAway,
  } = useCart();

  const { t, isRTL } = useLang();

  // بيانات العميل
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // رقم الواتساب الخاص بالمطعم
  const RESTAURANT_WHATSAPP_NUMBER = '21698157474';

  const handleSendToWhatsApp = async () => {
    if (cartItems.length === 0) return;

    let orderNum: number;

    try {
      // استدعاء دالة Supabase الذرية المصممة للترقيم اليومي
      const { data, error } = await supabase.rpc('get_next_order_number');

      if (error || data === null) {
        throw error;
      }

      orderNum = data;
    } catch {
      // احتياطي مؤقت في حالة تعثر الاتصال بقاعدة البيانات
      const now = new Date();
      orderNum = parseInt(`${now.getHours()}${now.getMinutes()}`, 10);
    }

    let message = `🛒 *Nouvelle Commande - Cheesy Medenine*\n`;
    message += `🔢 *Commande N°:* #${orderNum}\n`;
    message += `-------------------------------------------\n`;
    message += `📍 *Type de commande:* ${isTakeAway ? '🛍️ *À EMPORTER (للأخذ)*' : '🍽️ *Sur place (في المطعم)*'}\n\n`;

    // إضافة بيانات العميل
    if (customerName.trim() || customerPhone.trim() || customerAddress.trim()) {
      message += `👤 *Informations Client (بيانات العميل):*\n`;
      if (customerName.trim()) message += `• *Nom:* ${customerName.trim()}\n`;
      if (customerPhone.trim()) message += `• *Tél:* ${customerPhone.trim()}\n`;
      if (customerAddress.trim()) message += `• *Adresse:* ${customerAddress.trim()}\n`;
      message += `-------------------------------------------\n`;
    }

    message += `📋 *Détails de la commande:*\n`;

    cartItems.forEach(({ item, quantity, unitPrice, selectedSupplements, selectedSauces, removedIngredients, comment }, index) => {
      message += `\n*${index + 1}. ${item.nameFr}* (x${quantity}) - ${(unitPrice * quantity).toFixed(1)} DT\n`;

      if (selectedSupplements && selectedSupplements.length > 0) {
        message += `   ➕ *Suppléments:* ${selectedSupplements.map(s => `${s.name} (+${s.price}DT)`).join(', ')}\n`;
      }
      if (selectedSauces && selectedSauces.length > 0) {
        message += `   🍯 *Sauces:* ${selectedSauces.join(', ')}\n`;
      }
      if (removedIngredients && removedIngredients.length > 0) {
        message += `   ❌ *Sans:* ${removedIngredients.join(', ')}\n`;
      }
      if (comment && comment.trim() !== '') {
        message += `   📝 *Note:* ${comment.trim()}\n`;
      }
    });

    message += `\n-------------------------------------------\n`;
    message += `💰 *TOTAL GENERAL:* *${totalPrice.toFixed(1)} DT*\n`;
    message += `-------------------------------------------`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${RESTAURANT_WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
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
            <>
              {cartItems.map(({ cartItemId, item, quantity, unitPrice, selectedSupplements, selectedSauces, removedIngredients, comment }) => (
                <div key={cartItemId} className="flex gap-4 p-4 rounded-2xl bg-[#FAF9F6] dark:bg-[#2C2C2C]">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.nameFr}
                      className="w-16 h-16 rounded-xl object-contain p-1 flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/fallback-food.png';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-[#333] flex-shrink-0">
                      <ImageIcon className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#2C2C2C] dark:text-white text-sm leading-snug">{item.nameFr}</p>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
                      {selectedSupplements && selectedSupplements.length > 0 && (
                        <p><span className="font-semibold text-[#F6B21A]">+ </span>{selectedSupplements.map(s => s.name).join(', ')}</p>
                      )}
                      {selectedSauces && selectedSauces.length > 0 && (
                        <p><span className="font-semibold text-blue-500">Sauces: </span>{selectedSauces.join(', ')}</p>
                      )}
                      {removedIngredients && removedIngredients.length > 0 && (
                        <p><span className="font-semibold text-red-500">Sans: </span>{removedIngredients.join(', ')}</p>
                      )}
                      {comment && (
                        <p className="italic text-gray-400">"{comment}"</p>
                      )}
                    </div>
                    <p className="text-[#F6B21A] font-black mt-1">{(unitPrice * quantity).toFixed(1)} {t.dt}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(cartItemId, -1)}
                        className="w-7 h-7 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-[#F6B21A] transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-black text-sm w-5 text-center">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(cartItemId, 1)}
                        className="w-7 h-7 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-[#F6B21A] transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeFromCart(cartItemId)}
                        className="ml-auto p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* نموذج إدخال بيانات العميل */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-3">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Informations Client (بياناتك):</p>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nom / الاسم"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#2C2C2C] text-gray-800 dark:text-white focus:outline-none focus:border-[#F6B21A]"
                  />
                </div>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="Téléphone / رقم الهاتف"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#2C2C2C] text-gray-800 dark:text-white focus:outline-none focus:border-[#F6B21A]"
                  />
                </div>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Adresse de livraison / العنوان"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#2C2C2C] text-gray-800 dark:text-white focus:outline-none focus:border-[#F6B21A]"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-800 space-y-4">
            {/* Option: À emporter */}
            <button
              onClick={() => setIsTakeAway(!isTakeAway)}
              className={`w-full py-2.5 px-4 rounded-xl border flex items-center justify-between transition-all ${
                isTakeAway
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                  : 'bg-gray-50 dark:bg-[#2C2C2C] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <ShoppingBag size={18} />
                <span>À emporter (للأخذ)</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-black ${
                  isTakeAway ? 'bg-white text-emerald-600' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}
              >
                {isTakeAway ? '✅ ACTIVÉ' : 'DESACTIVÉ'}
              </span>
            </button>

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-600 dark:text-gray-400">{t.total}</span>
              <span className="text-2xl font-black text-[#F6B21A]">{totalPrice.toFixed(1)} {t.dt}</span>
            </div>

            {/* WhatsApp Checkout Button */}
            <button
              onClick={handleSendToWhatsApp}
              className="w-full py-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#25D366]/30 flex items-center justify-center gap-2"
            >
              <Send size={18} />
              <span>Envoyer sur WhatsApp</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
