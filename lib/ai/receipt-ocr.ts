import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ReceiptItem {
  description: string
  amount: number
  category?: string
  quantity?: number
}

export interface ReceiptAnalysisResult {
  merchantName: string | null
  totalAmount: number
  date: string | null
  items: ReceiptItem[]
  detectedCategories: string[]
  confidence: number
  rawText?: string
  needsClarification: boolean
  clarificationQuestions?: string[]
}

export async function analyzeReceipt(
  imageBase64: string
): Promise<ReceiptAnalysisResult> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert receipt OCR analyzer. Extract all relevant information from receipts with high accuracy.

Your task:
1. Extract merchant name, total amount, date, and individual line items
2. Categorize spending (groceries, dining, shopping, transportation, entertainment, health, etc.)
3. Identify item descriptions and their amounts
4. Be precise with numbers - this is financial data
5. If information is unclear or missing, flag it for user confirmation

Return JSON with this exact structure:
{
  "merchantName": "Store name or null",
  "totalAmount": 0.00,
  "date": "YYYY-MM-DD or null",
  "items": [
    {"description": "item name", "amount": 0.00, "category": "category", "quantity": 1}
  ],
  "detectedCategories": ["primary category", "secondary category"],
  "confidence": 0.0-1.0,
  "needsClarification": false,
  "clarificationQuestions": ["Question 1?", "Question 2?"]
}

Categories to use:
- groceries: Food items, supermarkets
- dining: Restaurants, cafes, fast food
- shopping: Retail stores, clothing, electronics
- transportation: Gas, parking, uber, transit
- entertainment: Movies, concerts, games
- health: Pharmacy, medical, fitness
- bills: Utilities, subscriptions
- other: Miscellaneous

Be extremely careful with decimal points. If confidence is below 0.7, set needsClarification to true.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please analyze this receipt and extract all the information.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const result = JSON.parse(content) as ReceiptAnalysisResult

    // Validation
    if (result.totalAmount === undefined || result.totalAmount === null) {
      result.needsClarification = true
      result.clarificationQuestions = result.clarificationQuestions || []
      result.clarificationQuestions.push('What was the total amount on this receipt?')
    }

    if (!result.merchantName) {
      result.needsClarification = true
      result.clarificationQuestions = result.clarificationQuestions || []
      result.clarificationQuestions.push('Which store or merchant is this from?')
    }

    return result
  } catch (error) {
    console.error('Receipt OCR error:', error)

    // Return error state
    return {
      merchantName: null,
      totalAmount: 0,
      date: null,
      items: [],
      detectedCategories: ['other'],
      confidence: 0,
      needsClarification: true,
      clarificationQuestions: [
        'I had trouble reading this receipt. Could you tell me the merchant name and total amount?',
      ],
    }
  }
}

export function generateReceiptConfirmation(result: ReceiptAnalysisResult): string {
  if (result.needsClarification) {
    return `I scanned your receipt but need some clarification:\n${result.clarificationQuestions?.join('\n')}`
  }

  const dateStr = result.date ? ` on ${new Date(result.date).toLocaleDateString()}` : ''
  const merchant = result.merchantName || 'Unknown merchant'

  let message = `📝 Receipt logged: **${merchant}**${dateStr}\n`
  message += `💰 Total: $${result.totalAmount.toFixed(2)}\n`

  if (result.items.length > 0) {
    message += `\nItems:\n`
    result.items.slice(0, 5).forEach(item => {
      message += `• ${item.description} - $${item.amount.toFixed(2)}\n`
    })
    if (result.items.length > 5) {
      message += `• ... and ${result.items.length - 5} more items\n`
    }
  }

  if (result.confidence < 0.8) {
    message += `\n⚠️ Please verify the amounts above are correct.`
  }

  return message
}