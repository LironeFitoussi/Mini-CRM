// src/components/LanguageSwitcher.jsx

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGlobe } from 'react-icons/fa';
import enFlag from '../../assets/flags/us.svg';
import frFlag from '../../assets/flags/fr.svg';
// Import more flags as needed

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const switcherRef = useRef(null);

  const availableLanguages = [
    { code: 'en', label: 'English', flag: enFlag },
    { code: 'fr', label: 'Français', flag: frFlag },
    // Add more languages here
  ];

  const handleChange = (lang) => {
    i18n.changeLanguage(lang.code);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentLang = availableLanguages.find(
    (lang) => lang.code === i18n.language
  ) || availableLanguages[0];

  return (
    <div className="relative inline-block text-left" ref={switcherRef}>
      <button
        onClick={toggleDropdown}
        className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <img src={currentLang.flag} alt={`${currentLang.label} flag`} className="w-5 h-4 mr-2" />
        <span>{currentLang.label}</span>
        <FaGlobe className="ml-2 w-4 h-4" />
      </button>

      {isOpen && (
        <ul
          className="absolute right-0 z-10 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="language-switcher"
        >
          {availableLanguages.map((lang) => (
            <li key={lang.code} role="none">
              <button
                onClick={() => handleChange(lang)}
                className={`${
                  lang.code === currentLang.code ? 'bg-gray-100' : ''
                } flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100`}
                role="menuitem"
              >
                <img src={lang.flag} alt={`${lang.label} flag`} className="w-5 h-4 mr-2" />
                <span>{lang.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;
