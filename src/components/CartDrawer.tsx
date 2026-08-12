import { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ImageIcon,
  Send,
  User,
  Phone,
  MapPin,
  Loader2,
  ArrowLeft,
} from 'lucide-react';

import { useCart, CartItem } from '@/contexts/CartContext';
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
    clearCart,
  } = useCart();

  const { t, isRTL } = useLang();

  // =========================================================
  // خطوات الطلب
  // 1 = السلة
  // 2 = معلومات العميل والتأكيد
  // =========================================================
  const [step, setStep] = useState<1 | 2>(1);

  // =========================================================
  // معلومات العميل
  // =========================================================
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // =========================================================
  // حالة إرسال الطلب
  // =========================================================
  const [isSending, setIsSending] = useState(false);

  // =========================================================
  // رقم WhatsApp الخاص بالمطعم
  // =========================================================
  const RESTAURANT_WHATSAPP_NUMBER = '21698157474';

  // =========================================================
  // إغلاق السلة
  // =========================================================
  const handleClose = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      setStep(1);
    }, 300);
  };

  // =========================================================
  // الرجوع خطوة إلى الخلف
  // =========================================================
  const handleGoBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  // =========================================================
  // الانتقال إلى خطوة البيانات
  // =========================================================
  const handleGoToCustomerDetails = () => {
    if (cartItems.length === 0) return;
    setStep(2);
  };

  // =========================================================
  // إنشاء رسالة WhatsApp
  // =========================================================
  const buildWhatsAppMessage = (): string => {
    let message = '';

    // العنوان
    message += `🛒 *Nouvelle Commande - Cheesy Medenine*\n`;
    message += `-------------------------------------------\n`;

    // نوع الطلب
    message += `📍 *Type de commande:* ${
      isTakeAway
        ? '🛍️ *À EMPORTER (للأخذ)*'
        : '🍽️ *Sur place (في المطعم)*'
    }\n\n`;

    // معلومات العميل
    if (customerName || customerPhone || customerAddress) {
      message += `👤 *Informations Client (بيانات العميل):*\n`;

      if (customerName.trim()) {
        message += `• *Nom:* ${customerName.trim()}\n`;
      }

      if (customerPhone.trim()) {
        message += `• *Tél:* ${customerPhone.trim()}\n`;
      }

      if (customerAddress.trim()) {
        message += `• *Adresse:* ${customerAddress.trim()}\n`;
      }

      message += `-------------------------------------------\n`;
    }

    // تفاصيل الطلب
    message += `📋 *Détails de la commande:*\n`;

    cartItems.forEach(
      (
        {
          item,
          quantity,
          unitPrice,
          selectedSupplements,
          selectedSauces,
          removedIngredients,
          comment,
        }: CartItem,
        index: number
      ) => {
        message += `\n*${index + 1}. ${item.nameFr}* (x${quantity}) - ${(
          unitPrice * quantity
        ).toFixed(1)} DT\n`;

        // الإضافات
        if (selectedSupplements && selectedSupplements.length > 0) {
          message += `   ➕ *Suppléments:* ${selectedSupplements
            .map((supplement) => `${supplement.name} (+${supplement.price}DT)`)
            .join(', ')}\n`;
        }

        // الصلصات
        if (selectedSauces && selectedSauces.length > 0) {
          message += `   🍯 *Sauces:* ${selectedSauces.join(', ')}\n`;
        }

        // المكونات المحذوفة
        if (removedIngredients && removedIngredients.length > 0) {
          message += `   ❌ *Sans:* ${removedIngredients.join(', ')}\n`;
        }

        // الملاحظة
        if (comment && comment.trim() !== '') {
          message += `   📝 *Note:* ${comment.trim()}\n`;
        }
      }
    );

    // المجموع النهائي
    message += `\n-------------------------------------------\n`;
    message += `💰 *TOTAL GENERAL:* *${totalPrice.toFixed(1)} DT*\n`;
    message += `-------------------------------------------`;

    return message;
  };

  // =========================================================
  // حفظ الطلب في Supabase والتوجيه مباشرة إلى WhatsApp
  // =========================================================
  const handleConfirmAndSendToWhatsApp = async () => {
    if (cartItems.length === 0 || isSending) return;

    if (!customerPhone.trim()) {
      alert('يرجى إدخال رقم الهاتف أولاً.');
      return;
    }

    setIsSending(true);

    try {
      // 1. تجهيز البيانات للتخزين في Supabase
      const orderDetails = cartItems.map((cartItem: CartItem) => ({
        name: cartItem.item.nameFr,
        quantity: cartItem.quantity,
        unitPrice: cartItem.unitPrice,
        supplements: cartItem.selectedSupplements || [],
        sauces: cartItem.selectedSauces || [],
        removed: cartItem.removedIngredients || [],
        comment: cartItem.comment?.trim() || '',
      }));

      // 2. الحفظ المباشر في الجدول بدون RPC أو order_number
      const { error } = await supabase.from('orders').insert({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_address: customerAddress.trim(),
        total: totalPrice,
        order_type: isTakeAway ? 'À EMPORTER' : 'Sur place',
        details: orderDetails,
      });

      if (error) {
        console.error('Supabase Insert Error:', error);
      }

      // 3. فتح الواتساب
      const message = buildWhatsAppMessage();
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${RESTAURANT_WHATSAPP_NUMBER}&text=${encodeURIComponent(
        message
      )}`;

      window.open(whatsappUrl, '_blank');

      // 4. إعادة تهيئة السلة والنموذج
      if (typeof clearCart === 'function') {
        clearCart();
      }

      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setStep(1);
      setIsCartOpen(false);
    } catch (err) {
      console.error('Error during checkout:', err);
      alert('حدث خطأ أثناء تنفيذ الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* BACKDROP */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={handleClose}
      />

      {/* DRAWER */}
      <div
        className={`fixed top-0 ${
          isRTL ? 'left-0' : 'right-0'
        } h-full w-full sm:w-96 z-[70] bg-white dark:bg-[#1a1a1a] shadow-2xl transition-transform duration-300 flex flex-col ${
          isCartOpen
            ? 'translate-x-0'
            : isRTL
            ? '-translate-x-full'
            : 'translate-x-full'
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={handleGoBack}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Retour"
              >
                <ArrowLeft
                  size={20}
                  className={isRTL ? 'rotate-180' : ''}
                />
              </button>
            )}

            <ShoppingBag size={22} className="text-[#F6B21A]" />

            <h2 className="text-xl font-black text-[#2C2C2C] dark:text-white">
              {step === 1 && t.yourOrder}
              {step === 2 && 'Informations (البيانات)'}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Fermer"
          >
            <X size={20} className="text-[#2C2C2C] dark:text-white" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* STEP 1 - CART */}
          {step === 1 && (
            <>
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingBag
                    size={56}
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <p className="text-gray-400 dark:text-gray-500 font-medium">
                    {t.cartEmpty}
                  </p>
                </div>
              ) : (
                cartItems.map(
                  ({
                    cartItemId,
                    item,
                    quantity,
                    unitPrice,
                    selectedSupplements,
                    selectedSauces,
                    removedIngredients,
                    comment,
                  }: CartItem) => (
                    <div
                      key={cartItemId}
                      className="flex gap-4 p-4 rounded-2xl bg-[#FAF9F6] dark:bg-[#2C2C2C]"
                    >
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.nameFr}
                          className="w-16 h-16 rounded-xl object-contain p-1 flex-shrink-0"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src =
                              '/images/fallback-food.png';
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-[#333] flex-shrink-0">
                          <ImageIcon className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#2C2C2C] dark:text-white text-sm leading-snug">
                          {item.nameFr}
                        </p>

                        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
                          {selectedSupplements &&
                            selectedSupplements.length > 0 && (
                              <p>
                                <span className="font-semibold text-[#F6B21A]">
                                  +{' '}
                                </span>
                                {selectedSupplements
                                  .map((supplement) => supplement.name)
                                  .join(', ')}
                              </p>
                            )}

                          {selectedSauces && selectedSauces.length > 0 && (
                            <p>
                              <span className="font-semibold text-blue-500">
                                Sauces:{' '}
                              </span>
                              {selectedSauces.join(', ')}
                            </p>
                          )}

                          {removedIngredients &&
                            removedIngredients.length > 0 && (
                              <p>
                                <span className="font-semibold text-red-500">
                                  Sans:{' '}
                                </span>
                                {removedIngredients.join(', ')}
                              </p>
                            )}

                          {comment && comment.trim() !== '' && (
                            <p className="italic text-gray-400">
                              "{comment}"
                            </p>
                          )}
                        </div>

                        <p className="text-[#F6B21A] font-black mt-1">
                          {(unitPrice * quantity).toFixed(1)} {t.dt}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(cartItemId, -1)
                            }
                            className="w-7 h-7 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-[#F6B21A]"
                            aria-label="Diminuer"
                          >
                            <Minus size={12} />
                          </button>

                          <span className="font-black text-sm w-5 text-center">
                            {quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(cartItemId, 1)
                            }
                            className="w-7 h-7 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-[#F6B21A]"
                            aria-label="Augmenter"
                          >
                            <Plus size={12} />
                          </button>

                          <button
                            type="button"
                            onClick={() => removeFromCart(cartItemId)}
                            className="ml-auto p-1.5 rounded-full hover:bg-red-50 text-red-400"
                            aria-label="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )
              )}
            </>
          )}

          {/* STEP 2 - CUSTOMER DETAILS */}
          {step === 2 && (
            <div className="space-y-4 pt-2">
              <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
                Entrez vos coordonnées (أدخل معلوماتك):
              </p>

              {/* NAME */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-500">
                  Nom Complet (الاسم):
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Ex: Mohamed Ali"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#2C2C2C] text-gray-800 dark:text-white focus:outline-none focus:border-[#F6B21A]"
                  />
                </div>
              </div>

              {/* PHONE */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-500">
                  Téléphone (رقم الهاتف) *:
                </label>
                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Ex: 20 000 000"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#2C2C2C] text-gray-800 dark:text-white focus:outline-none focus:border-[#F6B21A]"
                  />
                </div>
              </div>

              {/* ADDRESS */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-500">
                  Adresse (العنوان):
                </label>
                <div className="relative">
                  <MapPin
                    size={18}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Ex: Cité Medenine..."
                    value={customerAddress}
                    onChange={(event) => setCustomerAddress(event.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#2C2C2C] text-gray-800 dark:text-white focus:outline-none focus:border-[#F6B21A]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        {cartItems.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-800 space-y-3">
            {step === 1 && (
              <>
                <button
                  type="button"
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
                      isTakeAway
                        ? 'bg-white text-emerald-600'
                        : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    {isTakeAway ? '✅ ACTIVÉ' : 'DESACTIVÉ'}
                  </span>
                </button>

                <div className="flex justify-between items-center py-1">
                  <span className="font-semibold text-gray-600 dark:text-gray-400">
                    {t.total}
                  </span>
                  <span className="text-2xl font-black text-[#F6B21A]">
                    {totalPrice.toFixed(1)} {t.dt}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGoToCustomerDetails}
                  disabled={cartItems.length === 0}
                  className="w-full py-3.5 rounded-2xl bg-[#F6B21A] hover:bg-[#e0a116] text-white font-black text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F6B21A]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Suivant (التالي)</span>
                </button>
              </>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={handleConfirmAndSendToWhatsApp}
                disabled={isSending || !customerPhone.trim()}
                className="w-full py-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#25D366]/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Envoyer sur WhatsApp</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
