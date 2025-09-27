import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { VisionAnalysis } from '@/lib/ai/vision-analysis'
import { z } from 'zod'

const postureSchema = z.object({
  imageBase64: z.string(),
  saveToHistory: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = postureSchema.parse(body)

    const vision = new VisionAnalysis()
    const analysis = await vision.analyzePostureSimple(validatedData.imageBase64)

    if (validatedData.saveToHistory) {
      const supabase = await createClient()
      
      await supabase.from('posture_analyses').insert({
        analysis: analysis,
        rating: analysis.rating,
        created_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error('Posture analysis error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to analyze posture' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const { data, error } = await supabase
      .from('posture_analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error) {
    console.error('Fetch posture history error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posture history' },
      { status: 500 }
    )
  }
}