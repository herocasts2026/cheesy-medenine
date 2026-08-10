import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ChefHat, Clock, Star, Utensils, Phone, ImageIcon } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { menuItems, menuCategories } from '@/data/menuData';

export default function Home() {
  const { t, isRTL } = useLang();
  const siteUrl = 'https://cheesy-medenine.bolt.host';
  const featuredItems = menuItems.filter(i => ['cheese-burger', 'double-cheese-burger', 'tacos-geant', 'san-sebastian-cheesecake', 'escalope-creme', 'happy-kids-meal'].includes(i.id));

  const features = [
    { icon: ChefHat, title: isRTL ? 'طهي طازج' : 'Freshly Cooked', sub: isRTL ? 'مكونات عالية الجودة' : 'Premium ingredients' },
    { icon: Truck, title: isRTL ? 'توصيل سريع' : 'Fast Delivery', sub: isRTL ? 'في جميع أنحاء مدنين' : 'Across Medenine' },
    { icon: Clock, title: isRTL ? 'مفتوح 7/7' : 'Open 7/7', sub: isRTL ? '11:00 - 00:00' : '11:00 - 00:00' },
    { icon: Star, title: isRTL ? 'جودة ممتازة' : 'Top Quality', sub: isRTL ? 'طعم لا يُنسى' : 'Unforgettable taste' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#1a1a1a]">
      {/* Hero */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 z-0 opacity-40">
          <img src="/images/cheezy_1.jfif" alt="Cheesy Medenine" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-black/40 z-0" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-[#F6B21A] animate-pulse" />
            <span className="text-white text-sm font-semibold">Médenine, Tunisie</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {t.heroTitle} <span className="text-[#F6B21A]">{t.heroTitleHighlight}</span><br />
            {t.heroSubtitle}
          </h1>
          <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {t.heroDescription}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/order" className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#F6B21A] hover:bg-[#FF9F1C] text-[#2C2C2C] font-black text-base transition-all hover:scale-105 shadow-2xl shadow-[#F6B21A]/30" >
              {t.orderNow}
              <ArrowRight size={20} className={`group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
            </Link>
            <Link to="/menu" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold text-base hover:bg-white/20 transition-all" >
              {t.viewMenu}
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center p-2">
            <div className="w-1 h-2 rounded-full bg-white/60" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[#FAF9F6] dark:bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-3xl bg-white dark:bg-[#2C2C2C] shadow-sm hover:shadow-xl transition-all hover:-translate-y-1" >
                <div className="w-14 h-14 rounded-2xl bg-[#F6B21A]/10 flex items-center justify-center mb-4">
                  <f.icon size={26} className="text-[#F6B21A]" />
                </div>
                <h3 className="font-black text-[#2C2C2C] dark:text-white text-base">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{f.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Menu */}
      <section className="py-20 bg-white dark:bg-[#2C2C2C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#F6B21A] font-black uppercase tracking-wider text-sm mb-2">{t.ourMenu}</p>
            <h2 className="text-4xl font-black text-[#2C2C2C] dark:text-white">{t.ourMenuSub}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredItems.map(item => (
              <div key={item.id} className="group rounded-3xl overflow-hidden bg-[#FAF9F6] dark:bg-[#1a1a1a] shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="relative h-44 sm:h-48 overflow-hidden bg-gray-50 dark:bg-[#333]">
                  {item.images.length > 0 ? (
                    <div className="w-full h-full flex items-center justify-center p-2.5">
                      <img src={item.images[0]} alt={item.nameFr} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-[#333]">
                      <ImageIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-[#F6B21A] text-[#2C2C2C] font-black text-sm">
                    {item.price} {t.dt}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-black text-[#2C2C2C] dark:text-white mb-2">{item.nameFr}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.descriptionFr}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/menu" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#2C2C2C] dark:bg-[#F6B21A] text-white dark:text-[#2C2C2C] font-black transition-all hover:scale-105" >
              {t.viewMenu}
              <ArrowRight size={20} className={isRTL ? 'rotate-180' : ''} />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-20 bg-white dark:bg-[#2C2C2C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-[#2C2C2C] dark:text-white">{t.ourMenu}</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {menuCategories.map(cat => (
              <Link key={cat.id} to="/menu" className="group flex flex-col items-center p-8 rounded-3xl bg-[#FAF9F6] dark:bg-[#1a1a1a] hover:bg-[#F6B21A] transition-all hover:-translate-y-2" >
                <span className="text-5xl mb-3">{cat.icon}</span>
                <span className="font-black text-[#2C2C2C] dark:text-white group-hover:text-[#2C2C2C] transition-colors">{cat.nameFr}</span>
                <span className="text-sm text-gray-500 group-hover:text-[#2C2C2C]/70 mt-1">
                  {menuItems.filter(i => i.category === cat.id).length} {isRTL ? 'عنصر' : 'items'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
