"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, List, ArrowLeftRight } from "lucide-react"
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
  const [isKoreanFirst, setIsKoreanFirst] = useState(false)

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
      <header className="flex items-center justify-between px-5 py-4 border-b border-border bg-card/95 backdrop-blur-md">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsKoreanFirst(!isKoreanFirst)
            setIsFlipped(false)
          }}
          className="flex items-center gap-2 rounded-full px-4 py-2 active:scale-95 transition-all"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span className="text-xs font-semibold">{isKoreanFirst ? "한→영" : "영→한"}</span>
        </Button>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-muted/50 rounded-full">
          <span className="text-sm font-bold text-primary">{currentIndex + 1}</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm font-medium text-muted-foreground">{words.length}</span>
        </div>
        <div className="w-16" />
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-muted">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 rounded-r-full"
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
              className="absolute inset-0 bg-card border-2 border-border rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center backface-hidden"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="text-center">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 ${
                    isKoreanFirst ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                  } text-xs font-bold rounded-full mb-8`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${isKoreanFirst ? "bg-accent" : "bg-primary"}`} />
                  {isKoreanFirst ? "한글" : "영어"}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-wide leading-tight px-4">
                  {isKoreanFirst ? currentWord.korean : currentWord.english}
                </h2>
              </div>
              <div className="absolute bottom-8 flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-8 h-1 rounded-full bg-muted-foreground/20" />
                <span>탭하여 뒤집기</span>
                <div className="w-8 h-1 rounded-full bg-muted-foreground/20" />
              </div>
            </div>

            {/* Back of card */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-card to-accent/5 border-2 border-accent/50 rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center backface-hidden"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="text-center">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 ${
                    isKoreanFirst ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                  } text-xs font-bold rounded-full mb-8`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${isKoreanFirst ? "bg-primary" : "bg-accent"}`} />
                  {isKoreanFirst ? "영어" : "한글"}
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground leading-relaxed px-4">
                  {isKoreanFirst ? currentWord.english : currentWord.korean}
                </p>
                <div className="mt-8 pt-6 border-t border-border/50">
                  <p className="text-base text-muted-foreground font-medium">
                    {isKoreanFirst ? currentWord.korean : currentWord.english}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-6 border-t border-border bg-card/95 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 mb-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 bg-transparent rounded-full px-6 py-6 active:scale-95 transition-transform disabled:opacity-40"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-semibold">이전</span>
          </Button>

          <Button
            variant="default"
            size="lg"
            onClick={onBack}
            className="flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-6 py-6 active:scale-95 transition-transform shadow-lg"
          >
            <List className="w-5 h-5" />
            <span className="font-semibold">목록</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleNext}
            disabled={currentIndex === words.length - 1}
            className="flex items-center gap-2 bg-transparent rounded-full px-6 py-6 active:scale-95 transition-transform disabled:opacity-40"
          >
            <span className="font-semibold">다음</span>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex gap-1.5 justify-center">
          {words.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-8 bg-primary" : index < currentIndex ? "w-1.5 bg-accent" : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
