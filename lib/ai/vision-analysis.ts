import { openai } from './openai'
import {
  analyzeFaceWithGoogle,
  analyzeImageLabels,
  analyzeObjectLocalization,
  analyzeInflammation,
  calculateHealthScores,
} from './google-vision'
import { MEDICAL_ANALYSIS_CONTEXT } from './medical-analysis-prompt'

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

export interface SideProfileAnalysis {
  forwardHeadPosture: {
    severity: 'none' | 'mild' | 'moderate' | 'severe'
    angleDeviation: number
    description: string
  }
  neckCurve: string
  upperBackAlignment: string
  recommendations: string[]
  healthScore: number
}

export interface BackViewAnalysis {
  shoulderAlignment: {
    symmetrical: boolean
    deviation: string
  }
  hipAlignment: {
    symmetrical: boolean
    deviation: string
  }
  spinalAlignment: string
  scoliosisIndicators: string[]
  recommendations: string[]
  healthScore: number
}

export interface SeatedPostureAnalysis {
  lowerBackSupport: string
  forwardHeadInSeated: string
  shoulderPosition: string
  workPostureIssues: string[]
  recommendations: string[]
  healthScore: number
}

export interface HandsAnalysis {
  circulationScore: number
  inflammationIndicators: string[]
  jointSymmetry: boolean
  colorAnalysis: string
  concerns: string[]
  recommendations: string[]
}

export interface ForwardBendAnalysis {
  hamstringFlexibility: 'excellent' | 'good' | 'moderate' | 'limited'
  spinalCurveQuality: string
  compensationPatterns: string[]
  symmetry: boolean
  recommendations: string[]
  flexibilityScore: number
}

export interface FullBodyAnalysis {
  posture: PostureAnalysis
  facialHealth: FacialHealthAnalysis
  iridology: IridologyAnalysis
  sideProfile?: SideProfileAnalysis
  backView?: BackViewAnalysis
  seatedPosture?: SeatedPostureAnalysis
  hands?: HandsAnalysis
  forwardBend?: ForwardBendAnalysis
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
    const prompt = `${MEDICAL_ANALYSIS_CONTEXT}

TASK: Analyze this posture photo using professional postural assessment protocols.

Apply systematic examination:
1. **Five-Point Alignment**: Check external auditory meatus, acromioclavicular joint, greater trochanter, fibular head, lateral malleolus alignment
2. **Craniovertebral Angle**: Assess forward head posture severity
3. **Syndrome Screening**: Upper Crossed (protracted shoulders, tight pecs/posterior neck) or Lower Crossed (anterior pelvic tilt, tight hip flexors)
4. **Compensation Patterns**: Identify specific muscle imbalances
5. **Symmetry**: Check for lateral deviations, uneven shoulders/hips

Format as JSON:
{
  "description": "detailed anatomical assessment with specific observations",
  "compensationPatterns": ["pattern with affected muscles/structures", "another pattern"],
  "comparisonToIdeal": "precise deviations from ideal alignment with clinical context",
  "corrections": ["evidence-based corrective exercise with technique", "specific postural cue"],
  "rating": 7,
  "rawAnalysis": "comprehensive integrated analysis"
}

Be specific, evidence-based, and actionable. This is for personal health tracking.`

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
    const observations: string[] = []
    const organSystems: string[] = []
    const concernAreas: string[] = []

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

  async analyzeSideProfile(imageBase64: string): Promise<SideProfileAnalysis> {
    const [faceData, objects] = await Promise.all([
      analyzeFaceWithGoogle(imageBase64),
      analyzeObjectLocalization(imageBase64),
    ])

    if (!faceData) {
      throw new Error('Face detection failed')
    }

    const tiltAngle = Math.abs(faceData.tiltAngle)
    let severity: 'none' | 'mild' | 'moderate' | 'severe' = 'none'
    if (tiltAngle >= 30) severity = 'severe'
    else if (tiltAngle >= 20) severity = 'moderate'
    else if (tiltAngle >= 10) severity = 'mild'

    const head = objects.find((obj) => obj.name.toLowerCase().includes('head'))
    const torso = objects.find((obj) => obj.name.toLowerCase().includes('torso') || obj.name.toLowerCase().includes('person'))

    let neckCurve = 'Normal cervical curve'
    let upperBackAlignment = 'Aligned'

    if (head && torso && head.centerPoint.x < torso.centerPoint.x) {
      neckCurve = 'Forward head posture detected - cervical curve may be flattened'
      upperBackAlignment = 'Upper back rounding (kyphosis) likely present'
    }

    const recommendations = []
    if (severity !== 'none') {
      recommendations.push('Chin tucks: Gently pull chin back 10 reps, 3x daily')
      recommendations.push('Wall angels: Stand against wall, move arms up and down')
      recommendations.push('Check desk ergonomics - monitor at eye level')
    }

    const healthScore = Math.max(0, 100 - tiltAngle * 3)

    return {
      forwardHeadPosture: {
        severity,
        angleDeviation: tiltAngle,
        description: severity === 'none'
          ? 'Good head alignment'
          : `Forward head posture (${tiltAngle.toFixed(1)}° deviation)`,
      },
      neckCurve,
      upperBackAlignment,
      recommendations,
      healthScore: Math.round(healthScore),
    }
  }

