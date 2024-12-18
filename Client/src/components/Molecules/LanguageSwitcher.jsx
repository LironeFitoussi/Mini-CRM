// src/components/LanguageSwitcher.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const availableLanguages = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
  ];

  const handleChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <select onChange={handleChange} value={i18n.language}>
      {availableLanguages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
};

export default LanguageSwitcher;
