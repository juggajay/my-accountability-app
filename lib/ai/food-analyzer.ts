/**
 * Food Photo Analyzer
 * Uses GPT-4 Vision to analyze food photos and estimate nutrition
 */

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface FoodAnalysisResult {
  foods: {
    name: string
    quantity: string
    confidence: number
  }[]
  mealDescription: string
  estimatedCalories: number
  estimatedMacros: {
    protein_g: number
    carbs_g: number
    fat_g: number
    fiber_g: number
  }
  healthScore: number // 1-10
  healthNotes: string
  suggestions: string[]
  confidence: number // overall confidence 0-1
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
}

/**
 * Analyze a food photo and extract nutrition information
 */
export async function analyzeFoodPhoto(imageBase64: string, additionalContext?: string): Promise<FoodAnalysisResult> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a nutrition expert analyzing food photos. Provide detailed, accurate nutritional estimates.

Your task:
1. Identify all foods in the image
2. Estimate portion sizes
3. Calculate calories and macros (protein, carbs, fat, fiber)
4. Assess overall healthiness (1-10 scale)
5. Provide actionable suggestions

Return JSON:
{
  "foods": [
    {
      "name": "grilled chicken breast",
      "quantity": "6 oz",
      "confidence": 0.9
    }
  ],
  "mealDescription": "Brief description of the meal",
  "estimatedCalories": 450,
  "estimatedMacros": {
    "protein_g": 45,
    "carbs_g": 30,
    "fat_g": 12,
    "fiber_g": 5
  },
  "healthScore": 8,
  "healthNotes": "Well-balanced meal with good protein and veggies",
  "suggestions": [
    "Add more colorful vegetables for extra nutrients",
    "Consider reducing portion size by 20% if weight loss is the goal"
  ],
  "confidence": 0.85,
  "mealType": "lunch"
}

Guidelines:
- Be realistic with portions (restaurant portions are usually larger)
- Consider cooking methods (fried adds calories, grilled is healthier)
- Account for hidden ingredients (butter, oil, sauces, cheese)
- Use USDA database-level accuracy when possible
- Confidence < 0.7 if food is unclear or portion is hard to estimate
- Health score factors: nutrition density, balance, processing level
- Suggestions should be practical and non-judgmental
- Infer meal type from foods if possible`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: additionalContext || 'Analyze this food photo and estimate nutrition.',
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
      max_tokens: 1000,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const result = JSON.parse(content) as FoodAnalysisResult

    // Validate and set defaults
    return {
      foods: result.foods || [],
      mealDescription: result.mealDescription || 'Meal',
      estimatedCalories: result.estimatedCalories || 0,
      estimatedMacros: {
        protein_g: result.estimatedMacros?.protein_g || 0,
        carbs_g: result.estimatedMacros?.carbs_g || 0,
        fat_g: result.estimatedMacros?.fat_g || 0,
        fiber_g: result.estimatedMacros?.fiber_g || 0,
      },
      healthScore: result.healthScore || 5,
      healthNotes: result.healthNotes || '',
      suggestions: result.suggestions || [],
      confidence: result.confidence || 0.5,
      mealType: result.mealType,
    }
  } catch (error) {
    console.error('Error analyzing food photo:', error)
    throw error
  }
}

/**
 * Quick calorie estimate from text description (fallback when no photo)
 */
export async function estimateCaloriesFromText(foodDescription: string): Promise<FoodAnalysisResult> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a nutrition expert. Estimate calories and macros from a text description of food.

Return JSON in the same format as food photo analysis.
Be conservative with estimates. Assume typical portions unless specified.`,
        },
        {
          role: 'user',
          content: `Estimate nutrition for: "${foodDescription}"`,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const result = JSON.parse(content) as FoodAnalysisResult

    return {
      foods: result.foods || [{ name: foodDescription, quantity: 'unknown', confidence: 0.5 }],
      mealDescription: foodDescription,
      estimatedCalories: result.estimatedCalories || 0,
      estimatedMacros: result.estimatedMacros || { protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 },
      healthScore: result.healthScore || 5,
      healthNotes: result.healthNotes || 'Estimated from text description',
      suggestions: result.suggestions || [],
      confidence: 0.6, // Lower confidence for text-only
      mealType: result.mealType,
    }
  } catch (error) {
    console.error('Error estimating calories from text:', error)
    throw error
  }
}

/**
 * Determine meal type from time of day
 */
export function inferMealType(timestamp: Date = new Date()): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
  const hour = timestamp.getHours()

  if (hour >= 5 && hour < 11) return 'breakfast'
  if (hour >= 11 && hour < 15) return 'lunch'
  if (hour >= 17 && hour < 22) return 'dinner'
  return 'snack'
}

/**
 * Generate friendly confirmation message
 */
export function generateFoodConfirmation(analysis: FoodAnalysisResult): string {
  const { mealDescription, estimatedCalories, healthScore, confidence } = analysis

  let message = `Looks like ${mealDescription}. `
  message += `~${estimatedCalories} cal `

  if (analysis.estimatedMacros.protein_g > 0) {
    message += `(P: ${Math.round(analysis.estimatedMacros.protein_g)}g, `
    message += `C: ${Math.round(analysis.estimatedMacros.carbs_g)}g, `
    message += `F: ${Math.round(analysis.estimatedMacros.fat_g)}g). `
  }

  // Health rating
  if (healthScore >= 8) {
    message += '💚 Healthy choice!'
  } else if (healthScore >= 6) {
    message += '👍 Pretty good!'
  } else if (healthScore >= 4) {
    message += '🟡 Could be healthier'
  } else {
    message += '⚠️ Not the healthiest option'
  }

  // Confidence disclaimer
  if (confidence < 0.7) {
    message += ' (rough estimate)'
  }

  message += '\n\nLog it?'

  return message
}