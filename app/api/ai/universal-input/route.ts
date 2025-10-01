/**
 * Universal Input API
 * Handles both text commands and photo uploads
 * Routes to appropriate logging functions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseCommand, isCommand } from '@/lib/ai/command-parser'
import { analyzeFoodPhoto, estimateCaloriesFromText, inferMealType, generateFoodConfirmation } from '@/lib/ai/food-analyzer'
import { analyzeReceipt, generateReceiptConfirmation } from '@/lib/ai/receipt-ocr'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { input, imageBase64, imageType } = body

    // Handle photo input
    if (imageBase64) {
      return await handlePhotoInput(supabase, imageBase64, imageType, input)
    }

    // Handle text input
    if (input) {
      return await handleTextInput(supabase, input)
    }

    return NextResponse.json(
      { success: false, error: 'No input provided' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Universal input error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * Handle photo uploads (food, receipts, etc.)
 */
async function handlePhotoInput(
  supabase: any,
  imageBase64: string,
  imageType: string,
  additionalContext?: string
) {
  // Determine photo type based on context or use AI classification
  const photoType = await classifyPhotoType(imageBase64, additionalContext)

  if (photoType === 'receipt') {
    // Analyze receipt
    const analysis = await analyzeReceipt(imageBase64)

    if (analysis.needsClarification) {
      return NextResponse.json({
        success: true,
        action: 'request_clarification',
        message: generateReceiptConfirmation(analysis),
        data: {
          analysis,
          clarificationNeeded: true,
        },
      })
    }

    // Store receipt in photo archive
    const { data: photoRecord } = await supabase
      .from('photo_archive')
      .insert({
        photo_type: 'receipt',
        photo_url: `data:image/jpeg;base64,${imageBase64}`,
        analysis_results: analysis,
        searchable_text: analysis.merchantName || '',
        uploaded_at: new Date().toISOString(),
      })
      .select()
      .single()

    // Log spending entry
    const { error } = await supabase.from('spending_logs').insert({
      amount: analysis.totalAmount,
      category: analysis.detectedCategories[0] || 'other',
      description: `${analysis.merchantName || 'Purchase'} (from receipt)`,
      merchant: analysis.merchantName,
      logged_at: new Date().toISOString(),
    })

    if (error) throw error

    return NextResponse.json({
      success: true,
      action: 'receipt_logged',
      message: generateReceiptConfirmation(analysis),
      data: { analysis },
    })
  }

  if (photoType === 'meal') {
    try {
      // Analyze food photo
      console.log('Starting food photo analysis...')
      const analysis = await analyzeFoodPhoto(imageBase64, additionalContext)
      console.log('Analysis complete:', JSON.stringify(analysis, null, 2))

      // Skip photo archiving for now - focus on food log
      console.log('Skipping photo archive (not critical for meal logging)')

      // Save food log to database
      console.log('Saving food log...')
      const logEntry = {
        meal_type: analysis.mealType || inferMealType(),
        description: analysis.mealDescription,
        calories: analysis.estimatedCalories,
        protein_g: analysis.estimatedMacros.protein_g,
        carbs_g: analysis.estimatedMacros.carbs_g,
        fat_g: analysis.estimatedMacros.fat_g,
        fiber_g: analysis.estimatedMacros.fiber_g,
        health_score: analysis.healthScore,
        confidence: analysis.confidence,
        estimation_source: 'ai',
        logged_at: new Date().toISOString(),
      }

      const { data: savedLog, error } = await supabase
        .from('food_logs')
        .insert(logEntry)
        .select()
        .single()

      if (error) {
        console.error('Error saving food log:', error)
        throw new Error(`Food log save failed: ${error.message}`)
      }
      console.log('Food log saved successfully')

      // Photo archiving skipped for now

      // Generate confirmation message
      const confirmationMessage = generateFoodConfirmation(analysis)

      // Return success with saved log
      return NextResponse.json({
        success: true,
        action: 'food_logged',
        message: confirmationMessage,
        data: {
          analysis,
          logEntry: savedLog,
        },
      })
    } catch (error: any) {
      console.error('Error in meal photo processing:', error)
      return NextResponse.json({
        success: false,
        error: `Failed to process meal photo: ${error.message}`,
      }, { status: 500 })
    }
  }

  // Other photo types (receipt, body, etc.) can be added here

  return NextResponse.json({
    success: false,
    error: 'Photo type not yet supported',
  })
}

/**
 * Handle text input (natural language commands)
 */
