import { useState, useCallback } from 'react';
import ChatArea from './ChatArea';
import TutorSidebar from './TutorSidebar';
import DifficultySelector from './DifficultySelector';
import ScenarioProposalCard from './ScenarioProposalCard';
import ScenarioSummary from './ScenarioSummary';
import { TutorTips, ScenarioProposal, AppState, ArcProgress, ResolutionStatus } from '../types';

interface LayoutProps {
  accessToken: string | null;
  onSignOut: () => void;
  userEmail?: string;
}

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Layout({ accessToken, onSignOut, userEmail }: LayoutProps) {
  const [appState, setAppState] = useState<AppState>('difficulty_select');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentScenario, setCurrentScenario] = useState<ScenarioProposal | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState('B1');

  const [tutorTips, setTutorTips] = useState<TutorTips>({ corrections: [], vocabulary: [], cultural: [] });
  const [arcProgress, setArcProgress] = useState<ArcProgress>('beginning');
  const [resolutionStatus, setResolutionStatus] = useState<ResolutionStatus | null>(null);

  const generateScenario = useCallback(async (difficulty: string, preferences?: string, vetoReason?: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentDifficulty(difficulty);

    try {
      const response = await fetch(`${API_URL}/api/scenario/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({
          difficulty,
          preferences: preferences || undefined,
          veto_reason: vetoReason || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate scenario');

      const data = await response.json();
      setCurrentScenario(data.scenario);
      setAppState('scenario_proposal');
    } catch (err) {
      setError('Failed to generate scenario. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  const modifyScenario = useCallback(async (modificationRequest: string) => {
    if (!currentScenario) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/scenario/modify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({
          original_scenario: currentScenario,
          modification_request: modificationRequest,
        }),
      });

      if (!response.ok) throw new Error('Failed to modify scenario');

      const data = await response.json();
      setCurrentScenario(data.scenario);
    } catch (err) {
      setError('Failed to modify scenario. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, currentScenario]);

  const acceptScenario = useCallback(() => {
    setTutorTips({ corrections: [], vocabulary: [], cultural: [] });
    setArcProgress('beginning');
    setResolutionStatus(null);
    setAppState('conversation');
  }, []);

  const requestNewScenario = useCallback((vetoReason?: string) => {
    generateScenario(currentDifficulty, undefined, vetoReason);
  }, [currentDifficulty, generateScenario]);

  const handleConversationComplete = useCallback((status: ResolutionStatus) => {
    setResolutionStatus(status);
    setAppState('summary');
  }, []);

  const startNewSession = useCallback(() => {
    setCurrentScenario(null);
    setResolutionStatus(null);
    setTutorTips({ corrections: [], vocabulary: [], cultural: [] });
    setArcProgress('beginning');
    setAppState('difficulty_select');
  }, []);

  const renderContent = () => {
    switch (appState) {
      case 'difficulty_select':
        return (
          <div className="flex items-center justify-center h-full">
            <DifficultySelector
              onGenerate={generateScenario}
              isLoading={isLoading}
            />
          </div>
        );

      case 'scenario_proposal':
        return currentScenario ? (
          <div className="flex items-center justify-center h-full">
            <div className="max-w-2xl w-full">
              <ScenarioProposalCard
                scenario={currentScenario}
                onAccept={acceptScenario}
                onModify={modifyScenario}
                onNewScenario={requestNewScenario}
                isLoading={isLoading}
              />
            </div>
          </div>
        ) : null;

      case 'conversation':
        return currentScenario ? (
          <div className="flex gap-4 h-full">
            <div className="w-[70%]">
              <ChatArea
                scenario={currentScenario}
                accessToken={accessToken}
                onTutorTips={setTutorTips}
                onArcProgress={setArcProgress}
                onConversationComplete={handleConversationComplete}
              />
            </div>
            <div className="w-[30%]">
              <TutorSidebar
                tips={tutorTips}
                scenario={currentScenario}
                arcProgress={arcProgress}
              />
            </div>
          </div>
        ) : null;

      case 'summary':
        return currentScenario && resolutionStatus ? (
          <div className="flex items-center justify-center h-full">
            <div className="max-w-2xl w-full">
              <ScenarioSummary
                scenario={currentScenario}
                resolutionStatus={resolutionStatus}
                onNewScenario={startNewSession}
              />
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🇫🇷</span>
            <h1 className="text-xl font-bold text-gray-800">French Tutor</h1>
          </div>
          <div className="flex items-center space-x-4">
            {userEmail && (
              <span className="text-sm text-gray-600 hidden sm:block">{userEmail}</span>
            )}
            <button
              onClick={onSignOut}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-red-700">{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              ✕
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto p-4">
        <div className="h-[calc(100vh-120px)]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
