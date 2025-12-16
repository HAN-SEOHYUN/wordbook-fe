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
  const [isTransitioning, setIsTransitioning] = useState(false)

  const isCompleted = currentIndex >= words.length
  const currentWord = !isCompleted ? words[currentIndex] : null
  const minSwipeDistance = 50

  useEffect(() => {
    setIsFlipped(false)
  }, [currentIndex])

  const handlePrevious = () => {
    if (currentIndex > 0) {
      if (isCompleted) {
        // 완료 화면에서 이전 버튼 누르면 마지막 단어로 돌아감
        setCurrentIndex(words.length - 1)
        return
      }

      setIsTransitioning(true)
      setIsFlipped(false)
      setCurrentIndex(currentIndex - 1)

      // 약간의 지연 후 애니메이션 복구 (화면 깜빡임 방지)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 50)
    }
  }

  const handleNext = () => {
    if (currentIndex < words.length) {
      setIsTransitioning(true)
      setIsFlipped(false)
      setCurrentIndex(currentIndex + 1)

      // 약간의 지연 후 애니메이션 복구 (화면 깜빡임 방지)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 50)
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

    if (isLeftSwipe && currentIndex < words.length) {
      handleNext()
    }
    if (isRightSwipe && currentIndex > 0) {
      handlePrevious()
    }
  }

  // 완료 화면 렌더링
  if (isCompleted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="flex items-center justify-between px-5 py-4 border-b border-border bg-card/95 backdrop-blur-md sticky top-0 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-1.5 px-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <List className="w-5 h-5" />
            <span className="text-sm font-semibold">목록</span>
          </Button>
          <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full">
            <span className="text-sm font-bold text-primary">{words.length}</span>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs font-medium text-muted-foreground">{words.length}</span>
          </div>
          <div className="w-16" /> {/* Spacer */}
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-4xl">
            🎉
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">학습 완료!</h2>
          <p className="text-muted-foreground mb-10 max-w-xs mx-auto">
            이번에 선택한 모든 단어를 확인했습니다.<br />
            다시 한 번 복습하거나 목록으로 돌아가세요.
          </p>

          <Button
            size="lg"
            onClick={onBack}
            className="w-full max-w-xs h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            목록으로 돌아가기
          </Button>

          <Button
            variant="ghost"
            onClick={() => {
              setIsTransitioning(true)
              setCurrentIndex(0)
              setTimeout(() => setIsTransitioning(false), 50)
            }}
            className="mt-4 text-muted-foreground hover:text-primary"
          >
            처음부터 다시 보기
          </Button>
        </div>

        {/* Navigation for Last Card - Only Previous button enabled */}
        <div className="px-6 py-6 border-t border-border bg-card/95 backdrop-blur-md">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              className="flex-1 flex items-center justify-center gap-2 h-14 md:h-12 rounded-2xl border-2 hover:bg-muted/50 active:scale-[0.98] transition-all text-base md:text-sm"
            >
              <ChevronLeft className="w-5 h-5 md:w-4 md:h-4" />
              <span className="font-bold">이전</span>
            </Button>

            <div className="flex-1 h-14 md:h-12" /> {/* Empty space for Next button */}
          </div>
        </div>
      </div>
    )
  }

  // Normal Flashcard View
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-border bg-card/95 backdrop-blur-md sticky top-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-1.5 px-2 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <List className="w-5 h-5" />
          <span className="text-sm font-semibold">목록</span>
        </Button>

        <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full">
          <span className="text-sm font-bold text-primary">{currentIndex + 1}</span>
          <span className="text-xs text-muted-foreground">/</span>
          <span className="text-xs font-medium text-muted-foreground">{words.length}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsKoreanFirst(!isKoreanFirst)
            setIsFlipped(false)
          }}
          className="flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>{isKoreanFirst ? "뜻→단어" : "단어→뜻"}</span>
        </Button>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-muted">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 rounded-r-full"
          style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <div className="flex-1 flex items-center justify-center p-6 mb-safe">
        <div
          className="relative w-full max-w-md aspect-[4/5] md:aspect-[3/4] max-h-[60vh] cursor-pointer perspective-1000"
          onClick={handleFlip}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className={`relative w-full h-full preserve-3d ${isTransitioning ? "duration-0" : "transition-transform duration-500"
              } ${isFlipped ? "rotate-y-180" : ""}`}
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
                  className={`inline-flex items-center gap-2 px-4 py-2 ${isKoreanFirst ? "bg-green-500/10 text-green-600" : "bg-primary/10 text-primary"
                    } text-xs font-bold rounded-full mb-8`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${isKoreanFirst ? "bg-green-500" : "bg-primary"}`} />
                  {isKoreanFirst ? "뜻" : "단어"}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-wide leading-tight px-4">
                  {isKoreanFirst ? currentWord!.korean : currentWord!.english}
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
                  className={`inline-flex items-center gap-2 px-4 py-2 ${isKoreanFirst ? "bg-primary/10 text-primary" : "bg-green-500/10 text-green-600"
                    } text-xs font-bold rounded-full mb-8`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${isKoreanFirst ? "bg-primary" : "bg-green-500"}`} />
                  {isKoreanFirst ? "단어" : "뜻"}
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground leading-relaxed px-4">
                  {isKoreanFirst ? currentWord!.english : currentWord!.korean}
                </p>
                <div className="mt-8 pt-6 border-t border-border/50">
                  <p className="text-base text-muted-foreground font-medium">
                    {isKoreanFirst ? currentWord!.korean : currentWord!.english}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-6 border-t border-border bg-card/95 backdrop-blur-md">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex-1 flex items-center justify-center gap-2 h-14 md:h-12 rounded-2xl border-2 hover:bg-muted/50 active:scale-[0.98] transition-all disabled:opacity-40 disabled:hover:bg-transparent text-base md:text-sm"
          >
            <ChevronLeft className="w-5 h-5 md:w-4 md:h-4" />
            <span className="font-bold">이전</span>
          </Button>

          <Button
            variant="default"
            size="lg"
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2 h-14 md:h-12 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md shadow-primary/20 disabled:opacity-40 disabled:shadow-none text-base md:text-sm"
          >
            <span className="font-bold">다음</span>
            <ChevronRight className="w-5 h-5 md:w-4 md:h-4" />
          </Button>
        </div>
        <div className="flex gap-1.5 justify-center">
          {words.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex ? "w-8 bg-primary" : index < currentIndex ? "w-1.5 bg-accent" : "w-1.5 bg-muted"
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
