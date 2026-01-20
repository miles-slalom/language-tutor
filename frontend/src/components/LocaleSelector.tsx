import { useState, useEffect } from 'react';
import { Language } from '../types';

interface LocaleSelectorProps {
  selectedLocale: string;
  onLocaleChange: (locale: string) => void;
  disabled?: boolean;
}

export default function LocaleSelector({ selectedLocale, onLocaleChange, disabled }: LocaleSelectorProps) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derive selected language code from locale
  const selectedLanguageCode = selectedLocale.split('-')[0];

  // Fetch languages from API on mount
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    fetch(`${apiUrl}/api/locales`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load languages');
        return res.json();
      })
      .then(data => {
        setLanguages(data.languages);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load locales:', err);
        setError('Failed to load languages');
        setLoading(false);
      });
  }, []);

  // Get current language object
  const currentLanguage = languages.find(l => l.code === selectedLanguageCode);

  // Get current variant
  const currentVariant = currentLanguage?.variants.find(v => v.code === selectedLocale)
    || currentLanguage?.variants.find(v => v.is_default);

  const handleLanguageSelect = (langCode: string) => {
    const lang = languages.find(l => l.code === langCode);
    if (lang) {
      const defaultVariant = lang.variants.find(v => v.is_default) || lang.variants[0];
      onLocaleChange(defaultVariant.code);
    }
  };

  const handleVariantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onLocaleChange(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading languages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        {error}. Using French (France) as default.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">What language are you learning?</h3>

      {/* Language grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageSelect(lang.code)}
            disabled={disabled}
            className={`p-3 rounded-lg border-2 text-center transition-all ${
              selectedLanguageCode === lang.code
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="text-sm font-medium text-gray-800 truncate">{lang.name}</div>
            <div className="text-xs text-gray-500 truncate">{lang.native_name}</div>
          </button>
        ))}
      </div>

      {/* Variant selector - only show if multiple variants */}
      {currentLanguage && currentLanguage.variants.length > 1 && (
        <div className="flex items-center gap-2 text-sm bg-gray-50 p-3 rounded-lg">
          <span className="text-gray-600 font-medium">Variant:</span>
          <select
            value={selectedLocale}
            onChange={handleVariantChange}
            disabled={disabled}
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          >
            {currentLanguage.variants.map((variant) => (
              <option key={variant.code} value={variant.code}>
                {variant.flag} {variant.country}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Show current selection summary */}
      {currentVariant && currentLanguage && (
        <div className="text-center text-sm text-gray-600 bg-blue-50 p-2 rounded-lg">
          <span className="text-lg mr-2">{currentVariant.flag}</span>
          <span className="font-medium">{currentLanguage.name}</span>
          <span className="text-gray-500"> ({currentVariant.country})</span>
        </div>
      )}
    </div>
  );
}
