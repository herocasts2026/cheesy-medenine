import { useState } from 'react';
import { MapPin, Phone, Clock, Send, Mail } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';

export default function Contact() {
  const { t, isRTL } = useLang();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!name || !message) return;
    const msg = `Bonjour Cheesy Medenine!\n\nNom: ${name}\n\n${message}`;
    window.open(`https://wa.me/21698157474?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const contactInfo = [
    { icon: MapPin, label: t.address, value: t.medenine },
    { icon: Phone, label: t.phone, value: '+216 98 157 474', href: 'tel:+21698157474' },
    { icon: Clock, label: t.hours, value: '11:00 - 00:00 (7j/7)' },
  ];

  return (
    <div className="pt-24 pb-20 bg-[#FAF9F6] dark:bg-[#1a1a1a] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#F6B21A] font-black uppercase tracking-wider text-sm mb-2">{t.contact}</p>
          <h1 className="text-4xl sm:text-5xl font-black text-[#2C2C2C] dark:text-white mb-4">{t.contactTitle}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t.contactSub}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-5">
            {contactInfo.map((info, i) => (
              <div key={i} className="flex items-center gap-5 p-6 rounded-3xl bg-white dark:bg-[#2C2C2C] shadow-sm hover:shadow-lg transition-all">
                <div className="w-14 h-14 rounded-2xl bg-[#F6B21A]/10 flex items-center justify-center flex-shrink-0">
                  <info.icon size={26} className="text-[#F6B21A]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">{info.label}</p>
                  {info.href ? (
                    <a href={info.href} className="text-lg font-black text-[#2C2C2C] dark:text-white hover:text-[#F6B21A] transition-colors" dir="ltr">{info.value}</a>
                  ) : (
                    <p className="text-lg font-black text-[#2C2C2C] dark:text-white">{info.value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/21698157474"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-5 p-6 rounded-3xl bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 hover:scale-[1.02] transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <div>
                <p className="text-sm text-white/80 font-semibold">WhatsApp</p>
                <p className="text-lg font-black">+216 98 157 474</p>
              </div>
            </a>
          </div>

          {/* Contact Form */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#2C2C2C] shadow-sm">
            <h2 className="text-2xl font-black text-[#2C2C2C] dark:text-white mb-6">{t.sendMessage}</h2>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-bold text-[#2C2C2C] dark:text-white mb-2 block">{t.yourName}</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-[#2C2C2C] dark:text-white focus:border-[#F6B21A] focus:outline-none transition-colors"
                  placeholder={isRTL ? 'اسمك' : 'Votre nom'}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-[#2C2C2C] dark:text-white mb-2 block">{t.yourMessage}</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-[#2C2C2C] dark:text-white focus:border-[#F6B21A] focus:outline-none transition-colors resize-none"
                  placeholder={isRTL ? 'رسالتك...' : 'Votre message...'}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!name || !message}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-[#F6B21A] hover:bg-[#FF9F1C] text-[#2C2C2C] font-black transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Send size={18} />
                {t.sendMessage}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
