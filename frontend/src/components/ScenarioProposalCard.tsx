import { useState } from 'react';
import { ScenarioProposal } from '../types';

interface ScenarioProposalCardProps {
  scenario: ScenarioProposal;
  onAccept: () => void;
  onModify: (modificationRequest: string) => void;
  onNewScenario: (vetoReason?: string) => void;
  isLoading: boolean;
}

const getDifficultyColor = (difficulty: string): string => {
  const level = difficulty.toUpperCase();
  if (level.startsWith('A')) return 'bg-green-100 text-green-800 border-green-300';
  if (level.startsWith('B')) return 'bg-blue-100 text-blue-800 border-blue-300';
  return 'bg-purple-100 text-purple-800 border-purple-300';
};

export default function ScenarioProposalCard({
  scenario,
  onAccept,
  onModify,
  onNewScenario,
  isLoading
}: ScenarioProposalCardProps) {
  const [showModifyInput, setShowModifyInput] = useState(false);
  const [modificationText, setModificationText] = useState('');
  const [showHints, setShowHints] = useState(false);

  const handleSubmitModification = () => {
    if (modificationText.trim()) {
      onModify(modificationText.trim());
      setModificationText('');
      setShowModifyInput(false);
    }
  };

  const handleCancelModification = () => {
    setModificationText('');
    setShowModifyInput(false);
  };

  const handleNewScenario = () => {
    onNewScenario();
  };

  return (
    <div className="flex items-center justify-center min-h-full p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎭</span>
            <h2 className="text-xl font-bold text-white">Your Scenario</h2>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(scenario.difficulty)}`}>
            {scenario.difficulty}
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          <div className="p-4">
            <div className="flex items-start space-x-2 mb-2">
              <span className="text-lg">📍</span>
              <div>
                <span className="font-semibold text-gray-800">Setting:</span>
                <span className="ml-2 text-gray-700">{scenario.setting}</span>
              </div>
            </div>
            <div className="ml-7 text-gray-600 italic border-l-2 border-indigo-200 pl-3 bg-indigo-50 py-2 rounded-r">
              "{scenario.setting_description}"
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-start space-x-2">
              <span className="text-lg">👤</span>
              <div>
                <span className="font-semibold text-gray-800">Character:</span>
                <span className="ml-2 text-gray-700">{scenario.character_name}</span>
                <p className="text-gray-500 text-sm mt-1">{scenario.character_personality}</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-start space-x-2">
              <span className="text-lg">🎯</span>
              <div>
                <span className="font-semibold text-gray-800">Objective</span>
                <p className="text-gray-700 mt-1">{scenario.objective}</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-start space-x-2">
              <span className="text-lg">⚡</span>
              <div>
                <span className="font-semibold text-gray-800">Challenge</span>
                <p className="text-gray-600 mt-1">{scenario.conflict}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50">
            <div className="flex items-start space-x-2">
              <span className="text-lg">💬</span>
              <div>
                <span className="font-semibold text-gray-800">Opening Line</span>
                <p className="text-blue-800 italic mt-2 text-lg">"{scenario.opening_line}"</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <button
              onClick={() => setShowHints(!showHints)}
              className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition w-full"
            >
              <span className="text-lg">📚</span>
              <span className="font-semibold">Vocabulary Hints</span>
              <svg
                className={`w-4 h-4 ml-auto transition-transform ${showHints ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showHints && scenario.hints.length > 0 && (
              <ul className="mt-3 ml-7 space-y-1">
                {scenario.hints.map((hint, index) => (
                  <li key={index} className="text-gray-600 text-sm flex items-center">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></span>
                    {hint}
                  </li>
                ))}
              </ul>
            )}
            {showHints && scenario.hints.length === 0 && (
              <p className="mt-3 ml-7 text-gray-500 text-sm italic">No vocabulary hints for this scenario.</p>
            )}
          </div>
        </div>

        {showModifyInput ? (
          <div className="p-4 bg-gray-50 border-t">
            <textarea
              value={modificationText}
              onChange={(e) => setModificationText(e.target.value)}
              placeholder="What would you like to change?"
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={3}
            />
            <div className="flex space-x-3 mt-3">
              <button
                onClick={handleSubmitModification}
                disabled={isLoading || !modificationText.trim()}
                className="flex-1 py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Modifying...</span>
                  </>
                ) : (
                  <span>Submit Modification</span>
                )}
              </button>
              <button
                onClick={handleCancelModification}
                disabled={isLoading}
                className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border-t flex flex-wrap gap-3">
            <button
              onClick={onAccept}
              disabled={isLoading}
              className="flex-1 min-w-[140px] py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Accept & Begin</span>
                  <span>→</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowModifyInput(true)}
              disabled={isLoading}
              className="py-3 px-6 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Modify
            </button>
            <button
              onClick={handleNewScenario}
              disabled={isLoading}
              className="py-3 px-6 border-2 border-gray-300 text-gray-600 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              New Scenario
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
