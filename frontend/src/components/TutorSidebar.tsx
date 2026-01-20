import { useState } from 'react'

interface TutorTips {
  corrections: string[]
  vocabulary: string[]
  cultural: string[]
}

interface TutorSidebarProps {
  tips: TutorTips
}

export default function TutorSidebar({ tips }: TutorSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const hasAnyTips = tips.corrections.length > 0 || tips.vocabulary.length > 0 || tips.cultural.length > 0

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white rounded-lg shadow-md flex flex-col items-center py-4">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Show Tutor Tips"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="mt-4 writing-mode-vertical text-gray-500 text-sm font-medium">
          Tutor
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">📚</span>
          <h2 className="text-lg font-semibold text-gray-800">Tutor Tips</h2>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Collapse Sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Tips Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!hasAnyTips && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-sm">Start chatting to receive feedback on your French!</p>
          </div>
        )}

        {/* Corrections - Red styling */}
        {tips.corrections.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-red-500">✏️</span>
              <h3 className="text-sm font-semibold text-red-700">Corrections</h3>
            </div>
            <ul className="space-y-1">
              {tips.corrections.map((correction, index) => (
                <li key={index} className="text-sm text-red-800 pl-4 border-l-2 border-red-300">
                  {correction}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Vocabulary - Blue styling */}
        {tips.vocabulary.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-blue-500">📖</span>
              <h3 className="text-sm font-semibold text-blue-700">Vocabulary</h3>
            </div>
            <ul className="space-y-1">
              {tips.vocabulary.map((vocab, index) => (
                <li key={index} className="text-sm text-blue-800 pl-4 border-l-2 border-blue-300">
                  {vocab}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cultural Notes - Green styling */}
        {tips.cultural.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-green-500">🗼</span>
              <h3 className="text-sm font-semibold text-green-700">Cultural Tips</h3>
            </div>
            <ul className="space-y-1">
              {tips.cultural.map((tip, index) => (
                <li key={index} className="text-sm text-green-800 pl-4 border-l-2 border-green-300">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer with legend */}
      <div className="p-3 border-t bg-gray-50 rounded-b-lg">
        <div className="flex justify-center space-x-4 text-xs text-gray-500">
          <span className="flex items-center"><span className="w-2 h-2 bg-red-400 rounded-full mr-1"></span>Corrections</span>
          <span className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>Vocab</span>
          <span className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>Culture</span>
        </div>
      </div>
    </div>
  )
}
