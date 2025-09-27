import { NextRequest, NextResponse } from 'next/server'
import { VisionAnalysis } from '@/lib/ai/vision-analysis'
import { z } from 'zod'

const iridologySchema = z.object({
  leftEyeBase64: z.string(),
  rightEyeBase64: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = iridologySchema.parse(body)

    const vision = new VisionAnalysis()
    const analysis = await vision.analyzeIridology(
      validatedData.leftEyeBase64,
      validatedData.rightEyeBase64
    )

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error: any) {
    console.error('Iridology analysis error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    const errorMessage = error?.message || 'Failed to analyze iridology'

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}