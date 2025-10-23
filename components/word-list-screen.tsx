"use client"

import { ChevronRight } from "lucide-react"

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
  isLoading?: boolean
  error?: string | null
}

export function WordListScreen({
  words,
  onWordSelect,
  selectedDate,
  availableDates,
  onDateChange,
  isLoading = false,
  error = null,
}: WordListScreenProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, "0")}월 ${String(date.getDate()).padStart(2, "0")}일`
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
        <div className="px-6 py-5">
          <h1 className="text-2xl font-bold text-foreground mb-1">EBS Wordbook</h1>
          <p className="text-sm text-muted-foreground">{selectedDate ? formatDate(selectedDate) : "날짜를 선택하세요"}</p>
        </div>
      </header>

      <div className="sticky top-[88px] z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 px-4 py-3 min-w-max">
            {availableDates.map((date) => {
              const isSelected = date === selectedDate
              return (
                <button
                  key={date}
                  onClick={() => onDateChange(date)}
                  className={`
                    relative px-4 py-2 rounded-t-lg font-medium text-sm transition-all duration-200
                    ${
                      isSelected
                        ? "bg-card text-primary border-t-2 border-x-2 border-primary shadow-md -mb-px"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                  style={{
                    clipPath: isSelected ? "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)" : "none",
                  }}
                >
                  <span className="whitespace-nowrap">{formatDate(date)}</span>
                  {isSelected && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-card" />}
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