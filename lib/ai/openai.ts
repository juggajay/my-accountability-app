import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const MODELS = {
  GPT4: 'gpt-4-turbo-preview',
  GPT35: 'gpt-3.5-turbo',
} as const

export async function generateCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  model: string = MODELS.GPT35,
  temperature: number = 0.7
) {
  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
    })

    return {
      success: true,
      content: completion.choices[0]?.message?.content || '',
      usage: completion.usage,
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function generateStreamingCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  model: string = MODELS.GPT35
) {
  const stream = await openai.chat.completions.create({
    model,
    messages,
    stream: true,
  })

  return stream
}