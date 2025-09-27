import {
  PostureAnalysis,
  FacialHealthAnalysis,
  IridologyAnalysis,
  SideProfileAnalysis,
  BackViewAnalysis,
  SeatedPostureAnalysis,
  HandsAnalysis,
  ForwardBendAnalysis,
} from './vision-analysis'

export interface PostureChainAnalysis {
  chainType: 'forward_head_cascade' | 'lower_cross_syndrome' | 'upper_cross_syndrome' | 'none'
  severity: 'none' | 'mild' | 'moderate' | 'severe'
  affectedAreas: string[]
  description: string
  compensationFlow: string[]
  recommendations: string[]
}

export interface InflammationTracking {
  overallLevel: 'none' | 'mild' | 'moderate' | 'severe'
  primaryAreas: string[]
  systemicIndicators: boolean
  circulationIssues: boolean
  recommendations: string[]
}

export interface CompensationMap {
  patterns: Array<{
    primary: string
    compensations: string[]
    severity: 'mild' | 'moderate' | 'severe'
  }>
  totalPatterns: number
  riskLevel: 'low' | 'moderate' | 'high' | 'critical'
}

export interface PainPrediction {
  likelihood: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
  confidenceScore: number
  primaryRiskFactors: string[]
  predictedAreas: string[]
  preventionPriorities: string[]
}

export interface CorrelationResults {
  postureChain: PostureChainAnalysis
  inflammation: InflammationTracking
  compensationMap: CompensationMap
  painPrediction: PainPrediction
  overallHealthScore: number
  criticalFindings: string[]
  actionPriorities: string[]
}

export class CorrelationEngine {
  analyzePostureChain(data: {
    posture?: PostureAnalysis
    sideProfile?: SideProfileAnalysis
    backView?: BackViewAnalysis
    seatedPosture?: SeatedPostureAnalysis
    forwardBend?: ForwardBendAnalysis
  }): PostureChainAnalysis {
    const affectedAreas: string[] = []
    const compensationFlow: string[] = []
    let severityScore = 0

    if (data.sideProfile) {
      const fhpSeverity = data.sideProfile.forwardHeadPosture.severity
      if (fhpSeverity !== 'none') {
        affectedAreas.push('Cervical spine (forward head posture)')
        compensationFlow.push('Forward head posture detected')
        severityScore += fhpSeverity === 'severe' ? 3 : fhpSeverity === 'moderate' ? 2 : 1
      }

      if (data.sideProfile.neckCurve.includes('flattened')) {
        affectedAreas.push('Cervical curve (flattened)')
        compensationFlow.push('Loss of natural neck curve')
        severityScore += 2
      }

      if (data.sideProfile.upperBackAlignment.includes('kyphosis')) {
        affectedAreas.push('Thoracic spine (upper back rounding)')
        compensationFlow.push('Upper back compensation for forward head')
        severityScore += 2
      }
    }

    if (data.backView && (!data.backView.shoulderAlignment.symmetrical || !data.backView.hipAlignment.symmetrical)) {
      affectedAreas.push('Lateral spine (asymmetry)')
      compensationFlow.push('Lateral chain imbalance from asymmetry')
      severityScore += 2
    }

    if (data.forwardBend && (data.forwardBend.hamstringFlexibility === 'limited' || data.forwardBend.hamstringFlexibility === 'moderate')) {
      affectedAreas.push('Posterior chain (tight hamstrings)')
      compensationFlow.push('Lumbar spine compensates for hamstring tightness')
      severityScore += 1
    }

    if (data.seatedPosture && data.seatedPosture.workPostureIssues.length > 0) {
      affectedAreas.push('Work posture (sustained poor positioning)')
      compensationFlow.push('Daily seated posture reinforcing dysfunction')
      severityScore += 1
    }

    let chainType: 'forward_head_cascade' | 'lower_cross_syndrome' | 'upper_cross_syndrome' | 'none' = 'none'
    let severity: 'none' | 'mild' | 'moderate' | 'severe' = 'none'
    let description = 'No significant postural chain dysfunction detected'

    if (compensationFlow.length > 0) {
      if (severityScore >= 8) {
        severity = 'severe'
      } else if (severityScore >= 5) {
        severity = 'moderate'
      } else if (severityScore >= 2) {
        severity = 'mild'
      }

      if (data.sideProfile?.forwardHeadPosture.severity !== 'none' && data.sideProfile?.upperBackAlignment.includes('kyphosis')) {
        chainType = 'upper_cross_syndrome'
        description = 'Upper Cross Syndrome: Forward head and upper back rounding create a cascading postural dysfunction affecting neck, shoulders, and potentially lower back.'
      } else if (data.forwardBend && data.backView && !data.backView.hipAlignment.symmetrical) {
        chainType = 'lower_cross_syndrome'
        description = 'Lower Cross Syndrome: Hip and hamstring imbalances creating lower back and pelvic dysfunction.'
      } else if (data.sideProfile?.forwardHeadPosture.severity !== 'none') {
        chainType = 'forward_head_cascade'
        description = 'Forward Head Cascade: Forward head posture initiating compensations down the spinal chain.'
      }
    }

    const recommendations: string[] = []
    if (severity !== 'none') {
      recommendations.push('Address proximal issues first (start with head/neck positioning)')
      recommendations.push('Strengthen weak links in the kinetic chain')
      recommendations.push('Daily postural awareness breaks')
      if (data.seatedPosture) {
        recommendations.push('Ergonomic workspace assessment critical for sustained improvement')
      }
    }

    return {
      chainType,
      severity,
      affectedAreas,
      description,
      compensationFlow,
      recommendations,
    }
  }

