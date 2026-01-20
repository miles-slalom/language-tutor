import { ScenarioProposal, ResolutionStatus } from '../types';

interface ScenarioSummaryProps {
  scenario: ScenarioProposal;
  resolutionStatus: ResolutionStatus;
  onNewScenario: () => void;
}

const RESOLUTION_CONFIG = {
  success: {
    emoji: '🎉',
    title: 'Félicitations!',
    subtitle: 'Mission Accomplished!',
    message: 'You successfully achieved your objective.',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    accentColor: 'text-green-600',
  },
  adapted: {
    emoji: '👍',
    title: 'Well Done!',
    subtitle: 'Creative Solution!',
    message: 'You found an alternative way forward.',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    accentColor: 'text-amber-600',
  },
  graceful_fail: {
    emoji: '💪',
    title: 'Good Effort!',
    subtitle: 'Learning Opportunity!',
    message: 'You handled a challenging situation gracefully. Every conversation is a chance to learn!',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    accentColor: 'text-orange-600',
  },
};

export default function ScenarioSummary({ scenario, resolutionStatus, onNewScenario }: ScenarioSummaryProps) {
  const config = RESOLUTION_CONFIG[resolutionStatus];

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className={`rounded-lg border-2 ${config.borderColor} overflow-hidden shadow-lg`}>
        <div className={`${config.bgColor} p-6 text-center`}>
          <div className="text-5xl mb-3">{config.emoji}</div>
          <h1 className={`text-2xl font-bold ${config.textColor}`}>{config.title}</h1>
          <h2 className={`text-lg font-medium ${config.accentColor}`}>{config.subtitle}</h2>
          <p className={`mt-3 ${config.textColor}`}>{config.message}</p>
        </div>

        <div className="bg-white p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Scenario Recap</h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-lg">📍</span>
              <div>
                <span className="font-medium text-gray-700">Setting:</span>
                <span className="ml-1 text-gray-600">{scenario.setting_description}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-lg">👤</span>
              <div>
                <span className="font-medium text-gray-700">Character:</span>
                <span className="ml-1 text-gray-600">{scenario.character_name}</span>
                {scenario.character_personality && (
                  <span className="text-gray-500"> - {scenario.character_personality}</span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-lg">🎯</span>
              <div>
                <span className="font-medium text-gray-700">Objective:</span>
                <span className="ml-1 text-gray-600">{scenario.objective}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-lg">📊</span>
              <div>
                <span className="font-medium text-gray-700">Difficulty:</span>
                <span className="ml-1 text-gray-600">{scenario.difficulty}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4">
          <button
            onClick={onNewScenario}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Start New Scenario
          </button>
        </div>
      </div>
    </div>
  );
}
