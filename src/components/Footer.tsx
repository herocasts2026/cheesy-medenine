import { Link, useLocation } from 'react-router-dom';
import { Instagram, Facebook, Phone, MapPin, Clock } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t } = useLang();
  const location = useLocation();

  const links = [
    { label: t.home, href: '/' },
    { label: t.menu, href: '/menu' },
    { label: t.orderOnline, href: '/order' },
    { label: t.delivery, href: '/delivery' },
    { label: t.about, href: '/about' },
    { label: t.contact, href: '/contact' },
  ];

  return (
    <footer className="bg-[#2C2C2C] text-white pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src="/images/cheesy_logo.webp" alt="Cheesy" className="w-12 h-12 rounded-xl object-contain" />
              <div>
                <p className="text-xl font-black">Cheesy</p>
                <p className="text-sm text-[#F6B21A] font-bold">Medenine</p>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">Modern fast-food restaurant serving premium burgers, plates, tacos & sweet treats in Médenine, Tunisia.</p>
            <div className="flex gap-3 mt-5">
              <a href="https://instagram.com/cheesy.md" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#F6B21A] hover:text-[#2C2C2C] flex items-center justify-center transition-all">
                <Instagram size={18} />
              </a>
              <a href="https://www.facebook.com/cheesymd" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#F6B21A] hover:text-[#2C2C2C] flex items-center justify-center transition-all">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[#F6B21A] mb-4">{t.quickLinks}</h3>
            <ul className="space-y-2.5">
              {links.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className={`text-white/60 hover:text-white transition-colors text-sm ${location.pathname === link.href ? 'text-[#F6B21A]' : ''}`}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[#F6B21A] mb-4">{t.contact}</h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-[#F6B21A]" />
                <span>{t.medenine}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="flex-shrink-0 text-[#F6B21A]" />
                <a href="tel:+21698157474" className="hover:text-white transition-colors" dir="ltr">+216 98 157 474</a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[#F6B21A] mb-4">{t.openingHours}</h3>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <Clock size={16} className="flex-shrink-0 text-[#F6B21A]" />
                <span>11:00 - 00:00</span>
              </li>
              <li>Lun - Dim</li>
              <li className="text-[#F6B21A] font-semibold">7j/7</li>
            </ul>
          </div>
        </div>

        {/* Credit */}
        <div className="pt-6 text-center">
          <p className="text-white/40 text-sm">{t.footerCredit}</p>
        </div>
      </div>
    </footer>
  );
}
