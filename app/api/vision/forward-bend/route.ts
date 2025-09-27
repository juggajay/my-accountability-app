import { NextRequest, NextResponse } from 'next/server'
import { VisionAnalysis } from '@/lib/ai/vision-analysis'
import { z } from 'zod'

const forwardBendSchema = z.object({
  imageBase64: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = forwardBendSchema.parse(body)

    const vision = new VisionAnalysis()
    const analysis = await vision.analyzeForwardBend(validatedData.imageBase64)

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error: unknown) {
    console.error('Forward bend analysis error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze forward bend'

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}