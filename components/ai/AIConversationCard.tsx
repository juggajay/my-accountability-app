'use client'

/**
 * AI Conversation Card
 * Main feature on dashboard - AI greets user, asks questions, builds profile
 */

import { useState, useEffect } from 'react'
import { PremiumCard } from '@/components/ui/premium-card'
import { Sparkles, Send, Loader2, MessageCircle } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function AIConversationCard() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)

  // Load initial greeting on mount
  useEffect(() => {
    loadInitialGreeting()
  }, [])

  const loadInitialGreeting = async () => {
    try {
      // First, try to load existing conversation history from today
      const historyResponse = await fetch('/api/ai/conversation-history')
      const historyData = await historyResponse.json()

      if (historyData.success && historyData.data.messages.length > 0) {
        // Load existing conversation from today
        setMessages(historyData.data.messages)
        setInitializing(false)
        return
      }

      // No existing conversation, generate new greeting
      // Check if AI should ask discovery questions
      const checkResponse = await fetch('/api/ai/proactive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check_discovery' }),
      })

      const checkData = await checkResponse.json()

      // Get conversation starter
      const starterResponse = await fetch('/api/ai/proactive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_conversation_starter' }),
      })

      const starterData = await starterResponse.json()

      if (starterData.success && starterData.data.starter) {
        setMessages([
          {
            role: 'assistant',
            content: starterData.data.starter,
          },
        ])
      } else {
        // Default greeting
        setMessages([
          {
            role: 'assistant',
            content: "Hey! I'm your AI accountability coach. How are you doing today?",
          },
        ])
      }
    } catch (error) {
      console.error('Error loading greeting:', error)
      setMessages([
        {
          role: 'assistant',
          content: "Hey! I'm your AI accountability coach. How are you doing today?",
        },
      ])
    } finally {
      setInitializing(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    // Add user message
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage },
    ]
    setMessages(newMessages)

    try {
      // Send to coach API
      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages,
        }),
      })

      const data = await response.json()

      if (data.success && data.response) {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: data.response },
        ])
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error: any) {
      console.error('Error sending message:', error)
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: "Sorry, I'm having trouble responding right now. Please try again.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (initializing) {
    return (
      <PremiumCard variant="gradient">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      </PremiumCard>
    )
  }

  return (
    <PremiumCard variant="gradient">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary-500/20">
          <Sparkles className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Your AI Coach</h2>
          <p className="text-sm text-white/60">
            I'm here to help you stay accountable
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white/10 backdrop-blur-sm border border-white/10'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-primary-400" />
                  <span className="text-xs font-medium text-primary-400">
                    AI Coach
                  </span>
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
                <span className="text-sm text-white/60">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 focus:border-primary-400 focus:outline-none text-white placeholder:text-white/40 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setInput("I'm doing great today!")}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-colors disabled:opacity-50"
        >
          💪 Doing great
        </button>
        <button
          onClick={() => setInput("I'm struggling a bit today")}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-colors disabled:opacity-50"
        >
          😔 Struggling
        </button>
        <button
          onClick={() => setInput("Tell me about my progress")}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-colors disabled:opacity-50"
        >
          📊 My progress
        </button>
        <button
          onClick={() => setInput("What should I focus on today?")}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-colors disabled:opacity-50"
        >
          🎯 Today's focus
        </button>
      </div>
    </PremiumCard>
  )
}