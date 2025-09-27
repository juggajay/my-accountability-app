import vision, { ImageAnnotatorClient } from '@google-cloud/vision'

let client: ImageAnnotatorClient | null = null

function getClient() {
  if (!client) {
    try {
      if (process.env.GOOGLE_CLOUD_CREDENTIALS_BASE64) {
        console.log('Using GOOGLE_CLOUD_CREDENTIALS_BASE64')
        const credentialsJson = Buffer.from(
          process.env.GOOGLE_CLOUD_CREDENTIALS_BASE64,
          'base64'
        ).toString('utf-8')
        const credentials = JSON.parse(credentialsJson)
        client = new vision.ImageAnnotatorClient({
          credentials,
        })
      } else if (process.env.GOOGLE_CLOUD_CREDENTIALS_JSON) {
        console.log('Using GOOGLE_CLOUD_CREDENTIALS_JSON')
        const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS_JSON)
        client = new vision.ImageAnnotatorClient({
          credentials,
        })
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.log('Using GOOGLE_APPLICATION_CREDENTIALS')
        client = new vision.ImageAnnotatorClient()
      } else {
        throw new Error(
          'Google Cloud credentials not found. Set GOOGLE_CLOUD_CREDENTIALS_BASE64, GOOGLE_CLOUD_CREDENTIALS_JSON, or GOOGLE_APPLICATION_CREDENTIALS'
        )
      }
    } catch (error) {
      console.error('Failed to create Vision client:', error)
      throw error
    }
  }
  return client
}

export interface GoogleFaceAnalysis {
  detectionConfidence: number
  landmarkingConfidence: number
  joyLikelihood: string
  sorrowLikelihood: string
  angerLikelihood: string
  surpriseLikelihood: string
  underExposedLikelihood: string
  blurredLikelihood: string
  headwearLikelihood: string
  tiltAngle: number
  rollAngle: number
  panAngle: number
  landmarks: Array<{
    type: string
    position: { x: number; y: number; z: number }
  }>
}

export async function analyzeFaceWithGoogle(
  imageBase64: string
): Promise<GoogleFaceAnalysis | null> {
  try {
    const visionClient = getClient()
    const imageBuffer = Buffer.from(imageBase64, 'base64')

    const [result] = await visionClient.faceDetection({
      image: { content: imageBuffer },
    })

    const faces = result.faceAnnotations

    if (!faces || faces.length === 0) {
      return null
    }

    const face = faces[0]

    return {
      detectionConfidence: face.detectionConfidence || 0,
      landmarkingConfidence: face.landmarkingConfidence || 0,
      joyLikelihood: String(face.joyLikelihood || 'UNKNOWN'),
      sorrowLikelihood: String(face.sorrowLikelihood || 'UNKNOWN'),
      angerLikelihood: String(face.angerLikelihood || 'UNKNOWN'),
      surpriseLikelihood: String(face.surpriseLikelihood || 'UNKNOWN'),
      underExposedLikelihood: String(face.underExposedLikelihood || 'UNKNOWN'),
      blurredLikelihood: String(face.blurredLikelihood || 'UNKNOWN'),
      headwearLikelihood: String(face.headwearLikelihood || 'UNKNOWN'),
      tiltAngle: face.tiltAngle || 0,
      rollAngle: face.rollAngle || 0,
      panAngle: face.panAngle || 0,
      landmarks: (face.landmarks || []).map((landmark) => ({
        type: String(landmark.type || 'UNKNOWN'),
        position: {
          x: landmark.position?.x || 0,
          y: landmark.position?.y || 0,
          z: landmark.position?.z || 0,
        },
      })),
    }
  } catch (error) {
    console.error('Google Vision face detection error:', error)
    throw error
  }
}

export async function analyzeImageLabels(imageBase64: string): Promise<string[]> {
  try {
    const visionClient = getClient()
    const imageBuffer = Buffer.from(imageBase64, 'base64')

    const [result] = await visionClient.labelDetection({
      image: { content: imageBuffer },
    })

    const labels = result.labelAnnotations || []

    return labels.map((label) => String(label.description || '')).filter((desc) => desc)
  } catch (error) {
    console.error('Google Vision label detection error:', error)
    throw error
  }
}

