'use client'

import { useState } from 'react'
import { AIConversationCard } from '@/components/ai/AIConversationCard'
import { NutritionDashboard } from '@/components/nutrition/NutritionDashboard'
import { PremiumCard } from '@/components/ui/PremiumCard'
import {
  Brain,
  Apple,
  DollarSign,
  Activity,
  Target,
  TrendingUp,
  ChevronRight
} from 'lucide-react'

type Tab = 'ai' | 'nutrition' | 'spending' | 'health' | 'goals'

export function AIFirstLayout() {
  const [activeTab, setActiveTab] = useState<Tab>('ai')

  const tabs = [
    { id: 'ai' as Tab, name: 'AI Assistant', icon: Brain, color: 'from-purple-500 to-pink-500' },
    { id: 'nutrition' as Tab, name: 'Nutrition', icon: Apple, color: 'from-orange-500 to-red-500' },
    { id: 'spending' as Tab, name: 'Spending', icon: DollarSign, color: 'from-green-500 to-emerald-500' },
    { id: 'health' as Tab, name: 'Health', icon: Activity, color: 'from-blue-500 to-cyan-500' },
    { id: 'goals' as Tab, name: 'Goals', icon: Target, color: 'from-yellow-500 to-amber-500' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Hey there! 👋
          </h1>
          <p className="text-white/60">
            I'm your AI assistant. Tell me anything or ask me questions!
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white shadow-lg shadow-white/5'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'ai' && (
            <>
              <AIConversationCard />
              <QuickActions />
            </>
          )}

          {activeTab === 'nutrition' && <NutritionDashboard />}

          {activeTab === 'spending' && <SpendingView />}

          {activeTab === 'health' && <HealthView />}

          {activeTab === 'goals' && <GoalsView />}
        </div>
      </div>
    </div>
  )
}

function QuickActions() {
  const actions = [
    {
      title: 'Log a meal',
      description: 'Take a photo or describe what you ate',
      icon: Apple,
      prompt: 'I just had ',
      color: 'from-orange-500/20 to-red-500/20',
      iconColor: 'text-orange-400',
    },
    {
      title: 'Log spending',
      description: 'Upload a receipt or tell me what you bought',
      icon: DollarSign,
      prompt: 'I spent $',
      color: 'from-green-500/20 to-emerald-500/20',
      iconColor: 'text-green-400',
    },
    {
      title: 'Track exercise',
      description: 'Log your workout or activity',
      icon: Activity,
      prompt: 'I just did ',
      color: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-400',
    },
    {
      title: 'Check my progress',
      description: 'See insights about your health and habits',
      icon: TrendingUp,
      prompt: 'How am I doing with ',
      color: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-400',
    },
  ]

  return (
    <PremiumCard>
      <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.title}
            className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0`}>
                <action.icon className={`w-5 h-5 ${action.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white mb-1">{action.title}</h4>
                <p className="text-xs text-white/60">{action.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors flex-shrink-0" />
            </div>
          </button>
        ))}
      </div>
    </PremiumCard>
  )
}

function SpendingView() {
  return (
    <PremiumCard>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Spending Tracker</h2>
          <p className="text-sm text-white/60">Upload receipts or log purchases</p>
        </div>
      </div>
      <div className="text-center py-12">
        <p className="text-white/60">
          Try: "I spent $50 on groceries" or upload a receipt photo
        </p>
      </div>
    </PremiumCard>
  )
}

function HealthView() {
  return (
    <PremiumCard>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
          <Activity className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Health Tracking</h2>
          <p className="text-sm text-white/60">Log pain, exercise, and wellness</p>
        </div>
      </div>
      <div className="text-center py-12">
        <p className="text-white/60">
          Try: "Pain level 7 in lower back" or "Just did a 30-minute run"
        </p>
      </div>
    </PremiumCard>
  )
}

function GoalsView() {
  return (
    <PremiumCard>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center">
          <Target className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Goals & Progress</h2>
          <p className="text-sm text-white/60">Track your achievements</p>
        </div>
      </div>
      <div className="text-center py-12">
        <p className="text-white/60">
          Ask me: "What are my goals?" or "How am I progressing?"
        </p>
      </div>
    </PremiumCard>
  )
}