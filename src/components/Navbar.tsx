import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, ShoppingCart, Menu, X, Globe } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import { useLang } from '@/contexts/LanguageContext';
import { Language } from '@/data/translations';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { totalItems, setIsCartOpen } = useCart();
  const { t, lang, setLang, isRTL } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const navLinks = [
    { label: t.home, href: '/' },
    { label: t.menu, href: '/menu' },
    { label: t.orderOnline, href: '/order' },
    { label: t.about, href: '/about' },
    { label: t.contact, href: '/contact' },
  ];

  const languages: { code: Language; label: string }[] = [
    { code: 'fr', label: 'FR' },
    { code: 'en', label: 'EN' },
    { code: 'ar', label: 'ع' },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md shadow-md py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/images/3.jfif" alt="Cheesy" className="w-10 h-10 rounded-xl object-contain" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/fallback-food.png'; }} />
            <span className="text-xl font-black tracking-tight text-[#F6B21A]">
              Cheesy
              <span className="nav-logo-black"> Medenine</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isActive(link.href)
                    ? 'bg-[#F6B21A] text-[#2C2C2C]'
                    : 'hover:bg-[#F6B21A]/10'
                }`}
                style={isActive(link.href) ? undefined : { color: '#000000' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-bold transition-all ${
                  scrolled ? 'text-[#2C2C2C] dark:text-white hover:bg-[#F6B21A]/10' : 'text-white hover:bg-white/10'
                }`}
              >
                <Globe size={16} />
                <span>{lang.toUpperCase()}</span>
              </button>
              {langOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50">
                  {languages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={`block w-full px-5 py-3 text-sm font-semibold text-left hover:bg-[#F6B21A]/10 transition-colors ${
                        lang === l.code ? 'text-[#F6B21A]' : 'text-[#2C2C2C] dark:text-white'
                      }`}
                    >
                      {l.label === 'ع' ? 'العربية' : l.label === 'FR' ? 'Français' : 'English'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-full transition-all ${
                scrolled
                  ? 'text-[#2C2C2C] dark:text-white hover:bg-[#F6B21A]/10'
                  : 'text-white hover:bg-white/10'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full bg-[#F6B21A] text-[#2C2C2C] hover:bg-[#FF9F1C] transition-all hover:scale-105"
              aria-label="Open cart"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#2C2C2C] text-white text-[10px] font-black flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`lg:hidden p-2.5 rounded-full transition-all ${
                scrolled ? 'text-[#2C2C2C] dark:text-white' : 'text-white'
              }`}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${mobileOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <div
          className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-80 bg-white dark:bg-[#1a1a1a] shadow-2xl transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : isRTL ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full pt-24 px-6 pb-8">
            <div className="flex flex-col items-center gap-3 mb-8">
              <img src="/images/3.jfif" alt="Cheesy" className="w-20 h-20 rounded-2xl object-contain" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/fallback-food.png'; }} />
              <span className="text-2xl font-black text-[#2C2C2C] dark:text-white">Cheesy <span className="text-black dark:text-white">Medenine</span></span>
            </div>
            <nav className="flex flex-col gap-2">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    isActive(link.href)
                      ? 'bg-[#F6B21A] text-[#2C2C2C]'
                      : 'text-[#F6B21A] hover:bg-[#F6B21A]/10'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex items-center gap-3">
              <button onClick={toggleTheme} className="flex items-center gap-2 text-sm font-semibold text-[#2C2C2C] dark:text-white">
                {theme === 'light' ? <><Moon size={18} /> Dark Mode</> : <><Sun size={18} /> Light Mode</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
