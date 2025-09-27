import { openai } from './openai'
import { analyzeFaceWithGoogle, analyzeImageLabels } from './google-vision'

export interface PostureAnalysis {
  description: string
  compensationPatterns: string[]
  comparisonToIdeal: string
  corrections: string[]
  rating: number
  rawAnalysis: string
}

export interface ExerciseFormAnalysis {
  exerciseName: string
  whatsDoneWell: string[]
  needsCorrection: string[]
  specificCues: string[]
  safetyConcerns: string[]
  overallFeedback: string
}

export interface FacialPainAnalysis {
  tensionAreas: string[]
  observedExpression: string
  perceivedPainLevel: number
  notes: string
}

export interface FacialHealthAnalysis {
  skinHealth: string
  eyeClarity: string
  overallVitality: string
  concernAreas: string[]
  recommendations: string[]
  healthScore: number
}

export interface IridologyAnalysis {
  leftEye: {
    observations: string[]
    organSystems: string[]
    concernAreas: string[]
  }
  rightEye: {
    observations: string[]
    organSystems: string[]
    concernAreas: string[]
  }
  overallAssessment: string
  recommendations: string[]
}

export interface FullBodyAnalysis {
  posture: PostureAnalysis
  facialHealth: FacialHealthAnalysis
  iridology: IridologyAnalysis
  overallWellness: string
  weekOverWeekChanges?: string
}

export interface ProgressComparison {
  improvements: string[]
  changes: string[]
  encouragement: string
  detailedComparison: string
}

