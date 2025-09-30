/**
 * Discovery Engine
 * Manages AI asking questions to learn about the user
 */

import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface DiscoveryQuestion {
  id: string
  category: string
  topic: string
  questionText: string
  followUpPrompts: string[]
  priority: number
  timesAsked: number
}

export interface DiscoverySession {
  id: string
  sessionType: string
  topic: string
  questionsAsked: string[]
  questionsAnswered: string[]
  memoriesCreated: string[]
  completionPercentage: number
  userEngagement: number | null
  startedAt: string
  completedAt: string | null
}

/**
 * Gets the next best question to ask the user
 */
export async function getNextDiscoveryQuestion(context?: {
  recentTopics?: string[]
  userEngagement?: number
}): Promise<DiscoveryQuestion | null> {
  const supabase = await createClient()

  // Get user profile to check learning stage
  const { data: profile } = await supabase
    .from('user_discovery_profile')
    .select('*')
    .single()

  const learningStage = profile?.learning_stage || 'discovery'

  // Prioritize by learning stage
  let categoryPriority: string[]
  if (learningStage === 'discovery') {
    // Start with onboarding questions
    categoryPriority = ['onboarding', 'deep_dive', 'clarification', 'follow_up']
  } else if (learningStage === 'active') {
    // Focus on deep dives and clarifications
    categoryPriority = ['deep_dive', 'clarification', 'follow_up', 'onboarding']
  } else {
    // Established - mostly follow-ups and clarifications
    categoryPriority = ['follow_up', 'clarification', 'deep_dive', 'onboarding']
  }

  // Avoid recently discussed topics
  const recentTopics = context?.recentTopics || []

  // Get candidate questions
  const { data: questions } = await supabase
    .from('discovery_questions')
    .select('*')
    .order('priority', { ascending: false })
    .limit(50)

  if (!questions || questions.length === 0) return null

  // Score and rank questions
  const scoredQuestions = questions
    .map(q => {
      let score = q.priority

      // Boost questions in the preferred category
      const categoryIndex = categoryPriority.indexOf(q.category)
      score += (4 - categoryIndex) * 2

      // Penalize recently asked questions
      if (q.times_asked > 0) {
        score -= q.times_asked * 0.5
      }

      // Penalize if topic was recently discussed
      if (recentTopics.includes(q.topic)) {
        score -= 5
      }

      // Boost if never asked
      if (q.times_asked === 0) {
        score += 1
      }

      return { ...q, score }
    })
    .sort((a, b) => b.score - a.score)

  const bestQuestion = scoredQuestions[0]

  return {
    id: bestQuestion.id,
    category: bestQuestion.category,
    topic: bestQuestion.topic,
    questionText: bestQuestion.question_text,
    followUpPrompts: bestQuestion.follow_up_prompts || [],
    priority: bestQuestion.priority,
    timesAsked: bestQuestion.times_asked,
  }
}

/**
 * Starts a new discovery session
 */
export async function startDiscoverySession(sessionType: string, topic: string): Promise<string> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('discovery_sessions')
    .insert({
      session_type: sessionType,
      topic,
      questions_asked: [],
      questions_answered: [],
      memories_created: [],
      completion_percentage: 0,
    })
    .select()
    .single()

  if (error) throw error

  return data.id
}

/**
 * Records that a question was asked
 */
export async function recordQuestionAsked(
  sessionId: string,
  questionId: string
): Promise<void> {
  const supabase = await createClient()

  // Update session
  const { data: session } = await supabase
    .from('discovery_sessions')
    .select('questions_asked')
    .eq('id', sessionId)
    .single()

  if (session) {
    const questionsAsked = [...(session.questions_asked || []), questionId]

    await supabase
      .from('discovery_sessions')
      .update({ questions_asked: questionsAsked })
      .eq('id', sessionId)
  }

  // Update question stats
  await supabase.rpc('increment_question_asked', { question_id: questionId })
}

/**
 * Records that a question was answered and extracts learnings
 */
