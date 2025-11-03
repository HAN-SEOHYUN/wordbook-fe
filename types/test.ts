// ============================================================
// User Types
// ============================================================
export interface User {
  u_id: number
  username: string
  created_at: string
  updated_at: string
}

export interface UserListResponse {
  users: User[]
}

// ============================================================
// Test Week Types
// ============================================================
export interface TestWeek {
  twi_id: number
  name: string
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
  test_start_datetime: string // YYYY-MM-DD HH:MM:SS
  test_end_datetime: string // YYYY-MM-DD HH:MM:SS
  word_count: number
  created_at: string
  updated_at: string
}

export interface TestWeekListResponse {
  weeks: TestWeek[]
}

export interface TestWeekWord {
  tw_id: number
  wb_id: number
  word_english: string
  word_meaning: string
  date: string // YYYY-MM-DD
}

export interface TestWeekWordsResponse {
  twi_id: number
  week_name: string
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
  test_start_datetime: string // YYYY-MM-DD HH:MM:SS
  test_end_datetime: string // YYYY-MM-DD HH:MM:SS
  words: TestWeekWord[]
}

// ============================================================
// Test Types
// ============================================================
export interface TestStartRequest {
  u_id: number
  twi_id: number
}

export interface TestStartResponse {
  tr_id: number
  u_id: number
  twi_id: number
  test_score: number | null
  status: "created" | "retry"
  message: string
  previous_score?: number | null
  created_at: string
  updated_at: string
}

export interface AnswerItem {
  tw_id: number
  user_answer: string
}

export interface TestSubmitRequest {
  answers: AnswerItem[]
}

export interface AnswerResultItem {
  ta_id: number
  tw_id: number
  word_english: string
  word_meaning: string
  user_answer: string
  is_correct: boolean
}

export interface TestSubmitResponse {
  tr_id: number
  test_score: number
  total_questions: number
  correct_count: number
  incorrect_count: number
  results: AnswerResultItem[]
}

// ============================================================
// Test Availability Types
// ============================================================
export interface TestAvailabilityWeekInfo {
  twi_id: number
  name: string
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
  test_start_datetime: string // YYYY-MM-DD HH:MM:SS
  test_end_datetime: string // YYYY-MM-DD HH:MM:SS
}

export interface TestAvailabilityResponse {
  is_available: boolean
  test_week?: TestAvailabilityWeekInfo
  remaining_minutes?: number
  next_test_datetime?: string // YYYY-MM-DD HH:MM:SS
}

// ============================================================
// Test History Types
// ============================================================
export interface TestHistoryItem {
  tr_id: number
  u_id: number
  twi_id: number
  test_score: number
  created_at: string
  updated_at: string
  week_name: string
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
  test_date: string // YYYY-MM-DD
  total_questions: number
  correct_count: number
}

export interface TestHistoryResponse {
  user_id: number
  username: string
  test_history: TestHistoryItem[]
}

export interface TestAnswerDetail {
  ta_id: number
  tw_id: number
  word_english: string
  word_meaning: string
  user_answer: string
  is_correct: boolean
}

export interface TestDetailResponse {
  tr_id: number
  u_id: number
  username: string
  twi_id: number
  week_name: string
  test_score: number
  test_date: string
  total_questions: number
  correct_count: number
  answers: TestAnswerDetail[]
}