export async function analyzeImageProperties(
  imageBase64: string
): Promise<{
  dominantColors: Array<{ color: { red: number; green: number; blue: number }; score: number }>
}> {
  try {
    const visionClient = getClient()
    const imageBuffer = Buffer.from(imageBase64, 'base64')

    const [result] = await visionClient.imageProperties({
      image: { content: imageBuffer },
    })

    const colors = result.imagePropertiesAnnotation?.dominantColors?.colors || []

    return {
      dominantColors: colors.map((colorInfo) => ({
        color: {
          red: colorInfo.color?.red || 0,
          green: colorInfo.color?.green || 0,
          blue: colorInfo.color?.blue || 0,
        },
        score: colorInfo.score || 0,
      })),
    }
  } catch (error) {
    console.error('Google Vision image properties error:', error)
    throw error
  }
}

export interface ObjectLocalization {
  name: string
  confidence: number
  boundingBox: {
    vertices: Array<{ x: number; y: number }>
  }
  centerPoint: { x: number; y: number }
}

function calculateCenterPoint(vertices: Array<{ x?: number | null; y?: number | null }>): { x: number; y: number } {
  if (!vertices || vertices.length === 0) {
    return { x: 0, y: 0 }
  }

  let sumX = 0
  let sumY = 0
  let count = 0

  for (const vertex of vertices) {
    if (vertex.x !== undefined && vertex.x !== null && vertex.y !== undefined && vertex.y !== null) {
      sumX += vertex.x
      sumY += vertex.y
      count++
    }
  }

  return {
    x: count > 0 ? sumX / count : 0,
    y: count > 0 ? sumY / count : 0,
  }
}

export async function analyzeObjectLocalization(
  imageBase64: string
): Promise<ObjectLocalization[]> {
  try {
    const visionClient = getClient()
    const imageBuffer = Buffer.from(imageBase64, 'base64')

    if (!visionClient.objectLocalization) {
      console.error('Object localization not available on this Vision client')
      return []
    }

    const [result] = await visionClient.objectLocalization({
      image: { content: imageBuffer },
    })

    const objects = result.localizedObjectAnnotations || []

    return objects.map((obj) => ({
      name: String(obj.name || 'Unknown'),
      confidence: obj.score || 0,
      boundingBox: {
        vertices:
          obj.boundingPoly?.normalizedVertices?.map((v) => ({
            x: v.x || 0,
            y: v.y || 0,
          })) || [],
      },
      centerPoint: calculateCenterPoint(obj.boundingPoly?.normalizedVertices || []),
    }))
  } catch (error) {
    console.error('Google Vision object localization error:', error)
    throw error
  }
}

export interface InflammationAnalysis {
  rednessScore: number
  inflammationLevel: 'none' | 'mild' | 'moderate' | 'severe'
  dominantHue: string
  warmColorPercentage: number
  concerns: string[]
}

function calculateRednessRatio(red: number, green: number, blue: number): number {
  if (red === 0) return 0
  return red / Math.max(green + blue, 1)
}

function getInflammationLevel(rednessScore: number): 'none' | 'mild' | 'moderate' | 'severe' {
  if (rednessScore >= 2.5) return 'severe'
  if (rednessScore >= 1.8) return 'moderate'
  if (rednessScore >= 1.3) return 'mild'
  return 'none'
}

export async function analyzeInflammation(imageBase64: string): Promise<InflammationAnalysis> {
  const colorData = await analyzeImageProperties(imageBase64)
  const colors = colorData.dominantColors

  let totalWarmColorScore = 0
  let maxRedness = 0
  let weightedRednessSum = 0
  let totalScore = 0

  for (const colorInfo of colors) {
    const { red, green, blue } = colorInfo.color
    const score = colorInfo.score

    const rednessRatio = calculateRednessRatio(red, green, blue)
    weightedRednessSum += rednessRatio * score
    totalScore += score

    if (rednessRatio > maxRedness) {
      maxRedness = rednessRatio
    }

    if (red > green && red > blue) {
      totalWarmColorScore += score
    }
  }

  const averageRedness = totalScore > 0 ? weightedRednessSum / totalScore : 0
  const warmColorPercentage = totalScore > 0 ? (totalWarmColorScore / totalScore) * 100 : 0

  const inflammationLevel = getInflammationLevel(averageRedness)

  const concerns: string[] = []
  if (inflammationLevel === 'severe') {
    concerns.push('Significant redness detected - possible acute inflammation')
  } else if (inflammationLevel === 'moderate') {
    concerns.push('Moderate redness present - monitor for inflammation')
  } else if (inflammationLevel === 'mild') {
    concerns.push('Mild redness detected - may indicate early inflammation')
  }

  if (warmColorPercentage > 60) {
    concerns.push('High warm color presence - possible circulation issues')
  }

  return {
    rednessScore: Math.round(averageRedness * 100) / 100,
    inflammationLevel,
    dominantHue: warmColorPercentage > 50 ? 'warm' : 'cool',
    warmColorPercentage: Math.round(warmColorPercentage * 10) / 10,
    concerns,
  }
}

