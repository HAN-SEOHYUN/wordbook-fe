"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Trophy, Calendar, Award, TrendingUp } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { testsAPI } from "@/lib/api/tests"
import type { User, TestHistoryItem, TestAnswerDetail } from "@/types/test"

interface TestHistoryScreenProps {
  onBack: () => void
  users: User[]
}

export function TestHistoryScreen({ onBack, users }: TestHistoryScreenProps) {
  const [selectedUserId, setSelectedUserId] = useState<number>(0)
  const [expandedTestId, setExpandedTestId] = useState<number | null>(null)
  const [userTests, setUserTests] = useState<TestHistoryItem[]>([])
  const [testDetails, setTestDetails] = useState<Record<number, TestAnswerDetail[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (users.length > 0 && selectedUserId === 0) {
      setSelectedUserId(users[0].u_id)
    }
  }, [users, selectedUserId])

  useEffect(() => {
    if (selectedUserId === 0) return

    const fetchTestHistory = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await testsAPI.getTestHistory(selectedUserId)
        setUserTests(response.test_history)
      } catch (err) {
        console.error("Failed to fetch test history:", err)
        setError("Test history loading failed")
        setUserTests([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTestHistory()
  }, [selectedUserId])

  const fetchTestDetail = async (trId: number) => {
    if (testDetails[trId]) return

    try {
      const response = await testsAPI.getTestDetail(trId)
      setTestDetails((prev) => ({
        ...prev,
        [trId]: response.answers,
      }))
    } catch (err) {
      console.error("Failed to fetch test detail:", err)
    }
  }

  const handleExpandTest = (trId: number) => {
    if (expandedTestId === trId) {
      setExpandedTestId(null)
    } else {
      setExpandedTestId(trId)
      fetchTestDetail(trId)
    }
  }

  const selectedUser = users.find((u) => u.u_id === selectedUserId)

  const chartData = userTests
    .slice()
    .reverse()
    .map((test, index) => ({
      name: `${index + 1}`,
      score: test.test_score,
      date: new Date(test.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }),
    }))

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-accent"
    if (score >= 70) return "text-primary"
    return "text-muted-foreground"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-accent/10 border-accent/30"
    if (score >= 70) return "bg-primary/10 border-primary/30"
    return "bg-muted/50 border-border"
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="px-5 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-muted active:scale-95 transition-all"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Test History</h1>
              <p className="text-sm text-muted-foreground">Check test results by user</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {users.map((user) => (
              <button
                key={user.u_id}
                onClick={() => setSelectedUserId(user.u_id)}
                className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${
                  selectedUserId === user.u_id
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 active:scale-95"
                }`}
              >
                {user.username}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="px-5 pt-6 space-y-6 max-w-2xl mx-auto">
        {userTests.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-4">
              <Trophy className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              {isLoading ? "Loading..." : error ? error : "No test history yet"}
            </h3>
            {!isLoading && !error && (
              <p className="text-sm text-muted-foreground">Start {selectedUser?.username}'s first test!</p>
            )}
          </div>
        ) : (
          <>
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Score Trend</h2>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                    formatter={(value: number) => [`${value} pts`, "Score"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Total {userTests.length} test records</h2>
            </div>

            {userTests.map((test) => {
              const isExpanded = expandedTestId === test.tr_id

              return (
                <div
                  key={test.tr_id}
                  className={`bg-card border rounded-2xl overflow-hidden transition-all duration-200 ${getScoreBgColor(
                    test.test_score,
                  )}`}
                >
                  <button
                    onClick={() => handleExpandTest(test.tr_id)}
                    className="w-full p-5 text-left hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-semibold text-foreground">{test.week_name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{formatDate(test.created_at)}</p>
                        <div className="flex items-center gap-3">
                          <div className={`text-3xl font-bold ${getScoreColor(test.test_score)}`}>{test.test_score}</div>
                          <div className="text-sm text-muted-foreground">
                            {test.correct_count} / {test.total_questions} correct
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="p-3 rounded-full bg-primary/10">
                          <Trophy className={`w-6 h-6 ${getScoreColor(test.test_score)}`} />
                        </div>
                      </div>
                    </div>
                  </button>

                  {isExpanded && testDetails[test.tr_id] && (
                    <div className="border-t border-border bg-background/50 p-5 space-y-3">
                      <h4 className="text-sm font-bold text-foreground mb-3">Detailed Results</h4>
                      {testDetails[test.tr_id].map((result, index) => (
                        <div
                          key={result.ta_id}
                          className={`p-4 rounded-xl border ${
                            result.is_correct ? "bg-accent/5 border-accent/20" : "bg-destructive/5 border-destructive/20"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                result.is_correct ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"
                              }`}
                            >
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground mb-1">{result.word_meaning}</p>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Answer:</span>
                                  <span className="text-sm font-medium text-foreground">{result.word_english}</span>
                                </div>
                                {!result.is_correct && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Your answer:</span>
                                    <span className="text-sm font-medium text-destructive line-through">
                                      {result.user_answer || "(empty)"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
