"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Word {
  id: number
  english: string
  korean: string
}

interface FlashcardScreenProps {
  words: Word[]
  initialIndex: number
  onBack: () => void
}

export function FlashcardScreen({ words, initialIndex, onBack }: FlashcardScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isFlipped, setIsFlipped] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const currentWord = words[currentIndex]
  const minSwipeDistance = 50

  useEffect(() => {
    setIsFlipped(false)
  }, [currentIndex])

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && currentIndex < words.length - 1) {
      handleNext()
    }
    if (isRightSwipe && currentIndex > 0) {
      handlePrevious()
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-muted">
          <X className="w-5 h-5" />
        </Button>
        <div className="text-sm font-medium text-muted-foreground">
          {currentIndex + 1} / {words.length}
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div
          className="relative w-full max-w-md aspect-[3/4] cursor-pointer perspective-1000"
          onClick={handleFlip}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className={`relative w-full h-full transition-transform duration-500 preserve-3d ${
              isFlipped ? "rotate-y-180" : ""
            }`}
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front of card */}
            <div
              className="absolute inset-0 bg-card border-2 border-border rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center backface-hidden"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="text-center">
                <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-6">
                  영어
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-wider leading-tight">
                  {currentWord.english}
                </h2>
              </div>
              <div className="absolute bottom-8 text-xs text-muted-foreground">탭하여 뒤집기</div>
            </div>

            {/* Back of card */}
            <div
              className="absolute inset-0 bg-card border-2 border-accent rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center backface-hidden"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="text-center">
                <div className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full mb-6">
                  한글
                </div>
                <p className="text-2xl md:text-3xl font-medium text-foreground leading-relaxed">{currentWord.korean}</p>
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-lg text-muted-foreground font-medium">{currentWord.english}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 py-6 border-t border-border bg-card">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 bg-transparent"
        >
          <ChevronLeft className="w-5 h-5" />
          이전
        </Button>
        <div className="flex gap-1">
          {words.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-primary" : index < currentIndex ? "bg-accent" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <Button
          variant="outline"
          size="lg"
          onClick={handleNext}
          disabled={currentIndex === words.length - 1}
          className="flex items-center gap-2 bg-transparent"
        >
          다음
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
