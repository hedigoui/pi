import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
];

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  return (
    <div
      ref={boxRef}
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9998,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('accessibility.language')}
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          background: 'rgba(15,15,26,0.92)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10,
          color: '#fff',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}
      >
        <Globe size={18} />
        <span>{current.label}</span>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 6,
            background: 'rgba(15,15,26,0.98)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10,
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            minWidth: 140,
          }}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setOpen(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                background: i18n.language === lang.code ? 'rgba(227,24,55,0.25)' : 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 14,
                textAlign: 'left',
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
