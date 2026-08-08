import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 1800);
    const t2 = setTimeout(() => setVisible(false), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#2C2C2C] transition-opacity duration-400 ${fade ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="flex flex-col items-center gap-6 animate-fade-in-up">
        <img
          src="/images/cheesy_logo.webp"
          alt="Cheesy Logo"
          className="w-36 h-36 rounded-2xl object-contain"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/fallback-food.png'; }}
        />
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-[#F6B21A]"
              style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