async function handleTextInput(supabase: any, input: string) {
  // Check if it's likely a command
  if (!isCommand(input)) {
    // Just conversational - pass to coach
    return NextResponse.json({
      success: true,
      action: 'conversational',
      message: 'Let me think about that...',
      data: { input },
    })
  }

  // Parse the command
  const parsed = await parseCommand(input)

  // Handle multi-intent
  if ('commands' in parsed) {
    return NextResponse.json({
      success: true,
      action: 'multi_intent',
      message: `I detected multiple actions: ${parsed.summary}. Let me handle them one by one.`,
      data: { commands: parsed.commands },
    })
  }

  // Handle single intent
  switch (parsed.intent) {
    case 'log_spending':
      return await handleSpendingLog(supabase, parsed)

    case 'log_food':
      return await handleFoodLog(supabase, parsed)

    case 'log_pain':
      return await handlePainLog(supabase, parsed)

    case 'log_exercise':
      return await handleExerciseLog(supabase, parsed)

    case 'log_alcohol':
      return await handleAlcoholLog(supabase, parsed)

    case 'log_mood':
      return await handleMoodLog(supabase, parsed)

    case 'ask_question':
    case 'get_advice':
      return NextResponse.json({
        success: true,
        action: 'conversational',
        message: 'Let me help you with that...',
        data: { input, parsed },
      })

    case 'unknown':
    default:
      return NextResponse.json({
        success: true,
        action: 'clarification_needed',
        message: parsed.suggestedClarification || 'I\'m not sure what you mean. Could you rephrase that?',
        data: { parsed },
      })
  }
}

/**
 * Handle spending log command
 */
async function handleSpendingLog(supabase: any, parsed: any) {
  const { amount, description, category, was_impulse, emotion } = parsed.entities

  // Check if we need clarification
  if (!amount || !description) {
    return NextResponse.json({
      success: true,
      action: 'clarification_needed',
      message: parsed.suggestedClarification || 'How much did you spend and on what?',
      data: { parsed },
    })
  }

  // Insert spending log
  const { data, error } = await supabase.from('spending_logs').insert({
    amount,
    description,
    category: category || 'other',
    was_impulse: was_impulse || false,
    emotion: emotion || null,
  }).select().single()

  if (error) throw error

  // Generate confirmation
  let message = `✓ Logged $${amount} for ${description}`
  if (category) message += ` (${category})`
  if (was_impulse) message += ` - impulse purchase noted`

  // Add insight if over budget or frequent impulse
  const { count } = await supabase
    .from('spending_logs')
    .select('*', { count: 'exact', head: true })
    .eq('was_impulse', true)
    .gte('logged_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  if (was_impulse && count && count >= 2) {
    message += `\n\n⚠️ That's ${count + 1} impulse purchases this week. Want to talk about triggers?`
  }

  return NextResponse.json({
    success: true,
    action: 'logged',
    message,
    data: { logEntry: data },
  })
}

/**
 * Handle food log command (text-based, no photo)
 */
async function handleFoodLog(supabase: any, parsed: any) {
  const { meal_type, description, estimated_calories } = parsed.entities

  if (!description) {
    return NextResponse.json({
      success: true,
      action: 'clarification_needed',
      message: 'What did you eat?',
      data: { parsed },
    })
  }

  // Use AI to estimate calories if not provided
  const analysis = await estimateCaloriesFromText(description)

  return NextResponse.json({
    success: true,
    action: 'confirm_food_log',
    message: generateFoodConfirmation(analysis),
    data: {
      analysis,
      logEntry: {
        meal_type: meal_type || analysis.mealType || inferMealType(),
        description: analysis.mealDescription,
        calories: analysis.estimatedCalories,
        protein_g: analysis.estimatedMacros.protein_g,
        carbs_g: analysis.estimatedMacros.carbs_g,
        fat_g: analysis.estimatedMacros.fat_g,
        fiber_g: analysis.estimatedMacros.fiber_g,
        health_score: analysis.healthScore,
        confidence: analysis.confidence,
        estimation_source: 'ai',
      },
    },
  })
}

/**
 * Handle pain log command
 */
async function handlePainLog(supabase: any, parsed: any) {
  const { level, location, notes } = parsed.entities

  if (level === undefined) {
    return NextResponse.json({
      success: true,
      action: 'clarification_needed',
      message: 'What\'s your pain level? (0-10)',
      data: { parsed },
    })
  }

  const today = new Date().toISOString().split('T')[0]

  // Update daily log
  const { data, error } = await supabase
    .from('daily_logs')
    .upsert({
      log_date: today,
      morning_pain: level,
      notes: location ? `Pain in ${location}. ${notes || ''}` : notes,
    }, {
      onConflict: 'log_date',
    })
    .select()
    .single()

  if (error) throw error

  let message = `✓ Logged pain level ${level}/10`
  if (location) message += ` in ${location}`

  // Add insight if pain is high
  if (level >= 7) {
    message += `\n\n💙 That's pretty high. Have you tried your exercises today? Want some suggestions?`
  }

  return NextResponse.json({
    success: true,
    action: 'logged',
    message,
    data: { logEntry: data },
  })
}

