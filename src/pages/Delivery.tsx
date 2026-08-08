import { Truck, MapPin, Clock, Phone, CheckCircle, Bike } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';

export default function Delivery() {
  const { t, isRTL } = useLang();

  const steps = [
    { icon: CheckCircle, title: isRTL ? 'اختر طلبك' : 'Choisissez votre commande', sub: isRTL ? 'تصفح القائمة وأضف إلى السلة' : 'Parcourez le menu et ajoutez au panier' },
    { icon: Phone, title: isRTL ? 'أرسل عبر واتساب' : 'Envoyez via WhatsApp', sub: isRTL ? 'سنؤكد طلبك فوراً' : 'Nous confirmerons votre commande immédiatement' },
    { icon: Bike, title: isRTL ? 'نوصله إليك' : 'Nous livrons', sub: isRTL ? 'توصيل سريع إلى باب منزلك' : 'Livraison rapide à votre porte' },
    { icon: CheckCircle, title: isRTL ? 'ادفع عند الاستلام' : 'Payez à la livraison', sub: isRTL ? 'نقداً عند الباب' : 'En espèces à la porte' },
  ];

  return (
    <div className="pt-24 pb-20 bg-[#FAF9F6] dark:bg-[#1a1a1a] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#F6B21A]/10 mb-6">
            <Truck size={36} className="text-[#F6B21A]" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-[#2C2C2C] dark:text-white mb-4">{t.deliveryTitle}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            {isRTL ? 'توصيل سريع وموثوق إلى باب منزلك في مدنين' : 'Livraison rapide et fiable à votre porte dans tout Médenine'}
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-white dark:bg-[#2C2C2C] shadow-sm">
            <MapPin size={32} className="text-[#F6B21A] mb-4" />
            <h3 className="font-black text-[#2C2C2C] dark:text-white mb-2">{t.deliveryArea}</h3>
            <p className="text-gray-500 dark:text-gray-400">{t.medenine}</p>
          </div>
          <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-white dark:bg-[#2C2C2C] shadow-sm">
            <Clock size={32} className="text-[#F6B21A] mb-4" />
            <h3 className="font-black text-[#2C2C2C] dark:text-white mb-2">{t.deliveryTime}</h3>
            <p className="text-gray-500 dark:text-gray-400">30-45 min</p>
          </div>
          <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-[#F6B21A] text-[#2C2C2C] shadow-lg shadow-[#F6B21A]/30">
            <CheckCircle size={32} className="mb-4" />
            <h3 className="font-black mb-2">{t.deliveryFree}</h3>
            <p className="text-[#2C2C2C]/70">{isRTL ? 'لجميع الطلبات' : 'Sur toutes les commandes'}</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-black text-center text-[#2C2C2C] dark:text-white mb-12">
            {isRTL ? 'كيف يعمل' : 'Comment ça marche'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#2C2C2C] shadow-sm flex items-center justify-center mb-4">
                  <step.icon size={28} className="text-[#F6B21A]" />
                </div>
                <span className="text-5xl font-black text-[#F6B21A]/20 absolute -top-2">{i + 1}</span>
                <h3 className="font-bold text-[#2C2C2C] dark:text-white mb-1 mt-4">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{step.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-12 rounded-3xl bg-gradient-to-br from-[#F6B21A] to-[#FF9F1C]">
          <h2 className="text-3xl font-black text-[#2C2C2C] mb-4">{isRTL ? 'جائع الآن؟' : 'Faim maintenant ?'}</h2>
          <p className="text-[#2C2C2C]/70 mb-8">{isRTL ? 'اطلب الآن وسنوصله إليك' : 'Commandez maintenant et nous vous livrons'}</p>
          <a
            href="https://wa.me/21698157474"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#2C2C2C] text-white font-black hover:scale-105 transition-all"
          >
            <Phone size={18} />
            +216 98 157 474
          </a>
        </div>
      </div>
    </div>
  );
}
