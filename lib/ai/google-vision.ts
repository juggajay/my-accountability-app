import vision from '@google-cloud/vision'

let client: vision.ImageAnnotatorClient | null = null

function getClient() {
  if (!client) {
    if (process.env.GOOGLE_CLOUD_CREDENTIALS_JSON) {
      const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS_JSON)
      client = new vision.ImageAnnotatorClient({
        credentials,
      })
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      client = new vision.ImageAnnotatorClient()
    } else {
      throw new Error(
        'Google Cloud credentials not found. Set GOOGLE_CLOUD_CREDENTIALS_JSON or GOOGLE_APPLICATION_CREDENTIALS'
      )
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
      joyLikelihood: face.joyLikelihood || 'UNKNOWN',
      sorrowLikelihood: face.sorrowLikelihood || 'UNKNOWN',
      angerLikelihood: face.angerLikelihood || 'UNKNOWN',
      surpriseLikelihood: face.surpriseLikelihood || 'UNKNOWN',
      underExposedLikelihood: face.underExposedLikelihood || 'UNKNOWN',
      blurredLikelihood: face.blurredLikelihood || 'UNKNOWN',
      headwearLikelihood: face.headwearLikelihood || 'UNKNOWN',
      landmarks: (face.landmarks || []).map((landmark) => ({
        type: landmark.type || 'UNKNOWN',
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

    return labels.map((label) => label.description || '').filter((desc) => desc)
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