/**
 * Handle exercise log command
 */
async function handleExerciseLog(supabase: any, parsed: any) {
  const { type, duration_minutes, notes } = parsed.entities

  if (!type || !duration_minutes) {
    return NextResponse.json({
      success: true,
      action: 'clarification_needed',
      message: parsed.suggestedClarification || 'What exercise did you do and for how long?',
      data: { parsed },
    })
  }

  // Insert exercise session
  const { data, error } = await supabase.from('exercise_sessions').insert({
    completed_exercises: [{ name: type, duration: duration_minutes }],
    total_duration_minutes: duration_minutes,
    notes,
  }).select().single()

  if (error) throw error

  let message = `✓ Logged ${duration_minutes} min of ${type}`

  // Check streak
  const { count } = await supabase
    .from('exercise_sessions')
    .select('*', { count: 'exact', head: true })
    .gte('performed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  if (count && count >= 5) {
    message += `\n\n🔥 That's ${count} sessions this week! You're on fire!`
  }

  return NextResponse.json({
    success: true,
    action: 'logged',
    message,
    data: { logEntry: data },
  })
}

/**
 * Handle alcohol log command
 */
async function handleAlcoholLog(supabase: any, parsed: any) {
  const { drink_type, units, context } = parsed.entities

  if (!drink_type || !units) {
    return NextResponse.json({
      success: true,
      action: 'clarification_needed',
      message: 'What did you drink and how much?',
      data: { parsed },
    })
  }

  // Insert alcohol log
  const { data, error } = await supabase.from('alcohol_logs').insert({
    drink_type,
    units,
    context: context || 'other',
  }).select().single()

  if (error) throw error

  let message = `✓ Logged ${units} ${drink_type}`

  // Check weekly total
  const { data: weekTotal } = await supabase
    .from('alcohol_logs')
    .select('units')
    .gte('logged_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const totalUnits = weekTotal?.reduce((sum, log) => sum + (log.units || 0), 0) || 0

  if (totalUnits > 7) {
    message += `\n\n⚠️ That's ${totalUnits.toFixed(1)} units this week (goal: 2). Want to talk about it?`
  }

  return NextResponse.json({
    success: true,
    action: 'logged',
    message,
    data: { logEntry: data },
  })
}

/**
 * Handle mood log command
 */
async function handleMoodLog(supabase: any, parsed: any) {
  const { emotion, notes } = parsed.entities

  if (!emotion) {
    return NextResponse.json({
      success: true,
      action: 'clarification_needed',
      message: 'How are you feeling?',
      data: { parsed },
    })
  }

  // Log as activity
  const { data, error } = await supabase.from('activity_logs').insert({
    activity_type: 'mood_check',
    description: `Feeling ${emotion}`,
    mood_before: emotion,
    notes,
  }).select().single()

  if (error) throw error

  let message = `✓ Noted that you're feeling ${emotion}`

  // Offer support for negative emotions
  if (['stressed', 'anxious', 'sad', 'tired'].includes(emotion.toLowerCase())) {
    message += `\n\n💙 Want to talk about it? Or maybe try something that usually helps you feel better?`
  }

  return NextResponse.json({
    success: true,
    action: 'logged',
    message,
    data: { logEntry: data },
  })
}

/**
 * Classify photo type (receipt, meal, exercise, etc.)
 */
async function classifyPhotoType(
  imageBase64: string,
  context?: string
): Promise<'receipt' | 'meal' | 'exercise' | 'other'> {
  // Quick context-based classification
  if (context) {
    const lowerContext = context.toLowerCase()
    if (lowerContext.includes('receipt') || lowerContext.includes('purchase') || lowerContext.includes('bought')) {
      return 'receipt'
    }
    if (lowerContext.includes('food') || lowerContext.includes('meal') || lowerContext.includes('ate') || lowerContext.includes('lunch') || lowerContext.includes('dinner') || lowerContext.includes('breakfast')) {
      return 'meal'
    }
    if (lowerContext.includes('workout') || lowerContext.includes('exercise') || lowerContext.includes('gym')) {
      return 'exercise'
    }
  }

  // Default to meal for now (most common use case)
  // In future, can add AI-based image classification
  return 'meal'
}