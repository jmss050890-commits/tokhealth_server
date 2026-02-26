import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '@/i18n';
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    document.documentElement.dir = LANGUAGES.find(l => l.code === code)?.rtl ? 'rtl' : 'ltr';
    setOpen(false);
  };

  return (
    <div className="relative" data-testid="language-selector">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full bg-white/80 hover:bg-white border border-slate-200 text-slate-600 text-xs font-medium transition-all"
        data-testid="language-btn"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{currentLang.flag}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-xl shadow-xl border border-slate-200 py-1 min-w-[160px] max-h-[280px] overflow-y-auto">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => changeLang(lang.code)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-sky-50 flex items-center justify-between ${
                  i18n.language === lang.code ? 'bg-sky-50 text-sky-700 font-medium' : 'text-slate-700'
                }`}
                data-testid={`lang-${lang.code}`}
              >
                <span>{lang.name}</span>
                <span className="text-xs text-slate-400">{lang.flag}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;
