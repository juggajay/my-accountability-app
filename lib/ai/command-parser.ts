/**
 * Natural Language Command Parser
 * Converts conversational input into structured actions
 */

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ParsedCommand {
  intent: 'log_spending' | 'log_food' | 'log_pain' | 'log_exercise' | 'log_alcohol' | 'log_goal_work' | 'log_mood' | 'ask_question' | 'get_advice' | 'analyze_photo' | 'unknown'
  confidence: number
  entities: Record<string, any>
  ambiguities: string[]
  suggestedClarification?: string
  rawInput: string
}

export interface MultiIntent {
  commands: ParsedCommand[]
  summary: string
}

/**
 * Parse natural language input into structured commands
 */
export async function parseCommand(input: string): Promise<ParsedCommand | MultiIntent> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a command parser for a personal life assistant app. Extract structured actions from natural language.

User can log:
- Spending: amount, description, category (food, shopping, entertainment, bills, etc.), emotion, was_impulse
- Food: meal_type, description, estimated_calories, estimated_macros
- Pain: level (0-10), location, notes
- Exercise: type, duration_minutes, intensity, notes
- Alcohol: drink_type, units, context (social, stress, celebration, etc.)
- Goal work: goal_name, duration_minutes, progress_made, blockers
- Mood: emotion, notes

Return JSON:
{
  "intent": "log_spending|log_food|log_pain|log_exercise|log_alcohol|log_goal_work|log_mood|ask_question|get_advice|unknown",
  "confidence": 0.0-1.0,
  "entities": {
    // Intent-specific fields
    // For spending: { "amount": 100, "description": "shoes", "category": "shopping", "was_impulse": true }
    // For food: { "meal_type": "lunch", "description": "chicken salad", "estimated_calories": 450 }
    // For pain: { "level": 7, "location": "lower back" }
    // For exercise: { "type": "yoga", "duration_minutes": 30 }
  },
  "ambiguities": ["things that need clarification"],
  "suggestedClarification": "question to ask user for missing info",
  "rawInput": "original input"
}

For multiple intents in one message, return:
{
  "commands": [array of ParsedCommand objects],
  "summary": "brief summary of all intents"
}

Examples:
"I spent $100 on shoes" → log_spending, amount=100, description="shoes", category="shopping"
"Had pizza for lunch" → log_food, meal_type="lunch", description="pizza", estimated_calories=~800
"My back hurts, level 7" → log_pain, level=7, location="back"
"Did 30 minutes of yoga" → log_exercise, type="yoga", duration_minutes=30
"Had 2 beers at a bar" → log_alcohol, drink_type="beer", units=2, context="social"
"Rough day, pain at 8, drank 2 beers" → MULTI-INTENT
"What should I eat?" → ask_question
"I'm feeling stressed" → log_mood, emotion="stressed"

Be smart about:
- Implied categories (Starbucks → food, Costco → groceries, Amazon → shopping)
- Emotional state from tone ("ugh" = stressed, "yay!" = happy)
- Impulse detection ("impulse bought", "splurged", "treated myself" = was_impulse: true)
- Context clues (time of day → meal_type, "at gym" → exercise)`,
        },
        {
          role: 'user',
          content: input,
        },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      return createUnknownCommand(input)
    }

    const parsed = JSON.parse(content)

    // Check if it's multi-intent
    if (parsed.commands && Array.isArray(parsed.commands)) {
      return {
        commands: parsed.commands.map((cmd: any) => ({
          ...cmd,
          rawInput: input,
        })),
        summary: parsed.summary || 'Multiple actions detected',
      }
    }

    // Single intent
    return {
      intent: parsed.intent || 'unknown',
      confidence: parsed.confidence || 0.5,
      entities: parsed.entities || {},
      ambiguities: parsed.ambiguities || [],
      suggestedClarification: parsed.suggestedClarification,
      rawInput: input,
    }
  } catch (error) {
    console.error('Error parsing command:', error)
    return createUnknownCommand(input)
  }
}

function createUnknownCommand(input: string): ParsedCommand {
  return {
    intent: 'unknown',
    confidence: 0,
    entities: {},
    ambiguities: ['Unable to parse command'],
    suggestedClarification: 'Could you rephrase that? I can help you log spending, food, pain, exercise, alcohol, or goals.',
    rawInput: input,
  }
}

/**
 * Quick check if input is likely a command vs casual conversation
 */
export function isCommand(input: string): boolean {
  const commandKeywords = [
    // Spending
    'spent', 'bought', 'purchased', 'paid', '$', 'cost', 'price',
    // Food
    'ate', 'had', 'eating', 'meal', 'lunch', 'dinner', 'breakfast', 'snack',
    // Pain
    'pain', 'hurts', 'ache', 'sore', 'level',
    // Exercise
    'exercise', 'workout', 'yoga', 'gym', 'ran', 'walked', 'minutes',
    // Alcohol
    'beer', 'wine', 'drink', 'drank', 'shots', 'cocktail',
    // Mood
    'feeling', 'stressed', 'happy', 'sad', 'anxious', 'tired',
    // Goals
    'worked on', 'progress', 'completed', 'goal',
  ]

  const lowerInput = input.toLowerCase()
  return commandKeywords.some(keyword => lowerInput.includes(keyword))
}

/**
 * Extract confidence level from parsed result
 */
export function shouldConfirm(parsed: ParsedCommand): boolean {
  // Confirm if:
  // 1. Low confidence (<0.7)
  // 2. Has ambiguities
  // 3. High-impact actions (spending >$50)

  if (parsed.confidence < 0.7) return true
  if (parsed.ambiguities.length > 0) return true

  if (parsed.intent === 'log_spending' && parsed.entities.amount > 50) {
    return true
  }

  return false
}