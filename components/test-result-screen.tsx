"use client"

import { Trophy, Check, X, Home } from "lucide-react"
import type { TestSubmitResponse } from "@/types/test"

interface TestResultScreenProps {
  result: TestSubmitResponse
  userName: string
  weekName: string
  onBackToList: () => void
}

export function TestResultScreen({ result, userName, weekName, onBackToList }: TestResultScreenProps) {
  const { test_score, correct_count, total_questions, results } = result

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="px-5 py-4">
          <h1 className="text-xl font-bold text-foreground">테스트 결과</h1>
          <p className="text-sm text-muted-foreground">
            {userName} · {weekName}
          </p>
        </div>
      </header>

      <div className="px-5 py-8 max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-3xl p-8 mb-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">테스트 완료!</h2>
          <p className="text-lg text-muted-foreground mb-6">{userName}님 수고하셨습니다</p>

          <div className="flex items-center justify-center gap-8 mb-4">
            <div>
              <p className="text-5xl font-bold text-primary mb-1">{test_score}점</p>
              <p className="text-sm text-muted-foreground">
                {correct_count} / {total_questions} 정답
              </p>
            </div>
          </div>

          {test_score === 100 && (
            <div className="mt-4 px-4 py-2 bg-accent/20 rounded-full inline-block">
              <p className="text-sm font-bold text-accent-foreground">🎉 완벽합니다!</p>
            </div>
          )}
        </div>

        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-bold text-foreground px-2">상세 결과</h3>
          {results.map((item, index) => (
            <div
              key={item.ta_id}
              className={`bg-card border-2 rounded-2xl p-5 ${
                item.is_correct ? "border-green-500/50 bg-green-500/5" : "border-destructive/50 bg-destructive/5"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    item.is_correct ? "bg-green-500/20" : "bg-destructive/20"
                  }`}
                >
                  {item.is_correct ? (
                    <Check className="w-6 h-6 text-green-500" strokeWidth={3} />
                  ) : (
                    <X className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      item.is_correct ? "bg-green-500/20 text-green-600" : "bg-destructive/20 text-destructive"
                    }`}>
                      {item.is_correct ? "정답" : "오답"}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">문제 {index + 1}</span>
                  </div>
                  <p className="text-base font-semibold text-foreground mb-2">{item.word_meaning}</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-12">내 답:</span>
                      <span className={`text-sm font-semibold ${
                        item.is_correct ? "text-green-600" : "text-destructive line-through"
                      }`}>
                        {item.user_answer || "(답안 없음)"}
                      </span>
                      {item.is_correct && <Check className="w-4 h-4 text-green-500" />}
                    </div>
                    {!item.is_correct && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-12">정답:</span>
                        <span className="text-sm font-semibold text-foreground">{item.word_english}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onBackToList}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg"
        >
          <Home className="w-5 h-5" />
          <span>단어장으로 돌아가기</span>
        </button>
      </div>
    </div>
  )
}
