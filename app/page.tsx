"use client"

import { useState, useEffect } from "react"
import { WordListScreen } from "@/components/word-list-screen"
import { FlashcardScreen } from "@/components/flashcard-screen"
import { vocabularyAPI } from "@/lib/api/vocabulary"
import { vocabularyResponsesToWords } from "@/lib/utils"
import type { Word } from "@/types/vocabulary"

export default function Home() {
  const [currentView, setCurrentView] = useState<"list" | "flashcard">("list")
  const [selectedWordIndex, setSelectedWordIndex] = useState(0)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [currentVocabulary, setCurrentVocabulary] = useState<Word[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 초기 데이터 로딩: 사용 가능한 날짜 목록 가져오기
  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const dates = await vocabularyAPI.getAvailableDates()
        
        if (dates.length === 0) {
          setError("사용 가능한 날짜가 없습니다.")
          setIsLoading(false)
          return
        }
        
        setAvailableDates(dates)
        setSelectedDate(dates[0]) // 가장 최신 날짜를 기본으로 선택
      } catch (err) {
        console.error("Failed to fetch available dates:", err)
        setError("날짜 목록을 불러오는데 실패했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvailableDates()
  }, [])

  // 선택된 날짜가 변경될 때 해당 날짜의 단어 목록 가져오기
  useEffect(() => {
    if (!selectedDate) return

    const fetchVocabulary = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const vocabData = await vocabularyAPI.getVocabularyByDate(selectedDate)
        const words = vocabularyResponsesToWords(vocabData)
        setCurrentVocabulary(words)
      } catch (err) {
        console.error("Failed to fetch vocabulary:", err)
        setError("단어 목록을 불러오는데 실패했습니다.")
        setCurrentVocabulary([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchVocabulary()
  }, [selectedDate])

  const handleWordSelect = (index: number) => {
    setSelectedWordIndex(index)
    setCurrentView("flashcard")
  }

  const handleBackToList = () => {
    setCurrentView("list")
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
  }

  // 로딩 중이거나 에러가 있을 때
  if (isLoading && availableDates.length === 0) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </main>
    )
  }

  if (error && availableDates.length === 0) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            다시 시도
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {currentView === "list" ? (
        <WordListScreen
          words={currentVocabulary}
          onWordSelect={handleWordSelect}
          selectedDate={selectedDate}
          availableDates={availableDates}
          onDateChange={handleDateChange}
          isLoading={isLoading}
          error={error}
        />
      ) : (
        <FlashcardScreen words={currentVocabulary} initialIndex={selectedWordIndex} onBack={handleBackToList} />
      )}
    </main>
  )
}