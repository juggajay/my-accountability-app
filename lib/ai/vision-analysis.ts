import { openai } from './openai'

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
    const prompt = `You are a wellness tracking assistant helping users monitor their facial health over time for general wellness purposes. This is not medical diagnosis.

Analyze this facial photo for overall health indicators:

Observe:
- Skin health (color, clarity, hydration)
- Eye clarity and brightness
- Overall vitality and energy
- Any visible concern areas
- General wellness indicators

Provide health recommendations.

Format as JSON:
{
  "skinHealth": "description",
  "eyeClarity": "description",
  "overallVitality": "description",
  "concernAreas": ["concern 1", "concern 2"],
  "recommendations": ["rec 1", "rec 2"],
  "healthScore": 7
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
        skinHealth: content,
        eyeClarity: '',
        overallVitality: '',
        concernAreas: [],
        recommendations: [],
        healthScore: 0,
      }
    } catch (error) {
      console.error('Facial health analysis error:', error)
      throw error
    }
  }

  async analyzeIridology(
    leftEyeBase64: string,
    rightEyeBase64: string
  ): Promise<IridologyAnalysis> {
    const prompt = `You are an iridology tracking assistant helping users monitor iris patterns over time for wellness tracking purposes.

IMPORTANT DISCLAIMER: Iridology is considered alternative medicine and not scientifically validated. This analysis is for informational and tracking purposes only, not medical diagnosis.

Perform iridology analysis on these eye photos (left and right):

Analyze each eye for:
- Visible iris patterns and markings
- Color variations and pigmentation
- Structural features
- Potential organ system correlations (traditional iridology mapping)
- Any notable changes or areas of interest

Provide observations based on traditional iridology charts.

Format as JSON:
{
  "leftEye": {
    "observations": ["obs 1", "obs 2"],
    "organSystems": ["area 1", "area 2"],
    "concernAreas": ["concern 1"]
  },
  "rightEye": {
    "observations": ["obs 1", "obs 2"],
    "organSystems": ["area 1", "area 2"],
    "concernAreas": ["concern 1"]
  },
  "overallAssessment": "summary",
  "recommendations": ["rec 1", "rec 2"]
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
                  url: `data:image/jpeg;base64,${leftEyeBase64}`,
                },
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${rightEyeBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1200,
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
        leftEye: {
          observations: [],
          organSystems: [],
          concernAreas: [],
        },
        rightEye: {
          observations: [],
          organSystems: [],
          concernAreas: [],
        },
        overallAssessment: content,
        recommendations: [],
      }
    } catch (error) {
      console.error('Iridology analysis error:', error)
      throw error
    }
  }
}