  analyzeInflammation(data: {
    facial?: FacialHealthAnalysis
    hands?: HandsAnalysis
  }): InflammationTracking {
    const primaryAreas: string[] = []
    let overallLevel: 'none' | 'mild' | 'moderate' | 'severe' = 'none'
    let systemicIndicators = false
    let circulationIssues = false

    if (data.hands) {
      if (data.hands.inflammationIndicators.length > 0) {
        primaryAreas.push('Hands/extremities')

        const severeInflammation = data.hands.inflammationIndicators.some(
          (ind) => ind.includes('severe') || ind.includes('moderate')
        )
        if (severeInflammation) {
          overallLevel = 'moderate'
          systemicIndicators = true
        } else {
          overallLevel = 'mild'
        }
      }

      if (data.hands.circulationScore < 60) {
        circulationIssues = true
        primaryAreas.push('Circulation (hands)')
      }
    }

    if (data.facial) {
      const facialConcerns = data.facial.concernAreas.filter(
        (area) => area.toLowerCase().includes('inflammation') || area.toLowerCase().includes('redness')
      )
      if (facialConcerns.length > 0) {
        primaryAreas.push('Facial tissue')
        systemicIndicators = true
        if (overallLevel === 'none') overallLevel = 'mild'
      }
    }

    if (systemicIndicators && primaryAreas.length >= 2) {
      overallLevel = overallLevel === 'mild' ? 'moderate' : overallLevel
    }

    const recommendations: string[] = []
    if (overallLevel !== 'none') {
      recommendations.push('Anti-inflammatory diet: reduce sugar, processed foods, alcohol')
      recommendations.push('Increase omega-3 fatty acids (fish, walnuts, flaxseed)')
      recommendations.push('Stay well-hydrated (half body weight in oz of water daily)')
    }
    if (circulationIssues) {
      recommendations.push('Daily movement breaks to improve circulation')
      recommendations.push('Contrast therapy (alternating warm/cold)')
    }
    if (systemicIndicators) {
      recommendations.push('Consider food sensitivity testing')
      recommendations.push('Prioritize sleep quality (7-9 hours)')
    }

    return {
      overallLevel,
      primaryAreas,
      systemicIndicators,
      circulationIssues,
      recommendations,
    }
  }

