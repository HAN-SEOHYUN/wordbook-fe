"use client"

import { useState, useEffect } from "react"
import { User, ChevronRight, ChevronDown } from "lucide-react"
import { usersAPI, testWeeksAPI, testsAPI } from "@/lib/api"
import type { User as UserType, TestWeek, TestWeekWord } from "@/types/test"

interface UserSelectionScreenProps {
  onStartTest: (trId: number, words: any[], userName: string, weekName: string) => void
  onBack: () => void
}

export function UserSelectionScreen({ onStartTest, onBack }: UserSelectionScreenProps) {
  const [users, setUsers] = useState<UserType[]>([])
  const [testWeeks, setTestWeeks] = useState<TestWeek[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [selectedWeekId, setSelectedWeekId] = useState<number | null>(null)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isWeekDropdownOpen, setIsWeekDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 데이터 로딩
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [usersData, weeksData] = await Promise.all([
          usersAPI.getAllUsers(),
          testWeeksAPI.getTestWeeks(10, 'desc')
        ])

        setUsers(usersData.users)
        setTestWeeks(weeksData.weeks)
      } catch (err) {
        console.error("Failed to fetch data:", err)
        setError("데이터를 불러오는데 실패했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleStart = async () => {
    if (!selectedUserId || !selectedWeekId) return

    try {
      setIsStarting(true)
      setError(null)

      // 1. 주차별 단어 목록 가져오기
      const wordsData = await testWeeksAPI.getTestWeekWords(selectedWeekId)

      // 2. 시험 시작 API 호출
      const testStartData = await testsAPI.startTest({
        u_id: selectedUserId,
        twi_id: selectedWeekId,
      })

      // 3. 선택한 사용자와 주차 정보
      const selectedUserData = users.find((u) => u.u_id === selectedUserId)
      const selectedWeekData = testWeeks.find((w) => w.twi_id === selectedWeekId)

      if (!selectedUserData || !selectedWeekData) {
        throw new Error("사용자 또는 주차 정보를 찾을 수 없습니다.")
      }

      // 4. TestScreen으로 이동
      onStartTest(
        testStartData.tr_id,
        wordsData.words,
        selectedUserData.username,
        selectedWeekData.name
      )
    } catch (err) {
      console.error("Failed to start test:", err)
      setError("테스트 시작에 실패했습니다. 다시 시도해주세요.")
      setIsStarting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  const selectedUser = users.find((u) => u.u_id === selectedUserId)
  const selectedWeek = testWeeks.find((w) => w.twi_id === selectedWeekId)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="px-5 py-4">
          <button
            onClick={onBack}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            ← 돌아가기
          </button>
        </div>
      </header>

      <div className="px-5 py-8 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">시험 볼 사람을 선택해주세요</h1>
          <p className="text-base text-muted-foreground">테스트 결과는 선택한 사용자에게 저장됩니다</p>
        </div>

        <div className="space-y-6 mb-8">
          {/* 사용자 선택 */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">사용자 선택</label>
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-border bg-card hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  {selectedUser ? (
                    <span className="text-base font-semibold text-foreground">{selectedUser.username}</span>
                  ) : (
                    <span className="text-base text-muted-foreground">사용자를 선택하세요</span>
                  )}
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform ${isUserDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border-2 border-border rounded-2xl shadow-lg overflow-hidden z-20">
                  {users.map((user) => (
                    <button
                      key={user.u_id}
                      onClick={() => {
                        setSelectedUserId(user.u_id)
                        setIsUserDropdownOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 p-4 hover:bg-primary/5 transition-colors ${
                        selectedUserId === user.u_id ? "bg-primary/10" : ""
                      }`}
                    >
                      <span className="text-base font-semibold text-foreground">{user.username}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 시험 주차 선택 */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">시험 주차 선택</label>
            <div className="relative">
              <button
                onClick={() => setIsWeekDropdownOpen(!isWeekDropdownOpen)}
                className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-border bg-card hover:border-primary/30 transition-all"
              >
                <div className="flex flex-col items-start">
                  {selectedWeek ? (
                    <>
                      <span className="text-base font-semibold text-foreground">{selectedWeek.name}</span>
                      <span className="text-sm text-muted-foreground mt-1">
                        {selectedWeek.word_count}개 단어
                      </span>
                    </>
                  ) : (
                    <span className="text-base text-muted-foreground">주차를 선택하세요</span>
                  )}
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform ${isWeekDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isWeekDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border-2 border-border rounded-2xl shadow-lg overflow-hidden z-20">
                  {testWeeks.map((week) => (
                    <button
                      key={week.twi_id}
                      onClick={() => {
                        setSelectedWeekId(week.twi_id)
                        setIsWeekDropdownOpen(false)
                      }}
                      className={`w-full flex flex-col items-start p-4 hover:bg-primary/5 transition-colors ${
                        selectedWeekId === week.twi_id ? "bg-primary/10" : ""
                      }`}
                    >
                      <span className="text-base font-semibold text-foreground">{week.name}</span>
                      <span className="text-sm text-muted-foreground mt-1">
                        {week.word_count}개 단어
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 테스트 시작하기 버튼 */}
        <button
          onClick={handleStart}
          disabled={!selectedUserId || !selectedWeekId || isStarting}
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-200 ${
            selectedUserId && selectedWeekId && !isStarting
              ? "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] shadow-lg"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          <span>{isStarting ? "시작 중..." : "테스트 시작하기"}</span>
          {!isStarting && <ChevronRight className="w-6 h-6" />}
        </button>
      </div>
    </div>
  )
}
