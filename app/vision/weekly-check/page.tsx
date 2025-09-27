'use client'

import { useState, useEffect } from 'react'
import { PremiumCard } from '@/components/ui/premium-card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

type PhotoType = 'posture' | 'face' | 'leftEye' | 'rightEye'

interface Photos {
  posture: string | null
  face: string | null
  leftEye: string | null
  rightEye: string | null
}

export default function WeeklyCheckPage() {
  const [currentStep, setCurrentStep] = useState<PhotoType>('posture')
  const [photos, setPhotos] = useState<Photos>({
    posture: null,
    face: null,
    leftEye: null,
    rightEye: null,
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
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
    if (!photos.posture || !photos.face || !photos.leftEye || !photos.rightEye) {
      alert('Please capture all 4 photos first')
      return
    }

    setIsAnalyzing(true)
    try {
      const [postureRes, faceRes, iridologyRes] = await Promise.all([
        fetch('/api/vision/posture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: photos.posture.split(',')[1],
            saveToHistory: true,
          }),
        }),
        fetch('/api/vision/facial-health', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: photos.face.split(',')[1],
          }),
        }),
        fetch('/api/vision/iridology', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leftEyeBase64: photos.leftEye.split(',')[1],
            rightEyeBase64: photos.rightEye.split(',')[1],
          }),
        }),
      ])

      const [postureData, faceData, iridologyData] = await Promise.all([
        postureRes.json(),
        faceRes.json(),
        iridologyRes.json(),
      ])

      if (postureData.success && faceData.success && iridologyData.success) {
        setAnalysis({
          posture: postureData.analysis,
          facial: faceData.analysis,
          iridology: iridologyData.analysis,
        })
        
        localStorage.setItem('lastWeeklyCheck', new Date().toISOString())
        setLastCheckDate(new Date().toISOString())
      }
    } catch (error) {
      console.error('Analysis error:', error)
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
            Complete full body analysis: Posture, Face, and Eyes (Iridology)
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

        {!analysis && (
          <>
            <div className="grid grid-cols-4 gap-2">
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
                    Step {currentStepIndex + 1}/4
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
                Your comprehensive analysis is ready. Review each section below.
              </p>
            </PremiumCard>

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

            <Button
              onClick={() => {
                setAnalysis(null)
                setPhotos({ posture: null, face: null, leftEye: null, rightEye: null })
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