  buildCompensationMap(data: {
    posture?: PostureAnalysis
    sideProfile?: SideProfileAnalysis
    backView?: BackViewAnalysis
    seatedPosture?: SeatedPostureAnalysis
    forwardBend?: ForwardBendAnalysis
  }): CompensationMap {
    const patterns: Array<{
      primary: string
      compensations: string[]
      severity: 'mild' | 'moderate' | 'severe'
    }> = []

    if (data.sideProfile && data.sideProfile.forwardHeadPosture.severity !== 'none') {
      const compensations: string[] = []
      if (data.sideProfile.neckCurve.includes('flattened')) {
        compensations.push('Cervical curve flattening')
      }
      if (data.sideProfile.upperBackAlignment.includes('kyphosis')) {
        compensations.push('Increased thoracic kyphosis')
      }
      if (data.posture && data.posture.compensationPatterns) {
        compensations.push(...data.posture.compensationPatterns.slice(0, 2))
      }

      patterns.push({
        primary: 'Forward Head Posture',
        compensations,
        severity: data.sideProfile.forwardHeadPosture.severity as 'mild' | 'moderate' | 'severe',
      })
    }

    if (data.backView && (!data.backView.shoulderAlignment.symmetrical || !data.backView.hipAlignment.symmetrical)) {
      const compensations: string[] = []
      if (!data.backView.shoulderAlignment.symmetrical) {
        compensations.push('Unilateral shoulder loading')
      }
      if (!data.backView.hipAlignment.symmetrical) {
        compensations.push('Pelvic obliquity')
        compensations.push('Unilateral weight bearing patterns')
      }

      patterns.push({
        primary: 'Lateral Asymmetry',
        compensations,
        severity: data.backView.scoliosisIndicators.length > 2 ? 'severe' : data.backView.scoliosisIndicators.length > 0 ? 'moderate' : 'mild',
      })
    }

    if (data.forwardBend && (data.forwardBend.compensationPatterns.length > 0)) {
      patterns.push({
        primary: 'Posterior Chain Tightness',
        compensations: data.forwardBend.compensationPatterns,
        severity: data.forwardBend.hamstringFlexibility === 'limited' ? 'severe' : data.forwardBend.hamstringFlexibility === 'moderate' ? 'moderate' : 'mild',
      })
    }

    if (data.seatedPosture && data.seatedPosture.workPostureIssues.length > 2) {
      patterns.push({
        primary: 'Sustained Seated Posture Dysfunction',
        compensations: data.seatedPosture.workPostureIssues,
        severity: data.seatedPosture.workPostureIssues.length >= 3 ? 'severe' : 'moderate',
      })
    }

    const riskLevel: 'low' | 'moderate' | 'high' | 'critical' =
      patterns.length === 0 ? 'low' :
      patterns.filter((p) => p.severity === 'severe').length >= 2 ? 'critical' :
      patterns.filter((p) => p.severity === 'severe').length >= 1 ? 'high' :
      patterns.length >= 3 ? 'high' :
      patterns.length >= 2 ? 'moderate' : 'low'

    return {
      patterns,
      totalPatterns: patterns.length,
      riskLevel,
    }
  }

  predictPain(data: {
    postureChain: PostureChainAnalysis
    inflammation: InflammationTracking
    compensationMap: CompensationMap
    forwardBend?: ForwardBendAnalysis
    backView?: BackViewAnalysis
  }): PainPrediction {
    const primaryRiskFactors: string[] = []
    const predictedAreas: string[] = []
    let riskScore = 0

    if (data.postureChain.severity === 'severe') {
      primaryRiskFactors.push('Severe postural chain dysfunction')
      riskScore += 30
    } else if (data.postureChain.severity === 'moderate') {
      primaryRiskFactors.push('Moderate postural compensation patterns')
      riskScore += 20
    } else if (data.postureChain.severity === 'mild') {
      primaryRiskFactors.push('Mild postural imbalances')
      riskScore += 10
    }

    if (data.postureChain.chainType === 'forward_head_cascade') {
      predictedAreas.push('Neck pain')
      predictedAreas.push('Upper back tension')
      predictedAreas.push('Headaches')
      riskScore += 15
    } else if (data.postureChain.chainType === 'upper_cross_syndrome') {
      predictedAreas.push('Neck and shoulder pain')
      predictedAreas.push('Mid-back pain')
      riskScore += 20
    } else if (data.postureChain.chainType === 'lower_cross_syndrome') {
      predictedAreas.push('Lower back pain')
      predictedAreas.push('Hip pain')
      predictedAreas.push('Sciatica risk')
      riskScore += 25
    }

    if (data.backView && !data.backView.hipAlignment.symmetrical) {
      primaryRiskFactors.push('Pelvic asymmetry')
      predictedAreas.push('Lower back pain (unilateral)')
      predictedAreas.push('SI joint dysfunction')
      riskScore += 15
    }

    if (data.forwardBend && (data.forwardBend.hamstringFlexibility === 'limited' || data.forwardBend.hamstringFlexibility === 'moderate')) {
      primaryRiskFactors.push('Posterior chain tightness')
      predictedAreas.push('Lower back strain')
      riskScore += 10
    }

    if (data.inflammation.systemicIndicators) {
      primaryRiskFactors.push('Systemic inflammation present')
      riskScore += 15
    }

    if (data.compensationMap.riskLevel === 'critical') {
      primaryRiskFactors.push('Multiple severe compensation patterns')
      riskScore += 20
    } else if (data.compensationMap.riskLevel === 'high') {
      primaryRiskFactors.push('Multiple compensation patterns')
      riskScore += 15
    }

    const likelihood: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high' =
      riskScore >= 80 ? 'very_high' :
      riskScore >= 60 ? 'high' :
      riskScore >= 40 ? 'moderate' :
      riskScore >= 20 ? 'low' : 'very_low'

    const confidenceScore = Math.min(0.95, primaryRiskFactors.length * 0.15 + 0.3)

    const preventionPriorities: string[] = []
    if (data.postureChain.severity !== 'none') {
      preventionPriorities.push('Address postural root cause (start proximal)')
    }
    if (predictedAreas.some((area) => area.includes('Lower back'))) {
      preventionPriorities.push('Core stability training')
      preventionPriorities.push('Hip mobility and strengthening')
    }
    if (predictedAreas.some((area) => area.includes('Neck'))) {
      preventionPriorities.push('Cervical strengthening and retraction exercises')
      preventionPriorities.push('Ergonomic workspace setup')
    }
    if (data.inflammation.overallLevel !== 'none') {
      preventionPriorities.push('Anti-inflammatory lifestyle modifications')
    }

    return {
      likelihood,
      confidenceScore: Math.round(confidenceScore * 100) / 100,
      primaryRiskFactors,
      predictedAreas: [...new Set(predictedAreas)],
      preventionPriorities,
    }
  }

