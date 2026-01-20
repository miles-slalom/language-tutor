import { useState } from 'react';
import LocaleSelector from './LocaleSelector';

interface DifficultySelectorProps {
  onGenerate: (locale: string, difficulty: string, preferences?: string) => void;
  isLoading: boolean;
}

const DIFFICULTY_LEVELS = [
  { level: 'A1', name: 'Beginner', description: 'Basic phrases and simple interactions' },
  { level: 'A2', name: 'Elementary', description: 'Everyday expressions, simple conversations' },
  { level: 'B1', name: 'Intermediate', description: 'Main points on familiar topics, travel situations' },
  { level: 'B2', name: 'Upper Intermediate', description: 'Complex texts, fluent conversations' },
  { level: 'C1', name: 'Advanced', description: 'Demanding texts, nuanced expression' },
  { level: 'C2', name: 'Mastery', description: 'Near-native fluency, subtle meanings' },
];

export default function DifficultySelector({ onGenerate, isLoading }: DifficultySelectorProps) {
  const [selectedLocale, setSelectedLocale] = useState('fr-FR');
  const [selectedLevel, setSelectedLevel] = useState('A1');
  const [preferences, setPreferences] = useState('');

  const handleGenerate = () => {
    onGenerate(selectedLocale, selectedLevel, preferences.trim() || undefined);
  };

  return (
    <div className="flex items-center justify-center min-h-full p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
          <div className="text-4xl mb-2">🌍</div>
          <h1 className="text-2xl font-bold text-white">Language Tutor</h1>
          <p className="text-blue-100 mt-1">Select your language and level to start</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Locale Selection */}
          <LocaleSelector
            selectedLocale={selectedLocale}
            onLocaleChange={setSelectedLocale}
            disabled={isLoading}
          />

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Difficulty Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Your Level</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DIFFICULTY_LEVELS.map((item) => (
                <button
                  key={item.level}
                  onClick={() => setSelectedLevel(item.level)}
                  disabled={isLoading}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedLevel === item.level
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className={`text-xl font-bold ${
                    selectedLevel === item.level ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {item.level}
                  </div>
                  <div className={`text-sm font-medium ${
                    selectedLevel === item.level ? 'text-blue-500' : 'text-gray-600'
                  }`}>
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {item.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Suggestion */}
          <div>
            <label htmlFor="theme-input" className="block text-sm font-medium text-gray-700 mb-2">
              Suggest a Theme (optional)
            </label>
            <input
              id="theme-input"
              type="text"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="e.g., café, museum, train station..."
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating Scenario...</span>
              </>
            ) : (
              <>
                <span>Generate Scenario</span>
                <span>→</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t">
          <p className="text-xs text-gray-500 text-center">
            The AI will create a conversational scenario tailored to your language and level. A tutor will guide you through the conversation.
          </p>
        </div>
      </div>
    </div>
  );
}
