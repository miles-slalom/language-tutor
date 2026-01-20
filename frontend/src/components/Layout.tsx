import { useState } from 'react'
import ChatArea from './ChatArea'
import TutorSidebar from './TutorSidebar'
import { TutorTips } from '../types'

interface LayoutProps {
  accessToken: string | null
  onSignOut: () => void
  userEmail?: string
}

const DEFAULT_SCENARIO = "You're at a small boulangerie in Lyon. You want to buy croissants for your family, but the baker seems to be having a bad day and is almost out of pastries. Navigate this interaction politely and get what you need."

export default function Layout({ accessToken, onSignOut, userEmail }: LayoutProps) {
  const [tutorTips, setTutorTips] = useState<TutorTips>({
    corrections: [],
    vocabulary: [],
    cultural: [],
  })

  const handleTutorTips = (tips: TutorTips) => {
    setTutorTips(tips)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
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

      {/* Main Content - Two Column Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4">
        <div className="flex gap-4 h-[calc(100vh-120px)]">
          {/* Left Column - Chat Area (70%) */}
          <div className="w-[70%]">
            <ChatArea
              scenario={DEFAULT_SCENARIO}
              accessToken={accessToken}
              onTutorTips={handleTutorTips}
            />
          </div>

          {/* Right Column - Tutor Sidebar (30%) */}
          <div className="w-[30%]">
            <TutorSidebar tips={tutorTips} />
          </div>
        </div>
      </main>
    </div>
  )
}
