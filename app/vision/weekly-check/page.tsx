'use client'

import { useState, useEffect } from 'react'
import { PremiumCard } from '@/components/ui/premium-card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

type PhotoType = 'posture' | 'face' | 'leftEye' | 'rightEye' | 'sideProfile' | 'backView' | 'hands' | 'forwardBend'

interface Photos {
  posture: string | null
  face: string | null
  leftEye: string | null
  rightEye: string | null
  sideProfile: string | null
  backView: string | null
  hands: string | null
  forwardBend: string | null
}

export default function WeeklyCheckPage() {
  const [currentStep, setCurrentStep] = useState<PhotoType>('posture')
  const [photos, setPhotos] = useState<Photos>({
    posture: null,
    face: null,
    leftEye: null,
    rightEye: null,
    sideProfile: null,
    backView: null,
    hands: null,
    forwardBend: null,
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastCheckDate, setLastCheckDate] = useState<string | null>(null)

  useEffect(() => {
    const lastCheck = localStorage.getItem('lastWeeklyCheck')
    setLastCheckDate(lastCheck)
  }, [])

  const photoSteps: { type: PhotoType; title: string; instructions: string; icon: string }[] = [
    {
      type: 'posture',
      title: 'Full Body Posture',
      instructions: 'Stand sideways against a wall, relaxed natural posture. Have someone take the photo or use a timer.',
      icon: '🧍',
    },
    {
      type: 'face',
      title: 'Facial Health',
      instructions: 'Face the camera directly, neutral expression, good lighting. Remove glasses if possible.',
      icon: '😊',
    },
    {
      type: 'leftEye',
      title: 'Left Eye (Iridology)',
      instructions: 'Close-up of left eye, look directly at camera, bright lighting. Get as close as possible for iris detail.',
      icon: '👁️',
    },
    {
      type: 'rightEye',
      title: 'Right Eye (Iridology)',
      instructions: 'Close-up of right eye, look directly at camera, bright lighting. Get as close as possible for iris detail.',
      icon: '👁️',
    },
    {
      type: 'sideProfile',
      title: 'Side Profile',
      instructions: 'Stand sideways to camera, natural posture. Shows forward head posture, neck curve, upper back alignment.',
      icon: '🪞',
    },
    {
      type: 'backView',
      title: 'Back View',
      instructions: 'Stand with back to camera, arms relaxed. Shows shoulder/hip alignment, scoliosis indicators, spinal symmetry.',
      icon: '🔙',
    },
    {
      type: 'hands',
      title: 'Hands',
      instructions: 'Both hands palms down, fingers spread, good lighting. Shows circulation, inflammation, joint issues.',
      icon: '🤲',
    },
    {
      type: 'forwardBend',
      title: 'Forward Bend Test',
      instructions: 'Bend forward from waist, arms hanging, side view. Shows hamstring flexibility, spinal curves, compensation patterns.',
      icon: '🤸',
    },
  ]

  const currentStepIndex = photoSteps.findIndex(s => s.type === currentStep)
  const currentStepData = photoSteps[currentStepIndex]

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotos(prev => ({
          ...prev,
          [currentStep]: reader.result as string,
        }))
        
        if (currentStepIndex < photoSteps.length - 1) {
          setCurrentStep(photoSteps[currentStepIndex + 1].type)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTakePhoto = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.onchange = (e: any) => handlePhotoCapture(e)
    input.click()
  }

  const handleAnalyzeAll = async () => {
    if (!allPhotosComplete) {
      alert('Please capture all 8 photos first')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    try {
      const [
        postureRes,
        faceRes,
        iridologyRes,
        sideProfileRes,
        backViewRes,
        handsRes,
        forwardBendRes,
      ] = await Promise.all([
        fetch('/api/vision/posture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: photos.posture!.split(',')[1],
            saveToHistory: true,
          }),
        }),
        fetch('/api/vision/facial-health', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: photos.face!.split(',')[1],
          }),
        }),
        fetch('/api/vision/iridology', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leftEyeBase64: photos.leftEye!.split(',')[1],
            rightEyeBase64: photos.rightEye!.split(',')[1],
          }),
        }),
        fetch('/api/vision/side-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: photos.sideProfile!.split(',')[1],
          }),
        }),
        fetch('/api/vision/back-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: photos.backView!.split(',')[1],
          }),
        }),
        fetch('/api/vision/hands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: photos.hands!.split(',')[1],
          }),
        }),
        fetch('/api/vision/forward-bend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: photos.forwardBend!.split(',')[1],
          }),
        }),
      ])

      const [
        postureData,
        faceData,
        iridologyData,
        sideProfileData,
        backViewData,
        handsData,
        forwardBendData,
      ] = await Promise.all([
        postureRes.json(),
        faceRes.json(),
        iridologyRes.json(),
        sideProfileRes.json(),
        backViewRes.json(),
        handsRes.json(),
        forwardBendRes.json(),
      ])

      if (!postureData.success) {
        setError(`Posture analysis failed: ${postureData.error || 'Unknown error'}`)
        return
      }
      if (!faceData.success) {
        setError(`Facial health analysis failed: ${faceData.error || 'Unknown error'}`)
        return
      }
      if (!iridologyData.success) {
        setError(`Iridology analysis failed: ${iridologyData.error || 'Unknown error'}`)
        return
      }
      if (!sideProfileData.success) {
        setError(`Side profile analysis failed: ${sideProfileData.error || 'Unknown error'}`)
        return
      }
      if (!backViewData.success) {
        setError(`Back view analysis failed: ${backViewData.error || 'Unknown error'}`)
        return
      }
      if (!handsData.success) {
        setError(`Hands analysis failed: ${handsData.error || 'Unknown error'}`)
        return
      }
      if (!forwardBendData.success) {
        setError(`Forward bend analysis failed: ${forwardBendData.error || 'Unknown error'}`)
        return
      }

      const analysisData = {
        posture: postureData.analysis,
        facial: faceData.analysis,
        iridology: iridologyData.analysis,
        sideProfile: sideProfileData.analysis,
        backView: backViewData.analysis,
        hands: handsData.analysis,
        forwardBend: forwardBendData.analysis,
      }

      const correlationsRes = await fetch('/api/vision/correlations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisData),
      })

      const correlationsData = await correlationsRes.json()

      setAnalysis({
        ...analysisData,
        correlations: correlationsData.success ? correlationsData.correlations : null,
      })

      localStorage.setItem('lastWeeklyCheck', new Date().toISOString())
      setLastCheckDate(new Date().toISOString())
    } catch (error) {
      console.error('Analysis error:', error)
      setError(`Failed to analyze: ${error instanceof Error ? error.message : 'Network error'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const allPhotosComplete = Object.values(photos).every(p => p !== null)

  return (
    <div className="min-h-screen bg-neutral-950 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Weekly Health Check</h1>
          <p className="text-neutral-400 mt-2">
            Complete comprehensive 8-photo analysis: Posture, Face, Eyes, Alignment, Flexibility
          </p>
          {lastCheckDate && (
            <p className="text-sm text-neutral-500 mt-1">
              Last check: {format(new Date(lastCheckDate), 'MMM d, yyyy')}
            </p>
          )}
        </div>

        <PremiumCard className="bg-warning-900/20 border-warning-500/50">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚕️</span>
            <div className="text-warning-300 text-sm">
              <strong>Medical Disclaimer:</strong> This analysis is for informational and tracking purposes only. 
              Iridology is considered alternative medicine and not scientifically validated. 
              Always consult healthcare professionals for medical advice.
            </div>
          </div>
        </PremiumCard>

        {error && (
          <PremiumCard className="bg-danger-900/20 border-danger-500/50">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <strong className="text-danger-300">Analysis Error:</strong>
                <p className="text-danger-200 text-sm mt-1">{error}</p>
              </div>
            </div>
          </PremiumCard>
        )}

        {!analysis && (
          <>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {photoSteps.map((step, idx) => (
                <div
                  key={step.type}
                  className={`p-3 rounded-lg text-center ${
                    photos[step.type]
                      ? 'bg-success-900/30 border border-success-500/50'
                      : currentStep === step.type
                      ? 'bg-primary-900/30 border border-primary-500/50'
                      : 'bg-neutral-800 border border-neutral-700'
                  }`}
                >
                  <div className="text-2xl mb-1">{photos[step.type] ? '✅' : step.icon}</div>
                  <div className="text-xs text-neutral-300">{step.title.split(' ')[0]}</div>
                </div>
              ))}
            </div>

            <PremiumCard>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    {currentStepData.icon} {currentStepData.title}
                  </h2>
                  <span className="text-sm text-neutral-400">
                    Step {currentStepIndex + 1}/8
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-primary-900/20 border border-primary-500/30">
                  <p className="text-neutral-300 text-sm">
                    📋 <strong>Instructions:</strong> {currentStepData.instructions}
                  </p>
                </div>

                {!photos[currentStep] ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className="text-6xl mb-2">{currentStepData.icon}</div>
                    <div className="flex flex-col gap-3 w-full max-w-xs">
                      <Button onClick={handleTakePhoto} className="w-full">
                        📷 Take Photo
                      </Button>
                      <label className="cursor-pointer">
                        <div className="w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors text-center">
                          📁 Upload Photo
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoCapture}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative w-full max-w-sm mx-auto rounded-lg overflow-hidden">
                      <img
                        src={photos[currentStep]!}
                        alt={currentStepData.title}
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleTakePhoto}
                        className="flex-1 bg-neutral-700 hover:bg-neutral-600"
                      >
                        🔄 Retake
                      </Button>
                      {currentStepIndex < photoSteps.length - 1 && (
                        <Button
                          onClick={() => setCurrentStep(photoSteps[currentStepIndex + 1].type)}
                          className="flex-1"
                        >
                          Next →
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {allPhotosComplete && (
                  <Button
                    onClick={handleAnalyzeAll}
                    disabled={isAnalyzing}
                    className="w-full bg-success-600 hover:bg-success-700"
                  >
                    {isAnalyzing ? 'Analyzing All Photos...' : '✨ Analyze Complete Check'}
                  </Button>
                )}
              </div>
            </PremiumCard>
          </>
        )}

        {analysis && (
          <div className="space-y-6">
            <PremiumCard variant="gradient">
              <h2 className="text-2xl font-bold mb-4">✅ Weekly Check Complete!</h2>
              <p className="text-neutral-300">
                Your comprehensive 8-photo analysis is ready. Review each section below.
              </p>
            </PremiumCard>

            {analysis.correlations && (
              <>
                <PremiumCard className="bg-primary-900/30 border-primary-500/50">
                  <h3 className="text-2xl font-bold mb-4">📊 Overall Health Score</h3>
                  <div className="flex items-center justify-center mb-4">
                    <div className="text-6xl font-bold text-primary-400">
                      {analysis.correlations.overallHealthScore}/100
                    </div>
                  </div>
                  {analysis.correlations.criticalFindings.length > 0 && (
                    <div className="mt-4 p-4 rounded-lg bg-warning-900/30 border border-warning-500/50">
                      <strong className="text-warning-300">⚠️ Critical Findings:</strong>
                      <ul className="list-disc ml-5 mt-2">
                        {analysis.correlations.criticalFindings.map((finding: string, i: number) => (
                          <li key={i} className="text-neutral-300">{finding}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.correlations.actionPriorities.length > 0 && (
                    <div className="mt-4 p-4 rounded-lg bg-success-900/30 border border-success-500/50">
                      <strong className="text-success-300">🎯 Action Priorities:</strong>
                      <ol className="list-decimal ml-5 mt-2">
                        {analysis.correlations.actionPriorities.map((action: string, i: number) => (
                          <li key={i} className="text-neutral-300 font-semibold">{action}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </PremiumCard>

                <PremiumCard>
                  <h3 className="text-xl font-bold mb-3">🔗 Posture Chain Analysis</h3>
                  <div className="space-y-2">
                    <div>
                      <strong className="text-primary-400">Severity:</strong> {analysis.correlations.postureChain.severity}
                    </div>
                    <div>
                      <strong>Type:</strong> {analysis.correlations.postureChain.chainType.replace(/_/g, ' ')}
                    </div>
                    <div>
                      <strong>Description:</strong> {analysis.correlations.postureChain.description}
                    </div>
                    {analysis.correlations.postureChain.affectedAreas.length > 0 && (
                      <div>
                        <strong className="text-warning-400">Affected Areas:</strong>
                        <ul className="list-disc ml-5 mt-1">
                          {analysis.correlations.postureChain.affectedAreas.map((area: string, i: number) => (
                            <li key={i} className="text-neutral-300">{area}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.correlations.postureChain.compensationFlow.length > 0 && (
                      <div>
                        <strong className="text-danger-400">Compensation Flow:</strong>
                        <ol className="list-decimal ml-5 mt-1">
                          {analysis.correlations.postureChain.compensationFlow.map((flow: string, i: number) => (
                            <li key={i} className="text-neutral-300">{flow}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </PremiumCard>

                <PremiumCard>
                  <h3 className="text-xl font-bold mb-3">🔥 Inflammation Tracking</h3>
                  <div className="space-y-2">
                    <div>
                      <strong className="text-primary-400">Overall Level:</strong> {analysis.correlations.inflammation.overallLevel}
                    </div>
                    <div>
                      <strong>Systemic Indicators:</strong> {analysis.correlations.inflammation.systemicIndicators ? '⚠️ Yes' : '✓ No'}
                    </div>
                    <div>
                      <strong>Circulation Issues:</strong> {analysis.correlations.inflammation.circulationIssues ? '⚠️ Detected' : '✓ Normal'}
                    </div>
                    {analysis.correlations.inflammation.primaryAreas.length > 0 && (
                      <div>
                        <strong className="text-warning-400">Primary Areas:</strong>
                        <ul className="list-disc ml-5 mt-1">
                          {analysis.correlations.inflammation.primaryAreas.map((area: string, i: number) => (
                            <li key={i} className="text-neutral-300">{area}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </PremiumCard>

                <PremiumCard>
                  <h3 className="text-xl font-bold mb-3">🗺️ Compensation Map</h3>
                  <div className="space-y-2">
                    <div>
                      <strong className="text-primary-400">Risk Level:</strong> {analysis.correlations.compensationMap.riskLevel}
                    </div>
                    <div>
                      <strong>Total Patterns:</strong> {analysis.correlations.compensationMap.totalPatterns}
                    </div>
                    {analysis.correlations.compensationMap.patterns.map((pattern: { primary: string; compensations: string[]; severity: string }, i: number) => (
                      <div key={i} className="mt-3 p-3 rounded-lg bg-neutral-800 border border-neutral-700">
                        <div className="font-semibold text-warning-300">{pattern.primary} ({pattern.severity})</div>
                        <ul className="list-disc ml-5 mt-1">
                          {pattern.compensations.map((comp: string, j: number) => (
                            <li key={j} className="text-sm text-neutral-400">{comp}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </PremiumCard>

                <PremiumCard>
                  <h3 className="text-xl font-bold mb-3">⚡ Pain Prediction</h3>
                  <div className="space-y-2">
                    <div>
                      <strong className="text-primary-400">Likelihood:</strong> {analysis.correlations.painPrediction.likelihood.replace(/_/g, ' ')}
                    </div>
                    <div>
                      <strong>Confidence:</strong> {(analysis.correlations.painPrediction.confidenceScore * 100).toFixed(0)}%
                    </div>
                    {analysis.correlations.painPrediction.primaryRiskFactors.length > 0 && (
                      <div>
                        <strong className="text-danger-400">Primary Risk Factors:</strong>
                        <ul className="list-disc ml-5 mt-1">
                          {analysis.correlations.painPrediction.primaryRiskFactors.map((factor: string, i: number) => (
                            <li key={i} className="text-neutral-300">{factor}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.correlations.painPrediction.predictedAreas.length > 0 && (
                      <div>
                        <strong className="text-warning-400">Predicted Pain Areas:</strong>
                        <ul className="list-disc ml-5 mt-1">
                          {analysis.correlations.painPrediction.predictedAreas.map((area: string, i: number) => (
                            <li key={i} className="text-neutral-300">{area}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.correlations.painPrediction.preventionPriorities.length > 0 && (
                      <div>
                        <strong className="text-success-400">Prevention Priorities:</strong>
                        <ol className="list-decimal ml-5 mt-1">
                          {analysis.correlations.painPrediction.preventionPriorities.map((priority: string, i: number) => (
                            <li key={i} className="text-neutral-300">{priority}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </PremiumCard>
              </>
            )}

            <PremiumCard>
              <h3 className="text-xl font-bold mb-3">🧍 Posture Analysis</h3>
              <div className="space-y-2">
                <div>
                  <strong className="text-primary-400">Rating:</strong> {analysis.posture.rating}/10
                </div>
                <div>
                  <strong>Description:</strong> {analysis.posture.description}
                </div>
                {analysis.posture.corrections?.length > 0 && (
                  <div>
                    <strong className="text-success-400">Corrections:</strong>
                    <ul className="list-disc ml-5 mt-1">
                      {analysis.posture.corrections.map((c: string, i: number) => (
                        <li key={i} className="text-neutral-300">{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </PremiumCard>

            <PremiumCard>
              <h3 className="text-xl font-bold mb-3">😊 Facial Health</h3>
              <div className="space-y-2">
                <div>
                  <strong className="text-primary-400">Health Score:</strong> {analysis.facial.healthScore}/10
                </div>
                <div><strong>Skin Health:</strong> {analysis.facial.skinHealth}</div>
                <div><strong>Eye Clarity:</strong> {analysis.facial.eyeClarity}</div>
                <div><strong>Vitality:</strong> {analysis.facial.overallVitality}</div>
                {analysis.facial.recommendations?.length > 0 && (
                  <div>
                    <strong className="text-success-400">Recommendations:</strong>
                    <ul className="list-disc ml-5 mt-1">
                      {analysis.facial.recommendations.map((r: string, i: number) => (
                        <li key={i} className="text-neutral-300">{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </PremiumCard>

            <PremiumCard>
              <h3 className="text-xl font-bold mb-3">👁️ Iridology Analysis</h3>
              <div className="space-y-4">
                <div>
                  <strong className="text-primary-400">Left Eye:</strong>
                  <div className="ml-4 mt-1 space-y-1">
                    {analysis.iridology.leftEye.observations.map((obs: string, i: number) => (
                      <div key={i} className="text-sm text-neutral-300">• {obs}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <strong className="text-primary-400">Right Eye:</strong>
                  <div className="ml-4 mt-1 space-y-1">
                    {analysis.iridology.rightEye.observations.map((obs: string, i: number) => (
                      <div key={i} className="text-sm text-neutral-300">• {obs}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <strong>Overall Assessment:</strong> {analysis.iridology.overallAssessment}
                </div>
              </div>
            </PremiumCard>

            {analysis.sideProfile && (
              <PremiumCard>
                <h3 className="text-xl font-bold mb-3">🪞 Side Profile Analysis</h3>
                <div className="space-y-2">
                  <div>
                    <strong className="text-primary-400">Health Score:</strong> {analysis.sideProfile.healthScore}/100
                  </div>
                  <div>
                    <strong>Forward Head Posture:</strong> {analysis.sideProfile.forwardHeadPosture.severity} ({analysis.sideProfile.forwardHeadPosture.description})
                  </div>
                  <div><strong>Neck Curve:</strong> {analysis.sideProfile.neckCurve}</div>
                  <div><strong>Upper Back:</strong> {analysis.sideProfile.upperBackAlignment}</div>
                  {analysis.sideProfile.recommendations?.length > 0 && (
                    <div>
                      <strong className="text-success-400">Recommendations:</strong>
                      <ul className="list-disc ml-5 mt-1">
                        {analysis.sideProfile.recommendations.map((r: string, i: number) => (
                          <li key={i} className="text-neutral-300">{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </PremiumCard>
            )}

            {analysis.backView && (
              <PremiumCard>
                <h3 className="text-xl font-bold mb-3">🔙 Back View Analysis</h3>
                <div className="space-y-2">
                  <div>
                    <strong className="text-primary-400">Health Score:</strong> {analysis.backView.healthScore}/100
                  </div>
                  <div>
                    <strong>Shoulder Alignment:</strong> {analysis.backView.shoulderAlignment.symmetrical ? '✓ Symmetrical' : '⚠ ' + analysis.backView.shoulderAlignment.deviation}
                  </div>
                  <div>
                    <strong>Hip Alignment:</strong> {analysis.backView.hipAlignment.symmetrical ? '✓ Symmetrical' : '⚠ ' + analysis.backView.hipAlignment.deviation}
                  </div>
                  <div><strong>Spinal Alignment:</strong> {analysis.backView.spinalAlignment}</div>
                  {analysis.backView.scoliosisIndicators?.length > 0 && (
                    <div>
                      <strong className="text-warning-400">Indicators:</strong>
                      <ul className="list-disc ml-5 mt-1">
                        {analysis.backView.scoliosisIndicators.map((ind: string, i: number) => (
                          <li key={i} className="text-neutral-300">{ind}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.backView.recommendations?.length > 0 && (
                    <div>
                      <strong className="text-success-400">Recommendations:</strong>
                      <ul className="list-disc ml-5 mt-1">
                        {analysis.backView.recommendations.map((r: string, i: number) => (
                          <li key={i} className="text-neutral-300">{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </PremiumCard>
            )}

            {analysis.hands && (
              <PremiumCard>
                <h3 className="text-xl font-bold mb-3">🤲 Hands Analysis</h3>
                <div className="space-y-2">
                  <div>
                    <strong className="text-primary-400">Circulation Score:</strong> {analysis.hands.circulationScore}/100
                  </div>
                  <div><strong>Color Analysis:</strong> {analysis.hands.colorAnalysis}</div>
                  <div><strong>Joint Symmetry:</strong> {analysis.hands.jointSymmetry ? '✓ Symmetrical' : '⚠ Asymmetrical'}</div>
                  {analysis.hands.inflammationIndicators?.length > 0 && (
                    <div>
                      <strong className="text-warning-400">Inflammation Indicators:</strong>
                      <ul className="list-disc ml-5 mt-1">
                        {analysis.hands.inflammationIndicators.map((ind: string, i: number) => (
                          <li key={i} className="text-neutral-300">{ind}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.hands.concerns?.length > 0 && (
                    <div>
                      <strong className="text-danger-400">Concerns:</strong>
                      <ul className="list-disc ml-5 mt-1">
                        {analysis.hands.concerns.map((c: string, i: number) => (
                          <li key={i} className="text-neutral-300">{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.hands.recommendations?.length > 0 && (
                    <div>
                      <strong className="text-success-400">Recommendations:</strong>
                      <ul className="list-disc ml-5 mt-1">
                        {analysis.hands.recommendations.map((r: string, i: number) => (
                          <li key={i} className="text-neutral-300">{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </PremiumCard>
            )}

            {analysis.forwardBend && (
              <PremiumCard>
                <h3 className="text-xl font-bold mb-3">🤸 Forward Bend Test</h3>
                <div className="space-y-2">
                  <div>
                    <strong className="text-primary-400">Flexibility Score:</strong> {analysis.forwardBend.flexibilityScore}/100
                  </div>
                  <div><strong>Hamstring Flexibility:</strong> {analysis.forwardBend.hamstringFlexibility}</div>
                  <div><strong>Spinal Curve:</strong> {analysis.forwardBend.spinalCurveQuality}</div>
                  <div><strong>Symmetry:</strong> {analysis.forwardBend.symmetry ? '✓ Balanced' : '⚠ Asymmetrical'}</div>
                  {analysis.forwardBend.compensationPatterns?.length > 0 && (
                    <div>
                      <strong className="text-warning-400">Compensation Patterns:</strong>
                      <ul className="list-disc ml-5 mt-1">
                        {analysis.forwardBend.compensationPatterns.map((pattern: string, i: number) => (
                          <li key={i} className="text-neutral-300">{pattern}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.forwardBend.recommendations?.length > 0 && (
                    <div>
                      <strong className="text-success-400">Recommendations:</strong>
                      <ul className="list-disc ml-5 mt-1">
                        {analysis.forwardBend.recommendations.map((r: string, i: number) => (
                          <li key={i} className="text-neutral-300">{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </PremiumCard>
            )}

            <Button
              onClick={() => {
                setAnalysis(null)
                setPhotos({
                  posture: null,
                  face: null,
                  leftEye: null,
                  rightEye: null,
                  sideProfile: null,
                  backView: null,
                  hands: null,
                  forwardBend: null,
                })
                setCurrentStep('posture')
              }}
              className="w-full"
            >
              Start New Check
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}