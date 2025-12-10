"use client"

import { useState, useEffect, useRef, MouseEvent } from "react"
import Image from "next/image"
import {
  History,
  Eye,
  EyeOff,
  ExternalLink,
  Trophy,
  X,
  Check,
  Pencil,
  Volume2,
  ChevronRight,
  ChevronLeft,
  Plus,
} from "lucide-react"
import { vocabularyAPI } from "@/lib/api/vocabulary"
import type { Word } from "@/types/vocabulary"
import type { TestAvailabilityResponse, TestWeek } from "@/types/test"

const PALETTE = ["#2D464A", "#E86A55", "#8B2C79"]

interface WordListScreenProps {
  words: Word[]
  onWordSelect: (index: number) => void
  selectedDate: string
  availableDates: string[]
  onDateChange: (date: string) => void
  currentLink?: string
  isLoading?: boolean
  error?: string | null
  onWordUpdate?: (words: Word[]) => void
  onStartTest: () => void
  testAvailability?: TestAvailabilityResponse | null
  onViewHistory: () => void
  availableWeeks: TestWeek[]
  selectedWeekId: number | null
  onWeekSelect: (week: TestWeek) => void
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
  onWordUpdate,
  onStartTest,
  testAvailability,
  onViewHistory,
  availableWeeks,
  selectedWeekId,
  onWeekSelect,
}: WordListScreenProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editEnglish, setEditEnglish] = useState("")
  const [editKorean, setEditKorean] = useState("")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newEnglish, setNewEnglish] = useState("")
  const [newKorean, setNewKorean] = useState("")
  const [isTestMode, setIsTestMode] = useState(false)

  // 시험 시간이면 자동으로 isTestMode = true
  useEffect(() => {
    if (testAvailability?.is_available) {
      setIsTestMode(true)
    } else {
      setIsTestMode(false)
    }
  }, [testAvailability])

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleStartTestClick = () => {
    showToast("🚧 단어 테스트 기능은 더 멋진 모습으로 찾아뵙기 위해 준비 중이에요! 조금만 기다려주세요.", "info")
    // onStartTest() // 기능 준비 완료 시 주석 해제
  }

  const speakEnglish = async (text: string, e: MouseEvent) => {
    e.stopPropagation()

    try {
      // edge-tts API를 통한 음성 재생
      const apiUrl = `http://localhost:8000/api/v1/tts/speak?text=${encodeURIComponent(text)}`

      const audio = new Audio(apiUrl)
      await audio.play()
    } catch (error) {
      console.error("TTS playback error:", error)
      showToast("음성 재생에 실패했습니다", "error")
    }
  }

  const startEdit = (word: Word, e: MouseEvent) => {
    e.stopPropagation()
    setEditingId(word.id)
    setEditEnglish(word.english)
    setEditKorean(word.korean)
  }

  const cancelEdit = (e: MouseEvent) => {
    e.stopPropagation()
    setEditingId(null)
    setEditEnglish("")
    setEditKorean("")
  }

  const saveEdit = async (e: MouseEvent) => {
    e.stopPropagation()

    if (!editEnglish.trim() || !editKorean.trim()) {
      showToast("영어와 한국어를 모두 입력해주세요", "error")
      return
    }

    try {
      await vocabularyAPI.updateVocabulary(editingId!, {
        english_word: editEnglish,
        korean_meaning: editKorean,
      })

      const updatedWords = words.map((w) =>
        w.id === editingId ? { ...w, english: editEnglish, korean: editKorean } : w
      )
      onWordUpdate?.(updatedWords)

      showToast("단어가 성공적으로 수정되었습니다", "success")
      setEditingId(null)
      setEditEnglish("")
      setEditKorean("")
    } catch (error) {
      console.error("Failed to update word:", error)
      showToast("단어 수정에 실패했습니다", "error")
    }
  }

  const startAddNew = () => {
    setIsAddingNew(true)
    setNewEnglish("")
    setNewKorean("")
  }

  const cancelAddNew = () => {
    setIsAddingNew(false)
    setNewEnglish("")
    setNewKorean("")
  }

  const saveNewWord = async () => {
    if (!newEnglish.trim() || !newKorean.trim()) {
      showToast("영어와 한국어를 모두 입력해주세요", "error")
      return
    }

    try {
      const response = await vocabularyAPI.createVocabulary({
        english_word: newEnglish,
        korean_meaning: newKorean,
        date: selectedDate,
        source_url: currentLink || undefined,
      })

      const newWord: Word = {
        id: response.wb_id,
        english: response.english_word,
        korean: response.korean_meaning,
      }

      const updatedWords = [...words, newWord]
      onWordUpdate?.(updatedWords)

      showToast("단어가 성공적으로 추가되었습니다", "success")
      setIsAddingNew(false)
      setNewEnglish("")
      setNewKorean("")
    } catch (error) {
      console.error("Failed to create word:", error)
      showToast("단어 추가에 실패했습니다", "error")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, "0")}월 ${String(date.getDate()).padStart(2, "0")}일`
  }

  const getWeekInfoForDate = (date: string) => {
    const weekIndex = availableWeeks.findIndex(
      (week) => date >= week.start_date && date <= week.end_date
    )
    if (weekIndex === -1) return null
    return {
      week: availableWeeks[weekIndex],
      index: weekIndex,
      color: PALETTE[weekIndex % PALETTE.length],
    }
  }

  // 현재 선택된 날짜의 주차 정보
  const selectedDateWeekInfo = getWeekInfoForDate(selectedDate)

  // 날짜 리스트 스크롤 관련 상태 및 핸들러
  const dateListRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  const checkScrollButtons = () => {
    if (dateListRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = dateListRef.current
      setShowLeftArrow(scrollLeft > 0)
      // 오차 범위를 1px 정도 두어 정확성 보정
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 1)
    }
  }

  const scrollDateList = (direction: "left" | "right") => {
    if (dateListRef.current) {
      const scrollAmount = 200
      dateListRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  // 초기 로드, 날짜 변경, 화면 크기 변경 시 스크롤 버튼 상태 체크
  useEffect(() => {
    checkScrollButtons()
    window.addEventListener("resize", checkScrollButtons)
    return () => window.removeEventListener("resize", checkScrollButtons)
  }, [availableDates])

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
        <div className="px-6 py-5">
          <div className="flex flex-col gap-3 mb-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-shrink-0">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground mb-1 whitespace-nowrap">
                <Image src="/bee.png" alt="Bee" width={32} height={32} className="object-contain" />
                Wordbook
              </h1>
              <p className="text-sm text-muted-foreground">{selectedDate ? formatDate(selectedDate) : "날짜를 선택하세요"}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:justify-end">
              <button
                onClick={onViewHistory}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-muted text-muted-foreground hover:bg-muted/80 rounded-full transition-all active:scale-95 shadow-sm"
              >
                <History className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">기록</span>
              </button>
              <button
                onClick={() => setIsTestMode(!isTestMode)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full transition-all active:scale-95 shadow-sm ${isTestMode
                  ? "bg-accent text-accent-foreground hover:bg-accent/90"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
              >
                {isTestMode ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span className="whitespace-nowrap">단어 보기</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span className="whitespace-nowrap">시험 시작</span>
                  </>
                )}
              </button>
              {!isTestMode && (currentLink || isLoading) && (
                isLoading ? (
                  <div className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-muted-foreground/40 bg-muted/20 rounded-full shadow-sm select-none">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="whitespace-nowrap">원문 보기</span>
                  </div>
                ) : (
                  <a
                    href={currentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition-all active:scale-95 shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="whitespace-nowrap">원문 보기</span>
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Test Mode Alert Banner */}
      {isTestMode && (
        <div className="sticky top-[88px] z-10 bg-yellow-500/10 border-b border-yellow-500/30 backdrop-blur-md">
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-semibold text-yellow-900">🚀 지금은 시험시간입니다.</p>
                <p className="text-xs text-yellow-700">단어의 뜻이 가려져 있습니다. 준비가 되면 아래 버튼을 눌러 테스트를 시작하세요.</p>
              </div>
            </div>
            <button
              onClick={() => setIsTestMode(false)}
              className="text-yellow-600 hover:text-yellow-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {!isTestMode && (
        <>
          {/* 주차 선택 영역 */}
          {/* 주차 선택 영역 */}
          <div className="sticky top-[88px] z-10 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex px-4 min-w-max">
                {availableWeeks
                  .filter((week) => {
                    // 해당 주차 범위 내에 단어가 있는 날짜가 있는지 확인
                    return availableDates.some(
                      (date) => date >= week.start_date && date <= week.end_date
                    )
                  })
                  .map((week, index) => {
                    const isSelected = selectedWeekId === week.twi_id
                    const color = PALETTE[index % PALETTE.length]

                    return (
                      <button
                        key={week.twi_id}
                        onClick={() => onWeekSelect(week)}
                        style={{
                          color: isSelected ? color : undefined,
                          borderColor: isSelected ? color : "transparent",
                        }}
                        className={`
                          relative px-6 py-3.5 font-bold text-sm transition-all duration-200 whitespace-nowrap border-b-2 outline-none
                          ${isSelected
                            ? "" // 색상은 style로 직접 제어
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                          }
                        `}
                      >
                        {week.name}
                      </button>
                    )
                  })}
              </div>
            </div>
          </div>

          {/* 날짜 선택 영역 */}
          <div className="sticky top-[138px] z-10 bg-background/98 backdrop-blur-md border-b border-border shadow-sm">
            <div className="relative group">
              {/* 왼쪽 화살표 버튼 (PC 전용) */}
              {availableDates.length > 0 && showLeftArrow && (
                <button
                  onClick={() => scrollDateList("left")}
                  className="flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-background/90 backdrop-blur-xl shadow-lg shadow-primary/10 rounded-full border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground hover:scale-110 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 group"
                  aria-label="이전 날짜 보기"
                >
                  <ChevronLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-0.5" />
                </button>
              )}

              {/* 오른쪽 화살표 버튼 (PC 전용) */}
              {availableDates.length > 0 && showRightArrow && (
                <button
                  onClick={() => scrollDateList("right")}
                  className="flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-background/90 backdrop-blur-xl shadow-lg shadow-primary/10 rounded-full border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground hover:scale-110 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 group"
                  aria-label="다음 날짜 보기"
                >
                  <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              )}

              <div
                ref={dateListRef}
                onScroll={checkScrollButtons}
                className="overflow-x-auto scrollbar-hide scroll-smooth"
              >
                <div className="flex gap-2 px-5 py-3 min-w-max">
                  {availableDates.map((date) => {
                    const isSelected = date === selectedDate
                    const weekInfo = getWeekInfoForDate(date)
                    const isInSelectedWeek = selectedDateWeekInfo && weekInfo && selectedDateWeekInfo.week.twi_id === weekInfo.week.twi_id

                    // 동적 스타일 생성
                    const color = weekInfo?.color
                    let dynamicStyle: React.CSSProperties = {}
                    let className = "relative px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 whitespace-nowrap border-2 "

                    if (isSelected && color) {
                      // 1. 선택된 날짜: 배경색 채움 + 흰색 글씨
                      dynamicStyle = { backgroundColor: color, borderColor: color, color: "#ffffff" }
                      className += "shadow-md scale-105"
                    } else if (isInSelectedWeek && color) {
                      // 2. 같은 주차 날짜: 테두리 + 글씨 색상 (배경 흰색)
                      dynamicStyle = { borderColor: color, color: color }
                      className += "bg-card hover:bg-accent/10"
                    } else {
                      // 3. 비활성 날짜: 회색 처리
                      className += "border-transparent text-muted-foreground hover:bg-muted active:scale-95"
                    }

                    return (
                      <button
                        key={date}
                        onClick={() => onDateChange(date)}
                        style={dynamicStyle}
                        className={className}
                      >
                        {formatDate(date).replace(/년|월/g, ".").replace("일", "")}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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
          {/* Challenge Test Button - Only shown when test is available */}
          {isTestMode && (
            <div className="px-5 pt-6 pb-2 max-w-2xl mx-auto">
              <button
                onClick={handleStartTestClick}
                className="relative w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-400 text-white rounded-3xl p-8 hover:from-yellow-500 hover:via-amber-600 hover:to-orange-500 active:scale-[0.97] transition-all duration-300 overflow-hidden group"
              >
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                {/* Content */}
                <div className="relative flex items-center justify-center gap-4">
                  <Trophy className="w-10 h-10 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg" />
                  <p className="font-black text-2xl tracking-tight drop-shadow-lg">도전! 단어 테스트</p>
                </div>
              </button>
            </div>
          )}

          <div className="px-5 pt-6 space-y-4 max-w-2xl mx-auto">
            {isTestMode ? (
              // 시험 모드: 스켈레톤만 표시 (클릭 불가)
              words.map((_, index) => (
                <div key={index} className="w-full bg-card border border-border rounded-2xl p-6 shadow-sm animate-pulse">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-7 h-7 rounded-full bg-muted" />
                        <div className="h-6 bg-muted rounded-lg w-32" />
                      </div>
                      <div className="h-px bg-gradient-to-r from-border to-transparent mb-3" />
                      <div className="pl-10">
                        <div className="h-5 bg-muted rounded-lg w-48" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                      <div className="w-9 h-9 rounded-lg bg-muted" />
                      <div className="w-9 h-9 rounded-lg bg-muted" />
                      <div className="w-6 h-6 rounded bg-muted" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // 일반 모드: 실제 단어 카드 표시 (클릭 가능)
              words.map((word, index) => {
                const isEditing = editingId === word.id

                return (
                  <div
                    key={word.id}
                    className="w-full bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-primary/30"
                  >
                    {isEditing ? (
                      <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="text-sm font-semibold text-muted-foreground">수정 중</span>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5 pl-1">영어</label>
                            <input
                              type="text"
                              value={editEnglish}
                              onChange={(e) => setEditEnglish(e.target.value)}
                              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-base font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                              placeholder="영어 단어 또는 구문"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5 pl-1">한국어</label>
                            <input
                              type="text"
                              value={editKorean}
                              onChange={(e) => setEditKorean(e.target.value)}
                              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-base text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                              placeholder="한국어 뜻"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={saveEdit}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm"
                          >
                            <Check className="w-4 h-4" />
                            저장
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-muted text-muted-foreground rounded-xl font-semibold text-sm hover:bg-muted/80 active:scale-[0.98] transition-all"
                          >
                            <X className="w-4 h-4" />
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full group">
                        <div className="flex items-start justify-between gap-4">
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => onWordSelect(index)}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                {index + 1}
                              </span>
                              <h3 className="text-xl font-bold text-foreground tracking-wide leading-tight">
                                {word.english}
                              </h3>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                            <button
                              onClick={(e) => speakEnglish(word.english, e)}
                              className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all active:scale-95"
                              aria-label="발음 듣기"
                              title="영어 발음 듣기"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => startEdit(word, e)}
                              className="p-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-95"
                              aria-label="수정"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <ChevronRight
                              className="w-6 h-6 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all cursor-pointer"
                              onClick={() => onWordSelect(index)}
                            />
                          </div>
                        </div>
                        <div className="h-px bg-gradient-to-r from-border to-transparent mt-2 mb-3" />
                        <p
                          className="text-base text-muted-foreground leading-relaxed pl-10 break-words cursor-pointer"
                          onClick={() => onWordSelect(index)}
                        >
                          {word.korean}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Add New Word Section - Hidden in test mode */}
          {!isTestMode && (
            <div className="px-5 mt-6 max-w-2xl mx-auto">
              {isAddingNew ? (
                <div className="w-full bg-card border-2 border-primary/30 rounded-2xl p-6 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Plus className="w-5 h-5 text-primary" />
                      <span className="text-sm font-semibold text-primary">새 단어 추가</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5 pl-1">영어</label>
                        <input
                          type="text"
                          value={newEnglish}
                          onChange={(e) => setNewEnglish(e.target.value)}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-base font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                          placeholder="영어 단어 또는 구문"
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5 pl-1">한국어</label>
                        <input
                          type="text"
                          value={newKorean}
                          onChange={(e) => setNewKorean(e.target.value)}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-base text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                          placeholder="한국어 뜻"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={saveNewWord}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        추가
                      </button>
                      <button
                        onClick={cancelAddNew}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-muted text-muted-foreground rounded-xl font-semibold text-sm hover:bg-muted/80 active:scale-[0.98] transition-all"
                      >
                        <X className="w-4 h-4" />
                        취소
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={startAddNew}
                  className="w-full bg-primary/5 border-2 border-dashed border-primary/30 rounded-2xl p-5 hover:bg-primary/10 hover:border-primary/50 active:scale-[0.98] transition-all group"
                >
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-sm">새 단어 추가</span>
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-8 px-6 text-center">
            <p className="text-xs text-muted-foreground">총 {words.length}개의 단어</p>
          </div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && !error && words.length === 0 && (
        <>
          <div className="flex items-center justify-center py-16 px-4">
            <div className="text-center">
              <p className="text-muted-foreground">이 날짜에는 단어가 없습니다.</p>
            </div>
          </div>

          {/* Add New Word Section for Empty State */}
          <div className="px-5 max-w-2xl mx-auto">
            {isAddingNew ? (
              <div className="w-full bg-card border-2 border-primary/30 rounded-2xl p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Plus className="w-5 h-5 text-primary" />
                    <span className="text-sm font-semibold text-primary">새 단어 추가</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5 pl-1">영어</label>
                      <input
                        type="text"
                        value={newEnglish}
                        onChange={(e) => setNewEnglish(e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-base font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        placeholder="영어 단어 또는 구문"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5 pl-1">한국어</label>
                      <input
                        type="text"
                        value={newKorean}
                        onChange={(e) => setNewKorean(e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-base text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        placeholder="한국어 뜻"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={saveNewWord}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      추가
                    </button>
                    <button
                      onClick={cancelAddNew}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-muted text-muted-foreground rounded-xl font-semibold text-sm hover:bg-muted/80 active:scale-[0.98] transition-all"
                    >
                      <X className="w-4 h-4" />
                      취소
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={startAddNew}
                className="w-full bg-primary/5 border-2 border-dashed border-primary/30 rounded-2xl p-5 hover:bg-primary/10 hover:border-primary/50 active:scale-[0.98] transition-all group"
              >
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm">새 단어 추가</span>
                </div>
              </button>
            )}
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div
            className={`px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border ${toast.type === "success"
              ? "bg-accent/95 border-accent text-accent-foreground"
              : toast.type === "error"
                ? "bg-destructive/95 border-destructive text-destructive-foreground"
                : "bg-blue-500/95 border-blue-500 text-white" // info type
              }`}
          >
            <p className="font-semibold text-sm">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}