export class VisionAnalysis {
  async analyzePostureSimple(imageBase64: string): Promise<PostureAnalysis> {
    const prompt = `You are a physical therapy assistant analyzing posture for health tracking purposes.

Analyze this posture photo for sciatica tracking (L5-S1 specifically):

1. Describe posture (head, shoulders, hips, spine alignment)
2. Note any visible compensation patterns
3. Compare to ideal posture
4. Suggest specific corrections
5. Rate overall posture (1-10)

Be specific and actionable for someone with L5-S1 sciatica.

Please format your response as JSON with this structure:
{
  "description": "detailed posture description",
  "compensationPatterns": ["pattern1", "pattern2"],
  "comparisonToIdeal": "comparison text",
  "corrections": ["correction1", "correction2"],
  "rating": 7,
  "rawAnalysis": "full analysis text"
}`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      })

      const content = response.choices[0]?.message?.content || ''
      
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
      } catch (e) {
        console.error('Failed to parse JSON response')
      }

      return {
        description: content,
        compensationPatterns: [],
        comparisonToIdeal: '',
        corrections: [],
        rating: 0,
        rawAnalysis: content,
      }
    } catch (error) {
      console.error('Vision analysis error:', error)
      throw error
    }
  }

  async analyzeExerciseForm(
    imageBase64: string,
    exerciseName: string
  ): Promise<ExerciseFormAnalysis> {
    const prompt = `You are a fitness coach analyzing exercise form for health and safety purposes.

Check exercise form for: ${exerciseName}

Look for:
- Spine alignment
- Hip position
- Knee tracking
- Weight distribution
- Common mistakes for this exercise

Provide as JSON:
{
  "exerciseName": "${exerciseName}",
  "whatsDoneWell": ["good point 1", "good point 2"],
  "needsCorrection": ["correction 1", "correction 2"],
  "specificCues": ["cue 1", "cue 2"],
  "safetyConcerns": ["concern 1 if any"],
  "overallFeedback": "summary"
}`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 800,
      })

      const content = response.choices[0]?.message?.content || ''

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
      } catch (e) {
        console.error('Failed to parse JSON response')
      }

      return {
        exerciseName,
        whatsDoneWell: [],
        needsCorrection: [],
        specificCues: [],
        safetyConcerns: [],
        overallFeedback: content,
      }
    } catch (error) {
      console.error('Form analysis error:', error)
      throw error
    }
  }

  async analyzeFacialPain(imageBase64: string): Promise<FacialPainAnalysis> {
    const prompt = `You are a health tracking assistant analyzing facial expressions for pain indicators to help with wellness monitoring.

Analyze facial expression for pain indicators:
- Tension in face/jaw
- Eye squinting or strain
- Overall expression

Rate perceived pain level (0-10) and describe observations.

Format as JSON:
{
  "tensionAreas": ["jaw", "forehead"],
  "observedExpression": "description",
  "perceivedPainLevel": 5,
  "notes": "additional notes"
}`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      })

      const content = response.choices[0]?.message?.content || ''

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
      } catch (e) {
        console.error('Failed to parse JSON response')
      }

      return {
        tensionAreas: [],
        observedExpression: content,
        perceivedPainLevel: 0,
        notes: content,
      }
    } catch (error) {
      console.error('Facial pain analysis error:', error)
      throw error
    }
  }

  async compareProgress(
    beforeBase64: string,
    afterBase64: string
  ): Promise<ProgressComparison> {
    const prompt = `You are a fitness progress tracker helping users monitor their wellness journey.

Compare these two photos (before and after):

Note improvements or changes in:
- Posture alignment
- Muscle development
- Body symmetry
- Overall stance
- Confidence/comfort in position

Be encouraging but honest about changes.

Format as JSON:
{
  "improvements": ["improvement 1", "improvement 2"],
  "changes": ["change 1", "change 2"],
  "encouragement": "encouraging message",
  "detailedComparison": "full comparison text"
}`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${beforeBase64}`,
                },
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${afterBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      })

      const content = response.choices[0]?.message?.content || ''

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
      } catch (e) {
        console.error('Failed to parse JSON response')
      }

      return {
        improvements: [],
        changes: [],
        encouragement: '',
        detailedComparison: content,
      }
    } catch (error) {
      console.error('Progress comparison error:', error)
      throw error
    }
  }

  async analyzeFacialHealth(imageBase64: string): Promise<FacialHealthAnalysis> {
    try {
      const faceData = await analyzeFaceWithGoogle(imageBase64)
      const labels = await analyzeImageLabels(imageBase64)

      if (!faceData) {
        return {
          skinHealth: 'No face detected in image. Please ensure face is clearly visible.',
          eyeClarity: '',
          overallVitality: '',
          concernAreas: ['No face detected'],
          recommendations: ['Take a clearer photo with face visible'],
          healthScore: 0,
        }
      }

      const emotionScore =
        (this.getLikelihoodScore(faceData.joyLikelihood) * 1.5 +
          this.getLikelihoodScore(faceData.sorrowLikelihood) * -1 +
          this.getLikelihoodScore(faceData.angerLikelihood) * -1 +
          this.getLikelihoodScore(faceData.surpriseLikelihood) * 0.5) /
        4

      const imageQuality =
        10 -
        this.getLikelihoodScore(faceData.blurredLikelihood) * 2 -
        this.getLikelihoodScore(faceData.underExposedLikelihood) * 1.5

      const healthScore = Math.max(
        0,
        Math.min(10, Math.round(5 + emotionScore + imageQuality * 0.3))
      )

      const skinHealthDesc = this.describeSkinHealth(faceData, labels)
      const eyeClarityDesc = this.describeEyeClarity(faceData)
      const vitalityDesc = this.describeVitality(faceData, emotionScore)
      const concerns = this.identifyConcerns(faceData, imageQuality)
      const recommendations = this.generateRecommendations(faceData, concerns)

      return {
        skinHealth: skinHealthDesc,
        eyeClarity: eyeClarityDesc,
        overallVitality: vitalityDesc,
        concernAreas: concerns,
        recommendations,
        healthScore,
      }
    } catch (error) {
      console.error('Facial health analysis error:', error)
      throw error
    }
  }

  private getLikelihoodScore(likelihood: string): number {
    const scores: Record<string, number> = {
      VERY_LIKELY: 4,
      LIKELY: 3,
      POSSIBLE: 2,
      UNLIKELY: 1,
      VERY_UNLIKELY: 0,
      UNKNOWN: 0,
    }
    return scores[likelihood] || 0
  }

  private describeSkinHealth(faceData: any, labels: string[]): string {
    const quality = []

    if (this.getLikelihoodScore(faceData.blurredLikelihood) <= 1) {
      quality.push('clear image quality')
    }
    if (this.getLikelihoodScore(faceData.underExposedLikelihood) <= 1) {
      quality.push('good lighting')
    }

    const skinRelated = labels.filter((label) =>
      ['skin', 'face', 'cheek', 'chin', 'forehead'].some((term) =>
        label.toLowerCase().includes(term)
      )
    )

    if (quality.length === 0) {
      return 'Photo quality affects analysis. Try better lighting and focus.'
    }

    return `Photo shows ${quality.join(' and ')}. ${
      skinRelated.length > 0 ? 'Facial features are visible.' : 'Features captured in frame.'
    }`
  }

  private describeEyeClarity(faceData: any): string {
    const eyeLandmarks = faceData.landmarks.filter((lm: any) =>
      lm.type.includes('EYE')
    )

    if (eyeLandmarks.length === 0) {
      return 'Eye landmarks not clearly detected'
    }

    if (this.getLikelihoodScore(faceData.joyLikelihood) >= 3) {
      return 'Eyes appear bright and engaged'
    } else if (this.getLikelihoodScore(faceData.sorrowLikelihood) >= 3) {
      return 'Eyes show signs of tiredness or low energy'
    }

    return 'Eyes appear neutral and calm'
  }

  private describeVitality(faceData: any, emotionScore: number): string {
    if (emotionScore > 2) {
      return 'Overall appearance suggests good energy and positive mood'
    } else if (emotionScore < -1) {
      return 'Appearance may indicate fatigue or stress - consider rest'
    }
    return 'Neutral appearance, typical daily state'
  }

  private identifyConcerns(faceData: any, imageQuality: number): string[] {
    const concerns = []

    if (this.getLikelihoodScore(faceData.sorrowLikelihood) >= 3) {
      concerns.push('Facial expression suggests low mood or fatigue')
    }
    if (this.getLikelihoodScore(faceData.angerLikelihood) >= 3) {
      concerns.push('Tension detected in facial muscles')
    }
    if (imageQuality < 5) {
      concerns.push('Image quality could be improved for better tracking')
    }
    if (this.getLikelihoodScore(faceData.blurredLikelihood) >= 3) {
      concerns.push('Photo is blurred - take a clearer shot')
    }

    return concerns.length > 0 ? concerns : ['No major concerns detected']
  }

  private generateRecommendations(faceData: any, concerns: string[]): string[] {
    const recommendations = []

    if (concerns.some((c) => c.includes('fatigue') || c.includes('low mood'))) {
      recommendations.push('Prioritize 7-9 hours of quality sleep')
      recommendations.push('Stay hydrated throughout the day')
    }
    if (concerns.some((c) => c.includes('tension') || c.includes('stress'))) {
      recommendations.push('Practice relaxation techniques or meditation')
      recommendations.push('Consider facial massage or stretching')
    }
    if (concerns.some((c) => c.includes('image quality') || c.includes('blurred'))) {
      recommendations.push('Use better lighting and hold camera steady')
    }

    if (recommendations.length === 0) {
      recommendations.push('Maintain healthy sleep schedule')
      recommendations.push('Stay hydrated and eat nutritious foods')
      recommendations.push('Continue tracking your wellness journey')
    }

    return recommendations
  }

  async analyzeIridology(
    leftEyeBase64: string,
    rightEyeBase64: string
  ): Promise<IridologyAnalysis> {
    try {
      const [leftFace, rightFace, leftLabels, rightLabels] = await Promise.all([
        analyzeFaceWithGoogle(leftEyeBase64),
        analyzeFaceWithGoogle(rightEyeBase64),
        analyzeImageLabels(leftEyeBase64),
        analyzeImageLabels(rightEyeBase64),
      ])

      const leftEyeAnalysis = this.analyzeEyeDetails(leftFace, leftLabels, 'left')
      const rightEyeAnalysis = this.analyzeEyeDetails(rightFace, rightLabels, 'right')

      const overallAssessment = this.generateOverallIridologyAssessment(
        leftEyeAnalysis,
        rightEyeAnalysis
      )

      const recommendations = this.generateIridologyRecommendations(
        leftEyeAnalysis,
        rightEyeAnalysis
      )

      return {
        leftEye: leftEyeAnalysis,
        rightEye: rightEyeAnalysis,
        overallAssessment,
        recommendations,
      }
    } catch (error) {
      console.error('Iridology analysis error:', error)
      throw error
    }
  }

  private analyzeEyeDetails(
    faceData: any,
    labels: string[],
    eyeSide: 'left' | 'right'
  ): {
    observations: string[]
    organSystems: string[]
    concernAreas: string[]
  } {
    const observations = []
    const organSystems = []
    const concernAreas = []

    if (!faceData) {
      observations.push(`${eyeSide} eye not clearly detected in image`)
      concernAreas.push('Image quality insufficient for analysis')
      return { observations, organSystems, concernAreas }
    }

    const eyeLandmarks = faceData.landmarks.filter((lm: any) =>
      lm.type.includes(eyeSide.toUpperCase())
    )

    if (eyeLandmarks.length > 0) {
      observations.push('Eye structure and landmarks visible')
      observations.push('Pupil and iris boundaries can be distinguished')
    }

    const eyeRelatedLabels = labels.filter((label) =>
      ['eye', 'iris', 'pupil', 'eyelash', 'eyelid'].some((term) =>
        label.toLowerCase().includes(term)
      )
    )

    if (eyeRelatedLabels.length > 0) {
      observations.push(`Features detected: ${eyeRelatedLabels.join(', ')}`)
    }

    if (this.getLikelihoodScore(faceData.joyLikelihood) >= 3) {
      observations.push('Eye appears open and alert')
      organSystems.push('Nervous system - responsive')
    } else if (this.getLikelihoodScore(faceData.sorrowLikelihood) >= 3) {
      observations.push('Eye may show signs of fatigue')
      concernAreas.push('Consider rest and hydration')
      organSystems.push('Energy levels - may need attention')
    }

    if (this.getLikelihoodScore(faceData.blurredLikelihood) >= 3) {
      concernAreas.push('Image is blurred - take a sharper photo for better tracking')
    }

    if (observations.length === 0) {
      observations.push('Basic eye structure visible')
    }

    return { observations, organSystems, concernAreas }
  }

  private generateOverallIridologyAssessment(
    leftEye: any,
    rightEye: any
  ): string {
    const leftIssues = leftEye.concernAreas.length
    const rightIssues = rightEye.concernAreas.length

    if (leftIssues === 0 && rightIssues === 0) {
      return 'Both eyes show clear features suitable for wellness tracking. Images captured successfully for journal documentation.'
    }

    if (leftIssues > 0 || rightIssues > 0) {
      return 'Some image quality issues detected. Consider retaking photos with better lighting and focus for more detailed tracking.'
    }

    return 'Eye features documented. Continue tracking over time to observe any changes.'
  }

  private generateIridologyRecommendations(
    leftEye: any,
    rightEye: any
  ): string[] {
    const recommendations = []

    const hasFatigueConcerns =
      leftEye.concernAreas.some((c: string) => c.includes('fatigue') || c.includes('rest')) ||
      rightEye.concernAreas.some((c: string) => c.includes('fatigue') || c.includes('rest'))

    if (hasFatigueConcerns) {
      recommendations.push('Prioritize adequate sleep (7-9 hours)')
      recommendations.push('Stay well-hydrated throughout the day')
    }

    const hasImageQuality =
      leftEye.concernAreas.some((c: string) => c.includes('blurred') || c.includes('quality')) ||
      rightEye.concernAreas.some((c: string) => c.includes('blurred') || c.includes('quality'))

    if (hasImageQuality) {
      recommendations.push('Use better lighting when taking eye photos')
      recommendations.push('Hold camera steady and focus on the iris')
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue regular wellness tracking')
      recommendations.push('Maintain healthy sleep and nutrition habits')
      recommendations.push('Take consistent photos for better comparison over time')
    }

    return recommendations
  }
}