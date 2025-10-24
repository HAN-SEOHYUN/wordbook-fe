"use client"

import Image from "next/image"
import { ChevronRight, ExternalLink } from "lucide-react"

interface Word {
  id: number
  english: string
  korean: string
}

interface WordListScreenProps {
  words: Word[]
  onWordSelect: (index: number) => void
  selectedDate: string
  availableDates: string[]
  onDateChange: (date: string) => void
  currentLink?: string
  isLoading?: boolean
  error?: string | null
}

export function WordListScreen({
  words,
  onWordSelect,
  selectedDate,
  availableDates,
  onDateChange,
  currentLink = "",
  isLoading = false,
  error = null,
}: WordListScreenProps) {
  console.log("📍 WordListScreen received currentLink:", currentLink)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, "0")}월 ${String(date.getDate()).padStart(2, "0")}일`
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground mb-1">
                <Image src="/bee.png" alt="Bee" width={32} height={32} className="object-contain" />
                Wordbook
              </h1>
              <p className="text-sm text-muted-foreground">{selectedDate ? formatDate(selectedDate) : "날짜를 선택하세요"}</p>
            </div>
            {currentLink && (
              <a
                href={currentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition-all active:scale-95 shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">원문 보기</span>
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="sticky top-[88px] z-10 bg-background/98 backdrop-blur-md border-b border-border shadow-sm">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 px-5 py-3 min-w-max">
            {availableDates.map((date) => {
              const isSelected = date === selectedDate
              return (
                <button
                  key={date}
                  onClick={() => onDateChange(date)}
                  className={`
                    relative px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 whitespace-nowrap
                    ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                        : "bg-muted/80 text-muted-foreground hover:bg-muted active:scale-95"
                    }
                  `}
                >
                  {formatDate(date).replace(/년|월/g, ".").replace("일", "")}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
            <p className="text-muted-foreground">단어 목록을 불러오는 중...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex items-center justify-center py-16 px-4">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
          </div>
        </div>
      )}

      {/* Word List */}
      {!isLoading && !error && words.length > 0 && (
        <>
          <div className="px-4 pt-6 space-y-3 max-w-2xl mx-auto">
            {words.map((word, index) => (
              <button
                key={word.id}
                onClick={() => onWordSelect(index)}
                className="w-full bg-card border border-border rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/50 active:scale-[0.98] text-left group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-lg font-bold text-foreground tracking-wide">{word.english}</h3>
                    </div>
                    <div className="h-px bg-border mb-2" />
                    <p className="text-sm text-muted-foreground leading-relaxed">{word.korean}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-8 px-6 text-center">
            <p className="text-xs text-muted-foreground">총 {words.length}개의 단어</p>
          </div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && !error && words.length === 0 && (
        <div className="flex items-center justify-center py-16 px-4">
          <div className="text-center">
            <p className="text-muted-foreground">이 날짜에는 단어가 없습니다.</p>
          </div>
        </div>
      )}
    </div>
  )
}