  generateCorrelations(fullAnalysis: {
    posture?: PostureAnalysis
    facial?: FacialHealthAnalysis
    iridology?: IridologyAnalysis
    sideProfile?: SideProfileAnalysis
    backView?: BackViewAnalysis
    seatedPosture?: SeatedPostureAnalysis
    hands?: HandsAnalysis
    forwardBend?: ForwardBendAnalysis
  }): CorrelationResults {
    const postureChain = this.analyzePostureChain({
      posture: fullAnalysis.posture,
      sideProfile: fullAnalysis.sideProfile,
      backView: fullAnalysis.backView,
      seatedPosture: fullAnalysis.seatedPosture,
      forwardBend: fullAnalysis.forwardBend,
    })

    const inflammation = this.analyzeInflammation({
      facial: fullAnalysis.facial,
      hands: fullAnalysis.hands,
    })

    const compensationMap = this.buildCompensationMap({
      posture: fullAnalysis.posture,
      sideProfile: fullAnalysis.sideProfile,
      backView: fullAnalysis.backView,
      seatedPosture: fullAnalysis.seatedPosture,
      forwardBend: fullAnalysis.forwardBend,
    })

    const painPrediction = this.predictPain({
      postureChain,
      inflammation,
      compensationMap,
      forwardBend: fullAnalysis.forwardBend,
      backView: fullAnalysis.backView,
    })

    let overallHealthScore = 100
    overallHealthScore -= postureChain.severity === 'severe' ? 30 : postureChain.severity === 'moderate' ? 20 : postureChain.severity === 'mild' ? 10 : 0
    overallHealthScore -= inflammation.overallLevel === 'severe' ? 25 : inflammation.overallLevel === 'moderate' ? 15 : inflammation.overallLevel === 'mild' ? 8 : 0
    overallHealthScore -= compensationMap.riskLevel === 'critical' ? 20 : compensationMap.riskLevel === 'high' ? 15 : compensationMap.riskLevel === 'moderate' ? 10 : 0
    overallHealthScore = Math.max(0, overallHealthScore)

    const criticalFindings: string[] = []
    if (postureChain.severity === 'severe') {
      criticalFindings.push(`Severe ${postureChain.chainType.replace(/_/g, ' ')} detected`)
    }
    if (inflammation.systemicIndicators) {
      criticalFindings.push('Systemic inflammation markers present')
    }
    if (compensationMap.riskLevel === 'critical' || compensationMap.riskLevel === 'high') {
      criticalFindings.push(`${compensationMap.totalPatterns} compensation patterns identified`)
    }
    if (painPrediction.likelihood === 'very_high' || painPrediction.likelihood === 'high') {
      criticalFindings.push(`High pain likelihood: ${painPrediction.predictedAreas.join(', ')}`)
    }

    const actionPriorities: string[] = []
    if (postureChain.recommendations.length > 0) {
      actionPriorities.push(postureChain.recommendations[0])
    }
    if (painPrediction.preventionPriorities.length > 0) {
      actionPriorities.push(painPrediction.preventionPriorities[0])
    }
    if (inflammation.recommendations.length > 0 && inflammation.overallLevel !== 'none') {
      actionPriorities.push(inflammation.recommendations[0])
    }
    if (compensationMap.riskLevel === 'critical' || compensationMap.riskLevel === 'high') {
      actionPriorities.push('Professional assessment recommended (PT/chiropractor)')
    }

    return {
      postureChain,
      inflammation,
      compensationMap,
      painPrediction,
      overallHealthScore,
      criticalFindings,
      actionPriorities: actionPriorities.slice(0, 5),
    }
  }
}