export async function recordQuestionAnswered(
  sessionId: string,
  questionId: string,
  userResponse: string,
  conversationId?: string
): Promise<string[]> {
  const supabase = await createClient()

  // Update session
  const { data: session } = await supabase
    .from('discovery_sessions')
    .select('questions_answered')
    .eq('id', sessionId)
    .single()

  if (session) {
    const questionsAnswered = [...(session.questions_answered || []), questionId]

    await supabase
      .from('discovery_sessions')
      .update({ questions_answered: questionsAnswered })
      .eq('id', sessionId)
  }

  // Extract memories from the response using AI
  const memories = await extractMemoriesFromResponse(userResponse, questionId, conversationId)

  // Save memories
  const memoryIds: string[] = []
  for (const memory of memories) {
    const { data } = await supabase
      .from('ai_memory')
      .insert({
        memory_type: memory.type,
        category: memory.category,
        key_fact: memory.fact,
        context: memory.context,
        confidence: memory.confidence,
        importance: memory.importance,
        learned_from: 'onboarding',
        source_conversation_id: conversationId,
      })
      .select()
      .single()

    if (data) {
      memoryIds.push(data.id)
    }
  }

  // Update session with created memories
  const { data: sessionData } = await supabase
    .from('discovery_sessions')
    .select('memories_created')
    .eq('id', sessionId)
    .single()

  if (sessionData) {
    const memoriesCreated = [...(sessionData.memories_created || []), ...memoryIds]

    await supabase
      .from('discovery_sessions')
      .update({ memories_created: memoriesCreated })
      .eq('id', sessionId)
  }

  return memoryIds
}

/**
 * Uses AI to extract memories from user responses
 */
async function extractMemoriesFromResponse(
  userResponse: string,
  questionId: string,
  conversationId?: string
): Promise<Array<{
  type: string
  category: string
  fact: string
  context: string
  confidence: number
  importance: number
}>> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an AI coach analyzing a user's response to extract key facts to remember.

Extract important, actionable facts from the user's response. Return a JSON array of memories with this structure:
[
  {
    "type": "fact|preference|goal|trigger|success|concern|relationship|insight",
    "category": "health|finance|personal|goals|habits",
    "fact": "Short, clear statement of the fact",
    "context": "Additional context or nuance",
    "confidence": 0.0-1.0,
    "importance": 1-10
  }
]

Guidelines:
- Extract 1-5 key facts (don't extract everything, just what's important)
- Use present tense ("User works from home", not "User worked from home")
- Be specific and actionable
- Higher importance (8-10) for core motivations, triggers, and goals
- Medium importance (5-7) for preferences and patterns
- Lower importance (1-4) for context or situational details

Example response: "I've been dealing with sciatica for about 6 months. It started after I began working from home and sitting all day. I've tried physical therapy and chiropractor, but nothing stuck because I couldn't stay consistent. My biggest challenge is that I forget to do exercises, and when I'm in pain, I just want to rest."