  async analyzeBackView(imageBase64: string): Promise<BackViewAnalysis> {
    const objects = await analyzeObjectLocalization(imageBase64)

    const shoulders = objects.filter((obj) => obj.name.toLowerCase().includes('shoulder'))
    const hips = objects.filter((obj) => obj.name.toLowerCase().includes('hip'))

    let shoulderSymmetry = true
    let shoulderDeviation = 'Shoulders appear level'
    if (shoulders.length >= 2) {
      const yDiff = Math.abs(shoulders[0].centerPoint.y - shoulders[1].centerPoint.y)
      if (yDiff > 0.05) {
        shoulderSymmetry = false
        shoulderDeviation = `Shoulder height difference detected (${(yDiff * 100).toFixed(1)}%)`
      }
    }

    let hipSymmetry = true
    let hipDeviation = 'Hips appear level'
    if (hips.length >= 2) {
      const yDiff = Math.abs(hips[0].centerPoint.y - hips[1].centerPoint.y)
      if (yDiff > 0.05) {
        hipSymmetry = false
        hipDeviation = `Hip height difference detected (${(yDiff * 100).toFixed(1)}%)`
      }
    }

    const spinalAlignment = shoulderSymmetry && hipSymmetry
      ? 'Spine appears symmetrical'
      : 'Possible spinal asymmetry - shoulder/hip imbalance detected'

    const scoliosisIndicators = []
    if (!shoulderSymmetry) scoliosisIndicators.push('Uneven shoulders')
    if (!hipSymmetry) scoliosisIndicators.push('Uneven hips')
    if (scoliosisIndicators.length > 0) {
      scoliosisIndicators.push('Consider professional assessment for scoliosis screening')
    }

    const recommendations = []
    if (!shoulderSymmetry || !hipSymmetry) {
      recommendations.push('Single-leg exercises to address imbalances')
      recommendations.push('Unilateral stretching and strengthening')
      recommendations.push('Regular chiropractic or PT evaluation')
    }

    const healthScore = (shoulderSymmetry ? 50 : 25) + (hipSymmetry ? 50 : 25)

    return {
      shoulderAlignment: {
        symmetrical: shoulderSymmetry,
        deviation: shoulderDeviation,
      },
      hipAlignment: {
        symmetrical: hipSymmetry,
        deviation: hipDeviation,
      },
      spinalAlignment,
      scoliosisIndicators,
      recommendations,
      healthScore,
    }
  }

  async analyzeSeatedPosture(imageBase64: string): Promise<SeatedPostureAnalysis> {
    const [faceData, objects] = await Promise.all([
      analyzeFaceWithGoogle(imageBase64),
      analyzeObjectLocalization(imageBase64),
    ])

    if (!faceData) {
      throw new Error('Face detection failed')
    }

    const tiltAngle = faceData.tiltAngle
    const forwardHeadInSeated = Math.abs(tiltAngle) > 15
      ? `Forward head posture in seated position (${Math.abs(tiltAngle).toFixed(1)}°)`
      : 'Head position neutral while seated'

    const lowerBackSupport = objects.some((obj) => obj.name.toLowerCase().includes('chair'))
      ? 'Chair detected - check lumbar support contact'
      : 'No chair back visible - may need better lower back support'

    const shoulderPosition = Math.abs(faceData.rollAngle) > 5
      ? 'Shoulders uneven - possible desk setup imbalance'
      : 'Shoulder position appears level'

    const workPostureIssues = []
    if (Math.abs(tiltAngle) > 15) workPostureIssues.push('Forward head while working')
    if (Math.abs(faceData.rollAngle) > 5) workPostureIssues.push('Shoulder tilt/asymmetry')
    if (!objects.some((obj) => obj.name.toLowerCase().includes('chair'))) {
      workPostureIssues.push('Chair back not visible - check lumbar support')
    }

    const recommendations = []
    if (workPostureIssues.length > 0) {
      recommendations.push('Adjust monitor height to eye level')
      recommendations.push('Use lumbar roll or cushion for lower back')
      recommendations.push('Take standing breaks every 30 minutes')
      recommendations.push('Set up desk ergonomics assessment')
    }

    const healthScore = Math.max(0, 100 - workPostureIssues.length * 20)

    return {
      lowerBackSupport,
      forwardHeadInSeated,
      shoulderPosition,
      workPostureIssues,
      recommendations,
      healthScore,
    }
  }

