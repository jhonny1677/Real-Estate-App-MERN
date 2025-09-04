import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../i18n';
import './languageSwitcher.scss';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLanguage = LANGUAGES.find(lang => lang.code === i18n.language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button
        className="language-switcher__button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label="Change Language"
        aria-expanded={isOpen}
      >
        <span className="language-switcher__flag">
          {currentLanguage.flag}
        </span>
        <span className="language-switcher__name">
          {currentLanguage.nativeName}
        </span>
        <span className={`language-switcher__arrow ${isOpen ? 'open' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="language-switcher__dropdown" style={{ display: 'block' }}>
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              className={`language-switcher__option ${
                language.code === i18n.language ? 'active' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                changeLanguage(language.code);
              }}
              dir={language.rtl ? 'rtl' : 'ltr'}
            >
              <span className="language-switcher__option-flag">
                {language.flag}
              </span>
              <div className="language-switcher__option-info">
                <span className="language-switcher__option-native">
                  {language.nativeName}
                </span>
                <span className="language-switcher__option-english">
                  {language.name}
                </span>
              </div>
              {language.code === i18n.language && (
                <span className="language-switcher__checkmark">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;