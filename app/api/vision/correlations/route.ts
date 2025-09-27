import { NextRequest, NextResponse } from 'next/server'
import { CorrelationEngine } from '@/lib/ai/correlation-engine'
import { z } from 'zod'

const correlationsSchema = z.object({
  posture: z.any().optional(),
  facial: z.any().optional(),
  iridology: z.any().optional(),
  sideProfile: z.any().optional(),
  backView: z.any().optional(),
  seatedPosture: z.any().optional(),
  hands: z.any().optional(),
  forwardBend: z.any().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = correlationsSchema.parse(body)

    const engine = new CorrelationEngine()
    const correlations = engine.generateCorrelations(validatedData)

    return NextResponse.json({
      success: true,
      correlations,
    })
  } catch (error: unknown) {
    console.error('Correlation analysis error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to generate correlations'

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}