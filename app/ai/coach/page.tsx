'use client'

import { useState, useRef, useEffect } from 'react'
import { PremiumCard } from '@/components/ui/premium-card'
import { Button } from '@/components/ui/button'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI accountability coach. I'm here to support you with your goals, pain management, and healthy habits. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isSending) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsSending(true)

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }))

      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory,
        }),
      })

      const result = await response.json()

      if (result.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: result.response,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        console.error('Coach response failed:', result.error)
      }
    } catch (error) {
      console.error('Send error:', error)
    } finally {
      setIsSending(false)
    }
  }

  const QUICK_PROMPTS = [
    "How am I doing with my goals?",
    "I'm feeling discouraged today",
    "Help me stay motivated",
    "What patterns do you see in my data?",
  ]

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            AI Coach
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Your personal accountability partner
          </p>
        </div>

        <PremiumCard variant="glass" className="h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    msg.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      msg.role === 'user'
                        ? 'text-primary-100'
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
                  <div className="flex gap-1">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce delay-100">●</span>
                    <span className="animate-bounce delay-200">●</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="mb-4">
              <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                Quick prompts:
              </div>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(prompt)
                      setTimeout(() => handleSend(), 100)
                    }}
                    className="text-left text-sm p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type your message..."
              disabled={isSending}
              className="flex-1 px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
            />
            <Button onClick={handleSend} disabled={isSending || !input.trim()}>
              Send
            </Button>
          </div>
        </PremiumCard>
      </div>
    </div>
  )
}