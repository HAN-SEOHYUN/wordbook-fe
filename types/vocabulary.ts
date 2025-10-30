export interface VocabularyResponse {
  wb_id: number
  english_word: string
  korean_meaning: string
  date: string // YYYY-MM-DD format
  source_url?: string | null
  created_at: string
  updated_at: string
}

export interface VocabularyCreate {
  english_word: string
  korean_meaning: string
  date: string
  source_url?: string
}

export interface VocabularyUpdate {
  english_word: string
  korean_meaning: string
}

// 날짜별 단어 목록 응답 (새 구조)
export interface VocabularyListResponse {
  date: string // YYYY-MM-DD format
  source_url?: string | null // 해당 날짜의 대표 source_url
  words: VocabularyResponse[] // 단어 목록
}

// 컴포넌트에서 사용할 간소화된 타입
export interface Word {
  id: number
  english: string
  korean: string
}