```tsx
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

  // --------------------------------------------------
  // Checkout steps
  // 1 = Cart
  // 2 = Customer information
  // 3 = Confirmation
  // --------------------------------------------------
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Customer information
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Generated order number from Supabase
  const [generatedOrderNum, setGeneratedOrderNum] = useState<number | null>(null);

  // Loading state
  const [isSending, setIsSending] = useState(false);

  // Prevent repeated WhatsApp clicks
  const [isWhatsAppOpened, setIsWhatsAppOpened] = useState(false);

  // Restaurant WhatsApp number
  const RESTAURANT_WHATSAPP_NUMBER = '21698157474';

  // --------------------------------------------------
  // Reset checkout state
  // --------------------------------------------------
  const resetCheckout = () => {
    setStep(1);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setGeneratedOrderNum(null);
    setIsSending(false);
    setIsWhatsAppOpened(false);
  };

  // --------------------------------------------------
  // Close drawer
  // --------------------------------------------------
  const handleClose = () => {
    setIsCartOpen(false);

    setTimeout(() => {
      resetCheckout();
    }, 300);
  };

  // --------------------------------------------------
  // Go back
  //
  // IMPORTANT:
  // Once an order number has been created, we do NOT
  // allow the customer to go backwards.
  //
  // This prevents creating multiple database orders
  // for the same checkout.
  // --------------------------------------------------
  const handleGoBack = () => {
    if (generatedOrderNum !== null || step === 3) {
      return;
    }

    if (step === 2) {
      setStep(1);
    }
  };

  // --------------------------------------------------
  // Validate phone number
  // --------------------------------------------------
  const isValidPhone = (phone: string) => {
    const normalizedPhone = phone.replace(/\s+/g, '');

    // Tunisia phone number: 8 digits, usually starts
    // with 2, 4, 5, 7 or 9.
    return /^[24579]\d{7}$/.test(normalizedPhone);
  };

  // --------------------------------------------------
  // Create order in Supabase
  // --------------------------------------------------
  const handleProceedToConfirmation = async () => {
    if (cartItems.length === 0) {
      return;
    }

    if (isSending) {
      return;
    }

    // Safety check: don't create another order
    if (generatedOrderNum !== null) {
      setStep(3);
      return;
    }

    const name = customerName.trim();
    const phone = customerPhone.trim();
    const address = customerAddress.trim();

    // --------------------------------------------------
    // Basic validation
    // --------------------------------------------------

    if (!name) {
      alert('يرجى إدخال الاسم الكامل.');
      return;
    }

    if (!phone) {
      alert('يرجى إدخال رقم الهاتف.');
      return;
    }

    if (!isValidPhone(phone)) {
      alert('يرجى إدخال رقم هاتف تونسي صحيح من 8 أرقام.');
      return;
    }

    setIsSending(true);

    try {
      // --------------------------------------------------
      // Prepare order details
      // --------------------------------------------------

      const orderDetails = cartItems.map(
        ({
          item,
          quantity,
          unitPrice,
          selectedSupplements,
          selectedSauces,
          removedIngredients,
          comment,
        }) => ({
          name: item.nameFr,
          quantity,
          unitPrice,
          supplements: selectedSupplements || [],
          sauces: selectedSauces || [],
          removed: removedIngredients || [],
          comment: comment?.trim() || '',
        })
      );

      // --------------------------------------------------
      // Create order and get order number
      // --------------------------------------------------

      const { data: orderNum, error } = await supabase.rpc(
        'create_order_and_get_number',
        {
          p_name: name,
          p_phone: phone,
          p_address: address,
          p_total: Number(totalPrice.toFixed(1)),
          p_type: isTakeAway ? 'À EMPORTER' : 'Sur place',
          p_details: JSON.stringify(orderDetails),
        }
      );

      if (error) {
        console.error('Supabase order creation error:', error);
        throw new Error('SUPABASE_ERROR');
      }

      // Don't use !orderNum because 0 is technically falsy.
      if (orderNum === null || orderNum === undefined) {
        console.error('Supabase returned an empty order number.');
        throw new Error('EMPTY_ORDER_NUMBER');
      }

      // --------------------------------------------------
      // IMPORTANT:
      // Store the number permanently for this checkout.
      // --------------------------------------------------

      setGeneratedOrderNum(Number(orderNum));

      // Move to confirmation
      setStep(3);
    } catch (error) {
      console.error('Error creating order:', error);

      alert(
        'تعذر إنشاء الطلب أو الحصول على رقم الطلب. ' +
        'يرجى التأكد من اتصال الإنترنت والمحاولة مرة أخرى.'
      );
    } finally {
      setIsSending(false);
    }
  };

  // --------------------------------------------------
  // Build WhatsApp message
  // --------------------------------------------------
  const buildWhatsAppMessage = () => {
    if (generatedOrderNum === null) {
      return '';
    }

    let message = '';

    message += `🛒 *Nouvelle Commande - Cheesy Medenine*\n`;
    message += `🔢 *Commande N°:* #${generatedOrderNum}\n`;
    message += `-------------------------------------------\n`;

    message += `📍 *Type de commande:* ${
      isTakeAway
        ? '🛍️ *À EMPORTER (للأخذ)*'
        : '🍽️ *Sur place (في المطعم)*'
    }\n\n`;

    // --------------------------------------------------
    // Customer information
    // --------------------------------------------------

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

    // --------------------------------------------------
    // Order details
    // --------------------------------------------------

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
        },
        index
      ) => {
        message += `\n*${index + 1}. ${item.nameFr}* (x${quantity}) - ${(
          unitPrice * quantity
        ).toFixed(1)} DT\n`;

        if (
          selectedSupplements &&
          selectedSupplements.length > 0
        ) {
          message += `   ➕ *Suppléments:* ${selectedSupplements
            .map((s) => `${s.name} (+${s.price}DT)`)
            .join(', ')}\n`;
        }

        if (
          selectedSauces &&
          selectedSauces.length > 0
        ) {
          message += `   🍯 *Sauces:* ${selectedSauces.join(', ')}\n`;
        }

        if (
          removedIngredients &&
          removedIngredients.length > 0
        ) {
          message += `   ❌ *Sans:* ${removedIngredients.join(', ')}\n`;
        }

        if (comment && comment.trim() !== '') {
          message += `   📝 *Note:* ${comment.trim()}\n`;
        }
      }
    );

    message += `\n-------------------------------------------\n`;
    message += `💰 *TOTAL GENERAL:* *${totalPrice.toFixed(1)} DT*\n`;
    message += `-------------------------------------------`;

    return message;
  };

  // --------------------------------------------------
  // Send order to WhatsApp
  // --------------------------------------------------
  const handleFinalSendToWhatsApp = () => {
    if (
      generatedOrderNum === null ||
      isWhatsAppOpened
    ) {
      return;
    }

    const message = buildWhatsAppMessage();

    if (!message) {
      alert('رقم الطلب غير متوفر.');
      return;
    }

    const whatsappUrl =
      `https://api.whatsapp.com/send` +
      `?phone=${RESTAURANT_WHATSAPP_NUMBER}` +
      `&text=${encodeURIComponent(message)}`;

    // Prevent accidental double click
    setIsWhatsAppOpened(true);

    window.open(
      whatsappUrl,
      '_blank',
      'noopener,noreferrer'
    );
  };

  // --------------------------------------------------
  // Cart mutation helpers
  //
  // These are only allowed before an order number exists.
  // --------------------------------------------------

  const handleDecrease = (cartItemId: string) => {
    if (generatedOrderNum !== null) {
      return;
    }

    updateQuantity(cartItemId, -1);
  };

  const handleIncrease = (cartItemId: string) => {
    if (generatedOrderNum !== null) {
      return;
    }

    updateQuantity(cartItemId, 1);
  };

  const handleRemove = (cartItemId: string) => {
    if (generatedOrderNum !== null) {
      return;
    }

    removeFromCart(cartItemId);
  };

  const handleToggleTakeAway = () => {
    if (generatedOrderNum !== null) {
      return;
    }

    setIsTakeAway(!isTakeAway);
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen
            ? 'opacity-100 visible'
            : 'opacity-0 invisible'
        }`}
        onClick={handleClose}
      />

      {/* Drawer */}
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {step > 1 && generatedOrderNum === null && (
              <button
                onClick={handleGoBack}
                type="button"
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Retour"
              >
                <ArrowLeft
                  size={20}
                  className={isRTL ? 'rotate-180' : ''}
                />
              </button>
            )}

            <ShoppingBag
              size={22}
              className="text-[#F6B21A]"
            />

            <h2 className="text-xl font-black text-[#2C2C2C] dark:text-white">
              {step === 1 && t.yourOrder}
              {step === 2 && 'Informations (البيانات)'}
              {step === 3 && 'Confirmation (التأكيد)'}
            </h2>
          </div>

          <button
            onClick={handleClose}
            type="button"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Fermer"
          >
            <X
              size={20}
              className="text-[#2C2C2C] dark:text-white"
            />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

          {/* ==========================================
              STEP 1 - CART
          ========================================== */}

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
                  }) => (
                    <div
                      key={cartItemId}
                      className="flex gap-4 p-4 rounded-2xl bg-[#FAF9F6] dark:bg-[#2C2C2C]"
                    >
                      {/* Image */}
                      {item.images &&
                      item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.nameFr}
                          className="w-16 h-16 rounded-xl object-contain p-1 flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              '/images/fallback-food.png';
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-[#333] flex-shrink-0">
                          <ImageIcon className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                        </div>
                      )}

                      {/* Item content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#2C2C2C] dark:text-white text-sm leading-snug">
                          {item.nameFr}
                        </p>

                        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">

                          {selectedSupplements &&
                            selectedSupplements.length > 0 && (
                              <p>
                                <span className="font-semibold text-[#F6B21A]">
                                  +
                                </span>{' '}
                                {selectedSupplements
                                  .map((s) => s.name)
                                  .join(', ')}
                              </p>
                            )}

                          {selectedSauces &&
                            selectedSauces.length > 0 && (
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

                          {comment &&
                            comment.trim() !== '' && (
                              <p className="italic text-gray-400">
                                "{comment}"
                              </p>
                            )}
                        </div>

                        <p className="text-[#F6B21A] font-black mt-1">
                          {(unitPrice * quantity).toFixed(1)}{' '}
                          {t.dt}
                        </p>

                        {/* Quantity */}
                        <div className="flex items-center gap-2 mt-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleDecrease(cartItemId)
                            }
                            className="w-7 h-7 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-[#F6B21A] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>

                          <span className="font-black text-sm w-5 text-center">
                            {quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleIncrease(cartItemId)
                            }
                            className="w-7 h-7 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-[#F6B21A] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleRemove(cartItemId)
                            }
                            className="ml-auto p-1.5 rounded-full hover:bg-red-50 text-red-400 transition-colors"
                            aria-label="Remove item"
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

          {/* ==========================================
              STEP 2 - CUSTOMER INFORMATION
          ========================================== */}

          {step === 2 && (
            <div className="space-y-4 pt-2">

              <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
                Entrez vos coordonnées (أدخل معلوماتك):
              </p>

              {/* Name */}
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
                    onChange={(e) =>
                      setCustomerName(e.target.value)
                    }
                    autoComplete="name"
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#2C2C2C] text-gray-800 dark:text-white focus:outline-none focus:border-[#F6B21A]"
                  />
                </div>
              </div>

              {/* Phone */}
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
                    inputMode="numeric"
                    placeholder="Ex: 20 000 000"
                    value={customerPhone}
                    onChange={(e) =>
                      setCustomerPhone(e.target.value)
                    }
                    autoComplete="tel"
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#2C2C2C] text-gray-800 dark:text-white focus:outline-none focus:border-[#F6B21A]"
                  />
                </div>
              </div>

              {/* Address */}
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
                    onChange={(e) =>
                      setCustomerAddress(e.target.value)
                    }
                    autoComplete="street-address"
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#2C2C2C] text-gray-800 dark:text-white focus:outline-none focus:border-[#F6B21A]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              STEP 3 - CONFIRMATION
          ========================================== */}

          {step === 3 && (
            <div className="space-y-4 pt-2">

              {/* Order number */}
              <div className="p-5 rounded-3xl bg-amber-500/10 border-2 border-[#F6B21A] text-center relative overflow-hidden">

                <div className="inline-flex p-2 bg-[#F6B21A] text-white rounded-full mb-2">
                  <CheckCircle2 size={24} />
                </div>

                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Commande Prête
                </p>

                <h3 className="text-3xl font-black text-[#2C2C2C] dark:text-white my-1">
                  #{generatedOrderNum}
                </h3>

                <p className="text-xs text-[#F6B21A] font-bold">
                  Numéro de commande (رقم الطلب)
                </p>
              </div>

              {/* Order information */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#2C2C2C] space-y-3 text-xs">

                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-gray-500">
                    Type:
                  </span>

                  <span className="font-bold">
                    {isTakeAway
                      ? '🛍️ À Emporter'
                      : '🍽️ Sur place'}
                  </span>
                </div>

                {customerName && (
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2 gap-4">
                    <span className="text-gray-500">
                      Nom:
                    </span>

                    <span className="font-bold text-right">
                      {customerName}
                    </span>
                  </div>
                )}

                {customerPhone && (
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2 gap-4">
                    <span className="text-gray-500">
                      Téléphone:
                    </span>

                    <span className="font-bold text-right">
                      {customerPhone}
                    </span>
                  </div>
                )}

                {customerAddress && (
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2 gap-4">
                    <span className="text-gray-500">
                      Adresse:
                    </span>

                    <span className="font-bold text-right">
                      {customerAddress}
                    </span>
                  </div>
                )}

                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-gray-500">
                    Articles (المنتجات):
                  </span>

                  <span className="font-bold">
                    {cartItems.length}
                  </span>
                </div>

                <div className="flex justify-between text-sm pt-1">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    Total:
                  </span>

                  <span className="font-black text-[#F6B21A] text-base">
                    {totalPrice.toFixed(1)} DT
                  </span>
                </div>
              </div>

              {/* Important notice */}
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs text-center">
                احتفظ برقم الطلب ثم أرسله إلى المطعم عبر WhatsApp.
              </div>
            </div>
          )}
        </div>

        {/* ==========================================
            FOOTER
        ========================================== */}

        {cartItems.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-800 space-y-3">

            {/* STEP 1 */}
            {step === 1 && (
              <>
                {/* Take away */}
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

                {/* Total */}
                <div className="flex justify-between items-center py-1">
                  <span className="font-semibold text-gray-600 dark:text-gray-400">
                    {t.total}
                  </span>

                  <span className="text-2xl font-black text-[#F6B21A]">
                    {totalPrice.toFixed(1)} {t.dt}
                  </span>
                </div>

                {/* Next */}
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 rounded-2xl bg-[#F6B21A] hover:bg-[#e0a116] text-white font-black text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F6B21A]/20"
                >
                  <span>
                    Suivant (التالي)
                  </span>
                </button>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <button
                type="button"
                onClick={handleProceedToConfirmation}
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
                      Création de la commande...
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

            {/* STEP 3 */}
            {step === 3 && (
              <button
                type="button"
                onClick={handleFinalSendToWhatsApp}
                disabled={
                  generatedOrderNum === null ||
                  isWhatsAppOpened
                }
                className="w-full py-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#25D366]/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Send size={18} />

                <span>
                  {isWhatsAppOpened
                    ? 'WhatsApp ouvert ✓'
                    : 'Envoyer sur WhatsApp'}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
```
