"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { testsAPI } from "@/lib/api"
import type { TestWeekWord, AnswerItem, TestSubmitResponse } from "@/types/test"

interface TestScreenProps {
  trId: number
  words: TestWeekWord[]
  userName: string
  weekName: string
  onComplete: (result: TestSubmitResponse) => void
  onBack: () => void
}

export function TestScreen({ trId, words, userName, weekName, onComplete, onBack }: TestScreenProps) {
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>(
    words.reduce((acc, word) => ({ ...acc, [word.tw_id]: "" }), {})
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnswerChange = (twId: number, value: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [twId]: value,
    }))
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      const answers: AnswerItem[] = words.map((word) => ({
        tw_id: word.tw_id,
        user_answer: userAnswers[word.tw_id] || "",
      }))

      const result = await testsAPI.submitTest(trId, { answers })
      onComplete(result)
    } catch (err) {
      console.error("Failed to submit test:", err)
      setError("답안 제출에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">단어 테스트</h1>
              <p className="text-sm text-muted-foreground">
                {userName} · {weekName}
              </p>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-full transition-all active:scale-95"
            >
              나가기
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 px-5 py-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-accent/20 border border-accent rounded-2xl p-4 mb-6">
            <p className="text-sm font-semibold text-accent-foreground text-center">
              뜻을 보고 영어를 입력하세요. 제출하기 버튼을 눌러주세요.
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive rounded-2xl p-4 mb-6">
              <p className="text-sm font-semibold text-destructive text-center">{error}</p>
            </div>
          )}

          {words.map((word, index) => (
            <div key={word.tw_id} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{index + 1}</span>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">뜻</p>
                    <p className="text-lg font-bold text-foreground">{word.word_meaning}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">영어 답안</p>
                    <input
                      type="text"
                      value={userAnswers[word.tw_id]}
                      onChange={(e) => handleAnswerChange(word.tw_id, e.target.value)}
                      className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl text-base font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder="영어로 입력하세요"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 bg-card/95 backdrop-blur-md border-t border-border shadow-lg px-5 py-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-200 ${
              isSubmitting
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] shadow-lg"
            }`}
          >
            <span>{isSubmitting ? "제출 중..." : "제출하기"}</span>
            {!isSubmitting && <Check className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
