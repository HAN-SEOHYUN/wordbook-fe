"use client"

import { useState, useEffect } from "react"
import { WordListScreen } from "@/components/word-list-screen"
import { FlashcardScreen } from "@/components/flashcard-screen"
import { UserSelectionScreen } from "@/components/user-selection-screen"
import { TestScreen } from "@/components/test-screen"
import { TestResultScreen } from "@/components/test-result-screen"
import { TestHistoryScreen } from "@/components/test-history-screen"
import { vocabularyAPI } from "@/lib/api/vocabulary"
import { testsAPI } from "@/lib/api/tests"
import { testWeeksAPI } from "@/lib/api/test-weeks"
import { vocabularyResponsesToWords } from "@/lib/utils"
import type { Word } from "@/types/vocabulary"
import type { TestWeekWord, TestSubmitResponse, TestAvailabilityResponse, User, TestWeek } from "@/types/test"
import { usersAPI } from "@/lib/api/users"

export default function Home() {
  const [currentView, setCurrentView] = useState<"list" | "flashcard" | "userSelection" | "test" | "result" | "history">("list")
  const [users, setUsers] = useState<User[]>([])
  const [selectedWordIndex, setSelectedWordIndex] = useState(0)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [currentVocabulary, setCurrentVocabulary] = useState<Word[]>([])
  const [currentLink, setCurrentLink] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 시험 관련 상태
  const [testTrId, setTestTrId] = useState<number>(0)
  const [testWords, setTestWords] = useState<TestWeekWord[]>([])
  const [testUserName, setTestUserName] = useState<string>("")
  const [testWeekName, setTestWeekName] = useState<string>("")
  const [testResult, setTestResult] = useState<TestSubmitResponse | null>(null)

  // 시험 가능 여부 상태
  const [testAvailability, setTestAvailability] = useState<TestAvailabilityResponse | null>(null)

  // 주차 관련 상태
  const [availableWeeks, setAvailableWeeks] = useState<TestWeek[]>([])
  const [selectedWeekId, setSelectedWeekId] = useState<number | null>(null)

  // 사용자 목록 로딩
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await usersAPI.getUsers()
        setUsers(response.users)
      } catch (err) {
        console.error("Failed to fetch users:", err)
      }
    }

    fetchUsers()
  }, [])

  // 시험 가능 여부 체크
  useEffect(() => {
    const checkTestAvailability = async () => {
      try {
        const availability = await testsAPI.getCurrentAvailability()
        setTestAvailability(availability)
      } catch (err) {
        console.error("Failed to check test availability:", err)
      }
    }

    checkTestAvailability()

    // 1분마다 시험 가능 여부 재확인
    const interval = setInterval(checkTestAvailability, 60000)

    return () => clearInterval(interval)
  }, [])

  // 주차 목록 로딩
  useEffect(() => {
    const fetchTestWeeks = async () => {
      try {
        const response = await testWeeksAPI.getTestWeeks(10, "desc")
        setAvailableWeeks(response.weeks)
      } catch (err) {
        console.error("Failed to fetch test weeks:", err)
        // 주차 목록 로딩 실패 시에도 앱은 정상 작동 (날짜 탭만 사용)
      }
    }

    fetchTestWeeks()
  }, [])

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
        // 오류 메시지에서 백엔드 오류 정보 추출
        const errorMessage = err instanceof Error ? err.message : String(err)
        if (errorMessage.includes("START_DATE")) {
          setError("백엔드 데이터베이스 오류: 'START_DATE' 컬럼을 찾을 수 없습니다. 백엔드 개발자에게 문의하세요.")
        } else {
          setError(`날짜 목록을 불러오는데 실패했습니다: ${errorMessage}`)
        }
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
        const response = await vocabularyAPI.getVocabularyByDate(selectedDate)

        // 새로운 응답 구조: { date, source_url, words }
        const words = vocabularyResponsesToWords(response.words)
        setCurrentVocabulary(words)

        // 대표 source_url 사용 (직접 추가한 단어가 있어도 원문 링크 표시됨)
        const link = response.source_url || ""
        console.log("📍 DEBUG: response:", response)
        console.log("📍 DEBUG: extracted link:", link)
        setCurrentLink(link)
      } catch (err) {
        console.error("Failed to fetch vocabulary:", err)
        setError("단어 목록을 불러오는데 실패했습니다.")
        setCurrentVocabulary([])
        setCurrentLink("")
      } finally {
        setIsLoading(false)
      }
    }

    fetchVocabulary()
  }, [selectedDate])

  // 날짜 선택 시 해당 주차 자동 하이라이트
  useEffect(() => {
    if (!selectedDate || availableWeeks.length === 0) return

    const week = findWeekByDate(selectedDate, availableWeeks)
    if (week) {
      setSelectedWeekId(week.twi_id)
    } else {
      setSelectedWeekId(null)
    }
  }, [selectedDate, availableWeeks])

  const handleStartTest = () => {
    setCurrentView("userSelection")
  }

  const handleWordSelect = (index: number) => {
    setSelectedWordIndex(index)
    setCurrentView("flashcard")
  }

  const handleBackToList = () => {
    setCurrentView("list")
  }

  const handleBackFromUserSelection = () => {
    setCurrentView("list")
  }

  const handleUserSelectionComplete = (trId: number, words: TestWeekWord[], userName: string, weekName: string) => {
    setTestTrId(trId)
    setTestWords(words)
    setTestUserName(userName)
    setTestWeekName(weekName)
    setCurrentView("test")
  }

  const handleTestComplete = (result: TestSubmitResponse) => {
    setTestResult(result)
    setCurrentView("result")
  }

  const handleBackFromTest = () => {
    setCurrentView("userSelection")
  }

  const handleBackToListFromResult = () => {
    setCurrentView("list")
    // 상태 초기화
    setTestResult(null)
    setTestTrId(0)
    setTestWords([])
    setTestUserName("")
    setTestWeekName("")
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
  }

  // 날짜-주차 매핑 유틸리티 함수
  const findWeekByDate = (date: string, weeks: TestWeek[]): TestWeek | null => {
    return weeks.find(week => 
      date >= week.start_date && date <= week.end_date
    ) || null
  }

  // 주차 선택 핸들러
  const handleWeekSelect = (week: TestWeek) => {
    setSelectedWeekId(week.twi_id)
    // 주차 내에서 가장 최근(가장 빠른) 날짜를 선택
    const weekDates = availableDates.filter(
      (date) => date >= week.start_date && date <= week.end_date
    )
    const targetDate =
      weekDates.length > 0
        ? weekDates.reduce((latest, current) => (current > latest ? current : latest))
        : week.start_date
    setSelectedDate(targetDate)
  }

  const handleWordUpdate = (updatedWords: Word[]) => {
    setCurrentVocabulary(updatedWords)
  }

  const handleViewHistory = () => {
    setCurrentView("history")
  }

  const handleBackFromHistory = () => {
    setCurrentView("list")
  }

  const handleRetestFromHistory = async (twiId: number, userId: number) => {
    try {
      console.log(`[재시험] 시작 - twi_id: ${twiId}, u_id: ${userId}`)

      // 1. 주차별 단어 목록 가져오기
      const wordsData = await testWeeksAPI.getTestWeekWords(twiId)

      // 2. 시험 시작 API 호출
      const testStartData = await testsAPI.startTest({
        u_id: userId,
        twi_id: twiId,
      })

      // 3. 선택한 사용자와 주차 정보
      const selectedUserData = users.find((u) => u.u_id === userId)

      if (!selectedUserData) {
        throw new Error("사용자 정보를 찾을 수 없습니다.")
      }

      // 주차 정보는 wordsData에 포함되어 있을 수 있음
      // 또는 별도로 조회해야 할 수 있음
      const weekName = wordsData.week_name || `주차 ${twiId}`

      // 4. TestScreen으로 이동
      setTestTrId(testStartData.tr_id)
      setTestWords(wordsData.words)
      setTestUserName(selectedUserData.username)
      setTestWeekName(weekName)
      setCurrentView("test")

      console.log(`[재시험] 성공 - tr_id: ${testStartData.tr_id}`)
    } catch (err) {
      console.error("Failed to start retest:", err)
      alert("재시험 시작에 실패했습니다. 다시 시도해주세요.")
    }
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
          currentLink={currentLink}
          isLoading={isLoading}
          error={error}
          onWordUpdate={handleWordUpdate}
          onStartTest={handleStartTest}
          testAvailability={testAvailability}
          onViewHistory={handleViewHistory}
          availableWeeks={availableWeeks}
          selectedWeekId={selectedWeekId}
          onWeekSelect={handleWeekSelect}
        />
      ) : currentView === "history" ? (
        <TestHistoryScreen onBack={handleBackFromHistory} users={users} onStartTest={handleRetestFromHistory} />
      ) : currentView === "flashcard" ? (
        <FlashcardScreen words={currentVocabulary} initialIndex={selectedWordIndex} onBack={handleBackToList} />
      ) : currentView === "userSelection" ? (
        <UserSelectionScreen onStartTest={handleUserSelectionComplete} onBack={handleBackFromUserSelection} />
      ) : currentView === "test" ? (
        <TestScreen
          trId={testTrId}
          words={testWords}
          userName={testUserName}
          weekName={testWeekName}
          onComplete={handleTestComplete}
          onBack={handleBackFromTest}
        />
      ) : currentView === "result" && testResult ? (
        <TestResultScreen
          result={testResult}
          userName={testUserName}
          weekName={testWeekName}
          onBackToList={handleBackToListFromResult}
        />
      ) : null}
    </main>
  )
}