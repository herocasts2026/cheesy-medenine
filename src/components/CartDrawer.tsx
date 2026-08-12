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
  CheckCircle2,
} from 'lucide-react';

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
    clearCart,
  } = useCart();

  const { t, isRTL } = useLang();

  // =========================================================
  // خطوات الطلب
  // 1 = السلة
  // 2 = معلومات العميل
  // 3 = تأكيد الطلب ورقم الطلب
  // =========================================================
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // =========================================================
  // معلومات العميل
  // =========================================================
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // =========================================================
  // الطلب الذي تم إنشاؤه فعلياً في Supabase
  // =========================================================
  const [savedOrder, setSavedOrder] =
    useState<SavedOrderSnapshot | null>(null);

  // =========================================================
  // حالة إنشاء الطلب
  // =========================================================
  const [isSending, setIsSending] = useState(false);

  // =========================================================
  // رقم WhatsApp الخاص بالمطعم
  // تونس +216
  // =========================================================
  const RESTAURANT_WHATSAPP_NUMBER = '21698157474';

  // =========================================================
  // إغلاق السلة
  // لا نمسح محتويات السلة عند الإغلاق
  // =========================================================
  const handleClose = () => {
    setIsCartOpen(false);

    setTimeout(() => {
      if (step === 3) {
        setStep(1);
        setSavedOrder(null);
      }
    }, 300);
  };

  // =========================================================
  // الرجوع خطوة إلى الخلف
  // =========================================================
  const handleGoBack = () => {
    if (step === 3) {
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(1);
    }
  };

  // =========================================================
  // الانتقال من السلة إلى معلومات العميل
  // =========================================================
  const handleGoToCustomerDetails = () => {
    if (cartItems.length === 0) {
      return;
    }

    setStep(2);
  };

  // =========================================================
  // إنشاء الطلب في Supabase
  //
  // الدالة الموجودة في Supabase:
  //
  // create_order_and_get_number(
  //   p_name,
  //   p_phone,
  //   p_address,
  //   p_total,
  //   p_type,
  //   p_details
  // )
  //
  // وتُرجع مثلاً:
  // A01
  // A02
  // B01
  // ...
  // =========================================================
  const handleProceedToConfirmation = async () => {
    if (cartItems.length === 0 || isSending) {
      return;
    }

    // -------------------------------------------------------
    // إذا كان الطلب قد أُنشئ بالفعل، لا ننشئ طلباً ثانياً
    // -------------------------------------------------------
    if (savedOrder) {
      setStep(3);
      return;
    }

    setIsSending(true);

    try {
      // -----------------------------------------------------
      // تجهيز تفاصيل المنتجات لإرسالها إلى jsonb
      // -----------------------------------------------------
      const orderDetails = cartItems.map((cartItem: CartItem) => ({
        name: cartItem.item.nameFr,
        quantity: cartItem.quantity,
        unitPrice: cartItem.unitPrice,

        supplements: cartItem.selectedSupplements || [],

        sauces: cartItem.selectedSauces || [],

        removed: cartItem.removedIngredients || [],

        comment: cartItem.comment?.trim() || '',
      }));

      // -----------------------------------------------------
      // استدعاء دالة Supabase RPC
      //
      // مهم:
      // p_details يتم إرساله كـ JavaScript object/array
      // و Supabase يحوله إلى jsonb.
      // -----------------------------------------------------
      const { data: orderNum, error } = await supabase.rpc(
        'create_order_and_get_number',
        {
          p_name: customerName.trim(),
          p_phone: customerPhone.trim(),
          p_address: customerAddress.trim(),
          p_total: totalPrice,
          p_type: isTakeAway ? 'À EMPORTER' : 'Sur place',
          p_details: orderDetails,
        }
      );

      // -----------------------------------------------------
      // التحقق من نتيجة Supabase
      // -----------------------------------------------------
      if (error) {
        console.error('Supabase RPC error:', error);
        throw error;
      }

      if (!orderNum) {
        throw new Error('لم يتم استلام رقم الطلب من Supabase');
      }

      // -----------------------------------------------------
      // حفظ نسخة ثابتة من الطلب
      //
      // هذا يمنع إنشاء رقم طلب جديد إذا عاد المستخدم للخلف
      // ثم تقدم مرة أخرى.
      // -----------------------------------------------------
      const newSavedOrder: SavedOrderSnapshot = {
        orderNum: String(orderNum),

        items: [...cartItems],

        total: totalPrice,

        customerName: customerName.trim(),

        customerPhone: customerPhone.trim(),

        customerAddress: customerAddress.trim(),

        isTakeAway,
      };

      setSavedOrder(newSavedOrder);

      // -----------------------------------------------------
      // الانتقال إلى بطاقة التأكيد
      // -----------------------------------------------------
      setStep(3);
    } catch (error) {
      console.error('Error creating order:', error);

      alert(
        'تعذر إنشاء الطلب حالياً. يرجى التأكد من اتصال الإنترنت والمحاولة مرة أخرى.'
      );
    } finally {
      setIsSending(false);
    }
  };

  // =========================================================
  // إنشاء رسالة WhatsApp
  // =========================================================
  const buildWhatsAppMessage = (
    order: SavedOrderSnapshot
  ): string => {
    let message = '';

    // -------------------------------------------------------
    // العنوان
    // -------------------------------------------------------
    message += `🛒 *Nouvelle Commande - Cheesy Medenine*\n`;

    // -------------------------------------------------------
    // رقم الطلب
    // -------------------------------------------------------
    message += `🔢 *Commande N°:* #${order.orderNum}\n`;

    message += `-------------------------------------------\n`;

    // -------------------------------------------------------
    // نوع الطلب
    // -------------------------------------------------------
    message += `📍 *Type de commande:* ${
      order.isTakeAway
        ? '🛍️ *À EMPORTER (للأخذ)*'
        : '🍽️ *Sur place (في المطعم)*'
    }\n\n`;

    // -------------------------------------------------------
    // معلومات العميل
    // -------------------------------------------------------
    if (
      order.customerName ||
      order.customerPhone ||
      order.customerAddress
    ) {
      message += `👤 *Informations Client (بيانات العميل):*\n`;

      if (order.customerName) {
        message += `• *Nom:* ${order.customerName}\n`;
      }

      if (order.customerPhone) {
        message += `• *Tél:* ${order.customerPhone}\n`;
      }

      if (order.customerAddress) {
        message += `• *Adresse:* ${order.customerAddress}\n`;
      }

      message += `-------------------------------------------\n`;
    }

    // -------------------------------------------------------
    // تفاصيل الطلب
    // -------------------------------------------------------
    message += `📋 *Détails de la commande:*\n`;

    order.items.forEach(
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

        // ---------------------------------------------------
        // الإضافات
        // ---------------------------------------------------
        if (
          selectedSupplements &&
          selectedSupplements.length > 0
        ) {
          message += `   ➕ *Suppléments:* ${selectedSupplements
            .map(
              (supplement) =>
                `${supplement.name} (+${supplement.price}DT)`
            )
            .join(', ')}\n`;
        }

        // ---------------------------------------------------
        // الصلصات
        // ---------------------------------------------------
        if (
          selectedSauces &&
          selectedSauces.length > 0
        ) {
          message += `   🍯 *Sauces:* ${selectedSauces.join(
            ', '
          )}\n`;
        }

        // ---------------------------------------------------
        // المكونات المحذوفة
        // ---------------------------------------------------
        if (
          removedIngredients &&
          removedIngredients.length > 0
        ) {
          message += `   ❌ *Sans:* ${removedIngredients.join(
            ', '
          )}\n`;
        }

        // ---------------------------------------------------
        // الملاحظة
        // ---------------------------------------------------
        if (comment && comment.trim() !== '') {
          message += `   📝 *Note:* ${comment.trim()}\n`;
        }
      }
    );

    // -------------------------------------------------------
    // المجموع النهائي
    // -------------------------------------------------------
    message += `\n-------------------------------------------\n`;

    message += `💰 *TOTAL GENERAL:* *${order.total.toFixed(
      1
    )} DT*\n`;

    message += `-------------------------------------------`;

    return message;
  };

  // =========================================================
  // إرسال الطلب النهائي إلى WhatsApp
  // =========================================================
  const handleFinalSendToWhatsApp = () => {
    if (!savedOrder) {
      return;
    }

    // -------------------------------------------------------
    // إنشاء الرسالة من النسخة المحفوظة
    // -------------------------------------------------------
    const message = buildWhatsAppMessage(savedOrder);

    // -------------------------------------------------------
    // إنشاء رابط WhatsApp
    // -------------------------------------------------------
    const whatsappUrl =
      `https://api.whatsapp.com/send?phone=` +
      `${RESTAURANT_WHATSAPP_NUMBER}` +
      `&text=${encodeURIComponent(message)}`;

    // -------------------------------------------------------
    // فتح WhatsApp
    // -------------------------------------------------------
    window.open(whatsappUrl, '_blank');

    // -------------------------------------------------------
    // بعد الإرسال:
    // تنظيف السلة وإعادة الواجهة للبداية
    // -------------------------------------------------------
    if (typeof clearCart === 'function') {
      clearCart();
    }

    setSavedOrder(null);

    setStep(1);

    setIsCartOpen(false);
  };

  // =========================================================
  // تغيير الاسم
  // أي تغيير يعني أن النسخة السابقة لم تعد صالحة
  // =========================================================
  const handleNameChange = (
    value: string
  ) => {
    setSavedOrder(null);
    setCustomerName(value);
  };

  // =========================================================
  // تغيير الهاتف
  // =========================================================
  const handlePhoneChange = (
    value: string
  ) => {
    setSavedOrder(null);
    setCustomerPhone(value);
  };

  // =========================================================
  // تغيير العنوان
  // =========================================================
  const handleAddressChange = (
    value: string
  ) => {
    setSavedOrder(null);
    setCustomerAddress(value);
  };

  // =========================================================
  // تغيير حالة À EMPORTER
  // =========================================================
  const handleToggleTakeAway = () => {
    setSavedOrder(null);
    setIsTakeAway(!isTakeAway);
  };

  // =========================================================
  // تغيير كمية منتج
  // =========================================================
  const handleQuantityChange = (
    cartItemId: string,
    amount: number
  ) => {
    setSavedOrder(null);
    updateQuantity(cartItemId, amount);
  };

  // =========================================================
  // حذف منتج
  // =========================================================
  const handleRemoveItem = (
    cartItemId: string
  ) => {
    setSavedOrder(null);
    removeFromCart(cartItemId);
  };

  return (
    <>
      {/* =====================================================
          BACKDROP
      ====================================================== */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen
            ? 'opacity-100 visible'
            : 'opacity-0 invisible'
        }`}
        onClick={handleClose}
      />

      {/* =====================================================
          DRAWER
      ====================================================== */}
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
        {/* ===================================================
            HEADER
        ==================================================== */}
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
                  className={
                    isRTL ? 'rotate-180' : ''
                  }
                />
              </button>
            )}

            <ShoppingBag
              size={22}
              className="text-[#F6B21A]"
            />

            <h2 className="text-xl font-black text-[#2C2C2C] dark:text-white">
              {step === 1 &&
                t.yourOrder}

              {step === 2 &&
                'Informations (البيانات)'}

              {step === 3 &&
                'Confirmation (التأكيد)'}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Fermer"
          >
            <X
              size={20}
              className="text-[#2C2C2C] dark:text-white"
            />
          </button>
        </div>

        {/* ===================================================
            CONTENT
        ==================================================== */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* =================================================
              STEP 1 - CART
          ================================================== */}
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
                      {/* -----------------------------------
                          IMAGE
                      ------------------------------------ */}
                      {item.images &&
                      item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.nameFr}
                          className="w-16 h-16 rounded-xl object-contain p-1 flex-shrink-0"
                          onError={(event) => {
                            event.currentTarget.onerror =
                              null;

                            event.currentTarget.src =
                              '/images/fallback-food.png';
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-[#333] flex-shrink-0">
                          <ImageIcon className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                        </div>
                      )}

                      {/* -----------------------------------
                          ITEM DETAILS
                      ------------------------------------ */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#2C2C2C] dark:text-white text-sm leading-snug">
                          {item.nameFr}
                        </p>

                        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
                          {/* Supplements */}
                          {selectedSupplements &&
                            selectedSupplements.length >
                              0 && (
                              <p>
                                <span className="font-semibold text-[#F6B21A]">
                                  +{' '}
                                </span>

                                {selectedSupplements
                                  .map(
                                    (supplement) =>
                                      supplement.name
                                  )
                                  .join(', ')}
                              </p>
                            )}

                          {/* Sauces */}
                          {selectedSauces &&
                            selectedSauces.length >
                              0 && (
                              <p>
                                <span className="font-semibold text-blue-500">
                                  Sauces:{' '}
                                </span>

                                {selectedSauces.join(
                                  ', '
                                )}
                              </p>
                            )}

                          {/* Removed ingredients */}
                          {removedIngredients &&
                            removedIngredients.length >
                              0 && (
                              <p>
                                <span className="font-semibold text-red-500">
                                  Sans:{' '}
                                </span>

                                {removedIngredients.join(
                                  ', '
                                )}
                              </p>
                            )}

                          {/* Comment */}
                          {comment &&
                            comment.trim() !== '' && (
                              <p className="italic text-gray-400">
                                "{comment}"
                              </p>
                            )}
                        </div>

                        {/* Price */}
                        <p className="text-[#F6B21A] font-black mt-1">
                          {(
                            unitPrice * quantity
                          ).toFixed(1)}{' '}
                          {t.dt}
                        </p>

                        {/* ---------------------------------
                            QUANTITY CONTROLS
                        ---------------------------------- */}
                        <div className="flex items-center gap-2 mt-2">
                          {/* Minus */}
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                cartItemId,
                                -1
                              )
                            }
                            className="w-7 h-7 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-[#F6B21A]"
                            aria-label="Diminuer"
                          >
                            <Minus size={12} />
                          </button>

                          {/* Quantity */}
                          <span className="font-black text-sm w-5 text-center">
                            {quantity}
                          </span>

                          {/* Plus */}
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                cartItemId,
                                1
                              )
                            }
                            className="w-7 h-7 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-[#F6B21A]"
                            aria-label="Augmenter"
                          >
                            <Plus size={12} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveItem(
                                cartItemId
                              )
                            }
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

          {/* =================================================
              STEP 2 - CUSTOMER DETAILS
          ================================================== */}
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
                    onChange={(event) =>
                      handleNameChange(
                        event.target.value
                      )
                    }
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#2C2C2C] text-gray-800 dark:text-white focus:outline-none focus:border-[#F6B21A]"
                  />
                </div>
              </div>

              {/* PHONE */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-500">
                  Téléphone (رقم الهاتف):
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-3 top-3 text-gray-400"
                  />

                  <input
                    type="tel"
                    placeholder="Ex: 20 000 000"
                    value={customerPhone}
                    onChange={(event) =>
                      handlePhoneChange(
                        event.target.value
                      )
                    }
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
                    onChange={(event) =>
                      handleAddressChange(
                        event.target.value
                      )
                    }
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#2C2C2C] text-gray-800 dark:text-white focus:outline-none focus:border-[#F6B21A]"
                  />
                </div>
              </div>

              {/* NOTE */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#2C2C2C] text-xs text-gray-500 dark:text-gray-400">
                Le numéro de commande sera généré
                automatiquement après confirmation.
                <br />
                سيتم إنشاء رقم الطلب تلقائيًا بعد التأكيد.
              </div>
            </div>
          )}

          {/* =================================================
              STEP 3 - CONFIRMATION
          ================================================== */}
          {step === 3 && savedOrder && (
            <div className="space-y-4 pt-2">
              {/* ORDER NUMBER CARD */}
              <div className="p-5 rounded-3xl bg-amber-500/10 border-2 border-[#F6B21A] text-center relative overflow-hidden">
                <div className="inline-flex p-2 bg-[#F6B21A] text-white rounded-full mb-2">
                  <CheckCircle2 size={24} />
                </div>

                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Commande Prête
                </p>

                <h3 className="text-3xl font-black text-[#2C2C2C] dark:text-white my-1">
                  #{savedOrder.orderNum}
                </h3>

                <p className="text-xs text-[#F6B21A] font-bold">
                  Numéro de commande (رقم الطلب)
                </p>
              </div>

              {/* ORDER SUMMARY */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#2C2C2C] space-y-3 text-xs">
                {/* Type */}
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-gray-500">
                    Type:
                  </span>

                  <span className="font-bold">
                    {savedOrder.isTakeAway
                      ? '🛍️ À Emporter'
                      : '🍽️ Sur place'}
                  </span>
                </div>

                {/* Name */}
                {savedOrder.customerName && (
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2 gap-3">
                    <span className="text-gray-500">
                      Nom:
                    </span>

                    <span className="font-bold text-right break-words">
                      {savedOrder.customerName}
                    </span>
                  </div>
                )}

                {/* Phone */}
                {savedOrder.customerPhone && (
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2 gap-3">
                    <span className="text-gray-500">
                      Téléphone:
                    </span>

                    <span className="font-bold text-right">
                      {savedOrder.customerPhone}
                    </span>
                  </div>
                )}

                {/* Address */}
                {savedOrder.customerAddress && (
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2 gap-3">
                    <span className="text-gray-500">
                      Adresse:
                    </span>

                    <span className="font-bold text-right break-words">
                      {savedOrder.customerAddress}
                    </span>
                  </div>
                )}

                {/* Items */}
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-gray-500">
                    Articles (المنتجات):
                  </span>

                  <span className="font-bold">
                    {savedOrder.items.length}
                  </span>
                </div>

                {/* Total */}
                <div className="flex justify-between text-sm pt-1">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    Total:
                  </span>

                  <span className="font-black text-[#F6B21A] text-base">
                    {savedOrder.total.toFixed(1)} DT
                  </span>
                </div>
              </div>

              {/* IMPORTANT MESSAGE */}
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-xs text-green-700 dark:text-green-400 text-center font-semibold">
                Votre commande est enregistrée.
                <br />
                طلبك محفوظ، اضغط على زر WhatsApp
                لإرساله إلى المطعم.
              </div>
            </div>
          )}
        </div>

        {/* ===================================================
            FOOTER
        ==================================================== */}
        {(cartItems.length > 0 ||
          (step === 3 && savedOrder)) && (
          <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-800 space-y-3">
            {/* =================================================
                STEP 1 FOOTER
            ================================================== */}
            {step === 1 && (
              <>
                {/* TAKE AWAY */}
                <button
                  type="button"
                  onClick={handleToggleTakeAway}
                  className={`w-full py-2.5 px-4 rounded-xl border flex items-center justify-between transition-all ${
                    isTakeAway
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                      : 'bg-gray-50 dark:bg-[#2C2C2C] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <ShoppingBag size={18} />

                    <span>
                      À emporter (للأخذ)
                    </span>
                  </div>

                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-black ${
                      isTakeAway
                        ? 'bg-white text-emerald-600'
                        : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    {isTakeAway
                      ? '✅ ACTIVÉ'
                      : 'DESACTIVÉ'}
                  </span>
                </button>

                {/* TOTAL */}
                <div className="flex justify-between items-center py-1">
                  <span className="font-semibold text-gray-600 dark:text-gray-400">
                    {t.total}
                  </span>

                  <span className="text-2xl font-black text-[#F6B21A]">
                    {totalPrice.toFixed(1)}{' '}
                    {t.dt}
                  </span>
                </div>

                {/* NEXT */}
                <button
                  type="button"
                  onClick={
                    handleGoToCustomerDetails
                  }
                  disabled={cartItems.length === 0}
                  className="w-full py-3.5 rounded-2xl bg-[#F6B21A] hover:bg-[#e0a116] text-white font-black text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F6B21A]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>
                    Suivant (التالي)
                  </span>
                </button>
              </>
            )}

            {/* =================================================
                STEP 2 FOOTER
            ================================================== */}
            {step === 2 && (
              <button
                type="button"
                onClick={
                  handleProceedToConfirmation
                }
                disabled={isSending}
                className="w-full py-3.5 rounded-2xl bg-[#F6B21A] hover:bg-[#e0a116] text-white font-black text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F6B21A]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    <span>
                      Génération du numéro...
                    </span>
                  </>
                ) : (
                  <span>
                    Confirmer & Voir le reçu
                    (تأكيد الطلب)
                  </span>
                )}
              </button>
            )}

            {/* =================================================
                STEP 3 FOOTER
            ================================================== */}
            {step === 3 && (
              <button
                type="button"
                onClick={
                  handleFinalSendToWhatsApp
                }
                disabled={!savedOrder}
                className="w-full py-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#25D366]/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />

                <span>
                  Envoyer sur WhatsApp
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
