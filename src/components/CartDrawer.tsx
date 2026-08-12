import { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ImageIcon, Send, User, Phone, MapPin, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useCart, CartItem } from '@/contexts/CartContext';
import { useLang } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';

interface SavedOrderSnapshot {
  orderNum: string;
  items: CartItem[];
  total: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  isTakeAway: boolean;
}

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
    clearCart
  } = useCart();

  const { t, isRTL } = useLang();

  // التحكم في خطوات الطلب (1: السلة | 2: إدخال البيانات | 3: بطاقة التأكيد والإرسال)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // بيانات العميل
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // الاحتفاظ بنسخة الطلب المحفوظة لعدم تكرار الإنشاء في قاعدة البيانات
  const [savedOrder, setSavedOrder] = useState<SavedOrderSnapshot | null>(null);

  // حالة التحميل أثناء التوليد والإرسال
  const [isSending, setIsSending] = useState(false);

  // رقم الواتساب الخاص بالمطعم
  const RESTAURANT_WHATSAPP_NUMBER = '21698157474';

  // إغلاق النافذة العادية بدون مسح السلة إذا لم يكتمل الطلب
  const handleClose = () => {
    setIsCartOpen(false);
    // إعادة تعيين الخطوة بعد اختفاء النافذة دون مسح السلة
    setTimeout(() => {
      if (step === 3) {
        setStep(1);
        setSavedOrder(null);
      }
    }, 300);
  };

  // الرجوع لخطوة سابقة
  const handleGoBack = () => {
    setStep((prev) => (prev - 1) as 1 | 2);
  };

  // الانتقال للخطوة 3 وتوليد رقم الطلب في Supabase
  const handleProceedToConfirmation = async () => {
    if (cartItems.length === 0 || isSending) return;

    // إذا تم إنشاء الطلب سابقاً ولم تتغير البيانات، الانتقال فوراً للخطوة الأخيرة
    if (savedOrder) {
      setStep(3);
      return;
    }

    setIsSending(true);

    try {
      const orderDetails = cartItems.map((item: CartItem) => ({
        name: item.item.nameFr,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        supplements: item.selectedSupplements || [],
        sauces: item.selectedSauces || [],
        removed: item.removedIngredients || [],
        comment: item.comment || ''
      }));

      const { data: orderNum, error } = await supabase.rpc('create_order_and_get_number', {
        p_name: customerName.trim(),
        p_phone: customerPhone.trim(),
        p_address: customerAddress.trim(),
        p_total: totalPrice,
        p_type: isTakeAway ? 'À EMPORTER' : 'Sur place',
        p_details: JSON.stringify(orderDetails)
      });

      if (error || !orderNum) {
        throw error || new Error('فشل الاتصال بقاعدة البيانات');
      }

      // حفظ نسخة ثابته (Snapshot) من الطلب مع الاحتفاظ بـ orderNum كـ string
      setSavedOrder({
        orderNum: String(orderNum),
        items: [...cartItems],
        total: totalPrice,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        isTakeAway
      });

      setStep(3);

    } catch (err) {
      console.error('Error creating order:', err);
      alert('تعذر الاتصال بالخادم لإصدار رقم الطلب. يرجى التأكد من اتصال الإنترنت والمحاولة مرة أخرى.');
    } finally {
      setIsSending(false);
    }
  };

  // الإرسال النهائي إلى الواتساب وتنظيف السلة فوراً
  const handleFinalSendToWhatsApp = () => {
    if (!savedOrder) return;

    const { orderNum, items, total, customerName, customerPhone, customerAddress, isTakeAway } = savedOrder;

    let message = `🛒 *Nouvelle Commande - Cheesy Medenine*\n`;
    message += `🔢 *Commande N°:* #${orderNum}\n`;
    message += `-------------------------------------------\n`;
    message += `📍 *Type de commande:* ${isTakeAway ? '🛍️ *À EMPORTER (للأخذ)*' : '🍽️ *Sur place (في المطعم)*'}\n\n`;

    if (customerName || customerPhone || customerAddress) {
      message += `👤 *Informations Client (بيانات العميل):*\n`;
      if (customerName) message += `• *Nom:* ${customerName}\n`;
      if (customerPhone) message += `• *Tél:* ${customerPhone}\n`;
      if (customerAddress) message += `• *Adresse:* ${customerAddress}\n`;
      message += `-------------------------------------------\n`;
    }

    message += `📋 *Détails de la commande:*\n`;

    items.forEach(({ item, quantity, unitPrice, selectedSupplements, selectedSauces, removedIngredients, comment }: CartItem, index: number) => {
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
    message += `💰 *TOTAL GENERAL:* *${total.toFixed(1)} DT*\n`;
    message += `-------------------------------------------`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${RESTAURANT_WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
    
    // 1. فتح تطبيق الواتساب
    window.open(whatsappUrl, '_blank');

    // 2. تنظيف السلة وإعادة ضبط الواجهة
    if (typeof clearCart === 'function') {
      clearCart();
    }
    setSavedOrder(null);
    setStep(1);
    setIsCartOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-full sm:w-96 z-[70] bg-white dark:bg-[#1a1a1a] shadow-2xl transition-transform duration-300 flex flex-col ${
          isCartOpen ? 'translate-x-0' : isRTL ? '-translate-x-full' : 'translate-x-full'
        }`}
      >
        {/* Header Dynamic */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={handleGoBack}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''} />
              </button>
            )}
            <ShoppingBag size={22} className="text-[#F6B21A]" />
            <h2 className="text-xl font-black text-[#2C2C2C] dark:text-white">
              {step === 1 && t.yourOrder}
              {step === 2 && 'Informations (البيانات)'}
              {step === 3 && 'Confirmation (التأكيد)'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} className="text-[#2C2C2C] dark:text-white" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* STEP 1: CART ITEMS */}
          {step === 1 && (
            <>
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingBag size={56} className="text-gray-200 dark:text-gray-700" />
                  <p className="text-gray-400 dark:text-gray-500 font-medium">{t.cartEmpty}</p>
                </div>
              ) : (
                cartItems.map(({ cartItemId, item, quantity, unitPrice, selectedSupplements, selectedSauces, removedIngredients, comment }: CartItem) => (
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
                        {comment && <p className="italic text-gray-400">"{comment}"</p>}
                      </div>
                      <p className="text-[#F6B21A] font-black mt-1">{(unitPrice * quantity).toFixed(1)} {t.dt}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => {
                            setSavedOrder(null);
                            updateQuantity(cartItemId, -1);
                          }}
                          className="w-7 h-7 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-[#F6B21A]"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-black text-sm w-5 text-center">{quantity}</span>
                        <button
                          onClick={() => {
                            setSavedOrder(null);
                            updateQuantity(cartItemId, 1);
                          }}
                          className="w-7 h-7 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-[#F6B21A]"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          onClick={() => {
                            setSavedOrder(null);
                            removeFromCart(cartItemId);
                          }}
                          className="ml-auto p-1.5 rounded-full hover:bg-red-50 text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* STEP 2: CUSTOMER DETAILS FORM */}
          {step === 2 && (
            <div className="space-y-4 pt-2">
              <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Entrez vos coordonnées (أدخل معلوماتك):</p>
              
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-500">Nom Complet (الاسم):</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ex: Mohamed Ali"
                    value={customerName}
                    onChange={(e) => {
                      setSavedOrder(null);
                      setCustomerName(e.target.value);
                    }}
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#2C2C2C] text-gray-800 dark:text-white focus:outline-none focus:border-[#F6B21A]"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-500">Téléphone (رقم الهاتف):</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="Ex: 20 000 000"
                    value={customerPhone}
                    onChange={(e) => {
                      setSavedOrder(null);
                      setCustomerPhone(e.target.value);
                    }}
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#2C2C2C] text-gray-800 dark:text-white focus:outline-none focus:border-[#F6B21A]"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-500">Adresse (العنوان):</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ex: Cité Medenine..."
                    value={customerAddress}
                    onChange={(e) => {
                      setSavedOrder(null);
                      setCustomerAddress(e.target.value);
                    }}
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#2C2C2C] text-gray-800 dark:text-white focus:outline-none focus:border-[#F6B21A]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ORDER SUMMARY CARD & NUMBER */}
          {step === 3 && savedOrder && (
            <div className="space-y-4 pt-2">
              <div className="p-5 rounded-3xl bg-amber-500/10 border-2 border-[#F6B21A] text-center relative overflow-hidden">
                <div className="inline-flex p-2 bg-[#F6B21A] text-white rounded-full mb-2">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Commande Prête</p>
                <h3 className="text-3xl font-black text-[#2C2C2C] dark:text-white my-1">
                  #{savedOrder.orderNum}
                </h3>
                <p className="text-xs text-[#F6B21A] font-bold">Numéro de commande (رقم الطلب)</p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#2C2C2C] space-y-3 text-xs">
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-bold">{savedOrder.isTakeAway ? '🛍️ À Emporter' : '🍽️ Sur place'}</span>
                </div>
                {savedOrder.customerName && (
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                    <span className="text-gray-500">Nom:</span>
                    <span className="font-bold">{savedOrder.customerName}</span>
                  </div>
                )}
                {savedOrder.customerPhone && (
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                    <span className="text-gray-500">Téléphone:</span>
                    <span className="font-bold">{savedOrder.customerPhone}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-gray-500">Articles (المنتجات):</span>
                  <span className="font-bold">{savedOrder.items.length}</span>
                </div>
                <div className="flex justify-between text-sm pt-1">
                  <span className="font-bold text-gray-700 dark:text-gray-300">Total:</span>
                  <span className="font-black text-[#F6B21A] text-base">{savedOrder.total.toFixed(1)} DT</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {(cartItems.length > 0 || (step === 3 && savedOrder)) && (
          <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-800 space-y-3">
            {step === 1 && (
              <>
                <button
                  onClick={() => {
                    setSavedOrder(null);
                    setIsTakeAway(!isTakeAway);
                  }}
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
                  <span className={`text-xs px-2 py-0.5 rounded-full font-black ${isTakeAway ? 'bg-white text-emerald-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
                    {isTakeAway ? '✅ ACTIVÉ' : 'DESACTIVÉ'}
                  </span>
                </button>

                <div className="flex justify-between items-center py-1">
                  <span className="font-semibold text-gray-600 dark:text-gray-400">{t.total}</span>
                  <span className="text-2xl font-black text-[#F6B21A]">{totalPrice.toFixed(1)} {t.dt}</span>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 rounded-2xl bg-[#F6B21A] hover:bg-[#e0a116] text-white font-black text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F6B21A]/20"
                >
                  <span>Suivant (التالي)</span>
                </button>
              </>
            )}

            {step === 2 && (
              <button
                onClick={handleProceedToConfirmation}
                disabled={isSending}
                className="w-full py-3.5 rounded-2xl bg-[#F6B21A] hover:bg-[#e0a116] text-white font-black text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F6B21A]/20 disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Génération du numéro...</span>
                  </>
                ) : (
                  <span>Confirmer & Voir le reçu (تأكيد الطلب)</span>
                )}
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleFinalSendToWhatsApp}
                className="w-full py-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#25D366]/30 flex items-center justify-center gap-2"
              >
                <Send size={18} />
                <span>Envoyer sur WhatsApp</span>
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
