import { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Send,
  MapPin,
  User,
  Phone,
  CheckCircle,
  X,
  FileText,
  Info,
  ImageIcon,
  Loader2,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLang } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';

export default function Order() {
  const { t, isRTL } = useLang();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    totalPrice,
    clearCart,
  } = useCart();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [showConfirm, setShowConfirm] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  /* جلب رقم الطلب التسلسلي من Supabase */
  const generateDailyOrderNumber = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc('get_next_order_number');

      if (error) {
        console.error('Supabase RPC Error:', error);
        return null;
      }

      if (data === null || data === undefined) {
        return null;
      }

      const number = Number(data);
      if (!Number.isInteger(number) || number < 1) {
        return null;
      }

      return `#${number}`;
    } catch (error) {
      console.error('Unexpected error:', error);
      return null;
    }
  };

  /* صياغة رسالة الواتساب */
  const buildWhatsAppMessage = (orderNum: string) => {
    const now = new Date();
    const date = `${String(now.getDate()).padStart(2, '0')}/${String(
      now.getMonth() + 1
    ).padStart(2, '0')}/${now.getFullYear()}`;
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

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
    msg += `\n🕒 Time:\n${time}\n`;
    msg += `\n📅 Date:\n${date}\n`;
    return msg;
  };

  /* زر الإرسال الأول: يجلب الرقم أولاً ثم يفتح النافذة */
  const handleSendOrder = async () => {
    if (
      cartItems.length === 0 ||
      !name.trim() ||
      !phone.trim() ||
      !address.trim()
    ) {
      return;
    }

    setIsGenerating(true);
    setErrorMessage('');

    const generatedNumber = await generateDailyOrderNumber();

    if (!generatedNumber) {
      setIsGenerating(false);
      setErrorMessage(
        isRTL
          ? 'تعذر الحصول على رقم الطلب. يرجى المحاولة مرة أخرى.'
          : 'Impossible de générer le numéro de commande. Veuillez réessayer.'
      );
      return;
    }

    setOrderNumber(generatedNumber);
    setIsGenerating(false);
    setShowConfirm(true);
  };

  /* التوجيه النهائي للواتساب */
  const handleConfirmOrder = () => {
    if (!orderNumber) return;

    const message = buildWhatsAppMessage(orderNumber);
    const whatsappUrl = `https://wa.me/21698157474?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, '_blank');
    setShowConfirm(false);
  };

  const isValid =
    cartItems.length > 0 &&
    name.trim() !== '' &&
    phone.trim() !== '' &&
    address.trim() !== '';

  return (
    <div className="py-20 bg-[#FAF9F6] dark:bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[#F6B21A] font-black uppercase tracking-wider text-sm mb-2">
            {t.orderOnline}
          </p>
          <h1 className="text-4xl font-black text-[#2C2C2C] dark:text-white">
            {t.yourOrder}
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <ShoppingBag
              size={64}
              className="text-gray-200 dark:text-gray-700"
            />
            <p className="text-gray-400 dark:text-gray-500 font-medium text-lg">
              {t.cartEmpty}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cart Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-black text-[#2C2C2C] dark:text-white">
                  {t.yourOrder}
                </h2>
                <button
                  onClick={clearCart}
                  className="text-sm text-red-400 hover:text-red-500 font-semibold"
                >
                  Clear
                </button>
              </div>
              {cartItems.map(({ item, quantity }) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-[#2C2C2C] shadow-sm"
                >
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.nameFr}
                      className="w-20 h-20 rounded-xl object-contain p-1 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-[#333] flex-shrink-0">
                      <ImageIcon className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#2C2C2C] dark:text-white text-sm leading-snug">
                      {item.nameFr}
                    </p>
                    <p className="text-[#F6B21A] font-black mt-1">
                      {item.price} {t.dt}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-full bg-[#FAF9F6] dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 flex items-center justify-center"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-black text-sm w-5 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-full bg-[#FAF9F6] dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 flex items-center justify-center"
                      >
                        <Plus size={12} />
                      </button>
                      <span className="ml-auto font-black text-[#2C2C2C] dark:text-white">
                        {(item.price * quantity).toFixed(1)} {t.dt}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between p-6 rounded-2xl bg-white dark:bg-[#2C2C2C] shadow-sm mt-4">
                <span className="font-black text-lg text-[#2C2C2C] dark:text-white">
                  {t.total}
                </span>
                <span className="text-3xl font-black text-[#F6B21A]">
                  {totalPrice.toFixed(1)} {t.dt}
                </span>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#2C2C2C] dark:text-white">
                {t.deliveryAddress}
              </h2>
              <div className="p-6 rounded-2xl bg-white dark:bg-[#2C2C2C] shadow-sm space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-[#2C2C2C] dark:text-white mb-2">
                    <User size={16} className="text-[#F6B21A]" /> {t.yourName}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-[#2C2C2C] dark:text-white focus:border-[#F6B21A] focus:outline-none transition-colors"
                    placeholder={isRTL ? 'اسمك الكامل' : 'Votre nom complet'}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-[#2C2C2C] dark:text-white mb-2">
                    <Phone size={16} className="text-[#F6B21A]" /> {t.yourPhone}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-[#2C2C2C] dark:text-white focus:border-[#F6B21A] focus:outline-none transition-colors"
                    placeholder="+216 ..."
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-[#2C2C2C] dark:text-white mb-2">
                    <MapPin size={16} className="text-[#F6B21A]" />{' '}
                    {t.yourAddress}
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-[#2C2C2C] dark:text-white focus:border-[#F6B21A] focus:outline-none transition-colors resize-none"
                    placeholder={
                      isRTL
                        ? 'العنوان الكامل في مدنين'
                        : 'Votre adresse complète à Médenine'
                    }
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-[#2C2C2C] dark:text-white mb-2">
                    <FileText size={16} className="text-[#F6B21A]" />{' '}
                    {isRTL ? 'ملاحظات' : 'Notes'}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-[#2C2C2C] dark:text-white focus:border-[#F6B21A] focus:outline-none transition-colors resize-none"
                    placeholder={
                      isRTL ? 'أي ملاحظات خاصة...' : 'Notes spéciales...'
                    }
                  />
                </div>
                {errorMessage && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40">
                    <p className="text-sm text-red-600 dark:text-red-400 font-semibold text-center">
                      {errorMessage}
                    </p>
                  </div>
                )}
                <button
                  onClick={handleSendOrder}
                  disabled={!isValid || isGenerating}
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-[#25D366] hover:bg-[#1ebe57] text-white font-black transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>
                        {isRTL ? 'جاري تجهيز الطلب...' : 'Génération...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Send size={18} /> {t.sendOrder}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-3">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <CheckCircle size={22} className="text-[#25D366]" />
                  <h3 className="text-lg font-black text-[#2C2C2C] dark:text-white">
                    {isRTL ? 'تأكيد الطلب' : 'Confirmer la Commande'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={18} className="text-[#2C2C2C] dark:text-white" />
                </button>
              </div>
              <div className="p-4 space-y-3 overflow-y-auto flex-1">
                <div className="text-center p-3 rounded-2xl bg-[#F6B21A]/10 border border-[#F6B21A]/30">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isRTL ? 'رقم الطلب الخاص بك' : 'Votre Numéro de commande'}
                  </p>
                  <p className="text-2xl font-black text-[#F6B21A] mt-1">
                    {orderNumber}
                  </p>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex gap-2">
                    <span className="font-bold text-gray-500 dark:text-gray-400 min-w-[70px]">
                      {isRTL ? 'الاسم' : 'Nom'}:
                    </span>
                    <span className="font-semibold text-[#2C2C2C] dark:text-white">
                      {name}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-gray-500 dark:text-gray-400 min-w-[70px]">
                      {isRTL ? 'الهاتف' : 'Téléphone'}:
                    </span>
                    <span
                      className="font-semibold text-[#2C2C2C] dark:text-white"
                      dir="ltr"
                    >
                      {phone}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-gray-500 dark:text-gray-400 min-w-[70px]">
                      {isRTL ? 'العنوان' : 'Adresse'}:
                    </span>
                    <span className="font-semibold text-[#2C2C2C] dark:text-white">
                      {address}
                    </span>
                  </div>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-2.5">
                  <p className="font-black text-[#2C2C2C] dark:text-white text-xs mb-1.5">
                    {isRTL ? 'الطلبات' : 'Articles'}:
                  </p>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {cartItems.map(({ item, quantity }) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-xs"
                      >
                        <span className="text-[#2C2C2C] dark:text-white">
                          • {item.nameFr} ×{quantity}
                        </span>
                        <span className="font-bold text-[#2C2C2C] dark:text-white">
                          {(item.price * quantity).toFixed(1)} {t.dt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-2.5">
                  <span className="font-black text-sm text-[#2C2C2C] dark:text-white">
                    {t.total}
                  </span>
                  <span className="text-xl font-black text-[#F6B21A]">
                    {totalPrice.toFixed(1)} {t.dt}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-[#1a1a1a] border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
                <button
                  onClick={handleConfirmOrder}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe57] text-white font-black text-sm transition-all hover:scale-[1.01]"
                >
                  <Send size={16} />{' '}
                  {isRTL
                    ? 'تأكيد وإرسال عبر الواتساب'
                    : 'Confirmer & Envoyer via WhatsApp'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
