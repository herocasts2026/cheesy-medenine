import { ChefHat, Heart, Award, Users } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';

export default function About() {
  const { t, isRTL } = useLang();

  const stats = [
    { icon: Award, value: '2024', label: isRTL ? 'تأسس' : 'Depuis' },
    { icon: ChefHat, value: '30+', label: isRTL ? 'طبق' : 'Plats' },
    { icon: Users, value: '5000+', label: isRTL ? 'عميل سعيد' : 'Clients satisfaits' },
    { icon: Heart, value: '100%', label: isRTL ? 'شغف' : 'Passion' },
  ];

  return (
    <div className="pt-24 pb-20 bg-[#FAF9F6] dark:bg-[#1a1a1a] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#F6B21A] font-black uppercase tracking-wider text-sm mb-2">{t.about}</p>
          <h1 className="text-4xl sm:text-5xl font-black text-[#2C2C2C] dark:text-white mb-4">{t.aboutTitle}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t.aboutSub}</p>
        </div>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className={isRTL ? 'order-2' : ''}>
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#F6B21A] to-[#FF9F1C] opacity-20 blur-2xl" />
              <img src="/images/cheesy_hero.webp" alt="Cheesy Medenine" className="relative w-full h-96 object-cover rounded-3xl shadow-2xl" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-[#2C2C2C] dark:text-white mb-6">
              {isRTL ? 'من قلب مدنين' : 'Au cœur de Médenine'}
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>
                {isRTL
                  ? 'بدأت تشيزي مدنين برؤية بسيطة: تقديم طعام عالي الجودة بطابع عصري في قلب مدنين. نحن نؤمن أن كل وجبة يجب أن تكون تجربة لا تُنسى.'
                  : 'Cheesy Medenine a commencé avec une vision simple : servir une nourriture de haute qualité avec une touche moderne au cœur de Médenine. Nous croyons que chaque repas doit être une expérience inoubliable.'}
              </p>
              <p>
                {isRTL
                  ? 'من البرغر الطازج إلى الأطباق الشهية والحلويات اللذيذة، كل طبق يُعدّ بعناية باستخدام أجود المكونات. شغفنا بالطهي يظهر في كل قضمة.'
                  : 'Des burgers frais aux plats savoureux et desserts délicieux, chaque plat est préparé avec soin en utilisant les meilleurs ingrédients. Notre passion pour la cuisine transparaît dans chaque bouchée.'}
              </p>
              <p>
                {isRTL
                  ? 'نحن فخورون بأن نكون جزءاً من مجتمع مدنين ونلتزم بتقديم أفضل تجربة طعام لعملائنا الكرام.'
                  : 'Nous sommes fiers d\'être une partie de la communauté de Médenine et nous nous engageons à offrir la meilleure expérience culinaire à nos précieux clients.'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center p-8 rounded-3xl bg-white dark:bg-[#2C2C2C] shadow-sm hover:shadow-xl transition-all">
              <s.icon size={32} className="text-[#F6B21A] mb-3" />
              <span className="text-4xl font-black text-[#2C2C2C] dark:text-white">{s.value}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-[#2C2C2C] dark:text-white">
            {isRTL ? 'قيمنا' : 'Nos Valeurs'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '🌟', title: isRTL ? 'الجودة' : 'Qualité', desc: isRTL ? 'أفضل المكونات في كل طبق' : 'Les meilleurs ingrédients dans chaque plat' },
            { icon: '⚡', title: isRTL ? 'السرعة' : 'Rapidité', desc: isRTL ? 'خدمة سريعة دون مساومة على الجودة' : 'Service rapide sans compromis sur la qualité' },
            { icon: '❤️', title: isRTL ? 'الشغف' : 'Passion', desc: isRTL ? 'نحب ما نفعله' : 'Nous aimons ce que nous faisons' },
          ].map((v, i) => (
            <div key={i} className="text-center p-8 rounded-3xl bg-white dark:bg-[#2C2C2C] shadow-sm">
              <span className="text-5xl mb-4 block">{v.icon}</span>
              <h3 className="font-black text-[#2C2C2C] dark:text-white text-xl mb-2">{v.title}</h3>
              <p className="text-gray-500 dark:text-gray-400">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