  async analyzeHands(imageBase64: string): Promise<HandsAnalysis> {
    const [inflammation, labels, objects] = await Promise.all([
      analyzeInflammation(imageBase64),
      analyzeImageLabels(imageBase64),
      analyzeObjectLocalization(imageBase64),
    ])

    const hands = objects.filter((obj) => obj.name.toLowerCase().includes('hand'))
    const jointSymmetry = hands.length === 2

    const inflammationIndicators = [...inflammation.concerns]
    if (inflammation.inflammationLevel !== 'none') {
      inflammationIndicators.push(`${inflammation.inflammationLevel} inflammation detected`)
    }

    const circulationScore = Math.round((100 - inflammation.rednessScore * 30))

    const concerns = []
    if (inflammation.inflammationLevel === 'moderate' || inflammation.inflammationLevel === 'severe') {
      concerns.push('Elevated inflammation markers - consider anti-inflammatory diet')
    }
    if (!jointSymmetry) {
      concerns.push('Asymmetric hand positioning - retake photo with both hands visible')
    }

    const recommendations = []
    if (inflammation.inflammationLevel !== 'none') {
      recommendations.push('Reduce inflammatory foods (sugar, processed foods)')
      recommendations.push('Increase omega-3 intake (fish, walnuts, flaxseed)')
      recommendations.push('Stay well-hydrated')
    }
    if (circulationScore < 70) {
      recommendations.push('Hand/wrist mobility exercises')
      recommendations.push('Contrast bath therapy (alternating warm/cold water)')
    }

    return {
      circulationScore: Math.max(0, circulationScore),
      inflammationIndicators,
      jointSymmetry,
      colorAnalysis: `${inflammation.dominantHue} tones, ${inflammation.warmColorPercentage}% warm colors`,
      concerns,
      recommendations,
    }
  }

  async analyzeForwardBend(imageBase64: string): Promise<ForwardBendAnalysis> {
    const objects = await analyzeObjectLocalization(imageBase64)

    const head = objects.find((obj) => obj.name.toLowerCase().includes('head'))
    const torso = objects.find((obj) => obj.name.toLowerCase().includes('torso') || obj.name.toLowerCase().includes('person'))

    let flexibilityScore = 70
    let flexibility: 'excellent' | 'good' | 'moderate' | 'limited' = 'moderate'

    if (head && torso) {
      const bendDepth = torso.centerPoint.y - head.centerPoint.y

      if (bendDepth > 0.4) {
        flexibility = 'excellent'
        flexibilityScore = 95
      } else if (bendDepth > 0.3) {
        flexibility = 'good'
        flexibilityScore = 80
      } else if (bendDepth > 0.15) {
        flexibility = 'moderate'
        flexibilityScore = 60
      } else {
        flexibility = 'limited'
        flexibilityScore = 40
      }
    }

    const spinalCurveQuality = flexibility === 'excellent' || flexibility === 'good'
      ? 'Smooth spinal curve during forward bend'
      : 'Limited forward flexion - possible hamstring tightness or spinal restriction'

    const compensationPatterns = []
    if (flexibility === 'limited' || flexibility === 'moderate') {
      compensationPatterns.push('Hamstring tightness limiting bend depth')
      compensationPatterns.push('Possible lower back compensation')
    }

    const symmetry = objects.length >= 2

    const recommendations = []
    if (flexibility !== 'excellent') {
      recommendations.push('Daily hamstring stretches: 30 seconds, 3 sets each leg')
      recommendations.push('Cat-cow stretches for spinal mobility')
      recommendations.push('Gradual forward bend practice - don\'t force it')
    }
    if (compensationPatterns.length > 0) {
      recommendations.push('Focus on hip hinging rather than back rounding')
      recommendations.push('Foam roll hamstrings and calves')
    }

    return {
      hamstringFlexibility: flexibility,
      spinalCurveQuality,
      compensationPatterns,
      symmetry,
      recommendations,
      flexibilityScore,
    }
  }
}