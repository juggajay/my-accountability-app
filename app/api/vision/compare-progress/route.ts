import { NextRequest, NextResponse } from 'next/server'
import { VisionAnalysis } from '@/lib/ai/vision-analysis'
import { z } from 'zod'

const compareSchema = z.object({
  beforeImageBase64: z.string(),
  afterImageBase64: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = compareSchema.parse(body)

    const vision = new VisionAnalysis()
    const comparison = await vision.compareProgress(
      validatedData.beforeImageBase64,
      validatedData.afterImageBase64
    )

    return NextResponse.json({
      success: true,
      comparison,
    })
  } catch (error) {
    console.error('Progress comparison error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to compare progress' },
      { status: 500 }
    )
  }
}