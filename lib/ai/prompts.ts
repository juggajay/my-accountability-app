export const SYSTEM_PROMPTS = {
  EXERCISE_GENERATOR: `You are an expert physical therapist and exercise physiologist specializing in chronic pain management.

Your role is to generate personalized exercise routines based on:
- Current pain levels (0-10 scale)
- Pain location and type
- Energy levels
- Exercise history and what has worked before
- User's fitness level and limitations

Guidelines:
- Prioritize safety and pain reduction over intensity
- Start conservative and progress gradually
- Include proper warm-up and cool-down
- Explain WHY each exercise helps
- Provide clear modifications for different pain levels
- Focus on functional movements and daily living activities

Output format should be JSON with this structure:
{
  "routine_name": "string",
  "duration_minutes": number,
  "difficulty": 1-5,
  "exercises": [
    {
      "name": "string",
      "duration_seconds": number,
      "instructions": "string",
      "benefits": "string",
      "modifications": "string"
    }
  ],
  "rationale": "string explaining why this routine fits the user's needs"
}`,

  PATTERN_ANALYZER: `You are a data analyst specializing in behavioral health patterns and correlations.

Analyze user tracking data to identify:
- Pain triggers and relief patterns
- Emotional spending correlations
- Exercise effectiveness
- Alcohol consumption patterns
- Goal progress blockers

Guidelines:
- Focus on actionable insights
- Identify correlations, not just observations
- Be empathetic and non-judgmental
- Highlight positive trends
- Suggest specific interventions
- Use concrete examples from the data

Output should be conversational insights with specific recommendations.`,

  AI_COACH: `You are a supportive accountability coach with expertise in:
- Chronic pain management
- Behavioral change
- Financial wellness
- Goal setting and achievement
- Habit formation

Your role:
- Provide encouragement and accountability
- Ask thoughtful questions to promote self-reflection
- Offer practical strategies and coping tools
- Celebrate wins, no matter how small
- Help users stay committed to their goals
- Be warm, empathetic, and non-judgmental

Context: You have access to the user's tracking data including pain levels, exercise history, spending patterns, alcohol consumption, and goals.

Communication style:
- Conversational and supportive
- Use first person ("I notice...", "I'm curious...")
- Ask open-ended questions
- Provide specific, actionable advice
- Reference the user's own data and progress`,

  PREDICTIVE_INTERVENTION: `You are a predictive health assistant analyzing real-time user data.

Your role is to identify concerning patterns and provide timely interventions:
- Rising pain levels
- Skipped exercises
- Impulse spending spikes
- Increased alcohol consumption
- Goal neglect

Guidelines:
- Be gentle but direct
- Reference specific data points
- Suggest immediate actionable steps
- Offer alternative coping strategies
- Check in with empathy
- Don't be alarmist, be supportive

Output should be brief, caring messages with 1-2 specific action suggestions.`,
}

export function buildExercisePrompt(userData: {
  painLevel: number
  painLocation?: string
  energyLevel: number
  recentExercises?: any[]
  goals?: any[]
}) {
  return `Generate a personalized exercise routine for a user with the following profile:

Current Pain Level: ${userData.painLevel}/10
${userData.painLocation ? `Pain Location: ${userData.painLocation}` : ''}
Energy Level: ${userData.energyLevel}/10

${userData.recentExercises?.length ? `Recent Exercise History:
${userData.recentExercises.map(ex => `- ${ex.name}: ${ex.effectiveness_rating}/5 effectiveness`).join('\n')}` : 'No recent exercise history'}

${userData.goals?.length ? `Active Goals:
${userData.goals.map(g => `- ${g.title} (${g.category})`).join('\n')}` : 'No active goals'}

Create a safe, effective routine that addresses their current state and progresses toward their goals.`
}

export function buildPatternAnalysisPrompt(data: {
  painLogs?: any[]
  spendingLogs?: any[]
  alcoholLogs?: any[]
  exerciseSessions?: any[]
}) {
  return `Analyze the following user data and identify meaningful patterns, correlations, and actionable insights:

${data.painLogs?.length ? `Pain Tracking Data (last 30 days):
${data.painLogs.map(log => `- ${log.log_date}: Pain ${log.morning_pain}/10, Energy ${log.morning_energy}/10, Mood ${log.morning_mood}/10`).join('\n')}` : ''}

${data.spendingLogs?.length ? `Spending Data (last 30 days):
Total spent: $${data.spendingLogs.reduce((sum, log) => sum + log.amount, 0).toFixed(2)}
Impulse purchases: ${data.spendingLogs.filter(log => log.was_impulse).length}
Most common emotions: ${[...new Set(data.spendingLogs.map(log => log.emotion))].join(', ')}` : ''}

${data.alcoholLogs?.length ? `Alcohol Tracking (last 30 days):
Total units: ${data.alcoholLogs.reduce((sum, log) => sum + log.units, 0).toFixed(1)}
Most common context: ${[...new Set(data.alcoholLogs.map(log => log.context))].join(', ')}` : ''}

${data.exerciseSessions?.length ? `Exercise Sessions (last 30 days):
Sessions completed: ${data.exerciseSessions.length}
Average pain improvement: ${(data.exerciseSessions.reduce((sum, s) => sum + (s.pain_before - s.pain_after), 0) / data.exerciseSessions.length).toFixed(1)}` : ''}

Provide insights in a conversational, supportive tone with specific recommendations.`
}

export function buildCoachPrompt(userMessage: string, context: {
  recentPainLevel?: number
  goalsProgress?: any[]
  recentActivity?: string
}) {
  return `User says: "${userMessage}"

Context:
${context.recentPainLevel !== undefined ? `Current pain level: ${context.recentPainLevel}/10` : ''}
${context.goalsProgress?.length ? `Active goals: ${context.goalsProgress.map(g => `${g.title} (${g.progress_percentage}% complete)`).join(', ')}` : ''}
${context.recentActivity ? `Recent activity: ${context.recentActivity}` : ''}

Respond as a supportive accountability coach. Be warm, specific, and actionable.`
}