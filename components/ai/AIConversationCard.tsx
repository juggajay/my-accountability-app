'use client'

/**
 * AI Conversation Card
 * Main feature on dashboard - AI greets user, asks questions, builds profile
 */

import { useState, useEffect, useRef } from 'react'
import { PremiumCard } from '@/components/ui/premium-card'
import { Sparkles, Send, Loader2, MessageCircle, Camera, Image as ImageIcon } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
}

export function AIConversationCard() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load initial greeting on mount
  useEffect(() => {
    loadInitialGreeting()
  }, [])

  const loadInitialGreeting = async () => {
    try {
      // Always start fresh conversation - AI remembers via memory system
      // Get conversation starter (may include discovery questions based on context)
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
            content: "Hey! How are you doing today?",
          },
        ])
      }
    } catch (error) {
      console.error('Error loading greeting:', error)
      setMessages([
        {
          role: 'assistant',
          content: "Hey! How are you doing today?",
        },
      ])
    } finally {
      setInitializing(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setSelectedImage(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || loading) return

    const userMessage = input.trim() || '[Photo sent]'
    const imageToSend = selectedImage

    setInput('')
    setSelectedImage(null)
    setLoading(true)

    // Add user message
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage, imageUrl: imageToSend || undefined },
    ]
    setMessages(newMessages)

    try {
      // If image, use universal input API
      if (imageToSend) {
        // Extract base64 without data URL prefix
        const base64Data = imageToSend.split(',')[1]

        const response = await fetch('/api/ai/universal-input', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: userMessage !== '[Photo sent]' ? userMessage : undefined,
            imageBase64: base64Data,
            imageType: 'meal',
          }),
        })

        const data = await response.json()

        if (data.success) {
          setMessages([
            ...newMessages,
            { role: 'assistant', content: data.message },
          ])
        } else {
          throw new Error(data.error || 'Failed to analyze photo')
        }
      } else {
        // Text only - use universal input or coach
        const response = await fetch('/api/ai/universal-input', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: userMessage }),
        })

        const data = await response.json()

        if (data.success) {
          // If it's conversational, use coach API
          if (data.action === 'conversational') {
            const coachResponse = await fetch('/api/ai/coach', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: userMessage,
                conversationHistory: messages,
              }),
            })

            const coachData = await coachResponse.json()
            if (coachData.success && coachData.response) {
              setMessages([
                ...newMessages,
                { role: 'assistant', content: coachData.response },
              ])
            }
          } else {
            // Direct command response
            setMessages([
              ...newMessages,
              { role: 'assistant', content: data.message },
            ])
          }
        } else {
          throw new Error(data.error || 'Failed to get response')
        }
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

      {/* Messages - Show only last 6 messages to keep it concise */}
      <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
        {messages.slice(-6).map((message, index) => (
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
              {message.imageUrl && (
                <img
                  src={message.imageUrl}
                  alt="Uploaded"
                  className="rounded-lg mb-2 max-w-full h-auto max-h-48 object-cover"
                />
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
      <div className="space-y-2">
        {/* Image Preview */}
        {selectedImage && (
          <div className="relative inline-block">
            <img
              src={selectedImage}
              alt="Selected"
              className="rounded-lg max-h-32 object-cover"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50"
            title="Upload photo"
          >
            <Camera className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type or upload a photo..."
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 focus:border-primary-400 focus:outline-none text-white placeholder:text-white/40 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={(!input.trim() && !selectedImage) || loading}
            className="px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
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