export interface HealthScores {
  overall: number
  posture: number
  inflammation: number
  imageQuality: number
  emotionalWellness: number
  breakdown: {
    postureFactors: { headTilt: number; headRoll: number; headPan: number }
    qualityFactors: { blur: number; exposure: number }
    emotionalFactors: { joy: number; stress: number }
  }
}

function likelihoodToScore(likelihood: string): number {
  switch (likelihood) {
    case 'VERY_LIKELY':
      return 100
    case 'LIKELY':
      return 75
    case 'POSSIBLE':
      return 50
    case 'UNLIKELY':
      return 25
    case 'VERY_UNLIKELY':
      return 0
    default:
      return 50
  }
}

function calculatePostureScore(tiltAngle: number, rollAngle: number, panAngle: number): number {
  const idealTilt = 0
  const idealRoll = 0
  const idealPan = 0

  const tiltDeviation = Math.abs(tiltAngle - idealTilt)
  const rollDeviation = Math.abs(rollAngle - idealRoll)
  const panDeviation = Math.abs(panAngle - idealPan)

  const tiltScore = Math.max(0, 100 - tiltDeviation * 2)
  const rollScore = Math.max(0, 100 - rollDeviation * 2)
  const panScore = Math.max(0, 100 - panDeviation * 2)

  return (tiltScore + rollScore + panScore) / 3
}

function calculateImageQualityScore(blurredLikelihood: string, underExposedLikelihood: string): number {
  const blurScore = 100 - likelihoodToScore(blurredLikelihood)
  const exposureScore = 100 - likelihoodToScore(underExposedLikelihood)

  return (blurScore + exposureScore) / 2
}

function calculateEmotionalWellnessScore(
  joyLikelihood: string,
  sorrowLikelihood: string,
  angerLikelihood: string
): number {
  const joyScore = likelihoodToScore(joyLikelihood)
  const stressScore = (likelihoodToScore(sorrowLikelihood) + likelihoodToScore(angerLikelihood)) / 2

  return (joyScore + (100 - stressScore)) / 2
}

function calculateInflammationScore(rednessScore: number): number {
  return Math.max(0, 100 - rednessScore * 40)
}

export function calculateHealthScores(
  faceAnalysis: GoogleFaceAnalysis,
  inflammationAnalysis: InflammationAnalysis
): HealthScores {
  const postureScore = calculatePostureScore(
    faceAnalysis.tiltAngle,
    faceAnalysis.rollAngle,
    faceAnalysis.panAngle
  )

  const imageQualityScore = calculateImageQualityScore(
    faceAnalysis.blurredLikelihood,
    faceAnalysis.underExposedLikelihood
  )

  const emotionalWellnessScore = calculateEmotionalWellnessScore(
    faceAnalysis.joyLikelihood,
    faceAnalysis.sorrowLikelihood,
    faceAnalysis.angerLikelihood
  )

  const inflammationScore = calculateInflammationScore(inflammationAnalysis.rednessScore)

  const overall = (postureScore * 0.3 + inflammationScore * 0.25 + imageQualityScore * 0.15 + emotionalWellnessScore * 0.3)

  return {
    overall: Math.round(overall),
    posture: Math.round(postureScore),
    inflammation: Math.round(inflammationScore),
    imageQuality: Math.round(imageQualityScore),
    emotionalWellness: Math.round(emotionalWellnessScore),
    breakdown: {
      postureFactors: {
        headTilt: Math.round(Math.max(0, 100 - Math.abs(faceAnalysis.tiltAngle) * 2)),
        headRoll: Math.round(Math.max(0, 100 - Math.abs(faceAnalysis.rollAngle) * 2)),
        headPan: Math.round(Math.max(0, 100 - Math.abs(faceAnalysis.panAngle) * 2)),
      },
      qualityFactors: {
        blur: Math.round(100 - likelihoodToScore(faceAnalysis.blurredLikelihood)),
        exposure: Math.round(100 - likelihoodToScore(faceAnalysis.underExposedLikelihood)),
      },
      emotionalFactors: {
        joy: Math.round(likelihoodToScore(faceAnalysis.joyLikelihood)),
        stress: Math.round(
          (likelihoodToScore(faceAnalysis.sorrowLikelihood) + likelihoodToScore(faceAnalysis.angerLikelihood)) / 2
        ),
      },
    },
  }
}