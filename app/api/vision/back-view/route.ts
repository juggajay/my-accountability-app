import { NextRequest, NextResponse } from 'next/server'
import { VisionAnalysis } from '@/lib/ai/vision-analysis'
import { z } from 'zod'

const backViewSchema = z.object({
  imageBase64: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = backViewSchema.parse(body)

    const vision = new VisionAnalysis()
    const analysis = await vision.analyzeBackView(validatedData.imageBase64)

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error: unknown) {
    console.error('Back view analysis error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze back view'

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}