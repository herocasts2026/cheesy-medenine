import { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, Send, MapPin, User, Phone, CheckCircle, X, FileText, Info, ImageIcon } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLang } from '@/contexts/LanguageContext';

export default function Order() {
  const { t, isRTL } = useLang();
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // دالة توليد رقم الطلب اليومي المتسلسل
  const generateDailyOrderNumber = (): string => {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = localStorage.getItem('lastOrderDate');
    let currentCount = parseInt(localStorage.getItem('dailyOrderCounter') || '0', 10);

    if (lastDate !== today) {
      currentCount = 0;
      localStorage.setItem('lastOrderDate', today);
    }

    const nextCount = currentCount + 1;
    localStorage.setItem('dailyOrderCounter', nextCount.toString());

    return `#${nextCount}`;
  };

  const buildWhatsAppMessage = (orderNum: string) => {
    const now = new Date();
    const date = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let msg = `🍔 CHEESY MEDENINE\n\n`;
    msg += `🆔 Order: ${orderNum}\n\n`;
    msg += `👤 Name:\n${name}\n\n`;
    msg += `📞 Phone:\n${phone}\n\n`;
    msg += `📍 Address:\n${address}\n\n`;
    msg += `🛒 Order:\n`;
    cartItems.forEach(({ item, quantity }) => {
      msg += `• ${item.nameFr} ×${quantity}\n`;
    });
    msg += `\n💰 Total:\n${totalPrice.toFixed(1)} ${t.dt}\n`;
    if (notes.trim()) {
      msg += `\n📝 Notes:\n${notes}\n`;
    }
    msg += `\n🕒 Time:\n${time}\n\n`;
    msg += `📅 Date:\n${date}\n`;
    return msg;
  };

  const handleSendOrder = () => {
    if (cartItems.length === 0 || !name || !phone || !address) return;
    setIsGenerating(true);
    const num = generateDailyOrderNumber();
    setOrderNumber(num);
    setIsGenerating(false);
    setShowConfirm(true);
  };

  const handleConfirmOrder = () => {
    const msg = buildWhatsAppMessage(orderNumber);
    const url = `https://wa.me/21698157474?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    setShowConfirm(false);
  };

  const isValid = cartItems.length > 0 && name && phone && address;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-[#2C2C2C] dark:text-white mb-2">{t.orderOnline}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t.yourOrder}</p>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <ShoppingBag size={64} className="text-gray-200 dark:text-gray-700" />
          <p className="text-gray-400 dark:text-gray-500 font-medium text-lg">{t.cartEmpty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cart Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-black text-[#2C2C2C] dark:text-white">{t.yourOrder}</h2>
              <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-500 font-semibold">Clear</button>
            </div>
            {cartItems.map(({ item, quantity }) => (
              <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-[#2C2C2C] shadow-sm">
                {item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.nameFr}
                    className="w-20 h-20 rounded-xl object-contain p-1 flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/fallback-food.png';
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-[#333] flex-shrink-0">
                    <ImageIcon className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#2C2C2C] dark:text-white text-sm leading-snug">{item.nameFr}</p>
                  <p className="text-[#F6B21A] font-black mt-1">{item.price} {t.dt}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 rounded-full bg-[#FAF9F6] dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 flex items-center justify-center"><Minus size={12} /></button>
                    <span className="font-black text-sm w-5 text-center">{quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 rounded-full bg-[#FAF9F6] dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 flex items-center justify-center"><Plus size={12} /></button>
                    <span className="ml-auto font-black text-[#2C2C2C] dark:text-white">{(item.price * quantity).toFixed(1)} {t.dt}</span>
                    <button onClick={() => removeFromCart(item.id)} className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
            {/* Total */}
            <div className="flex items-center justify-between p-6 rounded-2xl bg-white dark:bg-[#2C2C2C] shadow-sm mt-4">
              <span className="font-black text-lg text-[#2C2C2C] dark:text-white">{t.total}</span>
              <span className="text-3xl font-black text-[#F6B21A]">{totalPrice.toFixed(1)} {t.dt}</span>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="space-y-5">
            <h2 className="text-xl font-black text-[#2C2C2C] dark:text-white">{t.deliveryAddress}</h2>
            <div className="p-6 rounded-2xl bg-white dark:bg-[#2C2C2C] shadow-sm space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-[#2C2C2C] dark:text-white mb-2">
                  <User size={16} className="text-[#F6B21A]" /> {t.yourName}
                </label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-[#2C2C2C] dark:text-white focus:border-[#F6B21A] focus:outline-none transition-colors" placeholder={isRTL ? 'اسمك الكامل' : 'Votre nom complet'} />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-[#2C2C2C] dark:text-white mb-2">
                  <Phone size={16} className="text-[#F6B21A]" /> {t.yourPhone}
                </label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-[#2C2C2C] dark:text-white focus:border-[#F6B21A] focus:outline-none transition-colors" placeholder="+216 ..." dir="ltr" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-[#2C2C2C] dark:text-white mb-2">
                  <MapPin size={16} className="text-[#F6B21A]" /> {t.yourAddress}
                </label>
                <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-[#2C2C2C] dark:text-white focus:border-[#F6B21A] focus:outline-none transition-colors resize-none" placeholder={isRTL ? 'العنوان الكامل في مدنين' : 'Votre adresse complète à Médenine'} />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-[#2C2C2C] dark:text-white mb-2">
                  <FileText size={16} className="text-[#F6B21A]" /> {isRTL ? 'ملاحظات' : 'Notes'}
                </label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-[#2C2C2C] dark:text-white focus:border-[#F6B21A] focus:outline-none transition-colors resize-none" placeholder={isRTL ? 'أي ملاحظات خاصة...' : 'Notes spéciales...'} />
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F6B21A]/10">
                <span className="text-2xl">💵</span>
                <div>
                  <p className="font-bold text-[#2C2C2C] dark:text-white text-sm">{t.paymentMethod}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{isRTL ? 'ادفع نقداً عند الباب' : 'Payez en espèces à la porte'}</p>
                </div>
              </div>
              <button onClick={handleSendOrder} disabled={!isValid} className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-[#25D366] hover:bg-[#1ebe57] text-white font-black transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100" >
                <Send size={18} /> {isGenerating ? (isRTL ? 'جاري التوليد...' : 'Génération...') : t.sendOrder}
              </button>
              {!isValid && (
                <p className="text-xs text-center text-gray-400">{isRTL ? 'يرجى ملء جميع الحقول' : 'Veuillez remplir tous les champs'}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <CheckCircle size={22} className="text-[#25D366]" />
                <h3 className="text-lg font-black text-[#2C2C2C] dark:text-white">{isRTL ? 'تأكيد الطلب' : 'Confirmer la Commande'}</h3>
              </div>
              <button onClick={() => setShowConfirm(false)} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X size={18} className="text-[#2C2C2C] dark:text-white" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">{isRTL ? 'رقم الطلب' : 'Numéro de commande'}</p>
                <p className="text-2xl font-black text-[#F6B21A]">{orderNumber}</p>
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#F6B21A]/10 text-xs text-[#2C2C2C] dark:text-gray-300">
                <Info size={15} className="text-[#F6B21A] flex-shrink-0 mt-0.5" />
                <p>{isRTL ? `رقم طلبك هو ${orderNumber}. احتفظ به للاستعلام عن الطلب.` : `Votre numéro de commande est ${orderNumber}. Gardez ce numéro pour le restaurant.`}</p>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex gap-2"><span className="font-bold text-gray-500 dark:text-gray-400 min-w-[70px]">{isRTL ? 'الاسم' : 'Nom'}:</span><span className="font-semibold text-[#2C2C2C] dark:text-white">{name}</span></div>
                <div className="flex gap-2"><span className="font-bold text-gray-500 dark:text-gray-400 min-w-[70px]">{isRTL ? 'الهاتف' : 'Téléphone'}:</span><span className="font-semibold text-[#2C2C2C] dark:text-white" dir="ltr">{phone}</span></div>
                <div className="flex gap-2"><span className="font-bold text-gray-500 dark:text-gray-400 min-w-[70px]">{isRTL ? 'العنوان' : 'Adresse'}:</span><span className="font-semibold text-[#2C2C2C] dark:text-white">{address}</span></div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-2.5">
                <p className="font-black text-[#2C2C2C] dark:text-white text-xs mb-1.5">{isRTL ? 'الطلبات' : 'Articles'}:</p>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {cartItems.map(({ item, quantity }) => (
                    <div key={item.id} className="flex justify-between text-xs">
                      <span className="text-[#2C2C2C] dark:text-white">• {item.nameFr} ×{quantity}</span>
                      <span className="font-bold text-[#2C2C2C] dark:text-white">{(item.price * quantity).toFixed(1)} {t.dt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-2.5">
                <span className="font-black text-sm text-[#2C2C2C] dark:text-white">{t.total}</span>
                <span className="text-xl font-black text-[#F6B21A]">{totalPrice.toFixed(1)} {t.dt}</span>
              </div>
            </div>

            {/* Fixed Footer with Button */}
            <div className="p-3 bg-white dark:bg-[#1a1a1a] border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
              <button onClick={handleConfirmOrder} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe57] text-white font-black text-sm transition-all hover:scale-[1.01]" >
                <Send size={16} /> {isRTL ? 'تأكيد وإرسال عبر الواتساب' : 'Confirmer & Envoyer via WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
