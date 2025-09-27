'use client'

import { useState } from 'react'
import { PremiumCard } from '@/components/ui/premium-card'
import { Button } from '@/components/ui/button'

export default function PostureCheckPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
        setAnalysis(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    try {
      const base64 = selectedImage.split(',')[1]
      
      const response = await fetch('/api/vision/posture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          saveToHistory: true,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setAnalysis(result.analysis)
      } else {
        console.error('Analysis failed:', result.error)
      }
    } catch (error) {
      console.error('Analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleTakePhoto = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.onchange = (e: any) => handleImageUpload(e)
    input.click()
  }

  return (
    <div className="min-h-screen bg-neutral-950 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            AI Posture Check
          </h1>
          <p className="text-neutral-400 mt-2">
            Upload or take a photo for AI-powered posture analysis
          </p>
        </div>

        <PremiumCard>
          <div className="space-y-4">
            {!selectedImage ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="text-6xl mb-4">📸</div>
                <p className="text-neutral-400 text-center">
                  Take a photo or upload an image to analyze your posture
                </p>
                <div className="flex gap-3">
                  <Button onClick={handleTakePhoto}>
                    📷 Take Photo
                  </Button>
                  <label className="cursor-pointer">
                    <div className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors inline-block">
                      📁 Upload Photo
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative w-full max-w-md mx-auto rounded-lg overflow-hidden">
                  <img
                    src={selectedImage}
                    alt="Your posture"
                    className="w-full h-auto"
                  />
                </div>
                
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="flex-1 max-w-xs"
                  >
                    {isAnalyzing ? 'Analyzing...' : '✨ Analyze Posture'}
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedImage(null)
                      setAnalysis(null)
                    }}
                    className="bg-neutral-700 hover:bg-neutral-600"
                  >
                    🔄 New Photo
                  </Button>
                </div>
              </div>
            )}
          </div>
        </PremiumCard>

        {analysis && (
          <>
            <PremiumCard variant="gradient">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Posture Rating</h2>
                <div className="text-4xl font-bold text-primary-400">
                  {analysis.rating}/10
                </div>
              </div>
              <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all"
                  style={{ width: `${(analysis.rating / 10) * 100}%` }}
                />
              </div>
            </PremiumCard>

            <PremiumCard>
              <h3 className="text-lg font-bold mb-3">📋 Analysis</h3>
              <p className="text-neutral-300 whitespace-pre-wrap">
                {analysis.description}
              </p>
            </PremiumCard>

            {analysis.compensationPatterns?.length > 0 && (
              <PremiumCard>
                <h3 className="text-lg font-bold mb-3 text-warning-400">
                  ⚠️ Compensation Patterns
                </h3>
                <ul className="space-y-2">
                  {analysis.compensationPatterns.map((pattern: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-warning-400 mt-1">•</span>
                      <span className="text-neutral-300">{pattern}</span>
                    </li>
                  ))}
                </ul>
              </PremiumCard>
            )}

            {analysis.corrections?.length > 0 && (
              <PremiumCard>
                <h3 className="text-lg font-bold mb-3 text-success-400">
                  ✅ Suggested Corrections
                </h3>
                <ul className="space-y-2">
                  {analysis.corrections.map((correction: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-success-400 mt-1">✓</span>
                      <span className="text-neutral-300">{correction}</span>
                    </li>
                  ))}
                </ul>
              </PremiumCard>
            )}

            {analysis.comparisonToIdeal && (
              <PremiumCard>
                <h3 className="text-lg font-bold mb-3">🎯 Comparison to Ideal</h3>
                <p className="text-neutral-300">{analysis.comparisonToIdeal}</p>
              </PremiumCard>
            )}
          </>
        )}
      </div>
    </div>
  )
}