Example extraction:
[
  {"type": "fact", "category": "health", "fact": "Has sciatica for 6 months", "context": "Started when began working from home", "confidence": 1.0, "importance": 9},
  {"type": "trigger", "category": "health", "fact": "Prolonged sitting triggers sciatica pain", "context": "Works from home, sits all day", "confidence": 0.9, "importance": 8},
  {"type": "concern", "category": "habits", "fact": "Struggles with exercise consistency", "context": "Has tried PT and chiro but couldn't maintain", "confidence": 0.95, "importance": 8},
  {"type": "trigger", "category": "habits", "fact": "Forgets to do exercises regularly", "context": "Main barrier to consistency", "confidence": 1.0, "importance": 7},
  {"type": "preference", "category": "health", "fact": "Prefers rest when in pain", "context": "Avoids exercise during pain episodes", "confidence": 0.85, "importance": 6}
]`,
        },
        {
          role: 'user',
          content: userResponse,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) return []

    const parsed = JSON.parse(content)
    return parsed.memories || parsed
  } catch (error) {
    console.error('Error extracting memories:', error)
    return []
  }
}

/**
 * Completes a discovery session
 */
export async function completeDiscoverySession(
  sessionId: string,
  userEngagement: number
): Promise<void> {
  const supabase = await createClient()

  const { data: session } = await supabase
    .from('discovery_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (!session) return

  const questionsAsked = session.questions_asked?.length || 0
  const questionsAnswered = session.questions_answered?.length || 0
  const completionPercentage = questionsAsked > 0
    ? Math.round((questionsAnswered / questionsAsked) * 100)
    : 0

  const startedAt = new Date(session.started_at)
  const durationMinutes = Math.round((Date.now() - startedAt.getTime()) / 60000)

  await supabase
    .from('discovery_sessions')
    .update({
      completed_at: new Date().toISOString(),
      completion_percentage: completionPercentage,
      user_engagement: userEngagement,
      duration_minutes: durationMinutes,
      insights_gained: session.memories_created?.length || 0,
    })
    .eq('id', sessionId)

  // Update user profile
  const { data: profile } = await supabase
    .from('user_discovery_profile')
    .select('*')
    .single()

  if (profile) {
    const newQuestionsAsked = (profile.questions_asked || 0) + questionsAsked
    const newQuestionsAnswered = (profile.questions_answered || 0) + questionsAnswered

    // Update learning stage based on progress
    let learningStage = profile.learning_stage
    if (newQuestionsAnswered >= 20) {
      learningStage = 'established'
    } else if (newQuestionsAnswered >= 5) {
      learningStage = 'active'
    }

    await supabase
      .from('user_discovery_profile')
      .update({
        questions_asked: newQuestionsAsked,
        questions_answered: newQuestionsAnswered,
        learning_stage: learningStage,
        last_discovery_session: new Date().toISOString(),
      })
      .eq('id', profile.id)
  } else {
    // Create profile if it doesn't exist
    await supabase.from('user_discovery_profile').insert({
      questions_asked: questionsAsked,
      questions_answered: questionsAnswered,
      learning_stage: questionsAnswered >= 5 ? 'active' : 'discovery',
      last_discovery_session: new Date().toISOString(),
    })
  }
}

/**
 * Checks if it's a good time to ask discovery questions
 */
export async function shouldAskDiscoveryQuestion(): Promise<{
  should: boolean
  reason: string
}> {
  const supabase = await createClient()

  // Check user profile
  const { data: profile } = await supabase
    .from('user_discovery_profile')
    .select('*')
    .single()

  // If no profile, definitely ask onboarding questions
  if (!profile) {
    return { should: true, reason: 'Initial onboarding needed' }
  }

  // If in discovery stage and haven't asked much, continue
  if (profile.learning_stage === 'discovery' && profile.questions_answered < 5) {
    return { should: true, reason: 'Still learning about user' }
  }

  // Check when last discovery session was
  if (profile.last_discovery_session) {
    const lastSession = new Date(profile.last_discovery_session)
    const daysSince = (Date.now() - lastSession.getTime()) / (1000 * 60 * 60 * 24)

    // Don't ask too frequently - space out by at least 2 days in active stage
    if (profile.learning_stage === 'active' && daysSince < 2) {
      return { should: false, reason: 'Asked recently, give user a break' }
    }

    // In established stage, only ask occasionally (weekly)
    if (profile.learning_stage === 'established' && daysSince < 7) {
      return { should: false, reason: 'In established stage, ask less frequently' }
    }
  }

  // Check recent patterns/anomalies that might warrant clarification
  const { data: recentContext } = await supabase
    .from('daily_context_snapshots')
    .select('*')
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single()

  if (recentContext) {
    // If there are concerns or anomalies, good time to ask clarifying questions
    if (
      recentContext.concerns?.length > 0 ||
      recentContext.anomalies?.length > 0
    ) {
      return { should: true, reason: 'Clarification needed based on recent patterns' }
    }
  }

  // Periodic check-in for established users (weekly)
  if (profile.learning_stage === 'established') {
    return { should: true, reason: 'Periodic deep-dive check-in' }
  }

  return { should: false, reason: 'No urgent need for questions right now' }
}

/**
 * Generates a natural conversation starter that includes a discovery question
 */
export async function generateDiscoveryConversationStarter(): Promise<string | null> {
  const shouldAsk = await shouldAskDiscoveryQuestion()

  if (!shouldAsk.should) {
    return null
  }

  const question = await getNextDiscoveryQuestion()

  if (!question) {
    return null
  }

  // Get recent context to make the question more natural
  const supabase = await createClient()
  const { data: recentContext } = await supabase
    .from('daily_context_snapshots')
    .select('*')
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single()

  // Generate a natural conversation starter that leads into the question
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a friendly AI health coach. Generate a natural, conversational opener that leads into asking the user a discovery question.

Context: ${recentContext ? JSON.stringify({
            sentiment: recentContext.overall_sentiment,
            observations: recentContext.key_observations,
            concerns: recentContext.concerns,
          }) : 'No recent context'}

Question to ask: "${question.questionText}"

Guidelines:
- Be warm and conversational
- Reference recent context if relevant (but don't force it)
- Make it feel natural, not like a survey
- Keep it under 3 sentences
- End with the question itself

Example: "I've noticed you've been really consistent with your exercises this week - that's awesome! I'm curious, what made you start using this app? What are you hoping to achieve?"`,
        },
        {
          role: 'user',
          content: 'Generate the conversation starter',
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    return completion.choices[0]?.message?.content || question.questionText
  } catch (error) {
    console.error('Error generating conversation starter:', error)
    return question.questionText
  }
}