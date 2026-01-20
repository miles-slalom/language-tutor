import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface TutorTips {
  corrections: string[]
  vocabulary: string[]
  cultural: string[]
}

interface ChatAreaProps {
  scenario: string
  accessToken: string | null
  onTutorTips: (tips: TutorTips) => void
}

const API_URL = import.meta.env.VITE_API_URL || ''

export default function ChatArea({ scenario, accessToken, onTutorTips }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [conversationComplete, setConversationComplete] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading || conversationComplete) return

    const userMessage = inputValue.trim()
    setInputValue('')
    setError('')

    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({
          message: userMessage,
          conversation_history: messages,
          scenario: scenario,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      setMessages([...newMessages, { role: 'assistant', content: data.character_response }])
      onTutorTips(data.tutor_tips)

      if (data.conversation_complete) {
        setConversationComplete(true)
      }
    } catch (err) {
      setError('Failed to send message. Please try again.')
      setMessages(messages)
    } finally {
      setIsLoading(false)
    }
  }

  const resetConversation = () => {
    setMessages([])
    setConversationComplete(false)
    setError('')
    onTutorTips({ corrections: [], vocabulary: [], cultural: [] })
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <h2 className="text-lg font-semibold mb-2">Scenario</h2>
        <p className="text-sm text-blue-100">{scenario}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-2">Bienvenue!</p>
            <p className="text-sm">Start the conversation in French. Try greeting the character!</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-gray-200 text-gray-800 rounded-bl-md'
              }`}
            >
              {message.role === 'assistant' && (
                <span className="text-xs text-gray-500 block mb-1">Le Personnage</span>
              )}
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-2xl rounded-bl-md">
              <span className="text-xs text-gray-500 block mb-1">Le Personnage</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {conversationComplete && (
        <div className="px-4 py-3 bg-green-50 border-t border-green-200">
          <p className="text-green-700 text-sm font-medium">Conversation complete! Well done!</p>
          <button
            onClick={resetConversation}
            className="mt-2 text-sm text-green-600 hover:text-green-800 underline"
          >
            Start a new conversation
          </button>
        </div>
      )}

      <form onSubmit={sendMessage} className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={conversationComplete ? 'Conversation complete!' : 'Type your response in French...'}
            disabled={isLoading || conversationComplete}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim() || conversationComplete}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}
