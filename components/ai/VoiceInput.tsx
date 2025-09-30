'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export function VoiceInput({ onTranscript, disabled = false }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check if browser supports speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = ''
          let interimTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPart = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcriptPart
            } else {
              interimTranscript += transcriptPart
            }
          }

          if (finalTranscript) {
            setTranscript(finalTranscript)
            setIsListening(false)
            onTranscript(finalTranscript)
          } else {
            setTranscript(interimTranscript)
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setError('Could not capture audio. Please try again.')
          setIsListening(false)
          setIsProcessing(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
          setIsProcessing(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onTranscript])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not supported in this browser')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setError(null)
      setTranscript('')
      setIsListening(true)
      setIsProcessing(true)
      try {
        recognitionRef.current.start()
      } catch (err) {
        console.error('Failed to start recognition:', err)
        setError('Failed to start microphone')
        setIsListening(false)
        setIsProcessing(false)
      }
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggleListening}
        disabled={disabled || !recognitionRef.current}
        className={`p-3 rounded-xl transition-all ${
          isListening
            ? 'bg-red-500/20 text-red-400 animate-pulse'
            : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isListening ? 'Stop recording' : 'Start voice input'}
      >
        {isProcessing && !isListening ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {/* Transcript preview */}
      {transcript && (
        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg whitespace-nowrap max-w-xs overflow-hidden text-ellipsis">
          {transcript}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-red-500/20 text-red-400 text-sm rounded-lg whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  )
}