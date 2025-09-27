import { NextRequest, NextResponse } from 'next/server'
import { VisionAnalysis } from '@/lib/ai/vision-analysis'
import { z } from 'zod'

const formCheckSchema = z.object({
  imageBase64: z.string(),
  exerciseName: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = formCheckSchema.parse(body)

    const vision = new VisionAnalysis()
    const analysis = await vision.analyzeExerciseForm(
      validatedData.imageBase64,
      validatedData.exerciseName
    )

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error('Exercise form analysis error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to analyze exercise form' },
      { status: 500 }
    )
  }
}